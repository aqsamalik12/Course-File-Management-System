import { Request, Response } from 'express';
import { FeedbackService } from '../services/supabaseService';

export const getFeedback = async (req: Request, res: Response) => {
  try {
    const list = await FeedbackService.getAll();
    return res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const itemObj = {
      ...data,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Open'
    };

    const saved = await FeedbackService.create(itemObj);
    return res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: saved });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const respondToFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    const updated = await FeedbackService.respond(id, response);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
    return res.json({ success: true, message: 'Feedback response saved', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
