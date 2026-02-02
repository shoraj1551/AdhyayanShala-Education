
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addReview = async (courseId: string, userId: string, rating: number, comment?: string) => {
    return prisma.review.create({
        data: {

            rating,
            comment,
            userId,
            courseId
        },
        include: {
            user: {
                select: {
                    name: true,
                    avatar: true
                }
            }
        }
    });
};

export const getReviews = async (courseId: string) => {
    return prisma.review.findMany({
        where: { courseId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    name: true,
                    avatar: true
                }
            }
        }
    });
};

export const getCourseRating = async (courseId: string) => {
    const aggregations = await prisma.review.aggregate({
        where: { courseId },
        _avg: {
            rating: true
        },
        _count: {
            rating: true
        }
    });
    return {
        average: aggregations._avg.rating || 0,
        count: aggregations._count.rating || 0
    };
};
