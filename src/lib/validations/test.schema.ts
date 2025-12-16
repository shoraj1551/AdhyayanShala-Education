import { z } from 'zod'

/**
 * Validation schema for creating a test
 */
export const createTestSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().optional(),
    category_id: z.string().uuid().optional().nullable(),
    questions: z.array(z.record(z.unknown())).min(1, 'At least one question is required'),
    price: z.number().min(0).max(999999.99),
    duration_minutes: z.number().int().min(1, 'Duration must be at least 1 minute').max(480),
    passing_score: z.number().int().min(0).max(100).default(70),
    max_attempts: z.number().int().min(1).max(10).default(3),
    is_published: z.boolean().default(false),
})

/**
 * Validation schema for updating a test
 */
export const updateTestSchema = createTestSchema.partial()

/**
 * Validation schema for submitting test answers
 */
export const submitTestSchema = z.object({
    test_id: z.string().uuid(),
    answers: z.record(z.unknown()),
    time_taken_minutes: z.number().int().min(1).optional(),
})

export type CreateTestInput = z.infer<typeof createTestSchema>
export type UpdateTestInput = z.infer<typeof updateTestSchema>
export type SubmitTestInput = z.infer<typeof submitTestSchema>
