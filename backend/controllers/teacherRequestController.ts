import { Request, Response } from 'express';
import {
  TeacherRequestService,
  DepartmentService,
  CourseService,
  UserService,
  NotificationService,
  AuditService
} from '../services/supabaseService';
import { logger } from '../config/logger';

// Helper to extract caller role and department from token/header if available
const getCallerInfo = (req: Request) => {
  // If set by auth middleware or headers
  const user = (req as any).user;
  const headerRole = req.headers['x-user-role'] as string;
  const headerDeptId = req.headers['x-department-id'] as string;
  const headerUserId = req.headers['x-user-id'] as string;

  return {
    id: user?.id || headerUserId || '',
    role: user?.role || headerRole || 'ADMIN',
    departmentId: user?.departmentId || headerDeptId || '',
    name: user?.name || (req.headers['x-user-name'] as string) || 'Authorized User'
  };
};

export const getTeacherRequests = async (req: Request, res: Response) => {
  try {
    const caller = getCallerInfo(req);
    const { departmentId, status, teacherId, search } = req.query;

    let filterDeptId = departmentId ? String(departmentId) : undefined;

    // Strict Authorization for HOD:
    // A HOD must NEVER be able to see requests from another department!
    if (caller.role === 'HOD' && caller.departmentId) {
      filterDeptId = caller.departmentId;
    }

    // Teacher can only view their own requests
    let filterTeacherId = teacherId ? String(teacherId) : undefined;
    if ((caller.role === 'REGULAR_TEACHER' || caller.role === 'VISITING_TEACHER') && caller.id) {
      filterTeacherId = caller.id;
    }

    let requests = await TeacherRequestService.getAll({
      departmentId: filterDeptId,
      status: status ? String(status) : undefined,
      teacherId: filterTeacherId
    });

    // Search filter
    if (search) {
      const q = String(search).toLowerCase().trim();
      requests = requests.filter((r: any) =>
        (r.teacherName && r.teacherName.toLowerCase().includes(q)) ||
        (r.teacherEmail && r.teacherEmail.toLowerCase().includes(q)) ||
        (r.departmentName && r.departmentName.toLowerCase().includes(q)) ||
        (r.selectedCourses && Array.isArray(r.selectedCourses) &&
          r.selectedCourses.some((c: any) =>
            (c.courseName && c.courseName.toLowerCase().includes(q)) ||
            (c.courseCode && c.courseCode.toLowerCase().includes(q))
          ))
      );
    }

    return res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error: any) {
    logger.error(`[getTeacherRequests Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeacherRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const caller = getCallerInfo(req);
    const request = await TeacherRequestService.getById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Teacher request not found.' });
    }

    // Authorization: HOD cannot view requests of another department
    if (caller.role === 'HOD' && caller.departmentId && request.departmentId !== caller.departmentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view teacher requests for your assigned department.'
      });
    }

    // Teacher can only view their own
    if ((caller.role === 'REGULAR_TEACHER' || caller.role === 'VISITING_TEACHER') && caller.id && request.teacherId !== caller.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own enrollment request.'
      });
    }

    return res.json({ success: true, data: request });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyTeacherRequest = async (req: Request, res: Response) => {
  try {
    const caller = getCallerInfo(req);
    const teacherId = (req.query.teacherId as string) || caller.id;
    const email = req.query.email as string;

    let request = null;
    if (teacherId) {
      request = await TeacherRequestService.getByTeacherId(teacherId);
    }

    if (!request && email) {
      const all = await TeacherRequestService.getAll();
      request = all.find((r: any) => r.teacherEmail.toLowerCase() === email.toLowerCase());
    }

    if (!request) {
      return res.json({ success: true, data: null, message: 'No registration request found for this teacher.' });
    }

    return res.json({ success: true, data: request });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTeacherRequest = async (req: Request, res: Response) => {
  try {
    const {
      teacherId,
      teacherName,
      teacherEmail,
      teacherType,
      departmentId,
      selectedCourses,
      profileData
    } = req.body;

    // 1. Basic validation
    if (!teacherId || !teacherName || !teacherEmail || !teacherType || !departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: teacherId, teacherName, teacherEmail, teacherType, departmentId.'
      });
    }

    if (teacherType !== 'REGULAR_TEACHER' && teacherType !== 'VISITING_TEACHER') {
      return res.status(400).json({
        success: false,
        message: 'Invalid teacher type. Must be REGULAR_TEACHER or VISITING_TEACHER.'
      });
    }

    if (!Array.isArray(selectedCourses) || selectedCourses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one course for registration.'
      });
    }

    // 2. Strict Credit Hours Calculation & Validation
    const normalizedCourses = selectedCourses.map((c: any, index: number) => {
      const cr = Number(c.credits ?? c.creditHours ?? 3);
      return {
        ...c,
        credits: cr,
        creditHours: cr,
        section: c.section || `Section ${String.fromCharCode(65 + (index % 26))}`
      };
    });

    const totalCredits = normalizedCourses.reduce((sum: number, c: any) => sum + (Number(c.credits) || 0), 0);
    const creditLimit = teacherType === 'REGULAR_TEACHER' ? 22 : 12;

    if (totalCredits > creditLimit) {
      return res.status(400).json({
        success: false,
        message: `Credit hour limit exceeded! ${
          teacherType === 'REGULAR_TEACHER' ? 'Regular teachers' : 'Visiting teachers'
        } are allowed a maximum of ${creditLimit} credit hours. Your selected courses total ${totalCredits} credit hours.`
      });
    }

    if (totalCredits <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total credit hours must be greater than zero.'
      });
    }

    // 3. Department & Automatic HOD Routing
    const dept = await DepartmentService.getById(departmentId);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: `Selected department with ID "${departmentId}" does not exist in the database.`
      });
    }

    const departmentName = dept.name;
    const hasAssignedHOD = dept.hodId && dept.hodId.trim() !== '' && dept.hodName && dept.hodName !== 'Unassigned';
    const hodId = hasAssignedHOD ? dept.hodId : '';
    const hodName = hasAssignedHOD ? dept.hodName : 'Unassigned';

    // 4. Check for existing request to prevent duplicate active records
    const existingReq = await TeacherRequestService.getByTeacherId(teacherId);

    const requestId = existingReq ? existingReq.id : `req-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const requestPayload = {
      id: requestId,
      teacherId,
      teacherName,
      teacherEmail: teacherEmail.trim().toLowerCase(),
      teacherType,
      departmentId,
      departmentName,
      hodId,
      hodName,
      selectedCourses: normalizedCourses,
      totalCredits,
      creditLimit,
      status: 'PendingHODApproval',
      rejectionReason: '',
      profileData: profileData || {},
      submittedAt: nowIso,
      updated_at: nowIso
    };

    let savedRequest;
    if (existingReq) {
      savedRequest = await TeacherRequestService.update(requestId, requestPayload);
    } else {
      savedRequest = await TeacherRequestService.create(requestPayload);
    }

    // 5. Update Teacher User record
    await UserService.update(teacherId, {
      departmentId,
      departmentName,
      role: teacherType,
      enrollmentStatus: 'PendingHODApproval',
      profileFormSubmitted: true,
      profileFormData: profileData || {},
      totalCredits,
      selectedCourseIds: selectedCourses.map((c: any) => c.courseId)
    });

    // 6. Automatic Notifications
    if (hasAssignedHOD) {
      // Notify HOD
      await NotificationService.create({
        title: 'New Teacher Enrollment Request',
        message: `New enrollment request from ${teacherName} (${
          teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'
        }, ${totalCredits} Credit Hours) in ${departmentName} is pending your review.`,
        type: 'info',
        targetRole: 'HOD',
        linkModule: 'Teacher Management'
      });
    } else {
      // Department has no HOD: Flag and notify Admin
      await NotificationService.create({
        title: `HOD Missing for ${departmentName}`,
        message: `Teacher ${teacherName} has submitted registration for ${departmentName}, but this department has no assigned HOD. Please assign an HOD in Department Management.`,
        type: 'warning',
        targetRole: 'ADMIN',
        linkModule: 'Department Management'
      });
    }

    await AuditService.log({
      eventType: 'TEACHER_REGISTRATION_SUBMITTED',
      actor: teacherName,
      role: teacherType,
      resource: `Department:${departmentName}, Credits:${totalCredits}/${creditLimit}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.status(201).json({
      success: true,
      message: hasAssignedHOD
        ? `Registration submitted successfully! Your request has been routed to HOD ${hodName} of ${departmentName} for review.`
        : `Registration submitted! Note: Department HOD is currently unassigned. Administrator has been alerted to assign an HOD.`,
      data: savedRequest,
      hodAssigned: !!hasAssignedHOD
    });
  } catch (error: any) {
    logger.error(`[createTeacherRequest Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveTeacherRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const caller = getCallerInfo(req);

    const request = await TeacherRequestService.getById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Teacher request not found.' });
    }

    // Strict Authorization:
    // A HOD can only approve requests belonging to their assigned department!
    if (caller.role === 'HOD' && caller.departmentId && request.departmentId !== caller.departmentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only approve teacher requests for your own assigned department.'
      });
    }

    const reviewedAt = new Date().toISOString();
    const reviewedBy = caller.name || request.hodName || 'Department HOD';

    // 1. Update Request
    const updatedRequest = await TeacherRequestService.update(id, {
      status: 'Approved',
      reviewedAt,
      reviewedBy,
      rejectionReason: ''
    });

    // 2. Update Teacher User record: Mark Enrolled/Approved
    await UserService.update(request.teacherId, {
      enrollmentStatus: 'Approved',
      status: 'Active',
      approvedAt: reviewedAt,
      approvedBy: reviewedBy,
      rejectionReason: '',
      departmentId: request.departmentId,
      departmentName: request.departmentName,
      role: request.teacherType,
      totalCredits: request.totalCredits
    });

    // 3. Link selected courses to the teacher
    if (Array.isArray(request.selectedCourses)) {
      for (const c of request.selectedCourses) {
        if (c.courseId) {
          const existingCourse = await CourseService.getById(c.courseId);
          if (existingCourse) {
            await CourseService.update(c.courseId, {
              assignedTeacherId: request.teacherId,
              assignedTeacherName: request.teacherName,
              assignedTeacherRole: request.teacherType,
              status: 'Active'
            });
          } else {
            await CourseService.create({
              id: c.courseId,
              code: c.courseCode || 'CS-101',
              title: c.courseName || c.courseTitle || 'Specialized Course',
              credits: Number(c.credits || c.creditHours || 3),
              departmentId: request.departmentId,
              departmentName: request.departmentName,
              assignedTeacherId: request.teacherId,
              assignedTeacherName: request.teacherName,
              assignedTeacherRole: request.teacherType,
              status: 'Active',
              semester: 'Semester 1',
              academicSession: request.profileData?.academicSession || 'Spring 2026'
            });
          }
        }
      }
    }

    // 4. Notify Teacher
    await NotificationService.create({
      title: 'Course File Portal Access Approved',
      message: `Congratulations ${request.teacherName}! Your enrollment request for ${request.departmentName} has been approved by ${reviewedBy}. You now have full access to your Teacher Dashboard and Course Files.`,
      type: 'success',
      targetRole: request.teacherType,
      linkModule: 'Teacher Dashboard'
    });

    await AuditService.log({
      eventType: 'TEACHER_REGISTRATION_APPROVED',
      actor: reviewedBy,
      role: caller.role,
      resource: `Teacher:${request.teacherName}, Department:${request.departmentName}, Courses:${request.selectedCourses?.length || 0}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.json({
      success: true,
      message: `Teacher ${request.teacherName} approved successfully. Dashboard access and courses have been assigned.`,
      data: updatedRequest
    });
  } catch (error: any) {
    logger.error(`[approveTeacherRequest Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectTeacherRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rejectionReason = req.body.rejectionReason || req.body.reason;
    const caller = getCallerInfo(req);

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required when rejecting a teacher registration request.'
      });
    }

    const request = await TeacherRequestService.getById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Teacher request not found.' });
    }

    // Strict Authorization:
    // A HOD can only reject requests belonging to their assigned department!
    if (caller.role === 'HOD' && caller.departmentId && request.departmentId !== caller.departmentId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only review teacher requests for your own assigned department.'
      });
    }

    const reviewedAt = new Date().toISOString();
    const reviewedBy = caller.name || request.hodName || 'Department HOD';
    const cleanReason = rejectionReason.trim();

    // 1. Update Request
    const updatedRequest = await TeacherRequestService.update(id, {
      status: 'Rejected',
      rejectionReason: cleanReason,
      reviewedAt,
      reviewedBy
    });

    // 2. Update Teacher User record: Mark Rejected
    await UserService.update(request.teacherId, {
      enrollmentStatus: 'Rejected',
      rejectionReason: cleanReason
    });

    // 3. Notify Teacher
    await NotificationService.create({
      title: 'Registration Request Rejected',
      message: `Your registration request for ${request.departmentName} was rejected by ${reviewedBy}. Reason: "${cleanReason}". Please update your application and resubmit.`,
      type: 'error',
      targetRole: request.teacherType,
      linkModule: 'My Profile Form'
    });

    await AuditService.log({
      eventType: 'TEACHER_REGISTRATION_REJECTED',
      actor: reviewedBy,
      role: caller.role,
      resource: `Teacher:${request.teacherName}, Reason:${cleanReason}`,
      status: 'WARNING',
      severity: 'MEDIUM'
    });

    return res.json({
      success: true,
      message: `Teacher registration request rejected. The teacher has been notified with the reason.`,
      data: updatedRequest
    });
  } catch (error: any) {
    logger.error(`[rejectTeacherRequest Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};
