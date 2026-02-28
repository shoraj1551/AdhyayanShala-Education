
import { Request, Response } from 'express';
import * as StudentService from '../services/student.service';
import { AuthRequest } from '../middleware/auth.middleware';
import Logger from '../lib/logger';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const stats = await StudentService.getDashboardStats(userId);
        res.json(stats);
    } catch (error) {
        Logger.error('[Student] Error:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

export const getEnrolledCourses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const courses = await StudentService.getEnrolledCourses(userId);
        res.json(courses);
    } catch (error) {
        Logger.error('[Student] Error:', error);
        res.status(500).json({ message: 'Error fetching enrolled courses' });
    }
};
