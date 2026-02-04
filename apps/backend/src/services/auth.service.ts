import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';

export const registerUser = async (data: any) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });

    if (existingUser) {
        throw new Error('User already exists');
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

export const loginUser = async (data: any) => {
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
    // Generate Random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
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
    const suffix = Math.random().toString(36).substring(7);
    const email = `guest_${Date.now()}_${suffix}@shoraj.com`;
    const password = Math.random().toString(36).substring(2, 15);
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

export const generateToken = (user: any) => {
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
