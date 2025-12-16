import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/roles'
import { handleApiError } from '@/lib/errors'

/**
 * GET /api/admin/analytics
 * Get analytics data for admin dashboard
 */
export async function GET(request: NextRequest) {
    try {
        await requireAdmin()

        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '30' // days

        // Calculate date range
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - parseInt(period))

        // Revenue metrics
        const { data: enrollments } = await supabase
            .from('enrollments')
            .select('amount_paid, enrolled_at, payment_status')
            .eq('payment_status', 'completed')
            .gte('enrolled_at', startDate.toISOString())

        const totalRevenue = enrollments?.reduce((sum, e) => sum + (e.amount_paid || 0), 0) || 0
        const totalEnrollments = enrollments?.length || 0

        // Content statistics
        const { count: totalCourses } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true)

        const { count: totalWorkshops } = await supabase
            .from('workshops')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true)

        const { count: totalBlogs } = await supabase
            .from('blogs')
            .select('*', { count: 'exact', head: true })
            .eq('published', true)

        const { count: totalTests } = await supabase
            .from('tests')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true)

        // User statistics
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        const { count: instructorCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'instructor')

        // Top performing content
        const { data: topCourses } = await supabase
            .from('courses')
            .select('id, title, enrollment_count, price')
            .eq('is_published', true)
            .order('enrollment_count', { ascending: false })
            .limit(5)

        const { data: topBlogs } = await supabase
            .from('blogs')
            .select('id, title, views_count, likes_count')
            .eq('published', true)
            .order('views_count', { ascending: false })
            .limit(5)

        // Recent enrollments
        const { data: recentEnrollments } = await supabase
            .from('enrollments')
            .select(`
                id,
                enrolled_at,
                amount_paid,
                item_type,
                user:profiles(full_name, email)
            `)
            .eq('payment_status', 'completed')
            .order('enrolled_at', { ascending: false })
            .limit(10)

        // Revenue by item type
        const revenueByType = enrollments?.reduce((acc, e: any) => {
            const type = e.item_type || 'unknown'
            acc[type] = (acc[type] || 0) + (e.amount_paid || 0)
            return acc
        }, {} as Record<string, number>)

        return NextResponse.json({
            overview: {
                totalRevenue,
                totalEnrollments,
                totalUsers: totalUsers || 0,
                instructorCount: instructorCount || 0,
            },
            content: {
                totalCourses: totalCourses || 0,
                totalWorkshops: totalWorkshops || 0,
                totalBlogs: totalBlogs || 0,
                totalTests: totalTests || 0,
            },
            topPerforming: {
                courses: topCourses || [],
                blogs: topBlogs || [],
            },
            recentActivity: {
                enrollments: recentEnrollments || [],
            },
            revenueByType: revenueByType || {},
        })
    } catch (error) {
        return handleApiError(error)
    }
}
