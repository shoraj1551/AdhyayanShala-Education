import prisma from '../lib/prisma';
import { CourseLevel } from '@prisma/client';

export const listCourses = async () => {
    return await prisma.course.findMany({
        where: { isPublished: true },
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
