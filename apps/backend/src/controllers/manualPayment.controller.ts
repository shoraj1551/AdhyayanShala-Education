
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../lib/errors';

export const submitPaymentProof = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { courseId, transactionId, proofUrl, amount } = req.body;

        if (!userId) throw new UnauthorizedError();
        if (!courseId || !amount) throw new BadRequestError("Course ID and Amount are required");

        const payment = await prisma.payment.create({
            data: {
                userId,
                courseId,
                amount: parseFloat(amount),
                status: 'PENDING',
                provider: 'MANUAL',
                proofUrl,
                transactionId,
            }
        });

        res.status(201).json({
            message: "Payment proof submitted successfully. Please wait for admin verification.",
            data: payment
        });
    } catch (error) {
        next(error);
    }
};

export const getPendingPayments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (req.user?.role !== 'ADMIN') throw new UnauthorizedError("Admin access required");

        const payments = await prisma.payment.findMany({
            where: {
                status: 'PENDING',
                provider: 'MANUAL'
            },
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ data: payments });
    } catch (error) {
        next(error);
    }
};

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const adminId = req.user?.id;
        if (req.user?.role !== 'ADMIN') throw new UnauthorizedError("Admin access required");

        const { paymentId } = req.params;
        const { status, adminNote } = req.body; // SUCCESS or FAILED

        if (!['SUCCESS', 'FAILED'].includes(status)) {
            throw new BadRequestError("Invalid status. Use SUCCESS or FAILED");
        }

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { user: true, course: true }
        });

        if (!payment) throw new NotFoundError("Payment");
        if (payment.status !== 'PENDING') throw new BadRequestError("Payment already processed");

        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status,
                adminNote,
                verifiedBy: adminId
            }
        });

        // If success, auto-enroll the student
        if (status === 'SUCCESS') {
            await prisma.enrollment.upsert({
                where: {
                    userId_courseId: {
                        userId: payment.userId,
                        courseId: payment.courseId
                    }
                },
                update: {},
                create: {
                    userId: payment.userId,
                    courseId: payment.courseId
                }
            });

            // Send notification to student
            await prisma.notification.create({
                data: {
                    userId: payment.userId,
                    title: "Enrollment Confirmed",
                    message: `Congratulations! Your payment for "${payment.course.title}" has been verified. You are now enrolled.`
                }
            });
        } else {
            // Notify student of rejection
            await prisma.notification.create({
                data: {
                    userId: payment.userId,
                    title: "Payment Verification Failed",
                    message: `Your payment verification for "${payment.course.title}" was rejected. Note: ${adminNote || 'Contact support.'}`
                }
            });
        }

        res.json({
            message: `Payment ${status === 'SUCCESS' ? 'verified' : 'rejected'} successfully`,
            data: updatedPayment
        });
    } catch (error) {
        next(error);
    }
};
