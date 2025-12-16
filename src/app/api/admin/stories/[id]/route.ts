import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { StoryService } from '@/services/story.service'
import { requireInstructorOrAdmin, canManageResource } from '@/lib/auth/roles'
import { handleApiError, validateRequest, AppError } from '@/lib/errors'
import { updateStorySchema } from '@/lib/validations/story.schema'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const storyService = new StoryService(supabase)
        const { id } = await params

        const story = await storyService.getById(id)

        return NextResponse.json({ story })
    } catch (error) {
        return handleApiError(error)
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const storyService = new StoryService(supabase)
        const { id } = await params

        const existingStory = await storyService.getById(id)

        const canManage = await canManageResource(existingStory.author_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to edit this story')
        }

        const body = await validateRequest(request, updateStorySchema)

        const story = await storyService.update(id, body as any)

        return NextResponse.json({ story })
    } catch (error) {
        return handleApiError(error)
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const storyService = new StoryService(supabase)
        const { id } = await params

        const existingStory = await storyService.getById(id)

        const canManage = await canManageResource(existingStory.author_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to delete this story')
        }

        await storyService.delete(id)

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error)
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const storyService = new StoryService(supabase)
        const { id } = await params

        const existingStory = await storyService.getById(id)

        const canManage = await canManageResource(existingStory.author_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to publish this story')
        }

        const story = await storyService.togglePublish(id)

        return NextResponse.json({ story })
    } catch (error) {
        return handleApiError(error)
    }
}
