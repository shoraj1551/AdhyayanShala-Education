import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getInstructorActivity = async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // 1. Fetch Courses Created by this Instructor
        const courses = await prisma.course.findMany({
            where: { instructorId: userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                title: true,
                createdAt: true
            }
        });

        // 2. Fetch Enrollments in courses owned by this Instructor
        const enrollments = await prisma.enrollment.findMany({
            where: {
                course: {
                    instructorId: userId
                }
            },
            include: {
                course: {
                    select: { title: true }
                },
                user: {
                    select: { name: true } // Student name
                }
            },
            orderBy: { enrolledAt: 'desc' },
            take: 5
        });

        // 3. Map to generic Activity format
        const courseActivities = courses.map(c => ({
            id: `course-${c.id}`,
            type: 'course_published',
            title: `Published "${c.title}"`,
            description: 'Course is live.',
            timestamp: c.createdAt,
            icon: 'LayoutTemplate', // Passed as string to frontend
            color: 'text-violet-500',
            bg: 'bg-violet-500/10'
        }));

        const enrollmentActivities = enrollments.map(e => ({
            id: `enrollment-${e.id}`,
            type: 'student_enrolled',
            title: 'New Enrollment',
            description: `${e.user.name || 'A student'} enrolled in "${e.course.title}"`,
            timestamp: e.enrolledAt,
            icon: 'UserPlus',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        }));

        // 4. Merge and Sort
        const allActivities = [...courseActivities, ...enrollmentActivities]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10); // recent 10 events

        res.json(allActivities);

    } catch (error) {
        console.error("Activity Log Error:", error);
        res.status(500).json({ message: "Failed to fetch activity log" });
    }
};
