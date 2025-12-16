import { z } from 'zod'

/**
 * Item in checkout cart
 */
const checkoutItemSchema = z.object({
    id: z.string().uuid('Invalid item ID'),
    name: z.string().min(1, 'Item name is required'),
    type: z.enum(['course', 'workshop', 'test']),
    price: z.number().min(0, 'Price must be positive').max(999999.99),
    description: z.string().optional(),
    images: z.array(z.string().url()).optional(),
    quantity: z.number().int().min(1).max(1).default(1), // Digital products, quantity always 1
})

/**
 * Validation schema for creating a checkout session
 */
export const createCheckoutSessionSchema = z.object({
    items: z.array(checkoutItemSchema).min(1, 'At least one item is required').max(10, 'Maximum 10 items allowed'),
    metadata: z.record(z.string(), z.string()).optional(),
})

/**
 * Validation schema for enrollment
 */
export const createEnrollmentSchema = z.object({
    item_type: z.enum(['course', 'workshop', 'test']),
    item_id: z.string().uuid(),
    payment_id: z.string().optional(),
    amount_paid: z.number().min(0).optional(),
})

export type CheckoutItem = z.infer<typeof checkoutItemSchema>
export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>
