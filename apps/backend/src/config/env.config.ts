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
    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long for production security"),
    FRONTEND_URL: z.string().url().default('http://localhost:3000'),

    // Database
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    // External Services
    RAZORPAY_KEY_ID: z.string().optional().refine(
        val => process.env.NODE_ENV !== 'production' || (val && val.length > 0),
        'RAZORPAY_KEY_ID is required in production'
    ),
    RAZORPAY_KEY_SECRET: z.string().optional().refine(
        val => process.env.NODE_ENV !== 'production' || (val && val.length > 0),
        'RAZORPAY_KEY_SECRET is required in production'
    ),

    // Feature Flags
    ENABLE_MOCK_PAYMENTS: z.string().default('false').transform(val => val === 'true'),
});

const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Invalid environment variables:', JSON.stringify(error.format(), null, 2));
            process.exit(1);
        }
        throw error;
    }
};

export const config = parseEnv();
