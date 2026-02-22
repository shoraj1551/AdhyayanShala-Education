import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { config } from '../config/env.config';

const JWT_SECRET = config.JWT_SECRET;

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: { message: 'Authentication required', code: 'UNAUTHORIZED' } });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: { message: 'Invalid or expired token', code: 'FORBIDDEN' } });
    }
};

export const authenticateTokenOptional = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    try {
        const user = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
        req.user = user;
        next();
    } catch (error) {
        // For optional auth, we ignore invalid tokens and treat as guest
        next();
    }
};

export const authorizeRole = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: { message: 'Insufficient permissions', code: 'FORBIDDEN' } });
        }
        next();
    };
};
