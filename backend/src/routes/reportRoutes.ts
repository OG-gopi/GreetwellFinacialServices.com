import { Router } from 'express';
import { getApplicationReports, getUserReports, getAgentPerformanceReports, exportReportCSV } from '../controllers/reportController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/applications', requireRole('SUPER_ADMIN'), getApplicationReports);
router.get('/users', requireRole('SUPER_ADMIN'), getUserReports);
router.get('/agents', requireRole('SUPER_ADMIN'), getAgentPerformanceReports);
router.get('/export', requireRole('SUPER_ADMIN'), exportReportCSV);

export default router;
