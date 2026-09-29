import { Request, Response } from 'express';
import { SectionService, DepartmentService, AuditService } from '../services/supabaseService';
import { logger } from '../config/logger';

export const getSections = async (req: Request, res: Response) => {
  try {
    const { departmentId, status, campusId } = req.query;
    const filter: any = {};
    if (departmentId) filter.departmentId = String(departmentId);
    if (status) filter.status = String(status);
    if (campusId) filter.campusId = String(campusId);

    const sections = await SectionService.getAll(filter);
    return res.json({ success: true, count: sections.length, data: sections });
  } catch (error: any) {
    logger.error(`[getSections Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSectionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const section = await SectionService.getById(id);
    if (!section) {
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }
    return res.json({ success: true, data: section });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createSection = async (req: Request, res: Response) => {
  try {
    const { name, departmentId, campusId, campusName } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Section name is required (e.g. BSCS-5A).' });
    }

    if (!departmentId) {
      return res.status(400).json({ success: false, message: 'Department ID is required.' });
    }

    const dept = await DepartmentService.getById(departmentId);
    if (!dept) {
      return res.status(400).json({ success: false, message: 'Invalid Department: Department not found.' });
    }

    // Check duplicate section in same department
    const existing = await SectionService.getAll({ departmentId });
    const duplicate = existing.find(
      (s: any) => s.name.trim().toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `Section "${name.trim()}" already exists in ${dept.name}.`
      });
    }

    const sectionId = req.body.id || `sec-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const nowIso = new Date().toISOString();

    const newSection = {
      id: sectionId,
      name: name.trim().toUpperCase(),
      departmentId,
      departmentName: dept.name,
      campusId: campusId || dept.campusId || 'camp-attock',
      campusName: campusName || dept.campusName || 'Attock Campus',
      status: req.body.status || 'Active',
      created_at: nowIso,
      updated_at: nowIso
    };

    const saved = await SectionService.create(newSection);

    await AuditService.log({
      eventType: 'SECTION_CREATED',
      actor: (req as any).user?.name || 'Administrator',
      role: (req as any).user?.role || 'ADMIN',
      resource: `Section:${newSection.name}, Department:${dept.name}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.status(201).json({
      success: true,
      message: `Section ${newSection.name} created successfully.`,
      data: saved
    });
  } catch (error: any) {
    logger.error(`[createSection Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await SectionService.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }

    const updates = { ...req.body, updated_at: new Date().toISOString() };
    if (updates.name) updates.name = updates.name.trim().toUpperCase();

    const updated = await SectionService.update(id, updates);
    return res.json({ success: true, message: 'Section updated successfully.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await SectionService.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }

    await SectionService.delete(id);
    return res.json({ success: true, message: 'Section deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
