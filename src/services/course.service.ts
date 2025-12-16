import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './base.service'
import { Course } from '@/types'
import { AppError } from '@/lib/errors'

export class CourseService extends BaseService<Course> {
    constructor(supabase: SupabaseClient) {
        super(supabase, 'courses')
    }

    /**
     * Get published courses with pagination
     */
    async getPublished(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit

            const { data, error, count } = await this.supabase
                .from(this.tableName)
                .select('*, instructor:profiles(*)', { count: 'exact' })
                .eq('is_published', true)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (error) throw error

            return {
                courses: data as Course[],
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            }
        } catch (error) {
            console.error('Error fetching published courses:', error)
            throw new AppError(500, 'Failed to fetch published courses')
        }
    }

    /**
     * Get courses by instructor
     */
    async getByInstructor(instructorId: string, includeUnpublished = false) {
        try {
            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .eq('instructor_id', instructorId)
                .order('created_at', { ascending: false })

            if (!includeUnpublished) {
                query = query.eq('is_published', true)
            }

            const { data, error } = await query

            if (error) throw error
            return data as Course[]
        } catch (error) {
            console.error('Error fetching courses by instructor:', error)
            throw new AppError(500, 'Failed to fetch courses by instructor')
        }
    }

    /**
     * Get courses by level
     */
    async getByLevel(level: 'beginner' | 'intermediate' | 'advanced') {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*, instructor:profiles(*)')
                .eq('level', level)
                .eq('is_published', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Course[]
        } catch (error) {
            console.error('Error fetching courses by level:', error)
            throw new AppError(500, 'Failed to fetch courses by level')
        }
    }

    /**
     * Search courses
     */
    async search(query: string) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*, instructor:profiles(*)')
                .eq('is_published', true)
                .or(`title.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`)
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Course[]
        } catch (error) {
            console.error('Error searching courses:', error)
            throw new AppError(500, 'Failed to search courses')
        }
    }

    /**
     * Get enrolled students count
     */
    async getEnrollmentCount(courseId: string): Promise<number> {
        try {
            const { count, error } = await this.supabase
                .from('enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('item_type', 'course')
                .eq('item_id', courseId)
                .eq('payment_status', 'completed')

            if (error) throw error
            return count || 0
        } catch (error) {
            console.error('Error getting enrollment count:', error)
            return 0
        }
    }

    /**
     * Toggle publish status
     */
    async togglePublish(id: string) {
        try {
            const course = await this.getById(id)
            const newStatus = !course.is_published

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update({ is_published: newStatus })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data as Course
        } catch (error) {
            console.error('Error toggling publish status:', error)
            throw new AppError(500, 'Failed to toggle publish status')
        }
    }
}
