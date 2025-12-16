import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BlogService } from '@/services/blog.service'
import { requireInstructorOrAdmin, canManageResource } from '@/lib/auth/roles'
import { handleApiError, validateRequest, AppError } from '@/lib/errors'
import { updateBlogSchema, publishBlogSchema } from '@/lib/validations/blog.schema'

/**
 * GET /api/admin/blogs/[id]
 * Get a single blog by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const blogService = new BlogService(supabase)
        const { id } = await params

        const blog = await blogService.getById(id)

        return NextResponse.json({ blog })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * PUT /api/admin/blogs/[id]
 * Update a blog
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const blogService = new BlogService(supabase)
        const { id } = await params

        // Get existing blog to check ownership
        const existingBlog = await blogService.getById(id)

        // Check if user can manage this resource
        const canManage = await canManageResource(existingBlog.author_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to edit this blog')
        }

        const body = await validateRequest(request, updateBlogSchema) as any

        // If title changed, regenerate slug
        let slug = body.slug
        if (body.title && body.title !== existingBlog.title) {
            slug = await blogService.generateSlug(body.title, id)
        }

        const blog = await blogService.update(id, {
            ...(body as any),
            slug,
            published_at: body.published && !existingBlog.published
                ? new Date().toISOString()
                : existingBlog.published_at,
        })

        return NextResponse.json({ blog })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * DELETE /api/admin/blogs/[id]
 * Delete a blog
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const blogService = new BlogService(supabase)
        const { id } = await params

        // Get existing blog to check ownership
        const existingBlog = await blogService.getById(id)

        // Check if user can manage this resource
        const canManage = await canManageResource(existingBlog.author_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to delete this blog')
        }

        await blogService.delete(id)

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * PATCH /api/admin/blogs/[id]/publish
 * Toggle publish status
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const blogService = new BlogService(supabase)
        const { id } = await params

        // Get existing blog to check ownership
        const existingBlog = await blogService.getById(id)

        // Check if user can manage this resource
        const canManage = await canManageResource(existingBlog.author_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to publish this blog')
        }

        const blog = await blogService.togglePublish(id)

        return NextResponse.json({ blog })
    } catch (error) {
        return handleApiError(error)
    }
}
