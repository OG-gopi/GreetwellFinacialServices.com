import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { createAuditLog } from '../services/auditService';
import { AuthRequest } from '../middleware/authMiddleware';

export async function getReleaseNotes(req: AuthRequest, res: Response) {
  try {
    const userRole = req.user?.role || 'GUEST';

    const where: any = { status: 'PUBLISHED' };

    // Role-based update visibility rule (Section 17.2 Requirement)
    if (userRole !== 'SUPER_ADMIN') {
      where.visibility = { in: ['ALL_USERS', 'AGENTS_AND_CUSTOMERS'] };
    }

    const releaseNotes = await prisma.releaseNote.findMany({
      where,
      orderBy: { releaseDate: 'desc' },
    });

    const versionSetting = await prisma.systemSetting.findUnique({ where: { key: 'VERSION' } });
    const currentVersion = versionSetting ? versionSetting.value : '1.0.0';

    return res.json({
      success: true,
      data: {
        currentVersion,
        releaseNotes,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createReleaseNote(req: AuthRequest, res: Response) {
  try {
    const { version, title, description, updateType = 'NEW_FEATURE', visibility = 'ALL_USERS' } = req.body;
    const user = req.user!;

    if (!version || !title || !description) {
      return res.status(400).json({ success: false, message: 'Version, Title, and Description are required.' });
    }

    const note = await prisma.releaseNote.create({
      data: {
        version,
        title,
        description,
        updateType,
        visibility,
        status: 'PUBLISHED',
      },
    });

    // Update central system setting VERSION
    await prisma.systemSetting.upsert({
      where: { key: 'VERSION' },
      update: { value: version, updatedByUserId: user.id },
      create: { key: 'VERSION', value: version, updatedByUserId: user.id },
    });

    await createAuditLog({
      userId: user.id,
      userRole: user.role,
      action: 'PUBLISH_SYSTEM_UPDATE',
      entityType: 'RELEASE_NOTE',
      entityId: note.id,
      description: `Published version ${version} update: "${title}".`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Release note published.', data: note });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
