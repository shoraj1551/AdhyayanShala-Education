import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StoryService } from '@/services/story.service'
import { requireInstructorOrAdmin } from '@/lib/auth/roles'
import { handleApiError, validateRequest } from '@/lib/errors'
import { createStorySchema } from '@/lib/validations/story.schema'

/**
 * GET /api/admin/stories
 */
export async function GET(request: NextRequest) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const storyService = new StoryService(supabase)

        const { searchParams } = new URL(request.url)
        const authorId = searchParams.get('authorId')

        let stories

        if (authorId) {
            stories = await storyService.getByAuthor(authorId, true)
        } else {
            stories = await storyService.getAll()
        }

        return NextResponse.json({ stories })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * POST /api/admin/stories
 */
export async function POST(request: NextRequest) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await validateRequest(request, createStorySchema)
        const storyService = new StoryService(supabase)

        const story = await storyService.create({
            ...(body as any),
            author_id: user.id,
            views_count: 0,
            likes_count: 0,
        })

        return NextResponse.json({ story }, { status: 201 })
    } catch (error) {
        return handleApiError(error)
    }
}
