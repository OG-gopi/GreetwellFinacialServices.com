import { Router } from 'express';
import { getTasks, createTask, updateTaskStatus } from '../controllers/taskController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id/status', updateTaskStatus);

export default router;
