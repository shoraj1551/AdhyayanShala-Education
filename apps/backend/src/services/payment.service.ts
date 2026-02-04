import Razorpay from 'razorpay';
import crypto from 'crypto';
import * as CourseService from './course.service';

import { config } from '../config/env.config';
import Logger from '../lib/logger';


// Lazy Init to prevent startup crash if keys are missing (e.g. in Dev/Mock mode)
let razorpay: any;
if (config.RAZORPAY_KEY_ID && config.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
        key_id: config.RAZORPAY_KEY_ID,
        key_secret: config.RAZORPAY_KEY_SECRET
    });
}

export const createOrder = async (courseId: string, plan: string, amount: number) => {
    // Amount fits format (paise for INR)
    const options = {
        amount: Math.round(amount * 100), // convert to paise
        currency: "INR",
        receipt: `receipt_${Date.now()}_${courseId.substring(0, 5)}`,
        notes: {
            courseId,
            plan
        }
    };

    try {
        if (config.ENABLE_MOCK_PAYMENTS) throw new Error("Mock Mode Enabled");

        if (!razorpay) throw new Error("Razorpay Not Configured");
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        if (config.ENABLE_MOCK_PAYMENTS) {
            Logger.warn('[Payment] Using MOCK Payment Implementation (Feature Flag ENABLED)');
            return {
                id: `order_mock_${Date.now()}`,
                entity: 'order',
                amount: options.amount,
                amount_paid: 0,
                currency: options.currency,
                receipt: options.receipt,
                status: 'created',
                attempts: 0,
                notes: options.notes,
                created_at: Math.floor(Date.now() / 1000)
            };
        }
        Logger.error('[Payment] Razorpay Create Order Error', { error });
        throw error; // Fail fast in production
    }
};

import prisma from '../lib/prisma'; // Added import

export const calculateOrderAmount = async (courseId: string, plan: string) => {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new Error("Course not found");

    const baseRefPrice = course.discountedPrice || course.price;
    let amount = 0;

    if (plan === 'FULL') {
        amount = Math.round(baseRefPrice * 0.8);
    } else if (plan === 'INSTALLMENT_2') {
        const total = Math.round(baseRefPrice * 0.9);
        amount = Math.round(total / 2);
    } else if (plan === 'INSTALLMENT_4') {
        const total = baseRefPrice;
        amount = Math.round(total / 4);
    } else {
        // Default 1-time full payment fallback
        amount = Math.round(baseRefPrice * 0.8);
    }

    if (amount <= 0) amount = 1;
    return amount;
};

// ...

export const verifyPayment = async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    userId: string,
    courseId: string,
    billingDetails: any
) => {
    const secret = config.RAZORPAY_KEY_SECRET || '';

    // Fetch Course Price for Ledger
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { price: true, title: true }
    });
    const amount = course?.price || 0;

    // Handle Mock Payment Verification
    if (razorpay_order_id.startsWith('order_mock_')) {
        Logger.info('[Payment] Mock payment verified', { userId, courseId });
        const isEnrolled = await CourseService.checkEnrollment(userId, courseId);
        if (!isEnrolled) {
            await CourseService.enrollUserInCourse(userId, courseId);

            // Record Transaction (Mock)
            await prisma.payment.create({
                data: {
                    userId,
                    courseId,
                    amount,
                    status: 'SUCCESS',
                    provider: 'MOCK',
                    providerOrderId: razorpay_order_id,
                    providerPaymentId: `pay_mock_${Date.now()}`,
                }
            });
        }
        return { success: true, message: "Mock Payment verified and enrolled" };
    }

    const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

    if (generated_signature === razorpay_signature) {
        Logger.info('[Payment] Payment verified successfully', { userId, courseId, paymentId: razorpay_payment_id });

        const isEnrolled = await CourseService.checkEnrollment(userId, courseId);
        if (!isEnrolled) {
            await CourseService.enrollUserInCourse(userId, courseId);

            // Record Transaction (Razorpay)
            await prisma.payment.create({
                data: {
                    userId,
                    courseId,
                    amount,
                    status: 'SUCCESS',
                    provider: 'RAZORPAY',
                    providerOrderId: razorpay_order_id,
                    providerPaymentId: razorpay_payment_id,
                    signature: razorpay_signature
                }
            });
        }

        return { success: true, message: "Payment verified and enrolled" };
    } else {
        // Log Failed Attempt?
        await prisma.payment.create({
            data: {
                userId,
                courseId,
                amount,
                status: 'FAILED',
                provider: 'RAZORPAY',
                providerOrderId: razorpay_order_id,
                providerPaymentId: razorpay_payment_id,
                signature: razorpay_signature
            }
        });
        throw new Error("Payment verification failed: Invalid Signature");
    }
};
