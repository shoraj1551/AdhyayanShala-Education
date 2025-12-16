import { createClient } from '@/lib/supabase/server'

/**
 * User roles in the system
 */
export enum UserRole {
  USER = 'user',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === role
  } catch (error) {
    console.error('Error checking user role:', error)
    return false
  }
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(UserRole.ADMIN)
}

/**
 * Check if the current user is an instructor or admin
 */
export async function isInstructorOrAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === UserRole.INSTRUCTOR || profile?.role === UserRole.ADMIN
  } catch (error) {
    console.error('Error checking user role:', error)
    return false
  }
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return (profile?.role as UserRole) || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
}

/**
 * Require instructor or admin role - throws error if neither
 */
export async function requireInstructorOrAdmin(): Promise<void> {
  const authorized = await isInstructorOrAdmin()
  if (!authorized) {
    throw new Error('Unauthorized: Instructor or Admin access required')
  }
}

/**
 * Check if user owns a resource or is admin
 */
export async function canManageResource(resourceOwnerId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    // User owns the resource
    if (user.id === resourceOwnerId) return true

    // Check if user is admin
    return await isAdmin()
  } catch (error) {
    console.error('Error checking resource access:', error)
    return false
  }
}
