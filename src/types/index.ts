export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  bio?: string
  website?: string
  social_links?: Record<string, string>
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  created_at: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image?: string
  category_id?: string
  category?: Category
  tags: string[]
  published: boolean
  published_at?: string
  views_count: number
  likes_count: number
  author_id: string
  author?: User
  created_at: string
  updated_at: string
}

export interface Story {
  id: string
  title: string
  content: string
  excerpt?: string
  genre?: string
  featured_image?: string
  read_time?: number
  is_premium: boolean
  published: boolean
  views_count: number
  likes_count: number
  author_id: string
  author?: User
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description?: string
  short_description?: string
  price: number
  duration_hours?: number
  level: 'beginner' | 'intermediate' | 'advanced'
  thumbnail_url?: string
  preview_video_url?: string
  modules: Record<string, unknown>[]
  requirements: string[]
  what_you_learn: string[]
  is_published: boolean
  enrollment_count: number
  rating_average: number
  rating_count: number
  instructor_id: string
  instructor?: User
  created_at: string
  updated_at: string
}

export interface Workshop {
  id: string
  title: string
  description?: string
  short_description?: string
  start_date: string
  end_date: string
  duration_hours?: number
  price: number
  capacity: number
  enrolled_count: number
  location?: string
  is_online: boolean
  meeting_link?: string
  thumbnail_url?: string
  requirements: string[]
  what_you_learn: string[]
  is_published: boolean
  instructor_id: string
  instructor?: User
  created_at: string
  updated_at: string
}

export interface Test {
  id: string
  title: string
  description?: string
  category_id?: string
  category?: Category
  questions: Record<string, unknown>[]
  price: number
  duration_minutes: number
  passing_score: number
  max_attempts: number
  is_published: boolean
  attempts_count: number
  author_id: string
  author?: User
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  user?: User
  item_type: 'course' | 'workshop' | 'test'
  item_id: string
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_id?: string
  amount_paid?: number
  progress: Record<string, unknown>
  completed_at?: string
  enrolled_at: string
}

export interface Reading {
  id: string
  title: string
  author?: string
  category_id?: string
  category?: Category
  description?: string
  cover_url?: string
  purchase_link?: string
  rating?: number
  review?: string
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface YoutubeVideo {
  id: string
  youtube_id: string
  title: string
  description?: string
  thumbnail_url?: string
  duration?: string
  published_at?: string
  category_id?: string
  category?: Category
  is_featured: boolean
  created_at: string
}

export interface TestResult {
  id: string
  user_id: string
  user?: User
  test_id: string
  test?: Test
  answers: Record<string, unknown>
  score: number
  passed: boolean
  time_taken_minutes?: number
  completed_at: string
}

export interface Comment {
  id: string
  content: string
  blog_id: string
  blog?: Blog
  author_id?: string
  author?: User
  parent_id?: string
  parent?: Comment
  replies?: Comment[]
  is_approved: boolean
  created_at: string
}