
import { Request, Response } from 'express';
import * as PracticeService from '../services/practice.service';
import Logger from '../lib/logger';

export const getQuestions = async (req: Request, res: Response) => {
    try {
        const { category, type } = req.query;
        const questions = await PracticeService.listPracticeQuestions(
            category as string,
            type as 'PYQ' | 'TEST'
        );
        res.json(questions);
    } catch (error) {
        Logger.error('Error fetching practice questions:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getQuestionDetail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const question = await PracticeService.getQuestionWithSolution(id);
        res.json(question);
    } catch (error: any) {
        if (error.name === 'NotFoundError') {
            return res.status(404).json({ message: error.message });
        }
        Logger.error('Error fetching question detail:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Question ID
        const { text } = req.body;
        const userId = (req as any).user.id;

        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const comment = await PracticeService.addQuestionComment(userId, id, text);
        res.status(201).json(comment);
    } catch (error) {
        Logger.error('Error adding comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateSolution = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Question ID
        const { text, audioUrl } = req.body;

        // Admin check should be in middleware
        const solution = await PracticeService.updateQuestionSolution(id, { text, audioUrl });
        res.json(solution);
    } catch (error) {
        Logger.error('Error updating solution:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
