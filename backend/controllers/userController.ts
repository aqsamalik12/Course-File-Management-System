import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserService, AuditService, HODAssignmentService } from '../services/supabaseService';
import { logger } from '../config/logger';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, status, departmentId, campusId, search } = req.query;
    let users = await UserService.getAll();

    // Filter non-deleted
    users = users.filter((u: any) => !u.deleted);

    // Strict Scope Authorization for HOD:
    const headerUserId = req.headers['x-user-id'] as string;
    const headerRole = req.headers['x-user-role'] as string;
    const user = (req as any).user;
    const callerId = user?.id || headerUserId;
    const callerRole = user?.role || headerRole;

    if (callerRole === 'HOD' && callerId) {
      const assignment = await HODAssignmentService.getActiveByHodId(callerId);
      const hodUser = await UserService.getById(callerId);
      const deptId = assignment?.departmentId || hodUser?.departmentId;
      const campusName = assignment?.campusName || hodUser?.campus;

      if (deptId) {
        users = users.filter((u: any) => {
          const matchDept = u.departmentId === deptId;
          const matchCampus = !campusName || !u.campus || u.campus.toLowerCase() === campusName.toLowerCase();
          return matchDept && matchCampus;
        });
      }
    }

    if (role) users = users.filter((u: any) => u.role === role);
    if (status) users = users.filter((u: any) => u.status === status);
    if (departmentId && callerRole !== 'HOD') users = users.filter((u: any) => u.departmentId === departmentId);
    if (search) {
      const s = String(search).toLowerCase();
      users = users.filter(
        (u: any) =>
          (u.name && u.name.toLowerCase().includes(s)) ||
          (u.email && u.email.toLowerCase().includes(s)) ||
          (u.employeeId && u.employeeId.toLowerCase().includes(s)) ||
          (u.designation && u.designation.toLowerCase().includes(s)) ||
          (u.departmentName && u.departmentName.toLowerCase().includes(s)) ||
          (u.campus && u.campus.toLowerCase().includes(s))
      );
    }

    return res.json({ success: true, count: users.length, data: users });
  } catch (error: any) {
    logger.error(`[getUsers Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const userData = req.body;
    if (!userData.email || !userData.name) {
      return res.status(400).json({ success: false, message: 'Name and Email are required fields.' });
    }

    const cleanEmail = userData.email.toLowerCase().trim();
    const existing = await UserService.getByEmail(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User account with this email already exists.' });
    }

    const newId = userData.id || `user-${Date.now()}`;
    const employeeId = userData.employeeId || `EMP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const plainPassword = userData.password || 'Password@123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = {
      ...userData,
      id: newId,
      employeeId,
      email: cleanEmail,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      loginCount: 0,
      status: userData.status || 'Active',
      deleted: false
    };

    const saved = await UserService.create(newUser);

    await AuditService.log({
      eventType: 'USER_CREATED',
      actor: 'Administrator',
      role: 'ADMIN',
      resource: `User:${saved.name} (${saved.email})`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.status(201).json({ success: true, message: 'User created successfully', data: saved });
  } catch (error: any) {
    logger.error(`[createUser Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await UserService.getById(id);
    if (!user || user.deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, data: user });
  } catch (error: any) {
    logger.error(`[getUserById Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
    }
    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }

    const updated = await UserService.update(id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await AuditService.log({
      eventType: 'USER_UPDATED',
      actor: 'Administrator',
      role: 'ADMIN',
      resource: `User:${updated.name}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.json({ success: true, message: 'User updated successfully', data: updated });
  } catch (error: any) {
    logger.error(`[updateUser Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const user = await UserService.getById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let newStatus = status;
    if (!newStatus) {
      newStatus = user.status === 'Active' ? 'Locked' : 'Active';
    }

    const updated = await UserService.update(id, { status: newStatus });

    const eventType = newStatus === 'Locked' ? 'ACCOUNT_LOCKED' : 'ACCOUNT_UNLOCKED';
    await AuditService.log({
      eventType,
      actor: 'Administrator',
      role: 'ADMIN',
      resource: `User:${user.name}`,
      status: 'SUCCESS',
      severity: 'WARNING'
    });

    return res.json({ success: true, message: `User status updated to ${newStatus}`, data: updated });
  } catch (error: any) {
    logger.error(`[toggleUserStatus Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await UserService.softDelete(id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await AuditService.log({
      eventType: 'USER_DELETED',
      actor: 'Administrator',
      role: 'ADMIN',
      resource: `User:${updated.name || id}`,
      status: 'SUCCESS',
      severity: 'WARNING'
    });

    return res.json({ success: true, message: 'User account soft deleted', data: updated });
  } catch (error: any) {
    logger.error(`[deleteUser Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const passwordToSet = newPassword || 'Teacher@123';
    const hashedPassword = await bcrypt.hash(passwordToSet, 10);

    const user = await UserService.getById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await UserService.update(id, { passwordHash: hashedPassword });

    await AuditService.log({
      eventType: 'PASSWORD_RESET',
      actor: 'Administrator',
      role: 'ADMIN',
      resource: `User:${user.name}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.json({ success: true, message: `Password reset successfully for ${user.name}` });
  } catch (error: any) {
    logger.error(`[resetUserPassword Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};
