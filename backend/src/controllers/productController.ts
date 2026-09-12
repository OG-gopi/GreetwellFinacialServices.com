import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { createAuditLog } from '../services/auditService';
import { AuthRequest } from '../middleware/authMiddleware';

// --- LOAN PRODUCTS ---
export async function getLoanProducts(req: AuthRequest, res: Response) {
  try {
    const products = await prisma.loanProduct.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: products });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createLoanProduct(req: AuthRequest, res: Response) {
  try {
    const { name, code, category, interestRate, minAmount, maxAmount, description } = req.body;
    const product = await prisma.loanProduct.create({
      data: {
        name,
        code,
        category,
        interestRate: parseFloat(interestRate),
        minAmount: parseFloat(minAmount),
        maxAmount: parseFloat(maxAmount),
        description,
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userRole: req.user?.role,
      action: 'CREATE_LOAN_PRODUCT',
      entityType: 'LOAN_PRODUCT',
      entityId: product.id,
      description: `Created Loan Product '${name}' (${code}).`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Loan Product created.', data: product });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateLoanProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, category, interestRate, minAmount, maxAmount, description, isActive } = req.body;

    const product = await prisma.loanProduct.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(interestRate !== undefined && { interestRate: parseFloat(interestRate) }),
        ...(minAmount !== undefined && { minAmount: parseFloat(minAmount) }),
        ...(maxAmount !== undefined && { maxAmount: parseFloat(maxAmount) }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userRole: req.user?.role,
      action: 'UPDATE_LOAN_PRODUCT',
      entityType: 'LOAN_PRODUCT',
      entityId: product.id,
      description: `Updated Loan Product '${product.name}'.`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Loan Product updated.', data: product });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// --- INSURANCE PRODUCTS ---
export async function getInsuranceProducts(req: AuthRequest, res: Response) {
  try {
    const products = await prisma.insuranceProduct.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: products });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createInsuranceProduct(req: AuthRequest, res: Response) {
  try {
    const { name, code, type, coverageAmount, premiumAmount, description } = req.body;
    const product = await prisma.insuranceProduct.create({
      data: {
        name,
        code,
        type,
        coverageAmount: parseFloat(coverageAmount),
        premiumAmount: parseFloat(premiumAmount),
        description,
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userRole: req.user?.role,
      action: 'CREATE_INSURANCE_PRODUCT',
      entityType: 'INSURANCE_PRODUCT',
      entityId: product.id,
      description: `Created Insurance Product '${name}' (${code}).`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Insurance Product created.', data: product });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateInsuranceProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, type, coverageAmount, premiumAmount, description, isActive } = req.body;

    const product = await prisma.insuranceProduct.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(coverageAmount !== undefined && { coverageAmount: parseFloat(coverageAmount) }),
        ...(premiumAmount !== undefined && { premiumAmount: parseFloat(premiumAmount) }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return res.json({ success: true, message: 'Insurance Product updated.', data: product });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// --- INVESTMENT PRODUCTS ---
export async function getInvestmentProducts(req: AuthRequest, res: Response) {
  try {
    const products = await prisma.investmentProduct.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: products });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createInvestmentProduct(req: AuthRequest, res: Response) {
  try {
    const { name, code, riskLevel, expectedReturnRate, minInvestment, description } = req.body;
    const product = await prisma.investmentProduct.create({
      data: {
        name,
        code,
        riskLevel,
        expectedReturnRate: parseFloat(expectedReturnRate),
        minInvestment: parseFloat(minInvestment),
        description,
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userRole: req.user?.role,
      action: 'CREATE_INVESTMENT_PRODUCT',
      entityType: 'INVESTMENT_PRODUCT',
      entityId: product.id,
      description: `Created Investment Product '${name}' (${code}).`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Investment Product created.', data: product });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateInvestmentProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, riskLevel, expectedReturnRate, minInvestment, description, isActive } = req.body;

    const product = await prisma.investmentProduct.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(riskLevel && { riskLevel }),
        ...(expectedReturnRate !== undefined && { expectedReturnRate: parseFloat(expectedReturnRate) }),
        ...(minInvestment !== undefined && { minInvestment: parseFloat(minInvestment) }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return res.json({ success: true, message: 'Investment Product updated.', data: product });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
