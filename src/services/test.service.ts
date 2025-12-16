import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './base.service'
import { Test } from '@/types'
import { AppError } from '@/lib/errors'

export class TestService extends BaseService<Test> {
    constructor(supabase: SupabaseClient) {
        super(supabase, 'tests')
    }

    /**
     * Get published tests with pagination
     */
    async getPublished(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit

            const { data, error, count } = await this.supabase
                .from(this.tableName)
                .select('*, author:profiles(*), category:categories(*)', { count: 'exact' })
                .eq('is_published', true)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (error) throw error

            return {
                tests: data as Test[],
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            }
        } catch (error) {
            console.error('Error fetching published tests:', error)
            throw new AppError(500, 'Failed to fetch published tests')
        }
    }

    /**
     * Get tests by author
     */
    async getByAuthor(authorId: string, includeUnpublished = false) {
        try {
            let query = this.supabase
                .from(this.tableName)
                .select('*, category:categories(*)')
                .eq('author_id', authorId)
                .order('created_at', { ascending: false })

            if (!includeUnpublished) {
                query = query.eq('is_published', true)
            }

            const { data, error } = await query

            if (error) throw error
            return data as Test[]
        } catch (error) {
            console.error('Error fetching tests by author:', error)
            throw new AppError(500, 'Failed to fetch tests by author')
        }
    }

    /**
     * Get test attempts count
     */
    async getAttemptsCount(testId: string, userId: string): Promise<number> {
        try {
            const { count, error } = await this.supabase
                .from('test_results')
                .select('*', { count: 'exact', head: true })
                .eq('test_id', testId)
                .eq('user_id', userId)

            if (error) throw error
            return count || 0
        } catch (error) {
            console.error('Error getting attempts count:', error)
            return 0
        }
    }

    /**
     * Toggle publish status
     */
    async togglePublish(id: string) {
        try {
            const test = await this.getById(id)
            const newStatus = !test.is_published

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update({ is_published: newStatus })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data as Test
        } catch (error) {
            console.error('Error toggling publish status:', error)
            throw new AppError(500, 'Failed to toggle publish status')
        }
    }
}
