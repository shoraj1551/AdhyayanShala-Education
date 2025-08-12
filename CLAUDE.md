# Claude Development Guide

This file contains essential information for Claude Code to effectively work with this Next.js portfolio project.

## Project Overview

**Shoraj Tomer Portfolio** - A modern, full-stack personal portfolio website built with Next.js 14+, featuring:
- Personal branding and content showcase
- Educational platform with courses, workshops, stories, and tests
- E-commerce functionality with Stripe integration
- User authentication and dashboard
- Comprehensive admin panel/CMS
- YouTube channel integration

## Tech Stack

### Core Technologies
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Deployment**: Vercel

### Dependencies
```json
{
  "next": "15.4.6",
  "react": "19.1.0",
  "typescript": "^5",
  "@supabase/supabase-js": "^2.54.0",
  "@supabase/ssr": "^0.6.1",
  "stripe": "^18.4.0",
  "@stripe/stripe-js": "^7.8.0",
  "tailwindcss": "^4",
  "@radix-ui/*": "various versions"
}
```

## Development Commands

Always run these commands when making significant changes:

```bash
# Development
npm run dev              # Start development server

# Quality Checks
npm run lint             # ESLint code quality check  
npm run type-check       # TypeScript compilation check

# Production
npm run build            # Build for production
npm run start            # Start production server
```

## Project Structure

```
src/
├── app/                 # App Router pages
│   ├── (auth)/         # Authentication pages
│   ├── admin/          # Admin panel & CMS
│   ├── api/            # API routes
│   ├── dashboard/      # User dashboard
│   └── [pages]/        # Public pages
├── components/         # Reusable components
│   ├── ui/            # Shadcn/ui components
│   ├── auth/          # Auth-related components
│   └── providers/     # Context providers
├── lib/               # Utilities and configurations
│   ├── supabase/      # Database client configs
│   └── stripe.ts      # Stripe configuration
└── types/             # TypeScript type definitions
```

## Key Features & Pages

### Public Pages
- **Homepage** (`/`) - Hero, features, testimonials
- **About** (`/about`) - Personal story and background
- **Blog** (`/blog`) - Technical articles and insights
- **Stories** (`/stories`) - Personal narratives by genre
- **Courses** (`/courses`) - Educational courses with enrollment
- **Workshops** (`/workshops`) - Live training sessions
- **Tests** (`/tests`) - Skill assessments and quizzes
- **Readings** (`/readings`) - Book recommendations
- **YouTube** (`/youtube`) - Channel integration and videos

### Authentication System
- **Sign In** (`/signin`) - User login
- **Sign Up** (`/signup`) - User registration  
- **Protected Routes** - Route guards for authenticated content
- **Admin Routes** - Email-based admin access control

### User Dashboard
- **Dashboard** (`/dashboard`) - Personal overview and progress
- **Profile** (`/dashboard/profile`) - Profile management
- **Settings** (`/dashboard/settings`) - Account preferences

### Admin Panel (CMS)
- **Admin Dashboard** (`/admin`) - Analytics and overview
- **User Management** (`/admin/users`) - User administration
- **Content Management**:
  - **Blogs** (`/admin/content/blogs`) - Blog post management
  - **Stories** (`/admin/content/stories`) - Story management
  - **Courses** (`/admin/content/courses`) - Course administration
  - **Workshops** (`/admin/content/workshops`) - Workshop management
  - **Tests** (`/admin/content/tests`) - Test/quiz management
- **Analytics** (`/admin/analytics`) - Performance metrics

### E-commerce Integration
- **Stripe Checkout** - Payment processing for courses/workshops
- **Shopping Cart** - Cart state management
- **Webhooks** (`/api/webhooks/stripe`) - Payment event handling
- **Success/Cancel** pages - Post-payment user experience

## Authentication & Authorization

### User Authentication
- Powered by Supabase Auth
- Email/password authentication
- Automatic profile creation on signup
- Protected routes using middleware

### Admin Access Control
- Email-based admin identification
- Admin emails configured via `ADMIN_EMAILS` environment variable
- Admin-only routes protected by `AdminRoute` component
- Hierarchical access levels

```typescript
// Admin emails check
const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
const isAdmin = adminEmails.includes(user.email)
```

## Database Schema

### Core Tables
- **profiles** - User profile information
- **blogs** - Blog posts and articles
- **stories** - Personal stories and narratives
- **courses** - Educational course content
- **workshops** - Workshop/event information  
- **tests** - Assessments and quizzes
- **enrollments** - Course/workshop registrations
- **test_attempts** - Test completion records

### Row Level Security (RLS)
All tables implement RLS policies for data protection:
- Public content visible to all when published
- Private content restricted to owners/admins
- User profiles self-manageable

## Payment Integration

### Stripe Configuration
- Products: Courses and workshops
- Payment processing via Stripe Checkout
- Webhook handling for payment events
- Enrollment creation on successful payments

### Payment Flow
1. User selects course/workshop
2. Add to cart with localStorage persistence  
3. Proceed to Stripe Checkout
4. Webhook processes payment events
5. Enrollment record created in database
6. User redirected to success page

## Environment Variables

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Admin
ADMIN_EMAILS=email1@example.com,email2@example.com

# Optional
NEXT_PUBLIC_SITE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
```

## Common Development Tasks

### Adding New Content Types
1. Create database table with proper RLS policies
2. Add TypeScript types in `src/types/index.ts`
3. Create admin management pages (`/admin/content/[type]`)
4. Add public display pages
5. Update navigation and routing

### Creating Admin Pages
- Use `AdminRoute` wrapper for protection
- Follow established patterns from existing admin pages
- Include search, filtering, and pagination
- Add CRUD operations with proper error handling

### Database Operations
- Use Supabase client (`createClient()`)
- Implement proper error handling
- Follow RLS policies for data access
- Use TypeScript types for type safety

### UI Components
- Use Shadcn/ui components from `src/components/ui/`
- Follow Tailwind CSS utility-first approach
- Maintain consistent spacing and styling
- Implement responsive design patterns

## Testing & Quality Assurance

### Code Quality
- Run `npm run lint` before committing
- Fix TypeScript errors with `npm run type-check`
- Follow ESLint rules and best practices
- Use meaningful variable and function names

### Testing Checklist
- Test authentication flows (login/logout/signup)
- Verify admin access controls
- Test payment integration with Stripe test mode
- Check responsive design across devices
- Validate form submissions and error handling

## Deployment & Production

### Vercel Deployment
- Automatic deployments from main branch
- Environment variables configured in Vercel dashboard
- Build command: `npm run build`
- Install command: `npm install`

### Database Migrations
- Use Supabase SQL editor for schema changes
- Run migrations in staging before production
- Update TypeScript types after schema changes

### Monitoring
- Monitor Vercel deployment logs
- Check Supabase database metrics
- Review Stripe webhook logs
- Track application performance

## Troubleshooting

### Common Issues
1. **TypeScript Errors**: Run `npm run type-check` and fix type issues
2. **Supabase Connection**: Verify environment variables and database connection
3. **Stripe Webhooks**: Check webhook endpoint and secret configuration
4. **Admin Access**: Verify email in `ADMIN_EMAILS` environment variable
5. **Build Failures**: Check for missing dependencies or TypeScript errors

### Debug Steps
1. Check browser console for client-side errors
2. Review Vercel function logs for server-side issues
3. Verify environment variables are set correctly
4. Test database queries in Supabase SQL editor
5. Use Stripe CLI for webhook testing

## Code Patterns & Best Practices

### Component Structure
```typescript
"use client" // For client components

import { useState, useEffect } from "react"
import { ComponentProps } from "@/types"
import { Button } from "@/components/ui/button"

export default function Component({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState()
  
  // Component logic
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Component JSX */}
    </div>
  )
}
```

### Database Queries
```typescript
const supabase = createClient()

const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value)
  .single()

if (error) {
  console.error('Error:', error.message)
  return
}
```

### Error Handling
```typescript
try {
  // Risky operation
  const result = await riskyOperation()
  setSuccess("Operation completed successfully")
} catch (error) {
  setError("An error occurred. Please try again.")
  console.error("Operation failed:", error)
}
```

This guide should help Claude Code understand the project structure and development patterns for effective collaboration.