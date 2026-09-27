import { Request, Response } from 'express';
import {
  DepartmentService,
  CampusService,
  UserService,
  TeacherRequestService,
  NotificationService,
  AuditService
} from '../services/supabaseService';
import { logger } from '../config/logger';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const { campusId } = req.query;
    let departments = await DepartmentService.getAll();

    if (campusId && typeof campusId === 'string' && campusId.trim() !== '') {
      const cleanCampusId = campusId.trim();
      departments = departments.filter(
        (d: any) => d.campusId === cleanCampusId || d.campusName === cleanCampusId
      );
    }

    return res.json({ success: true, count: departments.length, data: departments });
  } catch (error: any) {
    logger.error(`[getDepartments Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Unable to load departments. Please try again.' });
  }
};

export const getDepartmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const department = await DepartmentService.getById(id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }
    return res.json({ success: true, data: department });
  } catch (error: any) {
    logger.error(`[getDepartmentById Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { campusId, name, code, status } = req.body;

    // 1. Campus Validation (Department ALWAYS belongs to a Campus)
    if (!campusId || typeof campusId !== 'string' || !campusId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Campus is required. Please select a valid campus.'
      });
    }

    const trimmedCampusId = campusId.trim();
    // Lookup campus by ID or exact name
    const campuses = await CampusService.getAll();
    const campus = campuses.find(
      (c: any) => c.id === trimmedCampusId || c.name.toLowerCase() === trimmedCampusId.toLowerCase()
    );

    if (!campus) {
      return res.status(400).json({
        success: false,
        message: 'Selected campus does not exist or is invalid.'
      });
    }

    // 2. Department Name Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department Name is required.'
      });
    }

    // 3. Department Code Validation
    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department Code is required.'
      });
    }

    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();

    // 4. Duplicate Department Prevention (scoped to Campus + Department Name/Code)
    const existing = await DepartmentService.findByCampusAndNameOrCode(
      campus.id,
      trimmedName,
      trimmedCode
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This department already exists for the selected campus.'
      });
    }

    const newId = req.body.id || `dept-${Date.now()}`;
    const newDept = {
      id: newId,
      name: trimmedName,
      code: trimmedCode,
      campusId: campus.id,
      campusName: campus.name,
      status: status === 'Inactive' ? 'Inactive' : 'Active'
    };

    const saved = await DepartmentService.create(newDept);

    await AuditService.log({
      eventType: 'DEPARTMENT_CREATED',
      actor: (req.headers['x-user-name'] as string) || (req as any).user?.name || 'Administrator',
      role: 'ADMIN',
      resource: `Department:${saved.name} (${saved.code}) at Campus:${campus.name}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.status(201).json({
      success: true,
      message: 'Department added successfully.',
      data: saved
    });
  } catch (error: any) {
    logger.error(`[createDepartment Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingDept = await DepartmentService.getById(id);
    if (!existingDept) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const { campusId, name, code, status } = req.body;

    let targetCampusId = existingDept.campusId;
    let targetCampusName = existingDept.campusName;

    if (campusId && typeof campusId === 'string' && campusId.trim() !== '') {
      const trimmedCampusId = campusId.trim();
      const campuses = await CampusService.getAll();
      const campus = campuses.find(
        (c: any) => c.id === trimmedCampusId || c.name.toLowerCase() === trimmedCampusId.toLowerCase()
      );
      if (!campus) {
        return res.status(400).json({ success: false, message: 'Selected campus does not exist or is invalid.' });
      }
      targetCampusId = campus.id;
      targetCampusName = campus.name;
    }

    const targetName = name !== undefined && typeof name === 'string' ? name.trim() : existingDept.name;
    const targetCode = code !== undefined && typeof code === 'string' ? code.trim().toUpperCase() : existingDept.code;

    // Check duplicate uniqueness within target campus
    if (name || code || campusId) {
      const duplicate = await DepartmentService.findByCampusAndNameOrCode(
        targetCampusId,
        targetName,
        targetCode,
        id
      );
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'This department already exists for the selected campus.'
        });
      }
    }

    const updates: any = {};
    if (name !== undefined && typeof name === 'string') updates.name = targetName;
    if (code !== undefined && typeof code === 'string') updates.code = targetCode;
    if (status !== undefined) updates.status = status === 'Inactive' ? 'Inactive' : 'Active';
    if (campusId !== undefined) {
      updates.campusId = targetCampusId;
      updates.campusName = targetCampusName;
    }

    const updated = await DepartmentService.update(id, updates);

    await AuditService.log({
      eventType: 'DEPARTMENT_UPDATED',
      actor: (req.headers['x-user-name'] as string) || (req as any).user?.name || 'Administrator',
      role: 'ADMIN',
      resource: `Department:${updated.name}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.json({
      success: true,
      message: 'Department updated successfully.',
      data: updated
    });
  } catch (error: any) {
    logger.error(`[updateDepartment Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dept = await DepartmentService.getById(id);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    await DepartmentService.delete(id);

    await AuditService.log({
      eventType: 'DEPARTMENT_DELETED',
      actor: (req.headers['x-user-name'] as string) || (req as any).user?.name || 'Administrator',
      role: 'ADMIN',
      resource: `DepartmentId:${id} (${dept.name})`,
      status: 'SUCCESS',
      severity: 'WARNING'
    });

    return res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (error: any) {
    logger.error(`[deleteDepartment Error] ${error.message}`);
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
