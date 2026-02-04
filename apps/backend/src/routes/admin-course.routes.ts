import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';
import * as AdminCourseController from '../controllers/admin-course.controller';

const router = Router();

router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

router.get('/', AdminCourseController.getCourses);
router.patch('/:id/status', AdminCourseController.togglePublishStatus);
router.delete('/:id', AdminCourseController.deleteCourse);

export default router;
