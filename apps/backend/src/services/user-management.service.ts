import prisma from '../lib/prisma';
import { Prisma, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

export const getAllUsers = async (page: number = 1, limit: number = 20, search?: string, role?: string) => {
    // ... existing code ...

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (role && role !== 'ALL') {
        where.role = role as Role;
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                canDeleteAccount: true,
                _count: {
                    select: {
                        enrollments: true,
                        courses: true
                    }
                }

            },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};

export const getUserDetails = async (userId: string) => {
    return prisma.user.findUnique({
        where: { id: userId },
        include: {
            instructorProfile: true,
            studentProfile: true,
            wallet: true,
            enrollments: {
                include: {
                    course: {
                        select: { id: true, title: true, price: true }
                    }
                }
            },
            courses: {
                select: {
                    id: true,
                    title: true,
                    isPublished: true,
                    price: true,
                    createdAt: true,
                    _count: { select: { enrollments: true } }
                }
            },
            payouts: {
                orderBy: { requestedAt: 'desc' },
                take: 10
            },
            earnings: {
                orderBy: { createdAt: 'desc' },
                take: 10
            }
        }
    });
};


export const updateUserRole = async (userId: string, role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') => {
    return prisma.user.update({
        where: { id: userId },
        data: { role }
    });
};

export const createUser = async (data: {
    name: string;
    email: string;
    password: string;
    role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
            wallet: { create: {} },
            instructorProfile: data.role === 'INSTRUCTOR' ? { create: {} } : undefined,
            studentProfile: data.role === 'STUDENT' ? { create: {} } : undefined
        }
    });
};



export const updateDeletePermission = async (userId: string, canDeleteAccount: boolean) => {
    return prisma.user.update({
        where: { id: userId },
        data: { canDeleteAccount }
    });
};

