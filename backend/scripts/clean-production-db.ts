import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function cleanProductionDatabase() {
  console.log('🧹 Starting database cleanup: Retaining ONLY Super Admin credentials and core system configurations...');

  try {
    // 1. Delete transactional data dependent on applications
    const deletedDocs = await prisma.document.deleteMany();
    console.log(`✓ Cleared ${deletedDocs.count} Document records`);

    const deletedReqs = await prisma.applicationRequirement.deleteMany();
    console.log(`✓ Cleared ${deletedReqs.count} ApplicationRequirement records`);

    const deletedNotes = await prisma.note.deleteMany();
    console.log(`✓ Cleared ${deletedNotes.count} Note records`);

    const deletedTasks = await prisma.task.deleteMany();
    console.log(`✓ Cleared ${deletedTasks.count} Task records`);

    const deletedApps = await prisma.application.deleteMany();
    console.log(`✓ Cleared ${deletedApps.count} Application records`);

    // 2. Delete support & enquiry tickets
    const deletedEnquiryHistory = await prisma.enquiryHistory.deleteMany();
    console.log(`✓ Cleared ${deletedEnquiryHistory.count} EnquiryHistory records`);

    const deletedEnquiryMsgs = await prisma.enquiryMessage.deleteMany();
    console.log(`✓ Cleared ${deletedEnquiryMsgs.count} EnquiryMessage records`);

    const deletedEnquiries = await prisma.enquiry.deleteMany();
    console.log(`✓ Cleared ${deletedEnquiries.count} Enquiry records`);

    // 3. Delete system logs, notifications, and reports
    const deletedNotifications = await prisma.notification.deleteMany();
    console.log(`✓ Cleared ${deletedNotifications.count} Notification records`);

    const deletedAuditLogs = await prisma.auditLog.deleteMany();
    console.log(`✓ Cleared ${deletedAuditLogs.count} AuditLog records`);

    const deletedReports = await prisma.report.deleteMany();
    console.log(`✓ Cleared ${deletedReports.count} Report records`);

    const deletedBackups = await prisma.backupHistory.deleteMany();
    console.log(`✓ Cleared ${deletedBackups.count} BackupHistory records`);

    const deletedWhatsApp = await prisma.whatsAppLog.deleteMany();
    console.log(`✓ Cleared ${deletedWhatsApp.count} WhatsAppLog records`);

    const deletedWebsiteHistory = await prisma.websiteChangeHistory.deleteMany();
    console.log(`✓ Cleared ${deletedWebsiteHistory.count} WebsiteChangeHistory records`);

    const deletedInvitations = await prisma.invitation.deleteMany();
    console.log(`✓ Cleared ${deletedInvitations.count} Invitation records`);

    // 4. Nullify foreign key references in configuration/cms tables before user deletion
    await prisma.systemSetting.updateMany({
      data: { updatedByUserId: null },
    });
    await prisma.websiteMedia.updateMany({
      data: { createdByUserId: null },
    });

    // 5. Delete non-SuperAdmin users (preserve SUPER_ADMIN accounts)
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        role: {
          not: 'SUPER_ADMIN',
        },
      },
    });
    console.log(`✓ Cleared ${deletedUsers.count} non-SuperAdmin User records (Agents & Customers)`);

    // 6. Clean dummy document files from disk (preserve media folder)
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let removedCount = 0;
      for (const file of files) {
        if (file.startsWith('doc-') || file.endsWith('.pdf') || file.endsWith('.PNG') || file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
          const filePath = path.join(uploadsDir, file);
          if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
            removedCount++;
          }
        }
      }
      console.log(`✓ Cleaned ${removedCount} uploaded dummy document files from disk (${uploadsDir})`);
    }

    // 7. Verify Super Admin accounts in database
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, status: true },
    });

    console.log('\n👑 Preserved Active Super Admin Accounts:');
    superAdmins.forEach((sa) => {
      console.log(` - ${sa.firstName} ${sa.lastName || ''} (${sa.email}) | Role: ${sa.role} | Status: ${sa.status}`);
    });

    console.log('\n✨ Database clean-up completed successfully! All dummy users, applications, documents, tickets, and notifications removed. Ready for production work!');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanProductionDatabase();
