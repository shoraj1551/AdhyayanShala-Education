import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import Logger from '../lib/logger';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Handle custom AppError instances (NotFoundError, BadRequestError, etc.)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                message: err.message,
                code: err.code,
            },
        });
    }

    // Handle Zod validation errors
    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                details: (err as any).errors,
            },
        });
    }

    // Handle CORS errors
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: {
                message: 'Origin not allowed',
                code: 'CORS_ERROR',
            },
        });
    }

    // Log unhandled errors
    Logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Return generic error for unhandled exceptions (hide internals in production)
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
        error: {
            message: isProduction ? 'Internal server error' : err.message,
            code: 'INTERNAL_ERROR',
        },
    });
};
