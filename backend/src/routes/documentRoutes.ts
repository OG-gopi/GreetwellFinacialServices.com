import { Router } from 'express';
import { uploadDocument, verifyDocument, deleteDocument, upload } from '../controllers/documentController';
import { authenticate, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), uploadDocument);
router.put('/:id/verify', requirePermission('documents.verify'), verifyDocument);
router.delete('/:id', deleteDocument);

export default router;
