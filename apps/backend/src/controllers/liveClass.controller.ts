
import { Request, Response } from 'express';
import * as LiveClassService from '../services/liveClass.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getSettings = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const settings = await LiveClassService.getSettings(id);
        const schedules = await LiveClassService.getSchedules(id);

        // Auto-generate schedule note from schedules if not manually set
        let scheduleNote = settings?.scheduleNote || '';
        if (schedules.length > 0 && !scheduleNote) {
            // Filter out schedules with null dayOfWeek
            const validSchedules = schedules.filter(s => s.dayOfWeek !== null) as Array<{ dayOfWeek: number; startTime: string }>;
            if (validSchedules.length > 0) {
                scheduleNote = LiveClassService.generateScheduleNote(validSchedules);
            }
        }

        res.json({
            data: {
                settings: settings ? { ...settings, scheduleNote } : null,
                schedules
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching live class settings' });
    }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        // Verify instructor/admin logic should be here (middleware does generic role check)
        const settings = await LiveClassService.updateSettings(id, req.body);
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Error updating live settings' });
    }
};

export const addSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // courseId
        const schedule = await LiveClassService.addSchedule(id, req.body);
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error adding schedule' });
    }
};

export const deleteSchedule = async (req: AuthRequest, res: Response) => {
    try {
        const { scheduleId } = req.params;
        await LiveClassService.deleteSchedule(scheduleId);
        res.json({ message: 'Schedule deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting schedule' });
    }
};

export const downloadCalendar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const icsContent = await LiveClassService.getCourseCalendar(id);
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', `attachment; filename=course-${id}.ics`);
        res.send(icsContent);
    } catch (error) {
        res.status(500).json({ message: 'Error generating calendar' });
    }
};
