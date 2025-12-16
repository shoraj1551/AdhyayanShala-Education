import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public isOperational = true
    ) {
        super(message)
        Object.setPrototypeOf(this, AppError.prototype)
    }
}

/**
 * Handle validation errors from Zod
 */
export function handleValidationError(error: ZodError) {
    const errors = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
    }))

    return NextResponse.json(
        {
            error: 'Validation failed',
            details: errors,
        },
        { status: 400 }
    )
}

/**
 * Global error handler for API routes
 */
export function handleApiError(error: unknown) {
    console.error('API Error:', error)

    // Zod validation error
    if (error instanceof ZodError) {
        return handleValidationError(error)
    }

    // Custom app error
    if (error instanceof AppError) {
        return NextResponse.json(
            { error: error.message },
            { status: error.statusCode }
        )
    }

    // Unknown error
    return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
    )
}

/**
 * Validate request body against a Zod schema
 */
export async function validateRequest<T>(
    request: Request,
    schema: any
): Promise<T> {
    try {
        const body = await request.json()
        return schema.parse(body) as T
    } catch (error) {
        if (error instanceof ZodError) {
            throw error
        }
        throw new AppError(400, 'Invalid request body')
    }
}
