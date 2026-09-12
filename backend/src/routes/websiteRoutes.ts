import { Router } from 'express';
import {
  getPublicWebsiteContent,
  getAdminWebsiteContent,
  saveWebsiteDraft,
  publishWebsiteChanges,
  discardWebsiteDraft,
  getWebsiteChangeHistory,
  uploadWebsiteImage,
  createWebsiteMedia,
  updateWebsiteMedia,
  deleteWebsiteMedia,
  mediaUploadMiddleware,
} from '../controllers/websiteController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public route (no authentication required)
router.get('/public', getPublicWebsiteContent);

// Super Admin only management routes
router.get('/admin', authenticate, requireRole('SUPER_ADMIN'), getAdminWebsiteContent);
router.post('/admin/draft', authenticate, requireRole('SUPER_ADMIN'), saveWebsiteDraft);
router.post('/admin/publish', authenticate, requireRole('SUPER_ADMIN'), publishWebsiteChanges);
router.post('/admin/discard', authenticate, requireRole('SUPER_ADMIN'), discardWebsiteDraft);
router.get('/admin/history', authenticate, requireRole('SUPER_ADMIN'), getWebsiteChangeHistory);

// Super Admin Media Management routes
router.post(
  '/admin/upload-image',
  authenticate,
  requireRole('SUPER_ADMIN'),
  mediaUploadMiddleware.single('image'),
  uploadWebsiteImage
);
router.post('/admin/media', authenticate, requireRole('SUPER_ADMIN'), createWebsiteMedia);
router.put('/admin/media/:id', authenticate, requireRole('SUPER_ADMIN'), updateWebsiteMedia);
router.delete('/admin/media/:id', authenticate, requireRole('SUPER_ADMIN'), deleteWebsiteMedia);

export default router;
