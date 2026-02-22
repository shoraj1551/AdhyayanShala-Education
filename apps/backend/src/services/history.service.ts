import prisma from '../lib/prisma';

export const getUserAttempts = async (userId: string) => {
    // 1. Fetch Test Attempts
    const attempts = await prisma.attempt.findMany({
        where: { userId },
        include: {
            test: {
                select: { title: true, courseId: true }
            }
        },
        orderBy: { completedAt: 'desc' }
    });

    // 2. Fetch Enrollments with 100% progress
    const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
            course: {
                include: {
                    modules: {
                        include: {
                            lessons: true
                        }
                    }
                }
            }
        }
    });

    const completions = await Promise.all(enrollments.map(async (enrollment) => {
        const totalLessons = enrollment.course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
        if (totalLessons === 0) return null;

        const completedCount = await prisma.lessonProgress.count({
            where: {
                userId,
                lesson: { moduleId: { in: enrollment.course.modules.map(m => m.id) } }
            }
        });

        if (completedCount === totalLessons) {
            // Find the date of last lesson completed
            const lastLesson = await prisma.lessonProgress.findFirst({
                where: {
                    userId,
                    lesson: { moduleId: { in: enrollment.course.modules.map(m => m.id) } }
                },
                orderBy: { completedAt: 'desc' },
                select: { completedAt: true }
            });

            return {
                id: `completion-${enrollment.id}`,
                type: 'COURSE_COMPLETION',
                title: enrollment.course.title,
                courseId: enrollment.course.id,
                date: lastLesson?.completedAt || enrollment.enrolledAt,
                passed: true,
                score: 100
            };
        }
        return null;
    }));

    // 3. Merge and return
    const unifiedHistory = [
        ...attempts.map(a => ({
            id: a.id,
            type: 'TEST_ATTEMPT',
            title: a.test.title,
            courseId: a.test.courseId,
            date: a.completedAt,
            passed: a.passed,
            score: a.score,
            testId: a.testId
        })),
        ...completions.filter(c => c !== null) as any[]
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return unifiedHistory;
};
