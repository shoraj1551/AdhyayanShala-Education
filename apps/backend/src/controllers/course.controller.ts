import { Request, Response } from 'express';
import * as CourseService from '../services/course.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const getCourses = async (req: Request, res: Response) => {
    try {
        const search = req.query.search as string | undefined;
        const courses = await CourseService.listCourses(search);
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses' });
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

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

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
