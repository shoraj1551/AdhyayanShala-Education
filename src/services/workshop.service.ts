import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './base.service'
import { Workshop } from '@/types'
import { AppError } from '@/lib/errors'

export class WorkshopService extends BaseService<Workshop> {
    constructor(supabase: SupabaseClient) {
        super(supabase, 'workshops')
    }

    /**
     * Get published workshops with pagination
     */
    async getPublished(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit

            const { data, error, count } = await this.supabase
                .from(this.tableName)
                .select('*, instructor:profiles(*)', { count: 'exact' })
                .eq('is_published', true)
                .order('start_date', { ascending: true })
                .range(offset, offset + limit - 1)

            if (error) throw error

            return {
                workshops: data as Workshop[],
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            }
        } catch (error) {
            console.error('Error fetching published workshops:', error)
            throw new AppError(500, 'Failed to fetch published workshops')
        }
    }

    /**
     * Get upcoming workshops
     */
    async getUpcoming() {
        try {
            const now = new Date().toISOString()

            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*, instructor:profiles(*)')
                .eq('is_published', true)
                .gte('start_date', now)
                .order('start_date', { ascending: true })

            if (error) throw error
            return data as Workshop[]
        } catch (error) {
            console.error('Error fetching upcoming workshops:', error)
            throw new AppError(500, 'Failed to fetch upcoming workshops')
        }
    }

    /**
     * Get workshops by instructor
     */
    async getByInstructor(instructorId: string, includeUnpublished = false) {
        try {
            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .eq('instructor_id', instructorId)
                .order('start_date', { ascending: false })

            if (!includeUnpublished) {
                query = query.eq('is_published', true)
            }

            const { data, error } = await query

            if (error) throw error
            return data as Workshop[]
        } catch (error) {
            console.error('Error fetching workshops by instructor:', error)
            throw new AppError(500, 'Failed to fetch workshops by instructor')
        }
    }

    /**
     * Check if workshop is full
     */
    async isFull(workshopId: string): Promise<boolean> {
        try {
            const workshop = await this.getById(workshopId)
            const enrollmentCount = await this.getEnrollmentCount(workshopId)

            return enrollmentCount >= workshop.capacity
        } catch (error) {
            console.error('Error checking workshop capacity:', error)
            return false
        }
    }

    /**
     * Get enrollment count
     */
    async getEnrollmentCount(workshopId: string): Promise<number> {
        try {
            const { count, error } = await this.supabase
                .from('enrollments')
                .select('*', { count: 'exact', head: true })
                .eq('item_type', 'workshop')
                .eq('item_id', workshopId)
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
            const workshop = await this.getById(id)
            const newStatus = !workshop.is_published

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update({ is_published: newStatus })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data as Workshop
        } catch (error) {
            console.error('Error toggling publish status:', error)
            throw new AppError(500, 'Failed to toggle publish status')
        }
    }
}
