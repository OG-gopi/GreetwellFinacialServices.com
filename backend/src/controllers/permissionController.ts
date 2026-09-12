import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { createAuditLog } from '../services/auditService';
import { AuthRequest } from '../middleware/authMiddleware';

// Roles
export async function getRoles(req: AuthRequest, res: Response) {
  try {
    const roles = await prisma.customRole.findMany({ orderBy: { name: 'asc' } });
    return res.json({ success: true, data: roles });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createRole(req: AuthRequest, res: Response) {
  try {
    const { name, code, description } = req.body;
    const role = await prisma.customRole.create({
      data: { name, code, description },
    });
    return res.status(201).json({ success: true, message: 'Role created.', data: role });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Menu Permissions
export async function getMenuPermissions(req: AuthRequest, res: Response) {
  try {
    const menuPerms = await prisma.roleMenuPermission.findMany({ include: { menu: true } });
    return res.json({ success: true, data: menuPerms });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createMenuPermission(req: AuthRequest, res: Response) {
  try {
    const { menuId, role, canView } = req.body;
    const perm = await prisma.roleMenuPermission.create({
      data: { menuId, role, canView: canView ?? true },
    });
    return res.status(201).json({ success: true, message: 'Menu permission created.', data: perm });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Method Permissions
export async function getMethodPermissions(req: AuthRequest, res: Response) {
  try {
    const methodPerms = await prisma.methodPermissionDef.findMany();
    return res.json({ success: true, data: methodPerms });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function createMethodPermission(req: AuthRequest, res: Response) {
  try {
    const { methodName, endpoint, httpMethod, permissionType, description } = req.body;
    const perm = await prisma.methodPermissionDef.create({
      data: { methodName, endpoint, httpMethod, permissionType, description },
    });

    await createAuditLog({
      userId: req.user?.id,
      userRole: req.user?.role,
      action: 'CREATE_METHOD_PERMISSION',
      entityType: 'METHOD_PERMISSION',
      entityId: perm.id,
      description: `Created method permission ${perm.httpMethod} ${perm.endpoint} (${perm.methodName}).`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Method permission created.', data: perm });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Permission Groups
export async function getPermissionGroups(req: AuthRequest, res: Response) {
  try {
    const groups = await prisma.permissionGroup.findMany();
    return res.json({ success: true, data: groups });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
