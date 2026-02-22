import { z } from 'zod';

export const liveSettingsSchema = z.object({
    platform: z.enum(['ZOOM', 'MEET', 'JITSI']).default('ZOOM'),
    meetingLink: z.string().url().optional().or(z.string().length(0)),
    scheduleNote: z.string().optional(),
    difficulty: z.string().optional(),
});

export const scheduleSchema = z.object({
    dayOfWeek: z.number().int().min(1).max(7),
    startTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, "Invalid time format (HH:mm)"),
    duration: z.number().int().min(1).default(60),
});

export const saveMediaSchema = z.object({
    url: z.string().url(),
    title: z.string().optional(),
});
