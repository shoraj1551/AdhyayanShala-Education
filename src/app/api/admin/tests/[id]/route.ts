import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TestService } from '@/services/test.service'
import { requireInstructorOrAdmin, canManageResource } from '@/lib/auth/roles'
import { handleApiError, validateRequest, AppError } from '@/lib/errors'
import { updateTestSchema } from '@/lib/validations/test.schema'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const testService = new TestService(supabase)
        const { id } = await params

        const test = await testService.getById(id)

        return NextResponse.json({ test })
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
        const testService = new TestService(supabase)
        const { id } = await params

        const existingTest = await testService.getById(id)

        const canManage = await canManageResource(existingTest.author_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to edit this test')
        }

        const body = await validateRequest(request, updateTestSchema)

        const test = await testService.update(id, body as any)

        return NextResponse.json({ test })
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
        const testService = new TestService(supabase)
        const { id } = await params

        const existingTest = await testService.getById(id)

        const canManage = await canManageResource(existingTest.author_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to delete this test')
        }

        await testService.delete(id)

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
        const testService = new TestService(supabase)
        const { id } = await params

        const existingTest = await testService.getById(id)

        const canManage = await canManageResource(existingTest.author_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to publish this test')
        }

        const test = await testService.togglePublish(id)

        return NextResponse.json({ test })
    } catch (error) {
        return handleApiError(error)
    }
}
