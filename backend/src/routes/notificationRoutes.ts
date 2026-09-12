import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  updateNotificationStatus,
  markAllNotificationsAsRead,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/read-all', markAllNotificationsAsRead);
router.put('/:id/read', markNotificationAsRead);
router.put('/:id/status', updateNotificationStatus);

export default router;
