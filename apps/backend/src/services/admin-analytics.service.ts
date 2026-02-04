import prisma from '../lib/prisma';

export const getDashboardStats = async () => {
    // 1. Total Users
    const totalUsers = await prisma.user.count();
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalInstructors = await prisma.user.count({ where: { role: 'INSTRUCTOR' } });

    // 2. Total Revenue (Verified Payments)
    const revenueAgg = await prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true }
    });
    const totalRevenue = revenueAgg._sum.amount || 0;

    // 3. Course Stats
    const totalCourses = await prisma.course.count();
    const publishedCourses = await prisma.course.count({ where: { isPublished: true } });

    // 4. Recent Activity (Last 5 Signups)
    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true, avatar: true }
    });

    // 5. Popular Courses (by enrollment)
    const popularCourses = await prisma.course.findMany({
        take: 5,
        orderBy: {
            enrollments: {
                _count: 'desc'
            }
        },
        select: {
            id: true,
            title: true,
            _count: {
                select: { enrollments: true }
            }
        }
    });

    return {
        users: { total: totalUsers, students: totalStudents, instructors: totalInstructors },
        revenue: totalRevenue,
        courses: { total: totalCourses, published: publishedCourses },
        recentUsers,
        popularCourses
    };
};
