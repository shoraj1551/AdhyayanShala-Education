import prisma from '../lib/prisma';

export const getCourseAnalytics = async (courseId: string, instructorId: string) => {
    // Verify instructor owns this course
    const course = await prisma.course.findFirst({
        where: { id: courseId, instructorId },
        include: {
            enrollments: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            },
            modules: {
                include: {
                    lessons: {
                        select: {
                            id: true,
                            title: true,
                            duration: true,
                            order: true
                        }
                    }
                }
            }
        }
    });

    if (!course) {
        throw new Error('Course not found or unauthorized');
    }

    const totalEnrollments = course.enrollments.length;
    const totalRevenue = totalEnrollments * (course.discountedPrice || course.price);

    // Calculate total lessons
    const allLessons = course.modules.flatMap(m => m.lessons);
    const totalLessons = allLessons.length;

    // Get lesson progress for all enrolled students
    const lessonProgress = await prisma.lessonProgress.findMany({
        where: {
            lesson: {
                module: {
                    courseId: courseId
                }
            }
        },
        include: {
            user: {
                select: { id: true, name: true, email: true }
            },
            lesson: {
                select: { id: true, title: true, duration: true }
            }
        }
    });

    // Calculate completion stats
    const studentProgress = new Map<string, {
        userId: string;
        userName: string;
        userEmail: string;
        completedLessons: number;
        totalWatchTime: number;
    }>();

    lessonProgress.forEach(progress => {
        if (!studentProgress.has(progress.userId)) {
            studentProgress.set(progress.userId, {
                userId: progress.userId,
                userName: progress.user.name || 'Unknown',
                userEmail: progress.user.email,
                completedLessons: 0,
                totalWatchTime: 0
            });
        }

        const student = studentProgress.get(progress.userId)!;
        if (progress.completedAt) {
            student.completedLessons++;
            student.totalWatchTime += progress.lesson.duration || 0;
        }
    });

    // Calculate completion categories
    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;

    const studentsWithProgress = Array.from(studentProgress.values()).map(student => {
        const progressPercentage = totalLessons > 0
            ? Math.round((student.completedLessons / totalLessons) * 100)
            : 0;

        if (progressPercentage === 100) completedCount++;
        else if (progressPercentage > 0) inProgressCount++;

        return {
            ...student,
            progressPercentage
        };
    });

    // Students who enrolled but never started
    notStartedCount = totalEnrollments - studentProgress.size;

    // Calculate total and average watch time
    const totalWatchTime = Array.from(studentProgress.values())
        .reduce((sum, student) => sum + student.totalWatchTime, 0);
    const avgWatchTime = totalEnrollments > 0 ? Math.round(totalWatchTime / totalEnrollments) : 0;

    // Most popular lessons (most completed)
    const lessonCompletionCount = new Map<string, { title: string; count: number; duration: number }>();

    lessonProgress.forEach(progress => {
        if (progress.completedAt) {
            const lessonId = progress.lessonId;
            if (!lessonCompletionCount.has(lessonId)) {
                lessonCompletionCount.set(lessonId, {
                    title: progress.lesson.title,
                    count: 0,
                    duration: progress.lesson.duration || 0
                });
            }
            lessonCompletionCount.get(lessonId)!.count++;
        }
    });

    const topLessons = Array.from(lessonCompletionCount.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    // Completion rate
    const completionRate = totalEnrollments > 0
        ? Math.round((completedCount / totalEnrollments) * 100)
        : 0;

    return {
        overview: {
            totalEnrollments,
            totalRevenue,
            completionRate,
            averageRating: 0, // TODO: Implement when reviews are added
            totalLessons
        },
        completionFunnel: {
            completed: completedCount,
            inProgress: inProgressCount,
            notStarted: notStartedCount
        },
        watchTime: {
            total: totalWatchTime,
            average: avgWatchTime
        },
        students: studentsWithProgress.sort((a, b) => b.progressPercentage - a.progressPercentage),
        topLessons,
        courseInfo: {
            title: course.title,
            type: course.type,
            price: course.discountedPrice || course.price,
            isPublished: course.isPublished
        }
    };
};
