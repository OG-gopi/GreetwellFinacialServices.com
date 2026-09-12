import { Router } from 'express';
import {
  getUsers,
  getUserById,
  createAgentInvitation,
  inviteCustomer,
  updateUserStatus,
  editUser,
  getInvitations,
  resendAgentInvitation,
  updateCustomerServices,
  requestServiceAccess,
  createUserAccount,
  createSuperAdminInvitation,
  cancelInvitation,
} from '../controllers/userController';
import { authenticate, requireRole, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('users.view'), getUsers);
router.get('/invitations', requireRole('SUPER_ADMIN'), getInvitations);

router.post('/create', requireRole('SUPER_ADMIN'), createUserAccount);
router.post('/invite-superadmin', requireRole('SUPER_ADMIN'), createSuperAdminInvitation);
router.post('/request-service', requestServiceAccess);
router.post('/create-agent', requireRole('SUPER_ADMIN'), createAgentInvitation);
router.post('/invite-customer', requireRole('SUPER_ADMIN', 'LOAN_AGENT', 'INSURANCE_AGENT', 'INVESTMENT_AGENT'), inviteCustomer);
router.post('/invitations/:id/resend', requireRole('SUPER_ADMIN'), resendAgentInvitation);
router.delete('/invitations/:id', requireRole('SUPER_ADMIN'), cancelInvitation);

router.get('/:id', requirePermission('users.view'), getUserById);
router.put('/:id/services', requireRole('SUPER_ADMIN'), updateCustomerServices);
router.put('/:id/status', requireRole('SUPER_ADMIN'), updateUserStatus);
router.put('/:id', requirePermission('users.edit'), editUser);

export default router;
