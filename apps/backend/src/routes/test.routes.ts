import { Router } from 'express';
import * as TestController from '../controllers/test.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Public / Student Routes
router.get('/', authenticateToken, TestController.listTests); // Everyone can list tests? Maybe filters later.
router.get('/:id', authenticateToken, TestController.getTest); // IsEditor check inside handles hiding answers
router.post('/:id/submit', authenticateToken, TestController.submitTest);

// Admin / Instructor Routes
router.post('/', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), TestController.createTest);
router.put('/:id', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), TestController.updateTest);

router.post('/:id/questions', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), TestController.addQuestion);
router.put('/questions/:questionId', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), TestController.updateQuestion);
router.delete('/questions/:questionId', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), TestController.deleteQuestion);

export default router;
