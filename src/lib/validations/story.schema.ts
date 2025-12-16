import { z } from 'zod'

/**
 * Validation schema for creating a story
 */
export const createStorySchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    content: z.string().min(1, 'Content is required'),
    excerpt: z.string().max(500).optional(),
    genre: z.string().max(50).optional(),
    featured_image: z.string().url().optional().or(z.literal('')),
    read_time: z.number().int().min(1).max(300).optional(),
    is_premium: z.boolean().default(false),
    published: z.boolean().default(false),
})

/**
 * Validation schema for updating a story
 */
export const updateStorySchema = createStorySchema.partial()

export type CreateStoryInput = z.infer<typeof createStorySchema>
export type UpdateStoryInput = z.infer<typeof updateStorySchema>
