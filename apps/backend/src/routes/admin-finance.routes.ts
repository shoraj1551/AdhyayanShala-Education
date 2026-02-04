import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';
import * as AdminFinanceController from '../controllers/admin-finance.controller';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

router.get('/transactions', AdminFinanceController.getTransactions);
router.post('/transactions/:id/refund', AdminFinanceController.refundTransaction);

export default router;
