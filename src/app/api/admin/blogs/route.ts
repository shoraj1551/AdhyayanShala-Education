import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BlogService } from '@/services/blog.service'
import { requireInstructorOrAdmin } from '@/lib/auth/roles'
import { handleApiError, validateRequest } from '@/lib/errors'
import { createBlogSchema, updateBlogSchema } from '@/lib/validations/blog.schema'

/**
 * GET /api/admin/blogs
 * Get all blogs (admin view)
 */
export async function GET(request: NextRequest) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const blogService = new BlogService(supabase)

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const authorId = searchParams.get('authorId')

        let blogs

        if (authorId) {
            blogs = await blogService.getByAuthor(authorId, true)
            return NextResponse.json({ blogs })
        } else {
            blogs = await blogService.getAll()
            return NextResponse.json({ blogs })
        }
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * POST /api/admin/blogs
 * Create a new blog
 */
export async function POST(request: NextRequest) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await validateRequest(request, createBlogSchema) as any
        const blogService = new BlogService(supabase)

        // Generate unique slug
        let slug = body.slug
        if (!slug) {
            slug = await blogService.generateSlug(body.title)
        }

        const blog = await blogService.create({
            ...(body as any),
            slug,
            author_id: user.id,
            views_count: 0,
            likes_count: 0,
            published_at: body.published ? new Date().toISOString() : null,
        })

        return NextResponse.json({ blog }, { status: 201 })
    } catch (error) {
        return handleApiError(error)
    }
}
