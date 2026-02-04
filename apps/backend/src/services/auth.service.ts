import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import crypto from 'node:crypto';

import { Role } from '@prisma/client';

interface RegisterUserDTO {
    email: string;
    password: string;
    name?: string;
    role: Role;
    bio?: string;
    expertise?: string;
    experience?: string;
    linkedin?: string;
    currentStatus?: string;
    interests?: string;
}

interface LoginUserDTO {
    email: string;
    password: string;
}

export const registerUser = async (data: RegisterUserDTO) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existingUser) {
        throw new Error('User already exists');
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(data.password)) {
        throw new Error(
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
        );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            role: data.role,
            // Profile mappings
            bio: data.bio,
            expertise: data.expertise,
            experience: data.experience,
            linkedin: data.linkedin,
            studentStatus: data.currentStatus,
            interests: data.interests,
        },
    });

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { user, token };
};

export const loginUser = async (data: LoginUserDTO) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    return user;
};

export const generateAdminOTP = async (userId: string, email: string) => {
    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
        where: { id: userId },
        data: {
            loginOtp: otp,
            loginOtpExpires: otpExpires
        }
    });

    return otp;
};

export const verifyAdminOTP = async (userId: string, otp: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user || !user.loginOtp || !user.loginOtpExpires) {
        throw new Error('Invalid request or OTP expired');
    }

    if (new Date() > user.loginOtpExpires) {
        throw new Error('OTP expired');
    }

    if (user.loginOtp !== otp) {
        throw new Error('Invalid OTP');
    }

    // Clear OTP
    await prisma.user.update({
        where: { id: userId },
        data: { loginOtp: null, loginOtpExpires: null }
    });

    const token = jwt.sign(
        { id: user.id, role: user.role },
        config.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { user, token };
};

export const createGuestSession = async () => {
    // Use crypto.randomUUID() for unpredictable guest email
    const guestId = crypto.randomUUID();
    const email = `guest_${guestId}@shoraj.com`;
    const password = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name: "Guest User",
            role: "GUEST",
        },
    });

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { user, token };
};

export const generateToken = (user: { id: string, role: string }) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        config.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

export const getUserById = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true, avatar: true }
    });
    return user;
};

export const updateUserProfile = async (userId: string, data: { name?: string; avatar?: string }) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            avatar: data.avatar
        },
        select: { id: true, email: true, name: true, role: true, avatar: true }
    });
    return user;
};
