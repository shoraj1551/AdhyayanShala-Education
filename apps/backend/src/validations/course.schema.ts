import { z } from 'zod';
import { CourseLevel } from '@prisma/client';

export const createCourseSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10),
    level: z.nativeEnum(CourseLevel).default(CourseLevel.BEGINNER),
    price: z.number().min(0).default(0),
    pricePerClass: z.number().min(0).optional(),
    totalClasses: z.number().int().min(1).optional(),
    startDate: z.string().optional().or(z.date()),
    endDate: z.string().optional().or(z.date()),
    type: z.enum(['VIDEO', 'LIVE', 'TEST_SERIES']).default('VIDEO'),
    thumbnailUrl: z.string().url().optional().or(z.string().length(0)),
    promoVideoUrl: z.string().url().optional().or(z.string().length(0)),
    brochureUrl: z.string().url().optional().or(z.string().length(0)),
    meetingPlatform: z.enum(['ZOOM', 'MEET']).optional(),
    meetingLink: z.string().url().optional().or(z.string().length(0)),
    currency: z.string().default('INR'),
});

export const updateCourseSchema = createCourseSchema.partial();

export const moduleSchema = z.object({
    title: z.string().min(3).max(100),
});

export const lessonSchema = z.object({
    title: z.string().min(3).max(100),
    content: z.string().optional().default(''),
    type: z.enum(['VIDEO', 'TEXT']),
    videoUrl: z.string().url().optional().or(z.string().length(0)),
    summary: z.string().optional(),
    attachmentUrl: z.string().url().optional().or(z.string().length(0)),
    resources: z.array(z.object({
        title: z.string(),
        url: z.string().url(),
    })).optional(),
});
