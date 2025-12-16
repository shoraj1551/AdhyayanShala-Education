import { SupabaseClient } from '@supabase/supabase-js'
import { AppError } from '@/lib/errors'

/**
 * Base service class with common CRUD operations
 */
export abstract class BaseService<T> {
    constructor(
        protected supabase: SupabaseClient,
        protected tableName: string
    ) { }

    /**
     * Get all records with optional filters
     */
    async getAll(filters?: Record<string, any>) {
        try {
            let query = this.supabase.from(this.tableName).select('*')

            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    query = query.eq(key, value)
                })
            }

            const { data, error } = await query

            if (error) throw error
            return data as T[]
        } catch (error) {
            console.error(`Error fetching ${this.tableName}:`, error)
            throw new AppError(500, `Failed to fetch ${this.tableName}`)
        }
    }

    /**
     * Get a single record by ID
     */
    async getById(id: string) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new AppError(404, `${this.tableName} not found`)
                }
                throw error
            }

            return data as T
        } catch (error) {
            if (error instanceof AppError) throw error
            console.error(`Error fetching ${this.tableName} by ID:`, error)
            throw new AppError(500, `Failed to fetch ${this.tableName}`)
        }
    }

    /**
     * Create a new record
     */
    async create(data: Partial<T>) {
        try {
            const { data: created, error } = await this.supabase
                .from(this.tableName)
                .insert(data)
                .select()
                .single()

            if (error) throw error
            return created as T
        } catch (error) {
            console.error(`Error creating ${this.tableName}:`, error)
            throw new AppError(500, `Failed to create ${this.tableName}`)
        }
    }

    /**
     * Update a record by ID
     */
    async update(id: string, data: Partial<T>) {
        try {
            const { data: updated, error } = await this.supabase
                .from(this.tableName)
                .update(data)
                .eq('id', id)
                .select()
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    throw new AppError(404, `${this.tableName} not found`)
                }
                throw error
            }

            return updated as T
        } catch (error) {
            if (error instanceof AppError) throw error
            console.error(`Error updating ${this.tableName}:`, error)
            throw new AppError(500, `Failed to update ${this.tableName}`)
        }
    }

    /**
     * Delete a record by ID
     */
    async delete(id: string) {
        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('id', id)

            if (error) throw error
            return true
        } catch (error) {
            console.error(`Error deleting ${this.tableName}:`, error)
            throw new AppError(500, `Failed to delete ${this.tableName}`)
        }
    }

    /**
     * Count records with optional filters
     */
    async count(filters?: Record<string, any>) {
        try {
            let query = this.supabase
                .from(this.tableName)
                .select('*', { count: 'exact', head: true })

            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    query = query.eq(key, value)
                })
            }

            const { count, error } = await query

            if (error) throw error
            return count || 0
        } catch (error) {
            console.error(`Error counting ${this.tableName}:`, error)
            throw new AppError(500, `Failed to count ${this.tableName}`)
        }
    }
}
