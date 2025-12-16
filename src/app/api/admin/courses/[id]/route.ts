import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CourseService } from '@/services/course.service'
import { requireInstructorOrAdmin, canManageResource } from '@/lib/auth/roles'
import { handleApiError, validateRequest, AppError } from '@/lib/errors'
import { updateCourseSchema } from '@/lib/validations/course.schema'

/**
 * GET /api/admin/courses/[id]
 * Get a single course by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const courseService = new CourseService(supabase)
        const { id } = await params

        const course = await courseService.getById(id)

        return NextResponse.json({ course })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * PUT /api/admin/courses/[id]
 * Update a course
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const courseService = new CourseService(supabase)
        const { id } = await params

        // Get existing course to check ownership
        const existingCourse = await courseService.getById(id)

        // Check if user can manage this resource
        const canManage = await canManageResource(existingCourse.instructor_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to edit this course')
        }

        const body = await validateRequest(request, updateCourseSchema)

        const course = await courseService.update(id, body)

        return NextResponse.json({ course })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * DELETE /api/admin/courses/[id]
 * Delete a course
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const courseService = new CourseService(supabase)
        const { id } = await params

        // Get existing course to check ownership
        const existingCourse = await courseService.getById(id)

        // Check if user can manage this resource
        const canManage = await canManageResource(existingCourse.instructor_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to delete this course')
        }

        await courseService.delete(id)

        return NextResponse.json({ success: true })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * PATCH /api/admin/courses/[id]/publish
 * Toggle publish status
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const courseService = new CourseService(supabase)
        const { id } = await params

        // Get existing course to check ownership
        const existingCourse = await courseService.getById(id)

        // Check if user can manage this resource
        const canManage = await canManageResource(existingCourse.instructor_id)
        if (!canManage) {
            throw new AppError(403, 'You do not have permission to publish this course')
        }

        const course = await courseService.togglePublish(id)

        return NextResponse.json({ course })
    } catch (error) {
        return handleApiError(error)
    }
}
