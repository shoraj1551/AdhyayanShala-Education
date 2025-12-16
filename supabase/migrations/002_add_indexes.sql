-- Migration: Add database indexes for performance
-- Date: 2025-12-16
-- Description: Adds indexes to foreign keys and frequently queried columns

-- Indexes for blogs table
CREATE INDEX IF NOT EXISTS idx_blogs_category_id ON public.blogs(category_id);
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON public.blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON public.blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON public.blogs(published_at DESC) WHERE published = true;

-- Indexes for stories table
CREATE INDEX IF NOT EXISTS idx_stories_author_id ON public.stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_published ON public.stories(published);
CREATE INDEX IF NOT EXISTS idx_stories_premium ON public.stories(is_premium);

-- Indexes for courses table
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_level ON public.courses(level);

-- Indexes for workshops table
CREATE INDEX IF NOT EXISTS idx_workshops_instructor_id ON public.workshops(instructor_id);
CREATE INDEX IF NOT EXISTS idx_workshops_published ON public.workshops(is_published);
CREATE INDEX IF NOT EXISTS idx_workshops_start_date ON public.workshops(start_date);
CREATE INDEX IF NOT EXISTS idx_workshops_online ON public.workshops(is_online);

-- Indexes for tests table
CREATE INDEX IF NOT EXISTS idx_tests_author_id ON public.tests(author_id);
CREATE INDEX IF NOT EXISTS idx_tests_category_id ON public.tests(category_id);
CREATE INDEX IF NOT EXISTS idx_tests_published ON public.tests(is_published);

-- Indexes for enrollments table
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_item_type ON public.enrollments(item_type);
CREATE INDEX IF NOT EXISTS idx_enrollments_item_id ON public.enrollments(item_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_status ON public.enrollments(payment_status);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_id ON public.enrollments(payment_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_item_lookup ON public.enrollments(item_type, item_id);

-- Indexes for comments table
CREATE INDEX IF NOT EXISTS idx_comments_blog_id ON public.comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON public.comments(is_approved);

-- Indexes for test_results table
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON public.test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON public.test_results(test_id);
CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON public.test_results(completed_at DESC);

-- Indexes for readings table
CREATE INDEX IF NOT EXISTS idx_readings_category_id ON public.readings(category_id);
CREATE INDEX IF NOT EXISTS idx_readings_featured ON public.readings(is_featured);

-- Indexes for youtube_videos table
CREATE INDEX IF NOT EXISTS idx_youtube_videos_category_id ON public.youtube_videos(category_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_featured ON public.youtube_videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_youtube_id ON public.youtube_videos(youtube_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blogs_published_category ON public.blogs(published, category_id) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_courses_published_level ON public.courses(is_published, level) WHERE is_published = true;

-- Add comments for documentation
COMMENT ON INDEX idx_blogs_published_at IS 'Optimizes queries for recent published blogs';
COMMENT ON INDEX idx_enrollments_item_lookup IS 'Optimizes queries for finding enrollments by item';
