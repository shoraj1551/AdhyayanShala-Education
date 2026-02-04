import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as AdminFinanceService from '../services/admin-finance.service';

export const getTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;

        const result = await AdminFinanceService.getTransactions(page, limit, search);
        res.json(result);
    } catch (error) {
        console.error("Get Transactions Error:", error);
        res.status(500).json({ message: "Failed to fetch transactions" });
    }
};

export const refundTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const result = await AdminFinanceService.refundTransaction(id);
        res.json(result);
    } catch (error) {
        console.error("Refund Error:", error);
        res.status(500).json({ message: "Failed to process refund" });
    }
};
