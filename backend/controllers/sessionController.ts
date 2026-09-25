import { Request, Response } from 'express';
import { SessionService } from '../services/supabaseService';

export const getSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await SessionService.getAllSessions();
    return res.json({ success: true, count: sessions.length, data: sessions });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const sessionData = req.body;
    const newId = sessionData.id || `session-${Date.now()}`;
    const newSession = { ...sessionData, id: newId, fileCount: 0 };
    const saved = await SessionService.createSession(newSession);
    return res.status(201).json({ success: true, message: 'Academic session created successfully', data: saved });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubmissionWindow = async (req: Request, res: Response) => {
  try {
    const window = await SessionService.getSubmissionWindow();
    return res.json({ success: true, data: window });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSubmissionWindow = async (req: Request, res: Response) => {
  try {
    const windowData = req.body;
    const updated = await SessionService.updateSubmissionWindow(windowData);
    return res.json({
      success: true,
      message: 'Submission window updated successfully',
      data: updated
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
