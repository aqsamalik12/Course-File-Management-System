export interface MemoryStore {
  campuses: any[];
  users: any[];
  departments: any[];
  courses: any[];
  programs: any[];
  deadlines: any[];
  announcements: any[];
  courseFiles: any[];
  sessions: any[];
  submissionWindow: any;
  templates: any[];
  instructions: any[];
  settings: any;
  auditLogs: any[];
  feedback: any[];
  archives: any[];
  notifications: any[];
  teacherRequests: any[];
  hodAssignments: any[];
  sections: any[];
  teacherAssignments: any[];
}

// ==================================================================================
// MEMORY STORE — Runtime-only in-memory fallback when Supabase is unreachable.
// This is NOT a source of truth. It starts empty and is populated from Supabase
// at startup. All fake/mock/dummy seed data has been removed.
// ==================================================================================
export const memoryStore: MemoryStore = {
  campuses: [],
  notifications: [],
  users: [
    // Only the essential admin account is kept as a critical fallback
    // so the admin can still log in if Supabase is temporarily unreachable.
    {
      id: 'usr-admin',
      name: 'Administrator',
      email: 'admin@ue.edu.pk',
      passwordHash: '$2a$10$wE99V.k88V/G8l/VbAknq.b0rOmszE9xN5/u9U1NZZYQ12x5qWf7K',
      role: 'ADMIN',
      departmentId: '',
      departmentName: '',
      campus: '',
      designation: 'System Administrator',
      phone: '',
      status: 'Active',
      createdAt: '2024-01-15',
      lastLogin: new Date().toISOString().split('T')[0],
      employeeId: 'EMP-ADMIN-001'
    }
  ],
  departments: [],
  courses: [],
  programs: [],
  deadlines: [],
  announcements: [],
  courseFiles: [],
  sessions: [],
  submissionWindow: {
    id: 'sub-window-default',
    sessionId: '',
    sessionName: 'No Active Session',
    startDate: '',
    endDate: '',
    status: 'Closed',
    allowLateSubmission: false
  },
  templates: [],
  instructions: [],
  settings: {
    systemName: 'University Course File Management System (CFMS)',
    universityName: 'University of Education',
    academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
    currentSession: '',
    mfaRequired: false,
    maxFileSizeMB: 50,
    allowedExtensions: ['.pdf', '.docx', '.zip', '.xlsx', '.ppt'],
    smtpHost: '',
    smtpStatus: 'Not Configured',
    autoArchivingDays: 180,
    maintenanceMode: false
  },
  auditLogs: [],
  feedback: [],
  archives: [],
  teacherRequests: [],
  hodAssignments: [],
  sections: [],
  teacherAssignments: []
};
