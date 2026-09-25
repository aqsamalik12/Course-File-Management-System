import { Request, Response } from 'express';
import { AnnouncementService } from '../services/supabaseService';

export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const { targetRole, priority, search } = req.query;
    let announcements = await AnnouncementService.getAll();

    if (priority) announcements = announcements.filter((a: any) => a.priority === priority);
    if (targetRole) {
      announcements = announcements.filter((a: any) => a.targetRole === 'ALL' || a.targetRole === targetRole);
    }
    if (search) {
      const s = String(search).toLowerCase();
      announcements = announcements.filter(
        (a: any) =>
          (a.title && a.title.toLowerCase().includes(s)) ||
          (a.content && a.content.toLowerCase().includes(s)) ||
          (a.authorName && a.authorName.toLowerCase().includes(s))
      );
    }

    return res.json({ success: true, count: announcements.length, data: announcements });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newId = data.id || `anc-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    const ancObj = {
      ...data,
      id: newId,
      createdDate: today,
      priority: data.priority || 'Medium',
      isPinned: !!data.isPinned
    };

    const saved = await AnnouncementService.create(ancObj);
    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: saved
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await AnnouncementService.create({ ...req.body, id });
    return res.json({ success: true, message: 'Announcement updated successfully', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AnnouncementService.delete(id);
    return res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
