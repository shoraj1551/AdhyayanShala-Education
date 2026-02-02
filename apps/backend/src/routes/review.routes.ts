
import { Router } from 'express';
import * as ReviewController from '../controllers/review.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// These routes will be mounted under /api/reviews but we need courseId...
// Actually, RESTful best practice is /courses/:courseId/reviews
// BUT I can strictly use query param or just mount it directly since I pass courseId in body/param on frontend.
// Let's decide: Mounting under /api/courses/:courseId/reviews is cleaner but requires router.mergeParams.
// OR I can use /api/reviews?courseId=XYZ
// OR /api/courses/reviews/:courseId (weird)

// Simplest for now: /api/courses/:courseId/reviews
// But I need to modify course.routes.ts for that OR mount a new router in server.ts
// I'll stick to a standalone Review route group where you pass courseId in the URL path:
// POST /api/reviews/:courseId
// GET /api/reviews/:courseId

router.post('/:courseId', authenticateToken, ReviewController.createReview);
router.get('/:courseId', ReviewController.getCourseReviews);

export default router;
