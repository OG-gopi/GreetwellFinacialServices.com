import { Router } from 'express';
import {
  getEnquiries,
  getEnquiryById,
  getUserApplications,
  createEnquiry,
  addEnquiryMessage,
  updateEnquiryStatus,
  getComplaintCategories,
} from '../controllers/enquiryController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getEnquiries);
router.get('/my-applications', getUserApplications);
router.get('/categories', getComplaintCategories);
router.get('/:id', getEnquiryById);
router.post('/', createEnquiry);
router.post('/:id/messages', addEnquiryMessage);
router.put('/:id/status', updateEnquiryStatus);

export default router;
