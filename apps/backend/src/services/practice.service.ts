
import prisma from '../lib/prisma';
import { NotFoundError } from '../lib/errors';

export const listPracticeQuestions = async (category?: string, type?: 'PYQ' | 'TEST') => {
    return await prisma.question.findMany({
        where: {
            isPractice: true,
            ...(category && { category }),
            ...(type === 'PYQ' && { category: 'PYQ' }) // Logic depends on how PYQs are tagged
        },
        include: {
            options: true,
            solution: true,
            _count: {
                select: { comments: true }
            }
        },
        orderBy: { order: 'asc' }
    });
};

export const getQuestionWithSolution = async (questionId: string) => {
    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
            options: true,
            solution: true,
            comments: {
                include: {
                    user: {
                        select: { name: true, avatar: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!question) throw new NotFoundError('Question');
    return question;
};

export const addQuestionComment = async (userId: string, questionId: string, text: string) => {
    return await prisma.questionComment.create({
        data: {
            userId,
            questionId,
            text
        },
        include: {
            user: {
                select: { name: true, avatar: true }
            }
        }
    });
};

export const updateQuestionSolution = async (questionId: string, data: { text?: string, audioUrl?: string }) => {
    return await prisma.questionSolution.upsert({
        where: { questionId },
        update: data,
        create: {
            ...data,
            questionId
        }
    });
};
