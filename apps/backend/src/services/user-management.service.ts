import prisma from '../lib/prisma';

export const getAllUsers = async (page: number = 1, limit: number = 20, search?: string, role?: string) => {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (role && role !== 'ALL') {
        where.role = role;
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
            // In future: orders/invoices
        }
    });
};

export const updateUserRole = async (userId: string, role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') => {
    return prisma.user.update({
        where: { id: userId },
        data: { role }
    });
};

// Assuming we add a 'banned' or 'status' field later. For now, we can maybe scramble password or add a field if schema supports.
// Checking schema first would be good, but for now let's stick to role management and view.
