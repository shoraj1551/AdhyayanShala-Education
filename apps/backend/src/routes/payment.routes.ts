import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as PaymentController from '../controllers/payment.controller';
import * as ManualPaymentController from '../controllers/manualPayment.controller';

const router = Router();

router.post('/create-order', authenticateToken, PaymentController.createOrder);
router.post('/verify', authenticateToken, PaymentController.verifyPayment);

// Manual Payment Routes
router.post('/manual/submit', authenticateToken, ManualPaymentController.submitPaymentProof);
router.get('/manual/pending', authenticateToken, ManualPaymentController.getPendingPayments);
router.post('/manual/verify/:paymentId', authenticateToken, ManualPaymentController.verifyPayment);

export default router;
