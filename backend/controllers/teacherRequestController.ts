import { Request, Response } from 'express';
import {
  TeacherRequestService,
  DepartmentService,
  CourseService,
  UserService,
  NotificationService,
  AuditService,
  HODAssignmentService,
  CampusService,
  TeacherAssignmentService
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

/**
 * Resolves the authenticated HOD's active authorization scope (Campus + Department)
 */
const resolveHODScope = async (callerId: string, defaultDeptId?: string) => {
  if (!callerId) return null;
  // 1. Check active HOD assignment from HODAssignmentService
  const assignment = await HODAssignmentService.getActiveByHodId(callerId);
  if (assignment && assignment.status === 'Active') {
    return {
      campusId: assignment.campusId,
      campusName: assignment.campusName,
      departmentId: assignment.departmentId,
      departmentName: assignment.departmentName,
      hodId: assignment.hodId,
      hodName: assignment.hodName
    };
  }
  // 2. Fallback to user and department tables
  const user = await UserService.getById(callerId);
  const deptId = defaultDeptId || user?.departmentId;
  if (deptId) {
    const dept = await DepartmentService.getById(deptId);
    return {
      campusId: dept?.campusId || 'camp-attock',
      campusName: dept?.campusName || user?.campus || 'Attock Campus',
      departmentId: deptId,
      departmentName: dept?.name || user?.departmentName || 'Department',
      hodId: callerId,
      hodName: user?.name || 'HOD'
    };
  }
  return null;
};


export const getTeacherRequests = async (req: Request, res: Response) => {
  try {
    const caller = getCallerInfo(req);
    const { departmentId, campusId, status, teacherId, search } = req.query;

    let filterDeptId = departmentId ? String(departmentId) : undefined;
    let filterCampusId = campusId ? String(campusId) : undefined;

    // Strict Multi-Campus & Multi-Department Authorization for HOD:
    let hodScope: any = null;
    if (caller.role === 'HOD') {
      hodScope = await resolveHODScope(caller.id, caller.departmentId);
      if (hodScope) {
        // Enforce HOD's authorized scope - ignore or reject any client attempt to change department or campus
        filterDeptId = hodScope.departmentId;
        filterCampusId = hodScope.campusId;
      }
    }

    // Teacher can only view their own requests
    let filterTeacherId = teacherId ? String(teacherId) : undefined;
    if ((caller.role === 'REGULAR_TEACHER' || caller.role === 'VISITING_TEACHER') && caller.id) {
      filterTeacherId = caller.id;
    }

    let requests = await TeacherRequestService.getAll({
      departmentId: filterDeptId,
      status: status ? String(status) : undefined,
      teacherId: filterTeacherId,
      campusId: filterCampusId
    });

    // Enforce HOD scope isolation in memory / result set
    if (caller.role === 'HOD') {
      requests = requests.filter((r: any) => {
        // If request has specific hodId, ensure it matches caller
        if (r.hodId && caller.id && r.hodId !== caller.id) {
          return false;
        }
        if (hodScope) {
          const matchDept = r.departmentId === hodScope.departmentId;
          const matchCampus = !r.campusId || r.campusId === hodScope.campusId || (r.campusName && r.campusName.toLowerCase() === hodScope.campusName.toLowerCase());
          return matchDept && matchCampus;
        }
        return r.hodId === caller.id;
      });
    }

    // Search filter
    if (search) {
      const q = String(search).toLowerCase().trim();
      requests = requests.filter((r: any) =>
        (r.teacherName && r.teacherName.toLowerCase().includes(q)) ||
        (r.teacherEmail && r.teacherEmail.toLowerCase().includes(q)) ||
        (r.departmentName && r.departmentName.toLowerCase().includes(q)) ||
        (r.campusName && r.campusName.toLowerCase().includes(q)) ||
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

    // Strict Scope Authorization: HOD cannot view requests outside authorized Campus + Department scope or assigned to another HOD
    if (caller.role === 'HOD') {
      if (request.hodId && caller.id && request.hodId !== caller.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot view a request routed to another Head of Department.'
        });
      }
      const hodScope = await resolveHODScope(caller.id, caller.departmentId);
      if (hodScope) {
        const matchDept = request.departmentId === hodScope.departmentId;
        const matchCampus = !request.campusId || request.campusId === hodScope.campusId || (request.campusName && request.campusName.toLowerCase() === hodScope.campusName.toLowerCase());
        if (!matchDept || !matchCampus) {
          return res.status(403).json({
            success: false,
            message: `Access denied: You can only view teacher requests within your authorized scope (${hodScope.campusName} - ${hodScope.departmentName}).`
          });
        }
      }
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
      request = all.find((r: any) => r.teacherEmail && r.teacherEmail.toLowerCase() === email.toLowerCase());
    }

    if (!request) {
      return res.json({ success: true, data: null, message: 'No registration request found for this teacher.' });
    }

    // If request is approved, ensure teacher user record is synchronized as Approved & Active
    if (request.status === 'Approved' && (teacherId || request.teacherId)) {
      const tid = teacherId || request.teacherId;
      const u = await UserService.getById(tid);
      if (u && (u.enrollmentStatus !== 'Approved' || u.status !== 'Active')) {
        await UserService.update(tid, {
          enrollmentStatus: 'Approved',
          status: 'Active',
          campus: request.campusName,
          campusId: request.campusId,
          departmentId: request.departmentId,
          departmentName: request.departmentName,
          hodId: request.hodId,
          hodName: request.hodName
        });
      }
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
      campusId,
      campusName,
      hodId: selectedHodId,
      hodName: selectedHodName,
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

    const rawCourses = Array.isArray(selectedCourses) ? selectedCourses : [];
    const sessionType = req.body.sessionType || profileData?.sessionType || (profileData?.academicSession ? profileData.academicSession.split(' ')[0] : 'Spring');
    const academicYear = req.body.academicYear || profileData?.academicYear || '2024–25';

    // 2. Strict Credit Hours Calculation & Validation (if courses submitted)
    const normalizedCourses = rawCourses.map((c: any, index: number) => {
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

    // 2.5 Strict Admin Teacher Assignment Validation (Department → Section → Course)
    // Verifies that every selected (Department + Section + Course) is explicitly authorized by Admin
    const hasAssignments = await TeacherAssignmentService.hasAssignmentsForTeacher(teacherId);
    if (hasAssignments) {
      for (const courseItem of normalizedCourses) {
        const secVal = courseItem.section || courseItem.sectionName || '';
        const crsVal = courseItem.courseId || courseItem.courseCode || courseItem.courseName || courseItem.title || '';
        const validation = await TeacherAssignmentService.validateAssignment(
          teacherId,
          departmentId,
          secVal,
          crsVal
        );
        if (!validation.isValid) {
          return res.status(400).json({
            success: false,
            message: 'Invalid selection. This Department, Section, or Course is not assigned to your account. Please select an authorized option.'
          });
        }
      }
    }

    // 3. Strict Relational Validation (Campus -> Department -> HOD)
    if (!campusId && !campusName) {
      return res.status(400).json({
        success: false,
        message: 'Campus is required. Please select a valid campus.'
      });
    }

    const allCampuses = await CampusService.getAll();
    const campus = allCampuses.find(
      (c: any) => c.id === campusId || c.name.toLowerCase() === String(campusId || campusName).toLowerCase()
    );
    if (!campus) {
      return res.status(400).json({
        success: false,
        message: `Selected campus does not exist in the database.`
      });
    }

    const dept = (await DepartmentService.getById(departmentId)) || (await DepartmentService.getAll()).find((d: any) => d.id === departmentId);
    if (!dept) {
      return res.status(400).json({
        success: false,
        message: `Selected department with ID "${departmentId}" does not exist in the database.`
      });
    }

    // Verify Department belongs to selected Campus
    if (dept.campusId && dept.campusId !== campus.id && dept.campusName?.toLowerCase() !== campus.name.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: `Validation failed: Department "${dept.name}" does not belong to Campus "${campus.name}".`
      });
    }

    // Verify Active HOD Assignment exists for this Campus + Department
    const adminAssignment = await HODAssignmentService.getActiveByScope(campus.id, dept.id);
    const expectedHodId = adminAssignment?.hodId || (dept.hodId && dept.hodId !== 'Unassigned' ? dept.hodId : '');
    const expectedHodName = adminAssignment?.hodName || (dept.hodName && dept.hodName !== 'Unassigned' ? dept.hodName : '');

    if (!expectedHodId) {
      return res.status(400).json({
        success: false,
        message: `No HOD has been assigned to ${dept.name} at ${campus.name}. Requests cannot be submitted until Admin assigns an HOD.`
      });
    }

    // If teacher submitted a hodId, it MUST match the actual assigned HOD
    if (selectedHodId && selectedHodId !== expectedHodId) {
      return res.status(400).json({
        success: false,
        message: `Invalid HOD mapping: The selected HOD does not match the active HOD assigned to ${dept.name} at ${campus.name}.`
      });
    }

    // Verify HOD user exists
    const hodUser = await UserService.getById(expectedHodId);
    if (!hodUser) {
      return res.status(400).json({
        success: false,
        message: `Assigned HOD user record was not found in the database.`
      });
    }

    const finalCampusId = campus.id;
    const finalCampusName = campus.name;
    const departmentName = dept.name;
    const hodId = expectedHodId;
    const hodName = expectedHodName || hodUser.name;
    const hasAssignedHOD = true;

    // 4. Check for existing request to prevent duplicate active records (per teacher+department)
    const existingReq = await TeacherRequestService.getByTeacherId(teacherId, departmentId);

    const requestId = existingReq ? existingReq.id : `req-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const requestPayload = {
      id: requestId,
      teacherId,
      teacherName,
      teacherEmail: teacherEmail.trim().toLowerCase(),
      teacherType,
      campusId: finalCampusId,
      campusName: finalCampusName,
      departmentId,
      departmentName,
      hodId,
      hodName,
      selectedCourses: normalizedCourses,
      totalCredits,
      creditLimit,
      sessionType,
      academicYear,
      status: 'PendingHODApproval',
      rejectionReason: '',
      profileData: {
        ...(profileData || {}),
        campus: finalCampusName,
        campusId: finalCampusId,
        hodId,
        hodName,
        sessionType,
        academicYear
      },
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
      campus: finalCampusName,
      role: teacherType,
      enrollmentStatus: 'PendingHODApproval',
      profileFormSubmitted: true,
      profileFormData: {
        ...(profileData || {}),
        campus: finalCampusName,
        campusId: finalCampusId,
        hodId,
        hodName,
        sessionType,
        academicYear
      },
      sessionType,
      academicYear,
      academicSession: `${sessionType} ${academicYear}`,
      totalCredits,
      selectedCourseIds: normalizedCourses.map((c: any) => c.courseId)
    });

    // 6. Automatic Notifications
    if (hasAssignedHOD) {
      // Notify HOD
      await NotificationService.create({
        title: 'New Teacher Enrollment Request',
        message: `New enrollment request from ${teacherName} (${
          teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'
        }, ${totalCredits} Credit Hours) in ${departmentName} (${finalCampusName}) is pending your approval. Isko accept karein taake teacher course file bana sake.`,
        type: 'info',
        targetRole: 'HOD',
        targetUserId: hodId,
        linkModule: 'HOD Dashboard'
      });
    } else {
      // Department has no HOD: Flag and notify Admin
      await NotificationService.create({
        title: `HOD Missing for ${departmentName} (${finalCampusName})`,
        message: `Teacher ${teacherName} has submitted registration for ${departmentName} (${finalCampusName}), but no HOD is assigned. Please assign an HOD in Department Management.`,
        type: 'warning',
        targetRole: 'ADMIN',
        linkModule: 'Department Management'
      });
    }

    await AuditService.log({
      eventType: 'TEACHER_REGISTRATION_SUBMITTED',
      actor: teacherName,
      role: teacherType,
      resource: `Campus:${finalCampusName}, Department:${departmentName}, HOD:${hodName}, Credits:${totalCredits}/${creditLimit}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.status(201).json({
      success: true,
      message: hasAssignedHOD
        ? `Registration submitted successfully! Your request has been routed to HOD ${hodName} of ${departmentName} (${finalCampusName}) for review.`
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

    // Strict Scope Authorization:
    // A HOD can only approve requests belonging to their authorized Campus + Department scope
    if (caller.role === 'HOD') {
      if (request.hodId && caller.id && request.hodId !== caller.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot approve a request routed to another Head of Department.'
        });
      }
      const hodScope = await resolveHODScope(caller.id, caller.departmentId);
      if (hodScope) {
        const matchDept = request.departmentId === hodScope.departmentId;
        const matchCampus = !request.campusId || request.campusId === hodScope.campusId || (request.campusName && request.campusName.toLowerCase() === hodScope.campusName.toLowerCase());
        if (!matchDept || !matchCampus) {
          return res.status(403).json({
            success: false,
            message: `Access denied: You can only approve teacher requests within your authorized scope (${hodScope.campusName} - ${hodScope.departmentName}).`
          });
        }
      }
    }

    if (request.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'This teacher registration request has already been approved.'
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

    // 2. Update Teacher User record: Mark Enrolled/Approved and save complete profile
    let teacherUser = await UserService.getById(request.teacherId);
    if (!teacherUser && request.teacherEmail) {
      teacherUser = await UserService.getByEmail(request.teacherEmail);
    }
    const targetUserId = teacherUser ? teacherUser.id : request.teacherId;

    await UserService.update(targetUserId, {
      enrollmentStatus: 'Approved',
      status: 'Active',
      approvedAt: reviewedAt,
      approvedBy: reviewedBy,
      rejectionReason: '',
      campusId: request.campusId,
      campus: request.campusName,
      departmentId: request.departmentId,
      departmentName: request.departmentName,
      hodId: request.hodId,
      hodName: request.hodName,
      role: request.teacherType,
      sessionType: request.sessionType,
      academicYear: request.academicYear,
      academicSession: request.academicSession || `${request.sessionType || 'Spring'} ${request.academicYear || '2024–25'}`,
      totalCredits: request.totalCredits,
      courses: request.selectedCourses
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

    // 5. Notify Admin (Requirement 14: Admin registration update notification)
    await NotificationService.create({
      title: 'New Teacher Registered',
      message: `Teacher ${request.teacherName} has been approved for ${request.departmentName} (${request.campusName}) by HOD ${reviewedBy}.`,
      type: 'info',
      targetRole: 'ADMIN',
      linkModule: 'Teacher Registrations'
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

    // Strict Scope Authorization:
    // A HOD can only reject requests belonging to their authorized Campus + Department scope!
    if (caller.role === 'HOD') {
      if (request.hodId && caller.id && request.hodId !== caller.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot reject a request routed to another Head of Department.'
        });
      }
      const hodScope = await resolveHODScope(caller.id, caller.departmentId);
      if (hodScope) {
        const matchDept = request.departmentId === hodScope.departmentId;
        const matchCampus = !request.campusId || request.campusId === hodScope.campusId || (request.campusName && request.campusName.toLowerCase() === hodScope.campusName.toLowerCase());
        if (!matchDept || !matchCampus) {
          return res.status(403).json({
            success: false,
            message: `Access denied: You can only review teacher requests for your authorized scope (${hodScope.campusName} - ${hodScope.departmentName}).`
          });
        }
      }
    }

    if (request.status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'This teacher registration request has already been rejected.'
      });
    }
    if (request.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already approved teacher request.'
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
