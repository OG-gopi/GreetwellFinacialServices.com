import { Router } from 'express';
import {
  login,
  registerCustomer,
  verifyInviteToken,
  verifyAgentOtp,
  acceptInviteSetupPassword,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  verifyCustomerEmail,
} from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.post('/register', registerCustomer);
router.post('/verify-email/:token', verifyCustomerEmail);
router.get('/invite/:token', verifyInviteToken);
router.post('/invite/:token/verify-otp', verifyAgentOtp);
router.post('/invite/:token/accept', acceptInviteSetupPassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
