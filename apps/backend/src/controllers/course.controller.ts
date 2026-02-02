
import { Request, Response } from 'express';
import * as CourseService from '../services/course.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCourses = async (req: Request, res: Response) => {
    try {
        const search = req.query.search as string | undefined;
        const courses = await CourseService.listCourses(search);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses' });
    }
};

export const getInstructorCourses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const courses = await CourseService.listInstructorCourses(userId);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching instructor courses' });
    }
};

export const addModule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const module = await CourseService.addModule(id, title);
        res.status(201).json(module);
    } catch (error) {
        res.status(500).json({ message: 'Error adding module' });
    }
};

export const addLesson = async (req: Request, res: Response) => {
    try {
        const { moduleId } = req.params; // Expecting /modules/:moduleId/lessons
        const lesson = await CourseService.addLesson(moduleId, req.body);
        res.status(201).json(lesson);
    } catch (error) {
        res.status(500).json({ message: 'Error adding lesson' });
    }
};

export const deleteModule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await CourseService.deleteModule(id);
        res.json({ message: 'Module deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting module' });
    }
};

export const deleteLesson = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await CourseService.deleteLesson(id);
        res.json({ message: 'Lesson deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting lesson' });
    }
};

export const updateModule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const module = await CourseService.updateModule(id, title);
        res.json(module);
    } catch (error) {
        res.status(500).json({ message: 'Error updating module' });
    }
};

export const updateLesson = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const lesson = await CourseService.updateLesson(id, req.body);
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ message: 'Error updating lesson' });
    }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const result = await CourseService.createCourse({ ...req.body, instructorId: userId });
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error creating course' });
    }
};

export const getCourse = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const course = await CourseService.getCourseById(id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Access Control
        if (!course.isPublished) {
            // Need to verify if instructor/admin for drafts
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];

            if (token) {
                const jwt = require('jsonwebtoken');
                try {
                    const user = jwt.verify(token, process.env.JWT_SECRET as string) as any;
                    if (user.role === 'INSTRUCTOR' || user.role === 'ADMIN') {
                        return res.json(course);
                    }
                } catch (e) {
                    // ignore error, fallthrough to 404
                }
            }

            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course details' });
    }
};



export const enrollCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const userRole = req.user?.role; // Need to ensure role is in JWT payload interface

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // GUEST LIMIT CHECK
        if (userRole === 'GUEST') {
            const enrollmentCount = await prisma.enrollment.count({
                where: { userId }
            });
            if (enrollmentCount >= 2) {
                return res.status(403).json({
                    message: 'Guest limit reached. You can only enroll in 2 courses as a guest. Please register to continue.'
                });
            }
        }

        await CourseService.enrollUserInCourse(userId, id);
        res.status(200).json({ message: 'Enrolled successfully' });
    } catch (error: any) {
        if (error.message === "Course not found") {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(500).json({ message: 'Error enrolling in course' });
    }
};

export const getEnrollmentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const isEnrolled = await CourseService.checkEnrollment(userId, id);
        let completedLessonIds: string[] = [];

        if (isEnrolled) {
            completedLessonIds = await CourseService.getCourseProgress(userId, id);
        }

        res.json({ isEnrolled, completedLessonIds });
    } catch (error) {
        res.status(500).json({ message: 'Error checking enrollment' });
    }
}

export const publishCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const course = await CourseService.publishCourse(id);
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error publishing course' });
    }
};

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const news = await CourseService.listAnnouncements();
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching announcements' });
    }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const notifications = await CourseService.listNotifications(userId);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        await CourseService.markNotificationRead(id, userId);
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification' });
    }
}

// DELETE COURSE OTP
export const getLessonNote = async (req: AuthRequest, res: Response) => {
    try {
        const { lessonId } = req.params;
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const note = await CourseService.getNote(userId, lessonId);
        res.json(note || { content: '' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching note' });
    }
}

export const saveLessonNote = async (req: AuthRequest, res: Response) => {
    try {
        const { lessonId } = req.params;
        const { content } = req.body;
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const note = await CourseService.saveNote(userId, lessonId, content);
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: 'Error saving note' });
    }
}



export const requestDeleteOTP = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // Course ID
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const result = await CourseService.generateDeleteOTP(id, userId);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error generating OTP' });
    }
};

export const deleteCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // Course ID
        const userId = req.user?.userId;
        const { otp } = req.body; // Check explicitly, body might be undefined if no otp sent

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        // Removed strict otp check here, Service handles it based on enrollment count

        const result = await CourseService.deleteCourseWithOTP(id, userId, otp);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error deleting course' });
    }
};
