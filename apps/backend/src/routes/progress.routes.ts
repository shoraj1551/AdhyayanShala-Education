import { Router } from 'express';
import * as ProgressController from '../controllers/progress.controller';

const router = Router();

router.post('/complete', ProgressController.markLessonComplete);
router.get('/', ProgressController.getProgress);

export default router;
