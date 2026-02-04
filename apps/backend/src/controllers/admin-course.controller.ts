import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as AdminCourseService from '../services/admin-course.service';

export const getCourses = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;
        const status = req.query.status as string;

        const result = await AdminCourseService.getAllCourses(page, limit, search, status);
        res.json(result);
    } catch (error) {
        console.error("Get Admin Courses Error:", error);
        res.status(500).json({ message: "Failed to fetch courses" });
    }
};

export const togglePublishStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { isPublished } = req.body;

        const userId = req.user?.id;
        const updatedCourse = await AdminCourseService.updateCourseStatus(id, isPublished, userId);
        res.json(updatedCourse);
    } catch (error: any) {
        console.error("Update Course Status Error:", error);
        res.status(500).json({ message: error.message || "Failed to update course status" });
    }
};

export const deleteCourse = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        await AdminCourseService.deleteCourse(id, userId);
        res.json({ message: "Course deleted successfully" });
    } catch (error: any) {
        console.error("Delete Course Error:", error);
        res.status(500).json({ message: error.message || "Failed to delete course" });
    }
};
