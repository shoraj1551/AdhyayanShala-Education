import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WorkshopService } from '@/services/workshop.service'
import { requireInstructorOrAdmin, canManageResource } from '@/lib/auth/roles'
import { handleApiError, validateRequest, AppError } from '@/lib/errors'
import { updateWorkshopSchema } from '@/lib/validations/workshop.schema'

/**
 * GET /api/admin/workshops/[id]
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const workshopService = new WorkshopService(supabase)
        const { id } = await params

        const workshop = await workshopService.getById(id)

        return NextResponse.json({ workshop })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * PUT /api/admin/workshops/[id]
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const workshopService = new WorkshopService(supabase)
        const { id } = await params

        const existingWorkshop = await workshopService.getById(id)

        const canManage = await canManageResource(existingWorkshop.instructor_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to edit this workshop')
        }

        const body = await validateRequest(request, updateWorkshopSchema)

        const workshop = await workshopService.update(id, body as any)

        return NextResponse.json({ workshop })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * DELETE /api/admin/workshops/[id]
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const workshopService = new WorkshopService(supabase)
        const { id } = await params

        const existingWorkshop = await workshopService.getById(id)

        const canManage = await canManageResource(existingWorkshop.instructor_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to delete this workshop')
        }

        await workshopService.delete(id)

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * PATCH /api/admin/workshops/[id]/publish
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const workshopService = new WorkshopService(supabase)
        const { id } = await params

        const existingWorkshop = await workshopService.getById(id)

        const canManage = await canManageResource(existingWorkshop.instructor_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to publish this workshop')
        }

        const workshop = await workshopService.togglePublish(id)

        return NextResponse.json({ workshop })
    } catch (error) {
        return handleApiError(error)
    }
}
