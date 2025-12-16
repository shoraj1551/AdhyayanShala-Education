import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TestService } from '@/services/test.service'
import { requireInstructorOrAdmin } from '@/lib/auth/roles'
import { handleApiError, validateRequest } from '@/lib/errors'
import { createTestSchema } from '@/lib/validations/test.schema'

/**
 * GET /api/admin/tests
 */
export async function GET(request: NextRequest) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const testService = new TestService(supabase)

        const { searchParams } = new URL(request.url)
        const authorId = searchParams.get('authorId')

        let tests

        if (authorId) {
            tests = await testService.getByAuthor(authorId, true)
        } else {
            tests = await testService.getAll()
        }

        return NextResponse.json({ tests })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * POST /api/admin/tests
 */
export async function POST(request: NextRequest) {
    try {
        await requireInstructorOrAdmin()

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await validateRequest(request, createTestSchema)
        const testService = new TestService(supabase)

        const test = await testService.create({
            ...(body as any),
            author_id: user.id,
            attempts_count: 0,
        })

        return NextResponse.json({ test }, { status: 201 })
    } catch (error) {
        return handleApiError(error)
    }
}
