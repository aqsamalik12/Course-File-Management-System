import fs from 'fs';
import path from 'path';
import { supabase } from '../config/supabase';
import { memoryStore } from '../utils/memoryStore';
import { logger } from '../config/logger';

// Helper to determine if an error is due to missing table
const isTableMissing = (error: any): boolean => {
  return error && (error.code === 'PGRST205' || (error.message && error.message.includes('schema cache')));
};

const USERS_FILE = fs.existsSync(path.join(process.cwd(), 'backend', 'data'))
  ? path.join(process.cwd(), 'backend', 'data', 'users.json')
  : path.join(process.cwd(), 'data', 'users.json');

function persistLocalUsers(list: any[]) {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    logger.warn('[UserService] Could not write users.json', err);
  }
}

function loadLocalUsers(): any[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return memoryStore.users;
}

// Populate initial memoryStore users from users.json if present
memoryStore.users = loadLocalUsers();

// ==========================================
// USERS SERVICE
// ==========================================
export const UserService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('users').select('*').order('name');
      if (error || !data || data.length === 0) {
        return memoryStore.users;
      }
      return data.map((dbUser: any) => {
        const mem = memoryStore.users.find((u) => u.id === dbUser.id || (u.email && dbUser.email && u.email.toLowerCase() === dbUser.email.toLowerCase()));
        return mem ? { ...dbUser, ...mem } : dbUser;
      });
    } catch {
      return memoryStore.users;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
      const memUser = memoryStore.users.find((u) => u.id === id);
      if (error || !data) return memUser;
      return memUser ? { ...data, ...memUser } : data;
    } catch {
      return memoryStore.users.find((u) => u.id === id);
    }
  },

  async getByEmail(email: string) {
    const targetEmail = (email || '').trim().toLowerCase();
    if (!targetEmail) return null;
    try {
      const { data, error } = await supabase.from('users').select('*').ilike('email', targetEmail).maybeSingle();
      const memUser = memoryStore.users.find((u) => u.email && u.email.toLowerCase() === targetEmail);
      if (error || !data) {
        return memUser;
      }
      return memUser ? { ...data, ...memUser } : data;
    } catch {
      return memoryStore.users.find((u) => u.email && u.email.toLowerCase() === targetEmail);
    }
  },

  async create(user: any) {
    try {
      const { data, error } = await supabase.from('users').insert([user]).select().single();
      if (error) {
        if (!isTableMissing(error)) logger.warn(`[Supabase Users Create] ${error.message}`);
        const idx = memoryStore.users.findIndex((u) => u.id === user.id);
        if (idx === -1) memoryStore.users.unshift(user);
        else memoryStore.users[idx] = { ...memoryStore.users[idx], ...user };
        persistLocalUsers(memoryStore.users);
        return user;
      }
      // Also sync memory store
      const idx = memoryStore.users.findIndex((u) => u.id === user.id);
      if (idx === -1) memoryStore.users.unshift(data);
      else memoryStore.users[idx] = { ...memoryStore.users[idx], ...data };
      persistLocalUsers(memoryStore.users);
      return data;
    } catch {
      const idx = memoryStore.users.findIndex((u) => u.id === user.id);
      if (idx === -1) memoryStore.users.unshift(user);
      else memoryStore.users[idx] = { ...memoryStore.users[idx], ...user };
      persistLocalUsers(memoryStore.users);
      return user;
    }
  },

  async update(id: string, updates: any) {
    // 1. Always update or push to memoryStore
    let idx = memoryStore.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      memoryStore.users[idx] = { ...memoryStore.users[idx], ...updates };
    } else {
      memoryStore.users.unshift({ id, ...updates });
      idx = 0;
    }
    persistLocalUsers(memoryStore.users);

    // 2. Safely sync to Supabase (strip non-standard columns if Supabase complains)
    try {
      const { courses, selectedCourses, ...safeUpdates } = updates;
      const { data, error } = await supabase.from('users').update(safeUpdates).eq('id', id).select().maybeSingle();
      if (error) {
        if (!isTableMissing(error)) logger.warn(`[Supabase Users Update] ${error.message}`);
      } else if (data) {
        memoryStore.users[idx] = { ...data, ...memoryStore.users[idx] };
        persistLocalUsers(memoryStore.users);
      }
    } catch (e: any) {
      logger.warn(`[Supabase Users Update Exception] ${e.message}`);
    }
    return memoryStore.users[idx];
  },

  async softDelete(id: string) {
    return this.update(id, { status: 'Inactive', deleted: true });
  }
};

// ==========================================
// CAMPUSES SERVICE (University of Education)
// ==========================================
const CAMPUSES_FILE = fs.existsSync(path.join(process.cwd(), 'backend', 'data'))
  ? path.join(process.cwd(), 'backend', 'data', 'campuses.json')
  : path.join(process.cwd(), 'data', 'campuses.json');

const INITIAL_CAMPUSES = [
  {
    id: 'camp-attock',
    code: 'UE-ATK',
    name: 'Attock Campus',
    city: 'Attock',
    address: 'University Road, Attock City',
    directorName: 'Prof. Dr. Muhammad Aslam',
    status: 'Active'
  },
  {
    id: 'camp-main',
    code: 'UE-MAIN',
    name: 'Main Campus',
    city: 'Lahore',
    address: 'College Road, Township, Lahore',
    directorName: 'Prof. Dr. Shahid Iqbal',
    status: 'Active'
  },
  {
    id: 'camp-multan',
    code: 'UE-MLT',
    name: 'Multan Campus',
    city: 'Multan',
    address: 'Bosan Road, Multan',
    directorName: 'Prof. Dr. Rashid Mehmood',
    status: 'Active'
  }
];

function persistLocalCampuses(list: any[]) {
  try {
    const dir = path.dirname(CAMPUSES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CAMPUSES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    logger.warn('[CampusService] Could not write campuses.json', err);
  }
}

function loadLocalCampuses(): any[] {
  try {
    if (fs.existsSync(CAMPUSES_FILE)) {
      const content = fs.readFileSync(CAMPUSES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  persistLocalCampuses(INITIAL_CAMPUSES);
  return [...INITIAL_CAMPUSES];
}

export const CampusService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('campuses').select('*').order('name');
      if (error || !data || data.length === 0) {
        if (!memoryStore.campuses || memoryStore.campuses.length === 0) {
          memoryStore.campuses = loadLocalCampuses();
        }
        return memoryStore.campuses;
      }
      memoryStore.campuses = data;
      persistLocalCampuses(data);
      return data;
    } catch {
      if (!memoryStore.campuses || memoryStore.campuses.length === 0) {
        memoryStore.campuses = loadLocalCampuses();
      }
      return memoryStore.campuses;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('campuses').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        const all = await this.getAll();
        return all.find((c: any) => c.id === id);
      }
      return data;
    } catch {
      const all = await this.getAll();
      return all.find((c: any) => c.id === id);
    }
  },

  async findByNameOrCode(name: string, code?: string, excludeId?: string) {
    const all = await this.getAll();
    const cleanName = (name || '').trim().toLowerCase();
    const cleanCode = (code || '').trim().toUpperCase();

    return all.find((c: any) => {
      if (excludeId && c.id === excludeId) return false;
      const matchName = cleanName && c.name && c.name.trim().toLowerCase() === cleanName;
      const matchCode = cleanCode && c.code && c.code.trim().toUpperCase() === cleanCode;
      return matchName || matchCode;
    });
  },

  async create(campus: any) {
    try {
      const { data, error } = await supabase.from('campuses').insert([campus]).select().single();
      if (error) {
        if (!memoryStore.campuses) memoryStore.campuses = loadLocalCampuses();
        memoryStore.campuses.push(campus);
        persistLocalCampuses(memoryStore.campuses);
        return campus;
      }
      if (!memoryStore.campuses) memoryStore.campuses = loadLocalCampuses();
      memoryStore.campuses.push(data);
      persistLocalCampuses(memoryStore.campuses);
      return data;
    } catch {
      if (!memoryStore.campuses) memoryStore.campuses = loadLocalCampuses();
      memoryStore.campuses.push(campus);
      persistLocalCampuses(memoryStore.campuses);
      return campus;
    }
  },

  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase.from('campuses').update(updates).eq('id', id).select().maybeSingle();
      if (!memoryStore.campuses) memoryStore.campuses = loadLocalCampuses();
      const idx = memoryStore.campuses.findIndex((c: any) => c.id === id);
      if (idx !== -1) {
        memoryStore.campuses[idx] = { ...memoryStore.campuses[idx], ...updates, ...(data || {}) };
        persistLocalCampuses(memoryStore.campuses);
        return memoryStore.campuses[idx];
      }
      if (data) {
        persistLocalCampuses(memoryStore.campuses);
        return data;
      }
      return null;
    } catch {
      if (!memoryStore.campuses) memoryStore.campuses = loadLocalCampuses();
      const idx = memoryStore.campuses.findIndex((c: any) => c.id === id);
      if (idx !== -1) {
        memoryStore.campuses[idx] = { ...memoryStore.campuses[idx], ...updates };
        persistLocalCampuses(memoryStore.campuses);
        return memoryStore.campuses[idx];
      }
      return null;
    }
  },

  async delete(id: string) {
    try {
      await supabase.from('campuses').delete().eq('id', id);
    } catch {}
    if (!memoryStore.campuses) memoryStore.campuses = loadLocalCampuses();
    memoryStore.campuses = memoryStore.campuses.filter((c: any) => c.id !== id);
    persistLocalCampuses(memoryStore.campuses);
    return true;
  }
};

// ==========================================
// DEPARTMENTS SERVICE (University of Education)
// ==========================================
const DEPARTMENTS_FILE = path.join(process.cwd(), 'data', 'departments.json');

function persistLocalDepartments(list: any[]) {
  try {
    const dir = path.dirname(DEPARTMENTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DEPARTMENTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    logger.warn('[DepartmentService] Could not write departments.json', err);
  }
}

function loadLocalDepartments(): any[] {
  try {
    if (fs.existsSync(DEPARTMENTS_FILE)) {
      const content = fs.readFileSync(DEPARTMENTS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  persistLocalDepartments([]);
  return [];
}

function toDbDept(dept: any) {
  const meta = {
    campusId: dept.campusId || 'camp-attock',
    campusName: dept.campusName || 'Attock Campus',
    status: dept.status || 'Active',
    building: dept.building || 'Academic Block A'
  };
  return {
    id: dept.id,
    code: dept.code,
    name: dept.name,
    hodId: dept.hodId || '',
    hodName: dept.hodName || 'Unassigned',
    facultyCount: dept.facultyCount || 0,
    courseCount: dept.courseCount || 0,
    submissionRate: dept.submissionRate || 0,
    building: JSON.stringify(meta)
  };
}

function fromDbDept(row: any) {
  if (!row) return row;
  let meta: any = {};
  if (row.building && typeof row.building === 'string' && row.building.startsWith('{')) {
    try {
      meta = JSON.parse(row.building);
    } catch {}
  }
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    campusId: row.campusId || meta.campusId || 'camp-attock',
    campusName: row.campusName || meta.campusName || 'Attock Campus',
    status: row.status || meta.status || 'Active',
    hodId: row.hodId || '',
    hodName: row.hodName || 'Unassigned',
    facultyCount: row.facultyCount || 0,
    courseCount: row.courseCount || 0,
    submissionRate: row.submissionRate || 0,
    building: meta.building || row.building || 'Academic Block A',
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export const DepartmentService = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('departments').select('*').order('name');
      const local = loadLocalDepartments();

      if (error || !data) {
        if (!memoryStore.departments || memoryStore.departments.length === 0) {
          memoryStore.departments = local;
        }
        return memoryStore.departments;
      }

      const mapped = data.map(fromDbDept);
      const validDb = mapped.filter((d: any) => d.campusId && d.campusId.trim() !== '');

      // Merge Supabase records with local records so no department is ever lost
      const combined = [...validDb];
      for (const loc of local) {
        if (!combined.some((c: any) => c.id === loc.id || (c.code === loc.code && c.campusId === loc.campusId))) {
          combined.push(loc);
          // Sync missing local record into Supabase
          try {
            Promise.resolve(supabase.from('departments').insert([toDbDept(loc)])).catch(() => {});
          } catch {}
        }
      }

      memoryStore.departments = combined;
      persistLocalDepartments(combined);
      return combined;
    } catch {
      if (!memoryStore.departments || memoryStore.departments.length === 0) {
        memoryStore.departments = loadLocalDepartments();
      }
      return memoryStore.departments;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('departments').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        const all = await this.getAll();
        return all.find((d: any) => d.id === id);
      }
      return fromDbDept(data);
    } catch {
      const all = await this.getAll();
      return all.find((d: any) => d.id === id);
    }
  },

  async findByCampusAndNameOrCode(campusId: string, name: string, code?: string, excludeId?: string) {
    const all = await this.getAll();
    const cleanCampusId = (campusId || '').trim();
    const cleanName = (name || '').trim().toLowerCase();
    const cleanCode = (code || '').trim().toUpperCase();

    return all.find((d: any) => {
      if (d.campusId !== cleanCampusId) return false;
      if (excludeId && d.id === excludeId) return false;
      const matchName = cleanName && d.name && d.name.trim().toLowerCase() === cleanName;
      const matchCode = cleanCode && d.code && d.code.trim().toUpperCase() === cleanCode;
      return matchName || matchCode;
    });
  },

  async create(dept: any) {
    const formatted = {
      ...dept,
      campusId: dept.campusId || 'camp-attock',
      campusName: dept.campusName || 'Attock Campus',
      status: dept.status || 'Active'
    };

    try {
      const dbPayload = toDbDept(formatted);
      const { data, error } = await supabase.from('departments').insert([dbPayload]).select().single();
      if (error || !data) {
        if (!memoryStore.departments) memoryStore.departments = loadLocalDepartments();
        memoryStore.departments.push(formatted);
        persistLocalDepartments(memoryStore.departments);
        return formatted;
      }
      const saved = fromDbDept(data);
      if (!memoryStore.departments) memoryStore.departments = loadLocalDepartments();
      memoryStore.departments.push(saved);
      persistLocalDepartments(memoryStore.departments);
      return saved;
    } catch {
      if (!memoryStore.departments) memoryStore.departments = loadLocalDepartments();
      memoryStore.departments.push(formatted);
      persistLocalDepartments(memoryStore.departments);
      return formatted;
    }
  },

  async update(id: string, updates: any) {
    try {
      const existing = await this.getById(id);
      const merged = { ...(existing || {}), ...updates };
      const dbPayload = toDbDept(merged);
      const { data, error } = await supabase.from('departments').update(dbPayload).eq('id', id).select().maybeSingle();

      if (!memoryStore.departments) memoryStore.departments = loadLocalDepartments();
      const idx = memoryStore.departments.findIndex((d: any) => d.id === id);
      const finalObj = data ? fromDbDept(data) : merged;

      if (idx !== -1) {
        memoryStore.departments[idx] = finalObj;
      } else {
        memoryStore.departments.push(finalObj);
      }
      persistLocalDepartments(memoryStore.departments);
      return finalObj;
    } catch {
      if (!memoryStore.departments) memoryStore.departments = loadLocalDepartments();
      const idx = memoryStore.departments.findIndex((d: any) => d.id === id);
      if (idx !== -1) {
        memoryStore.departments[idx] = { ...memoryStore.departments[idx], ...updates };
        persistLocalDepartments(memoryStore.departments);
        return memoryStore.departments[idx];
      }
      return null;
    }
  },

  async assignHOD(deptId: string, hodId: string, hodName: string) {
    return this.update(deptId, { hodId, hodName });
  },

  async delete(id: string) {
    try {
      await supabase.from('departments').delete().eq('id', id);
    } catch {}
    if (!memoryStore.departments) memoryStore.departments = loadLocalDepartments();
    memoryStore.departments = memoryStore.departments.filter((d: any) => d.id !== id);
    persistLocalDepartments(memoryStore.departments);
    return true;
  }
};

// ==========================================
// COURSES SERVICE
// ==========================================
const COURSES_FILE = path.join(process.cwd(), 'data', 'courses.json');

function persistLocalCourses(list: any[]) {
  try {
    const dir = path.dirname(COURSES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(COURSES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    logger.warn('[CourseService] Could not write courses.json', err);
  }
}

function loadLocalCourses(): any[] {
  try {
    if (fs.existsSync(COURSES_FILE)) {
      const content = fs.readFileSync(COURSES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

export const CourseService = {
  async getAll() {
    try {
      const local = loadLocalCourses();
      const { data, error } = await supabase.from('courses').select('*').order('code');
      if (error || !data || data.length === 0) {
        if (!memoryStore.courses || memoryStore.courses.length === 0) {
          memoryStore.courses = local;
        }
        return memoryStore.courses.length > 0 ? memoryStore.courses : local;
      }

      // Merge remote and local courses ensuring no duplicates
      const merged = [...data];
      for (const loc of local) {
        if (!merged.some((m: any) => m.id === loc.id || (m.code === loc.code && m.departmentId === loc.departmentId))) {
          merged.push(loc);
        }
      }
      memoryStore.courses = merged;
      persistLocalCourses(merged);
      return merged;
    } catch {
      if (!memoryStore.courses || memoryStore.courses.length === 0) {
        memoryStore.courses = loadLocalCourses();
      }
      return memoryStore.courses;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        const all = await this.getAll();
        return all.find((c: any) => c.id === id);
      }
      return data;
    } catch {
      const all = await this.getAll();
      return all.find((c: any) => c.id === id);
    }
  },

  async create(course: any) {
    const local = loadLocalCourses();
    const existingIdx = local.findIndex((c: any) => c.id === course.id);
    if (existingIdx !== -1) {
      local[existingIdx] = course;
    } else {
      local.push(course);
    }
    persistLocalCourses(local);

    try {
      const { data, error } = await supabase.from('courses').insert([course]).select().single();
      if (error) {
        if (!memoryStore.courses) memoryStore.courses = local;
        else if (!memoryStore.courses.some((c: any) => c.id === course.id)) memoryStore.courses.push(course);
        return course;
      }
      if (!memoryStore.courses) memoryStore.courses = local;
      else {
        const idx = memoryStore.courses.findIndex((c: any) => c.id === course.id);
        if (idx !== -1) memoryStore.courses[idx] = data;
        else memoryStore.courses.push(data);
      }
      return data;
    } catch {
      if (!memoryStore.courses) memoryStore.courses = local;
      else if (!memoryStore.courses.some((c: any) => c.id === course.id)) memoryStore.courses.push(course);
      return course;
    }
  },

  async update(id: string, updates: any) {
    const local = loadLocalCourses();
    const lIdx = local.findIndex((c: any) => c.id === id);
    if (lIdx !== -1) {
      local[lIdx] = { ...local[lIdx], ...updates };
      persistLocalCourses(local);
    }

    try {
      const { data, error } = await supabase.from('courses').update(updates).eq('id', id).select().maybeSingle();
      if (!memoryStore.courses) memoryStore.courses = local;
      const idx = memoryStore.courses.findIndex((c: any) => c.id === id);
      const updated = (!error && data) ? data : (lIdx !== -1 ? local[lIdx] : { id, ...updates });
      if (idx !== -1) {
        memoryStore.courses[idx] = { ...memoryStore.courses[idx], ...updates, ...(data || {}) };
      } else {
        memoryStore.courses.push(updated);
      }
      return memoryStore.courses[idx] || updated;
    } catch {
      if (!memoryStore.courses) memoryStore.courses = local;
      const idx = memoryStore.courses.findIndex((c: any) => c.id === id);
      if (idx !== -1) {
        memoryStore.courses[idx] = { ...memoryStore.courses[idx], ...updates };
        return memoryStore.courses[idx];
      }
      return lIdx !== -1 ? local[lIdx] : null;
    }
  },

  async delete(id: string) {
    const local = loadLocalCourses().filter((c: any) => c.id !== id);
    persistLocalCourses(local);

    try {
      await supabase.from('courses').delete().eq('id', id);
    } catch {}
    if (memoryStore.courses) {
      memoryStore.courses = memoryStore.courses.filter((c: any) => c.id !== id);
    }
    return true;
  }
};

// ==========================================
// COURSE FILES SERVICE (With Disk Persistence & Remote Sync)
// ==========================================
const COURSE_FILES_FILE = path.join(process.cwd(), 'data', 'course_files.json');

function persistLocalCourseFiles(list: any[]) {
  try {
    const dir = path.dirname(COURSE_FILES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(COURSE_FILES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    logger.warn('[CourseFileService] Could not write course_files.json', err);
  }
}

function loadLocalCourseFiles(): any[] {
  try {
    if (fs.existsSync(COURSE_FILES_FILE)) {
      const content = fs.readFileSync(COURSE_FILES_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  persistLocalCourseFiles([]);
  return [];
}

export const CourseFileService = {
  async getAll() {
    const local = loadLocalCourseFiles();
    try {
      const { data, error } = await supabase.from('course_files').select('*').order('created_at', { ascending: false });
      if (error || !data || data.length === 0) {
        if (!memoryStore.courseFiles || memoryStore.courseFiles.length === 0) {
          memoryStore.courseFiles = local;
        }
        return memoryStore.courseFiles;
      }

      // Merge remote and local
      const combined = [...data];
      for (const loc of local) {
        if (!combined.some((c: any) => c.id === loc.id)) {
          combined.push(loc);
        }
      }
      memoryStore.courseFiles = combined;
      persistLocalCourseFiles(combined);
      return combined;
    } catch {
      let list = loadLocalCourseFiles();
      if (list.length === 0) list = memoryStore.courseFiles || [];
      return list;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('course_files').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        const local = loadLocalCourseFiles();
        const found = local.find((f) => f.id === id);
        if (found) return found;
        return (memoryStore.courseFiles || []).find((f: any) => f.id === id);
      }
      return data;
    } catch {
      const local = loadLocalCourseFiles();
      const found = local.find((f) => f.id === id);
      if (found) return found;
      return (memoryStore.courseFiles || []).find((f: any) => f.id === id);
    }
  },

  async create(file: any) {
    const local = loadLocalCourseFiles();
    const existingIdx = local.findIndex((f) => f.id === file.id);
    if (existingIdx !== -1) {
      local[existingIdx] = { ...local[existingIdx], ...file };
    } else {
      local.unshift(file);
    }
    persistLocalCourseFiles(local);

    if (!memoryStore.courseFiles) memoryStore.courseFiles = [];
    const memIdx = memoryStore.courseFiles.findIndex((f: any) => f.id === file.id);
    if (memIdx !== -1) {
      memoryStore.courseFiles[memIdx] = { ...memoryStore.courseFiles[memIdx], ...file };
    } else {
      memoryStore.courseFiles.unshift(file);
    }

    try {
      const { data, error } = await supabase.from('course_files').insert([file]).select().single();
      if (error) return file;
      return data || file;
    } catch {
      return file;
    }
  },

  async update(id: string, updates: any) {
    const local = loadLocalCourseFiles();
    const lIdx = local.findIndex((f) => f.id === id);
    if (lIdx !== -1) {
      local[lIdx] = { ...local[lIdx], ...updates };
      persistLocalCourseFiles(local);
    }

    if (!memoryStore.courseFiles) memoryStore.courseFiles = [];
    const idx = memoryStore.courseFiles.findIndex((f: any) => f.id === id);
    if (idx !== -1) {
      memoryStore.courseFiles[idx] = { ...memoryStore.courseFiles[idx], ...updates };
    }

    try {
      const { data, error } = await supabase.from('course_files').update(updates).eq('id', id).select().maybeSingle();
      if (idx !== -1) {
        return memoryStore.courseFiles[idx];
      }
      return data || local[lIdx] || null;
    } catch {
      return idx !== -1 ? memoryStore.courseFiles[idx] : (local[lIdx] || null);
    }
  },

  async delete(id: string, permanent: boolean = false) {
    const local = loadLocalCourseFiles().filter((f) => f.id !== id);
    persistLocalCourseFiles(local);
    if (memoryStore.courseFiles) {
      memoryStore.courseFiles = memoryStore.courseFiles.filter((f: any) => f.id !== id);
    }
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
// TEACHER REQUESTS SERVICE (With Disk Persistence)
// ==========================================
const TEACHER_REQUESTS_FILE = path.join(process.cwd(), 'data', 'teacher_requests.json');

function persistLocalTeacherRequests(list: any[]) {
  try {
    const dir = path.dirname(TEACHER_REQUESTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TEACHER_REQUESTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    logger.warn('[TeacherRequestService] Could not write teacher_requests.json', err);
  }
}

function loadLocalTeacherRequests(): any[] {
  try {
    if (fs.existsSync(TEACHER_REQUESTS_FILE)) {
      const content = fs.readFileSync(TEACHER_REQUESTS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  persistLocalTeacherRequests([]);
  return [];
}

export const TeacherRequestService = {
  async getAll(filters?: { departmentId?: string; hodId?: string; status?: string; teacherId?: string; campusName?: string; campusId?: string }) {
    const local = loadLocalTeacherRequests();
    try {
      let query = supabase.from('teacher_requests').select('*').order('created_at', { ascending: false });
      if (filters?.departmentId) query = query.eq('departmentId', filters.departmentId);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.teacherId) query = query.eq('teacherId', filters.teacherId);
      if (filters?.campusName) query = query.eq('campusName', filters.campusName);

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        const seen = new Set<string>();
        const combined: any[] = [];
        for (const loc of local) {
          if (!seen.has(loc.id)) {
            seen.add(loc.id);
            combined.push(loc);
          }
        }
        memoryStore.teacherRequests = combined;
        let list = [...combined];
        if (filters?.departmentId) list = list.filter((r) => r.departmentId === filters.departmentId);
        if (filters?.status) list = list.filter((r) => r.status === filters.status);
        if (filters?.teacherId) list = list.filter((r) => r.teacherId === filters.teacherId);
        if (filters?.campusName) list = list.filter((r) => r.campusName === filters.campusName);
        return list;
      }

      // Merge remote and local
      const combined = [...data];
      for (const loc of local) {
        if (!combined.some((c: any) => c.id === loc.id)) {
          combined.push(loc);
        }
      }
      memoryStore.teacherRequests = combined;

      let list = [...combined];
      if (filters?.departmentId) list = list.filter((r) => r.departmentId === filters.departmentId);
      if (filters?.status) list = list.filter((r) => r.status === filters.status);
      if (filters?.teacherId) list = list.filter((r) => r.teacherId === filters.teacherId);
      if (filters?.campusName) list = list.filter((r) => r.campusName === filters.campusName);
      return list;
    } catch {
      let list = loadLocalTeacherRequests();
      if (list.length === 0) list = memoryStore.teacherRequests || [];
      if (filters?.departmentId) list = list.filter((r) => r.departmentId === filters.departmentId);
      if (filters?.status) list = list.filter((r) => r.status === filters.status);
      if (filters?.teacherId) list = list.filter((r) => r.teacherId === filters.teacherId);
      if (filters?.campusName) list = list.filter((r) => r.campusName === filters.campusName);
      return list;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('teacher_requests').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        const local = loadLocalTeacherRequests();
        const foundLocal = local.find((r) => r.id === id);
        if (foundLocal) return foundLocal;
        return memoryStore.teacherRequests.find((r) => r.id === id);
      }
      return data;
    } catch {
      const local = loadLocalTeacherRequests();
      const foundLocal = local.find((r) => r.id === id);
      if (foundLocal) return foundLocal;
      return memoryStore.teacherRequests.find((r) => r.id === id);
    }
  },

  async getByTeacherId(teacherId: string) {
    try {
      const { data, error } = await supabase.from('teacher_requests').select('*').eq('teacherId', teacherId).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (error || !data) {
        const local = loadLocalTeacherRequests();
        const found = local.find((r) => r.teacherId === teacherId);
        if (found) return found;
        return memoryStore.teacherRequests.find((r) => r.teacherId === teacherId);
      }
      return data;
    } catch {
      const local = loadLocalTeacherRequests();
      const found = local.find((r) => r.teacherId === teacherId);
      if (found) return found;
      return memoryStore.teacherRequests.find((r) => r.teacherId === teacherId);
    }
  },

  async create(req: any) {
    const local = loadLocalTeacherRequests();
    const existingIdx = local.findIndex((r) => r.id === req.id || r.teacherId === req.teacherId);
    if (existingIdx !== -1) {
      local[existingIdx] = { ...local[existingIdx], ...req };
    } else {
      local.unshift(req);
    }
    persistLocalTeacherRequests(local);

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
    const local = loadLocalTeacherRequests();
    const lIdx = local.findIndex((r) => r.id === id);
    if (lIdx !== -1) {
      local[lIdx] = { ...local[lIdx], ...updates };
      persistLocalTeacherRequests(local);
    }

    try {
      const { data, error } = await supabase.from('teacher_requests').update(updates).eq('id', id).select().maybeSingle();
      const idx = memoryStore.teacherRequests.findIndex((r) => r.id === id);
      if (idx !== -1) {
        memoryStore.teacherRequests[idx] = { ...memoryStore.teacherRequests[idx], ...updates, ...(data || {}) };
        return memoryStore.teacherRequests[idx];
      }
      return data || (lIdx !== -1 ? local[lIdx] : null);
    } catch {
      const idx = memoryStore.teacherRequests.findIndex((r) => r.id === id);
      if (idx !== -1) {
        memoryStore.teacherRequests[idx] = { ...memoryStore.teacherRequests[idx], ...updates };
        return memoryStore.teacherRequests[idx];
      }
      return lIdx !== -1 ? local[lIdx] : null;
    }
  },

  async delete(id: string) {
    const local = loadLocalTeacherRequests().filter((r) => r.id !== id);
    persistLocalTeacherRequests(local);

    try {
      await supabase.from('teacher_requests').delete().eq('id', id);
    } catch {}
    memoryStore.teacherRequests = memoryStore.teacherRequests.filter((r) => r.id !== id);
    return true;
  }
};

// ==========================================
// HOD ASSIGNMENTS SERVICE (Multi-Campus & Multi-Department)
// ==========================================
const HOD_ASSIGNMENTS_FILE = path.join(process.cwd(), 'data', 'hod_assignments.json');

function persistLocalHODAssignments(list: any[]) {
  try {
    const dir = path.dirname(HOD_ASSIGNMENTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(HOD_ASSIGNMENTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    logger.warn('[HODAssignmentService] Could not write hod_assignments.json', err);
  }
}

function loadLocalHODAssignments(): any[] {
  try {
    if (fs.existsSync(HOD_ASSIGNMENTS_FILE)) {
      const content = fs.readFileSync(HOD_ASSIGNMENTS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  persistLocalHODAssignments([]);
  return [];
}

export const HODAssignmentService = {
  async getAll(filters?: { campusId?: string; departmentId?: string; hodId?: string; status?: string }) {
    try {
      let query = supabase.from('hod_assignments').select('*').order('created_at', { ascending: false });
      if (filters?.campusId) query = query.eq('campusId', filters.campusId);
      if (filters?.departmentId) query = query.eq('departmentId', filters.departmentId);
      if (filters?.hodId) query = query.eq('hodId', filters.hodId);
      if (filters?.status) query = query.eq('status', filters.status);

      const { data, error } = await query;
      const local = loadLocalHODAssignments();

      if (error || !data || data.length === 0) {
        if (!memoryStore.hodAssignments || memoryStore.hodAssignments.length === 0) {
          memoryStore.hodAssignments = local;
        }
        let list = [...(memoryStore.hodAssignments || [])];
        if (filters?.campusId) list = list.filter((a) => a.campusId === filters.campusId);
        if (filters?.departmentId) list = list.filter((a) => a.departmentId === filters.departmentId);
        if (filters?.hodId) list = list.filter((a) => a.hodId === filters.hodId);
        if (filters?.status) list = list.filter((a) => a.status === filters.status);
        return list;
      }

      // Merge remote and local
      const combined = [...data];
      for (const loc of local) {
        if (!combined.some((c: any) => c.id === loc.id)) {
          combined.push(loc);
        }
      }
      memoryStore.hodAssignments = combined;
      persistLocalHODAssignments(combined);

      let list = combined;
      if (filters?.campusId) list = list.filter((a) => a.campusId === filters.campusId);
      if (filters?.departmentId) list = list.filter((a) => a.departmentId === filters.departmentId);
      if (filters?.hodId) list = list.filter((a) => a.hodId === filters.hodId);
      if (filters?.status) list = list.filter((a) => a.status === filters.status);
      return list;
    } catch {
      if (!memoryStore.hodAssignments || memoryStore.hodAssignments.length === 0) {
        memoryStore.hodAssignments = loadLocalHODAssignments();
      }
      let list = [...(memoryStore.hodAssignments || [])];
      if (filters?.campusId) list = list.filter((a) => a.campusId === filters.campusId);
      if (filters?.departmentId) list = list.filter((a) => a.departmentId === filters.departmentId);
      if (filters?.hodId) list = list.filter((a) => a.hodId === filters.hodId);
      if (filters?.status) list = list.filter((a) => a.status === filters.status);
      return list;
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase.from('hod_assignments').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        const all = await this.getAll();
        return all.find((a: any) => a.id === id);
      }
      return data;
    } catch {
      const all = await this.getAll();
      return all.find((a: any) => a.id === id);
    }
  },

  async getActiveByHodId(hodId: string) {
    try {
      const { data, error } = await supabase
        .from('hod_assignments')
        .select('*')
        .eq('hodId', hodId)
        .eq('status', 'Active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error || !data) {
        const all = await this.getAll();
        return all.find((a: any) => a.hodId === hodId && a.status === 'Active');
      }
      return data;
    } catch {
      const all = await this.getAll();
      return all.find((a: any) => a.hodId === hodId && a.status === 'Active');
    }
  },

  async getActiveByScope(campusId: string, departmentId: string) {
    try {
      const { data, error } = await supabase
        .from('hod_assignments')
        .select('*')
        .eq('campusId', campusId)
        .eq('departmentId', departmentId)
        .eq('status', 'Active')
        .limit(1)
        .maybeSingle();
      if (error || !data) {
        const all = await this.getAll();
        return all.find(
          (a: any) => a.campusId === campusId && a.departmentId === departmentId && a.status === 'Active'
        );
      }
      return data;
    } catch {
      const all = await this.getAll();
      return all.find(
        (a: any) => a.campusId === campusId && a.departmentId === departmentId && a.status === 'Active'
      );
    }
  },

  async create(assignment: any) {
    try {
      if (assignment.status === 'Active') {
        try {
          await supabase
            .from('hod_assignments')
            .update({ status: 'Inactive' })
            .eq('campusId', assignment.campusId)
            .eq('departmentId', assignment.departmentId);
        } catch {}
        if (!memoryStore.hodAssignments) memoryStore.hodAssignments = loadLocalHODAssignments();
        memoryStore.hodAssignments.forEach((a: any) => {
          if (a.campusId === assignment.campusId && a.departmentId === assignment.departmentId && a.id !== assignment.id) {
            a.status = 'Inactive';
          }
        });
      }

      const { data, error } = await supabase.from('hod_assignments').insert([assignment]).select().single();
      if (!memoryStore.hodAssignments) memoryStore.hodAssignments = loadLocalHODAssignments();
      const saved = (!error && data) ? data : assignment;

      memoryStore.hodAssignments.unshift(saved);
      persistLocalHODAssignments(memoryStore.hodAssignments);
      return saved;
    } catch {
      if (!memoryStore.hodAssignments) memoryStore.hodAssignments = loadLocalHODAssignments();
      memoryStore.hodAssignments.unshift(assignment);
      persistLocalHODAssignments(memoryStore.hodAssignments);
      return assignment;
    }
  },

  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase.from('hod_assignments').update(updates).eq('id', id).select().maybeSingle();
      if (!memoryStore.hodAssignments) memoryStore.hodAssignments = loadLocalHODAssignments();
      const idx = memoryStore.hodAssignments.findIndex((a: any) => a.id === id);
      const updated = (!error && data) ? data : { ...((idx !== -1 ? memoryStore.hodAssignments[idx] : {})), ...updates };

      if (idx !== -1) {
        memoryStore.hodAssignments[idx] = updated;
      } else {
        memoryStore.hodAssignments.push(updated);
      }
      persistLocalHODAssignments(memoryStore.hodAssignments);
      return updated;
    } catch {
      if (!memoryStore.hodAssignments) memoryStore.hodAssignments = loadLocalHODAssignments();
      const idx = memoryStore.hodAssignments.findIndex((a: any) => a.id === id);
      if (idx !== -1) {
        memoryStore.hodAssignments[idx] = { ...memoryStore.hodAssignments[idx], ...updates };
        persistLocalHODAssignments(memoryStore.hodAssignments);
        return memoryStore.hodAssignments[idx];
      }
      return null;
    }
  },

  async delete(id: string) {
    try {
      await supabase.from('hod_assignments').delete().eq('id', id);
    } catch {}
    if (!memoryStore.hodAssignments) memoryStore.hodAssignments = loadLocalHODAssignments();
    memoryStore.hodAssignments = memoryStore.hodAssignments.filter((a: any) => a.id !== id);
    persistLocalHODAssignments(memoryStore.hodAssignments);
    return true;
  }
};
