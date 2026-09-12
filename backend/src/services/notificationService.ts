import { prisma } from '../utils/prisma';

export interface CreateNotificationInput {
  recipientUserId: string;
  type: string;
  title: string;
  message: string;
  module?: string;
  source?: string;
  actionStatus?: string;
  recipientRole?: string;
  customerId?: string;
  agentId?: string;
  applicationId?: string;
  documentId?: string;
  commentId?: string;
  relatedEntity?: string;
  relatedEntityId?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    return await prisma.notification.create({
      data: {
        recipientUserId: input.recipientUserId,
        type: input.type,
        title: input.title,
        message: input.message,
        module: input.module || 'GENERAL',
        source: input.source || 'SYSTEM',
        actionStatus: input.actionStatus || 'NONE',
        recipientRole: input.recipientRole || null,
        customerId: input.customerId || null,
        agentId: input.agentId || null,
        applicationId: input.applicationId || null,
        documentId: input.documentId || null,
        commentId: input.commentId || null,
        relatedEntity: input.relatedEntity || null,
        relatedEntityId: input.relatedEntityId || null,
      },
    });
  } catch (err) {
    console.error('❌ Failed to create notification:', err);
    return null;
  }
}

export async function notifySuperAdmins(
  type: string,
  title: string,
  message: string,
  options?: {
    module?: string;
    source?: string;
    actionStatus?: string;
    customerId?: string;
    agentId?: string;
    applicationId?: string;
    documentId?: string;
    relatedEntity?: string;
    relatedEntityId?: string;
  }
) {
  try {
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
      select: { id: true },
    });

    for (const admin of superAdmins) {
      await createNotification({
        recipientUserId: admin.id,
        recipientRole: 'SUPER_ADMIN',
        type,
        title,
        message,
        module: options?.module || 'GENERAL',
        source: options?.source || 'SYSTEM',
        actionStatus: options?.actionStatus || 'NONE',
        customerId: options?.customerId,
        agentId: options?.agentId,
        applicationId: options?.applicationId,
        documentId: options?.documentId,
        relatedEntity: options?.relatedEntity,
        relatedEntityId: options?.relatedEntityId,
      });
    }
  } catch (err) {
    console.error('❌ Failed to notify super admins:', err);
  }
}

export async function notifyUser(
  recipientUserId: string,
  type: string,
  title: string,
  message: string,
  options?: {
    module?: string;
    source?: string;
    actionStatus?: string;
    recipientRole?: string;
    customerId?: string;
    agentId?: string;
    applicationId?: string;
    documentId?: string;
    relatedEntity?: string;
    relatedEntityId?: string;
  }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: recipientUserId },
      select: { role: true },
    });
    return await createNotification({
      recipientUserId,
      recipientRole: options?.recipientRole || user?.role || 'CUSTOMER',
      type,
      title,
      message,
      module: options?.module || 'GENERAL',
      source: options?.source || 'SYSTEM',
      actionStatus: options?.actionStatus || 'NONE',
      customerId: options?.customerId,
      agentId: options?.agentId,
      applicationId: options?.applicationId,
      documentId: options?.documentId,
      relatedEntity: options?.relatedEntity,
      relatedEntityId: options?.relatedEntityId,
    });
  } catch (err) {
    console.error(`❌ Failed to notify user ${recipientUserId}:`, err);
    return null;
  }
}
