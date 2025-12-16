import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CourseService } from '@/services/course.service'
import { requireInstructorOrAdmin } from '@/lib/auth/roles'
import { handleApiError, validateRequest } from '@/lib/errors'
import { createCourseSchema } from '@/lib/validations/course.schema'

/**
 * GET /api/admin/courses
 * Get all courses (admin/instructor view)
 */
export async function GET(request: NextRequest) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const courseService = new CourseService(supabase)

        const { searchParams } = new URL(request.url)
        const instructorId = searchParams.get('instructorId')

        let courses

        if (instructorId) {
            courses = await courseService.getByInstructor(instructorId, true)
        } else {
            courses = await courseService.getAll()
        }

        return NextResponse.json({ courses })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * POST /api/admin/courses
 * Create a new course
 */
export async function POST(request: NextRequest) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await validateRequest(request, createCourseSchema)
        const courseService = new CourseService(supabase)

        const course = await courseService.create({
            ...body,
            instructor_id: user.id,
        })

        return NextResponse.json({ course }, { status: 201 })
    } catch (error) {
        return handleApiError(error)
    }
}
