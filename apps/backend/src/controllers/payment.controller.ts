import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as PaymentService from '../services/payment.service';
import * as CourseService from '../services/course.service';

import { config } from '../config/env.config';
import Logger from '../lib/logger';

export const createOrder = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { courseId, plan } = req.body;

        const amount = await PaymentService.calculateOrderAmount(courseId, plan);
        const order = await PaymentService.createOrder(courseId, plan, amount);

        res.json({
            ...order,
            key: config.RAZORPAY_KEY_ID || ''
        });
    } catch (error: any) {
        Logger.error("Create Order Error:", error);
        res.status(500).json({ message: error.message || 'Error creating order' });
    }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            courseId,
            billingDetails
        } = req.body;

        const result = await PaymentService.verifyPayment(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            courseId,
            billingDetails
        );

        res.json(result);
    } catch (error: any) {
        Logger.error("Verify Payment Error:", error);
        res.status(400).json({ message: error.message || 'Payment verification failed' });
    }
};
