import prisma from '../lib/prisma';

export const getUserAttempts = async (userId: string) => {
    return await prisma.attempt.findMany({
        where: { userId },
        include: {
            test: {
                select: { title: true, courseId: true }
            }
        },
        orderBy: { completedAt: 'desc' }
    });
};
