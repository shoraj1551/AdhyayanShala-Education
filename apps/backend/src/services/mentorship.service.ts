
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { NotFoundError, UnauthorizedError, BadRequestError } from '../lib/errors';

export const getInstructorSlots = async (instructorId: string) => {
    return await prisma.mentorshipSlot.findMany({
        where: { instructorId, isActive: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });
};

export const updateInstructorSlots = async (instructorId: string, slots: Array<{ dayOfWeek: number, startTime: string, endTime: string }>) => {
    return await prisma.$transaction(async (tx) => {
        // Deactivate old slots
        await tx.mentorshipSlot.updateMany({
            where: { instructorId },
            data: { isActive: false }
        });

        // Create new ones
        const creations = slots.map(slot => tx.mentorshipSlot.create({
            data: {
                instructorId,
                ...slot,
                isActive: true
            }
        }));

        return await Promise.all(creations);
    });
};

export const getAvailableInstructors = async (expertise?: string) => {
    const where: Prisma.UserWhereInput = {
        role: 'INSTRUCTOR'
    };

    if (expertise) {
        where.instructorProfile = {
            expertise: { contains: expertise, mode: 'insensitive' }
        };
    }

    return await prisma.user.findMany({
        where,
        include: {
            instructorProfile: true,
            mentorshipSlots: {
                where: { isActive: true }
            }
        }
    });
};



export const getInstructorByIdWithSlots = async (instructorId: string) => {
    const instructor = await prisma.user.findUnique({
        where: { id: instructorId },
        include: {
            instructorProfile: true,
            mentorshipSlots: {
                where: { isActive: true }
            }
        }
    });


    if (!instructor) throw new NotFoundError("Instructor");

    return {
        instructor,
        slots: instructor.mentorshipSlots
    };
};

export const bookSlot = async (studentId: string, data: {
    instructorId: string,
    date: string,
    startTime: string,
    duration: number,
    context?: string,
    questions?: string
}) => {
    // Check for overlap or existing booking at that exact time (basic check)
    const existing = await prisma.mentorshipBooking.findFirst({
        where: {
            instructorId: data.instructorId,
            date: new Date(data.date),
            startTime: data.startTime,
            status: 'CONFIRMED'
        }
    });

    if (existing) throw new BadRequestError("This slot is already booked");

    return await prisma.mentorshipBooking.create({
        data: {
            studentId,
            instructorId: data.instructorId,
            date: new Date(data.date),
            startTime: data.startTime,
            duration: data.duration,
            context: data.context,
            questions: data.questions,
            status: 'CONFIRMED'
        }
    });
};

export const getStudentBookings = async (studentId: string) => {
    return await prisma.mentorshipBooking.findMany({
        where: { studentId },
        include: {
            instructor: {
                include: { instructorProfile: true }
            }
        },

        orderBy: { date: 'desc' }
    });
};

export const getInstructorBookings = async (instructorId: string) => {
    return await prisma.mentorshipBooking.findMany({
        where: { instructorId },
        include: {
            student: {
                select: { name: true, avatar: true }
            }
        },
        orderBy: { date: 'desc' }
    });
};

export const updateMentorshipFee = async (instructorId: string, fee: number) => {
    return await prisma.instructorProfile.update({
        where: { userId: instructorId },
        data: { mentorshipFee: fee }
    });
};


export const getPublicInstructorProfile = async (instructorId: string) => {
    const instructor = await prisma.user.findUnique({
        where: { id: instructorId },
        select: {
            id: true,
            name: true,
            avatar: true,
            createdAt: true,
            instructorProfile: {
                select: {
                    bio: true,
                    expertise: true,
                    experience: true,
                    linkedin: true,
                    mentorshipFee: true,
                }
            },
            courses: {
                where: { isPublished: true },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    level: true,
                    type: true,
                    price: true,
                    discountedPrice: true,
                    thumbnailUrl: true,
                    isFree: true,
                    _count: { select: { enrollments: true } },
                    reviews: {
                        select: { rating: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            mentorshipSlots: {
                where: { isActive: true },
                orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
            },
            _count: {
                select: {
                    mentorshipsGiven: true,
                }
            }
        }
    });

    if (!instructor || !instructor.instructorProfile) {
        throw new NotFoundError("Instructor");
    }

    // Compute aggregated review stats across all courses
    const allReviews = instructor.courses.flatMap(c => c.reviews);
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0
        ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
        : 0;

    // Total students across all courses
    const totalStudents = instructor.courses.reduce((sum, c) => sum + c._count.enrollments, 0);

    // Format courses (remove raw reviews, add computed fields)
    const courses = instructor.courses.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        level: c.level,
        type: c.type,
        price: Number(c.price),
        discountedPrice: c.discountedPrice ? Number(c.discountedPrice) : null,
        thumbnailUrl: c.thumbnailUrl,
        isFree: c.isFree,
        enrollmentCount: c._count.enrollments,
        averageRating: c.reviews.length > 0
            ? Math.round((c.reviews.reduce((s, r) => s + r.rating, 0) / c.reviews.length) * 10) / 10
            : null,
        reviewCount: c.reviews.length,
    }));

    return {
        id: instructor.id,
        name: instructor.name,
        avatar: instructor.avatar,
        memberSince: instructor.createdAt,
        profile: instructor.instructorProfile,
        courses,
        mentorshipSlots: instructor.mentorshipSlots,
        stats: {
            totalStudents,
            totalCourses: instructor.courses.length,
            totalSessions: instructor._count.mentorshipsGiven,
            averageRating,
            totalReviews,
        }
    };
};
