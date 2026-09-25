import { Request, Response } from 'express';
import { SettingService } from '../services/supabaseService';

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await SettingService.get();
    return res.json({ success: true, data: settings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updated = await SettingService.update(req.body);
    return res.json({ success: true, message: 'System settings updated successfully', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
