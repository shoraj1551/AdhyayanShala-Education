
import { Request, Response } from 'express';
import * as CourseService from '../services/course.service';
import * as CourseAnalyticsService from '../services/courseAnalytics.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { config } from '../config/env.config';
import Logger from '../lib/logger';
import jwt from 'jsonwebtoken';

export const getCourses = async (req: Request, res: Response) => {
    try {
        const search = req.query.search as string | undefined;
        // For instructors doing market research, exclude their own courses
        const excludeInstructorId = req.query.excludeInstructor as string | undefined;

        const courses = await CourseService.listCourses(search, excludeInstructorId);
        res.json(courses);
    } catch (error) {
        Logger.error('Error in getCourses:', error);
        res.status(500).json({ message: 'Error fetching courses', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// ... getCourses above ... 

export const getInstructorCourses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const courses = await CourseService.listInstructorCourses(userId);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching instructor courses' });
    }
};

export const getInstructorStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        const stats = await CourseService.getInstructorStats(userId);
        res.json(stats);
    } catch (error) {
        Logger.error('[INSTRUCTOR STATS] Error:', error);
        res.status(500).json({ message: 'Error fetching instructor stats' });
    }
};

export const getEnrolledStudents = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // courseId
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const students = await CourseService.getCourseEnrollments(id, userId);
        res.json(students);
    } catch (error: any) {
        Logger.error('[ENROLLED STUDENTS] Error:', error);
        res.status(error.message === 'Course not found or unauthorized' ? 403 : 500)
            .json({ message: error.message || 'Error fetching enrollments' });
    }
};

export const getCourseAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const analytics = await CourseAnalyticsService.getCourseAnalytics(id, userId);
        res.json(analytics);
    } catch (error: any) {
        Logger.error('[COURSE ANALYTICS] Error:', error);
        res.status(error.message === 'Course not found or unauthorized' ? 404 : 500)
            .json({ message: error.message || 'Error fetching course analytics' });
    }
};

export const addModule = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const module = await CourseService.addModule(id, title, userId);
        res.status(201).json(module);
    } catch (error: any) {
        res.status(500).json({ message: 'Error adding module', error: error.message });
    }
};

export const addLesson = async (req: AuthRequest, res: Response) => {
    try {
        const { moduleId } = req.params; // Expecting /modules/:moduleId/lessons
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const lesson = await CourseService.addLesson(moduleId, req.body, userId);
        res.status(201).json(lesson);
    } catch (error: any) {
        res.status(500).json({ message: 'Error adding lesson', error: error.message });
    }
};

export const deleteModule = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        await CourseService.deleteModule(id, userId);
        res.json({ message: 'Module deleted' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting module', error: error.message });
    }
};

export const deleteLesson = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        await CourseService.deleteLesson(id, userId);
        res.json({ message: 'Lesson deleted' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting lesson', error: error.message });
    }
};

export const updateModule = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const module = await CourseService.updateModule(id, title, userId);
        res.json(module);
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating module', error: error.message });
    }
};

export const updateLesson = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const lesson = await CourseService.updateLesson(id, req.body, userId);
        res.json(lesson);
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating lesson', error: error.message });
    }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        Logger.info(`[CREATE COURSE] User ID: ${userId}`);

        const result = await CourseService.createCourse({ ...req.body, instructorId: userId });
        res.status(201).json(result);
    } catch (error: any) {
        Logger.error('[CREATE COURSE] Error:', error);
        res.status(500).json({
            message: 'Error creating course',
            error: error.message
        });
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
                try {
                    const user = jwt.verify(token, config.JWT_SECRET) as any;
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
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // GUEST LIMIT CHECK
        if (userRole === 'GUEST') {
            const canEnroll = await CourseService.checkGuestEnrollmentLimit(userId);
            if (!canEnroll) {
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
        const userId = req.user?.id;
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
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const course = await CourseService.publishCourse(id, userId);
        res.json(course);
    } catch (error: any) {
        res.status(500).json({ message: error.message || 'Error publishing course' });
    }
};

export const unpublishCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { otp } = req.body;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const course = await CourseService.unpublishCourseWithOTP(id, userId, otp);
        res.json(course);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error unpublishing course' });
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
        const userId = req.user?.id;
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
        const userId = req.user?.id;
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
        const userId = req.user?.id;
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
        const userId = req.user?.id;
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
        const userId = req.user?.id;
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
        const userId = req.user?.id;
        const { otp } = req.body; // Check explicitly, body might be undefined if no otp sent

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        // Removed strict otp check here, Service handles it based on enrollment count

        const result = await CourseService.deleteCourseWithOTP(id, userId, otp);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message || 'Error deleting course' });
    }
};
