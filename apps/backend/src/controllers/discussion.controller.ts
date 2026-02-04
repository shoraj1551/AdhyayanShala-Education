import { Request, Response } from 'express';
import * as DiscussionService from '../services/discussion.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getLessonComments = async (req: AuthRequest, res: Response) => {
    try {
        const { lessonId } = req.params;
        const comments = await DiscussionService.getLessonComments(lessonId);
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
};

export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const { lessonId } = req.params;
        const { content } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const comment = await DiscussionService.addComment(userId, lessonId, content);
        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error posting comment' });
    }
};

export const replyToComment = async (req: AuthRequest, res: Response) => {
    try {
        const { commentId } = req.params; // Using the route /comments/:commentId/reply
        const { content, lessonId } = req.body; // Need lessonId passed or looked up
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Note: Service expects (userId, lessonId, content, parentId)
        const reply = await DiscussionService.addComment(userId, lessonId, content, commentId);
        res.status(201).json(reply);
    } catch (error) {
        res.status(500).json({ message: 'Error posting reply' });
    }
};
