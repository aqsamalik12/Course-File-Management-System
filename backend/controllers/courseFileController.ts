import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { CourseFileService, ArchiveService, NotificationService, UserService, TeacherRequestService, TeacherAssignmentService } from '../services/supabaseService';
import { logger } from '../config/logger';

export const getCourseFiles = async (req: Request, res: Response) => {
  try {
    const { departmentId, teacherId, status, search, archived } = req.query;
    let files = await CourseFileService.getAll();

    if (departmentId) files = files.filter((f: any) => f.departmentId === departmentId);
    if (teacherId) files = files.filter((f: any) => f.teacherId === teacherId);
    if (status) files = files.filter((f: any) => f.status === status);
    if (archived !== undefined) {
      const isArch = archived === 'true';
      files = files.filter((f: any) => f.archived === isArch);
    }
    if (search) {
      const s = String(search).toLowerCase();
      files = files.filter(
        (f: any) =>
          (f.title && f.title.toLowerCase().includes(s)) ||
          (f.courseCode && f.courseCode.toLowerCase().includes(s)) ||
          (f.courseTitle && f.courseTitle.toLowerCase().includes(s)) ||
          (f.teacherName && f.teacherName.toLowerCase().includes(s))
      );
    }

    return res.json({ success: true, count: files.length, data: files });
  } catch (error: any) {
    logger.error(`[getCourseFiles Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadCourseFile = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const file = req.file;

    // RULE 28, 30 & 50: Verify that if uploader is a teacher, their registration request is Approved
    const headerUserId = req.headers['x-user-id'] as string;
    const headerUserRole = req.headers['x-user-role'] as string;
    const teacherId = body.teacherId || (req as any).user?.id || headerUserId;
    const teacherRole = body.teacherRole || (req as any).user?.role || headerUserRole;

    if (teacherId) {
      // 1. Strict Admin Teacher Assignment Validation (Department -> Section -> Course)
      const hasAssignments = await TeacherAssignmentService.hasAssignmentsForTeacher(teacherId);
      if (hasAssignments) {
        const secVal = body.section || body.sectionName || body.sectionId || body.batch || '';
        const crsVal = body.courseId || body.courseCode || body.courseTitle || '';
        const deptVal = body.departmentId || body.departmentName || '';
        const val = await TeacherAssignmentService.validateAssignment(teacherId, deptVal, secVal, crsVal);
        if (!val.isValid) {
          return res.status(403).json({
            success: false,
            message: 'Invalid selection. This Department, Section, or Course is not assigned to your account. Please select an authorized option.'
          });
        }
      }

      const teacher = await UserService.getById(teacherId);
      const reqRecord = await TeacherRequestService.getByTeacherId(teacherId);
      const isTeacher =
        teacherRole === 'REGULAR_TEACHER' ||
        teacherRole === 'VISITING_TEACHER' ||
        teacher?.role === 'REGULAR_TEACHER' ||
        teacher?.role === 'VISITING_TEACHER' ||
        !!reqRecord;

      if (isTeacher) {
        const isApproved = teacher?.enrollmentStatus === 'Approved' || reqRecord?.status === 'Approved' || hasAssignments;
        if (!isApproved) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Course-wise workflow is locked until your registration request is approved by your HOD.'
          });
        }
      }
    }

    const today = new Date().toISOString().split('T')[0];
    const fileId = body.id || `file-${Date.now()}`;

    // Lookup teacher profile and request to auto-fill routing scope if omitted
    const teacher = teacherId ? await UserService.getById(teacherId) : null;
    const reqRecord = teacherId ? await TeacherRequestService.getByTeacherId(teacherId) : null;

    const campusId = body.campusId || teacher?.campusId || reqRecord?.campusId || '';
    const campusName = body.campusName || teacher?.campus || teacher?.campusName || reqRecord?.campusName || '';
    const departmentId = body.departmentId || teacher?.departmentId || reqRecord?.departmentId || '';
    const departmentName = body.departmentName || teacher?.departmentName || reqRecord?.departmentName || '';
    const hodId = body.hodId || teacher?.hodId || reqRecord?.hodId || '';
    const hodName = body.hodName || reqRecord?.hodName || '';

    // Strict Scope & Teacher Assignment Validation:
    // Teacher cannot create or submit a course file for unauthorized department, section, or course
    if (teacher && (teacherRole === 'REGULAR_TEACHER' || teacherRole === 'VISITING_TEACHER' || teacher.role === 'REGULAR_TEACHER' || teacher.role === 'VISITING_TEACHER')) {
      const allowedDeptId = teacher.departmentId || reqRecord?.departmentId;
      if (body.departmentId && allowedDeptId && body.departmentId !== allowedDeptId) {
        return res.status(403).json({
          success: false,
          message: 'Invalid selection. This Department, Section, or Course is not assigned to your account. Please select an authorized option.'
        });
      }
      const allowedCampusId = teacher.campusId || reqRecord?.campusId;
      if (body.campusId && allowedCampusId && body.campusId !== allowedCampusId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot create or submit course files outside your approved campus.'
        });
      }

      // Check Admin Teacher Assignment
      const hasAssignments = await TeacherAssignmentService.hasAssignmentsForTeacher(teacherId);
      if (hasAssignments) {
        const secVal = body.section || body.sectionName || body.sectionId || body.batch || '';
        const crsVal = body.courseId || body.courseCode || body.courseTitle || '';
        const val = await TeacherAssignmentService.validateAssignment(teacherId, departmentId, secVal, crsVal);
        if (!val.isValid) {
          return res.status(403).json({
            success: false,
            message: 'Invalid selection. This Department, Section, or Course is not assigned to your account. Please select an authorized option.'
          });
        }
      }
    }

    const batch = (body.batch || body.batchYear || '2024').trim();
    const session = (body.session || body.academicSession || '2024–2025').trim();
    const semester = (body.semester || '1st Semester').trim();
    const requestedStatus = body.status === 'Draft' ? 'Draft' : 'Submitted';

    // Duplicate Check (Requirement 41: Teacher cannot submit duplicate active course file for same Course + Batch + Session + Semester)
    const allFiles = await CourseFileService.getAll();
    const courseCode = (body.courseCode || 'GEN-101').trim();
    const courseId = body.courseId || `course-${Date.now()}`;

    const existingFile = allFiles.find((f: any) =>
      !f.deleted &&
      f.teacherId === teacherId &&
      (f.courseId === courseId || f.courseCode === courseCode) &&
      f.batch === batch &&
      f.session === session &&
      f.semester === semester
    );

    if (existingFile) {
      if (existingFile.status === 'Draft' || existingFile.status === 'Returned') {
        // Reuse and update the existing file without creating duplicates
        const updated = await CourseFileService.update(existingFile.id, {
          title: body.title || existingFile.title,
          status: requestedStatus,
          templateData: body.templateData || existingFile.templateData,
          lastModified: today,
          submittedAt: requestedStatus === 'Submitted' ? new Date().toISOString() : existingFile.submittedAt,
          approvalStage: requestedStatus === 'Submitted' ? 'HOD Review' : existingFile.approvalStage,
          reviewComment: requestedStatus === 'Submitted' ? null : existingFile.reviewComment
        });

        if (requestedStatus === 'Submitted' && hodId) {
          await NotificationService.create({
            title: 'New Course File Submitted',
            message: `Teacher ${teacher?.name || body.teacherName} submitted course file for ${courseCode} - ${body.courseTitle || existingFile.courseTitle} (${semester}, ${session}, Batch ${batch}).`,
            type: 'info',
            targetRole: 'HOD',
            targetUserId: hodId,
            linkModule: 'Course Files'
          });
        }

        return res.status(200).json({
          success: true,
          message: requestedStatus === 'Submitted' ? 'Course file submitted to HOD successfully.' : 'Course file draft saved successfully.',
          data: updated
        });
      }

      return res.status(400).json({
        success: false,
        message: 'This course file already exists for this semester.'
      });
    }

    const fileSizeStr = file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : body.fileSize || '2.5 MB';
    const fileUrl = file ? `/uploads/${file.filename}` : body.fileUrl || '#';
    const fileOriginalName = file ? file.originalname : `${courseCode}_Compiled_Course_File.pdf`;

    const initialVersion = {
      id: `ver-${Date.now()}`,
      versionNumber: 'v1.0',
      fileName: fileOriginalName,
      fileSize: fileSizeStr,
      uploadedBy: body.teacherName || teacher?.name || 'Teacher',
      uploadedByRole: body.teacherRole || teacher?.role || 'REGULAR_TEACHER',
      uploadedAt: `${today} 09:00 AM`,
      changeLog: requestedStatus === 'Draft' ? 'Initial Draft Created' : 'Initial Course File Submission',
      fileUrl
    };

    const newCourseFileObj = {
      id: fileId,
      courseId,
      courseCode,
      courseTitle: body.courseTitle || 'Untitled Course',
      credits: Number(body.credits || body.creditHours || 3),
      campusId,
      campusName,
      departmentId,
      departmentName,
      hodId,
      hodName,
      batch,
      session,
      semester,
      teacherId,
      teacherName: body.teacherName || teacher?.name || 'Faculty Member',
      teacherEmail: body.teacherEmail || teacher?.email || '',
      teacherRole: body.teacherRole || teacher?.role || 'REGULAR_TEACHER',
      title: body.title || `${courseCode} Course File (${semester}, ${session})`,
      category: body.category || 'Complete Course Dossier',
      currentVersion: 'v1.0',
      fileType: body.fileType || (file ? (file.originalname.split('.').pop()?.toUpperCase() as any) : 'PDF'),
      fileSize: fileSizeStr,
      fileUrl,
      status: requestedStatus,
      submittedAt: requestedStatus === 'Submitted' ? new Date().toISOString() : null,
      uploadDate: today,
      lastModified: today,
      archived: false,
      deleted: false,
      versionHistory: [initialVersion],
      remarks: body.remarks || '',
      templateData: body.templateData || null,
      approvalStage: requestedStatus === 'Draft' ? 'Draft' : 'HOD Review'
    };

    const saved = await CourseFileService.create(newCourseFileObj);

    // Send Notification to HOD only on Submit (never on Draft - Requirement 36)
    if (requestedStatus === 'Submitted' && hodId) {
      await NotificationService.create({
        title: 'New Course File Submitted',
        message: `Teacher ${newCourseFileObj.teacherName} submitted course file for ${courseCode} - ${newCourseFileObj.courseTitle} (${semester}, ${session}, Batch ${batch}).`,
        type: 'info',
        targetRole: 'HOD',
        targetUserId: hodId,
        linkModule: 'Course Files'
      });
    }

    return res.status(201).json({
      success: true,
      message: requestedStatus === 'Submitted' ? 'Course file submitted to HOD successfully.' : 'Course file draft saved successfully.',
      data: saved
    });
  } catch (error: any) {
    logger.error(`[uploadCourseFile Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/course-files/:id
 * Allows teacher to update draft or resubmit a returned course file
 */
export const updateCourseFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const today = new Date().toISOString().split('T')[0];

    const existing = await CourseFileService.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Course file not found' });
    }

    const isSubmitting = body.status === 'Submitted' && existing.status !== 'Approved';
    const newStatus = isSubmitting ? 'Submitted' : (body.status || existing.status);

    const updates: any = {
      title: body.title || existing.title,
      batch: body.batch || existing.batch,
      session: body.session || existing.session,
      semester: body.semester || existing.semester,
      templateData: body.templateData ? { ...existing.templateData, ...body.templateData } : existing.templateData,
      status: newStatus,
      lastModified: today,
      remarks: body.remarks || existing.remarks
    };

    if (isSubmitting) {
      updates.submittedAt = new Date().toISOString();
      updates.approvalStage = 'HOD Review';
      updates.reviewedAt = null;
      updates.reviewedBy = null;
      updates.reviewComment = null;

      // Notify HOD
      if (existing.hodId) {
        await NotificationService.create({
          title: 'Course File Resubmitted',
          message: `Teacher ${existing.teacherName} resubmitted course file for ${existing.courseCode} - ${existing.courseTitle} (${updates.semester || existing.semester}, ${updates.session || existing.session}).`,
          type: 'info',
          targetRole: 'HOD',
          targetUserId: existing.hodId,
          linkModule: 'Course Files'
        });
      }
    }

    const updated = await CourseFileService.update(id, updates);
    return res.json({
      success: true,
      message: isSubmitting ? 'Course file submitted to HOD successfully.' : 'Course file updated successfully.',
      data: updated
    });
  } catch (error: any) {
    logger.error(`[updateCourseFile Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadNewVersion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;
    const { changeLog, uploadedBy, uploadedByRole } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const courseFile = await CourseFileService.getById(id);
    if (!courseFile) return res.status(404).json({ success: false, message: 'Course file not found' });

    const currentMajor = parseInt((courseFile.currentVersion || 'v1.0').replace('v', '').split('.')[0]) || 1;
    const nextVersionNum = `v${currentMajor + 1}.0`;
    const fileSizeStr = file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : '3.0 MB';
    const fileUrl = file ? `/uploads/${file.filename}` : courseFile.fileUrl;

    const newVersion = {
      id: `ver-${Date.now()}`,
      versionNumber: nextVersionNum,
      fileName: file ? file.originalname : `${courseFile.courseCode}_${nextVersionNum}.pdf`,
      fileSize: fileSizeStr,
      uploadedBy: uploadedBy || courseFile.teacherName,
      uploadedByRole: uploadedByRole || courseFile.teacherRole,
      uploadedAt: `${today} 11:30 AM`,
      changeLog: changeLog || `Uploaded revision ${nextVersionNum}`,
      fileUrl
    };

    const currentHistory = Array.isArray(courseFile.versionHistory) ? courseFile.versionHistory : [];
    const updatedHistory = [newVersion, ...currentHistory];

    const updated = await CourseFileService.update(id, {
      currentVersion: nextVersionNum,
      status: 'Submitted',
      lastModified: today,
      fileUrl,
      versionHistory: updatedHistory
    });

    return res.json({ success: true, message: `Version ${nextVersionNum} uploaded successfully`, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFileStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remarks, reviewerName } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const courseFile = await CourseFileService.getById(id);
    if (!courseFile) return res.status(404).json({ success: false, message: 'Course file not found' });

    const isApproved = status === 'Approved';
    const updates: any = {
      status,
      lastModified: today
    };
    if (remarks) updates.remarks = remarks;
    if (isApproved) {
      updates.archived = true;
      await ArchiveService.create({
        id: `arc-${Date.now()}`,
        courseFileId: courseFile.id,
        title: courseFile.title,
        courseCode: courseFile.courseCode,
        departmentId: courseFile.departmentId,
        departmentName: courseFile.departmentName,
        teacherName: courseFile.teacherName,
        archivedAt: today,
        archivedBy: reviewerName || 'HOD (Auto-Archived on Approval)',
        fileUrl: courseFile.fileUrl
      });
    }

    const updated = await CourseFileService.update(id, updates);
    return res.json({ success: true, message: `Status updated to ${status}`, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const archiveCourseFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await CourseFileService.update(id, { archived: true });
    return res.json({ success: true, message: 'Course file archived', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreCourseFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await CourseFileService.update(id, { archived: false, deleted: false });
    return res.json({ success: true, message: 'Course file restored', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const softDeleteCourseFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await CourseFileService.delete(id, false);
    return res.json({ success: true, message: 'Course file moved to recycle bin', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const permanentlyDeleteFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CourseFileService.delete(id, true);
    return res.json({ success: true, message: 'Course file permanently deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', filename);

    if (fs.existsSync(filePath)) {
      return res.download(filePath);
    }
    return res.status(404).json({ success: false, message: 'File not found on server' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
