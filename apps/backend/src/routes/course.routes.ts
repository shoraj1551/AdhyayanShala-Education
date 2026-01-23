import { Router } from 'express';
import * as CourseController from '../controllers/course.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', CourseController.getCourses);
router.get('/:id', CourseController.getCourse);
router.post('/:id/enroll', authenticateToken, CourseController.enrollCourse);
router.get('/:id/status', authenticateToken, CourseController.getEnrollmentStatus);

export default router;
