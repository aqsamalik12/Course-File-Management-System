import { Request, Response } from 'express';
import { TemplateService, AuditService } from '../services/supabaseService';

export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await TemplateService.getAllTemplates();
    return res.json({ success: true, count: templates.length, data: templates });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadTemplate = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { title, format, description, targetRole } = req.body;
    const newId = `tmpl-${Date.now()}`;
    const newTemplateObj = {
      id: newId,
      title: title || 'Official Course File Template',
      description: description || 'Standard official template for single complete course file.',
      format: format || 'PDF',
      fileName: file ? file.originalname : `${title || 'template'}.pdf`,
      fileUrl: file ? `/uploads/${file.filename}` : '#',
      uploadedBy: 'Administrator',
      targetRole: targetRole || 'ALL',
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    const saved = await TemplateService.createTemplate(newTemplateObj);

    await AuditService.log({
      eventType: 'UPLOAD_OFFICIAL_TEMPLATE',
      actor: 'Administrator',
      role: 'ADMIN',
      resource: `Template:${saved.title}`,
      status: 'SUCCESS',
      severity: 'INFO'
    });

    return res.status(201).json({
      success: true,
      message: 'Template uploaded successfully and notified to teachers.',
      data: saved
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await TemplateService.deleteTemplate(id);
    return res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInstructions = async (req: Request, res: Response) => {
  try {
    const instructions = await TemplateService.getAllInstructions();
    return res.json({ success: true, count: instructions.length, data: instructions });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadInstruction = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { title, content, category } = req.body;
    const newId = `inst-${Date.now()}`;

    const newInstructionObj = {
      id: newId,
      title: title || 'Course File Guidelines',
      content: content || 'Standard guidelines for single course file preparation.',
      fileName: file ? file.originalname : undefined,
      fileUrl: file ? `/uploads/${file.filename}` : undefined,
      category: category || 'General Instructions',
      updatedAtStr: new Date().toISOString().split('T')[0]
    };

    const saved = await TemplateService.createInstruction(newInstructionObj);
    return res.status(201).json({
      success: true,
      message: 'Submission guideline uploaded successfully.',
      data: saved
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInstructions = uploadInstruction;

