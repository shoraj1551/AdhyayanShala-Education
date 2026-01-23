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
