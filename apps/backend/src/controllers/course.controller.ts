import { Request, Response } from 'express';
import * as CourseService from '../services/course.service';

export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = await CourseService.listCourses();
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
