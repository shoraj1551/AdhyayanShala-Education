import express, { Express, Request, Response } from 'express';
import { config } from './config/env.config';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import path from 'path';

// Route Imports
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import studentRoutes from './routes/student.routes';
import paymentRoutes from './routes/payment.routes';
import progressRoutes from './routes/progress.routes';
import testRoutes from './routes/test.routes';
import historyRoutes from './routes/history.routes';
import activityRoutes from './routes/activity.routes';

import reviewRoutes from './routes/review.routes';
import uploadRoutes from './routes/upload.routes';
import discussionRoutes from './routes/discussion.routes';

// Admin Routes
import userManagementRoutes from './routes/user-management.routes';
import adminCourseRoutes from './routes/admin-course.routes';
import adminFinanceRoutes from './routes/admin-finance.routes';
import adminAnalyticsRoutes from './routes/admin-analytics.routes';
import financeRoutes from './routes/finance.routes';

const app: Express = express();
const port = config.PORT;

import Logger from './lib/logger';
import { apiLimiter, authLimiter, paymentLimiter, uploadLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// ... (config and cors imports)

// Middleware
app.use(express.json());

// CORS Configuration - Environment-based origins
const allowedOrigins = config.NODE_ENV === 'production'
    ? [config.FRONTEND_URL]
    : [config.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3005'];

app.use(cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies if needed
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
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

// Base Route
app.get('/', (req: Request, res: Response) => {
    res.send('Shoraj Learning Platform API');
});

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

// Admin Routes
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/admin/courses', adminCourseRoutes);
app.use('/api/admin/finance', adminFinanceRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);

// Error Handler - Must be last middleware
app.use(errorHandler);

app.listen(port, () => {
    Logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
});
