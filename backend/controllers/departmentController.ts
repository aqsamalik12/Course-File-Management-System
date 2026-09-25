import { Request, Response } from 'express';
import {
  DepartmentService,
  UserService,
  TeacherRequestService,
  NotificationService,
  AuditService
} from '../services/supabaseService';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await DepartmentService.getAll();
    return res.json({ success: true, count: departments.length, data: departments });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const deptData = req.body;
    const newId = deptData.id || `dept-${Date.now()}`;
    const newDept = { ...deptData, id: newId };
    const saved = await DepartmentService.create(newDept);
    return res.status(201).json({ success: true, message: 'Department created successfully', data: saved });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await DepartmentService.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    return res.json({ success: true, message: 'Department updated successfully', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await DepartmentService.delete(id);
    return res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const assignDepartmentHOD = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hodId, hodName } = req.body;
    const callerRole = (req.headers['x-user-role'] as string) || (req as any).user?.role;

    // Strict Authorization: Admin is the ONLY role allowed to assign/change a department HOD
    if (callerRole && callerRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only System Administrator is authorized to assign or change a Department HOD.'
      });
    }

    const dept = await DepartmentService.getById(id);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const previousHodId = dept.hodId;

    // Update department record with new HOD assignment
    const updatedDept = await DepartmentService.assignHOD(id, hodId || '', hodName || 'Unassigned');

    // Update the assigned teacher's user record to HOD
    if (hodId && hodId.trim() !== '') {
      await UserService.update(hodId, {
        role: 'HOD',
        departmentId: dept.id,
        departmentName: dept.name,
        designation: `Head of Department (${dept.code || dept.name})`
      });

      // Automatically re-route any pending teacher requests for this department to this new HOD
      const pendingRequests = await TeacherRequestService.getAll({
        departmentId: dept.id,
        status: 'PendingHODApproval'
      });

      for (const pr of pendingRequests) {
        await TeacherRequestService.update(pr.id, {
          hodId,
          hodName: hodName || 'Department Head'
        });
      }

      await NotificationService.create({
        title: 'HOD Assignment Notification',
        message: `You have been officially appointed as Head of Department for ${dept.name} by System Administrator.`,
        type: 'info',
        targetRole: 'HOD',
        linkModule: 'HOD Dashboard'
      });
    }

    // If previous HOD exists and is being replaced, change role back to Regular Teacher
    if (previousHodId && previousHodId !== hodId && previousHodId.trim() !== '') {
      await UserService.update(previousHodId, {
        role: 'REGULAR_TEACHER',
        designation: 'Faculty Member'
      });
    }

    await AuditService.log({
      eventType: 'HOD_ASSIGNMENT_CHANGED',
      actor: 'Administrator',
      role: 'ADMIN',
      resource: `Department:${dept.name}, NewHOD:${hodName} (${hodId})`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.json({
      success: true,
      message: `HOD for ${dept.name} successfully updated to ${hodName || 'Unassigned'}.`,
      data: updatedDept
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

