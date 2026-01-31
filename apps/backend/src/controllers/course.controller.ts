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
        res.json({ isEnrolled });
    } catch (error) {
        res.status(500).json({ message: 'Error checking enrollment' });
    }
}
