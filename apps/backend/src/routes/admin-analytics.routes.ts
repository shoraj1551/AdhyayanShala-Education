import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';
import * as AdminAnalyticsController from '../controllers/admin-analytics.controller';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

router.get('/dashboard', AdminAnalyticsController.getDashboardStats);

export default router;
