-- Migration: Add role-based access control
-- Date: 2025-12-16
-- Description: Adds role column to profiles table and updates RLS policies

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' 
CHECK (role IN ('user', 'instructor', 'admin'));

-- Create index on role for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Update existing users to have 'user' role (if not already set)
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Set specific admin users (update these emails as needed)
-- Note: profiles table doesn't have email column, need to join with auth.users
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('shoraj@shorajtomer.me', 'admin@shorajtomer.me')
);

-- Drop old category policy
DROP POLICY IF EXISTS "Only admin can manage categories" ON public.categories;

-- Create new role-based category management policy
CREATE POLICY "Only admins can manage categories" ON public.categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add policy for instructors to manage their own content
CREATE POLICY "Instructors can manage their courses" ON public.courses
  FOR ALL
  USING (
    auth.uid() = instructor_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Instructors can manage their workshops" ON public.workshops
  FOR ALL
  USING (
    auth.uid() = instructor_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- Add policy for viewing enrollments (instructors can see their students)
CREATE POLICY "Instructors can view enrollments for their content" ON public.enrollments
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is instructor or admin
CREATE OR REPLACE FUNCTION public.is_instructor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.role IS 'User role: user, instructor, or admin';
