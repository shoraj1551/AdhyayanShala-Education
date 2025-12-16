import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/roles'
import { handleApiError, AppError } from '@/lib/errors'
import { z } from 'zod'

const updateRoleSchema = z.object({
    userId: z.string().uuid('Invalid user ID'),
    role: z.enum(['user', 'instructor', 'admin']),
})

/**
 * GET /api/admin/roles
 * Get all users with their roles
 */
export async function GET(request: NextRequest) {
    try {
        // Verify admin access
        await requireAdmin()

        const supabase = await createClient()

        // Get all profiles with roles
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, role, created_at')
            .order('created_at', { ascending: false })

        if (error) {
            throw new AppError(500, 'Failed to fetch users')
        }

        return NextResponse.json({ users: profiles })
    } catch (error) {
        return handleApiError(error)
    }
}

/**
 * PATCH /api/admin/roles
 * Update a user's role
 */
export async function PATCH(request: NextRequest) {
    try {
        // Verify admin access
        await requireAdmin()

        const body = await request.json()
        const { userId, role } = updateRoleSchema.parse(body)

        const supabase = await createClient()

        // Update user role
        const { error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId)

        if (error) {
            throw new AppError(500, 'Failed to update user role')
        }

        return NextResponse.json({
            success: true,
            message: `User role updated to ${role}`
        })
    } catch (error) {
        return handleApiError(error)
    }
}
