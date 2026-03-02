
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as MentorshipService from '../services/mentorship.service';
import { UnauthorizedError } from '../lib/errors';

export const getSlots = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedError();
        const slots = await MentorshipService.getInstructorSlots(userId);
        res.json(slots);
    } catch (error) {
        next(error);
    }
};

export const getAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedError();

        // Use auth service or similar to get the user's fee
        const instructor = await MentorshipService.getInstructorByIdWithSlots(userId);

        res.json({
            fee: instructor.instructor.instructorProfile?.mentorshipFee || 0,
            slots: instructor.slots
        });

    } catch (error) {
        next(error);
    }
};


export const updateSlots = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedError();
        const slots = await MentorshipService.updateInstructorSlots(userId, req.body.slots);
        res.json({ slots }); // Wrap in object to match frontend expectation for /availability POST
    } catch (error) {
        next(error);
    }
};

export const updateFee = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedError();
        const { fee } = req.body;
        await MentorshipService.updateMentorshipFee(userId, fee);
        res.json({ success: true, fee });
    } catch (error) {
        next(error);
    }
};


export const listInstructors = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { expertise } = req.query;
        const instructors = await MentorshipService.getAvailableInstructors(expertise as string);
        res.json(instructors);
    } catch (error) {
        next(error);
    }
};

export const getInstructorAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await MentorshipService.getInstructorByIdWithSlots(id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const bookSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedError();
        const booking = await MentorshipService.bookSlot(userId, req.body);
        res.json(booking);
    } catch (error) {
        next(error);
    }
};

export const getMyBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        if (!userId) throw new UnauthorizedError();

        const bookings = role === 'INSTRUCTOR'
            ? await MentorshipService.getInstructorBookings(userId)
            : await MentorshipService.getStudentBookings(userId);

        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

export const getInstructorProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const profile = await MentorshipService.getPublicInstructorProfile(id);
        res.json(profile);
    } catch (error) {
        next(error);
    }
};
