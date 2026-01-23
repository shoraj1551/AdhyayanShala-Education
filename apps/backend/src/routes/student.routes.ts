
import { Router } from 'express';
import * as StudentController from '../controllers/student.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticateToken, StudentController.getDashboardStats);

export default router;
