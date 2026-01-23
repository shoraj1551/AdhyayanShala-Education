import { Router } from 'express';
import * as CourseController from '../controllers/course.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.createCourse);
router.get('/instructor', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.getInstructorCourses);
router.get('/', CourseController.getCourses);
router.get('/:id', CourseController.getCourse);
router.post('/:id/enroll', authenticateToken, CourseController.enrollCourse);
router.get('/:id/status', authenticateToken, CourseController.getEnrollmentStatus);

// Content Management
router.post('/:id/modules', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.addModule);
router.delete('/modules/:id', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.deleteModule);
router.put('/modules/:id', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.updateModule);

router.post('/modules/:moduleId/lessons', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.addLesson);
router.delete('/lessons/:id', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.deleteLesson);
router.put('/lessons/:id', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.updateLesson);

export default router;
