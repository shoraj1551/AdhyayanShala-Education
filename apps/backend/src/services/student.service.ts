
import prisma from '../lib/prisma';

export const getDashboardStats = async (userId: string) => {
    const enrolledCoursesCount = await prisma.enrollment.count({
        where: { userId }
    });

    const completedLessonsCount = await prisma.lessonProgress.count({
        where: { userId }
    });

    // Calculate Average Score
    const attempts = await prisma.attempt.findMany({
        where: { userId },
        select: { score: true }
    });
    const averageScore = attempts.length > 0
        ? Math.round(attempts.reduce((acc, curr) => acc + curr.score, 0) / attempts.length)
        : 0;

    // Recent Activity (Lessons + Tests)
    const recentLessons = await prisma.lessonProgress.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' },
        take: 5,
        include: { lesson: true }
    });

    const recentTests = await prisma.attempt.findMany({
        where: { userId },
        orderBy: { completedAt: 'desc' }, // Note: completedAt might be null if ongoing, filter?
        take: 5,
        include: { test: true }
    });

    // Merge and Sort
    const activity = [
        ...recentLessons.map(l => ({
            type: 'LESSON',
            title: l.lesson.title,
            date: l.completedAt,
            score: null
        })),
        ...recentTests.filter(t => t.completedAt).map(t => ({
            type: 'TEST',
            title: t.test.title,
            date: t.completedAt!,
            score: t.score
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return {
        enrolledCourses: enrolledCoursesCount,
        completedLessons: completedLessonsCount, // This could be Hours if we had durations
        averageScore,
        recentActivity: activity
    };
};
