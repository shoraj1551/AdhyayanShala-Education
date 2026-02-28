
import { Router } from 'express';
import * as PracticeController from '../controllers/practice.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Public routes for Practice Portal
router.get('/questions', PracticeController.getQuestions);
router.get('/questions/:id', PracticeController.getQuestionDetail);

// Authenticated routes
router.post('/questions/:id/comments', authenticateToken, PracticeController.addComment);

// Admin routes for solutions
router.put('/questions/:id/solution', authenticateToken, authorizeRole(['ADMIN']), PracticeController.updateSolution);

export default router;
