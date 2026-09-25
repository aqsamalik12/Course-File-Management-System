import { Request, Response } from 'express';
import { DeadlineService } from '../services/supabaseService';

export const getDeadlines = async (req: Request, res: Response) => {
  try {
    const { departmentId, courseCode, status, targetRole } = req.query;
    let deadlines = await DeadlineService.getAll();

    if (departmentId) deadlines = deadlines.filter((d: any) => d.departmentId === departmentId);
    if (courseCode) deadlines = deadlines.filter((d: any) => d.courseCode === courseCode);
    if (status) deadlines = deadlines.filter((d: any) => d.status === status);
    if (targetRole) {
      deadlines = deadlines.filter((d: any) => d.targetRole === 'ALL' || d.targetRole === targetRole);
    }

    return res.json({ success: true, count: deadlines.length, data: deadlines });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDeadline = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newId = data.id || `dl-${Date.now()}`;
    const newDl = { ...data, id: newId };
    const saved = await DeadlineService.create(newDl);
    return res.status(201).json({ success: true, message: 'Deadline created successfully', data: saved });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDeadline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await DeadlineService.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Deadline not found' });
    }
    return res.json({ success: true, message: 'Deadline updated successfully', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDeadline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await DeadlineService.delete(id);
    return res.json({ success: true, message: 'Deadline deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
