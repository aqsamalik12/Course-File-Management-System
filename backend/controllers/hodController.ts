import { Response } from 'express';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const archiver = require('archiver');

const createZipArchive = (options: any = { zlib: { level: 9 } }) => {
  if (typeof archiver === 'function') {
    return (archiver as any)('zip', options);
  }
  if (archiver.ZipArchive) {
    return new archiver.ZipArchive(options);
  }
  throw new Error('Zip archive engine not available');
};
import { HODRequest } from '../middlewares/hodAuthMiddleware';
import {
  TeacherRequestService,
  UserService,
  CourseService,
  CourseFileService,
  TeacherAssignmentService,
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

    const submittedCourseFiles = scopedFiles.filter((f: any) => f.status === 'Submitted').length;
    const underReviewCourseFiles = scopedFiles.filter((f: any) => f.status === 'Under Review' || f.status === 'In Review').length;
    const needsImprovementCourseFiles = scopedFiles.filter((f: any) => f.status === 'Needs Improvement' || f.status === 'Returned' || f.status === 'Returned for Revision').length;
    const approvedCourseFiles = scopedFiles.filter((f: any) => f.status === 'Approved').length;
    const draftCourseFiles = scopedFiles.filter((f: any) => f.status === 'Draft' || f.status === 'Pending' || f.status === 'Not Submitted').length;
    const pendingIncompleteCourseFiles = draftCourseFiles + submittedCourseFiles + underReviewCourseFiles + needsImprovementCourseFiles;
    const certificatesAvailable = approvedCourseFiles;
    const totalCourseFiles = scopedFiles.length;
    const totalRegisteredTeachers = approvedTeachers.length + pendingRequests;

    // 4. Build dynamic batch and semester overview strictly from real database records
    const deptAssignments = await TeacherAssignmentService.getAll({
      departmentId: scope.departmentId
    });

    const batchSet = new Set<string>();
    scopedFiles.forEach((f: any) => { if (f.batch && f.batch.trim()) batchSet.add(f.batch.trim()); });
    deptAssignments.forEach((a: any) => { if (a.batch && a.batch.trim()) batchSet.add(a.batch.trim()); });
    const batches = Array.from(batchSet).sort((a, b) => b.localeCompare(a));

    const semOrder = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

    const batchesOverview = batches.map(b => {
      const session = b.includes('–') ? b : `${b}–${parseInt(b) ? parseInt(b) + 1 : 'Session'}`;
      const semesterSet = new Set<string>();
      scopedFiles.filter((f: any) => f.batch === b).forEach((f: any) => {
        if (f.semester && f.semester.trim()) semesterSet.add(f.semester.trim());
      });
      deptAssignments.filter((a: any) => a.batch === b).forEach((a: any) => {
        if (a.semester && a.semester.trim()) semesterSet.add(a.semester.trim());
      });

      const semesters = Array.from(semesterSet).sort((a, b) => {
        const idxA = semOrder.findIndex(s => a.toLowerCase().includes(s.toLowerCase()));
        const idxB = semOrder.findIndex(s => b.toLowerCase().includes(s.toLowerCase()));
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      }).map(sem => {
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

    // Real Chart Data
    const charts = {
      teacherRegistrationOverview: [
        { name: 'Approved', count: approvedTeachers.length, fill: '#10b981' },
        { name: 'Pending', count: pendingRequests, fill: '#f59e0b' },
        { name: 'Rejected', count: rejectedRequests, fill: '#f43f5e' }
      ],
      courseFileOverview: [
        { status: 'Submitted', count: submittedCourseFiles, fill: '#3b82f6' },
        { status: 'Under Review', count: underReviewCourseFiles, fill: '#06b6d4' },
        { status: 'Needs Improvement', count: needsImprovementCourseFiles, fill: '#f59e0b' },
        { status: 'Approved', count: approvedCourseFiles, fill: '#10b981' }
      ],
      courseFileCompletion: [
        { name: 'Approved', count: approvedCourseFiles, fill: '#10b981' },
        { name: 'Under Review', count: underReviewCourseFiles, fill: '#06b6d4' },
        { name: 'Needs Improvement', count: needsImprovementCourseFiles, fill: '#f59e0b' },
        { name: 'Pending / Draft', count: draftCourseFiles + submittedCourseFiles, fill: '#94a3b8' }
      ],
      sessionDistribution: [
        { session: 'Spring', count: scopedFiles.filter((f: any) => (f.session || 'Spring').toLowerCase().includes('spring')).length, fill: '#10b981' },
        { session: 'Fall', count: scopedFiles.filter((f: any) => (f.session || '').toLowerCase().includes('fall')).length, fill: '#6366f1' }
      ]
    };

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
        totalRegisteredTeachers,
        registeredTeachers: approvedTeachers.length,
        approvedTeachers: approvedTeachers.length,
        pendingRequests,
        rejectedRequests,
        totalCourseFiles,
        submittedCourseFiles,
        underReviewCourseFiles,
        needsImprovementCourseFiles,
        approvedCourseFiles,
        pendingIncompleteCourseFiles,
        certificatesAvailable,
        pendingCourseFiles: submittedCourseFiles + underReviewCourseFiles
      },
      charts,
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
    const matchDept =
      (scope.departmentId && f.departmentId === scope.departmentId) ||
      (f.departmentName && scope.departmentName && f.departmentName.toLowerCase().trim() === scope.departmentName.toLowerCase().trim());
    const matchCampus =
      !f.campusId || !scope.campusId || f.campusId === scope.campusId ||
      (f.campusName && scope.campusName && f.campusName.toLowerCase().trim() === scope.campusName.toLowerCase().trim());
    return matchDept && matchCampus;
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

    // Fetch department's teacher course assignments
    const allAssignments = await TeacherAssignmentService.getAll();
    const deptAssignments = allAssignments.filter((a: any) => {
      if (a.active === false) return false;
      const matchDept =
        (scope.departmentId && a.departmentId === scope.departmentId) ||
        (a.departmentName && scope.departmentName && a.departmentName.toLowerCase().trim() === scope.departmentName.toLowerCase().trim());
      const matchCampus =
        !a.campusId || !scope.campusId || a.campusId === scope.campusId ||
        (a.campusName && scope.campusName && a.campusName.toLowerCase().trim() === scope.campusName.toLowerCase().trim());
      return matchDept && matchCampus;
    });

    // Extract unique batches strictly from actual database data (files + assignments)
    const batchSet = new Set<string>();
    scopedFiles.forEach((f: any) => {
      if (f.batch && f.batch.trim()) batchSet.add(f.batch.trim());
    });
    deptAssignments.forEach((a: any) => {
      if (a.batch && a.batch.trim()) batchSet.add(a.batch.trim());
    });

    const batches = Array.from(batchSet).sort((a, b) => a.localeCompare(b));
    const semOrder = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

    const hierarchy = batches.map(batchName => {
      const batchFiles = scopedFiles.filter((f: any) => f.batch === batchName);
      const batchAsgns = deptAssignments.filter((a: any) => a.batch === batchName);

      // Identify sessions (Spring / Fall) that actually have data for this batch
      const sessionSet = new Set<string>();
      batchFiles.forEach((f: any) => {
        if (f.session) {
          const s = f.session.toLowerCase();
          if (s.includes('spring')) sessionSet.add('Spring');
          else if (s.includes('fall')) sessionSet.add('Fall');
        }
      });
      batchAsgns.forEach((a: any) => {
        if (a.session) {
          const s = a.session.toLowerCase();
          if (s.includes('spring')) sessionSet.add('Spring');
          else if (s.includes('fall')) sessionSet.add('Fall');
        }
      });

      // Sort sessions: Spring first, then Fall
      const sessionNames = Array.from(sessionSet).sort((a, b) => (a === 'Spring' ? -1 : 1));

      const sessions = sessionNames.map(sessName => {
        const sessFiles = batchFiles.filter((f: any) =>
          f.session && f.session.toLowerCase().includes(sessName.toLowerCase())
        );
        const sessAsgns = batchAsgns.filter((a: any) =>
          a.session && a.session.toLowerCase().includes(sessName.toLowerCase())
        );

        // Semesters with real records inside this Batch + Session
        const semSet = new Set<string>();
        sessFiles.forEach((f: any) => { if (f.semester && f.semester.trim()) semSet.add(f.semester.trim()); });
        sessAsgns.forEach((a: any) => { if (a.semester && a.semester.trim()) semSet.add(a.semester.trim()); });

        const semesters = Array.from(semSet).sort((a, b) => {
          const idxA = semOrder.findIndex(s => a.toLowerCase().includes(s.toLowerCase()));
          const idxB = semOrder.findIndex(s => b.toLowerCase().includes(s.toLowerCase()));
          return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        }).map(semName => {
          const filesInSem = sessFiles.filter((f: any) => f.semester === semName);
          const asgnsInSem = sessAsgns.filter((a: any) => a.semester === semName);

          const distinctCourses = new Set([
            ...filesInSem.map((f: any) => (f.courseCode || f.courseTitle || '').trim().toUpperCase()),
            ...asgnsInSem.map((a: any) => (a.courseCode || a.courseName || '').trim().toUpperCase())
          ]);

          return {
            name: semName,
            fileCount: filesInSem.length,
            courseCount: distinctCourses.size,
            pendingCount: filesInSem.filter((f: any) => f.status === 'Submitted' || f.status === 'Under Review').length,
            approvedCount: filesInSem.filter((f: any) => f.status === 'Approved').length,
            returnedCount: filesInSem.filter((f: any) => f.status === 'Returned' || f.status === 'Rejected' || f.status === 'Needs Improvement').length
          };
        }).filter(sem => sem.fileCount > 0);

        const totalFilesInSess = sessFiles.length;
        const totalApprovedInSess = sessFiles.filter((f: any) => f.status === 'Approved').length;

        return {
          session: sessName,
          name: sessName,
          fileCount: totalFilesInSess,
          approvedCount: totalApprovedInSess,
          pendingCount: sessFiles.filter((f: any) => f.status === 'Submitted' || f.status === 'Under Review').length,
          semesters
        };
      }).filter(sess => sess.fileCount > 0);

      const totalFilesInBatch = batchFiles.length;
      const totalApprovedInBatch = batchFiles.filter((f: any) => f.status === 'Approved').length;

      return {
        batch: batchName,
        totalFiles: totalFilesInBatch,
        approvedFiles: totalApprovedInBatch,
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
 * GET /api/hod/courses-by-semester
 * Dynamic Level 3/4 Courses endpoint: Returns all actual courses belonging to a Batch + Semester (+ optional Session) in HOD's department
 */
export const getHODSemesterCourses = async (req: HODRequest, res: Response) => {
  try {
    const scope = req.hodScope!;
    const { batch, semester, session } = req.query;

    if (!batch || !semester) {
      return res.status(400).json({ success: false, message: 'Batch and Semester are required.' });
    }

    const batchStr = String(batch).trim();
    const semStr = String(semester).trim();
    const sessionStr = session ? String(session).trim().toLowerCase() : null;

    const allFiles = await CourseFileService.getAll();
    const scopedFiles = filterFilesByHODScope(allFiles, scope).filter(
      (f: any) => f.batch === batchStr && f.semester === semStr && (!sessionStr || (f.session && f.session.toLowerCase() === sessionStr))
    );

    const deptAssignments = (await TeacherAssignmentService.getAll({
      departmentId: scope.departmentId
    })).filter((a: any) => a.batch === batchStr && a.semester === semStr && (!sessionStr || (a.session && a.session.toLowerCase() === sessionStr)));

    const courseMap = new Map<string, any>();

    // 1. Map courses from course files
    for (const f of scopedFiles) {
      const code = (f.courseCode || 'CS-101').trim().toUpperCase();
      if (!courseMap.has(code)) {
        courseMap.set(code, {
          courseId: f.courseId,
          courseCode: code,
          courseName: f.courseTitle || f.title || 'Course',
          creditHours: f.credits || 3,
          batch: batchStr,
          semester: semStr,
          session: f.session || 'Spring',
          academicYear: f.academicYear || '2024–25',
          teacherId: f.teacherId,
          teacherName: f.teacherName,
          status: f.status,
          courseFileId: f.id,
          submittedAt: f.submittedAt || f.created_at,
          fileUrl: f.fileUrl,
          fileCount: 1,
          templateData: f.templateData
        });
      } else {
        const existing = courseMap.get(code);
        existing.fileCount = (existing.fileCount || 1) + 1;
      }
    }

    // 2. Map courses from assignments that have not yet uploaded files
    for (const a of deptAssignments) {
      const code = (a.courseCode || a.code || 'CS-101').trim().toUpperCase();
      if (!courseMap.has(code)) {
        courseMap.set(code, {
          courseId: a.courseId || a.id,
          courseCode: code,
          courseName: a.courseName || a.title || 'Course',
          creditHours: a.creditHours || a.credits || 3,
          batch: batchStr,
          semester: semStr,
          session: a.session || 'Spring',
          academicYear: a.academicYear || '2024–25',
          teacherId: a.teacherId,
          teacherName: a.teacherName,
          status: 'Not Submitted',
          courseFileId: null,
          submittedAt: null,
          fileUrl: null,
          fileCount: 0,
          templateData: null
        });
      }
    }

    const courses = Array.from(courseMap.values());
    return res.json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error: any) {
    logger.error(`[getHODSemesterCourses Error] ${error.message}`);
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
      const targetBatch = String(batch).trim().replace(/[\u2013\u2014]/g, '-').toLowerCase();
      scopedFiles = scopedFiles.filter((f: any) => {
        if (!f.batch) return false;
        const fb = f.batch.trim().replace(/[\u2013\u2014]/g, '-').toLowerCase();
        return fb === targetBatch;
      });
    }
    if (session) {
      const targetSession = String(session).trim().toLowerCase();
      scopedFiles = scopedFiles.filter((f: any) => {
        if (!f.session) return false;
        return f.session.trim().toLowerCase().includes(targetSession);
      });
    }
    if (semester) {
      const targetSem = String(semester).trim().toLowerCase();
      scopedFiles = scopedFiles.filter((f: any) => {
        if (!f.semester) return false;
        const fs = f.semester.trim().toLowerCase();
        return fs === targetSem || fs.startsWith(targetSem.split(' ')[0]);
      });
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

    // Requirement 28: HOD Self-Approval Prevention Rule
    const isSelfCourse = file.teacherId === req.hodUser?.id ||
      file.teacherId === scope.hodId ||
      (file.teacherEmail && scope.hodEmail && file.teacherEmail.toLowerCase() === scope.hodEmail.toLowerCase());

    const isSuperAdmin = req.hodUser?.role === 'ADMIN' || req.headers['x-user-role'] === 'ADMIN';

    if (isSelfCourse && !isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Self-approval is prohibited: Head of Department (HOD) cannot approve their own Course File. It must be reviewed and approved by Dean / Administrator.'
      });
    }

    // Requirement 16 & 36: Backend validation - all required documents must be resolved & verified
    const currentChecklist = req.body.checklist || (file.templateData?.checklist || []);
    if (Array.isArray(currentChecklist) && currentChecklist.length > 0) {
      const hasNeedsImp = currentChecklist.some((item: any) => item.status === 'Needs Improvement');
      if (hasNeedsImp) {
        return res.status(400).json({
          success: false,
          message: 'Cannot approve course file: One or more documents are marked as "Needs Improvement". All sections must be verified or corrected before final approval.'
        });
      }

      const hasUnresolvedMandatory = currentChecklist.some((item: any) => {
        const isConditional = item.isApplicableOnly || [9, 10, 11].includes(item.srNo);
        if (isConditional && (item.verified === 'N/A' || item.status === 'N/A' || item.isNA)) return false;
        return item.verified !== 'Yes' && item.status !== 'Verified';
      });

      if (hasUnresolvedMandatory) {
        return res.status(400).json({
          success: false,
          message: 'Cannot approve course file: All required documents must be Verified (Yes) before final approval.'
        });
      }
    }

    const reviewedAt = new Date().toISOString();
    const reviewedBy = scope.hodName;
    const templateData = req.body.templateData || (req.body.checklist ? { ...file.templateData, checklist: req.body.checklist } : file.templateData);

    const updated = await CourseFileService.update(id, {
      status: 'Approved',
      approvalStage: 'Approved',
      reviewedAt,
      reviewedBy,
      templateData: templateData || file.templateData,
      lastModified: new Date().toISOString().split('T')[0],
      remarks: req.body.remarks || 'Approved by HOD'
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
    const returnTemplateData = req.body.templateData || (req.body.checklist ? { ...file.templateData, checklist: req.body.checklist } : file.templateData);

    const updated = await CourseFileService.update(id, {
      status: 'Returned',
      approvalStage: 'Returned for Revision',
      reviewedAt,
      reviewedBy,
      reviewComment,
      remarks: reviewComment,
      templateData: returnTemplateData || file.templateData,
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
 * POST /api/hod/course-files/:id/item-review
 * Reviews an individual course file item: sets status and mandatory/optional comment.
 * If status === 'Needs Improvement', a comment is mandatory!
 */
export const reviewHODCourseFileItem = async (req: HODRequest, res: Response) => {
  try {
    const { id } = req.params;
    const scope = req.hodScope!;
    const { srNo, status, comment } = req.body;

    if (!srNo || !status) {
      return res.status(400).json({
        success: false,
        message: 'Section serial number (srNo) and review status are required.'
      });
    }

    if (status === 'Needs Improvement' && (!comment || !comment.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a comment explaining what needs to be corrected.'
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
        message: 'Access denied: You cannot review course files outside your department.'
      });
    }

    const checklist = Array.isArray(file.templateData?.checklist) ? [...file.templateData.checklist] : [];
    const itemIndex = checklist.findIndex((it: any) => it.srNo === Number(srNo));

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: `Checklist item ${srNo} not found.` });
    }

    const reviewedAt = new Date().toISOString();
    const cleanComment = (comment || '').trim();

    checklist[itemIndex] = {
      ...checklist[itemIndex],
      status,
      verified: status === 'Verified' ? 'Yes' : status === 'N/A' ? 'N/A' : 'No',
      comment: cleanComment,
      reviewedAt,
      reviewedBy: scope.hodName,
      hodId: scope.hodId
    };

    const hasNeedsImprovement = checklist.some((it: any) => it.status === 'Needs Improvement');

    const updated = await CourseFileService.update(id, {
      templateData: {
        ...file.templateData,
        checklist
      },
      status: hasNeedsImprovement && file.status !== 'Approved' ? 'Needs Improvement' : file.status,
      lastModified: new Date().toISOString().split('T')[0]
    });

    return res.json({
      success: true,
      message: `Review and comment for Section ${srNo} saved successfully.`,
      data: {
        item: checklist[itemIndex],
        checklist
      }
    });
  } catch (error: any) {
    logger.error(`[reviewHODCourseFileItem Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/hod/course-files/:id/checklist-review
 * Reviews and updates the whole checklist with comments and statuses
 */
export const reviewHODCourseFileChecklist = async (req: HODRequest, res: Response) => {
  try {
    const { id } = req.params;
    const scope = req.hodScope!;
    const { checklist } = req.body;

    if (!Array.isArray(checklist)) {
      return res.status(400).json({ success: false, message: 'Checklist array is required.' });
    }

    // Validate that if any item has status === 'Needs Improvement', it must have a comment
    for (const item of checklist) {
      if (item.status === 'Needs Improvement' && (!item.comment || !item.comment.trim())) {
        return res.status(400).json({
          success: false,
          message: `Please enter a comment explaining what needs to be corrected for section ${item.srNo} (${item.content || item.name || 'document'}).`
        });
      }
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
        message: 'Access denied: You cannot review course files outside your department.'
      });
    }

    const reviewedChecklist = checklist.map((item: any) => ({
      ...item,
      verified: item.status === 'Verified' ? 'Yes' : item.status === 'N/A' ? 'N/A' : (item.verified || 'No'),
      reviewedBy: item.reviewedBy || scope.hodName,
      hodId: item.hodId || scope.hodId,
      reviewedAt: item.reviewedAt || new Date().toISOString()
    }));

    const hasNeedsImprovement = reviewedChecklist.some((it: any) => it.status === 'Needs Improvement');

    const updated = await CourseFileService.update(id, {
      templateData: {
        ...file.templateData,
        checklist: reviewedChecklist
      },
      status: hasNeedsImprovement && file.status !== 'Approved' ? 'Needs Improvement' : file.status,
      lastModified: new Date().toISOString().split('T')[0]
    });

    return res.json({
      success: true,
      message: 'All checklist item reviews and comments saved successfully.',
      data: updated
    });
  } catch (error: any) {
    logger.error(`[reviewHODCourseFileChecklist Error] ${error.message}`);
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

/**
 * Generate official Course File Dossier HTML document
 */
export const generateCourseFileHtml = (file: any): string => {
  const checklist = (file.templateData && Array.isArray(file.templateData.checklist))
    ? file.templateData.checklist
    : [];

  const clos = (file.templateData && Array.isArray(file.templateData.clos))
    ? file.templateData.clos
    : [];

  const approvalDate = file.reviewedAt
    ? new Date(file.reviewedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Pending Review';

  const rows = checklist.map((item: any) => `
    <tr>
      <td style="text-align:center; font-weight:bold;">${item.srNo || '-'}</td>
      <td><strong>${item.name || 'Component'}</strong><br><span style="color:#64748b; font-size:11px;">${item.content || ''}</span></td>
      <td>${item.fileName || 'Attached in Dossier'}</td>
      <td style="text-align:center;">
        <span style="display:inline-block; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:bold; background:${item.status === 'Verified' || item.verified === 'Yes' ? '#dcfce7' : '#fee2e2'}; color:${item.status === 'Verified' || item.verified === 'Yes' ? '#166534' : '#991b1b'};">
          ${item.status || (item.verified === 'Yes' ? 'Verified' : 'Needs Improvement')}
        </span>
      </td>
      <td>
        <div style="font-size:12px; color:#334155; font-style:italic;">
          ${item.comment ? `"${item.comment}"` : 'No individual comment recorded.'}
        </div>
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Accreditation Dossier - ${file.courseCode} - ${file.teacherName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 30px; color: #1e293b; background: #fff; line-height: 1.5; }
    .container { max-width: 900px; margin: auto; }
    .header { text-align: center; border-bottom: 3px solid #059669; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0 0 6px 0; font-size: 22px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
    .header h2 { margin: 0 0 4px 0; font-size: 15px; color: #059669; text-transform: uppercase; font-weight: bold; }
    .header p { margin: 0; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px; }
    .meta-item span { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 800; letter-spacing: 0.5px; }
    .meta-item strong { font-size: 13px; color: #0f172a; }
    .section-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin: 24px 0 12px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th { background: #f1f5f9; padding: 10px 8px; border: 1px solid #cbd5e1; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; }
    td { padding: 10px 8px; border: 1px solid #e2e8f0; vertical-align: top; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
    .sig-box { width: 220px; border-top: 1px solid #475569; text-align: center; padding-top: 6px; margin-top: 40px; font-weight: bold; color: #0f172a; }
    @media print { body { padding: 10px; } .meta-grid { background: #fff !important; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>University of Education, Attock Campus</h1>
      <h2>${file.departmentName || 'Department of Computer Science'}</h2>
      <p>Official Course File & Accreditation Dossier</p>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><span>Course Code</span><strong>${file.courseCode || 'N/A'}</strong></div>
      <div class="meta-item"><span>Course Title</span><strong>${file.courseTitle || 'N/A'}</strong></div>
      <div class="meta-item"><span>Credit Hours</span><strong>${file.credits || 3} Credits</strong></div>
      <div class="meta-item"><span>Status</span><strong>${file.status || 'Approved'}</strong></div>
      <div class="meta-item"><span>Faculty Member</span><strong>${file.teacherName || 'N/A'}</strong></div>
      <div class="meta-item"><span>Batch & Session</span><strong>${file.batch || '2023'} (${file.session || '2023–2027'})</strong></div>
      <div class="meta-item"><span>Semester</span><strong>${file.semester || '7th Semester'}</strong></div>
      <div class="meta-item"><span>Approval Date</span><strong>${approvalDate}</strong></div>
    </div>

    ${file.templateData?.courseDescription ? `
      <div class="section-title">Course Description</div>
      <p style="font-size:13px; color:#334155; line-height:1.6; margin:0 0 16px 0;">${file.templateData.courseDescription}</p>
    ` : ''}

    ${clos.length > 0 ? `
      <div class="section-title">Course Learning Outcomes (CLOs)</div>
      <table>
        <thead>
          <tr><th style="width:15%;">Code</th><th style="width:65%;">Description</th><th style="width:20%;">Mapped PLO</th></tr>
        </thead>
        <tbody>
          ${clos.map((c: any) => `<tr><td style="font-weight:bold; font-family:monospace;">${c.code || '-'}</td><td>${c.description || '-'}</td><td>${c.plo || '-'}</td></tr>`).join('')}
        </tbody>
      </table>
    ` : ''}

    <div class="section-title">Statutory 15 Verification Checklist & Individual HOD Reviews</div>
    <table>
      <thead>
        <tr>
          <th style="width:6%;">Sr</th>
          <th style="width:30%;">Item / Component</th>
          <th style="width:20%;">Attached Document</th>
          <th style="width:16%; text-align:center;">Review State</th>
          <th style="width:28%;">Mandatory HOD Review Comment</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div style="display:flex; justify-content:space-between; margin-top:50px;">
      <div class="sig-box">
        Course Instructor / Teacher<br>
        <span style="font-size:11px; font-weight:normal; color:#64748b;">${file.teacherName}</span>
      </div>
      <div class="sig-box">
        Head of Department (HOD)<br>
        <span style="font-size:11px; font-weight:normal; color:#64748b;">${file.reviewedBy || 'Dr. Asif'}</span>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Generate official Certificate HTML document
 */
export const generateCertificateHtml = (file: any): string => {
  const approvalDate = file.reviewedAt
    ? new Date(file.reviewedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });

  const certId = `UE-CFMS-${file.batch || '2026'}-${(file.id || 'CERT').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Certificate of Course File Completion - ${file.courseCode} - ${file.teacherName}</title>
  <style>
    body { font-family: 'Georgia', 'Times New Roman', serif; margin: 0; padding: 40px; background: #faf8f2; color: #14281e; }
    .cert-container { max-width: 850px; margin: auto; border: 10px double #a67c1e; padding: 40px 50px; background: #fff; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
    .header { text-align: center; border-bottom: 2px solid #a67c1e; padding-bottom: 16px; margin-bottom: 24px; }
    .crest { font-size: 32px; font-weight: 900; color: #a67c1e; margin-bottom: 6px; letter-spacing: 2px; }
    .inst-name { font-size: 22px; font-weight: 900; text-transform: uppercase; color: #14281e; margin: 0; letter-spacing: 1px; }
    .campus-name { font-size: 14px; font-weight: bold; color: #1b5e3c; text-transform: uppercase; margin: 4px 0 0 0; }
    .cert-heading { text-align: center; margin: 28px 0; }
    .cert-heading h2 { font-size: 20px; font-weight: 900; text-transform: uppercase; color: #a67c1e; letter-spacing: 2px; margin: 0; }
    .cert-heading p { font-size: 13px; font-style: italic; color: #64748b; margin: 4px 0 0 0; }
    .cert-body { font-size: 15px; line-height: 1.8; text-align: justify; margin: 20px 0; }
    .highlight { font-weight: bold; color: #0d4a2b; }
    .meta-box { background: #faf8f2; border: 1px solid #e7dfcb; border-radius: 6px; padding: 14px 20px; margin: 24px 0; font-family: sans-serif; font-size: 12px; }
    .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .meta-grid div span { display: block; font-size: 10px; text-transform: uppercase; color: #8c733e; font-weight: bold; }
    .meta-grid div strong { font-size: 13px; color: #14281e; }
    .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; }
    .sig-line { width: 220px; border-top: 1px solid #14281e; text-align: center; font-size: 12px; font-weight: bold; padding-top: 6px; }
    .footer-id { text-align: center; margin-top: 30px; font-size: 10px; color: #8c733e; font-family: monospace; letter-spacing: 1px; }
    @media print { body { padding: 0; background: #fff; } .cert-container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="cert-container">
    <div class="header">
      <div class="crest">UE</div>
      <h1 class="inst-name">University of Education, Attock Campus</h1>
      <p class="campus-name">${file.departmentName || 'Department of Computer Science'}</p>
    </div>

    <div class="cert-heading">
      <h2>Certificate of Course File Completion</h2>
      <p>Quality Enhancement Cell (QEC) & Accreditation Compliance</p>
    </div>

    <div class="cert-body">
      This is to formally certify that <strong>${file.teacherName}</strong> (${file.teacherRole === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}) has successfully submitted, compiled, and verified the complete Course File for the course <span class="highlight">${file.courseTitle} (${file.courseCode})</span> for the academic session <span class="highlight">${file.session || '2023–2027'}</span>, <span class="highlight">${file.semester || '7th Semester'}</span>, Batch <span class="highlight">${file.batch || '2023'}</span>.
      <br><br>
      All 15 statutory instructional and assessment components—including Curriculum Outlines, Weekly Lecture Plans, Examination Artifacts, Assessment Keys, and Outcome Attainment Records—have undergone rigorous verification and satisfy all Quality Enhancement Cell (QEC) accreditation requirements.
    </div>

    <div class="meta-box">
      <div class="meta-grid">
        <div><span>Certificate ID</span><strong>${certId}</strong></div>
        <div><span>Date of Approval</span><strong>${approvalDate}</strong></div>
        <div><span>Accreditation Status</span><strong style="color:#166534;">Verified & Approved</strong></div>
      </div>
    </div>

    <div class="signatures">
      <div class="sig-line">
        Head of Department (HOD)<br>
        <span style="font-size:10px; font-weight:normal; color:#64748b;">${file.reviewedBy || 'Dr. Asif'}</span>
      </div>
      <div class="sig-line">
        Director / Convener QEC<br>
        <span style="font-size:10px; font-weight:normal; color:#64748b;">Quality Enhancement Cell</span>
      </div>
    </div>

    <div class="footer-id">
      Official Verification Code: ${certId} • University of Education Attock Campus
    </div>
  </div>
</body>
</html>`;
};

/**
 * Normalizes semester name to standard folder name (e.g., Semester_1, Semester_7)
 */
const normalizeSemesterFolder = (sem: string): string => {
  if (!sem) return 'Semester_General';
  const match = sem.match(/(\d+)/);
  if (match) {
    return `Semester_${match[1]}`;
  }
  return sem.replace(/[^a-zA-Z0-9]/g, '_');
};

/**
 * GET /api/hod/downloads/batch/:batch
 * Generates and streams structured ZIP package for an entire batch (Option 3 & Requirement 30)
 * Directory Structure:
 * Batch_{BatchYear}/
 *   Semester_1/
 *   Semester_2/
 *   ...
 *   Semester_8/
 */
export const downloadHODBatchZip = async (req: HODRequest, res: Response) => {
  try {
    const scope = req.hodScope!;
    const batch = (req.params.batch || req.query.batch || '').toString().trim();
    const session = (req.query.session || '').toString().trim();

    const allFiles = await CourseFileService.getAll();
    const scopedFiles = filterFilesByHODScope(allFiles, scope);
    const normReqBatch = batch ? batch.replace(/[\u2013\u2014]/g, '-').trim().toLowerCase() : '';
    const batchApprovedFiles = scopedFiles.filter((f: any) => {
      const matchStatus = f.status === 'Approved';
      const fBatchNorm = (f.batch || '').replace(/[\u2013\u2014]/g, '-').trim().toLowerCase();
      const matchBatch = !batch || fBatchNorm === normReqBatch;
      const matchSession = !session || (f.session && f.session.toLowerCase().includes(session.toLowerCase()));
      return matchStatus && matchBatch && matchSession;
    });

    const safeBatch = (batch || 'AllBatches').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const safeDept = (scope.departmentName || 'Dept').replace(/[^a-zA-Z0-9]/g, '_');
    const safeSess = session ? `_${session}` : '';
    const zipFilename = `${safeBatch}${safeSess}_${safeDept}_CourseFiles.zip`;

    res.attachment(zipFilename);
    res.setHeader('Content-Type', 'application/zip');

    const archive = createZipArchive({ zlib: { level: 9 } });

    archive.on('error', (err: any) => {
      logger.error(`[archiver error] ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: err.message });
      }
    });

    archive.pipe(res);

    for (const file of batchApprovedFiles) {
      const fileSess = (file.session && file.session.toLowerCase().includes('fall')) ? 'Fall' : 'Spring';
      const semFolder = normalizeSemesterFolder(file.semester);
      const safeTeacher = (file.teacherName || 'Faculty').replace(/[^a-zA-Z0-9]/g, '_');
      const safeCourse = (file.courseCode || 'Course').replace(/[^a-zA-Z0-9]/g, '_');
      const basePath = `${safeBatch}/${fileSess}/${semFolder}/${safeCourse}_${safeTeacher}`;

      // 1. Course File Dossier HTML
      const dossierHtml = generateCourseFileHtml(file);
      archive.append(dossierHtml, { name: `${basePath}_CourseFile_Dossier.html` });

      // 2. Official Certificate HTML
      const certHtml = generateCertificateHtml(file);
      archive.append(certHtml, { name: `${basePath}_Certificate.html` });

      // 3. Attach physical file if uploaded on disk
      if (file.fileUrl) {
        const localPath = path.join(process.cwd(), file.fileUrl.replace(/^\//, ''));
        if (fs.existsSync(localPath)) {
          archive.file(localPath, { name: `${basePath}_AttachedFile${path.extname(localPath)}` });
        }
      }
    }

    if (batchApprovedFiles.length === 0) {
      const sessionLabel = session ? `${session} session of ` : '';
      archive.append(`No approved course files available yet for ${sessionLabel}Batch ${batch}.\n`, {
        name: `${safeBatch}/README.txt`
      });
    }

    // Add Batch Manifest
    const manifest = {
      institution: 'University of Education, Attock Campus',
      department: scope.departmentName,
      campus: scope.campusName,
      batch: batch || 'All',
      session: session || 'All (Spring + Fall)',
      generatedAt: new Date().toISOString(),
      generatedBy: scope.hodName,
      totalApprovedCourseFiles: batchApprovedFiles.length,
      files: batchApprovedFiles.map((f: any) => ({
        id: f.id,
        courseCode: f.courseCode,
        courseTitle: f.courseTitle,
        teacherName: f.teacherName,
        session: f.session,
        semester: f.semester,
        reviewedAt: f.reviewedAt
      }))
    };
    archive.append(JSON.stringify(manifest, null, 2), {
      name: `${safeBatch}/manifest.json`
    });

    await archive.finalize();
  } catch (error: any) {
    logger.error(`[downloadHODBatchZip Error] ${error.message}`);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

/**
 * GET /api/hod/downloads/semester
 * Generates and streams structured ZIP package for a specific semester (Option 2)
 */
export const downloadHODSemesterZip = async (req: HODRequest, res: Response) => {
  try {
    const scope = req.hodScope!;
    const semester = (req.query.semester || '').toString().trim();
    const batch = (req.query.batch || '').toString().trim();
    const session = (req.query.session || '').toString().trim();

    const allFiles = await CourseFileService.getAll();
    const scopedFiles = filterFilesByHODScope(allFiles, scope);
    const normReqBatch = batch ? batch.replace(/[\u2013\u2014]/g, '-').trim().toLowerCase() : '';
    const semesterApprovedFiles = scopedFiles.filter((f: any) => {
      const matchStatus = f.status === 'Approved';
      const matchSem = !semester || (f.semester && (
        f.semester.toLowerCase() === semester.toLowerCase() ||
        normalizeSemesterFolder(f.semester) === normalizeSemesterFolder(semester)
      ));
      const fBatchNorm = (f.batch || '').replace(/[\u2013\u2014]/g, '-').trim().toLowerCase();
      const matchBatch = !batch || fBatchNorm === normReqBatch;
      const matchSession = !session || (f.session && f.session.toLowerCase().includes(session.toLowerCase()));
      return matchStatus && matchSem && matchBatch && matchSession;
    });

    const safeBatch = (batch || 'Batch').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const safeDept = (scope.departmentName || 'Dept').replace(/[^a-zA-Z0-9]/g, '_');
    const safeSem = normalizeSemesterFolder(semester || 'Semester');
    const safeSess = session ? `_${session}` : '';
    const zipFilename = `${safeBatch}${safeSess}_${safeSem}_CourseFiles.zip`;

    res.attachment(zipFilename);
    res.setHeader('Content-Type', 'application/zip');

    const archive = createZipArchive({ zlib: { level: 9 } });

    archive.on('error', (err: any) => {
      logger.error(`[archiver error] ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: err.message });
      }
    });

    archive.pipe(res);

    for (const file of semesterApprovedFiles) {
      const safeTeacher = (file.teacherName || 'Faculty').replace(/[^a-zA-Z0-9]/g, '_');
      const safeCourse = (file.courseCode || 'Course').replace(/[^a-zA-Z0-9]/g, '_');
      const folderPrefix = `${safeBatch}/${session || file.session || 'Session'}/${safeSem}`;
      const basePath = `${folderPrefix}/${safeCourse}_${safeTeacher}`;

      // 1. Dossier
      archive.append(generateCourseFileHtml(file), { name: `${basePath}_CourseFile_Dossier.html` });

      // 2. Certificate
      archive.append(generateCertificateHtml(file), { name: `${basePath}_Certificate.html` });

      // 3. Physical upload if present
      if (file.fileUrl) {
        const localPath = path.join(process.cwd(), file.fileUrl.replace(/^\//, ''));
        if (fs.existsSync(localPath)) {
          archive.file(localPath, { name: `${basePath}_AttachedFile${path.extname(localPath)}` });
        }
      }
    }

    if (semesterApprovedFiles.length === 0) {
      archive.append(`No approved course files found for ${batch} ${session} ${semester}.\n`, {
        name: `${safeBatch}_${safeSem}/README.txt`
      });
    }

    await archive.finalize();
  } catch (error: any) {
    logger.error(`[downloadHODSemesterZip Error] ${error.message}`);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

/**
 * GET /api/hod/downloads/certificates
 * Generates and streams structured ZIP package for approved certificates
 */
export const downloadHODCertificatesZip = async (req: HODRequest, res: Response) => {
  try {
    const scope = req.hodScope!;
    const batch = req.query.batch ? req.query.batch.toString().trim() : '';
    const semester = req.query.semester ? req.query.semester.toString().trim() : '';

    const allFiles = await CourseFileService.getAll();
    const scopedFiles = filterFilesByHODScope(allFiles, scope);
    const approvedFiles = scopedFiles.filter((f: any) => {
      const matchStatus = f.status === 'Approved';
      const matchBatch = !batch || f.batch === batch;
      const matchSem = !semester || (f.semester && f.semester.toLowerCase() === semester.toLowerCase());
      return matchStatus && matchBatch && matchSem;
    });

    const safeDept = (scope.departmentName || 'Dept').replace(/[^a-zA-Z0-9]/g, '_');
    const zipFilename = `Certificates_${safeDept}_${batch || 'All'}.zip`;

    res.attachment(zipFilename);
    res.setHeader('Content-Type', 'application/zip');

    const archive = createZipArchive({ zlib: { level: 9 } });

    archive.on('error', (err: any) => {
      logger.error(`[archiver error] ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: err.message });
      }
    });

    archive.pipe(res);

    for (const file of approvedFiles) {
      const safeTeacher = (file.teacherName || 'Faculty').replace(/[^a-zA-Z0-9]/g, '_');
      const safeCourse = (file.courseCode || 'Course').replace(/[^a-zA-Z0-9]/g, '_');
      const certHtml = generateCertificateHtml(file);
      archive.append(certHtml, { name: `Certificates/${safeCourse}_${safeTeacher}_Certificate.html` });
    }

    if (approvedFiles.length === 0) {
      archive.append('No approved certificates found for the selected scope.\n', { name: 'Certificates/info.txt' });
    }

    await archive.finalize();
  } catch (error: any) {
    logger.error(`[downloadHODCertificatesZip Error] ${error.message}`);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

/**
 * GET /api/hod/downloads/course-file/:id
 * Streams downloadable single course file HTML dossier
 */
export const downloadSingleCourseFileDossier = async (req: HODRequest, res: Response) => {
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
      return res.status(403).json({ success: false, message: 'Access denied: Out of scope.' });
    }

    const safeTeacher = (file.teacherName || 'Faculty').replace(/[^a-zA-Z0-9]/g, '_');
    const safeCourse = (file.courseCode || 'Course').replace(/[^a-zA-Z0-9]/g, '_');
    const safeBatch = (file.batch || 'Batch').replace(/[^a-zA-Z0-9]/g, '_');
    const safeSem = (file.semester || 'Sem').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeTeacher}_${safeCourse}_${safeBatch}_${safeSem}_CourseFile.html`;

    const html = generateCourseFileHtml(file);
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(html);
  } catch (error: any) {
    logger.error(`[downloadSingleCourseFileDossier Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

