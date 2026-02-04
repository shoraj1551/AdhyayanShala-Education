
import { Router } from 'express';
import * as CourseController from '../controllers/course.controller';
import * as LiveClassController from '../controllers/liveClass.controller';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.createCourse);
router.get('/instructor/stats', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.getInstructorStats);
router.get('/instructor', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.getInstructorCourses);
router.get('/announcements', CourseController.getAnnouncements); // Public News

// Notifications (Authenticated) - MUST BE BEFORE /:id
router.get('/notifications', authenticateToken, CourseController.getNotifications);
router.post('/notifications/:id/read', authenticateToken, CourseController.markNotificationRead);

// Modules/Lessons Management (Specific routes)
router.post('/modules/:moduleId/lessons', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.addLesson);
router.delete('/lessons/:id', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.deleteLesson);
router.put('/lessons/:id', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.updateLesson);
router.delete('/modules/:id', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.deleteModule);
router.put('/modules/:id', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.updateModule);

router.get('/', CourseController.getCourses);

// Dynamic Routes (ID based)
router.get('/:id/analytics', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.getCourseAnalytics);
router.get('/:id/students', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.getEnrolledStudents);
router.get('/:id', CourseController.getCourse);
router.post('/:id/enroll', authenticateToken, CourseController.enrollCourse);
router.post('/:id/publish', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.publishCourse);
router.post('/:id/unpublish', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.unpublishCourse);
router.get('/:id/status', authenticateToken, CourseController.getEnrollmentStatus);

// Note Logic
router.get('/lessons/:lessonId/note', authenticateToken, CourseController.getLessonNote);
router.post('/lessons/:lessonId/note', authenticateToken, CourseController.saveLessonNote);

// Delete Logic
router.post('/:id/delete-otp', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.requestDeleteOTP);
router.delete('/:id', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.deleteCourse);

router.post('/:id/modules', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), CourseController.addModule);

// ... existing routes

// Live Class Config (Instructor)
router.get('/:id/live', LiveClassController.getSettings); // Public read for students too?
router.post('/:id/live', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), LiveClassController.updateSettings);

router.post('/:id/live/schedule', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), LiveClassController.addSchedule);
router.delete('/live/schedule/:scheduleId', authenticateToken, authorizeRole(['ADMIN', 'INSTRUCTOR']), LiveClassController.deleteSchedule);

// Calendar
router.get('/:id/calendar.ics', LiveClassController.downloadCalendar);

export default router;

