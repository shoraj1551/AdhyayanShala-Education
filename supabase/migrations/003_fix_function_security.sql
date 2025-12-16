-- Migration: Fix security issues with functions
-- Date: 2025-12-16
-- Description: Fix search_path security vulnerabilities in functions

-- Fix is_admin function
DROP FUNCTION IF EXISTS public.is_admin();
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Fix is_instructor_or_admin function
DROP FUNCTION IF EXISTS public.is_instructor_or_admin();
CREATE OR REPLACE FUNCTION public.is_instructor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('instructor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Fix get_user_role function
DROP FUNCTION IF EXISTS public.get_user_role();
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, auth;

-- Fix handle_updated_at function (if it exists)
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add comment for documentation
COMMENT ON FUNCTION public.is_admin IS 'Check if current user is admin - search_path secured';
COMMENT ON FUNCTION public.is_instructor_or_admin IS 'Check if current user is instructor or admin - search_path secured';
COMMENT ON FUNCTION public.get_user_role IS 'Get current user role - search_path secured';
COMMENT ON FUNCTION public.handle_updated_at IS 'Update updated_at timestamp - search_path secured';
