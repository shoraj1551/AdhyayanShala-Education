import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as PaymentService from '../services/payment.service';
import { createOrderSchema, verifyPaymentSchema } from '../validations/payment.schema';

import { config } from '../config/env.config';
import Logger from '../lib/logger';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const { courseId, plan } = createOrderSchema.parse(req.body);

        const amount = await PaymentService.calculateOrderAmount(courseId, plan);
        const order = await PaymentService.createOrder(courseId, plan, amount);

        res.json({
            ...order,
            key: config.RAZORPAY_KEY_ID || ''
        });
    } catch (error: any) {
        next(error);
    }
};

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const validatedData = verifyPaymentSchema.parse(req.body);

        const result = await PaymentService.verifyPayment(
            validatedData.razorpay_order_id,
            validatedData.razorpay_payment_id,
            validatedData.razorpay_signature,
            userId,
            validatedData.courseId
        );

        res.json(result);
    } catch (error: any) {
        next(error);
    }
};
