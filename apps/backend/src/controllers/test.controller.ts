import { Request, Response } from 'express';
import * as TestService from '../services/test.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listTests = async (req: Request, res: Response) => {
    try {
        const tests = await TestService.listTests();
        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tests' });
    }
};

export const getTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const test = await TestService.getTestById(id);
        if (!test) return res.status(404).json({ message: 'Test not found' });

        // If Admin/Instructor, send full data including isCorrect
        // If Student, sanitize
        // For simplicity, let's assume this route is protected or we check role here.
        // Assuming the sanitize logic should be in the frontend or handled by separate 'take-test' endpoint?
        // Let's keep the existing logic: GET implies "viewing to take" or "viewing to edit". 
        // We probably want a separate `getTestForEditor` vs `getTestForRunner`.
        // Current implementation was for Runner. Let's make this universal but sensitive to context if needed.
        // For now, let's just return it. The TestRunner sanitizes in controller?? 
        // Wait, the previous controller sanitized it.

        const isEditor = (req as AuthRequest).user?.role === 'INSTRUCTOR' || (req as AuthRequest).user?.role === 'ADMIN';

        if (isEditor) {
            res.json(test);
        } else {
            const sanitizedTest = {
                ...test,
                questions: test.questions.map(q => ({
                    ...q,
                    options: q.options.map(o => ({
                        id: o.id,
                        text: o.text,
                        questionId: o.questionId
                    }))
                }))
            };
            res.json(sanitizedTest);
        }

    } catch (error) {
        res.status(500).json({ message: 'Error fetching test' });
    }
};

export const createTest = async (req: Request, res: Response) => {
    try {
        const test = await TestService.createTest(req.body);
        res.status(201).json(test);
    } catch (error) {
        res.status(500).json({ message: 'Error creating test' });
    }
};

export const updateTest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const test = await TestService.updateTest(id, req.body);
        res.json(test);
    } catch (error) {
        res.status(500).json({ message: 'Error updating test' });
    }
};

export const addQuestion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const question = await TestService.createQuestion(id, req.body);
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error adding question' });
    }
};

export const updateQuestion = async (req: Request, res: Response) => {
    try {
        const { id, questionId } = req.params; // url /tests/:id/questions/:questionId ?? or just /questions/:id
        // Route likely /questions/:id
        const question = await TestService.updateQuestion(questionId, req.body);
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error updating question' });
    }
};

export const deleteQuestion = async (req: Request, res: Response) => {
    try {
        const { questionId } = req.params;
        await TestService.deleteQuestion(questionId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting question' });
    }
};




export const submitTest = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // GUEST LIMIT CHECK
        if (userRole === 'GUEST') {
            const attemptCount = await prisma.attempt.count({
                where: { userId }
            });
            if (attemptCount >= 1) {
                return res.status(403).json({
                    message: 'Guest limit reached. You can only take 1 test as a guest. Please register to continue.'
                });
            }
        }

        const result = await TestService.submitTest(userId, id, answers);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting test' });
    }
};

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const leaderboard = await TestService.getLeaderboard(id);
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};
