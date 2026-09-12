import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { createAuditLog } from '../services/auditService';
import { AuthRequest } from '../middleware/authMiddleware';

// --- DOCUMENT TYPES MANAGEMENT ---
export async function getDocumentTypes(req: AuthRequest, res: Response) {
  try {
    const types = await prisma.documentType.findMany({ orderBy: { name: 'asc' } });
    return res.json({ success: true, data: types });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createDocumentType(req: AuthRequest, res: Response) {
  try {
    const { name, code, category, isRequiredDefault, description } = req.body;
    const docType = await prisma.documentType.create({
      data: {
        name,
        code,
        category: category || 'GENERAL',
        isRequiredDefault: Boolean(isRequiredDefault),
        description,
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userRole: req.user?.role,
      action: 'CREATE_DOCUMENT_TYPE',
      entityType: 'DOCUMENT_TYPE',
      entityId: docType.id,
      description: `Created Document Type '${name}' (${code}).`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Document Type created.', data: docType });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// --- SYSTEM SETTINGS MANAGEMENT ---
export async function getSettings(req: AuthRequest, res: Response) {
  try {
    const settings = await prisma.systemSetting.findMany();
    return res.json({ success: true, data: settings });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateSetting(req: AuthRequest, res: Response) {
  try {
    const { key, value } = req.body;
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value, updatedByUserId: req.user?.id },
      create: { key, value, updatedByUserId: req.user?.id },
    });

    return res.json({ success: true, message: 'Setting updated.', data: setting });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// --- PERMISSIONS MANAGEMENT ---
export async function getPermissions(req: AuthRequest, res: Response) {
  try {
    const permissions = await prisma.rolePermission.findMany();
    return res.json({ success: true, data: permissions });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// --- DATA VERIFICATION CENTER ---
export async function getVerificationData(req: AuthRequest, res: Response) {
  try {
    const { status = 'PENDING' } = req.query; // PENDING, VERIFIED, REJECTED

    const [documents, applications] = await Promise.all([
      prisma.document.findMany({
        where: { status: status as string },
        include: {
          application: { select: { id: true, type: true, customer: { select: { firstName: true, lastName: true } } } },
          uploadedByUser: { select: { firstName: true, lastName: true, email: true } },
          verifiedByUser: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.application.findMany({
        where: { verificationStatus: status as string },
        include: {
          customer: { select: { firstName: true, lastName: true, email: true } },
          assignedAgent: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        documents,
        applications,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
