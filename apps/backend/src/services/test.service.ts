import prisma from '../lib/prisma';
import { Test, Question, Option, QuestionType, Prisma } from '@prisma/client';
import { NotFoundError } from '../lib/errors';

interface OptionDTO {
    text: string;
    imageUrl?: string;
    isCorrect: boolean;
}

interface CreateTestDTO {
    title: string;
    courseId: string;
    moduleId?: string;
    duration?: number;
    order?: number;
    instructions?: string;
    totalMarks?: number;
    passMarks?: number;
    isPublished?: boolean;
    availableAt?: Date | string;
    expiresAt?: Date | string;
}

interface UpdateTestDTO {
    title?: string;
    duration?: number;
    order?: number;
    instructions?: string;
    totalMarks?: number;
    passMarks?: number;
    isPublished?: boolean;
    availableAt?: Date | string;
    expiresAt?: Date | string;
}

interface CreateQuestionDTO {
    text: string;
    type?: QuestionType;
    explanation?: string;
    imageUrl?: string;
    points?: number;
    negativeMarks?: number;
    order?: number;
    options: OptionDTO[];
    textSolution?: string;
    audioSolutionUrl?: string;
}

interface UpdateQuestionDTO {
    text?: string;
    type?: QuestionType;
    explanation?: string;
    imageUrl?: string;
    points?: number;
    negativeMarks?: number;
    order?: number;
    options?: OptionDTO[];
    textSolution?: string;
    audioSolutionUrl?: string;
}

export const getTestById = async (testId: string) => {
    const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
            questions: {
                include: {
                    options: true,
                    solution: true
                },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (test && test.availableAt && new Date() < new Date(test.availableAt)) {
        throw new Error("This test is not available yet.");
    }

    if (test && test.expiresAt && new Date() > new Date(test.expiresAt)) {
        throw new Error("This test has expired.");
    }

    return test;
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

export const createTest = async (data: CreateTestDTO) => {
    return await prisma.test.create({
        data
    });
};

export const updateTest = async (testId: string, data: UpdateTestDTO) => {
    return await prisma.test.update({
        where: { id: testId },
        data
    });
};

export const createQuestion = async (testId: string, data: CreateQuestionDTO) => {
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

export const updateQuestion = async (questionId: string, data: UpdateQuestionDTO) => {
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
            data: options.map((o: OptionDTO) => ({ ...o, questionId }))
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

export const startAttempt = async (userId: string, testId: string) => {
    // Check if there is an existing in-progress attempt to resume
    const existing = await prisma.attempt.findFirst({
        where: { userId, testId, status: "IN_PROGRESS" }
    });
    if (existing) return existing;

    return await prisma.attempt.create({
        data: {
            userId,
            testId,
            score: 0,
            status: "IN_PROGRESS",
            responses: {}
        }
    });
};

export const syncAttempt = async (attemptId: string, responses: Prisma.InputJsonValue) => {
    return await prisma.attempt.update({
        where: { id: attemptId },
        data: { responses }
    });
};

export const submitTest = async (userId: string, testId: string, attemptId: string, answers: { questionId: string, optionId: string, timeSpent?: number }[]) => {
    const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
            questions: {
                include: { options: true }
            }
        }
    });

    if (!test) throw new NotFoundError("Test");

    let score = 0;
    const testTotalMarks = test.totalMarks || 0;
    const testPassMarks = test.passMarks || 0;

    const totalPoints = testTotalMarks > 0 ? testTotalMarks : test.questions.reduce((sum, q) => sum + q.points, 0);
    const passMarks = testPassMarks || (totalPoints * 0.7);
    const reflections = [];
    const finalResponses: Record<string, { optionId: string; status: string; timeSpent: number }> = {};

    for (const q of test.questions) {
        const userAnswer = answers.find(a => a.questionId === q.id);
        const correctOption = q.options.find(o => o.isCorrect);

        const isCorrect = userAnswer?.optionId === correctOption?.id;

        if (userAnswer?.optionId) {
            if (isCorrect) {
                score += q.points;
            } else {
                score -= (q.negativeMarks || 0); // Apply penalty
            }
        }

        if (userAnswer) {
            finalResponses[q.id] = {
                optionId: userAnswer.optionId,
                status: "ANSWERED",
                timeSpent: userAnswer.timeSpent || 0
            };
        }

        reflections.push({
            questionId: q.id,
            isCorrect,
            correctOptionId: correctOption?.id,
            explanation: q.explanation
        });
    }

    const attempt = await prisma.attempt.update({
        where: { id: attemptId },
        data: {
            score,
            passed: score >= passMarks,
            completedAt: new Date(),
            status: "SUBMITTED",
            responses: finalResponses
        }
    });

    // Calculate Rank
    const studentsAbove = await prisma.attempt.count({
        where: {
            testId,
            status: "SUBMITTED",
            score: { gt: score }
        }
    });

    const totalParticipants = await prisma.attempt.count({
        where: {
            testId,
            status: "SUBMITTED"
        }
    });

    return {
        attempt,
        totalPoints,
        reflections,
        rank: studentsAbove + 1,
        totalParticipants
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
                select: { name: true, avatar: true }
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
