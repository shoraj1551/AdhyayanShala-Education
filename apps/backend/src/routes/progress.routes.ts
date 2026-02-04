import { Router } from 'express';
import * as ProgressController from '../controllers/progress.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/complete', authenticateToken, ProgressController.markLessonComplete);
router.get('/', authenticateToken, ProgressController.getProgress);

export default router;
