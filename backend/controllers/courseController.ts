import { Request, Response } from 'express';
import { CourseService, HODAssignmentService, UserService } from '../services/supabaseService';

export const getCourses = async (req: Request, res: Response) => {
  try {
    let courses = await CourseService.getAll();
    const { departmentId, search } = req.query;

    const headerUserId = req.headers['x-user-id'] as string;
    const headerRole = req.headers['x-user-role'] as string;
    const user = (req as any).user;
    const callerId = user?.id || headerUserId;
    const callerRole = user?.role || headerRole;

    if (callerRole === 'HOD' && callerId) {
      const assignment = await HODAssignmentService.getActiveByHodId(callerId);
      const hodUser = await UserService.getById(callerId);
      const deptId = assignment?.departmentId || hodUser?.departmentId;
      if (deptId) {
        courses = courses.filter((c: any) => c.departmentId === deptId);
      }
    } else if (departmentId) {
      courses = courses.filter((c: any) => c.departmentId === departmentId);
    }

    if (search) {
      const s = String(search).toLowerCase();
      courses = courses.filter(
        (c: any) =>
          (c.code && c.code.toLowerCase().includes(s)) ||
          (c.title && c.title.toLowerCase().includes(s)) ||
          (c.departmentName && c.departmentName.toLowerCase().includes(s))
      );
    }

    return res.json({ success: true, count: courses.length, data: courses });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req: Request, res: Response) => {
  try {
    const courseData = req.body;
    const newId = courseData.id || `course-${Date.now()}`;
    const newCourse = { ...courseData, id: newId, status: courseData.status || 'Active' };
    const saved = await CourseService.create(newCourse);
    return res.status(201).json({ success: true, message: 'Course created successfully', data: saved });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await CourseService.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    return res.json({ success: true, message: 'Course updated successfully', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CourseService.delete(id);
    return res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
