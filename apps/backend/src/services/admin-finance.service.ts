import prisma from '../lib/prisma';

export const getTransactions = async (page: number = 1, limit: number = 20, search?: string) => {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
        where.OR = [
            { providerPaymentId: { contains: search } },
            { providerOrderId: { contains: search } },
            { user: { email: { contains: search, mode: 'insensitive' } } }
        ];
    }

    const [transactions, total] = await Promise.all([
        prisma.payment.findMany({
            where,
            skip,
            take: limit,
            include: {
                user: { select: { name: true, email: true } },
                course: { select: { title: true } }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.payment.count({ where })
    ]);

    const totalRevenue = await prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
    });

    return {
        transactions,
        total,
        totalRevenue: totalRevenue._sum.amount || 0,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

export const refundTransaction = async (transactionId: string) => {
    // In real world, call Razorpay Refund API here.
    // For now, just mark DB as refunded.

    return prisma.payment.update({
        where: { id: transactionId },
        data: { status: 'REFUNDED' }
    });
};
