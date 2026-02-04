import prisma from '../lib/prisma';
import * as CourseService from './course.service';

export const getAllCourses = async (page: number = 1, limit: number = 20, search?: string, status?: string) => {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (status) {
        if (status === 'PUBLISHED') where.isPublished = true;
        if (status === 'DRAFT') where.isPublished = false;
    }

    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            where,
            skip,
            take: limit,
            include: {
                instructor: {
                    select: { id: true, name: true, email: true }
                },
                _count: {
                    select: {
                        enrollments: true,
                        modules: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.course.count({ where })
    ]);

    return {
        courses,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};


export const updateCourseStatus = async (courseId: string, isPublished: boolean, userId?: string) => {
    if (isPublished) {
        // Publish
        // Admin overrides are handled inside publishCourse if userId passed
        return await CourseService.publishCourse(courseId, userId);
    } else {
        // Unpublish
        if (userId) {
            return await CourseService.unpublishCourseWithOTP(courseId, userId);
        } else {
            // Fallback (unsafe? or just force unpublish?)
            // If called without userId, we can't check admin role.
            // But Controller SHOULD pass userId.
            // For now, if no userId, do direct update (legacy behavior)
            return prisma.course.update({
                where: { id: courseId },
                data: { isPublished: false }
            });
        }
    }
};

export const deleteCourse = async (courseId: string, userId: string) => {
    return await CourseService.deleteCourseWithOTP(courseId, userId);
};
