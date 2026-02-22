import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { bookingSchema, availabilitySchema, feeSchema } from '../validations/mentorship.schema';

/**
 * Public: Get instructor availability and their hourly fee.
 */
export const getInstructorAvailability = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const instructor = await prisma.user.findUnique({
            where: { id, role: 'INSTRUCTOR' },
            select: { name: true, mentorshipFee: true, avatar: true, bio: true }
        });

        if (!instructor) return res.status(404).json({ message: 'Instructor not found' });

        const slots = await prisma.mentorshipSlot.findMany({
            where: { instructorId: id, isActive: true },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });

        res.json({ instructor, slots });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching availability' });
    }
};

/**
 * Student: Book a session. Logic checks if First 2 sessions are FREE.
 */
export const bookSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { instructorId, date, startTime, duration, context, questions } = bookingSchema.parse(req.body);
        const studentId = req.user?.id;
        if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

        const instructor = await prisma.user.findUnique({ where: { id: instructorId } });
        if (!instructor) return res.status(404).json({ message: 'Instructor not found' });

        // 1. Check if the instructor teaches any course the student is enrolled in
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId: studentId,
                course: { instructorId: instructorId }
            }
        });

        // 2. See how many past sessions the student had with this instructor
        const pastBookingsCount = await prisma.mentorshipBooking.count({
            where: { studentId, instructorId }
        });

        const isFree = Boolean(enrollment && pastBookingsCount < 2);
        const amountToPay = isFree ? 0 : instructor.mentorshipFee;

        // In a real app, if amountToPay > 0, we'd trigger Razorpay order here
        // For now, we instantly confirm and record amountPaid
        const booking = await prisma.mentorshipBooking.create({
            data: {
                studentId,
                instructorId,
                date: new Date(date),
                startTime,
                duration: duration || 60,
                status: 'CONFIRMED',
                context,
                questions,
                isFree,
                amountPaid: amountToPay,
                meetingLink: `https://meet.jit.si/Mentorship-${Date.now()}` // Mock dynamic link
            }
        });

        res.json({ message: 'Booking confirmed', booking });
    } catch (error) {
        next(error);
    }
};

/**
 * Common: Get my bookings (works for both Student and Instructor based on role)
 */
export const getMySessions = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        let sessions = [];
        if (role === 'INSTRUCTOR') {
            sessions = await prisma.mentorshipBooking.findMany({
                where: { instructorId: userId },
                include: { student: { select: { name: true, email: true, avatar: true } } },
                orderBy: { date: 'desc' }
            });
        } else {
            sessions = await prisma.mentorshipBooking.findMany({
                where: { studentId: userId },
                include: { instructor: { select: { name: true, email: true, avatar: true } } },
                orderBy: { date: 'desc' }
            });
        }

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sessions' });
    }
};

/**
 * Instructor: View own availability settings
 */
export const getMyAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await prisma.user.findUnique({ where: { id: userId }, select: { mentorshipFee: true } });
        const slots = await prisma.mentorshipSlot.findMany({
            where: { instructorId: userId },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });

        res.json({ fee: user?.mentorshipFee || 0, slots });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching availability' });
    }
};

/**
 * Instructor: Replace entirely the availability slots (simple way)
 */
export const updateAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { slots } = availabilitySchema.parse(req.body); // Array of { dayOfWeek, startTime, endTime, isActive }
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        await prisma.$transaction(async (tx) => {
            // Delete old
            await tx.mentorshipSlot.deleteMany({ where: { instructorId: userId } });
            // Insert new
            if (slots && slots.length > 0) {
                await tx.mentorshipSlot.createMany({
                    data: slots.map((s) => ({
                        instructorId: userId,
                        dayOfWeek: s.dayOfWeek,
                        startTime: s.startTime,
                        endTime: s.endTime,
                        isActive: s.isActive ?? true
                    }))
                });
            }
        });

        const newSlots = await prisma.mentorshipSlot.findMany({
            where: { instructorId: userId },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        });
        res.json({ message: 'Availability updated', slots: newSlots });
    } catch (error) {
        next(error);
    }
};

/**
 * Instructor: Update mentorship base fee
 */
export const updateFee = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { fee } = feeSchema.parse(req.body);
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        await prisma.user.update({
            where: { id: userId },
            data: { mentorshipFee: fee }
        });

        res.json({ message: 'Fee updated successfully', fee });
    } catch (error) {
        next(error);
    }
};
