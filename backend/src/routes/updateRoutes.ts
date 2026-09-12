import { Router } from 'express';
import { getReleaseNotes, createReleaseNote } from '../controllers/updateController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/release-notes', getReleaseNotes);
router.post('/release-notes', requireRole('SUPER_ADMIN'), createReleaseNote);

export default router;
