import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { createAuditLog } from '../services/auditService';
import { createNotification } from '../services/notificationService';
import { AuthRequest } from '../middleware/authMiddleware';

export async function getTasks(req: AuthRequest, res: Response) {
  try {
    const user = req.user!;
    const { status, applicationId } = req.query;

    const where: any = {};
    if (user.role !== 'SUPER_ADMIN') {
      where.assignedToUserId = user.id;
    }
    if (status) where.status = status;
    if (applicationId) where.applicationId = applicationId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        application: { select: { id: true, type: true, status: true } },
        createdByUser: { select: { firstName: true, lastName: true, role: true } },
        assignedToUser: { select: { firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: tasks });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createTask(req: AuthRequest, res: Response) {
  try {
    const { applicationId, title, description, assignedToUserId, priority = 'MEDIUM', dueDate } = req.body;
    const user = req.user!;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const task = await prisma.task.create({
      data: {
        applicationId: applicationId || null,
        title,
        description,
        createdByUserId: user.id,
        assignedToUserId: assignedToUserId || user.id,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING',
      },
    });

    await createAuditLog({
      userId: user.id,
      userRole: user.role,
      action: 'CREATE_TASK',
      entityType: 'TASK',
      entityId: task.id,
      description: `Created task '${title}'.`,
      ipAddress: req.ip,
    });

    if (assignedToUserId && assignedToUserId !== user.id) {
      await createNotification({
        recipientUserId: assignedToUserId,
        type: 'TASK_ASSIGNED',
        title: 'New Task Assigned',
        message: `Task assigned to you: ${title}`,
        relatedEntity: 'TASK',
        relatedEntityId: task.id,
      });
    }

    return res.status(201).json({ success: true, message: 'Task created.', data: task });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateTaskStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    const user = req.user!;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    await createAuditLog({
      userId: user.id,
      userRole: user.role,
      action: 'UPDATE_TASK_STATUS',
      entityType: 'TASK',
      entityId: task.id,
      description: `Updated task '${task.title}' status to ${status}.`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: `Task status updated to ${status}.`, data: updatedTask });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
