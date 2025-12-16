import { SupabaseClient } from '@supabase/supabase-js'
import { BaseService } from './base.service'
import { Blog } from '@/types'
import { AppError } from '@/lib/errors'

export class BlogService extends BaseService<Blog> {
    constructor(supabase: SupabaseClient) {
        super(supabase, 'blogs')
    }

    /**
     * Get published blogs with pagination
     */
    async getPublished(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit

            const { data, error, count } = await this.supabase
                .from(this.tableName)
                .select('*, author:profiles(*), category:categories(*)', { count: 'exact' })
                .eq('published', true)
                .order('published_at', { ascending: false })
                .range(offset, offset + limit - 1)

            if (error) throw error

            return {
                blogs: data as Blog[],
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            }
        } catch (error) {
            console.error('Error fetching published blogs:', error)
            throw new AppError(500, 'Failed to fetch published blogs')
        }
    }

    /**
     * Get blogs by author
     */
    async getByAuthor(authorId: string, includeUnpublished = false) {
        try {
            let query = this.supabase
                .from(this.tableName)
                .select('*, category:categories(*)')
                .eq('author_id', authorId)
                .order('created_at', { ascending: false })

            if (!includeUnpublished) {
                query = query.eq('published', true)
            }

            const { data, error } = await query

            if (error) throw error
            return data as Blog[]
        } catch (error) {
            console.error('Error fetching blogs by author:', error)
            throw new AppError(500, 'Failed to fetch blogs by author')
        }
    }

    /**
     * Get blog by slug
     */
    async getBySlug(slug: string) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*, author:profiles(*), category:categories(*)')
                .eq('slug', slug)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new AppError(404, 'Blog not found')
                }
                throw error
            }

            return data as Blog
        } catch (error) {
            if (error instanceof AppError) throw error
            console.error('Error fetching blog by slug:', error)
            throw new AppError(500, 'Failed to fetch blog')
        }
    }

    /**
     * Search blogs
     */
    async search(query: string, filters?: { category?: string; tags?: string[] }) {
        try {
            let dbQuery = this.supabase
                .from(this.tableName)
                .select('*, author:profiles(*), category:categories(*)')
                .eq('published', true)
                .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)

            if (filters?.category) {
                dbQuery = dbQuery.eq('category_id', filters.category)
            }

            if (filters?.tags && filters.tags.length > 0) {
                dbQuery = dbQuery.contains('tags', filters.tags)
            }

            const { data, error } = await dbQuery.order('published_at', { ascending: false })

            if (error) throw error
            return data as Blog[]
        } catch (error) {
            console.error('Error searching blogs:', error)
            throw new AppError(500, 'Failed to search blogs')
        }
    }

    /**
     * Increment view count
     */
    async incrementViews(id: string) {
        try {
            const { error } = await this.supabase.rpc('increment_blog_views', { blog_id: id })
            if (error) throw error
            return true
        } catch (error) {
            console.error('Error incrementing views:', error)
            // Don't throw error for view count failures
            return false
        }
    }

    /**
     * Toggle publish status
     */
    async togglePublish(id: string) {
        try {
            const blog = await this.getById(id)
            const newStatus = !blog.published

            const { data, error } = await this.supabase
                .from(this.tableName)
                .update({
                    published: newStatus,
                    published_at: newStatus ? new Date().toISOString() : null,
                })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            return data as Blog
        } catch (error) {
            console.error('Error toggling publish status:', error)
            throw new AppError(500, 'Failed to toggle publish status')
        }
    }

    /**
     * Generate unique slug from title
     */
    async generateSlug(title: string, existingId?: string): Promise<string> {
        const baseSlug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

        let slug = baseSlug
        let counter = 1

        while (true) {
            let query = this.supabase
                .from(this.tableName)
                .select('id')
                .eq('slug', slug)

            if (existingId) {
                query = query.neq('id', existingId)
            }

            const { data } = await query

            if (!data || data.length === 0) {
                return slug
            }

            slug = `${baseSlug}-${counter}`
            counter++
        }
    }
}
