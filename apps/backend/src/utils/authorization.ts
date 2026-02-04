import prisma from '../lib/prisma';
import { NotFoundError, UnauthorizedError } from '../lib/errors';

/**
 * Check if a user can modify a course
 * @param courseId - The course ID
 * @param userId - The user ID
 * @returns true if user is course instructor or admin
 */
export const canModifyCourse = async (
    courseId: string,
    userId: string
): Promise<boolean> => {
    const [course, user] = await Promise.all([
        prisma.course.findUnique({ where: { id: courseId } }),
        prisma.user.findUnique({ where: { id: userId } }),
    ]);

    if (!course) throw new NotFoundError('Course');
    if (!user) throw new UnauthorizedError();

    return course.instructorId === userId || user.role === 'ADMIN';
};

/**
 * Check if a user can modify a module
 * @param moduleId - The module ID
 * @param userId - The user ID
 * @returns true if user is course instructor or admin
 */
export const canModifyModule = async (
    moduleId: string,
    userId: string
): Promise<boolean> => {
    const module = await prisma.module.findUnique({
        where: { id: moduleId },
        include: { course: true },
    });

    if (!module) throw new NotFoundError('Module');

    return canModifyCourse(module.courseId, userId);
};

/**
 * Check if a user can modify a lesson
 * @param lessonId - The lesson ID
 * @param userId - The user ID
 * @returns true if user is course instructor or admin
 */
export const canModifyLesson = async (
    lessonId: string,
    userId: string
): Promise<boolean> => {
    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
            module: {
                include: { course: true },
            },
        },
    });

    if (!lesson) throw new NotFoundError('Lesson');

    return canModifyCourse(lesson.module.courseId, userId);
};

/**
 * Check if a user is an admin
 * @param userId - The user ID
 * @returns true if user has ADMIN role
 */
export const isAdmin = async (userId: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user?.role === 'ADMIN';
};

/**
 * Check if a user is an instructor
 * @param userId - The user ID
 * @returns true if user has INSTRUCTOR role
 */
export const isInstructor = async (userId: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user?.role === 'INSTRUCTOR';
};

/**
 * Require user to be course owner or admin, throws error if not
 * @param courseId - The course ID
 * @param userId - The user ID
 */
export const requireCourseAccess = async (
    courseId: string,
    userId: string
): Promise<void> => {
    const hasAccess = await canModifyCourse(courseId, userId);
    if (!hasAccess) {
        throw new UnauthorizedError('You do not have permission to modify this course');
    }
};

/**
 * Require user to be module owner or admin, throws error if not
 * @param moduleId - The module ID
 * @param userId - The user ID
 */
export const requireModuleAccess = async (
    moduleId: string,
    userId: string
): Promise<void> => {
    const hasAccess = await canModifyModule(moduleId, userId);
    if (!hasAccess) {
        throw new UnauthorizedError('You do not have permission to modify this module');
    }
};
