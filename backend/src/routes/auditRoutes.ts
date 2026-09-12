import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController';
import { authenticate, requireRole, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('SUPER_ADMIN'), requirePermission('audit_logs.view'), getAuditLogs);

export default router;
