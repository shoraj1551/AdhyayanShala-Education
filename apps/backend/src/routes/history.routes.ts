import { Router } from 'express';
import * as HistoryController from '../controllers/history.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, HistoryController.getMyHistory);

export default router;
