import { Request, Response } from 'express';
import { NotificationService } from '../services/supabaseService';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    let notifications = await NotificationService.getAll();

    if (role) {
      notifications = notifications.filter((n: any) => n.targetRole === 'ALL' || n.targetRole === role);
    }

    return res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error: any) {
    return res.json({ success: true, count: 0, data: [] });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await NotificationService.markAsRead(id);
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const clearAll = async (req: Request, res: Response) => {
  try {
    await NotificationService.clearAll();
    return res.json({ success: true, message: 'All notifications cleared' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
