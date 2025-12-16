import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WorkshopService } from '@/services/workshop.service'
import { requireInstructorOrAdmin } from '@/lib/auth/roles'
import { handleApiError, validateRequest } from '@/lib/errors'
import { createWorkshopSchema } from '@/lib/validations/workshop.schema'

/**
 * GET /api/admin/workshops
 * Get all workshops (admin/instructor view)
 */
export async function GET(request: NextRequest) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const workshopService = new WorkshopService(supabase)

        const { searchParams } = new URL(request.url)
        const instructorId = searchParams.get('instructorId')

        let workshops

        if (instructorId) {
            workshops = await workshopService.getByInstructor(instructorId, true)
        } else {
            workshops = await workshopService.getAll()
        }

        return NextResponse.json({ workshops })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * POST /api/admin/workshops
 * Create a new workshop
 */
export async function POST(request: NextRequest) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await validateRequest(request, createWorkshopSchema)
        const workshopService = new WorkshopService(supabase)

        const workshop = await workshopService.create({
            ...body,
            instructor_id: user.id,
            enrolled_count: 0,
        })

        return NextResponse.json({ workshop }, { status: 201 })
    } catch (error) {
        return handleApiError(error)
    }
}
