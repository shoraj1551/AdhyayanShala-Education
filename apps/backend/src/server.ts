import express, { Express, Request, Response } from 'express';
import { config } from './config/env.config';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
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

// ... (config and cors imports)

// Middleware
app.use(express.json());
app.use(cors({
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(morgan('combined', { stream: { write: (message) => Logger.info(message.trim()) } }));

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
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', discussionRoutes);
app.use('/api/finance', financeRoutes);

// Admin Routes
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/admin/courses', adminCourseRoutes);
app.use('/api/admin/finance', adminFinanceRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
