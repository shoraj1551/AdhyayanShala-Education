import { Request, Response, NextFunction } from 'express';
import * as LiveClassService from '../services/liveClass.service';
import { generateJitsiToken } from '../services/liveToken.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { liveSettingsSchema, scheduleSchema, saveMediaSchema } from '../validations/liveClass.schema';
import { verifyCourseOwnership } from '../utils/auth-helpers';
import prisma from '../lib/prisma';
import { NotFoundError, UnauthorizedError } from '../lib/errors';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const settings = await LiveClassService.getSettings(id);
        const schedules = await LiveClassService.getSchedules(id);

        const recordings = (settings?.recordings as any[]) || [];
        const notes = (settings?.notes as any[]) || [];

        // Auto-generate schedule note from schedules if not manually set
        let scheduleNote = settings?.scheduleNote || '';
        if (schedules.length > 0 && !scheduleNote) {
            const validSchedules = schedules.filter(s => s.dayOfWeek !== null) as Array<{ dayOfWeek: number; startTime: string }>;
            if (validSchedules.length > 0) {
                scheduleNote = LiveClassService.generateScheduleNote(validSchedules);
            }
        }

        res.json({
            data: {
                settings: settings ? { ...settings, scheduleNote } : null,
                schedules,
                recordings,
                notes
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedError();

        await verifyCourseOwnership(id, userId);

        const validatedData = liveSettingsSchema.parse(req.body);
        const settings = await LiveClassService.updateSettings(id, validatedData);
        res.json(settings);
    } catch (error) {
        next(error);
    }
};

export const addSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // courseId
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedError();

        await verifyCourseOwnership(id, userId);

        const validatedData = scheduleSchema.parse(req.body);
        const schedule = await LiveClassService.addSchedule(id, validatedData);
        res.json(schedule);
    } catch (error) {
        next(error);
    }
};

export const deleteSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { scheduleId } = req.params;
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedError();

        // Need to check ownership of the course this schedule belongs to
        const schedule = await prisma.classSchedule.findUnique({
            where: { id: scheduleId },
            select: { courseId: true }
        });
        if (!schedule) throw new NotFoundError("Schedule");

        await verifyCourseOwnership(schedule.courseId, userId);

        await LiveClassService.deleteSchedule(scheduleId);
        res.json({ message: 'Schedule deleted' });
    } catch (error) {
        next(error);
    }
};

export const downloadCalendar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const icsContent = await LiveClassService.getCourseCalendar(id);
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename=course-${id}.ics`);
        res.send(icsContent);
    } catch (error) {
        next(error);
    }
};

export const generateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id: courseId } = req.params;
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedError();

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true }
        });
        if (!user) throw new NotFoundError("User");

        const settings = await prisma.liveClassSettings.findUnique({
            where: { courseId },
            select: { moderatorEmails: true }
        });

        const moderatorEmails = (settings?.moderatorEmails as string[]) || [];
        const isPersistentModerator = moderatorEmails.includes(user.email);

        const jitsiRole = (user.role === 'INSTRUCTOR' || user.role === 'ADMIN' || isPersistentModerator) ? 'MODERATOR' : user.role;
        const tokenData = generateJitsiToken(courseId, {
            name: user.name || (jitsiRole === 'MODERATOR' ? 'Instructor' : 'Student'),
            email: user.email,
            role: jitsiRole,
        });

        res.json(tokenData);
    } catch (error) {
        next(error);
    }
};

export const saveRecording = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id: courseId } = req.params;
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedError();

        await verifyCourseOwnership(courseId, userId);

        const { url, title } = saveMediaSchema.parse(req.body);

        const settings = await prisma.liveClassSettings.findUnique({ where: { courseId } });
        if (!settings) throw new NotFoundError("Live class settings");

        const recordings = (settings.recordings as any[]) || [];
        recordings.unshift({ url, title: title || 'Class Recording', recordedAt: new Date().toISOString() });

        await prisma.liveClassSettings.update({
            where: { courseId },
            data: { recordings }
        });

        res.json({ message: 'Recording saved', recordings });
    } catch (error) {
        next(error);
    }
};

export const saveNotes = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id: courseId } = req.params;
        const userId = req.user?.id;
        if (!userId) throw new UnauthorizedError();

        await verifyCourseOwnership(courseId, userId);

        const { url, title } = saveMediaSchema.parse(req.body);

        const settings = await prisma.liveClassSettings.findUnique({ where: { courseId } });
        if (!settings) throw new NotFoundError("Live class settings");

        const notes = (settings.notes as any[]) || [];
        notes.unshift({ url, title: title || 'Class Notes', savedAt: new Date().toISOString() });

        await prisma.liveClassSettings.update({
            where: { courseId },
            data: { notes }
        });

        res.json({ message: 'Notes saved', notes });
    } catch (error) {
        next(error);
    }
};
