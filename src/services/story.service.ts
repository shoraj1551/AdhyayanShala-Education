import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './base.service'
import { Story } from '@/types'
import { AppError } from '@/lib/errors'

export class StoryService extends BaseService<Story> {
    constructor(supabase: SupabaseClient) {
        super(supabase, 'stories')
    }

    /**
     * Get published stories with pagination
     */
    async getPublished(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit

            const { data, error, count } = await this.supabase
                .from(this.tableName)
                .select('*, author:profiles(*)', { count: 'exact' })
                .eq('published', true)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (error) throw error

            return {
                stories: data as Story[],
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            }
        } catch (error) {
            console.error('Error fetching published stories:', error)
            throw new AppError(500, 'Failed to fetch published stories')
        }
    }

    /**
     * Get stories by author
     */
    async getByAuthor(authorId: string, includeUnpublished = false) {
        try {
            let query = this.supabase
                .from(this.tableName)
                .select('*')
                .eq('author_id', authorId)
                .order('created_at', { ascending: false })

            if (!includeUnpublished) {
                query = query.eq('published', true)
            }

            const { data, error } = await query

            if (error) throw error
            return data as Story[]
        } catch (error) {
            console.error('Error fetching stories by author:', error)
            throw new AppError(500, 'Failed to fetch stories by author')
        }
    }

    /**
     * Toggle publish status
     */
    async togglePublish(id: string) {
        try {
            const story = await this.getById(id)
            const newStatus = !story.published

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update({ published: newStatus })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data as Story
        } catch (error) {
            console.error('Error toggling publish status:', error)
            throw new AppError(500, 'Failed to toggle publish status')
        }
    }
}
