import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as PaymentController from '../controllers/payment.controller';

const router = Router();

router.post('/create-order', authenticateToken, PaymentController.createOrder);
router.post('/verify', authenticateToken, PaymentController.verifyPayment);

export default router;
