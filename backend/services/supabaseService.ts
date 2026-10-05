import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/supabase';
import { memoryStore } from '../utils/memoryStore';
import { logger } from '../config/logger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to determine if an error is due to missing table
const isTableMissing = (error: any): boolean => {
  return error && (error.code === 'PGRST205' || (error.message && error.message.includes('schema cache')));
};

const getDataFilePath = (filename: string): string => {
  const possiblePaths = [
    path.join(process.cwd(), 'backend', 'data', filename),
    path.join(process.cwd(), 'data', filename),
    path.resolve(__dirname, '..', 'data', filename)
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  const defaultDir = path.resolve(__dirname, '..', 'data');
  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }
  return path.join(defaultDir, filename);
};

const USERS_FILE = getDataFilePath('users.json');

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
  return memoryStore.users && memoryStore.users.length > 0 ? memoryStore.users : [];
}

// Populate initial memoryStore users from users.json if present
memoryStore.users = loadLocalUsers();

// ==========================================
// USERS SERVICE
// ==========================================
export const UserService = {
  async getAll() {
    try {
      const local = loadLocalUsers();
      const { data, error } = await supabase.from('users').select('*').order('name');
      if (error || !data || data.length === 0) {
        memoryStore.users = local;
        return local;
      }
      // Merge remote and local users so no user/HOD/teacher is ever lost
      const combined = [...data];
      for (const loc of local) {
        const existingIdx = combined.findIndex(
          (u: any) => u.id === loc.id || (u.email && loc.email && u.email.toLowerCase() === loc.email.toLowerCase())
        );
        if (existingIdx === -1) {
          combined.push(loc);
        } else {
          combined[existingIdx] = { ...combined[existingIdx], ...loc };
        }
      }
      memoryStore.users = combined;
      persistLocalUsers(combined);
      return combined;
    } catch {
      const local = loadLocalUsers();
      memoryStore.users = local;
      return local;
    }
  },

  async getById(id: string) {
    try {
      const local = loadLocalUsers();
      const locUser = local.find((u: any) => u.id === id);
      const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
      if (error || !data) return locUser;
      return locUser ? { ...data, ...locUser } : data;
    } catch {
      const local = loadLocalUsers();
      return local.find((u: any) => u.id === id);
    }
  },

  async getByEmail(email: string) {
    const targetEmail = (email || '').trim().toLowerCase();
    if (!targetEmail) return null;
    try {
      const local = loadLocalUsers();
      const locUser = local.find((u: any) => u.email && u.email.toLowerCase() === targetEmail);
      const { data, error } = await supabase.from('users').select('*').ilike('email', targetEmail).maybeSingle();
      if (error || !data) return locUser;
      return locUser ? { ...data, ...locUser } : data;
    } catch {
      const local = loadLocalUsers();
      return local.find((u: any) => u.email && u.email.toLowerCase() === targetEmail);
    }
  },

  async create(user: any) {
    const local = loadLocalUsers();
    const idx = local.findIndex((u: any) => u.id === user.id || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()));
    if (idx === -1) local.unshift(user);
    else local[idx] = { ...local[idx], ...user };
    memoryStore.users = local;
    persistLocalUsers(local);

    try {
      const { data, error } = await supabase.from('users').insert([user]).select().single();
      if (!error && data) {
        const updatedIdx = local.findIndex((u: any) => u.id === user.id);
        if (updatedIdx !== -1) {
          local[updatedIdx] = { ...data, ...local[updatedIdx] };
          persistLocalUsers(local);
        }
        return local[updatedIdx] || data;
      }
    } catch (e: any) {
      logger.warn(`[Supabase Users Create Exception] ${e.message}`);
    }
    return user;
  },

  async update(id: string, updates: any) {
    const local = loadLocalUsers();
    let idx = local.findIndex((u: any) => u.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates };
    } else {
      local.unshift({ id, ...updates });
      idx = 0;
    }
    memoryStore.users = local;
    persistLocalUsers(local);

    try {
      const { courses, selectedCourses, ...safeUpdates } = updates;
      const { data, error } = await supabase.from('users').update(safeUpdates).eq('id', id).select().maybeSingle();
      if (!error && data) {
        local[idx] = { ...data, ...local[idx] };
        persistLocalUsers(local);
      }
    } catch (e: any) {
      logger.warn(`[Supabase Users Update Exception] ${e.message}`);
    }
    return local[idx];
  },

  async softDelete(id: string) {
    return this.update(id, { status: 'Inactive', deleted: true });
  }
};

// ==========================================
// CAMPUSES SERVICE (University of Education)
// ==========================================
const CAMPUSES_FILE = getDataFilePath('campuses.json');

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

// Populate initial memoryStore campuses from campuses.json
memoryStore.campuses = loadLocalCampuses();

export const CampusService = {
  async getAll() {
    try {
      const local = loadLocalCampuses();
      const { data, error } = await supabase.from('campuses').select('*').order('name');
      if (error || !data || data.length === 0) {
        memoryStore.campuses = local;
        return local;
      }
      const combined = [...data];
      for (const loc of local) {
        if (!combined.some((c: any) => c.id === loc.id || (c.code && loc.code && c.code.toUpperCase() === loc.code.toUpperCase()))) {
          combined.push(loc);
        }
      }
      memoryStore.campuses = combined;
      persistLocalCampuses(combined);
      return combined;
    } catch {
      const local = loadLocalCampuses();
      memoryStore.campuses = local;
      return local;
    }
  },

  async getById(id: string) {
    try {
      const local = loadLocalCampuses();
      const loc = local.find((c: any) => c.id === id);
      const { data, error } = await supabase.from('campuses').select('*').eq('id', id).maybeSingle();
      if (error || !data) return loc;
      return loc ? { ...data, ...loc } : data;
    } catch {
      const local = loadLocalCampuses();
      return local.find((c: any) => c.id === id);
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
    const local = loadLocalCampuses();
    const idx = local.findIndex((c: any) => c.id === campus.id || (c.code && campus.code && c.code.toUpperCase() === campus.code.toUpperCase()));
    if (idx === -1) local.push(campus);
    else local[idx] = { ...local[idx], ...campus };
    memoryStore.campuses = local;
    persistLocalCampuses(local);

    try {
      const { data, error } = await supabase.from('campuses').insert([campus]).select().single();
      if (!error && data) {
        return data;
      }
    } catch {}
    return campus;
  },

  async update(id: string, updates: any) {
    const local = loadLocalCampuses();
    const idx = local.findIndex((c: any) => c.id === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates };
      memoryStore.campuses = local;
      persistLocalCampuses(local);
    }
    try {
      await supabase.from('campuses').update(updates).eq('id', id);
    } catch {}
    return idx !== -1 ? local[idx] : null;
  },

  async delete(id: string) {
    const local = loadLocalCampuses().filter((c: any) => c.id !== id);
    memoryStore.campuses = local;
    persistLocalCampuses(local);
    try {
      await supabase.from('campuses').delete().eq('id', id);
    } catch {}
    return true;
  }
};

// ==========================================
// DEPARTMENTS SERVICE (University of Education)
// ==========================================
const DEPARTMENTS_FILE = getDataFilePath('departments.json');

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

// Populate initial memoryStore departments from departments.json
memoryStore.departments = loadLocalDepartments();

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
      const local = loadLocalDepartments();
      const { data, error } = await supabase.from('departments').select('*').order('name');

      if (error || !data || data.length === 0) {
        memoryStore.departments = local;
        return local;
      }

      const mapped = data.map(fromDbDept);
      const validDb = mapped.filter((d: any) => d.campusId && d.campusId.trim() !== '');

      // Merge Supabase records with local records so no department is ever lost
      const combined = [...validDb];
      for (const loc of local) {
        if (!combined.some((c: any) => c.id === loc.id || (c.code === loc.code && c.campusId === loc.campusId))) {
          combined.push(loc);
          try {
            Promise.resolve(supabase.from('departments').insert([toDbDept(loc)])).catch(() => {});
          } catch {}
        }
      }

      memoryStore.departments = combined;
      persistLocalDepartments(combined);
      return combined;
    } catch {
      const local = loadLocalDepartments();
      memoryStore.departments = local;
      return local;
    }
  },

  async getById(id: string) {
    try {
      const local = loadLocalDepartments();
      const loc = local.find((d: any) => d.id === id);
      const { data, error } = await supabase.from('departments').select('*').eq('id', id).maybeSingle();
      if (error || !data) return loc;
      return loc ? { ...fromDbDept(data), ...loc } : fromDbDept(data);
    } catch {
      const local = loadLocalDepartments();
      return local.find((d: any) => d.id === id);
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

    const local = loadLocalDepartments();
    const idx = local.findIndex((d: any) => d.id === formatted.id || (d.code === formatted.code && d.campusId === formatted.campusId));
    if (idx === -1) local.push(formatted);
    else local[idx] = { ...local[idx], ...formatted };
    memoryStore.departments = local;
    persistLocalDepartments(local);

    try {
      const dbPayload = toDbDept(formatted);
      const { data, error } = await supabase.from('departments').insert([dbPayload]).select().single();
      if (!error && data) {
        const saved = fromDbDept(data);
        const uIdx = local.findIndex((d: any) => d.id === formatted.id);
        if (uIdx !== -1) {
          local[uIdx] = { ...saved, ...local[uIdx] };
          persistLocalDepartments(local);
        }
        return local[uIdx] || saved;
      }
    } catch {}
    return formatted;
  },

  async update(id: string, updates: any) {
    const local = loadLocalDepartments();
    const idx = local.findIndex((d: any) => d.id === id);
    let finalObj: any = null;
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates };
      finalObj = local[idx];
      memoryStore.departments = local;
      persistLocalDepartments(local);
    }

    try {
      const dbPayload = toDbDept(finalObj || updates);
      await supabase.from('departments').update(dbPayload).eq('id', id);
    } catch {}
    return finalObj;
  },

  async assignHOD(deptId: string, hodId: string, hodName: string) {
    return this.update(deptId, { hodId, hodName });
  },

  async delete(id: string) {
    const local = loadLocalDepartments().filter((d: any) => d.id !== id);
    memoryStore.departments = local;
    persistLocalDepartments(local);
    try {
      await supabase.from('departments').delete().eq('id', id);
    } catch {}
    return true;
  }
};

// ==========================================
// COURSES SERVICE
// ==========================================
const COURSES_FILE = getDataFilePath('courses.json');

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

// Populate initial memoryStore courses from courses.json
memoryStore.courses = loadLocalCourses();

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
const COURSE_FILES_FILE = getDataFilePath('course_files.json');

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

// Populate initial memoryStore courseFiles from course_files.json
memoryStore.courseFiles = loadLocalCourseFiles();

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
const TEACHER_REQUESTS_FILE = getDataFilePath('teacher_requests.json');

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

// Populate initial memoryStore teacherRequests from teacher_requests.json
memoryStore.teacherRequests = loadLocalTeacherRequests();

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

  async getByTeacherId(teacherId: string, departmentId?: string) {
    try {
      let query = supabase.from('teacher_requests').select('*').eq('teacherId', teacherId).order('created_at', { ascending: false });
      if (departmentId) {
        query = query.eq('departmentId', departmentId);
      }
      const { data, error } = await query.limit(1).maybeSingle();
      if (error || !data) {
        const local = loadLocalTeacherRequests();
        const found = local.find((r) => r.teacherId === teacherId && (!departmentId || r.departmentId === departmentId));
        if (found) return found;
        return memoryStore.teacherRequests.find((r) => r.teacherId === teacherId && (!departmentId || r.departmentId === departmentId));
      }
      return data;
    } catch {
      const local = loadLocalTeacherRequests();
      const found = local.find((r) => r.teacherId === teacherId && (!departmentId || r.departmentId === departmentId));
      if (found) return found;
      return memoryStore.teacherRequests.find((r) => r.teacherId === teacherId && (!departmentId || r.departmentId === departmentId));
    }
  },

  async create(req: any) {
    const local = loadLocalTeacherRequests();
    // Match on (id) OR (teacherId + departmentId) to allow one request per teacher per department
    const existingIdx = local.findIndex(
      (r) => r.id === req.id || (r.teacherId === req.teacherId && r.departmentId === req.departmentId)
    );
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
const HOD_ASSIGNMENTS_FILE = getDataFilePath('hod_assignments.json');

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

// Populate initial memoryStore hodAssignments from hod_assignments.json
memoryStore.hodAssignments = loadLocalHODAssignments();

export const HODAssignmentService = {
  async getAll(filters?: { campusId?: string; departmentId?: string; hodId?: string; status?: string }) {
    try {
      const local = loadLocalHODAssignments();
      let query = supabase.from('hod_assignments').select('*').order('created_at', { ascending: false });
      if (filters?.campusId) query = query.eq('campusId', filters.campusId);
      if (filters?.departmentId) query = query.eq('departmentId', filters.departmentId);
      if (filters?.hodId) query = query.eq('hodId', filters.hodId);
      if (filters?.status) query = query.eq('status', filters.status);

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        memoryStore.hodAssignments = local;
        let list = [...local];
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
      const local = loadLocalHODAssignments();
      memoryStore.hodAssignments = local;
      let list = [...local];
      if (filters?.campusId) list = list.filter((a) => a.campusId === filters.campusId);
      if (filters?.departmentId) list = list.filter((a) => a.departmentId === filters.departmentId);
      if (filters?.hodId) list = list.filter((a) => a.hodId === filters.hodId);
      if (filters?.status) list = list.filter((a) => a.status === filters.status);
      return list;
    }
  },

  async getById(id: string) {
    try {
      const local = loadLocalHODAssignments();
      const loc = local.find((a: any) => a.id === id);
      const { data, error } = await supabase.from('hod_assignments').select('*').eq('id', id).maybeSingle();
      if (error || !data) return loc;
      return loc ? { ...data, ...loc } : data;
    } catch {
      const local = loadLocalHODAssignments();
      return local.find((a: any) => a.id === id);
    }
  },

  async getActiveByHodId(hodId: string) {
    try {
      const local = loadLocalHODAssignments();
      const loc = local.find((a: any) => a.hodId === hodId && a.status === 'Active');
      const { data, error } = await supabase
        .from('hod_assignments')
        .select('*')
        .eq('hodId', hodId)
        .eq('status', 'Active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error || !data) return loc;
      return loc ? { ...data, ...loc } : data;
    } catch {
      const local = loadLocalHODAssignments();
      return local.find((a: any) => a.hodId === hodId && a.status === 'Active');
    }
  },

  async getActiveByScope(campusId: string, departmentId: string) {
    try {
      const local = loadLocalHODAssignments();
      const loc = local.find(
        (a: any) => a.campusId === campusId && a.departmentId === departmentId && a.status === 'Active'
      );
      const { data, error } = await supabase
        .from('hod_assignments')
        .select('*')
        .eq('campusId', campusId)
        .eq('departmentId', departmentId)
        .eq('status', 'Active')
        .limit(1)
        .maybeSingle();
      if (error || !data) return loc;
      return loc ? { ...data, ...loc } : data;
    } catch {
      const local = loadLocalHODAssignments();
      return local.find(
        (a: any) => a.campusId === campusId && a.departmentId === departmentId && a.status === 'Active'
      );
    }
  },

  async create(assignment: any) {
    const local = loadLocalHODAssignments();
    if (assignment.status === 'Active') {
      local.forEach((a: any) => {
        if (a.campusId === assignment.campusId && a.departmentId === assignment.departmentId && a.id !== assignment.id) {
          a.status = 'Inactive';
        }
      });
      try {
        await supabase
          .from('hod_assignments')
          .update({ status: 'Inactive' })
          .eq('campusId', assignment.campusId)
          .eq('departmentId', assignment.departmentId);
      } catch {}
    }

    const idx = local.findIndex((a: any) => a.id === assignment.id);
    if (idx === -1) local.unshift(assignment);
    else local[idx] = { ...local[idx], ...assignment };
    memoryStore.hodAssignments = local;
    persistLocalHODAssignments(local);

    try {
      const { data, error } = await supabase.from('hod_assignments').insert([assignment]).select().single();
      if (!error && data) {
        return data;
      }
    } catch {}
    return assignment;
  },

  async update(id: string, updates: any) {
    const local = loadLocalHODAssignments();
    const idx = local.findIndex((a: any) => a.id === id);
    let updated: any = null;
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...updates };
      updated = local[idx];
      memoryStore.hodAssignments = local;
      persistLocalHODAssignments(local);
    }

    try {
      await supabase.from('hod_assignments').update(updates).eq('id', id);
    } catch {}
    return updated;
  },

  async delete(id: string) {
    const local = loadLocalHODAssignments().filter((a: any) => a.id !== id);
    memoryStore.hodAssignments = local;
    persistLocalHODAssignments(local);
    try {
      await supabase.from('hod_assignments').delete().eq('id', id);
    } catch {}
    return true;
  }
};

// ==========================================
// SECTIONS SERVICE
// ==========================================
const SECTIONS_FILE = getDataFilePath('sections.json');

function persistLocalSections(list: any[]) {
  try {
    const dir = path.dirname(SECTIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SECTIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    logger.warn('[SectionService] Could not write sections.json', err);
  }
}

function loadLocalSections(): any[] {
  try {
    if (fs.existsSync(SECTIONS_FILE)) {
      const content = fs.readFileSync(SECTIONS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return memoryStore.sections || [];
}

memoryStore.sections = loadLocalSections();

export const SectionService = {
  async getAll(filter?: { departmentId?: string; status?: string; campusId?: string }) {
    try {
      let query = supabase.from('sections').select('*');
      if (filter?.departmentId) query = query.eq('departmentId', filter.departmentId);
      if (filter?.status) query = query.eq('status', filter.status);
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        if (!memoryStore.sections || memoryStore.sections.length === 0) {
          memoryStore.sections = loadLocalSections();
        }
        let list = memoryStore.sections;
        if (filter?.departmentId) list = list.filter((s: any) => s.departmentId === filter.departmentId);
        if (filter?.status) list = list.filter((s: any) => s.status === filter.status);
        if (filter?.campusId) list = list.filter((s: any) => !s.campusId || s.campusId === filter.campusId);
        return list;
      }
      return data;
    } catch {
      let list = memoryStore.sections || loadLocalSections();
      if (filter?.departmentId) list = list.filter((s: any) => s.departmentId === filter.departmentId);
      if (filter?.status) list = list.filter((s: any) => s.status === filter.status);
      if (filter?.campusId) list = list.filter((s: any) => !s.campusId || s.campusId === filter.campusId);
      return list;
    }
  },

  async getById(id: string) {
    const list = await this.getAll();
    return list.find((s: any) => s.id === id) || null;
  },

  async getByDepartmentId(departmentId: string) {
    return this.getAll({ departmentId, status: 'Active' });
  },

  async create(section: any) {
    try {
      const { data, error } = await supabase.from('sections').insert([section]).select().single();
      const created = (!error && data) ? data : section;
      if (!memoryStore.sections) memoryStore.sections = loadLocalSections();
      memoryStore.sections.unshift(created);
      persistLocalSections(memoryStore.sections);
      return created;
    } catch {
      if (!memoryStore.sections) memoryStore.sections = loadLocalSections();
      memoryStore.sections.unshift(section);
      persistLocalSections(memoryStore.sections);
      return section;
    }
  },

  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase.from('sections').update(updates).eq('id', id).select().single();
      if (!memoryStore.sections) memoryStore.sections = loadLocalSections();
      const idx = memoryStore.sections.findIndex((s: any) => s.id === id);
      const updated = (!error && data) ? data : { ...(idx !== -1 ? memoryStore.sections[idx] : {}), ...updates };
      if (idx !== -1) memoryStore.sections[idx] = updated;
      else memoryStore.sections.push(updated);
      persistLocalSections(memoryStore.sections);
      return updated;
    } catch {
      if (!memoryStore.sections) memoryStore.sections = loadLocalSections();
      const idx = memoryStore.sections.findIndex((s: any) => s.id === id);
      if (idx !== -1) {
        memoryStore.sections[idx] = { ...memoryStore.sections[idx], ...updates };
        persistLocalSections(memoryStore.sections);
        return memoryStore.sections[idx];
      }
      return null;
    }
  },

  async delete(id: string) {
    try {
      await supabase.from('sections').delete().eq('id', id);
    } catch {}
    if (!memoryStore.sections) memoryStore.sections = loadLocalSections();
    memoryStore.sections = memoryStore.sections.filter((s: any) => s.id !== id);
    persistLocalSections(memoryStore.sections);
    return true;
  }
};

// ==========================================
// TEACHER ASSIGNMENTS SERVICE
// (Teacher → Department → Section → Course → HOD)
// ==========================================
const TEACHER_ASSIGNMENTS_FILE = getDataFilePath('teacher_assignments.json');

function persistLocalTeacherAssignments(list: any[]) {
  try {
    const dir = path.dirname(TEACHER_ASSIGNMENTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(TEACHER_ASSIGNMENTS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    logger.warn('[TeacherAssignmentService] Could not write teacher_assignments.json', err);
  }
}

function loadLocalTeacherAssignments(): any[] {
  try {
    if (fs.existsSync(TEACHER_ASSIGNMENTS_FILE)) {
      const content = fs.readFileSync(TEACHER_ASSIGNMENTS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return memoryStore.teacherAssignments || [];
}

memoryStore.teacherAssignments = loadLocalTeacherAssignments();

export const TeacherAssignmentService = {
  async getAll(filter?: { teacherId?: string; departmentId?: string; sectionId?: string; courseId?: string; active?: boolean }) {
    try {
      let query = supabase.from('teacher_assignments').select('*');
      if (filter?.teacherId) query = query.eq('teacherId', filter.teacherId);
      if (filter?.departmentId) query = query.eq('departmentId', filter.departmentId);
      if (filter?.sectionId) query = query.eq('sectionId', filter.sectionId);
      if (filter?.courseId) query = query.eq('courseId', filter.courseId);
      if (filter?.active !== undefined) query = query.eq('active', filter.active);
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        if (!memoryStore.teacherAssignments || memoryStore.teacherAssignments.length === 0) {
          memoryStore.teacherAssignments = loadLocalTeacherAssignments();
        }
        let list = memoryStore.teacherAssignments;
        if (filter?.teacherId) list = list.filter((a: any) => a.teacherId === filter.teacherId);
        if (filter?.departmentId) list = list.filter((a: any) => a.departmentId === filter.departmentId);
        if (filter?.sectionId) list = list.filter((a: any) => a.sectionId === filter.sectionId);
        if (filter?.courseId) list = list.filter((a: any) => a.courseId === filter.courseId);
        if (filter?.active !== undefined) list = list.filter((a: any) => a.active === filter.active);
        return list;
      }
      return data;
    } catch {
      let list = memoryStore.teacherAssignments || loadLocalTeacherAssignments();
      if (filter?.teacherId) list = list.filter((a: any) => a.teacherId === filter.teacherId);
      if (filter?.departmentId) list = list.filter((a: any) => a.departmentId === filter.departmentId);
      if (filter?.sectionId) list = list.filter((a: any) => a.sectionId === filter.sectionId);
      if (filter?.courseId) list = list.filter((a: any) => a.courseId === filter.courseId);
      if (filter?.active !== undefined) list = list.filter((a: any) => a.active === filter.active);
      return list;
    }
  },

  async getById(id: string) {
    const list = await this.getAll();
    return list.find((a: any) => a.id === id) || null;
  },

  async getByTeacherId(teacherId: string, onlyActive = true) {
    const list = await this.getAll();
    return list.filter((a: any) => a.teacherId === teacherId && (!onlyActive || a.active === true));
  },

  async hasAssignmentsForTeacher(teacherId: string) {
    const list = await this.getAll();
    return list.some((a: any) => a.teacherId === teacherId);
  },

  /**
   * Strict validation of a teacher's selected Department + Section + Course
   * Matches IDs or clean string values.
   */
  async validateAssignment(
    teacherId: string,
    departmentId: string,
    sectionIdOrName: string,
    courseIdOrCodeOrName: string
  ): Promise<{ isValid: boolean; assignment?: any; message?: string }> {
    const assignments = await this.getByTeacherId(teacherId, true);

    if (!assignments || assignments.length === 0) {
      return {
        isValid: false,
        message: 'No Department, Section, or Course has been assigned to your account. Please contact the Administrator.'
      };
    }

    const cleanSec = (sectionIdOrName || '').trim().toLowerCase();
    const cleanCrs = (courseIdOrCodeOrName || '').trim().toLowerCase();
    const cleanDept = (departmentId || '').trim().toLowerCase();

    const matched = assignments.find((a: any) => {
      // 1. Department match
      const deptMatch =
        !cleanDept ||
        (a.departmentId && a.departmentId.toLowerCase() === cleanDept) ||
        (a.departmentName && a.departmentName.toLowerCase() === cleanDept);
      if (!deptMatch) return false;

      // 2. Section / Batch match
      const secMatch =
        !cleanSec ||
        (a.sectionId && a.sectionId.toLowerCase() === cleanSec) ||
        (a.sectionName && a.sectionName.toLowerCase() === cleanSec) ||
        (a.batch && a.batch.toLowerCase() === cleanSec);
      if (!secMatch) return false;

      // 3. Course match
      const crsMatch =
        !cleanCrs ||
        (a.id && a.id.toLowerCase() === cleanCrs) ||
        (a.courseId && a.courseId.toLowerCase() === cleanCrs) ||
        (a.courseCode && a.courseCode.toLowerCase() === cleanCrs) ||
        (a.courseName && a.courseName.toLowerCase() === cleanCrs);
      if (!crsMatch) return false;

      return a.active === true;
    });

    if (matched) {
      return { isValid: true, assignment: matched };
    }

    return {
      isValid: false,
      message: 'Invalid selection. This Department, Section, or Course is not assigned to your account. Please select an authorized option.'
    };
  },

  /**
   * Constructs the hierarchical tree of authorized options for a teacher
   * Teacher → Departments → Sections → Courses
   */
  async getAuthorizedHierarchy(teacherId: string) {
    const activeAssignments = await this.getByTeacherId(teacherId, true);
    if (!activeAssignments || activeAssignments.length === 0) {
      return [];
    }

    const deptMap = new Map<string, any>();

    for (const a of activeAssignments) {
      if (!deptMap.has(a.departmentId)) {
        deptMap.set(a.departmentId, {
          id: a.departmentId,
          name: a.departmentName,
          campusId: a.campusId,
          campusName: a.campusName,
          hodId: a.hodId,
          hodName: a.hodName,
          sections: new Map<string, any>()
        });
      }

      const dept = deptMap.get(a.departmentId);
      if (!dept.sections.has(a.sectionId)) {
        dept.sections.set(a.sectionId, {
          id: a.sectionId,
          name: a.sectionName,
          courses: []
        });
      }

      const sec = dept.sections.get(a.sectionId);
      const exists = sec.courses.some((c: any) => c.id === a.courseId);
      if (!exists) {
        sec.courses.push({
          id: a.courseId,
          code: a.courseCode,
          name: a.courseName,
          credits: a.credits || 3,
          assignmentId: a.id
        });
      }
    }

    // Convert Maps to nested Arrays
    return Array.from(deptMap.values()).map((d) => ({
      id: d.id,
      name: d.name,
      campusId: d.campusId,
      campusName: d.campusName,
      hodId: d.hodId,
      hodName: d.hodName,
      sections: Array.from(d.sections.values())
    }));
  },

  async create(assignment: any) {
    try {
      const { data, error } = await supabase.from('teacher_assignments').insert([assignment]).select().single();
      const created = (!error && data) ? data : assignment;
      if (!memoryStore.teacherAssignments) memoryStore.teacherAssignments = loadLocalTeacherAssignments();
      memoryStore.teacherAssignments.unshift(created);
      persistLocalTeacherAssignments(memoryStore.teacherAssignments);
      return created;
    } catch {
      if (!memoryStore.teacherAssignments) memoryStore.teacherAssignments = loadLocalTeacherAssignments();
      memoryStore.teacherAssignments.unshift(assignment);
      persistLocalTeacherAssignments(memoryStore.teacherAssignments);
      return assignment;
    }
  },

  async update(id: string, updates: any) {
    try {
      const { data, error } = await supabase.from('teacher_assignments').update(updates).eq('id', id).select().single();
      if (!memoryStore.teacherAssignments) memoryStore.teacherAssignments = loadLocalTeacherAssignments();
      const idx = memoryStore.teacherAssignments.findIndex((a: any) => a.id === id);
      const updated = (!error && data) ? data : { ...(idx !== -1 ? memoryStore.teacherAssignments[idx] : {}), ...updates };
      if (idx !== -1) memoryStore.teacherAssignments[idx] = updated;
      else memoryStore.teacherAssignments.push(updated);
      persistLocalTeacherAssignments(memoryStore.teacherAssignments);
      return updated;
    } catch {
      if (!memoryStore.teacherAssignments) memoryStore.teacherAssignments = loadLocalTeacherAssignments();
      const idx = memoryStore.teacherAssignments.findIndex((a: any) => a.id === id);
      if (idx !== -1) {
        memoryStore.teacherAssignments[idx] = { ...memoryStore.teacherAssignments[idx], ...updates };
        persistLocalTeacherAssignments(memoryStore.teacherAssignments);
        return memoryStore.teacherAssignments[idx];
      }
      return null;
    }
  },

  async delete(id: string) {
    try {
      await supabase.from('teacher_assignments').delete().eq('id', id);
    } catch {}
    if (!memoryStore.teacherAssignments) memoryStore.teacherAssignments = loadLocalTeacherAssignments();
    memoryStore.teacherAssignments = memoryStore.teacherAssignments.filter((a: any) => a.id !== id);
    persistLocalTeacherAssignments(memoryStore.teacherAssignments);
    return true;
  }
};

