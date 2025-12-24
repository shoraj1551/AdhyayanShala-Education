import { Request, Response } from 'express';
import * as TestService from '../services/test.service';
import prisma from '../lib/prisma';

// TODO: Replace with Auth
const DEV_STUDENT_EMAIL = 'student@shorajtomer.me';

export const getTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const test = await TestService.getTestById(id);
        if (!test) return res.status(404).json({ message: 'Test not found' });
        res.json(test);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching test' });
    }
};

export const submitTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;

        // Get dummy user
        const user = await prisma.user.findUnique({ where: { email: DEV_STUDENT_EMAIL } });
        if (!user) return res.status(401).json({ message: 'User not found' });

        const result = await TestService.submitTest(user.id, id, answers);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting test' });
    }
};
