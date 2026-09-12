import { Router } from 'express';
import {
  getAllMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleMenuStatus,
  updateRoleMenuPermissions,
  getMyMenus,
  checkMenuAccess,
} from '../controllers/menuController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User accessible routes
router.get('/my-menus', getMyMenus);
router.get('/check-access', checkMenuAccess);

// Superadmin Management routes
router.get('/', requireRole('SUPER_ADMIN'), getAllMenus);
router.post('/', requireRole('SUPER_ADMIN'), createMenu);
router.put('/:id', requireRole('SUPER_ADMIN'), updateMenu);
router.delete('/:id', requireRole('SUPER_ADMIN'), deleteMenu);
router.patch('/:id/status', requireRole('SUPER_ADMIN'), toggleMenuStatus);
router.post('/permissions', requireRole('SUPER_ADMIN'), updateRoleMenuPermissions);

export default router;
