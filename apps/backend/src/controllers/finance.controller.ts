import { Request, Response, NextFunction } from 'express';
import * as FinanceService from '../services/finance.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { bankDetailsSchema, processPayoutSchema } from '../validations/finance.schema';

export const getInstructorFinance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const data = await FinanceService.getInstructorFinance(userId);
        res.json(data);
    } catch (error: any) {
        next(error);
    }
};

export const updateBankDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const validatedData = bankDetailsSchema.parse(req.body);
        await FinanceService.updateBankDetails(userId, validatedData);
        res.json({ message: 'Bank details updated' });
    } catch (error: any) {
        next(error);
    }
};

export const requestPayout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const payout = await FinanceService.requestPayout(userId);
        res.status(201).json(payout);
    } catch (error: any) {
        next(error);
    }
};

export const getAdminPayouts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.query;
        const payouts = await FinanceService.getAdminPayouts(status as string);
        res.json(payouts);
    } catch (error) {
        next(error);
    }
};

export const processPayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { transactionRef, action } = processPayoutSchema.parse(req.body); // action: APPROVE | REJECT
        const payout = await FinanceService.processPayout(id, transactionRef, action);
        res.json(payout);
    } catch (error) {
        next(error);
    }
};

// Admin-only: Manually trigger earnings reconciliation for an instructor
export const healInstructorEarnings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { instructorId } = req.params;
        if (!instructorId) return res.status(400).json({ message: 'instructorId is required' });
        const result = await FinanceService.healMissingEarnings(instructorId);
        res.json({ message: `Auto-heal complete`, ...result });
    } catch (error) {
        next(error);
    }
};
