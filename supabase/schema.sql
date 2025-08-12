-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  social_links jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles RLS policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Categories table for organizing content
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  description text,
  color text default '#6B7280',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on categories
alter table public.categories enable row level security;

-- Categories are viewable by everyone
create policy "Categories are viewable by everyone" on public.categories
  for select using (true);

-- Only admin can manage categories (we'll implement admin check later)
create policy "Only admin can manage categories" on public.categories
  using (auth.uid() in (select id from public.profiles where id = auth.uid()));

-- Blogs table
create table public.blogs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  content text not null,
  excerpt text,
  featured_image text,
  category_id uuid references public.categories(id),
  tags text[] default array[]::text[],
  published boolean default false,
  published_at timestamp with time zone,
  views_count integer default 0,
  likes_count integer default 0,
  author_id uuid references public.profiles(id) default auth.uid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on blogs
alter table public.blogs enable row level security;

-- Blog RLS policies
create policy "Published blogs are viewable by everyone" on public.blogs
  for select using (published = true);

create policy "Authors can view their own blogs" on public.blogs
  for select using (auth.uid() = author_id);

create policy "Authors can insert their own blogs" on public.blogs
  for insert with check (auth.uid() = author_id);

create policy "Authors can update their own blogs" on public.blogs
  for update using (auth.uid() = author_id);

-- Stories table
create table public.stories (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  excerpt text,
  genre text,
  featured_image text,
  read_time integer, -- in minutes
  is_premium boolean default false,
  published boolean default false,
  views_count integer default 0,
  likes_count integer default 0,
  author_id uuid references public.profiles(id) default auth.uid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on stories
alter table public.stories enable row level security;

-- Story RLS policies
create policy "Published stories are viewable by everyone" on public.stories
  for select using (published = true);

create policy "Authors can view their own stories" on public.stories
  for select using (auth.uid() = author_id);

create policy "Authors can manage their own stories" on public.stories
  for all using (auth.uid() = author_id);

-- Courses table
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  short_description text,
  price decimal(10,2) not null default 0,
  duration_hours integer,
  level text check (level in ('beginner', 'intermediate', 'advanced')),
  thumbnail_url text,
  preview_video_url text,
  modules jsonb default '[]',
  requirements text[] default array[]::text[],
  what_you_learn text[] default array[]::text[],
  is_published boolean default false,
  enrollment_count integer default 0,
  rating_average decimal(3,2) default 0,
  rating_count integer default 0,
  instructor_id uuid references public.profiles(id) default auth.uid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on courses
alter table public.courses enable row level security;

-- Course RLS policies
create policy "Published courses are viewable by everyone" on public.courses
  for select using (is_published = true);

create policy "Instructors can manage their own courses" on public.courses
  for all using (auth.uid() = instructor_id);

-- Workshops table
create table public.workshops (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  short_description text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  duration_hours integer,
  price decimal(10,2) not null default 0,
  capacity integer not null,
  enrolled_count integer default 0,
  location text,
  is_online boolean default false,
  meeting_link text,
  thumbnail_url text,
  requirements text[] default array[]::text[],
  what_you_learn text[] default array[]::text[],
  is_published boolean default false,
  instructor_id uuid references public.profiles(id) default auth.uid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on workshops
alter table public.workshops enable row level security;

-- Workshop RLS policies
create policy "Published workshops are viewable by everyone" on public.workshops
  for select using (is_published = true);

create policy "Instructors can manage their own workshops" on public.workshops
  for all using (auth.uid() = instructor_id);

-- Tests table
create table public.tests (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category_id uuid references public.categories(id),
  questions jsonb not null default '[]',
  price decimal(10,2) not null default 0,
  duration_minutes integer not null,
  passing_score integer default 70,
  max_attempts integer default 3,
  is_published boolean default false,
  attempts_count integer default 0,
  author_id uuid references public.profiles(id) default auth.uid(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on tests
alter table public.tests enable row level security;

-- Test RLS policies
create policy "Published tests are viewable by everyone" on public.tests
  for select using (is_published = true);

create policy "Authors can manage their own tests" on public.tests
  for all using (auth.uid() = author_id);

-- Enrollments table (for courses, workshops, tests)
create table public.enrollments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  item_type text not null check (item_type in ('course', 'workshop', 'test')),
  item_id uuid not null,
  payment_status text not null check (payment_status in ('pending', 'completed', 'failed', 'refunded')) default 'pending',
  payment_id text,
  amount_paid decimal(10,2),
  progress jsonb default '{}',
  completed_at timestamp with time zone,
  enrolled_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on enrollments
alter table public.enrollments enable row level security;

-- Enrollment RLS policies
create policy "Users can view their own enrollments" on public.enrollments
  for select using (auth.uid() = user_id);

create policy "Users can insert their own enrollments" on public.enrollments
  for insert with check (auth.uid() = user_id);

-- Readings table
create table public.readings (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  author text,
  category_id uuid references public.categories(id),
  description text,
  cover_url text,
  purchase_link text,
  rating decimal(3,2),
  review text,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on readings
alter table public.readings enable row level security;

-- Readings are viewable by everyone
create policy "Readings are viewable by everyone" on public.readings
  for select using (true);

-- YouTube videos table (for integration)
create table public.youtube_videos (
  id uuid default uuid_generate_v4() primary key,
  youtube_id text not null unique,
  title text not null,
  description text,
  thumbnail_url text,
  duration text,
  published_at timestamp with time zone,
  category_id uuid references public.categories(id),
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on youtube_videos
alter table public.youtube_videos enable row level security;

-- YouTube videos are viewable by everyone
create policy "YouTube videos are viewable by everyone" on public.youtube_videos
  for select using (true);

-- Test results table
create table public.test_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  test_id uuid references public.tests(id) not null,
  answers jsonb not null,
  score integer not null,
  passed boolean not null,
  time_taken_minutes integer,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on test_results
alter table public.test_results enable row level security;

-- Test results RLS policies
create policy "Users can view their own test results" on public.test_results
  for select using (auth.uid() = user_id);

create policy "Users can insert their own test results" on public.test_results
  for insert with check (auth.uid() = user_id);

-- Comments table (for blogs)
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  blog_id uuid references public.blogs(id) on delete cascade,
  author_id uuid references public.profiles(id),
  parent_id uuid references public.comments(id),
  is_approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on comments
alter table public.comments enable row level security;

-- Comment RLS policies
create policy "Approved comments are viewable by everyone" on public.comments
  for select using (is_approved = true);

create policy "Users can insert comments" on public.comments
  for insert with check (auth.uid() = author_id);

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.blogs
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.stories
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.courses
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.workshops
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.tests
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.readings
  for each row execute procedure public.handle_updated_at();