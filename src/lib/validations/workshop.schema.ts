import { z } from 'zod'

/**
 * Validation schema for creating a workshop
 */
export const createWorkshopSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    short_description: z.string().max(500).optional(),
    start_date: z.string().datetime('Invalid start date'),
    end_date: z.string().datetime('Invalid end date'),
    duration_hours: z.number().int().min(1).max(100).optional(),
    price: z.number().min(0).max(999999.99),
    capacity: z.number().int().min(1, 'Capacity must be at least 1').max(10000),
    location: z.string().max(200).optional(),
    is_online: z.boolean().default(false),
    meeting_link: z.string().url().optional().or(z.literal('')),
    thumbnail_url: z.string().url().optional().or(z.literal('')),
    requirements: z.array(z.string()).max(20).default([]),
    what_you_learn: z.array(z.string()).max(20).default([]),
    is_published: z.boolean().default(false),
}).refine(
    (data) => new Date(data.end_date) > new Date(data.start_date),
    {
        message: 'End date must be after start date',
        path: ['end_date'],
    }
)

/**
 * Validation schema for updating a workshop
 */
export const updateWorkshopSchema = createWorkshopSchema.partial()

export type CreateWorkshopInput = z.infer<typeof createWorkshopSchema>
export type UpdateWorkshopInput = z.infer<typeof updateWorkshopSchema>
