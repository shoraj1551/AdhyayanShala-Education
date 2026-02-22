import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';
import * as AdminContentController from '../controllers/admin-content.controller';

const router = Router();

// Protect all routes with ADMIN role
router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

// --- Team Members ---
router.get('/team', AdminContentController.getTeamMembers);
router.post('/team', AdminContentController.createTeamMember);
router.put('/team/:id', AdminContentController.updateTeamMember);
router.delete('/team/:id', AdminContentController.deleteTeamMember);

// --- Social Handles ---
router.get('/socials', AdminContentController.getSocials);
router.post('/socials', AdminContentController.createSocial);
router.put('/socials/:id', AdminContentController.updateSocial);
router.delete('/socials/:id', AdminContentController.deleteSocial);

// --- Contact Info ---
router.get('/contact', AdminContentController.getContacts);
router.post('/contact', AdminContentController.createContact);
router.put('/contact/:id', AdminContentController.updateContact);
router.delete('/contact/:id', AdminContentController.deleteContact);
router.delete('/contact/:id', AdminContentController.deleteContact);

// --- Inquiries ---
router.get('/inquiries', AdminContentController.getInquiries);
router.patch('/inquiries/:id', AdminContentController.updateInquiryStatus);
router.delete('/inquiries/:id', AdminContentController.deleteInquiry);

export default router;
