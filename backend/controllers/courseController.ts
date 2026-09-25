import { Request, Response } from 'express';
import { CourseService } from '../services/supabaseService';

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await CourseService.getAll();
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
