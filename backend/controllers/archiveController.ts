import { Request, Response } from 'express';
import { ArchiveService, CourseFileService } from '../services/supabaseService';

export const getArchives = async (req: Request, res: Response) => {
  try {
    const { departmentId, academicSession, search } = req.query;
    let archives = await ArchiveService.getAll();

    if (departmentId) archives = archives.filter((a: any) => a.departmentId === departmentId);
    if (academicSession) archives = archives.filter((a: any) => a.academicSession === academicSession);
    if (search) {
      const s = String(search).toLowerCase();
      archives = archives.filter(
        (a: any) =>
          (a.title && a.title.toLowerCase().includes(s)) ||
          (a.courseCode && a.courseCode.toLowerCase().includes(s)) ||
          (a.teacherName && a.teacherName.toLowerCase().includes(s)) ||
          (a.departmentName && a.departmentName.toLowerCase().includes(s))
      );
    }

    return res.json({ success: true, count: archives.length, data: archives });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreArchive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const archives = await ArchiveService.getAll();
    const item = archives.find((a: any) => a.id === id);

    if (item && item.courseFileId) {
      await CourseFileService.update(item.courseFileId, { archived: false, deleted: false });
    }
    await ArchiveService.delete(id);

    return res.json({ success: true, message: 'File restored from archive successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const permanentlyDeleteArchive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await ArchiveService.delete(id);
    return res.json({ success: true, message: 'Archive entry permanently deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteArchive = permanentlyDeleteArchive;

