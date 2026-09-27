import { Request, Response } from 'express';
import { CampusService, AuditService } from '../services/supabaseService';
import { logger } from '../config/logger';

export const getCampuses = async (req: Request, res: Response) => {
  try {
    const campuses = await CampusService.getAll();
    return res.json({ success: true, count: campuses.length, data: campuses });
  } catch (error: any) {
    logger.error(`[getCampuses Error] ${error.message}`);
    return res.status(500).json({ success: false, message: 'Unable to load campuses. Please try again.' });
  }
};

export const getCampusById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campus = await CampusService.getById(id);
    if (!campus) {
      return res.status(404).json({ success: false, message: 'Campus not found' });
    }
    return res.json({ success: true, data: campus });
  } catch (error: any) {
    logger.error(`[getCampusById Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCampus = async (req: Request, res: Response) => {
  try {
    const { name, code, city, address, directorName, status } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Campus Name is required.' });
    }

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Campus Code is required.' });
    }

    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();

    // Validate uniqueness - duplicate prevention
    const existing = await CampusService.findByNameOrCode(trimmedName, trimmedCode);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This campus already exists.'
      });
    }

    const newId = req.body.id || `camp-${Date.now()}`;
    const newCampus = {
      id: newId,
      name: trimmedName,
      code: trimmedCode,
      city: city && typeof city === 'string' && city.trim() ? city.trim() : 'Punjab',
      address: address && typeof address === 'string' && address.trim() ? address.trim() : '',
      directorName: directorName && typeof directorName === 'string' && directorName.trim() ? directorName.trim() : '',
      status: status === 'Inactive' ? 'Inactive' : 'Active'
    };

    const saved = await CampusService.create(newCampus);

    await AuditService.log({
      eventType: 'CAMPUS_CREATED',
      actor: (req.headers['x-user-name'] as string) || (req as any).user?.name || 'Administrator',
      role: 'ADMIN',
      resource: `Campus:${saved.name} (${saved.code})`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.status(201).json({
      success: true,
      message: 'Campus added successfully.',
      data: saved
    });
  } catch (error: any) {
    logger.error(`[createCampus Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCampus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existingCampus = await CampusService.getById(id);
    if (!existingCampus) {
      return res.status(404).json({ success: false, message: 'Campus not found' });
    }

    const { name, code, status, city, address, directorName } = req.body;

    // Check duplicate uniqueness if updating name or code
    if (name || code) {
      const checkName = name && typeof name === 'string' ? name.trim() : existingCampus.name;
      const checkCode = code && typeof code === 'string' ? code.trim().toUpperCase() : existingCampus.code;
      const duplicate = await CampusService.findByNameOrCode(checkName, checkCode, id);
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'This campus already exists.'
        });
      }
    }

    const updates: any = {};
    if (name !== undefined && typeof name === 'string') updates.name = name.trim();
    if (code !== undefined && typeof code === 'string') updates.code = code.trim().toUpperCase();
    if (status !== undefined) updates.status = status === 'Inactive' ? 'Inactive' : 'Active';
    if (city !== undefined && typeof city === 'string') updates.city = city.trim();
    if (address !== undefined && typeof address === 'string') updates.address = address.trim();
    if (directorName !== undefined && typeof directorName === 'string') updates.directorName = directorName.trim();

    const updated = await CampusService.update(id, updates);

    await AuditService.log({
      eventType: 'CAMPUS_UPDATED',
      actor: (req.headers['x-user-name'] as string) || (req as any).user?.name || 'Administrator',
      role: 'ADMIN',
      resource: `Campus:${updated.name}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.json({
      success: true,
      message: 'Campus updated successfully.',
      data: updated
    });
  } catch (error: any) {
    logger.error(`[updateCampus Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCampus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campus = await CampusService.getById(id);
    if (!campus) {
      return res.status(404).json({ success: false, message: 'Campus not found' });
    }

    await CampusService.delete(id);

    await AuditService.log({
      eventType: 'CAMPUS_DELETED',
      actor: (req.headers['x-user-name'] as string) || (req as any).user?.name || 'Administrator',
      role: 'ADMIN',
      resource: `CampusId:${id} (${campus.name})`,
      status: 'SUCCESS',
      severity: 'WARNING'
    });

    return res.json({ success: true, message: 'Campus deleted successfully.' });
  } catch (error: any) {
    logger.error(`[deleteCampus Error] ${error.message}`);
    return res.status(500).json({ success: false, message: error.message });
  }
};
