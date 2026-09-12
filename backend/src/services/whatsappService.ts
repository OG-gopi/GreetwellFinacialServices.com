import { prisma } from '../utils/prisma';
import { CONFIG } from '../config';

export interface WhatsAppNotificationPayload {
  to: string; // Recipient mobile number
  recipientName?: string;
  templateType: 'REGISTRATION' | 'INVITATION' | 'APP_SUBMITTED' | 'STATUS_UPDATE' | 'DOCUMENT_REQUEST' | 'CUSTOMER_REPLY';
  message: string;
  applicationId?: string;
  metadata?: Record<string, any>;
}

export class WhatsAppService {
  async sendNotification(payload: WhatsAppNotificationPayload): Promise<boolean> {
    const { to, recipientName, templateType, message, applicationId, metadata } = payload;

    try {
      // 1. Log to console for dev / testing fallback
      console.log(`\n==================================================`);
      console.log(`📱 [DEV WHATSAPP SERVICE]`);
      console.log(`To: ${to} (${recipientName || 'User'})`);
      console.log(`Template: ${templateType}`);
      if (applicationId) console.log(`Application ID: ${applicationId}`);
      console.log(`Message:\n${message}`);
      console.log(`==================================================\n`);

      // 2. Persist log record into DB WhatsAppLog table
      await prisma.whatsAppLog.create({
        data: {
          recipientPhone: to,
          recipientName: recipientName || null,
          templateType,
          message,
          status: 'SENT',
          applicationId: applicationId || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
        },
      });

      return true;
    } catch (err) {
      console.error('Failed to record WhatsApp notification log:', err);
      // Fallback: log to console if DB fails
      try {
        await prisma.whatsAppLog.create({
          data: {
            recipientPhone: to,
            recipientName: recipientName || null,
            templateType,
            message,
            status: 'FAILED',
            applicationId: applicationId || null,
            metadata: JSON.stringify({ error: String(err), ...(metadata || {}) }),
          },
        });
      } catch (innerErr) {
        // Ignore DB save errors for fallback
      }
      return false;
    }
  }

  async notifyApplicationCreated(to: string, customerName: string, applicationId: string, appType: string, status: string) {
    const message = `Hello ${customerName},\nYour ${appType} application ${applicationId} has been successfully submitted to GFS Portal.\nCurrent Status: ${status}.\nTrack application: ${CONFIG.APP_URL}/customer/applications`;
    return this.sendNotification({
      to,
      recipientName: customerName,
      templateType: 'APP_SUBMITTED',
      message,
      applicationId,
      metadata: { appType, status },
    });
  }

  async notifyStatusUpdate(to: string, recipientName: string, applicationId: string, appType: string, newStatus: string) {
    const message = `Hello ${recipientName},\nYour ${appType} application ${applicationId} status has been updated to: ${newStatus}.\nView details: ${CONFIG.APP_URL}/customer/applications`;
    return this.sendNotification({
      to,
      recipientName,
      templateType: 'STATUS_UPDATE',
      message,
      applicationId,
      metadata: { appType, newStatus },
    });
  }

  async notifyDocumentRequest(to: string, customerName: string, applicationId: string, requestTitle: string, description?: string) {
    const message = `Hello ${customerName},\nAttention Required for Application ${applicationId}:\nRequest: ${requestTitle}${description ? `\nDetails: ${description}` : ''}\nPlease upload requested documents: ${CONFIG.APP_URL}/customer/applications`;
    return this.sendNotification({
      to,
      recipientName: customerName,
      templateType: 'DOCUMENT_REQUEST',
      message,
      applicationId,
      metadata: { requestTitle, description },
    });
  }

  async notifyCustomerReply(to: string, recipientName: string, applicationId: string, requestTitle: string) {
    const message = `Hello ${recipientName},\nCustomer has replied to request '${requestTitle}' on Application ${applicationId}.\nReview update: ${CONFIG.APP_URL}/superadmin/applications`;
    return this.sendNotification({
      to,
      recipientName,
      templateType: 'CUSTOMER_REPLY',
      message,
      applicationId,
      metadata: { requestTitle },
    });
  }
}

export const whatsAppService = new WhatsAppService();
