import { Router } from 'express';
import * as TestController from '../controllers/test.controller';
import { authenticateToken, authorizeRole, authenticateTokenOptional } from '../middleware/auth.middleware';

const router = Router();

// Public / Student Routes
router.get('/', authenticateTokenOptional, TestController.listTests); // Optional auth: filter unpublished for non-instructors
router.get('/:id', authenticateToken, TestController.getTest); // IsEditor check inside handles hiding answers
router.post('/:id/attempts', authenticateToken, TestController.startAttempt);
router.put('/:id/attempts/:attemptId/sync', authenticateToken, TestController.syncAttempt);
router.post('/:id/attempts/:attemptId/submit', authenticateToken, TestController.submitTest);
router.get('/:id/leaderboard', authenticateToken, TestController.getLeaderboard);
// Admin / Instructor Routes
router.post('/', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), TestController.createTest);
router.put('/:id', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), TestController.updateTest);

router.post('/:id/questions', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), TestController.addQuestion);
router.put('/questions/:questionId', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), TestController.updateQuestion);
router.delete('/questions/:questionId', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), TestController.deleteQuestion);

export default router;
