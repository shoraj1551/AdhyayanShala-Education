# Shoraj Tomer - Personal Portfolio & Educational Platform

A modern, full-stack personal portfolio website featuring educational content, e-commerce functionality, and comprehensive content management. Built with Next.js 14+, Supabase, and Stripe.

![Portfolio Banner](https://via.placeholder.com/1200x400/0f172a/ffffff?text=Shoraj+Tomer+Portfolio)

## ✨ Features

### 🏠 Personal Branding
- **Modern Design** - Clean, responsive design with professional aesthetics
- **Personal Story** - About page with background and journey
- **Professional Showcase** - Skills, experience, and achievements
- **Contact Integration** - Easy ways to get in touch

### 📚 Educational Platform
- **Blog System** - Technical articles and insights with categories and tags
- **Story Collection** - Personal narratives organized by genres
- **Online Courses** - Comprehensive courses with video content and progress tracking
- **Interactive Workshops** - Live sessions with calendar integration and attendee management
- **Skill Assessments** - Tests and quizzes with multiple question types and scoring
- **Reading Recommendations** - Curated book suggestions with reviews

### 💳 E-commerce Integration
- **Stripe Payments** - Secure payment processing for courses and workshops
- **Shopping Cart** - Persistent cart with localStorage
- **Enrollment System** - Automatic enrollment after successful payments
- **Webhook Integration** - Real-time payment status updates

### 👤 User Management
- **Authentication** - Secure login/signup with Supabase Auth
- **User Dashboard** - Personal progress tracking and account management
- **Profile System** - Customizable user profiles
- **Progress Tracking** - Course completion and test scores

### 🛠 Admin Panel & CMS
- **Content Management** - Full CRUD operations for all content types
- **User Administration** - User management and analytics
- **Analytics Dashboard** - Revenue tracking and engagement metrics
- **Role-based Access** - Secure admin-only areas

### 🎬 Media Integration
- **YouTube Channel** - Embedded videos and channel statistics
- **Image Management** - Optimized image handling and storage
- **Video Content** - Course and workshop video integration

## 🚀 Tech Stack

### Frontend
- **[Next.js 14+](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible primitives

### Backend
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
- **[Stripe](https://stripe.com/)** - Payment processing
- **[Vercel](https://vercel.com/)** - Deployment and hosting

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Prettier** - Code formatting

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account

### Clone Repository
```bash
git clone https://github.com/yourusername/shorajtomer.me.git
cd shorajtomer.me
```

### Install Dependencies
```bash
npm install
```

### Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Admin Configuration
ADMIN_EMAILS=your-email@example.com

# Optional
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

### Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `DEPLOYMENT.md`
3. Configure authentication settings
4. Update environment variables

### Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   │   ├── signin/        # Login page
│   │   └── signup/        # Registration page
│   ├── admin/             # Admin panel
│   │   ├── analytics/     # Analytics dashboard
│   │   ├── content/       # Content management
│   │   │   ├── blogs/     # Blog management
│   │   │   ├── stories/   # Story management
│   │   │   ├── courses/   # Course management
│   │   │   ├── workshops/ # Workshop management
│   │   │   └── tests/     # Test management
│   │   └── users/         # User management
│   ├── api/               # API routes
│   │   ├── create-checkout-session/ # Stripe checkout
│   │   └── webhooks/      # Webhook handlers
│   ├── dashboard/         # User dashboard
│   │   ├── profile/       # Profile management
│   │   └── settings/      # User settings
│   ├── blog/              # Blog pages
│   ├── stories/           # Story pages
│   ├── courses/           # Course pages
│   ├── workshops/         # Workshop pages
│   ├── tests/             # Test pages
│   ├── readings/          # Reading recommendations
│   ├── youtube/           # YouTube integration
│   ├── about/             # About page
│   └── checkout/          # Payment pages
├── components/            # Reusable components
│   ├── ui/               # Shadcn/ui components
│   ├── auth/             # Authentication components
│   ├── providers/        # Context providers
│   └── layout/           # Layout components
├── lib/                  # Utility functions
│   ├── supabase/        # Database clients
│   ├── stripe.ts        # Stripe configuration
│   └── utils.ts         # Helper functions
├── types/               # TypeScript definitions
└── styles/             # Global styles
```

## 🎯 Key Pages & Features

### Public Pages
- **`/`** - Homepage with hero section and feature overview
- **`/about`** - Personal background and professional journey
- **`/blog`** - Technical articles with search and categories
- **`/stories`** - Personal narratives organized by genre
- **`/courses`** - Educational courses with detailed information
- **`/workshops`** - Live training sessions and workshops
- **`/tests`** - Skill assessments and knowledge testing
- **`/readings`** - Book recommendations and reviews
- **`/youtube`** - YouTube channel integration

### Authentication
- **`/signin`** - User login with email/password
- **`/signup`** - User registration and account creation
- Protected routes with authentication middleware

### User Dashboard
- **`/dashboard`** - Personal overview and progress tracking
- **`/dashboard/profile`** - Profile management and settings
- **`/dashboard/settings`** - Account preferences and configuration

### Admin Panel
- **`/admin`** - Admin dashboard with analytics
- **`/admin/users`** - User management and administration
- **`/admin/content/*`** - Content management for all types
- **`/admin/analytics`** - Performance metrics and insights

## 🛠 Development

### Available Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Code Quality
The project includes comprehensive code quality tools:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for consistent formatting
- **Git hooks** for pre-commit quality checks

## 📊 Analytics & Monitoring

### Built-in Analytics
- User engagement tracking
- Content performance metrics
- Revenue and enrollment analytics
- Admin dashboard with key insights

### External Integrations
- Vercel Analytics for performance monitoring
- Supabase metrics for database insights
- Stripe dashboard for payment analytics

## 🔧 Configuration

### Admin Access
Add admin email addresses to the `ADMIN_EMAILS` environment variable:
```env
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

### Payment Configuration
Configure Stripe products and pricing in the Stripe dashboard or through the admin panel.

### Content Management
All content can be managed through the admin panel at `/admin` after authentication.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

See `DEPLOYMENT.md` for detailed deployment instructions including:
- Supabase configuration
- Stripe webhook setup
- Environment variable configuration
- Domain and SSL setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[Supabase](https://supabase.com/)** - Open source Firebase alternative
- **[Stripe](https://stripe.com/)** - Payment processing platform
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful and accessible UI components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vercel](https://vercel.com/)** - Deployment and hosting platform

## 📞 Support

For support, questions, or feedback:
- Create an issue in the repository
- Email: support@shorajtomer.me
- Website: [shorajtomer.me](https://shorajtomer.me)

---

Built with ❤️ by [Shoraj Tomer](https://github.com/shorajtomer)