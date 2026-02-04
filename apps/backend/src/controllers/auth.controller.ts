import { Request, Response } from 'express';
import { z } from 'zod';
import * as AuthService from '../services/auth.service';
import { config } from '../config/env.config';

// Validation Schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
    role: z.enum(['STUDENT', 'INSTRUCTOR', 'ADMIN']).default('STUDENT'),
    // Extended fields
    bio: z.string().optional(),
    expertise: z.string().optional(),
    experience: z.string().optional().or(z.number().transform(String)), // Handle number input
    linkedin: z.string().optional(),
    currentStatus: z.string().optional(),
    interests: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const register = async (req: Request, res: Response) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { user, token } = await AuthService.registerUser(validatedData);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
        }
        res.status(error.message === 'User already exists' ? 400 : 500).json({ message: error.message || 'Error registering user' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        console.log('[LOGIN] Attempt for email:', req.body.email);
        const validatedData = loginSchema.parse(req.body);

        const user = await AuthService.loginUser(validatedData);

        console.log('[LOGIN] User found:', user.email, 'Role:', user.role);

        // 2FA FOR ADMIN
        if (user.role === 'ADMIN') {
            const otp = await AuthService.generateAdminOTP(user.id, user.email);

            if (config.NODE_ENV === 'development') {
                console.log(`[LOGIN 2FA] OTP generated for ADMIN ${user.email}: ${otp}`);
            } else {
                console.log(`[LOGIN 2FA] OTP generated for ADMIN ${user.email}`);
                // TODO: Integrate Email Service here
            }

            return res.json({
                message: 'OTP sent to admin email',
                otpRequired: true,
                userId: user.id,
                email: user.email
            });
        }

        console.log('[LOGIN] Login successful for:', user.email);
        const token = AuthService.generateToken(user);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error: any) {
        console.error('[LOGIN] Error:', error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: 'Validation error', errors: (error as any).errors });
        }
        res.status(401).json({ message: error.message || 'Error logging in' });
    }
};

export const verifyLoginOtp = async (req: Request, res: Response) => {
    try {
        const { userId, otp } = req.body;
        const { user, token } = await AuthService.verifyAdminOTP(userId, otp);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });

    } catch (error: any) {
        console.error('[OTP VERIFY] Error:', error);
        res.status(400).json({ message: error.message || 'Error verifying OTP' });
    }
};

export const guestLogin = async (req: Request, res: Response) => {
    try {
        const { user, token } = await AuthService.createGuestSession();

        res.status(201).json({
            message: 'Guest session created',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating guest session' });
    }
};



export const getMe = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        const user = await AuthService.getUserById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile' });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        const { name, avatar } = req.body;

        const user = await AuthService.updateUserProfile(userId, { name, avatar });

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
};
