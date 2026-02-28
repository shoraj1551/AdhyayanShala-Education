import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import crypto from 'node:crypto';
import * as EmailService from './email.service';
import {
    ConflictError,
    ValidationError,
    UnauthorizedError,
    BadRequestError,
    NotFoundError
} from '../lib/errors';


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

    subStatus?: string;
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
        throw new ConflictError('User already exists');
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(data.password)) {
        throw new ValidationError(
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
            // Core Identity only here...

            // Partitioned Records
            wallet: {
                create: {
                    balance: 0,
                    totalEarnings: 0
                }
            },
            ...(data.role === 'INSTRUCTOR' ? {
                instructorProfile: {
                    create: {
                        bio: data.bio,
                        expertise: data.expertise,
                        experience: data.experience,
                        linkedin: data.linkedin
                    }
                }
            } : {}),
            ...(data.role === 'STUDENT' ? {
                studentProfile: {
                    create: {
                        studentStatus: data.subStatus ? `${data.currentStatus}:${data.subStatus}` : data.currentStatus,
                        interests: data.interests
                    }
                }
            } : {})
        },
        include: {
            instructorProfile: true,
            studentProfile: true,
            wallet: true
        }
    });

    const token = jwt.sign(
        { id: user.id, role: user.role },
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
        throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials');
    }

    return user;
};

export const generateAdminOTP = async (userId: string, email: string) => {
    // Generate cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Hash OTP before storing to prevent exposure on DB compromise
    const hashedOtp = await bcrypt.hash(otp, 10);

    await prisma.user.update({
        where: { id: userId },
        data: {
            loginOtp: hashedOtp,
            loginOtpExpires: otpExpires
        }
    });

    return otp; // Return plaintext to send via email
};

export const sendAdminOTP = async (email: string, otp: string) => {
    return EmailService.sendAdminOTP(email, otp);
};

export const verifyAdminOTP = async (userId: string, otp: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user || !user.loginOtp || !user.loginOtpExpires) {
        throw new BadRequestError('Invalid request or OTP expired');
    }

    if (new Date() > user.loginOtpExpires) {
        throw new BadRequestError('OTP expired');
    }

    // Compare submitted OTP against hashed value
    const isOtpValid = await bcrypt.compare(otp, user.loginOtp);
    if (!isOtpValid) {
        throw new UnauthorizedError('Invalid OTP');
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
        { id: user.id, role: user.role },
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
        include: {
            instructorProfile: true,
            studentProfile: true,
            wallet: {
                select: {
                    balance: true,
                    totalEarnings: true
                    // bankDetails intentionally excluded from general fetch
                }
            }
        }
    });

    return user;
};


interface UpdateProfileDTO {
    name?: string;
    avatar?: string;
    role?: string;
    bio?: string;
    expertise?: string;
    experience?: string;
    linkedin?: string;
    studentStatus?: string;
    studentSubStatus?: string;
    interests?: string;
}

export const updateUserProfile = async (userId: string, data: UpdateProfileDTO) => {
    // This now needs to handle nested updates
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            avatar: data.avatar,
            instructorProfile: data.role === 'INSTRUCTOR' ? {
                upsert: {
                    create: {
                        bio: data.bio,
                        expertise: data.expertise,
                        experience: data.experience,
                        linkedin: data.linkedin
                    },
                    update: {
                        bio: data.bio,
                        expertise: data.expertise,
                        experience: data.experience,
                        linkedin: data.linkedin
                    }
                }
            } : undefined,
            studentProfile: data.role === 'STUDENT' ? {
                upsert: {
                    create: {
                        studentStatus: data.studentStatus,
                        studentSubStatus: data.studentSubStatus,
                        interests: data.interests
                    },
                    update: {
                        studentStatus: data.studentStatus,
                        studentSubStatus: data.studentSubStatus,
                        interests: data.interests
                    }
                }
            } : undefined
        },
        include: {
            instructorProfile: true,
            studentProfile: true,
            wallet: {
                select: { balance: true, totalEarnings: true }
            }
        }
    });

    return user;
};


export const updatePassword = async (userId: string, currentPass: string, newPass: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) throw new NotFoundError("User not found");

    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) throw new UnauthorizedError("Incorrect current password");

    const hashedNewPassword = await bcrypt.hash(newPass, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
    });
};

export const deleteUserAccount = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) throw new NotFoundError("User not found");

    // Students and Instructors must be allowed by Admin
    if ((user.role === 'STUDENT' || user.role === 'INSTRUCTOR') && !user.canDeleteAccount) {
        throw new UnauthorizedError("Account deletion is locked. Please contact support/admin to enable deletion.");
    }

    await prisma.user.delete({
        where: { id: userId }
    });
};


