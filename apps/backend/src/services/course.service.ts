import prisma from '../lib/prisma';
import { CourseLevel } from '@prisma/client';

export const listCourses = async (search?: string) => {
    const where: any = { isPublished: true };

    if (search) {
        where.OR = [
            { title: { contains: search } },
            { description: { contains: search } }
        ];
    }

    return await prisma.course.findMany({
        where,
        include: {
            instructor: {
                select: { name: true, email: true }
            },
            _count: {
                select: { modules: true, tests: true }
            }
        }
    });
};

export const getCourseById = async (courseId: string) => {
    return await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            instructor: {
                select: { name: true }
            },
            modules: {
                orderBy: { order: 'asc' },
                include: {
                    lessons: true
                }
            },
            tests: true
        }
    });
};

export const createCourse = async (data: any) => {
    return await prisma.course.create({
        data
    });
};

export const listInstructorCourses = async (instructorId: string) => {
    return await prisma.course.findMany({
        where: { instructorId },
        include: {
            _count: {
                select: { modules: true, tests: true, enrollments: true }
            }
        }
    });
};

export const addModule = async (courseId: string, title: string) => {
    // Get max order
    const lastModule = await prisma.module.findFirst({
        where: { courseId },
        orderBy: { order: 'desc' }
    });
    const order = lastModule ? lastModule.order + 1 : 1;

    return await prisma.module.create({
        data: {
            courseId,
            title,
            order
        }
    });
};

export const addLesson = async (moduleId: string, data: { title: string, type: 'VIDEO' | 'TEXT', content: string }) => {
    const lastLesson = await prisma.lesson.findFirst({
        where: { moduleId },
        orderBy: { order: 'desc' }
    });
    const order = lastLesson ? lastLesson.order + 1 : 1;

    return await prisma.lesson.create({
        data: {
            moduleId,
            title: data.title,
            type: data.type,
            content: data.content,
            order
        }
    });
};

export const deleteModule = async (id: string) => {
    // Delete lessons first (cascade usually handles this but good to be explicit or rely on schema)
    // Prisma schema doesn't show onDelete: Cascade for Lesson->Module. I should add it or delete manually.
    // Let's delete lessons manually to be safe if cascade isn't set.
    await prisma.lesson.deleteMany({ where: { moduleId: id } });
    return await prisma.module.delete({ where: { id } });
};

export const deleteLesson = async (id: string) => {
    return await prisma.lesson.delete({ where: { id } });
};

export const updateModule = async (id: string, title: string) => {
    return await prisma.module.update({
        where: { id },
        data: { title }
    });
};

export const updateLesson = async (id: string, data: { title?: string, content?: string, type?: string }) => {
    return await prisma.lesson.update({
        where: { id },
        data
    });
};

export const enrollUserInCourse = async (userId: string, courseId: string) => {
    // Check if valid course
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new Error("Course not found");

    // Check existing enrollment
    const existing = await prisma.enrollment.findFirst({
        where: { userId, courseId }
    });
    if (existing) return existing;

    return await prisma.enrollment.create({
        data: {
            userId,
            courseId
        }
    });
}

export const checkEnrollment = async (userId: string, courseId: string) => {
    const enrollment = await prisma.enrollment.findFirst({
        where: { userId, courseId }
    });
    return !!enrollment;
}
