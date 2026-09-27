import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserService, HODAssignmentService, DepartmentService, CampusService } from '../services/supabaseService';
import { logger } from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'cfms_attock_campus_secret_key_2026';

export interface HODScope {
  hodId: string;
  hodName: string;
  hodEmail: string;
  campusId: string;
  campusName: string;
  departmentId: string;
  departmentName: string;
  status: string;
}

export interface HODRequest extends Request {
  hodUser?: any;
  hodScope?: HODScope;
}

/**
 * Strict HOD Authorization Middleware
 * Enforces:
 * 1. Authentication (JWT token or user identity headers)
 * 2. Role verification (must be HOD)
 * 3. Account status (must not be Inactive or Locked)
 * 4. Active HOD assignment resolution from database (Campus + Department)
 * 5. Inactive assignment rejection (blocks deactivated HODs)
 */
export const authenticateHOD = async (req: HODRequest, res: Response, next: NextFunction) => {
  try {
    let userId = req.headers['x-user-id'] as string;
    let userEmail = (req.headers['x-user-email'] as string || '').trim().toLowerCase();
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded?.id) userId = decoded.id;
        if (decoded?.email) userEmail = String(decoded.email).trim().toLowerCase();
      } catch {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token.'
        });
      }
    }

    if (!userId && !userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in as HOD.'
      });
    }

    let user = userId ? await UserService.getById(userId) : null;
    if (!user && userEmail) {
      user = await UserService.getByEmail(userEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    // Role check
    if (user.role !== 'HOD') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access restricted to Head of Department (HOD) role.'
      });
    }

    // Account status check
    if (user.status === 'Inactive' || user.status === 'Locked') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Your HOD account has been deactivated or locked by Administrator.'
      });
    }

    // Check HOD assignment from HODAssignmentService (Source of Truth)
    let activeAsgn = await HODAssignmentService.getActiveByHodId(user.id);
    if (!activeAsgn && user.email) {
      const allActive = await HODAssignmentService.getAll({ status: 'Active' });
      activeAsgn = allActive.find(
        (a: any) => a.hodEmail && a.hodEmail.toLowerCase() === user.email.toLowerCase()
      );
    }

    // Check if there is an explicitly Inactive assignment for this HOD
    const allAssignments = await HODAssignmentService.getAll({});
    const existingAsgn = allAssignments.find(
      (a: any) => a.hodId === user.id || (a.hodEmail && user.email && a.hodEmail.toLowerCase() === user.email.toLowerCase())
    );

    if (existingAsgn && existingAsgn.status === 'Inactive' && !activeAsgn) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Your HOD assignment is currently Inactive. Contact Administrator.'
      });
    }

    // Fallback resolution from department record if assignment not created in table yet
    if (!activeAsgn) {
      const deptId = user.departmentId;
      if (deptId) {
        const dept = await DepartmentService.getById(deptId);
        if (dept) {
          const campuses = await CampusService.getAll();
          const camp = campuses.find((c: any) => c.id === dept.campusId || c.name === dept.campusName || c.name === user.campus);
          activeAsgn = {
            hodId: user.id,
            hodName: user.name,
            hodEmail: user.email,
            campusId: camp?.id || dept.campusId || 'camp-attock',
            campusName: camp?.name || dept.campusName || user.campus || 'Attock Campus',
            departmentId: dept.id,
            departmentName: dept.name,
            status: 'Active'
          };
        }
      }
    }

    if (!activeAsgn || activeAsgn.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: No active HOD assignment found for your account. Please contact Administrator.'
      });
    }

    req.hodUser = user;
    req.hodScope = {
      hodId: user.id,
      hodName: user.name,
      hodEmail: user.email,
      campusId: activeAsgn.campusId,
      campusName: activeAsgn.campusName,
      departmentId: activeAsgn.departmentId,
      departmentName: activeAsgn.departmentName,
      status: activeAsgn.status
    };

    next();
  } catch (error: any) {
    logger.error(`[authenticateHOD Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message || 'Authorization error' });
  }
};
