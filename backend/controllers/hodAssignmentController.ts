import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { HODAssignmentService, UserService, DepartmentService, CampusService, AuditService } from '../services/supabaseService';
import { logger } from '../config/logger';

// Helper to extract caller info
const getCallerInfo = (req: Request) => {
  const user = (req as any).user;
  const headerUserId = req.headers['x-user-id'] as string;
  const headerRole = req.headers['x-user-role'] as string;
  const headerDeptId = req.headers['x-department-id'] as string;

  return {
    id: user?.id || headerUserId || '',
    role: user?.role || headerRole || 'ADMIN',
    departmentId: user?.departmentId || headerDeptId || '',
    name: user?.name || (req.headers['x-user-name'] as string) || 'Authorized User'
  };
};

/**
 * GET /api/hod-assignments
 * Admin gets all HOD assignments, with optional filtering
 */
export const getHODAssignments = async (req: Request, res: Response) => {
  try {
    const { campusId, departmentId, hodId, status } = req.query;

    const assignments = await HODAssignmentService.getAll({
      campusId: campusId ? String(campusId) : undefined,
      departmentId: departmentId ? String(departmentId) : undefined,
      hodId: hodId ? String(hodId) : undefined,
      status: status ? String(status) : undefined
    });

    return res.json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error: any) {
    logger.error(`[getHODAssignments Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/hod-assignments/my-scope
 * Resolves the authenticated HOD's active Campus + Department scope
 */
export const getMyHODScope = async (req: Request, res: Response) => {
  try {
    const caller = getCallerInfo(req);
    if (!caller.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // 1. Check HODAssignmentService for active assignment
    let assignment = await HODAssignmentService.getActiveByHodId(caller.id);

    // 2. If not found, try to look up user and fallback to department
    if (!assignment) {
      const user = await UserService.getById(caller.id);
      if (user && user.role === 'HOD') {
        const departments = await DepartmentService.getAll();
        const dept = departments.find((d: any) => d.hodId === user.id || d.id === user.departmentId);
        const campusName = user.campus || dept?.campusName || 'Attock Campus';
        const campuses = await CampusService.getAll();
        const camp = campuses.find((c: any) => c.name.toLowerCase() === campusName.toLowerCase() || c.id === dept?.campusId);

        if (dept) {
          assignment = {
            id: `asgn-fallback-${user.id}`,
            hodId: user.id,
            hodName: user.name,
            hodEmail: user.email,
            campusId: camp?.id || dept.campusId || 'camp-attock',
            campusName: camp?.name || campusName,
            departmentId: dept.id,
            departmentName: dept.name,
            status: 'Active',
            assignedDate: user.createdAt || new Date().toISOString()
          };
        }
      }
    }

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'No active HOD scope assignment found for your account. Please contact the administrator.'
      });
    }

    return res.json({
      success: true,
      data: assignment
    });
  } catch (error: any) {
    logger.error(`[getMyHODScope Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/hod-assignments/lookup
 * Teacher profile workflow lookup: Determines the valid HOD assigned by Admin for exact Campus + Department
 */
export const lookupHODForScope = async (req: Request, res: Response) => {
  try {
    const { campusId, departmentId, campusName } = req.query;

    if (!departmentId) {
      return res.status(400).json({ success: false, message: 'departmentId is required' });
    }

    // 1. Try finding by campusId & departmentId
    let assignment = null;
    if (campusId) {
      assignment = await HODAssignmentService.getActiveByScope(String(campusId), String(departmentId));
    }

    // 2. Fallback: match by campusName if campusId didn't match
    if (!assignment && campusName) {
      const allActive = await HODAssignmentService.getAll({
        departmentId: String(departmentId),
        status: 'Active'
      });
      assignment = allActive.find(
        (a: any) => a.campusName && a.campusName.toLowerCase() === String(campusName).toLowerCase()
      );
    }

    // 3. Fallback: Check department table for assigned HOD
    if (!assignment) {
      const dept = await DepartmentService.getById(String(departmentId));
      if (dept && dept.hodId && dept.hodId.trim() !== '') {
        const hodUser = await UserService.getById(dept.hodId);
        assignment = {
          id: `asgn-dept-${dept.id}`,
          hodId: dept.hodId,
          hodName: dept.hodName || hodUser?.name || 'Department HOD',
          hodEmail: hodUser?.email || '',
          campusId: dept.campusId || 'camp-attock',
          campusName: dept.campusName || 'Attock Campus',
          departmentId: dept.id,
          departmentName: dept.name,
          status: 'Active',
          assignedDate: new Date().toISOString()
        };
      }
    }

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'No HOD is currently assigned by Admin for this Campus and Department combination.'
      });
    }

    return res.json({
      success: true,
      data: assignment
    });
  } catch (error: any) {
    logger.error(`[lookupHODForScope Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/hod-assignments
 * Admin creates or updates an HOD assignment
 */
export const createHODAssignment = async (req: Request, res: Response) => {
  try {
    const caller = getCallerInfo(req);

    const {
      campusId,
      departmentId,
      hodId,
      hodName,
      email,
      hodEmail,
      password,
      status = 'Active',
      sessionName,
      academicSession
    } = req.body;

    const targetEmail = (email || hodEmail || '').trim().toLowerCase();

    if (!campusId || !departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: campusId and departmentId are mandatory.'
      });
    }

    // 1. Resolve Campus
    let campus = await CampusService.getById(campusId);
    if (!campus) {
      const allCampuses = await CampusService.getAll();
      campus = allCampuses.find(
        (c: any) => c.id === campusId || c.name.toLowerCase() === String(campusId).toLowerCase()
      );
    }
    if (!campus) {
      return res.status(404).json({ success: false, message: `Campus "${campusId}" not found.` });
    }

    // 2. Resolve Department
    let dept = await DepartmentService.getById(departmentId);
    if (!dept) {
      const allDepts = await DepartmentService.getAll();
      dept = allDepts.find(
        (d: any) =>
          d.id === departmentId ||
          d.code.toLowerCase() === String(departmentId).toLowerCase() ||
          d.name.toLowerCase() === String(departmentId).toLowerCase()
      );
    }
    if (!dept) {
      return res.status(404).json({ success: false, message: `Department "${departmentId}" not found.` });
    }

    // 3. Resolve or Create HOD User with Admin credentials
    let hodUser: any = null;
    const cleanEmail = targetEmail;

    if (cleanEmail) {
      hodUser = await UserService.getByEmail(cleanEmail);
    }
    if (!hodUser && hodId) {
      hodUser = await UserService.getById(hodId);
    }

    if (hodUser) {
      // Existing User: Update to HOD role with assigned scope
      const userUpdates: any = {
        role: 'HOD',
        departmentId: dept.id,
        departmentName: dept.name,
        campus: campus.name,
        campusId: campus.id,
        status: status || 'Active',
        designation: `Head of Department (${dept.name})`
      };
      if (hodName && String(hodName).trim()) {
        userUpdates.name = String(hodName).trim();
      }
      if (password && String(password).trim()) {
        userUpdates.passwordHash = await bcrypt.hash(String(password).trim(), 10);
      }
      hodUser = await UserService.update(hodUser.id, userUpdates);
    } else {
      // New User creation: Email and Password required
      if (!cleanEmail) {
        return res.status(400).json({
          success: false,
          message: 'An HOD email address is required to create HOD login credentials.'
        });
      }

      const finalPassword = password && String(password).trim() ? String(password).trim() : 'hod123';
      const passwordHash = await bcrypt.hash(finalPassword, 10);
      const newUserId = hodId || `usr-hod-${Date.now()}`;

      hodUser = await UserService.create({
        id: newUserId,
        name: (hodName && String(hodName).trim()) || 'Dr. Head of Department',
        email: cleanEmail,
        passwordHash,
        role: 'HOD',
        departmentId: dept.id,
        departmentName: dept.name,
        campus: campus.name,
        campusId: campus.id,
        status: status || 'Active',
        designation: `Head of Department (${dept.name})`,
        phone: req.body.phone || '+92 300 1234567',
        enrollmentStatus: 'Approved',
        createdAt: new Date().toISOString().split('T')[0]
      });
    }

    // 4. If status is Active, deactivate any previous active assignment for this Campus + Department scope
    if (status === 'Active') {
      const existingScopeAssignments = await HODAssignmentService.getAll({
        campusId: campus.id,
        departmentId: dept.id
      });
      for (const prev of existingScopeAssignments) {
        if (prev.status === 'Active') {
          await HODAssignmentService.update(prev.id, { status: 'Inactive' });
        }
      }
    }

    // 5. Create new HOD Assignment
    const id = `asgn-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const assignmentPayload = {
      id,
      hodId: hodUser.id,
      hodName: hodUser.name,
      hodEmail: hodUser.email,
      campusId: campus.id,
      campusName: campus.name,
      departmentId: dept.id,
      departmentName: dept.name,
      status: status as 'Active' | 'Inactive',
      assignedDate: new Date().toISOString(),
      assignedBy: caller.name,
      academicSession: academicSession || sessionName || 'Fall 2026'
    };

    const savedAssignment = await HODAssignmentService.create(assignmentPayload);

    // 6. Synchronize Department record if status is Active
    if (status === 'Active') {
      await DepartmentService.update(dept.id, {
        hodId: hodUser.id,
        hodName: hodUser.name,
        campusId: campus.id,
        campusName: campus.name
      });
    }

    await AuditService.log({
      eventType: 'HOD_ASSIGNMENT_CREATED',
      actor: caller.name,
      role: 'ADMIN',
      resource: `HOD:${hodUser.name} (${hodUser.email}), Campus:${campus.name}, Dept:${dept.name}, Status:${status}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.status(201).json({
      success: true,
      message: `HOD ${hodUser.name} (${hodUser.email}) successfully assigned to ${dept.name} at ${campus.name}.`,
      data: savedAssignment
    });
  } catch (error: any) {
    logger.error(`[createHODAssignment Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/hod-assignments/:id
 * Admin updates an existing HOD assignment (including activate/deactivate)
 */
export const updateHODAssignment = async (req: Request, res: Response) => {
  try {
    const caller = getCallerInfo(req);

    const { id } = req.params;
    const existing = await HODAssignmentService.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'HOD assignment not found.' });
    }

    const updates = req.body;
    const updated = await HODAssignmentService.update(id, updates);

    // If activated, ensure other active assignments for that scope become inactive
    if (updates.status === 'Active') {
      const allScope = await HODAssignmentService.getAll({
        campusId: existing.campusId,
        departmentId: existing.departmentId
      });
      for (const a of allScope) {
        if (a.id !== id && a.status === 'Active') {
          await HODAssignmentService.update(a.id, { status: 'Inactive' });
        }
      }
      await DepartmentService.update(existing.departmentId, {
        hodId: existing.hodId,
        hodName: existing.hodName
      });
      await UserService.update(existing.hodId, { status: 'Active' });
    } else if (updates.status === 'Inactive') {
      // Check if user has other active assignments
      const userActive = await HODAssignmentService.getActiveByHodId(existing.hodId);
      if (!userActive || userActive.id === id) {
        await UserService.update(existing.hodId, { status: 'Inactive' });
      }
    }

    await AuditService.log({
      eventType: 'HOD_ASSIGNMENT_UPDATED',
      actor: caller.name,
      role: 'ADMIN',
      resource: `Assignment:${id}, Status:${updates.status || existing.status}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.json({
      success: true,
      message: 'HOD assignment updated successfully.',
      data: updated
    });
  } catch (error: any) {
    logger.error(`[updateHODAssignment Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/hod-assignments/:id/reset-password
 * Admin resets the password for the HOD in an assignment
 */
export const resetHODPassword = async (req: Request, res: Response) => {
  try {
    const caller = getCallerInfo(req);

    const { id } = req.params;
    const { password, newPassword } = req.body;
    const finalPassword = password || newPassword;

    if (!finalPassword || String(finalPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const assignment = await HODAssignmentService.getById(id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'HOD assignment not found.' });
    }

    let hodUser = await UserService.getById(assignment.hodId);
    if (!hodUser && assignment.hodEmail) {
      hodUser = await UserService.getByEmail(assignment.hodEmail);
    }

    if (!hodUser) {
      return res.status(404).json({ success: false, message: 'Associated HOD user account not found.' });
    }

    const hashedPassword = await bcrypt.hash(String(finalPassword).trim(), 10);
    await UserService.update(hodUser.id, {
      passwordHash: hashedPassword,
      status: 'Active'
    });

    await AuditService.log({
      eventType: 'HOD_PASSWORD_RESET',
      actor: caller.name,
      role: 'ADMIN',
      resource: `HOD:${hodUser.name} (${hodUser.email})`,
      status: 'SUCCESS',
      severity: 'WARNING'
    });

    return res.json({
      success: true,
      message: `Password for HOD ${hodUser.name} has been reset successfully. They can now log in with the new password.`
    });
  } catch (error: any) {
    logger.error(`[resetHODPassword Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/hod-assignments/:id
 * Admin deletes an HOD assignment
 */
export const deleteHODAssignment = async (req: Request, res: Response) => {
  try {
    const caller = getCallerInfo(req);

    const { id } = req.params;
    await HODAssignmentService.delete(id);

    return res.json({
      success: true,
      message: 'HOD assignment removed successfully.'
    });
  } catch (error: any) {
    logger.error(`[deleteHODAssignment Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};
