import { Router } from 'express';
import {
  getDocumentTypes,
  createDocumentType,
  getSettings,
  updateSetting,
  getPermissions,
  getVerificationData,
} from '../controllers/settingController';
import { authenticate, requireRole, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/doc-types', getDocumentTypes);
router.post('/doc-types', requireRole('SUPER_ADMIN'), createDocumentType);

router.get('/system-settings', getSettings);
router.put('/system-settings', requireRole('SUPER_ADMIN'), updateSetting);

router.get('/permissions', requireRole('SUPER_ADMIN'), getPermissions);
router.get('/verification-center', requireRole('SUPER_ADMIN'), getVerificationData);

export default router;
