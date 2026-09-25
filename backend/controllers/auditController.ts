import { Request, Response } from 'express';
import { AuditService } from '../services/supabaseService';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await AuditService.getAll();
    return res.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addActivityLog = async (req: Request, res: Response) => {
  try {
    const { userName, userRole, action, module, details } = req.body;
    const logObj = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: action || 'USER_ACTION',
      actor: userName || 'User',
      role: userRole || 'REGULAR_TEACHER',
      resource: `${module || 'System'}:${details || ''}`,
      status: 'SUCCESS',
      severity: 'INFO',
      signature: `sha256-${Math.random().toString(36).substring(2, 10)}`
    };

    const saved = await AuditService.log(logObj);
    return res.status(201).json({ success: true, data: saved });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
