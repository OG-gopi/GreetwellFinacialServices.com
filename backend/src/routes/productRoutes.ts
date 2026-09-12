import { Router } from 'express';
import {
  getLoanProducts,
  createLoanProduct,
  updateLoanProduct,
  getInsuranceProducts,
  createInsuranceProduct,
  updateInsuranceProduct,
  getInvestmentProducts,
  createInvestmentProduct,
  updateInvestmentProduct,
} from '../controllers/productController';
import { authenticate, requireRole, requirePermission } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Loan Products
router.get('/loan', getLoanProducts);
router.post('/loan', requireRole('SUPER_ADMIN'), requirePermission('products.create'), createLoanProduct);
router.put('/loan/:id', requireRole('SUPER_ADMIN'), requirePermission('products.edit'), updateLoanProduct);

// Insurance Products
router.get('/insurance', getInsuranceProducts);
router.post('/insurance', requireRole('SUPER_ADMIN'), requirePermission('products.create'), createInsuranceProduct);
router.put('/insurance/:id', requireRole('SUPER_ADMIN'), requirePermission('products.edit'), updateInsuranceProduct);

// Investment Products
router.get('/investment', getInvestmentProducts);
router.post('/investment', requireRole('SUPER_ADMIN'), requirePermission('products.create'), createInvestmentProduct);
router.put('/investment/:id', requireRole('SUPER_ADMIN'), requirePermission('products.edit'), updateInvestmentProduct);

export default router;
