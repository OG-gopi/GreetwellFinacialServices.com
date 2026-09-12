import { Router } from 'express';
import { getRoles, createRole, getPermissionGroups } from '../controllers/permissionController';
import {
  getAllMethodPermissions,
  createMethodPermission,
  updateMethodPermission,
  deleteMethodPermission,
  toggleMethodPermissionStatus,
} from '../controllers/methodPermissionController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Roles
router.get('/roles', requireRole('SUPER_ADMIN'), getRoles);
router.post('/roles', requireRole('SUPER_ADMIN'), createRole);

// Method Permissions
router.get('/methods', requireRole('SUPER_ADMIN'), getAllMethodPermissions);
router.post('/methods', requireRole('SUPER_ADMIN'), createMethodPermission);
router.put('/methods/:id', requireRole('SUPER_ADMIN'), updateMethodPermission);
router.delete('/methods/:id', requireRole('SUPER_ADMIN'), deleteMethodPermission);
router.patch('/methods/:id/status', requireRole('SUPER_ADMIN'), toggleMethodPermissionStatus);

// Permission Groups
router.get('/groups', requireRole('SUPER_ADMIN'), getPermissionGroups);

export default router;
