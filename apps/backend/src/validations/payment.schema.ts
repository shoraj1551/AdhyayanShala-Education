import { z } from 'zod';

export const createOrderSchema = z.object({
    courseId: z.string().uuid(),
    plan: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
    courseId: z.string().uuid(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
