import { Router } from 'express';
import { createNote, getNotes } from '../controllers/noteController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', createNote);
router.get('/application/:applicationId', getNotes);

export default router;
