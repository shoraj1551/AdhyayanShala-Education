import { z } from 'zod'

/**
 * Validation schema for creating a course
 */
export const createCourseSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    short_description: z.string().max(500).optional(),
    price: z.number().min(0, 'Price must be positive').max(999999.99),
    duration_hours: z.number().int().min(1).max(1000).optional(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    thumbnail_url: z.string().url().optional().or(z.literal('')),
    preview_video_url: z.string().url().optional().or(z.literal('')),
    modules: z.array(z.record(z.string(), z.unknown())).default([]),
    requirements: z.array(z.string()).max(20).default([]),
    what_you_learn: z.array(z.string()).max(20).default([]),
    is_published: z.boolean().default(false),
})

/**
 * Validation schema for updating a course
 */
export const updateCourseSchema = createCourseSchema.partial()

export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
