import { z } from 'zod';

export const bookingSchema = z.object({
    instructorId: z.string().uuid(),
    date: z.string().datetime().or(z.date()),
    startTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Invalid time format (HH:mm)"),
    duration: z.number().int().min(15).default(60),
    context: z.string().optional(),
    questions: z.string().optional(),
});

export const mentorshipSlotSchema = z.object({
    dayOfWeek: z.number().int().min(0).max(6), // 0=Sun...
    startTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Invalid time format (HH:mm)"),
    endTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Invalid time format (HH:mm)"),
    isActive: z.boolean().default(true),
});

export const availabilitySchema = z.object({
    slots: z.array(mentorshipSlotSchema),
});

export const feeSchema = z.object({
    fee: z.number().min(0),
});
