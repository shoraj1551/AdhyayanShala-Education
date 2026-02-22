import { Router } from 'express';
import * as FinanceController from '../controllers/finance.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

// Instructor Routes
router.get('/instructor', authenticateToken, authorizeRole(['INSTRUCTOR', 'ADMIN']), FinanceController.getInstructorFinance);
router.put('/instructor/bank', authenticateToken, authorizeRole(['INSTRUCTOR', 'ADMIN']), FinanceController.updateBankDetails);
router.post('/instructor/payout', authenticateToken, authorizeRole(['INSTRUCTOR', 'ADMIN']), FinanceController.requestPayout);

export default router;
