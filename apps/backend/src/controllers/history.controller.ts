import { Request, Response } from 'express';
import * as HistoryService from '../services/history.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMyHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const history = await HistoryService.getUserAttempts(userId);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
};
