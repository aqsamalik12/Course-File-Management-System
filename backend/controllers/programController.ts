import { Request, Response } from 'express';
import { ProgramService } from '../services/supabaseService';

export const getPrograms = async (req: Request, res: Response) => {
  try {
    const { departmentId, degreeLevel, search } = req.query;
    let programs = await ProgramService.getAll();

    if (departmentId) programs = programs.filter((p: any) => p.departmentId === departmentId);
    if (degreeLevel) programs = programs.filter((p: any) => p.degreeLevel === degreeLevel);
    if (search) {
      const s = String(search).toLowerCase();
      programs = programs.filter(
        (p: any) =>
          (p.name && p.name.toLowerCase().includes(s)) ||
          (p.code && p.code.toLowerCase().includes(s)) ||
          (p.departmentName && p.departmentName.toLowerCase().includes(s))
      );
    }

    return res.json({ success: true, count: programs.length, data: programs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createProgram = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newId = data.id || `prog-${Date.now()}`;
    const newProg = { ...data, id: newId };
    const saved = await ProgramService.create(newProg);
    return res.status(201).json({ success: true, message: 'Academic program created successfully', data: saved });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await ProgramService.create({ ...req.body, id });
    return res.json({ success: true, message: 'Academic program updated successfully', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProgram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await ProgramService.delete(id);
    return res.json({ success: true, message: 'Academic program deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
