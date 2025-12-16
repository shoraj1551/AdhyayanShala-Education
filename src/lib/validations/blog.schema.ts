import { z } from 'zod'

/**
 * Validation schema for creating a new blog post
 */
export const createBlogSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
    slug: z.string().min(1, 'Slug is required').max(200, 'Slug must be less than 200 characters').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
    content: z.string().min(1, 'Content is required'),
    excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
    featured_image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    category_id: z.string().uuid('Invalid category ID').optional().nullable(),
    tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').default([]),
    published: z.boolean().default(false),
})

/**
 * Validation schema for updating a blog post
 */
export const updateBlogSchema = createBlogSchema.partial()

/**
 * Validation schema for publishing/unpublishing a blog
 */
export const publishBlogSchema = z.object({
    published: z.boolean(),
})

export type CreateBlogInput = z.infer<typeof createBlogSchema>
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>
export type PublishBlogInput = z.infer<typeof publishBlogSchema>
