import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// TODO: Replace with real user ID from Auth Middleware
const DEV_STUDENT_EMAIL = 'student@shorajtomer.me';

export const markLessonComplete = async (req: Request, res: Response) => {
    try {
        const { lessonId } = req.body;

        if (!lessonId) {
            return res.status(400).json({ message: 'Lesson ID is required' });
        }

        // Get (or create) the Dev Student
        let user = await prisma.user.findUnique({ where: { email: DEV_STUDENT_EMAIL } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: DEV_STUDENT_EMAIL,
                    name: 'Dev Student',
                    password: 'placeholder',
                    role: 'STUDENT'
                }
            });
        }

        // Upsert Progress
        const progress = await prisma.lessonProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId: lessonId
                }
            },
            update: {
                completedAt: new Date()
            },
            create: {
                userId: user.id,
                lessonId: lessonId
            }
        });

        res.json(progress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating progress' });
    }
};

export const getProgress = async (req: Request, res: Response) => {
    try {
        // Get (or create) the Dev Student
        let user = await prisma.user.findUnique({ where: { email: DEV_STUDENT_EMAIL } });
        if (!user) {
            return res.json([]); // No user, no progress
        }

        const progress = await prisma.lessonProgress.findMany({
            where: { userId: user.id },
            select: { lessonId: true, completedAt: true }
        });

        res.json(progress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching progress' });
    }
}
