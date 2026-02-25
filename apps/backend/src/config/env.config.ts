import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or specific path if needed, though usually handled by dev script
dotenv.config();

const envSchema = z.object({
    // Server Config
    PORT: z.string().default('3001').transform(Number),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Security
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),

    // Database
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    DIRECT_URL: z.string().optional(),

    // External Services
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),

    // Feature Flags
    ENABLE_MOCK_PAYMENTS: z.string().default('false').transform(val => val === 'true'),

    // Caching & Monitoring
    REDIS_URL: z.string().optional(),
    SENTRY_DSN: z.string().optional(),
});

const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('⚠️ Environment variable validation warnings:', JSON.stringify(error.format(), null, 2));
            // Return partially valid object or raw process.env casted to any to prevent crash
            return process.env as any;
        }
        throw error;
    }
};

export const config = parseEnv();
