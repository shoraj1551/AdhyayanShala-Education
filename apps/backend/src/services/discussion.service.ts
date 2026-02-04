import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLessonComments = async (lessonId: string) => {
    return await prisma.lessonComment.findMany({
        where: {
            lessonId,
            parentId: null // Get top-level questions
        },
        include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
            replies: {
                include: {
                    user: { select: { id: true, name: true, avatar: true, role: true } }
                },
                orderBy: { createdAt: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const addComment = async (userId: string, lessonId: string, content: string, parentId?: string) => {
    return await prisma.lessonComment.create({
        data: {
            content,
            userId,
            lessonId,
            parentId
        },
        include: {
            user: { select: { id: true, name: true, avatar: true, role: true } }
        }
    });
};
