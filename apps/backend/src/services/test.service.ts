import prisma from '../lib/prisma';
import { Test, Question, Option } from '@prisma/client';

export const getTestById = async (testId: string) => {
    return await prisma.test.findUnique({
        where: { id: testId },
        include: {
            questions: {
                include: {
                    options: true
                }
            }
        }
    });
};

export const listTests = async () => {
    return await prisma.test.findMany({
        include: {
            _count: {
                select: { questions: true }
            },
            course: {
                select: { title: true }
            }
        }
    });
};

export const createTest = async (data: any) => {
    return await prisma.test.create({
        data
    });
};

export const updateTest = async (testId: string, data: any) => {
    return await prisma.test.update({
        where: { id: testId },
        data
    });
};

export const createQuestion = async (testId: string, data: any) => {
    // Expects data to include options
    const { options, ...questionData } = data;
    return await prisma.question.create({
        data: {
            ...questionData,
            testId,
            options: {
                create: options
            }
        },
        include: { options: true }
    });
};

export const updateQuestion = async (questionId: string, data: any) => {
    const { options, ...questionData } = data;

    // Update basic question info
    await prisma.question.update({
        where: { id: questionId },
        data: questionData
    });

    // If options are provided, this is complex (update/create/delete).
    // For MVP/Beta simplicity, we might just delete all and recreate, 
    // BUT checking for existing IDs is better.
    // Let's go with: if options provided, replace all options (simplest robust approach for now).
    if (options) {
        await prisma.option.deleteMany({ where: { questionId } });
        await prisma.option.createMany({
            data: options.map((o: any) => ({ ...o, questionId }))
        });
    }

    return await prisma.question.findUnique({
        where: { id: questionId },
        include: { options: true }
    });
};

export const deleteQuestion = async (questionId: string) => {
    return await prisma.question.delete({
        where: { id: questionId }
    });
};

export const submitTest = async (userId: string, testId: string, answers: { questionId: string, optionId: string }[]) => {
    const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
            questions: {
                include: { options: true }
            }
        }
    });

    if (!test) throw new Error("Test not found");

    let score = 0;
    const totalPoints = test.questions.reduce((sum, q) => sum + q.points, 0);
    const reflections = [];

    for (const q of test.questions) {
        const userAnswer = answers.find(a => a.questionId === q.id);
        const correctOption = q.options.find(o => o.isCorrect);

        const isCorrect = userAnswer?.optionId === correctOption?.id;
        if (isCorrect) {
            score += q.points;
        }

        reflections.push({
            questionId: q.id,
            isCorrect,
            correctOptionId: correctOption?.id,
            explanation: q.explanation
        });
    }

    const attempt = await prisma.attempt.create({
        data: {
            userId,
            testId,
            score,
            passed: score >= (totalPoints * 0.7),
            completedAt: new Date(),
        }
    });

    return {
        attempt,
        totalPoints,
        reflections
    };
};

export const getLeaderboard = async (testId: string) => {
    // Get top 10 attempts for this test, ordered by score DESC, then time taken (not tracked distinctively yet, using startedAt/completedAt diff would be better but let's stick to score for MVP)
    // Actually, distinct by user? Usually leaderboards show top score per user.
    // GroupBy is tricky in Prisma for "top score per user" with includes. 
    // We will fetch all attempts, sort in JS or simple findMany for now.

    const attempts = await prisma.attempt.findMany({
        where: { testId },
        orderBy: { score: 'desc' },
        take: 20,
        include: {
            user: {
                select: { name: true, avatar: true, email: true }
            }
        }
    });

    // Deduplicate by userId (keep highest score)
    const uniqueAttempts = new Map();
    for (const att of attempts) {
        if (!uniqueAttempts.has(att.userId)) {
            uniqueAttempts.set(att.userId, att);
        }
    }

    return Array.from(uniqueAttempts.values()).slice(0, 10); // Top 10 unique users
};
