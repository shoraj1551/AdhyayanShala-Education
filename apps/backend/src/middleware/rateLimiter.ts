import rateLimit from 'express-rate-limit';

// General API rate limiter - 100 requests per minute per IP
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Strict limiter for authentication endpoints - 5 attempts per 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    skipSuccessfulRequests: true, // Don't count successful requests
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Payment endpoint limiter - 10 requests per hour
export const paymentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per window
    message: 'Too many payment requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Upload endpoint limiter - 20 uploads per hour
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 requests per window
    message: 'Too many upload requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
