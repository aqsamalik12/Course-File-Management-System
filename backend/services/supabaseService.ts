import { supabase } from '../config/supabase';
import { memoryStore } from '../utils/memoryStore';
import { logger } from '../config/logger';

// Helper to determine if an error is due to missing table
const isTableMissing = (error: any): boolean => {
  return error && (error.code === 'PGRST205' || (error.message && error.message.includes('schema cache')));
};

// ==========================================
// USERS SERVICE
// ==========================================
export const UserService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('users').select('*').order('name');
      if (error) {
        if (!isTableMissing(error)) logger.warn(`[Supabase Users] ${error.message}`);
        return memoryStore.users;
      }
      return data && data.length > 0 ? data : memoryStore.users;
    } catch {
      return memoryStore.users;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
      if (error || !data) return memoryStore.users.find((u) => u.id === id);
      return data;
    } catch {
      return memoryStore.users.find((u) => u.id === id);
    }
  },

  async getByEmail(email: string) {
    try {
      const { data, error } = await supabase.from('users').select('*').ilike('email', email.trim()).maybeSingle();
      if (error || !data) {
        return memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      }
      return data;
    } catch {
      return memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }
  },

  async create(user: any) {
    try {
      const { data, error } = await supabase.from('users').insert([user]).select().single();
      if (error) {
        if (!isTableMissing(error)) logger.warn(`[Supabase Users Create] ${error.message}`);
        memoryStore.users.unshift(user);
        return user;
      }
      // Also sync memory store
      const idx = memoryStore.users.findIndex((u) => u.id === user.id);
      if (idx === -1) memoryStore.users.unshift(data);
      return data;
    } catch {
      memoryStore.users.unshift(user);
      return user;
    }
  },

  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().maybeSingle();
      if (error) {
        if (!isTableMissing(error)) logger.warn(`[Supabase Users Update] ${error.message}`);
      }
      const idx = memoryStore.users.findIndex((u) => u.id === id);
      if (idx !== -1) {
        memoryStore.users[idx] = { ...memoryStore.users[idx], ...updates, ...(data || {}) };
        return memoryStore.users[idx];
      }
      return data;
    } catch {
      const idx = memoryStore.users.findIndex((u) => u.id === id);
      if (idx !== -1) {
        memoryStore.users[idx] = { ...memoryStore.users[idx], ...updates };
        return memoryStore.users[idx];
      }
      return null;
    }
  },

  async softDelete(id: string) {
    return this.update(id, { status: 'Inactive', deleted: true });
  }
};

// ==========================================
// DEPARTMENTS SERVICE
// ==========================================
export const DepartmentService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('departments').select('*').order('name');
      if (error || !data || data.length === 0) return memoryStore.departments;
      return data;
    } catch {
      return memoryStore.departments;
    }
  },

  async create(dept: any) {
    try {
      const { data, error } = await supabase.from('departments').insert([dept]).select().single();
      if (error) {
        memoryStore.departments.push(dept);
        return dept;
      }
      memoryStore.departments.push(data);
      return data;
    } catch {
      memoryStore.departments.push(dept);
      return dept;
    }
  },

  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase.from('departments').update(updates).eq('id', id).select().maybeSingle();
      const idx = memoryStore.departments.findIndex((d) => d.id === id);
      if (idx !== -1) {
        memoryStore.departments[idx] = { ...memoryStore.departments[idx], ...updates, ...(data || {}) };
        return memoryStore.departments[idx];
      }
      return data;
    } catch {
      const idx = memoryStore.departments.findIndex((d) => d.id === id);
      if (idx !== -1) {
        memoryStore.departments[idx] = { ...memoryStore.departments[idx], ...updates };
        return memoryStore.departments[idx];
      }
      return null;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('departments').select('*').eq('id', id).maybeSingle();
      if (error || !data) return memoryStore.departments.find((d) => d.id === id);
      return data;
    } catch {
      return memoryStore.departments.find((d) => d.id === id);
    }
  },

  async assignHOD(deptId: string, hodId: string, hodName: string) {
    return this.update(deptId, { hodId, hodName });
  },

  async delete(id: string) {
    try {
      await supabase.from('departments').delete().eq('id', id);
    } catch {}
    memoryStore.departments = memoryStore.departments.filter((d) => d.id !== id);
    return true;
  }
};

// ==========================================
// COURSES SERVICE
// ==========================================
export const CourseService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('courses').select('*').order('code');
      if (error || !data || data.length === 0) return memoryStore.courses;
      return data;
    } catch {
      return memoryStore.courses;
    }
  },

  async create(course: any) {
    try {
      const { data, error } = await supabase.from('courses').insert([course]).select().single();
      if (error) {
        memoryStore.courses.push(course);
        return course;
      }
      memoryStore.courses.push(data);
      return data;
    } catch {
      memoryStore.courses.push(course);
      return course;
    }
  },

  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().maybeSingle();
      const idx = memoryStore.courses.findIndex((c) => c.id === id);
      if (idx !== -1) {
        memoryStore.courses[idx] = { ...memoryStore.courses[idx], ...updates, ...(data || {}) };
        return memoryStore.courses[idx];
      }
      return data;
    } catch {
      const idx = memoryStore.courses.findIndex((c) => c.id === id);
      if (idx !== -1) {
        memoryStore.courses[idx] = { ...memoryStore.courses[idx], ...updates };
        return memoryStore.courses[idx];
      }
      return null;
    }
  },

  async delete(id: string) {
    try {
      await supabase.from('courses').delete().eq('id', id);
    } catch {}
    memoryStore.courses = memoryStore.courses.filter((c) => c.id !== id);
    return true;
  }
};

// ==========================================
// COURSE FILES SERVICE
// ==========================================
export const CourseFileService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('course_files').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return memoryStore.courseFiles;
      return data;
    } catch {
      return memoryStore.courseFiles;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('course_files').select('*').eq('id', id).maybeSingle();
      if (error || !data) return memoryStore.courseFiles.find((f) => f.id === id);
      return data;
    } catch {
      return memoryStore.courseFiles.find((f) => f.id === id);
    }
  },

  async create(file: any) {
    try {
      const { data, error } = await supabase.from('course_files').insert([file]).select().single();
      if (error) {
        memoryStore.courseFiles.unshift(file);
        return file;
      }
      memoryStore.courseFiles.unshift(data);
      return data;
    } catch {
      memoryStore.courseFiles.unshift(file);
      return file;
    }
  },

  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase.from('course_files').update(updates).eq('id', id).select().maybeSingle();
      const idx = memoryStore.courseFiles.findIndex((f) => f.id === id);
      if (idx !== -1) {
        memoryStore.courseFiles[idx] = { ...memoryStore.courseFiles[idx], ...updates, ...(data || {}) };
        return memoryStore.courseFiles[idx];
      }
      return data;
    } catch {
      const idx = memoryStore.courseFiles.findIndex((f) => f.id === id);
      if (idx !== -1) {
        memoryStore.courseFiles[idx] = { ...memoryStore.courseFiles[idx], ...updates };
        return memoryStore.courseFiles[idx];
      }
      return null;
    }
  },

  async delete(id: string, permanent: boolean = false) {
    if (permanent) {
      try {
        await supabase.from('course_files').delete().eq('id', id);
      } catch {}
      memoryStore.courseFiles = memoryStore.courseFiles.filter((f) => f.id !== id);
      return true;
    }
    return this.update(id, { deleted: true, deletedAt: new Date().toISOString() });
  }
};

// ==========================================
// DEADLINES SERVICE
// ==========================================
export const DeadlineService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('deadlines').select('*').order('dueDate');
      if (error || !data || data.length === 0) return memoryStore.deadlines;
      return data;
    } catch {
      return memoryStore.deadlines;
    }
  },

  async create(deadline: any) {
    try {
      const { data, error } = await supabase.from('deadlines').insert([deadline]).select().single();
      if (error) {
        memoryStore.deadlines.push(deadline);
        return deadline;
      }
      memoryStore.deadlines.push(data);
      return data;
    } catch {
      memoryStore.deadlines.push(deadline);
      return deadline;
    }
  },

  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase.from('deadlines').update(updates).eq('id', id).select().maybeSingle();
      const idx = memoryStore.deadlines.findIndex((d) => d.id === id);
      if (idx !== -1) {
        memoryStore.deadlines[idx] = { ...memoryStore.deadlines[idx], ...updates, ...(data || {}) };
        return memoryStore.deadlines[idx];
      }
      return data;
    } catch {
      const idx = memoryStore.deadlines.findIndex((d) => d.id === id);
      if (idx !== -1) {
        memoryStore.deadlines[idx] = { ...memoryStore.deadlines[idx], ...updates };
        return memoryStore.deadlines[idx];
      }
      return null;
    }
  },

  async delete(id: string) {
    try {
      await supabase.from('deadlines').delete().eq('id', id);
    } catch {}
    memoryStore.deadlines = memoryStore.deadlines.filter((d) => d.id !== id);
    return true;
  }
};

// ==========================================
// ANNOUNCEMENTS SERVICE
// ==========================================
export const AnnouncementService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return memoryStore.announcements;
      return data;
    } catch {
      return memoryStore.announcements;
    }
  },

  async create(ann: any) {
    try {
      const { data, error } = await supabase.from('announcements').insert([ann]).select().single();
      if (error) {
        memoryStore.announcements.unshift(ann);
        return ann;
      }
      memoryStore.announcements.unshift(data);
      return data;
    } catch {
      memoryStore.announcements.unshift(ann);
      return ann;
    }
  },

  async delete(id: string) {
    try {
      await supabase.from('announcements').delete().eq('id', id);
    } catch {}
    memoryStore.announcements = memoryStore.announcements.filter((a) => a.id !== id);
    return true;
  }
};

// ==========================================
// SESSIONS & SUBMISSION WINDOWS
// ==========================================
export const SessionService = {
  async getAllSessions() {
    try {
      const { data, error } = await supabase.from('academic_sessions').select('*').order('startDate', { ascending: false });
      if (error || !data || data.length === 0) return memoryStore.sessions;
      return data;
    } catch {
      return memoryStore.sessions;
    }
  },

  async createSession(session: any) {
    try {
      const { data, error } = await supabase.from('academic_sessions').insert([session]).select().single();
      if (error) {
        memoryStore.sessions.push(session);
        return session;
      }
      memoryStore.sessions.push(data);
      return data;
    } catch {
      memoryStore.sessions.push(session);
      return session;
    }
  },

  async getSubmissionWindow() {
    try {
      const { data, error } = await supabase.from('submission_windows').select('*').maybeSingle();
      if (error || !data) return memoryStore.submissionWindow;
      return data;
    } catch {
      return memoryStore.submissionWindow;
    }
  },

  async updateSubmissionWindow(updates: any) {
    try {
      const { data, error } = await supabase
        .from('submission_windows')
        .upsert({ id: 'sub-win-curr', ...updates })
        .select()
        .single();
      memoryStore.submissionWindow = { ...memoryStore.submissionWindow, ...updates, ...(data || {}) };
      return memoryStore.submissionWindow;
    } catch {
      memoryStore.submissionWindow = { ...memoryStore.submissionWindow, ...updates };
      return memoryStore.submissionWindow;
    }
  }
};

// ==========================================
// TEMPLATES & INSTRUCTIONS SERVICE
// ==========================================
export const TemplateService = {
  async getAllTemplates() {
    try {
      const { data, error } = await supabase.from('templates').select('*');
      if (error || !data || data.length === 0) return memoryStore.templates;
      return data;
    } catch {
      return memoryStore.templates;
    }
  },

  async createTemplate(template: any) {
    try {
      const { data, error } = await supabase.from('templates').insert([template]).select().single();
      if (error) {
        memoryStore.templates.push(template);
        return template;
      }
      memoryStore.templates.push(data);
      return data;
    } catch {
      memoryStore.templates.push(template);
      return template;
    }
  },

  async deleteTemplate(id: string) {
    try {
      await supabase.from('templates').delete().eq('id', id);
    } catch {}
    memoryStore.templates = memoryStore.templates.filter((t) => t.id !== id);
    return true;
  },

  async getAllInstructions() {
    try {
      const { data, error } = await supabase.from('submission_instructions').select('*');
      if (error || !data || data.length === 0) return memoryStore.instructions;
      return data;
    } catch {
      return memoryStore.instructions;
    }
  },

  async createInstruction(instruction: any) {
    try {
      const { data, error } = await supabase.from('submission_instructions').insert([instruction]).select().single();
      if (error) {
        memoryStore.instructions.push(instruction);
        return instruction;
      }
      memoryStore.instructions.push(data);
      return data;
    } catch {
      memoryStore.instructions.push(instruction);
      return instruction;
    }
  }
};

// ==========================================
// AUDIT LOGS SERVICE
// ==========================================
export const AuditService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return memoryStore.auditLogs;
      return data;
    } catch {
      return memoryStore.auditLogs;
    }
  },

  async log(logItem: any) {
    try {
      const record = {
        id: logItem.id || `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: logItem.eventType || 'SYSTEM_EVENT',
        actor: logItem.actor || 'System',
        role: logItem.role || 'ADMIN',
        resource: logItem.resource || 'System',
        status: logItem.status || 'SUCCESS',
        severity: logItem.severity || 'INFO',
        signature: logItem.signature || `sha256-${Math.random().toString(36).substring(2, 10)}`
      };
      await supabase.from('audit_logs').insert([record]);
      memoryStore.auditLogs.unshift(record);
      return record;
    } catch {
      const record = { ...logItem, timestamp: new Date().toISOString() };
      memoryStore.auditLogs.unshift(record);
      return record;
    }
  }
};

// ==========================================
// NOTIFICATIONS SERVICE
// ==========================================
export const NotificationService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return memoryStore.notifications || [];
      return data;
    } catch {
      return (memoryStore as any).notifications || [];
    }
  },

  async markAsRead(id: string) {
    try {
      await supabase.from('notifications').update({ isRead: true }).eq('id', id);
    } catch {}
    const notifs = (memoryStore as any).notifications || [];
    const target = notifs.find((n: any) => n.id === id);
    if (target) target.isRead = true;
    return true;
  },

  async clearAll() {
    try {
      await supabase.from('notifications').delete().neq('id', '');
    } catch {}
    (memoryStore as any).notifications = [];
    return true;
  },

  async create(notification: any) {
    const notifItem = {
      id: notification.id || `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      timestamp: 'Just now',
      isRead: false,
      targetRole: notification.targetRole || 'ALL',
      linkModule: notification.linkModule || '',
      created_at: new Date().toISOString()
    };
    try {
      const { data, error } = await supabase.from('notifications').insert([notifItem]).select().single();
      if (error) {
        if (!memoryStore.notifications) memoryStore.notifications = [];
        memoryStore.notifications.unshift(notifItem);
        return notifItem;
      }
      if (!memoryStore.notifications) memoryStore.notifications = [];
      memoryStore.notifications.unshift(data);
      return data;
    } catch {
      if (!memoryStore.notifications) memoryStore.notifications = [];
      memoryStore.notifications.unshift(notifItem);
      return notifItem;
    }
  }
};

// ==========================================
// FEEDBACK SERVICE
// ==========================================
export const FeedbackService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return memoryStore.feedback;
      return data;
    } catch {
      return memoryStore.feedback;
    }
  },

  async create(feedback: any) {
    try {
      const { data, error } = await supabase.from('feedback').insert([feedback]).select().single();
      if (error) {
        memoryStore.feedback.unshift(feedback);
        return feedback;
      }
      memoryStore.feedback.unshift(data);
      return data;
    } catch {
      memoryStore.feedback.unshift(feedback);
      return feedback;
    }
  },

  async respond(id: string, responseText: string) {
    try {
      await supabase.from('feedback').update({ response: responseText, status: 'Resolved' }).eq('id', id);
    } catch {}
    const item = memoryStore.feedback.find((f) => f.id === id);
    if (item) {
      item.response = responseText;
      item.status = 'Resolved';
    }
    return item;
  }
};

// ==========================================
// SYSTEM SETTINGS SERVICE
// ==========================================
export const SettingService = {
  async get() {
    try {
      const { data, error } = await supabase.from('system_settings').select('*').maybeSingle();
      if (error || !data) return memoryStore.settings;
      return data;
    } catch {
      return memoryStore.settings;
    }
  },

  async update(settings: any) {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .upsert({ id: 'current-system-settings', ...settings })
        .select()
        .single();
      memoryStore.settings = { ...memoryStore.settings, ...settings, ...(data || {}) };
      return memoryStore.settings;
    } catch {
      memoryStore.settings = { ...memoryStore.settings, ...settings };
      return memoryStore.settings;
    }
  }
};

// ==========================================
// PROGRAMS SERVICE
// ==========================================
export const ProgramService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('programs').select('*').order('name');
      if (error || !data || data.length === 0) return memoryStore.programs;
      return data;
    } catch {
      return memoryStore.programs;
    }
  },

  async create(prog: any) {
    try {
      const { data, error } = await supabase.from('programs').insert([prog]).select().single();
      if (error) {
        memoryStore.programs.push(prog);
        return prog;
      }
      memoryStore.programs.push(data);
      return data;
    } catch {
      memoryStore.programs.push(prog);
      return prog;
    }
  },

  async delete(id: string) {
    try {
      await supabase.from('programs').delete().eq('id', id);
    } catch {}
    memoryStore.programs = memoryStore.programs.filter((p) => p.id !== id);
    return true;
  }
};

// ==========================================
// ARCHIVES SERVICE
// ==========================================
export const ArchiveService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('archives').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return memoryStore.archives;
      return data;
    } catch {
      return memoryStore.archives;
    }
  },

  async create(archive: any) {
    try {
      const { data, error } = await supabase.from('archives').insert([archive]).select().single();
      if (error) {
        memoryStore.archives.unshift(archive);
        return archive;
      }
      memoryStore.archives.unshift(data);
      return data;
    } catch {
      memoryStore.archives.unshift(archive);
      return archive;
    }
  },

  async delete(id: string) {
    try {
      await supabase.from('archives').delete().eq('id', id);
    } catch {}
    memoryStore.archives = memoryStore.archives.filter((a) => a.id !== id);
    return true;
  }
};

// ==========================================
// TEACHER REQUESTS SERVICE
// ==========================================
export const TeacherRequestService = {
  async getAll(filters?: { departmentId?: string; hodId?: string; status?: string; teacherId?: string }) {
    try {
      let query = supabase.from('teacher_requests').select('*').order('created_at', { ascending: false });
      if (filters?.departmentId) query = query.eq('departmentId', filters.departmentId);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.teacherId) query = query.eq('teacherId', filters.teacherId);

      const { data, error } = await query;
      if (error || !data) {
        let list = [...memoryStore.teacherRequests];
        if (filters?.departmentId) list = list.filter((r) => r.departmentId === filters.departmentId);
        if (filters?.status) list = list.filter((r) => r.status === filters.status);
        if (filters?.teacherId) list = list.filter((r) => r.teacherId === filters.teacherId);
        return list;
      }
      return data;
    } catch {
      let list = [...memoryStore.teacherRequests];
      if (filters?.departmentId) list = list.filter((r) => r.departmentId === filters.departmentId);
      if (filters?.status) list = list.filter((r) => r.status === filters.status);
      if (filters?.teacherId) list = list.filter((r) => r.teacherId === filters.teacherId);
      return list;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('teacher_requests').select('*').eq('id', id).maybeSingle();
      if (error || !data) return memoryStore.teacherRequests.find((r) => r.id === id);
      return data;
    } catch {
      return memoryStore.teacherRequests.find((r) => r.id === id);
    }
  },

  async getByTeacherId(teacherId: string) {
    try {
      const { data, error } = await supabase.from('teacher_requests').select('*').eq('teacherId', teacherId).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (error || !data) return memoryStore.teacherRequests.find((r) => r.teacherId === teacherId);
      return data;
    } catch {
      return memoryStore.teacherRequests.find((r) => r.teacherId === teacherId);
    }
  },

  async create(req: any) {
    try {
      const { data, error } = await supabase.from('teacher_requests').insert([req]).select().single();
      if (error) {
        if (!isTableMissing(error)) logger.warn(`[Supabase TeacherRequests Create] ${error.message}`);
        memoryStore.teacherRequests.unshift(req);
        return req;
      }
      memoryStore.teacherRequests.unshift(data);
      return data;
    } catch {
      memoryStore.teacherRequests.unshift(req);
      return req;
    }
  },

  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase.from('teacher_requests').update(updates).eq('id', id).select().maybeSingle();
      const idx = memoryStore.teacherRequests.findIndex((r) => r.id === id);
      if (idx !== -1) {
        memoryStore.teacherRequests[idx] = { ...memoryStore.teacherRequests[idx], ...updates, ...(data || {}) };
        return memoryStore.teacherRequests[idx];
      }
      return data;
    } catch {
      const idx = memoryStore.teacherRequests.findIndex((r) => r.id === id);
      if (idx !== -1) {
        memoryStore.teacherRequests[idx] = { ...memoryStore.teacherRequests[idx], ...updates };
        return memoryStore.teacherRequests[idx];
      }
      return null;
    }
  },

  async delete(id: string) {
    try {
      await supabase.from('teacher_requests').delete().eq('id', id);
    } catch {}
    memoryStore.teacherRequests = memoryStore.teacherRequests.filter((r) => r.id !== id);
    return true;
  }
};
