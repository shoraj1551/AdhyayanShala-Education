import { z } from 'zod';

export const bankDetailsSchema = z.object({
    type: z.enum(['UPI', 'BANK']),
    value: z.string().min(1),
    accountName: z.string().optional(),
    ifsc: z.string().optional(),
});

export const processPayoutSchema = z.object({
    transactionRef: z.string().optional(),
    action: z.enum(['APPROVE', 'REJECT']),
});
