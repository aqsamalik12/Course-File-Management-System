import { Response } from 'express';
import { HODRequest } from '../middlewares/hodAuthMiddleware';
import {
  TeacherRequestService,
  UserService,
  CourseService,
  CourseFileService,
  NotificationService,
  AuditService
} from '../services/supabaseService';
import { logger } from '../config/logger';

/**
 * GET /api/hod/dashboard
 * Minimal, clean dashboard statistics and recent requests
 * Computed strictly from real database records within HOD scope.
 */
export const getHODDashboard = async (req: HODRequest, res: Response) => {
  try {
    const scope = req.hodScope!;

    // 1. Fetch all teacher requests for this HOD's department and campus
    const allRequests = await TeacherRequestService.getAll({
      departmentId: scope.departmentId,
      campusId: scope.campusId
    });

    // Enforce HOD ID filter if set on requests
    const scopedRequests = allRequests.filter((r: any) => {
      const matchDept = r.departmentId === scope.departmentId ||
        (r.departmentName && r.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
      const matchCampus = !r.campusId || r.campusId === scope.campusId ||
        (r.campusName && r.campusName.toLowerCase() === scope.campusName.toLowerCase());
      const matchHod = !r.hodId || r.hodId === scope.hodId;
      return matchDept && matchCampus && matchHod;
    });

    const pendingRequests = scopedRequests.filter((r: any) => r.status === 'PendingHODApproval').length;
    const rejectedRequests = scopedRequests.filter((r: any) => r.status === 'Rejected').length;

    // 2. Fetch approved teachers in this department and campus
    const allUsers = await UserService.getAll();
    const approvedTeachers = allUsers.filter((u: any) => {
      const isTeacher = u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER';
      const isApproved = u.enrollmentStatus === 'Approved';
      const matchDept = u.departmentId === scope.departmentId ||
        (u.departmentName && u.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
      const matchCampus = !u.campusId || u.campusId === scope.campusId ||
        (u.campus && u.campus.toLowerCase() === scope.campusName.toLowerCase());
      return isTeacher && isApproved && matchDept && matchCampus;
    });

    // 3. Fetch course files strictly within HOD scope
    const allFiles = await CourseFileService.getAll();
    const scopedFiles = allFiles.filter((f: any) => {
      if (f.deleted) return false;
      const matchDept = f.departmentId === scope.departmentId ||
        (f.departmentName && f.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
      const matchCampus = !f.campusId || f.campusId === scope.campusId ||
        (f.campusName && f.campusName.toLowerCase() === scope.campusName.toLowerCase());
      const matchHod = !f.hodId || f.hodId === scope.hodId;
      return matchDept && matchCampus && matchHod;
    });

    const pendingCourseFiles = scopedFiles.filter((f: any) => f.status === 'Submitted' || f.status === 'Under Review').length;
    const approvedCourseFiles = scopedFiles.filter((f: any) => f.status === 'Approved').length;
    const returnedCourseFiles = scopedFiles.filter((f: any) => f.status === 'Returned' || f.status === 'Rejected').length;
    const totalCourseFiles = scopedFiles.length;

    // 4. Build standard 4-semester overview for available batches
    const batchSet = new Set<string>();
    scopedFiles.forEach((f: any) => { if (f.batch) batchSet.add(f.batch.trim()); });
    ['2024', '2025'].forEach(b => batchSet.add(b));
    const batches = Array.from(batchSet).sort((a, b) => b.localeCompare(a));

    const standardSemesters = ['1st Semester', '2nd Semester', '3rd Semester', '4th Semester'];

    const batchesOverview = batches.map(b => {
      const session = b === '2024' ? '2024–2025' : `${b}–${parseInt(b) + 1}`;
      const semesters = standardSemesters.map(sem => {
        const count = scopedFiles.filter((f: any) => f.batch === b && (f.semester === sem)).length;
        const pending = scopedFiles.filter((f: any) => f.batch === b && (f.semester === sem) && (f.status === 'Submitted' || f.status === 'Under Review')).length;
        return {
          name: sem,
          fileCount: count,
          pendingCount: pending
        };
      });
      return {
        batch: b,
        session,
        semesters
      };
    });

    // 5. Recent Course Files (up to 5)
    const recentCourseFiles = scopedFiles
      .sort((a: any, b: any) => new Date(b.submittedAt || b.created_at || 0).getTime() - new Date(a.submittedAt || a.created_at || 0).getTime())
      .slice(0, 5);

    // 6. Recent Teacher Requests (up to 5)
    const recentRequests = scopedRequests
      .sort((a: any, b: any) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime())
      .slice(0, 5);

    return res.json({
      success: true,
      hod: {
        id: scope.hodId,
        name: scope.hodName,
        email: scope.hodEmail,
        campusId: scope.campusId,
        campusName: scope.campusName,
        departmentId: scope.departmentId,
        departmentName: scope.departmentName,
        role: 'Head of Department'
      },
      stats: {
        pendingRequests,
        registeredTeachers: approvedTeachers.length,
        approvedTeachers: approvedTeachers.length,
        rejectedRequests,
        totalAuthorizedTeachers: approvedTeachers.length,
        pendingCourseFiles,
        approvedCourseFiles,
        returnedCourseFiles,
        totalCourseFiles
      },
      batchesOverview,
      recentCourseFiles,
      recentRequests
    });
  } catch (error: any) {
    logger.error(`[getHODDashboard Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/hod/teacher-requests
 * Scoped teacher requests for the authenticated HOD's campus + department
 */
export const getHODTeacherRequests = async (req: HODRequest, res: Response) => {
  try {
    const scope = req.hodScope!;
    const { status, search } = req.query;

    const statusQuery = status
      ? String(status).toLowerCase() === 'pending'
        ? 'PendingHODApproval'
        : String(status)
      : undefined;

    const allRequests = await TeacherRequestService.getAll({
      departmentId: scope.departmentId,
      campusId: scope.campusId,
      status: statusQuery
    });

    // Strict scope isolation
    let scopedRequests = allRequests.filter((r: any) => {
      const matchDept = r.departmentId === scope.departmentId ||
        (r.departmentName && r.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
      const matchCampus = !r.campusId || r.campusId === scope.campusId ||
        (r.campusName && r.campusName.toLowerCase() === scope.campusName.toLowerCase());
      const matchHod = !r.hodId || r.hodId === scope.hodId;
      return matchDept && matchCampus && matchHod;
    });

    if (search) {
      const q = String(search).toLowerCase().trim();
      scopedRequests = scopedRequests.filter((r: any) =>
        (r.teacherName && r.teacherName.toLowerCase().includes(q)) ||
        (r.teacherEmail && r.teacherEmail.toLowerCase().includes(q)) ||
        (r.teacherType && r.teacherType.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: scopedRequests.length,
      data: scopedRequests
    });
  } catch (error: any) {
    logger.error(`[getHODTeacherRequests Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/hod/teacher-requests/:id
 * Retrieve request details strictly within HOD scope (returns 403 Forbidden otherwise)
 */
export const getHODTeacherRequestById = async (req: HODRequest, res: Response) => {
  try {
    const { id } = req.params;
    const scope = req.hodScope!;

    const request = await TeacherRequestService.getById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Teacher request not found.' });
    }

    // Strict Scope Verification
    const matchDept = request.departmentId === scope.departmentId ||
      (request.departmentName && request.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
    const matchCampus = !request.campusId || request.campusId === scope.campusId ||
      (request.campusName && request.campusName.toLowerCase() === scope.campusName.toLowerCase());
    const matchHod = !request.hodId || request.hodId === scope.hodId;

    if (!matchDept || !matchCampus || !matchHod) {
      return res.status(403).json({
        success: false,
        message: `Access denied: You cannot view requests outside your authorized scope (${scope.departmentName} - ${scope.campusName}).`
      });
    }

    return res.json({
      success: true,
      data: request
    });
  } catch (error: any) {
    logger.error(`[getHODTeacherRequestById Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/hod/teacher-requests/:id/approve
 * Approves teacher registration request and unlocks teacher workflow
 */
export const approveHODTeacherRequest = async (req: HODRequest, res: Response) => {
  try {
    const { id } = req.params;
    const scope = req.hodScope!;

    const request = await TeacherRequestService.getById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Teacher request not found.' });
    }

    // Strict Scope Verification
    const matchDept = request.departmentId === scope.departmentId ||
      (request.departmentName && request.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
    const matchCampus = !request.campusId || request.campusId === scope.campusId ||
      (request.campusName && request.campusName.toLowerCase() === scope.campusName.toLowerCase());
    const matchHod = !request.hodId || request.hodId === scope.hodId;

    if (!matchDept || !matchCampus || !matchHod) {
      return res.status(403).json({
        success: false,
        message: `Access denied: You cannot approve requests outside your authorized scope (${scope.departmentName} - ${scope.campusName}).`
      });
    }

    // Prevent double approval (Requirement 18)
    if (request.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'This teacher registration request has already been approved. Duplicate approval is prevented.'
      });
    }

    const reviewedAt = new Date().toISOString();
    const reviewedBy = scope.hodName;

    // 1. Update Teacher Request in database
    const updatedRequest = await TeacherRequestService.update(id, {
      status: 'Approved',
      approvedAt: reviewedAt,
      approvedBy: reviewedBy,
      reviewedAt,
      reviewedBy,
      hodId: scope.hodId,
      campusId: scope.campusId,
      departmentId: scope.departmentId,
      rejectionReason: ''
    });

    // 2. Update Teacher User record: Mark Enrolled/Approved & Active
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
      campusId: scope.campusId,
      campus: scope.campusName,
      departmentId: scope.departmentId,
      departmentName: scope.departmentName,
      hodId: scope.hodId,
      role: request.teacherType,
      totalCredits: request.totalCredits,
      courses: request.selectedCourses
    });

    // 3. Link courses to teacher in database
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
              departmentId: scope.departmentId,
              departmentName: scope.departmentName,
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
      title: 'Teacher Registration Approved',
      message: `Congratulations ${request.teacherName}! Your registration for ${scope.departmentName} (${scope.campusName}) has been approved by HOD ${reviewedBy}. Your course files and teacher dashboard are now unlocked.`,
      type: 'success',
      targetRole: request.teacherType,
      targetUserId: request.teacherId,
      linkModule: 'Teacher Dashboard'
    });

    // 5. Notify Admin
    await NotificationService.create({
      title: 'Teacher Approved by HOD',
      message: `Teacher ${request.teacherName} approved for ${scope.departmentName} by HOD ${reviewedBy}.`,
      type: 'info',
      targetRole: 'ADMIN',
      linkModule: 'Teacher Registrations'
    });

    // 6. Audit Trail
    await AuditService.log({
      eventType: 'HOD_TEACHER_REQUEST_APPROVED',
      actor: reviewedBy,
      role: 'HOD',
      resource: `Teacher:${request.teacherName}, Dept:${scope.departmentName}, Campus:${scope.campusName}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.json({
      success: true,
      message: `Teacher ${request.teacherName} registration request approved successfully.`,
      data: updatedRequest
    });
  } catch (error: any) {
    logger.error(`[approveHODTeacherRequest Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/hod/teacher-requests/:id/reject
 * Rejects teacher registration request with reason
 */
export const rejectHODTeacherRequest = async (req: HODRequest, res: Response) => {
  try {
    const { id } = req.params;
    const scope = req.hodScope!;
    const rejectionReason = (req.body.rejectionReason || req.body.reason || '').trim();

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required to reject a teacher registration request.'
      });
    }

    const request = await TeacherRequestService.getById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Teacher request not found.' });
    }

    // Strict Scope Verification
    const matchDept = request.departmentId === scope.departmentId ||
      (request.departmentName && request.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
    const matchCampus = !request.campusId || request.campusId === scope.campusId ||
      (request.campusName && request.campusName.toLowerCase() === scope.campusName.toLowerCase());
    const matchHod = !request.hodId || request.hodId === scope.hodId;

    if (!matchDept || !matchCampus || !matchHod) {
      return res.status(403).json({
        success: false,
        message: `Access denied: You cannot reject requests outside your authorized scope (${scope.departmentName} - ${scope.campusName}).`
      });
    }

    // Prevent duplicate rejection or invalid transition
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
    const reviewedBy = scope.hodName;

    // 1. Update Request
    const updatedRequest = await TeacherRequestService.update(id, {
      status: 'Rejected',
      rejectionReason,
      reviewedAt,
      reviewedBy,
      hodId: scope.hodId,
      campusId: scope.campusId,
      departmentId: scope.departmentId
    });

    // 2. Update Teacher User: Keep Course workflow LOCKED
    await UserService.update(request.teacherId, {
      enrollmentStatus: 'Rejected',
      rejectionReason
    });

    // 3. Notify Teacher
    await NotificationService.create({
      title: 'Teacher Registration Request Rejected',
      message: `Your registration request for ${scope.departmentName} was rejected by HOD ${reviewedBy}. Reason: "${rejectionReason}". Please update your details and resubmit.`,
      type: 'error',
      targetRole: request.teacherType,
      targetUserId: request.teacherId,
      linkModule: 'My Profile Form'
    });

    // 4. Audit Trail
    await AuditService.log({
      eventType: 'HOD_TEACHER_REQUEST_REJECTED',
      actor: reviewedBy,
      role: 'HOD',
      resource: `Teacher:${request.teacherName}, Reason:${rejectionReason}`,
      status: 'WARNING',
      severity: 'MEDIUM'
    });

    return res.json({
      success: true,
      message: 'Teacher registration request rejected.',
      data: updatedRequest
    });
  } catch (error: any) {
    logger.error(`[rejectHODTeacherRequest Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/hod/teachers
 * Returns approved/registered teachers strictly scoped to HOD's campus + department
 */
export const getHODTeachers = async (req: HODRequest, res: Response) => {
  try {
    const scope = req.hodScope!;
    const allUsers = await UserService.getAll();
    const approvedRequests = await TeacherRequestService.getAll({
      departmentId: scope.departmentId,
      campusId: scope.campusId,
      status: 'Approved'
    });

    const approvedTeachersMap = new Map<string, any>();

    // 1. From Users service:
    allUsers.forEach((u: any) => {
      const isTeacher = u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER';
      const isApproved = u.enrollmentStatus === 'Approved';
      const matchDept = u.departmentId === scope.departmentId ||
        (u.departmentName && u.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
      const matchCampus = !u.campusId || u.campusId === scope.campusId ||
        (u.campus && u.campus.toLowerCase() === scope.campusName.toLowerCase());

      if (isTeacher && isApproved && matchDept && matchCampus) {
        approvedTeachersMap.set(u.id, {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          campus: scope.campusName,
          campusId: scope.campusId,
          department: scope.departmentName,
          departmentId: scope.departmentId,
          teacherType: u.role,
          registrationStatus: 'Approved',
          approvedDate: u.approvedAt || u.createdAt,
          approvedBy: u.approvedBy || scope.hodName,
          totalCredits: u.totalCredits || 0,
          courses: u.courses || []
        });
      }
    });

    // 2. From Approved Requests (guarantees newly approved teachers appear immediately):
    approvedRequests.forEach((r: any) => {
      const matchDept = r.departmentId === scope.departmentId ||
        (r.departmentName && r.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
      const matchCampus = !r.campusId || r.campusId === scope.campusId ||
        (r.campusName && r.campusName.toLowerCase() === scope.campusName.toLowerCase());
      const matchHod = !r.hodId || r.hodId === scope.hodId;

      if (matchDept && matchCampus && matchHod) {
        const existing = approvedTeachersMap.get(r.teacherId);
        if (!existing) {
          approvedTeachersMap.set(r.teacherId, {
            id: r.teacherId,
            name: r.teacherName,
            email: r.teacherEmail,
            phone: r.profileData?.phone || '',
            campus: scope.campusName,
            campusId: scope.campusId,
            department: scope.departmentName,
            departmentId: scope.departmentId,
            teacherType: r.teacherType,
            registrationStatus: 'Approved',
            approvedDate: r.approvedAt || r.reviewedAt,
            approvedBy: r.approvedBy || r.reviewedBy || scope.hodName,
            totalCredits: r.totalCredits || 0,
            courses: r.selectedCourses || []
          });
        }
      }
    });

    const result = Array.from(approvedTeachersMap.values());

    return res.json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (error: any) {
    logger.error(`[getHODTeachers Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/hod/teachers/:id
 * Detailed teacher profile strictly within HOD scope (returns 403 Forbidden otherwise)
 */
export const getHODTeacherProfileById = async (req: HODRequest, res: Response) => {
  try {
    const { id } = req.params;
    const scope = req.hodScope!;

    const teacher = await UserService.getById(id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found.' });
    }

    const matchDept = teacher.departmentId === scope.departmentId ||
      (teacher.departmentName && teacher.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
    const matchCampus = !teacher.campusId || teacher.campusId === scope.campusId ||
      (teacher.campus && teacher.campus.toLowerCase() === scope.campusName.toLowerCase());

    if (!matchDept || !matchCampus) {
      return res.status(403).json({
        success: false,
        message: `Access denied: You cannot view teacher profiles outside your department (${scope.departmentName}).`
      });
    }

    // Also get teacher's submitted request if available for full academic details
    const request = await TeacherRequestService.getByTeacherId(teacher.id);

    return res.json({
      success: true,
      data: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone || request?.profileData?.phone || '',
        designation: teacher.designation || (teacher.role === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'),
        campus: scope.campusName,
        department: scope.departmentName,
        teacherType: teacher.role,
        registrationStatus: teacher.enrollmentStatus || 'Approved',
        approvedDate: teacher.approvedAt || request?.reviewedAt || teacher.createdAt,
        approvedBy: teacher.approvedBy || request?.reviewedBy || scope.hodName,
        totalCredits: teacher.totalCredits || request?.totalCredits || 0,
        courses: teacher.courses || request?.selectedCourses || [],
        profileData: teacher.profileFormData || request?.profileData || null
      }
    });
  } catch (error: any) {
    logger.error(`[getHODTeacherProfileById Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper to filter course files strictly within HOD scope
 */
const filterFilesByHODScope = (files: any[], scope: any) => {
  return files.filter((f: any) => {
    if (f.deleted) return false;
    const matchDept = f.departmentId === scope.departmentId ||
      (f.departmentName && f.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
    const matchCampus = !f.campusId || f.campusId === scope.campusId ||
      (f.campusName && f.campusName.toLowerCase() === scope.campusName.toLowerCase());
    const matchHod = !f.hodId || f.hodId === scope.hodId;
    return matchDept && matchCampus && matchHod;
  });
};

const STANDARD_SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester'
];

/**
 * GET /api/hod/batches
 * Returns real Batch -> Session -> 8-Semester hierarchy for HOD's scope
 * Semesters are automatically provided without manual folder creation.
 */
export const getHODBatchesHierarchy = async (req: HODRequest, res: Response) => {
  try {
    const scope = req.hodScope!;
    const allFiles = await CourseFileService.getAll();
    const scopedFiles = filterFilesByHODScope(allFiles, scope);

    // Extract unique batches from existing files or standard academic batches (2026 to future years)
    const batchSet = new Set<string>();
    scopedFiles.forEach((f: any) => { if (f.batch) batchSet.add(f.batch.trim()); });
    ['2035', '2034', '2033', '2032', '2031', '2030', '2029', '2028', '2027', '2026', '2025', '2024'].forEach(b => batchSet.add(b));
    const batches = Array.from(batchSet).sort((a, b) => b.localeCompare(a));

    const hierarchy = batches.map(batchName => {
      const sessionSet = new Set<string>();
      scopedFiles.filter((f: any) => f.batch === batchName).forEach((f: any) => {
        if (f.session) sessionSet.add(f.session.trim());
      });
      const bYear = parseInt(batchName);
      if (!isNaN(bYear)) {
        sessionSet.add(`${bYear}–${bYear + 4}`);
      } else {
        sessionSet.add(`${batchName}–${parseInt(batchName) || 2026 + 4}`);
      }


      const sessions = Array.from(sessionSet).sort().map(sessionName => {
        const semesters = STANDARD_SEMESTERS.map(semName => {
          const filesInSemester = scopedFiles.filter((f: any) =>
            f.batch === batchName &&
            f.session === sessionName &&
            f.semester === semName
          );

          return {
            name: semName,
            fileCount: filesInSemester.length,
            pendingCount: filesInSemester.filter((f: any) => f.status === 'Submitted' || f.status === 'Under Review').length,
            approvedCount: filesInSemester.filter((f: any) => f.status === 'Approved').length,
            returnedCount: filesInSemester.filter((f: any) => f.status === 'Returned' || f.status === 'Rejected').length
          };
        });

        const totalFilesInSession = semesters.reduce((acc, s) => acc + s.fileCount, 0);

        return {
          session: sessionName,
          totalFiles: totalFilesInSession,
          semesters
        };
      });

      const totalFilesInBatch = sessions.reduce((acc, s) => acc + s.totalFiles, 0);

      return {
        batch: batchName,
        totalFiles: totalFilesInBatch,
        sessions
      };
    });

    return res.json({
      success: true,
      data: hierarchy
    });
  } catch (error: any) {
    logger.error(`[getHODBatchesHierarchy Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/hod/course-files
 * Scoped course files for the authenticated HOD (with batch, session, semester, status filters)
 */
export const getHODCourseFiles = async (req: HODRequest, res: Response) => {
  try {
    const scope = req.hodScope!;
    const { batch, session, semester, status, search } = req.query;

    const allFiles = await CourseFileService.getAll();
    let scopedFiles = filterFilesByHODScope(allFiles, scope);

    if (batch) {
      scopedFiles = scopedFiles.filter((f: any) => f.batch === String(batch).trim());
    }
    if (session) {
      scopedFiles = scopedFiles.filter((f: any) => f.session === String(session).trim());
    }
    if (semester) {
      scopedFiles = scopedFiles.filter((f: any) => f.semester === String(semester).trim());
    }
    if (status) {
      const s = String(status).trim();
      if (s === 'Pending') {
        scopedFiles = scopedFiles.filter((f: any) => f.status === 'Submitted' || f.status === 'Under Review');
      } else if (s === 'Approved') {
        scopedFiles = scopedFiles.filter((f: any) => f.status === 'Approved');
      } else if (s === 'Returned') {
        scopedFiles = scopedFiles.filter((f: any) => f.status === 'Returned' || f.status === 'Rejected');
      } else if (s !== 'All') {
        scopedFiles = scopedFiles.filter((f: any) => f.status === s);
      }
    }
    if (search) {
      const q = String(search).toLowerCase();
      scopedFiles = scopedFiles.filter((f: any) =>
        (f.courseCode && f.courseCode.toLowerCase().includes(q)) ||
        (f.courseTitle && f.courseTitle.toLowerCase().includes(q)) ||
        (f.teacherName && f.teacherName.toLowerCase().includes(q)) ||
        (f.title && f.title.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: scopedFiles.length,
      data: scopedFiles
    });
  } catch (error: any) {
    logger.error(`[getHODCourseFiles Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/hod/course-files/:id
 * Retrieve single course file strictly within HOD scope (returns 403 Forbidden otherwise)
 */
export const getHODCourseFileById = async (req: HODRequest, res: Response) => {
  try {
    const { id } = req.params;
    const scope = req.hodScope!;

    const file = await CourseFileService.getById(id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Course file not found.' });
    }

    const matchDept = file.departmentId === scope.departmentId ||
      (file.departmentName && file.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
    const matchCampus = !file.campusId || file.campusId === scope.campusId ||
      (file.campusName && file.campusName.toLowerCase() === scope.campusName.toLowerCase());
    const matchHod = !file.hodId || file.hodId === scope.hodId;

    if (!matchDept || !matchCampus || !matchHod) {
      return res.status(403).json({
        success: false,
        message: `Access denied: You cannot view course files outside your authorized scope (${scope.departmentName} - ${scope.campusName}).`
      });
    }

    return res.json({
      success: true,
      data: file
    });
  } catch (error: any) {
    logger.error(`[getHODCourseFileById Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/hod/course-files/:id/approve
 * Approves submitted course file
 */
export const approveHODCourseFile = async (req: HODRequest, res: Response) => {
  try {
    const { id } = req.params;
    const scope = req.hodScope!;

    const file = await CourseFileService.getById(id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Course file not found.' });
    }

    const matchDept = file.departmentId === scope.departmentId ||
      (file.departmentName && file.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
    const matchCampus = !file.campusId || file.campusId === scope.campusId ||
      (file.campusName && file.campusName.toLowerCase() === scope.campusName.toLowerCase());
    const matchHod = !file.hodId || file.hodId === scope.hodId;

    if (!matchDept || !matchCampus || !matchHod) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot approve course files outside your department.'
      });
    }

    if (file.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'This course file has already been approved.'
      });
    }

    const reviewedAt = new Date().toISOString();
    const reviewedBy = scope.hodName;

    const updated = await CourseFileService.update(id, {
      status: 'Approved',
      approvalStage: 'Approved',
      reviewedAt,
      reviewedBy,
      lastModified: new Date().toISOString().split('T')[0],
      remarks: 'Approved by HOD'
    });

    // Notify teacher
    await NotificationService.create({
      title: 'Course File Approved',
      message: `Congratulations ${file.teacherName}! Your course file for ${file.courseCode} - ${file.courseTitle} (${file.semester || ''}, Session ${file.session || ''}) has been reviewed and approved by HOD ${reviewedBy}.`,
      type: 'success',
      targetRole: file.teacherRole || 'REGULAR_TEACHER',
      targetUserId: file.teacherId,
      linkModule: 'Course File Submission'
    });

    // Audit log
    await AuditService.log({
      eventType: 'HOD_COURSE_FILE_APPROVED',
      actor: reviewedBy,
      role: 'HOD',
      resource: `CourseFile:${file.courseCode}, Teacher:${file.teacherName}, Dept:${scope.departmentName}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.json({
      success: true,
      message: 'Course file approved successfully.',
      data: updated
    });
  } catch (error: any) {
    logger.error(`[approveHODCourseFile Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/hod/course-files/:id/return
 * Returns submitted course file for revision with mandatory comments
 */
export const returnHODCourseFile = async (req: HODRequest, res: Response) => {
  try {
    const { id } = req.params;
    const scope = req.hodScope!;
    const reviewComment = (req.body.reviewComment || req.body.reason || req.body.comments || '').trim();

    if (!reviewComment) {
      return res.status(400).json({
        success: false,
        message: 'A review comment or return reason is required.'
      });
    }

    const file = await CourseFileService.getById(id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'Course file not found.' });
    }

    const matchDept = file.departmentId === scope.departmentId ||
      (file.departmentName && file.departmentName.toLowerCase() === scope.departmentName.toLowerCase());
    const matchCampus = !file.campusId || file.campusId === scope.campusId ||
      (file.campusName && file.campusName.toLowerCase() === scope.campusName.toLowerCase());
    const matchHod = !file.hodId || file.hodId === scope.hodId;

    if (!matchDept || !matchCampus || !matchHod) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot return course files outside your department.'
      });
    }

    if (file.status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot return an already approved course file.'
      });
    }

    const reviewedAt = new Date().toISOString();
    const reviewedBy = scope.hodName;

    const updated = await CourseFileService.update(id, {
      status: 'Returned',
      approvalStage: 'Returned for Revision',
      reviewedAt,
      reviewedBy,
      reviewComment,
      remarks: reviewComment,
      lastModified: new Date().toISOString().split('T')[0]
    });

    // Notify teacher
    await NotificationService.create({
      title: 'Course File Returned for Revision',
      message: `Your course file for ${file.courseCode} - ${file.courseTitle} (${file.semester || ''}) was returned by HOD ${reviewedBy}. Feedback: "${reviewComment}". Please update the required components and resubmit.`,
      type: 'warning',
      targetRole: file.teacherRole || 'REGULAR_TEACHER',
      targetUserId: file.teacherId,
      linkModule: 'Course File Submission'
    });

    // Audit log
    await AuditService.log({
      eventType: 'HOD_COURSE_FILE_RETURNED',
      actor: reviewedBy,
      role: 'HOD',
      resource: `CourseFile:${file.courseCode}, Reason:${reviewComment}`,
      status: 'WARNING',
      severity: 'MEDIUM'
    });

    return res.json({
      success: true,
      message: 'Course file returned for revision.',
      data: updated
    });
  } catch (error: any) {
    logger.error(`[returnHODCourseFile Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/hod/course-progress
 * Real course file progress within HOD scope (Requirement 27)
 * Shows Teacher, Course, Batch, Session, Semester, Status without fabricated percentages
 */
export const getHODCourseProgress = async (req: HODRequest, res: Response) => {
  try {
    const scope = req.hodScope!;
    const allFiles = await CourseFileService.getAll();
    const scopedFiles = filterFilesByHODScope(allFiles, scope);

    const progressList = scopedFiles.map((f: any) => ({
      id: f.id,
      teacherId: f.teacherId,
      teacherName: f.teacherName,
      teacherEmail: f.teacherEmail || '',
      teacherType: f.teacherRole || 'REGULAR_TEACHER',
      courseId: f.courseId,
      courseCode: f.courseCode,
      courseName: f.courseTitle || f.title,
      credits: f.credits || 3,
      batch: f.batch || '2024',
      session: f.session || '2024–2025',
      semester: f.semester || '1st Semester',
      status: f.status || 'Draft',
      submittedAt: f.submittedAt || null,
      reviewedAt: f.reviewedAt || null,
      reviewedBy: f.reviewedBy || null,
      reviewComment: f.reviewComment || null
    }));

    return res.json({
      success: true,
      count: progressList.length,
      data: progressList
    });
  } catch (error: any) {
    logger.error(`[getHODCourseProgress Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/hod/notifications
 * Scoped notifications for this HOD
 */
export const getHODNotifications = async (req: HODRequest, res: Response) => {
  try {
    const scope = req.hodScope!;
    const allNotifs = await NotificationService.getAll();

    const hodNotifs = allNotifs.filter((n: any) => {
      const matchRole = n.targetRole === 'HOD';
      const matchUser = !n.targetUserId || n.targetUserId === scope.hodId;
      return matchRole && matchUser;
    });

    return res.json({
      success: true,
      count: hodNotifs.length,
      data: hodNotifs
    });
  } catch (error: any) {
    logger.error(`[getHODNotifications Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/hod/profile
 * Authenticated HOD profile and scope
 */
export const getHODProfile = async (req: HODRequest, res: Response) => {
  try {
    const scope = req.hodScope!;
    const user = req.hodUser;

    return res.json({
      success: true,
      data: {
        id: scope.hodId,
        name: scope.hodName,
        email: scope.hodEmail,
        phone: user?.phone || '+92 300 1234567',
        role: 'Head of Department',
        assignedCampus: scope.campusName,
        campusId: scope.campusId,
        assignedDepartment: scope.departmentName,
        departmentId: scope.departmentId,
        designation: user?.designation || `Head of Department (${scope.departmentName})`,
        status: user?.status || 'Active',
        assignedDate: scope.status
      }
    });
  } catch (error: any) {
    logger.error(`[getHODProfile Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};
