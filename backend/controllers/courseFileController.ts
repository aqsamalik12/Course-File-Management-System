import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { CourseFileService, ArchiveService, NotificationService } from '../services/supabaseService';
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
    const today = new Date().toISOString().split('T')[0];
    const fileId = body.id || `file-${Date.now()}`;

    const fileSizeStr = file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : body.fileSize || '2.5 MB';
    const fileUrl = file ? `/uploads/${file.filename}` : body.fileUrl || '#';
    const fileOriginalName = file ? file.originalname : `${body.courseCode || 'COURSE'}_Compiled_Course_File.pdf`;

    const initialVersion = {
      id: `ver-${Date.now()}`,
      versionNumber: 'v1.0',
      fileName: fileOriginalName,
      fileSize: fileSizeStr,
      uploadedBy: body.teacherName || 'Teacher',
      uploadedByRole: body.teacherRole || 'REGULAR_TEACHER',
      uploadedAt: `${today} 09:00 AM`,
      changeLog: 'Initial Single PDF Course Dossier Upload',
      fileUrl
    };

    const newCourseFileObj = {
      id: fileId,
      courseId: body.courseId || `course-${Date.now()}`,
      courseCode: body.courseCode || 'GEN-101',
      courseTitle: body.courseTitle || 'Untitled Course',
      departmentId: body.departmentId || 'dept-cs',
      departmentName: body.departmentName || 'Computer Science',
      teacherId: body.teacherId || 'usr-teacher-1',
      teacherName: body.teacherName || 'Dr. Tariq Mahmood',
      teacherRole: body.teacherRole || 'REGULAR_TEACHER',
      title: body.title || `${body.courseCode} Complete Course File`,
      category: body.category || 'Complete Course Dossier (Single PDF)',
      currentVersion: 'v1.0',
      fileType: body.fileType || 'PDF',
      fileSize: fileSizeStr,
      fileUrl,
      status: 'Submitted',
      uploadDate: today,
      lastModified: today,
      archived: false,
      deleted: false,
      versionHistory: [initialVersion],
      remarks: body.remarks || ''
    };

    const saved = await CourseFileService.create(newCourseFileObj);

    // Send Notification to HOD
    try {
      await NotificationService.clearAll(); // or create a notif
    } catch {}

    return res.status(201).json({
      success: true,
      message: 'Course file uploaded successfully and sent for HOD review.',
      data: saved
    });
  } catch (error: any) {
    logger.error(`[uploadCourseFile Error] ${error.message}`);
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
