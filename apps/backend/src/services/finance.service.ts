import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import Logger from '../lib/logger';

interface BankDetailsDTO {
    type: 'UPI' | 'BANK';
    value: string;
    accountName?: string;
    ifsc?: string;
}

export const getInstructorFinance = async (instructorId: string) => {
    const wallet = await prisma.wallet.findUnique({
        where: { userId: instructorId }
    });

    if (!wallet) {
        return {
            balance: 0,
            totalEarnings: 0,
            bankDetails: null,
            payouts: [],
            earnings: []
        };
    }

    const payouts = await prisma.payout.findMany({
        where: { instructorId },
        orderBy: { requestedAt: 'desc' }
    });

    const earnings = await prisma.earningsLedger.findMany({
        where: { instructorId },
        orderBy: { createdAt: 'desc' },
        take: 50 // Recent history
    });

    return { ...wallet, payouts, earnings };
};

/**
 * Auto-heal: Credits missing earnings for successful enrollments.
 * Should be called from admin endpoints or scheduled jobs ONLY — NOT on every page load.
 */
export const healMissingEarnings = async (instructorId: string) => {
    Logger.info(`[Finance] Starting auto-heal check for Instructor: ${instructorId}`);
    const enrollments = await prisma.enrollment.findMany({
        where: { course: { instructorId } },
        include: { course: true }
    });
    Logger.debug(`[Finance] Found ${enrollments.length} enrollments`);

    const existingEarnings = await prisma.earningsLedger.findMany({
        where: { instructorId, type: 'COURSE_SALE' },
        select: { courseId: true }
    });
    Logger.debug(`[Finance] Found ${existingEarnings.length} existing earnings records`);

    // Map counts per course
    const earningsCounts: Record<string, number> = {};
    for (const e of existingEarnings) {
        if (e.courseId) earningsCounts[e.courseId] = (earningsCounts[e.courseId] || 0) + 1;
    }

    const enrollmentCounts: Record<string, number> = {};
    for (const en of enrollments) {
        enrollmentCounts[en.courseId] = (enrollmentCounts[en.courseId] || 0) + 1;
    }

    // Identify and fix missing earnings
    let creditCount = 0;
    for (const courseId in enrollmentCounts) {
        const missing = enrollmentCounts[courseId] - (earningsCounts[courseId] || 0);
        Logger.debug(`[Finance] Course ${courseId}: ${enrollmentCounts[courseId]} enrolls, ${earningsCounts[courseId] || 0} earnings. Missing: ${missing}`);
        if (missing > 0) {
            const course = enrollments.find(e => e.courseId === courseId)?.course;
            if (course && (course.price > 0 || (course.discountedPrice || 0) > 0)) {
                const amount = course.discountedPrice || course.price;
                Logger.info(`[Finance] Crediting ${missing} sales for course "${course.title}" at amount ₹${amount}`);
                for (let i = 0; i < missing; i++) {
                    await recordCourseSale(instructorId, courseId, amount);
                    creditCount++;
                }
            }
        }
    }
    Logger.info(`[Finance] Auto-heal complete. Credited ${creditCount} records.`);
    return { credited: creditCount };
};



export const updateBankDetails = async (instructorId: string, details: BankDetailsDTO) => {
    return prisma.wallet.upsert({
        where: { userId: instructorId },
        update: { bankDetails: JSON.stringify(details) },
        create: {
            userId: instructorId,
            bankDetails: JSON.stringify(details)
        }
    });
};


export const requestPayout = async (instructorId: string) => {
    const wallet = await prisma.wallet.findUnique({ where: { userId: instructorId } });
    if (!wallet || wallet.balance <= 0) {
        throw new Error("Insufficient balance");
    }

    // Check for pending requests
    const pending = await prisma.payout.findFirst({
        where: { instructorId, status: 'REQUESTED' }
    });
    if (pending) throw new Error("A payout request is already pending.");

    const amount = wallet.balance;


    // Create Payout Request
    // Note: We do NOT deduct balance yet, or we DO?
    // Standard practice: Deduct on approval OR Deduct immediately and refund if rejected.
    // Let's deduct on APPROVED to align with "Wallet" safety, OR deduct now to prevent double spend.
    // Let's deduct NOW to "lock" the funds.

    return prisma.$transaction(async (tx) => {
        const payout = await tx.payout.create({
            data: {
                instructorId,
                amount,
                status: 'REQUESTED'
            }
        });

        await tx.wallet.update({
            where: { userId: instructorId },
            data: { balance: 0 } // Move all to pending
        });


        await tx.earningsLedger.create({
            data: {
                instructorId,
                amount: -amount,
                type: 'WITHDRAWAL_REQUEST',
                description: `Payout Request ${payout.id}`
            }
        });

        return payout;
    });
};

export const getAdminPayouts = async (status?: string) => {
    const where: Prisma.PayoutWhereInput = {};
    if (status) where.status = status;

    return prisma.payout.findMany({
        where,
        include: {
            instructor: {
                select: {
                    name: true,
                    email: true,
                    wallet: { select: { bankDetails: true } }
                }
            }
        },
        orderBy: { requestedAt: 'desc' }
    });

};

export const processPayout = async (payoutId: string, transactionRef: string, action: 'APPROVE' | 'REJECT') => {
    return prisma.$transaction(async (tx) => {
        const payout = await tx.payout.findUnique({ where: { id: payoutId } });
        if (!payout) throw new Error("Payout not found");
        if (payout.status !== 'REQUESTED') throw new Error("Payout already processed");

        if (action === 'APPROVE') {
            await tx.payout.update({
                where: { id: payoutId },
                data: { status: 'PROCESSED', transactionRef, processedAt: new Date() }
            });
            // Money already deducted.
        } else {
            // Reject: Refund money
            await tx.payout.update({
                where: { id: payoutId },
                data: { status: 'REJECTED', processedAt: new Date() }
            });

            await tx.wallet.update({
                where: { userId: payout.instructorId },
                data: { balance: { increment: payout.amount } }
            });


            await tx.earningsLedger.create({
                data: {
                    instructorId: payout.instructorId,
                    amount: payout.amount,
                    type: 'REFUND',
                    description: `Payout Rejected: ${payout.id}`
                }
            });
        }
    });
};

// Internal use: Record earning from sale
export const recordCourseSale = async (instructorId: string, courseId: string, amount: number) => {
    // Instructor share, e.g., 70%
    const share = amount * 0.70;

    await prisma.$transaction([
        prisma.wallet.update({
            where: { userId: instructorId },
            data: {
                balance: { increment: share },
                totalEarnings: { increment: share }
            }
        }),

        prisma.earningsLedger.create({
            data: {
                instructorId,
                courseId,
                amount: share,
                type: 'COURSE_SALE',
                description: 'Course Enrollment Revenue'
            }
        })
    ]);
};
