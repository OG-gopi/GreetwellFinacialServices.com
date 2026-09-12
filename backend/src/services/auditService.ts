import { prisma } from '../utils/prisma';

export interface CreateAuditLogInput {
  userId?: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export async function createAuditLog(input: CreateAuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: input.userId || null,
        userRole: input.userRole || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        description: input.description,
        ipAddress: input.ipAddress || null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (err) {
    console.error('❌ Failed to log audit event:', err);
    return null;
  }
}
