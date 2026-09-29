import { Request, Response } from 'express';
import {
  TeacherAssignmentService,
  UserService,
  DepartmentService,
  SectionService,
  CourseService,
  HODAssignmentService,
  AuditService
} from '../services/supabaseService';
import { logger } from '../config/logger';

// Helper to extract caller role and user ID
const getCallerInfo = (req: Request) => {
  const user = (req as any).user;
  const headerRole = req.headers['x-user-role'] as string;
  const headerUserId = req.headers['x-user-id'] as string;
  const headerDeptId = req.headers['x-department-id'] as string;

  return {
    id: user?.id || headerUserId || '',
    role: user?.role || headerRole || 'ADMIN',
    departmentId: user?.departmentId || headerDeptId || '',
    name: user?.name || (req.headers['x-user-name'] as string) || 'Authorized User'
  };
};

export const getTeacherAssignments = async (req: Request, res: Response) => {
  try {
    const caller = getCallerInfo(req);
    const { teacherId, departmentId, sectionId, courseId, active } = req.query;

    const filter: any = {};
    if (departmentId) filter.departmentId = String(departmentId);
    if (sectionId) filter.sectionId = String(sectionId);
    if (courseId) filter.courseId = String(courseId);
    if (active !== undefined) filter.active = String(active) === 'true';

    // Strict role isolation: Teachers can ONLY see their own active assignments
    const isTeacher = caller.role === 'REGULAR_TEACHER' || caller.role === 'VISITING_TEACHER';
    if (isTeacher) {
      filter.teacherId = caller.id;
      filter.active = true;
    } else if (teacherId) {
      filter.teacherId = String(teacherId);
    }

    // HOD sees assignments within their department scope
    if (caller.role === 'HOD' && caller.departmentId) {
      filter.departmentId = caller.departmentId;
    }

    const assignments = await TeacherAssignmentService.getAll(filter);
    return res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error: any) {
    logger.error(`[getTeacherAssignments Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAssignments = async (req: Request, res: Response) => {
  try {
    const caller = getCallerInfo(req);
    const teacherId = (req.query.teacherId as string) || caller.id;

    if (!teacherId) {
      return res.status(400).json({ success: false, message: 'Teacher ID is required.' });
    }

    const hierarchy = await TeacherAssignmentService.getAuthorizedHierarchy(teacherId);
    const rawAssignments = await TeacherAssignmentService.getByTeacherId(teacherId, true);

    const hasAssignments = hierarchy.length > 0;

    return res.json({
      success: true,
      hasAssignments,
      message: hasAssignments
        ? 'Authorized assignments loaded.'
        : 'No Department, Section, or Course has been assigned to your account. Please contact the Administrator.',
      data: {
        departments: hierarchy,
        assignments: rawAssignments
      }
    });
  } catch (error: any) {
    logger.error(`[getMyAssignments Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const validateTeacherSelection = async (req: Request, res: Response) => {
  try {
    const { teacherId, departmentId, sectionId, courseId } = req.body;
    const caller = getCallerInfo(req);

    const effectiveTeacherId = teacherId || caller.id;

    if (!effectiveTeacherId || !departmentId || !sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        isValid: false,
        message: 'Invalid selection. This Department, Section, or Course is not assigned to your account. Please select an authorized option.'
      });
    }

    const validation = await TeacherAssignmentService.validateAssignment(
      effectiveTeacherId,
      departmentId,
      sectionId,
      courseId
    );

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        isValid: false,
        message: validation.message || 'Invalid selection. This Department, Section, or Course is not assigned to your account. Please select an authorized option.'
      });
    }

    return res.json({
      success: true,
      isValid: true,
      message: 'Selection is authorized.',
      data: validation.assignment
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTeacherAssignment = async (req: Request, res: Response) => {
  try {
    const {
      teacherId,
      departmentId,
      sectionId,
      courseId,
      academicSession
    } = req.body;

    if (!teacherId || !departmentId || !sectionId || !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required assignment fields: teacherId, departmentId, sectionId, courseId.'
      });
    }

    // 1. Validate Teacher
    const teacher = await UserService.getById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher user not found.' });
    }

    // 2. Validate Department
    const dept = await DepartmentService.getById(departmentId);
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // 3. Validate Section
    const section = await SectionService.getById(sectionId);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }
    if (section.departmentId !== dept.id) {
      return res.status(400).json({
        success: false,
        message: `Section "${section.name}" does not belong to Department "${dept.name}".`
      });
    }

    // 4. Validate Course
    const course = await CourseService.getById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    // Verify course belongs to department
    if (course.departmentId && course.departmentId !== dept.id && course.departmentName?.toLowerCase() !== dept.name.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: `Course "${course.title}" does not belong to Department "${dept.name}".`
      });
    }

    // 5. Resolve active Department HOD
    const activeHodAssignment = await HODAssignmentService.getActiveByScope(dept.campusId || 'camp-attock', dept.id);
    const hodId = activeHodAssignment?.hodId || dept.hodId || '';
    const hodName = activeHodAssignment?.hodName || dept.hodName || 'Department HOD';

    // 6. Check Duplicate Assignment
    const allAssignments = await TeacherAssignmentService.getAll({
      teacherId,
      departmentId,
      sectionId,
      courseId
    });

    if (allAssignments.length > 0) {
      const existing = allAssignments[0];
      if (existing.active) {
        return res.status(400).json({
          success: false,
          message: `This teacher is already actively assigned to ${dept.name} → ${section.name} → ${course.title}.`
        });
      } else {
        // Re-activate existing assignment
        const updated = await TeacherAssignmentService.update(existing.id, {
          active: true,
          updated_at: new Date().toISOString()
        });
        return res.json({
          success: true,
          message: `Assignment re-activated successfully for ${teacher.name}.`,
          data: updated
        });
      }
    }

    const assignmentId = req.body.id || `asgn-t-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const newAssignment = {
      id: assignmentId,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      departmentId: dept.id,
      departmentName: dept.name,
      sectionId: section.id,
      sectionName: section.name,
      courseId: course.id,
      courseCode: course.code,
      courseName: course.title,
      credits: Number(course.credits || 3),
      hodId,
      hodName,
      campusId: dept.campusId || 'camp-attock',
      campusName: dept.campusName || 'Attock Campus',
      academicSession: academicSession || 'Spring 2026',
      active: true,
      assignedBy: (req as any).user?.name || 'Administrator',
      created_at: nowIso,
      updated_at: nowIso
    };

    const saved = await TeacherAssignmentService.create(newAssignment);

    await AuditService.log({
      eventType: 'TEACHER_ASSIGNMENT_CREATED',
      actor: (req as any).user?.name || 'Administrator',
      role: (req as any).user?.role || 'ADMIN',
      resource: `Teacher:${teacher.name}, Dept:${dept.name}, Section:${section.name}, Course:${course.title}, HOD:${hodName}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.status(201).json({
      success: true,
      message: `Teacher ${teacher.name} assigned to ${dept.name} → ${section.name} → ${course.title} successfully.`,
      data: saved
    });
  } catch (error: any) {
    logger.error(`[createTeacherAssignment Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTeacherAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await TeacherAssignmentService.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Teacher assignment not found.' });
    }

    const updates = { ...req.body, updated_at: new Date().toISOString() };
    const updated = await TeacherAssignmentService.update(id, updates);

    await AuditService.log({
      eventType: 'TEACHER_ASSIGNMENT_UPDATED',
      actor: (req as any).user?.name || 'Administrator',
      role: (req as any).user?.role || 'ADMIN',
      resource: `Assignment:${id}, Active:${updated.active}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.json({
      success: true,
      message: 'Teacher assignment updated successfully.',
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeacherAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await TeacherAssignmentService.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Teacher assignment not found.' });
    }

    await TeacherAssignmentService.delete(id);

    await AuditService.log({
      eventType: 'TEACHER_ASSIGNMENT_DELETED',
      actor: (req as any).user?.name || 'Administrator',
      role: (req as any).user?.role || 'ADMIN',
      resource: `Teacher:${existing.teacherName}, Dept:${existing.departmentName}, Section:${existing.sectionName}, Course:${existing.courseName}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.json({
      success: true,
      message: 'Teacher assignment removed successfully.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
