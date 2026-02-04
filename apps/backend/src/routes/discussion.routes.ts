import { Router } from 'express';
import * as DiscussionController from '../controllers/discussion.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// /discussions base path (Assumed, need to hook up in index.ts)
// Or maybe better to keep it RESTful under /courses? 
// Let's use separate /discussion routes for simplicity or stick to the resource.

// Design: 
// GET /lessons/:lessonId/comments
// POST /lessons/:lessonId/comments
// POST /comments/:commentId/reply

router.get('/lessons/:lessonId/comments', authenticateToken, DiscussionController.getLessonComments);
router.post('/lessons/:lessonId/comments', authenticateToken, DiscussionController.addComment);
router.post('/comments/:commentId/reply', authenticateToken, DiscussionController.replyToComment);

export default router;
