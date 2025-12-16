-- Migration: Rollback RLS performance changes
-- Date: 2025-12-17
-- Description: Rollback the previous migration that created duplicate policies

-- This migration removes the duplicate policies created by migration 004
-- Run this FIRST before running the corrected migration

-- ============================================
-- PROFILES TABLE - Remove duplicates
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- ============================================
-- BLOGS TABLE - Remove duplicates
-- ============================================

DROP POLICY IF EXISTS "Authors can view their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors can insert their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors can update their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors can delete their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Anyone can view published blogs" ON public.blogs;

-- ============================================
-- COURSES TABLE - Remove duplicates
-- ============================================

DROP POLICY IF EXISTS "Instructors can view their courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can update their courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can delete their courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;

-- ============================================
-- WORKSHOPS TABLE - Remove duplicates
-- ============================================

DROP POLICY IF EXISTS "Instructors can view their workshops" ON public.workshops;
DROP POLICY IF EXISTS "Instructors can insert workshops" ON public.workshops;
DROP POLICY IF EXISTS "Instructors can update their workshops" ON public.workshops;
DROP POLICY IF EXISTS "Instructors can delete their workshops" ON public.workshops;
DROP POLICY IF EXISTS "Anyone can view published workshops" ON public.workshops;

-- ============================================
-- STORIES TABLE - Remove duplicates
-- ============================================

DROP POLICY IF EXISTS "Authors can view their stories" ON public.stories;
DROP POLICY IF EXISTS "Authors can insert stories" ON public.stories;
DROP POLICY IF EXISTS "Authors can update their stories" ON public.stories;
DROP POLICY IF EXISTS "Authors can delete their stories" ON public.stories;
DROP POLICY IF EXISTS "Anyone can view published stories" ON public.stories;

-- ============================================
-- TESTS TABLE - Remove duplicates
-- ============================================

DROP POLICY IF EXISTS "Authors can view their tests" ON public.tests;
DROP POLICY IF EXISTS "Authors can insert tests" ON public.tests;
DROP POLICY IF EXISTS "Authors can update their tests" ON public.tests;
DROP POLICY IF EXISTS "Authors can delete their tests" ON public.tests;
DROP POLICY IF EXISTS "Anyone can view published tests" ON public.tests;

-- ============================================
-- ENROLLMENTS TABLE - Remove duplicates
-- ============================================

DROP POLICY IF EXISTS "Users can view their enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can insert their enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update their enrollments" ON public.enrollments;

-- ============================================
-- TEST_RESULTS TABLE - Remove duplicates
-- ============================================

DROP POLICY IF EXISTS "Users can view their test results" ON public.test_results;
DROP POLICY IF EXISTS "Users can insert their test results" ON public.test_results;
