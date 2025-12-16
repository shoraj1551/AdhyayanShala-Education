-- Migration: Fix RLS performance issues
-- Date: 2025-12-17
-- Description: Optimize RLS policies by wrapping auth.uid() in subqueries

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Recreate with optimized auth.uid()
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (id = (SELECT auth.uid()));

-- ============================================
-- BLOGS TABLE
-- ============================================

-- Drop old policies
DROP POLICY IF EXISTS "Authors can view their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors can insert their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors can update their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Authors can delete their own blogs" ON public.blogs;
DROP POLICY IF EXISTS "Anyone can view published blogs" ON public.blogs;

-- Recreate with optimized auth.uid()
CREATE POLICY "Authors can view their own blogs" ON public.blogs
  FOR SELECT
  USING (author_id = (SELECT auth.uid()));

CREATE POLICY "Authors can insert their own blogs" ON public.blogs
  FOR INSERT
  WITH CHECK (author_id = (SELECT auth.uid()));

CREATE POLICY "Authors can update their own blogs" ON public.blogs
  FOR UPDATE
  USING (author_id = (SELECT auth.uid()));

CREATE POLICY "Authors can delete their own blogs" ON public.blogs
  FOR DELETE
  USING (author_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can view published blogs" ON public.blogs
  FOR SELECT
  USING (published = true);

-- ============================================
-- COURSES TABLE
-- ============================================

DROP POLICY IF EXISTS "Instructors can view their courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can update their courses" ON public.courses;
DROP POLICY IF EXISTS "Instructors can delete their courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;

CREATE POLICY "Instructors can view their courses" ON public.courses
  FOR SELECT
  USING (instructor_id = (SELECT auth.uid()));

CREATE POLICY "Instructors can insert courses" ON public.courses
  FOR INSERT
  WITH CHECK (instructor_id = (SELECT auth.uid()));

CREATE POLICY "Instructors can update their courses" ON public.courses
  FOR UPDATE
  USING (instructor_id = (SELECT auth.uid()));

CREATE POLICY "Instructors can delete their courses" ON public.courses
  FOR DELETE
  USING (instructor_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can view published courses" ON public.courses
  FOR SELECT
  USING (is_published = true);

-- ============================================
-- WORKSHOPS TABLE
-- ============================================

DROP POLICY IF EXISTS "Instructors can view their workshops" ON public.workshops;
DROP POLICY IF EXISTS "Instructors can insert workshops" ON public.workshops;
DROP POLICY IF EXISTS "Instructors can update their workshops" ON public.workshops;
DROP POLICY IF EXISTS "Instructors can delete their workshops" ON public.workshops;
DROP POLICY IF EXISTS "Anyone can view published workshops" ON public.workshops;

CREATE POLICY "Instructors can view their workshops" ON public.workshops
  FOR SELECT
  USING (instructor_id = (SELECT auth.uid()));

CREATE POLICY "Instructors can insert workshops" ON public.workshops
  FOR INSERT
  WITH CHECK (instructor_id = (SELECT auth.uid()));

CREATE POLICY "Instructors can update their workshops" ON public.workshops
  FOR UPDATE
  USING (instructor_id = (SELECT auth.uid()));

CREATE POLICY "Instructors can delete their workshops" ON public.workshops
  FOR DELETE
  USING (instructor_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can view published workshops" ON public.workshops
  FOR SELECT
  USING (is_published = true);

-- ============================================
-- STORIES TABLE
-- ============================================

DROP POLICY IF EXISTS "Authors can view their stories" ON public.stories;
DROP POLICY IF EXISTS "Authors can insert stories" ON public.stories;
DROP POLICY IF EXISTS "Authors can update their stories" ON public.stories;
DROP POLICY IF EXISTS "Authors can delete their stories" ON public.stories;
DROP POLICY IF EXISTS "Anyone can view published stories" ON public.stories;

CREATE POLICY "Authors can view their stories" ON public.stories
  FOR SELECT
  USING (author_id = (SELECT auth.uid()));

CREATE POLICY "Authors can insert stories" ON public.stories
  FOR INSERT
  WITH CHECK (author_id = (SELECT auth.uid()));

CREATE POLICY "Authors can update their stories" ON public.stories
  FOR UPDATE
  USING (author_id = (SELECT auth.uid()));

CREATE POLICY "Authors can delete their stories" ON public.stories
  FOR DELETE
  USING (author_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can view published stories" ON public.stories
  FOR SELECT
  USING (published = true);

-- ============================================
-- TESTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Authors can view their tests" ON public.tests;
DROP POLICY IF EXISTS "Authors can insert tests" ON public.tests;
DROP POLICY IF EXISTS "Authors can update their tests" ON public.tests;
DROP POLICY IF EXISTS "Authors can delete their tests" ON public.tests;
DROP POLICY IF EXISTS "Anyone can view published tests" ON public.tests;

CREATE POLICY "Authors can view their tests" ON public.tests
  FOR SELECT
  USING (author_id = (SELECT auth.uid()));

CREATE POLICY "Authors can insert tests" ON public.tests
  FOR INSERT
  WITH CHECK (author_id = (SELECT auth.uid()));

CREATE POLICY "Authors can update their tests" ON public.tests
  FOR UPDATE
  USING (author_id = (SELECT auth.uid()));

CREATE POLICY "Authors can delete their tests" ON public.tests
  FOR DELETE
  USING (author_id = (SELECT auth.uid()));

CREATE POLICY "Anyone can view published tests" ON public.tests
  FOR SELECT
  USING (is_published = true);

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view their enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can insert their enrollments" ON public.enrollments;
DROP POLICY IF EXISTS "Users can update their enrollments" ON public.enrollments;

CREATE POLICY "Users can view their enrollments" ON public.enrollments
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their enrollments" ON public.enrollments
  FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their enrollments" ON public.enrollments
  FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

-- ============================================
-- TEST_RESULTS TABLE
-- ============================================

DROP POLICY IF EXISTS "Users can view their test results" ON public.test_results;
DROP POLICY IF EXISTS "Users can insert their test results" ON public.test_results;

CREATE POLICY "Users can view their test results" ON public.test_results
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their test results" ON public.test_results
  FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Add comments for documentation
COMMENT ON POLICY "Users can insert their own profile" ON public.profiles IS 'Optimized with subquery for auth.uid()';
COMMENT ON POLICY "Authors can view their own blogs" ON public.blogs IS 'Optimized with subquery for auth.uid()';
