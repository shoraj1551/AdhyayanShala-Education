
import { Router } from 'express';
import * as MentorshipController from '../controllers/mentorship.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Instructor routes
router.get('/slots', authenticateToken, MentorshipController.getSlots);
router.post('/slots', authenticateToken, MentorshipController.updateSlots);

// Student routes
router.get('/instructors', authenticateToken, MentorshipController.listInstructors);
router.get('/instructors/:id/availability', authenticateToken, MentorshipController.getInstructorAvailability);
router.post('/book', authenticateToken, MentorshipController.bookSession);
router.get('/my-bookings', authenticateToken, MentorshipController.getMyBookings);
router.get('/sessions', authenticateToken, MentorshipController.getMyBookings);

export default router;
