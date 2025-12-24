import prisma from '../lib/prisma';

export const getTestById = async (testId: string) => {
    return await prisma.test.findUnique({
        where: { id: testId },
        include: {
            questions: {
                include: {
                    options: {
                        select: { id: true, text: true } // Hide isCorrect
                    }
                }
            }
        }
    });
};

export const submitTest = async (userId: string, testId: string, answers: { questionId: string; optionId: string }[]) => {
    // 1. Fetch full test with correct answers
    const test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
            questions: {
                include: {
                    options: true
                }
            }
        }
    });

    if (!test) throw new Error('Test not found');

    // 2. Calculate Score
    let score = 0;
    let totalPoints = 0;
    const reflections: any[] = [];

    test.questions.forEach((q) => {
        totalPoints += q.points;
        const userAnswer = answers.find(a => a.questionId === q.id);

        // Find correct option
        const correctOption = q.options.find(o => o.isCorrect);

        const isCorrect = userAnswer?.optionId === correctOption?.id;

        if (isCorrect) {
            score += q.points;
        }

        reflections.push({
            questionId: q.id,
            isCorrect,
            explanation: q.explanation,
            correctOptionId: correctOption?.id
        });
    });

    // 3. Save Attempt
    const attempt = await prisma.attempt.create({
        data: {
            userId,
            testId,
            score,
            passed: score >= (totalPoints * 0.7), // 70% passing
            completedAt: new Date()
        }
    });

    return {
        attempt,
        totalPoints,
        reflections
    };
};
