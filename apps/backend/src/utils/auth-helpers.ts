import prisma from '../lib/prisma';
import { NotFoundError, UnauthorizedError } from '../lib/errors';

/**
 * Verifies if a user has instructor-level access to a course (is the instructor or an ADMIN).
 * Throws NotFoundError if course doesn't exist.
 * Throws UnauthorizedError if access is denied.
 */
export const verifyCourseOwnership = async (courseId: string, userId: string) => {
    const [course, user] = await Promise.all([
        prisma.course.findUnique({ where: { id: courseId }, select: { instructorId: true } }),
        prisma.user.findUnique({ where: { id: userId }, select: { role: true, deleteOtp: true, deleteOtpExpires: true } })
    ]);

    if (!course) {
        throw new NotFoundError("Course");
    }

    if (course.instructorId !== userId && user?.role !== 'ADMIN') {
        throw new UnauthorizedError();
    }

    return { course, user };
};

/**
 * Verifies if a user has access to a module via its parent course.
 */
export const verifyModuleOwnership = async (moduleId: string, userId: string) => {
    const module = await prisma.module.findUnique({
        where: { id: moduleId },
        select: { courseId: true }
    });

    if (!module) {
        throw new NotFoundError("Module");
    }

    return verifyCourseOwnership(module.courseId, userId);
};

/**
 * Verifies if a user has access to a lesson via its parent system.
 */
export const verifyLessonOwnership = async (lessonId: string, userId: string) => {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { module: { select: { courseId: true } } }
    });

    if (!lesson) {
        throw new NotFoundError("Lesson");
    }

    return verifyCourseOwnership(lesson.module.courseId, userId);
};

/**
 * Verifies if a user has access to a test via its parent course.
 */
export const verifyTestOwnership = async (testId: string, userId: string) => {
    const test = await prisma.test.findUnique({
        where: { id: testId },
        select: { courseId: true }
    });

    if (!test) {
        throw new NotFoundError("Test");
    }

    return verifyCourseOwnership(test.courseId, userId);
};
