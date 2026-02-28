import express, { Express, Request, Response } from 'express';
import { config } from './config/env.config';
import prisma from './lib/prisma';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Sentry Initialization
if (config.SENTRY_DSN) {
    Sentry.init({
        dsn: config.SENTRY_DSN,
        integrations: [
            nodeProfilingIntegration(),
        ],
        // Performance Monitoring — 10% in production, 100% in dev
        tracesSampleRate: config.NODE_ENV === 'production' ? 0.1 : 1.0,
        profilesSampleRate: config.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
}

// Route Imports
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import studentRoutes from './routes/student.routes';
import paymentRoutes from './routes/payment.routes';
import progressRoutes from './routes/progress.routes';
import testRoutes from './routes/test.routes';
import historyRoutes from './routes/history.routes';
import activityRoutes from './routes/activity.routes';
import mentorshipRoutes from './routes/mentorship.routes';

import reviewRoutes from './routes/review.routes';
import uploadRoutes from './routes/upload.routes';
import discussionRoutes from './routes/discussion.routes';

// Admin Routes
import userManagementRoutes from './routes/user-management.routes';
import adminCourseRoutes from './routes/admin-course.routes';
import adminFinanceRoutes from './routes/admin-finance.routes';
import adminAnalyticsRoutes from './routes/admin-analytics.routes';
import financeRoutes from './routes/finance.routes';
import publicRoutes from './routes/public.routes';
import adminContentRoutes from './routes/admin-content.routes';
import practiceRoutes from './routes/practice.routes';
import newsletterRoutes from './routes/newsletter.routes';

const app: Express = express();
const port = config.PORT;

import Logger from './lib/logger';
import { apiLimiter, authLimiter, paymentLimiter, uploadLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// Middleware
app.set("trust proxy", 1);

// CORS — Whitelist approved origins only
const allowedOrigins = [
    config.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:3001'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        Logger.warn(`[CORS] Blocked request from unauthorized origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With']
}));

app.use(express.json({ limit: '1mb' }));
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Re-enable and configure for production when frontend CSP is ready
}));
app.use(morgan('combined', { stream: { write: (message) => Logger.info(message.trim()) } }));

// Compression middleware - reduces response size by 60-80%
app.use(compression({
    level: 6,
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));

// Rate Limiting - Apply general API limiter to all /api routes
app.use('/api', apiLimiter);

// Debug Middleware
app.use((req, res, next) => {
    Logger.debug(`[REQUEST] ${req.method} ${req.url} | Origin: ${req.get('origin')}`);
    next();
});

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health check with DB verification
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString(),
            env: config.NODE_ENV
        });
    } catch (error: any) {
        Logger.error('[HEALTH CHECK] Failed:', error);
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            message: error.message
        });
    }
});

// Base Route
app.get('/', (req: Request, res: Response) => {
    res.send('Shoraj Learning Platform API');
});

// Public Routes (No Auth Required)
app.use('/api/public', publicRoutes);

// Admin Content Routes
app.use('/api/admin/content', adminContentRoutes);

// API Routes
// Auth routes with strict rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/payments', paymentLimiter, paymentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
app.use('/api', discussionRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/mentorship', mentorshipRoutes);

// Admin Routes
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/admin/courses', adminCourseRoutes);
app.use('/api/admin/finance', adminFinanceRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);

// Error Handler - Must be last middleware
if (config.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
}
app.use(errorHandler);

if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        Logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);

        // Start Reminder Jobs (Every 5 minutes)
        setInterval(async () => {
            try {
                const { sendMentorshipReminders, sendAllClassReminders, sendTestAvailableNotifications } = await import('./services/notification.service');
                await sendMentorshipReminders(15);
                await sendAllClassReminders(15);
                await sendTestAvailableNotifications();
            } catch (err) {
                Logger.error('[ReminderJob] Error:', err);
            }
        }, 5 * 60 * 1000);
    });
}

export default app;
