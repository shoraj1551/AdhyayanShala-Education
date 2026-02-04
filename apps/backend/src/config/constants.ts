// Limits and Constraints
export const LIMITS = {
    GUEST_ENROLLMENT_MAX: 2,
    FILE_UPLOAD_MAX_SIZE: 10 * 1024 * 1024, // 10MB
    OTP_EXPIRY_MINUTES: 10,
    PASSWORD_MIN_LENGTH: 8,
    JWT_MIN_LENGTH: 32,
} as const;

// Rate Limiting Configuration
export const RATE_LIMITS = {
    API_WINDOW_MS: 1 * 60 * 1000, // 1 minute
    API_MAX_REQUESTS: 100,
    AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    AUTH_MAX_REQUESTS: 5,
    PAYMENT_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    PAYMENT_MAX_REQUESTS: 10,
    UPLOAD_WINDOW_MS: 60 * 60 * 1000, // 1 hour
    UPLOAD_MAX_REQUESTS: 20,
} as const;

// Payment Discounts
export const DISCOUNTS = {
    FULL_PAYMENT: 0.20, // 20% off
    INSTALLMENT_2: 0.10, // 10% off
    INSTALLMENT_4: 0.00, // No discount
} as const;

// OTP Configuration
export const OTP = {
    MIN_VALUE: 100000,
    MAX_VALUE: 999999,
    EXPIRY_MS: 10 * 60 * 1000, // 10 minutes
} as const;
