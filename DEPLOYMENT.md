# Deployment Guide - Shoraj Tomer Portfolio

This guide covers deploying your Next.js portfolio to Vercel with Supabase and Stripe integration.

## Prerequisites

- Node.js 18+ installed
- Vercel account
- Supabase account
- Stripe account
- Domain name (optional)

## Environment Variables

Create the following environment variables in your deployment platform:

### Required Environment Variables

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_nextauth_secret_key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Admin Configuration
ADMIN_EMAILS=your-email@example.com,another-admin@example.com

# Optional
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 1. Supabase Setup

### Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create blogs table
CREATE TABLE public.blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category_id UUID,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  featured_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on blogs
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Blog policies
CREATE POLICY "Published blogs are viewable by everyone." ON public.blogs FOR SELECT USING (published = true OR auth.uid() = author_id);
CREATE POLICY "Authors can insert their own blogs." ON public.blogs FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their own blogs." ON public.blogs FOR UPDATE USING (auth.uid() = author_id);

-- Create stories table
CREATE TABLE public.stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  genre TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  featured_image TEXT,
  reading_time INTEGER DEFAULT 5,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on stories
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Create courses table
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  full_description TEXT NOT NULL,
  category TEXT,
  level TEXT DEFAULT 'Beginner',
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  duration_hours INTEGER NOT NULL,
  lessons_count INTEGER NOT NULL,
  requirements TEXT[],
  learning_outcomes TEXT[],
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  thumbnail_url TEXT,
  intro_video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create workshops table
CREATE TABLE public.workshops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  full_description TEXT NOT NULL,
  category TEXT,
  type TEXT DEFAULT 'Online',
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  duration_hours INTEGER NOT NULL,
  max_attendees INTEGER NOT NULL,
  current_attendees INTEGER DEFAULT 0,
  location TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  requirements TEXT[],
  learning_outcomes TEXT[],
  agenda TEXT[],
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  thumbnail_url TEXT,
  meeting_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tests table
CREATE TABLE public.tests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  instructions TEXT,
  category TEXT,
  difficulty TEXT DEFAULT 'Beginner',
  type TEXT DEFAULT 'quiz',
  time_limit_minutes INTEGER NOT NULL,
  passing_score INTEGER NOT NULL,
  max_attempts INTEGER DEFAULT 3,
  show_results_immediately BOOLEAN DEFAULT true,
  shuffle_questions BOOLEAN DEFAULT false,
  questions JSONB NOT NULL,
  tags TEXT[],
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create enrollments table
CREATE TABLE public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10,2),
  UNIQUE(user_id, course_id),
  UNIQUE(user_id, workshop_id)
);

-- Create test_attempts table
CREATE TABLE public.test_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create function to handle user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update function for profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.stories FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workshops FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.tests FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
```

### Authentication Settings

In your Supabase dashboard:

1. Go to Authentication > Settings
2. Configure Site URL: `https://yourdomain.com`
3. Add Redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

## 2. Stripe Setup

### Webhook Configuration

1. Go to Stripe Dashboard > Webhooks
2. Create a new endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### Product Setup

Create products in Stripe dashboard for your courses and workshops, or use the API integration in the application.

## 3. Vercel Deployment

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set install command: `npm install`
5. Deploy!

### Custom Domain (Optional)

1. Go to Vercel dashboard > Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SITE_URL`

## 4. Post-Deployment Configuration

### Admin Access

1. Sign up through your deployed application
2. Add your email to the `ADMIN_EMAILS` environment variable
3. Redeploy to apply admin access

### Email Configuration (Optional)

Configure email templates in Supabase:
1. Go to Authentication > Email Templates
2. Customize welcome, password reset, and other templates

### Monitoring

Set up monitoring:
1. Vercel Analytics (built-in)
2. Supabase logs and metrics
3. Stripe webhook monitoring

## 5. Maintenance

### Regular Tasks

- Monitor Supabase usage and upgrade plan if needed
- Review Stripe webhook logs for failed payments
- Update dependencies regularly
- Backup database periodically
- Monitor application performance in Vercel

### Scaling Considerations

- **Database**: Upgrade Supabase plan for higher limits
- **CDN**: Use Vercel's edge network (automatic)
- **File Storage**: Integrate Supabase Storage for user uploads
- **Email**: Integrate with SendGrid or similar for transactional emails

## 6. Security Best Practices

- Keep all secrets secure and rotate regularly
- Use Row Level Security (RLS) in Supabase
- Implement rate limiting for API routes
- Enable HTTPS only (forced by Vercel)
- Regular security audits of dependencies

## Support

For deployment issues:
- Check Vercel deployment logs
- Review Supabase logs
- Verify environment variables
- Test webhook endpoints with Stripe CLI

Remember to test thoroughly in a staging environment before deploying to production.