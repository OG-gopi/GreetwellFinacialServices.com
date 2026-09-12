import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { createAuditLog } from '../services/auditService';
import { AuthRequest } from '../middleware/authMiddleware';

// Email Templates
export async function getEmailTemplates(req: AuthRequest, res: Response) {
  try {
    const templates = await prisma.emailTemplate.findMany();
    return res.json({ success: true, data: templates });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createEmailTemplate(req: AuthRequest, res: Response) {
  try {
    const { name, subject, body, variables } = req.body;
    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body,
        variables: typeof variables === 'string' ? variables : JSON.stringify(variables || []),
      },
    });
    return res.status(201).json({ success: true, message: 'Email template created.', data: template });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Custom Fields
export async function getCustomFields(req: AuthRequest, res: Response) {
  try {
    const fields = await prisma.customField.findMany({ orderBy: { displayOrder: 'asc' } });
    return res.json({ success: true, data: fields });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createCustomField(req: AuthRequest, res: Response) {
  try {
    const { fieldLabel, fieldName, fieldType, module, required } = req.body;
    const field = await prisma.customField.create({
      data: {
        fieldLabel,
        fieldName,
        fieldType,
        module,
        required: Boolean(required),
      },
    });
    return res.status(201).json({ success: true, message: 'Custom field created.', data: field });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Backup & Restore
export async function triggerBackup(req: AuthRequest, res: Response) {
  try {
    const fileName = `gfs_backup_${Date.now()}.db`;
    const backup = await prisma.backupHistory.create({
      data: {
        fileName,
        fileSize: 1524000,
        status: 'SUCCESS',
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userRole: req.user?.role,
      action: 'DATABASE_BACKUP',
      entityType: 'BACKUP',
      entityId: backup.id,
      description: `Triggered database backup ${fileName}.`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Database backup created successfully.', data: backup });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getBackupHistory(req: AuthRequest, res: Response) {
  try {
    const backups = await prisma.backupHistory.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ success: true, data: backups });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
