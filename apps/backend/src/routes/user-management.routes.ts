import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware';
import * as UserManagementController from '../controllers/user-management.controller';

const router = Router();

// All routes require ADMIN role via verifyRole middleware logic
// Assuming authorizeRole takes an array
router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

router.get('/', UserManagementController.getUsers);
router.post('/', UserManagementController.createUser);
router.get('/:id', UserManagementController.getUser);

router.patch('/:id/role', UserManagementController.updateUserRole);
router.patch('/:id/delete-permission', UserManagementController.updateUserDeletePermission);

export default router;

