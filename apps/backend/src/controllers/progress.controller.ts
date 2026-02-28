import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../lib/prisma';
import Logger from '../lib/logger';



export const markLessonComplete = async (req: AuthRequest, res: Response) => {
    try {
        const { lessonId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (!lessonId) {
            return res.status(400).json({ message: 'Lesson ID is required' });
        }

        // Upsert Progress
        const progress = await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: userId,
                    lessonId: lessonId
                }
            },
            update: {
                completedAt: new Date()
            },
            create: {
                userId: userId,
                lessonId: lessonId
            }
        });

        res.json(progress);
    } catch (error) {
        Logger.error('[Progress] Error:', error);
        res.status(500).json({ message: 'Error updating progress' });
    }
};

export const getProgress = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const progress = await prisma.lessonProgress.findMany({
            where: { userId: userId },
            select: { lessonId: true, completedAt: true }
        });

        res.json(progress);
    } catch (error) {
        Logger.error('[Progress] Error:', error);
        res.status(500).json({ message: 'Error fetching progress' });
    }
}
