import { Router } from 'express';
import { getInstructorActivity } from '../controllers/activity.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/instructor', authenticateToken, getInstructorActivity);

export default router;
