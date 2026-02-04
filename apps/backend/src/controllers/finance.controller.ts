import { Request, Response } from 'express';
import * as FinanceService from '../services/finance.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getInstructorFinance = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const data = await FinanceService.getInstructorFinance(userId);
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Error fetching finance data' });
    }
};

export const updateBankDetails = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        await FinanceService.updateBankDetails(userId, req.body);
        res.json({ message: 'Bank details updated' });
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Error updating bank details' });
    }
};

export const requestPayout = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const payout = await FinanceService.requestPayout(userId);
        res.status(201).json(payout);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error requesting payout' });
    }
};

export const getAdminPayouts = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const payouts = await FinanceService.getAdminPayouts(status as string);
        res.json(payouts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payouts' });
    }
};

export const processPayout = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { transactionRef, action } = req.body; // action: APPROVE | REJECT
        const payout = await FinanceService.processPayout(id, transactionRef, action);
        res.json(payout);
    } catch (error) {
        res.status(500).json({ message: 'Error processing payout' });
    }
};
