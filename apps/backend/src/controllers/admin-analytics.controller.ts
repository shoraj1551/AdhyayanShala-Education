import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as AdminAnalyticsService from '../services/admin-analytics.service';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const stats = await AdminAnalyticsService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        console.error("Get Dashboard Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
};
