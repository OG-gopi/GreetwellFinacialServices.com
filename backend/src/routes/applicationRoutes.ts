import { Router } from 'express';
import {
  getApplications,
  getApplicationById,
  createApplication,
  assignApplication,
  updateApplicationStatus,
  verifyApplicationData,
  createApplicationRequest,
  replyToApplicationRequest,
  updateRequestStatus,
} from '../controllers/applicationController';
import { authenticate, requireRole, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('applications.view'), getApplications);
router.get('/:id', requirePermission('applications.view'), getApplicationById);
router.post('/', requirePermission('applications.create'), createApplication);
router.put('/:id/assign', requireRole('SUPER_ADMIN'), assignApplication);
router.put('/:id/status', requirePermission('applications.edit'), updateApplicationStatus);
router.post('/:id/verify', requirePermission('applications.verify'), verifyApplicationData);

// Customer & Agent Requests / Requirements
router.post('/:id/requests', createApplicationRequest);
router.post('/requests/:requestId/reply', replyToApplicationRequest);
router.put('/requests/:requestId/status', updateRequestStatus);

export default router;
