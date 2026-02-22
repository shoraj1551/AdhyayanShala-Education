import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';
import * as MentorshipController from '../controllers/mentorship.controller';

const router = Router();

// Public / Student endpoints
router.get('/instructors/:id/availability', MentorshipController.getInstructorAvailability);
router.post('/book', authenticateToken, MentorshipController.bookSession);
router.get('/sessions', authenticateToken, MentorshipController.getMySessions);

// Instructor endpoints
router.get('/availability', authenticateToken, authorizeRole(['INSTRUCTOR']), MentorshipController.getMyAvailability);
router.post('/availability', authenticateToken, authorizeRole(['INSTRUCTOR']), MentorshipController.updateAvailability);
router.post('/fee', authenticateToken, authorizeRole(['INSTRUCTOR']), MentorshipController.updateFee);

export default router;
