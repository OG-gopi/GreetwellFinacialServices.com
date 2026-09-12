import { Router } from 'express';
import { getEmailTemplates, createEmailTemplate, getCustomFields, createCustomField, triggerBackup, getBackupHistory } from '../controllers/systemController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/email-templates', requireRole('SUPER_ADMIN'), getEmailTemplates);
router.post('/email-templates', requireRole('SUPER_ADMIN'), createEmailTemplate);

router.get('/fields', requireRole('SUPER_ADMIN'), getCustomFields);
router.post('/fields', requireRole('SUPER_ADMIN'), createCustomField);

router.get('/backups', requireRole('SUPER_ADMIN'), getBackupHistory);
router.post('/backups/trigger', requireRole('SUPER_ADMIN'), triggerBackup);

export default router;
