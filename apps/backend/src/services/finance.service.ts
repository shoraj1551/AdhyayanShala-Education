import prisma from '../lib/prisma';

export const getInstructorFinance = async (instructorId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: instructorId },
        select: { walletBalance: true, totalEarnings: true, bankDetails: true }
    });

    if (!user) {
        return {
            walletBalance: 0,
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

    return { ...user, payouts, earnings };
};

export const updateBankDetails = async (instructorId: string, details: any) => {
    return prisma.user.update({
        where: { id: instructorId },
        data: { bankDetails: JSON.stringify(details) }
    });
};

export const requestPayout = async (instructorId: string) => {
    const user = await prisma.user.findUnique({ where: { id: instructorId } });
    if (!user || user.walletBalance <= 0) {
        throw new Error("Insufficient balance");
    }

    // Check for pending requests
    const pending = await prisma.payout.findFirst({
        where: { instructorId, status: 'REQUESTED' }
    });
    if (pending) throw new Error("A payout request is already pending.");

    const amount = user.walletBalance;

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

        await tx.user.update({
            where: { id: instructorId },
            data: { walletBalance: 0 } // Move all to pending
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
    const where: any = {};
    if (status) where.status = status;

    return prisma.payout.findMany({
        where,
        include: { instructor: { select: { name: true, email: true, bankDetails: true } } },
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

            await tx.user.update({
                where: { id: payout.instructorId },
                data: { walletBalance: { increment: payout.amount } }
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
        prisma.user.update({
            where: { id: instructorId },
            data: {
                walletBalance: { increment: share },
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
