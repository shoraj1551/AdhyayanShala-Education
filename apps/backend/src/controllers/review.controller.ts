
import { Request, Response } from 'express';
import * as ReviewService from '../services/review.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const createReview = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.userId;
        const { rating, comment } = req.body;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const review = await ReviewService.addReview(courseId, userId, rating, comment);
        res.status(201).json(review);
    } catch (error) {
        console.error("Create Review Error", error);
        res.status(500).json({ message: 'Error adding review' });
    }
};

export const getCourseReviews = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const reviews = await ReviewService.getReviews(courseId);
        const rating = await ReviewService.getCourseRating(courseId);
        res.json({ reviews, rating });
    } catch (error) {
        console.error("Get Reviews Error", error);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
};
