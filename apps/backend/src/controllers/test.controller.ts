import { Request, Response, NextFunction } from 'express';
import * as TestService from '../services/test.service';
import { AuthRequest } from '../middleware/auth.middleware';
import {
    testSchema,
    updateTestSchema,
    questionSchema,
    updateQuestionSchema,
    submissionSchema
} from '../validations/test.schema';
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

export const createTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = testSchema.parse(req.body);
        const test = await TestService.createTest(validatedData);
        res.status(201).json(test);
    } catch (error) {
        next(error);
    }
};

export const updateTest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validatedData = updateTestSchema.parse(req.body);
        const test = await TestService.updateTest(id, validatedData);
        res.json(test);
    } catch (error) {
        next(error);
    }
};

export const addQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const validatedData = questionSchema.parse(req.body);
        const question = await TestService.createQuestion(id, validatedData);
        res.status(201).json(question);
    } catch (error) {
        next(error);
    }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { questionId } = req.params;
        const validatedData = updateQuestionSchema.parse(req.body);
        const question = await TestService.updateQuestion(questionId, validatedData);
        res.json(question);
    } catch (error) {
        next(error);
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




export const startAttempt = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
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

        const attempt = await TestService.startAttempt(userId, id);
        res.status(201).json(attempt);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error starting test attempt' });
    }
};

export const syncAttempt = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { attemptId } = req.params;
        const { responses } = req.body;

        const attempt = await TestService.syncAttempt(attemptId, responses);
        res.json(attempt);
    } catch (error) {
        next(error);
    }
};

export const submitTest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id, attemptId } = req.params;
        const { answers } = submissionSchema.parse(req.body);
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const result = await TestService.submitTest(userId, id, attemptId, answers);
        res.json(result);
    } catch (error) {
        next(error);
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
