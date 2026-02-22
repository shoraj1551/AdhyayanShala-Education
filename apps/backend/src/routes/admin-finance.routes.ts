import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';
import * as AdminFinanceController from '../controllers/admin-finance.controller';
import * as FinanceController from '../controllers/finance.controller';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

router.get('/transactions', AdminFinanceController.getTransactions);
router.post('/transactions/:id/refund', AdminFinanceController.refundTransaction);

// Payout Management
router.get('/payouts', FinanceController.getAdminPayouts);
router.post('/payouts/:id/process', FinanceController.processPayout);

export default router;
