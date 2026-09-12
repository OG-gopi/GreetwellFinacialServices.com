import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { createAuditLog } from '../services/auditService';
import { AuthRequest } from '../middleware/authMiddleware';

export async function getApplicationReports(req: AuthRequest, res: Response) {
  try {
    const { startDate, endDate, type, status } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const [total, loanCount, insCount, invCount, statusBreakdown] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.count({ where: { ...where, type: 'LOAN' } }),
      prisma.application.count({ where: { ...where, type: 'INSURANCE' } }),
      prisma.application.count({ where: { ...where, type: 'INVESTMENT' } }),
      prisma.application.groupBy({
        by: ['status'],
        where,
        _count: { _all: true },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        summary: {
          totalApplications: total,
          loanApplications: loanCount,
          insuranceApplications: insCount,
          investmentApplications: invCount,
        },
        statusBreakdown,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getUserReports(req: AuthRequest, res: Response) {
  try {
    const roleBreakdown = await prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
    });

    const statusBreakdown = await prisma.user.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    return res.json({
      success: true,
      data: {
        roleBreakdown,
        statusBreakdown,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAgentPerformanceReports(req: AuthRequest, res: Response) {
  try {
    const agents = await prisma.user.findMany({
      where: { role: { in: ['LOAN_AGENT', 'INSURANCE_AGENT', 'INVESTMENT_AGENT'] } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        _count: {
          select: {
            assignedApplications: true,
          },
        },
      },
    });

    return res.json({ success: true, data: agents });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function exportReportCSV(req: AuthRequest, res: Response) {
  try {
    const { reportType } = req.query; // applications, users, audit
    let csvData = '';

    if (reportType === 'users') {
      const users = await prisma.user.findMany({ take: 50 });
      csvData = 'ID,Email,First Name,Last Name,Role,Status\n';
      users.forEach((u) => {
        csvData += `"${u.id}","${u.email}","${u.firstName}","${u.lastName}","${u.role}","${u.status}"\n`;
      });
    } else {
      const apps = await prisma.application.findMany({ take: 50 });
      csvData = 'Application ID,Customer ID,Type,Status,Amount,Created At\n';
      apps.forEach((a) => {
        csvData += `"${a.id}","${a.customerId}","${a.type}","${a.status}","${a.amount || 0}","${a.createdAt.toISOString()}"\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${reportType || 'report'}_export.csv"`);
    return res.send(csvData);
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
