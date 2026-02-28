
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


