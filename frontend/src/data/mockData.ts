import {
  User,
  Department,
  Campus,
  Course,
  FileCategory,
  CourseFileItem,
  ApprovalRequest,
  DeadlineItem,
  AcademicSession,
  Announcement,
  SystemNotification,
  ActivityLog,
  AuditLog,
  FeedbackItem,
  SystemSetting,
  SubmissionWindow,
  HODAssignment
} from '../types';

// ==================================================================================
// ALL DYNAMIC DATA (campuses, departments, users, courses, course files, deadlines,
// announcements, notifications, sessions, audit logs, feedback, HOD assignments)
// IS LOADED FROM THE REAL BACKEND API — NOT from this file.
//
// This file ONLY contains:
// 1. Static configuration constants (REQUIRED_DOCUMENT_CHECKLIST, OFFICIAL_COURSE_FILE_TEMPLATES, INITIAL_CATEGORIES)
// 2. Empty array / clean-default exports (for backwards-compatible imports in context files)
// ==================================================================================

// All campus data is loaded from the real backend API. Do NOT add fake campuses here.
export const INITIAL_CAMPUSES: Campus[] = [];

// All department data is loaded from the real backend API.
export const INITIAL_DEPARTMENTS: Department[] = [];

// All user data is loaded from the real backend API.
export const INITIAL_USERS: User[] = [];

// All course data is loaded from the real backend API.
export const INITIAL_COURSES: Course[] = [];

// ==================================================================================
// STATIC CONFIGURATION — Required document checklist and official templates.
// These are legitimate static data that don't change based on DB state.
// ==================================================================================

export const REQUIRED_DOCUMENT_CHECKLIST = [
  { id: 'chk-1', name: 'Course Outline & Syllabus', description: 'Weekly breakdown, textbooks, grading criteria, policies', mandatory: true },
  { id: 'chk-2', name: 'Weekly Lecture Plan & Slides Summary', description: 'Lecture plan alignment with 16-week schedule', mandatory: true },
  { id: 'chk-3', name: 'Student Attendance Record', description: 'End-of-term attendance roster signed by teacher', mandatory: true },
  { id: 'chk-4', name: 'Midterm Examination Package', description: 'Question paper, step-by-step solution key, best/avg/worst answer scripts', mandatory: true },
  { id: 'chk-5', name: 'Final Examination Package', description: 'Final exam question paper, marking key, sample audited scripts', mandatory: true },
  { id: 'chk-6', name: 'Assignments & Solutions', description: 'All assignment question sheets, rubrics, and sample keys', mandatory: true },
  { id: 'chk-7', name: 'Quizzes & Solutions', description: 'Quiz papers and step-marking solution keys', mandatory: true },
  { id: 'chk-8', name: 'CLO / PLO Mapping & Alignment Matrix', description: 'Course learning outcome mapping with program learning outcomes', mandatory: true },
  { id: 'chk-9', name: 'Result Analysis & Grade Distribution Graph', description: 'Statistical grade analysis and pass/fail summary', mandatory: true },
  { id: 'chk-10', name: 'Student Work Samples', description: 'Audited samples of student work across grade bands', mandatory: true }
];

export const OFFICIAL_COURSE_FILE_TEMPLATES = [
  {
    id: 'tmpl-1',
    title: 'University of Education Official Complete Course File Package',
    format: 'ZIP',
    version: '2026.1',
    fileSize: '4.5 MB',
    updatedDate: '2026-01-10',
    description: 'Standardized folder layout containing cover pages, CLO/PLO forms, exam keys, and result sheets.',
    fileName: 'UOE_Complete_Course_File_Template_2026.zip'
  },
  {
    id: 'tmpl-2',
    title: 'Official Course File Cover Sheet & Table of Contents',
    format: 'DOCX',
    version: '2026.1',
    fileSize: '850 KB',
    updatedDate: '2026-01-10',
    description: 'Official university cover page template with document index checklist.',
    fileName: 'UOE_Course_File_Cover_Sheet.docx'
  },
  {
    id: 'tmpl-3',
    title: 'Course File Preparation & Submission Instructions',
    format: 'PDF',
    version: '2026.1',
    fileSize: '1.2 MB',
    updatedDate: '2026-01-10',
    description: 'Official HOD & QEC guidelines for compiling the complete course file.',
    fileName: 'CFMS_Submission_Guidelines.pdf'
  }
];

export const INITIAL_CATEGORIES: FileCategory[] = [
  {
    id: 'cat-1',
    name: 'Syllabus & Course Outline',
    description: 'Detailed course outline, weekly lecture schedule, grading policy, and reference textbooks.',
    isRequired: true,
    maxUploads: 1,
    allowedFormats: ['PDF', 'DOCX']
  },
  {
    id: 'cat-2',
    name: 'Lecture Notes & Slides',
    description: 'Weekly presentation slide decks and supplementary reading materials.',
    isRequired: true,
    maxUploads: 16,
    allowedFormats: ['PDF', 'PPT', 'ZIP']
  },
  {
    id: 'cat-3',
    name: 'Assignments & Solutions',
    description: 'Problem sets, coding tasks, rubric schemes, and sample solution keys.',
    isRequired: true,
    maxUploads: 8,
    allowedFormats: ['PDF', 'DOCX', 'ZIP']
  },
  {
    id: 'cat-4',
    name: 'Quizzes & Solutions',
    description: 'Surprise or announced short assessment question papers with step marking keys.',
    isRequired: true,
    maxUploads: 6,
    allowedFormats: ['PDF', 'DOCX']
  },
  {
    id: 'cat-5',
    name: 'Midterm Examination',
    description: 'Midterm question paper, key solution, sample answer sheets (best, average, worst).',
    isRequired: true,
    maxUploads: 4,
    allowedFormats: ['PDF', 'ZIP']
  },
  {
    id: 'cat-6',
    name: 'Final Examination',
    description: 'Comprehensive final exam paper, marking guide, and audited sample scripts.',
    isRequired: true,
    maxUploads: 4,
    allowedFormats: ['PDF', 'ZIP']
  },
  {
    id: 'cat-7',
    name: 'Lab Manual & Reports',
    description: 'Practical lab manuals, software environment guides, and student project rubrics.',
    isRequired: false,
    maxUploads: 12,
    allowedFormats: ['PDF', 'DOCX', 'ZIP']
  },
  {
    id: 'cat-8',
    name: 'Attendance Sheet',
    description: 'Official monthly and end-of-term student attendance percentage roster.',
    isRequired: true,
    maxUploads: 1,
    allowedFormats: ['PDF', 'XLSX']
  },
  {
    id: 'cat-9',
    name: 'Grade Sheet & Result',
    description: 'Consolidated result sheet with relative grading distribution graph.',
    isRequired: true,
    maxUploads: 1,
    allowedFormats: ['PDF', 'XLSX']
  },
  {
    id: 'cat-10',
    name: 'Course Feedback & Analysis',
    description: 'Student course evaluation summary, outcome assessment report (CLO/PLO alignment).',
    isRequired: true,
    maxUploads: 1,
    allowedFormats: ['PDF']
  }
];

// ==================================================================================
// EMPTY DEFAULT EXPORTS — All data below is loaded from the real backend API.
// These empty arrays/defaults are kept for backwards-compatible imports.
// ==================================================================================

// All course file data is loaded from the real backend API.
export const INITIAL_COURSE_FILES: CourseFileItem[] = [];

// All deadlines are loaded from the real backend API.
export const INITIAL_DEADLINES: DeadlineItem[] = [];

// All announcements are loaded from the real backend API.
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

// All notifications are loaded from the real backend API.
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

// All academic sessions are loaded from the real backend API.
export const INITIAL_SESSIONS: AcademicSession[] = [];

// Submission window is loaded from the backend API.
export const INITIAL_SUBMISSION_WINDOW: SubmissionWindow = {
  id: '',
  sessionId: '',
  sessionName: 'No Active Session',
  startDate: '',
  endDate: '',
  status: 'Submission Closed',
  allowLateSubmission: false
};

// All activity logs are loaded from the real backend API.
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

// All audit logs are loaded from the real backend API.
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// All feedback is loaded from the real backend API.
export const INITIAL_FEEDBACK: FeedbackItem[] = [];

// System settings are loaded from the real backend API. These are clean defaults.
export const INITIAL_SYSTEM_SETTINGS: SystemSetting = {
  systemName: 'University Course File Management System (CFMS)',
  universityName: 'University of Education',
  academicYear: '',
  currentSession: '',
  mfaRequired: false,
  maxFileSizeMB: 50,
  allowedExtensions: ['.pdf', '.docx', '.ppt', '.pptx', '.zip', '.xlsx'],
  smtpHost: '',
  smtpStatus: 'Error',
  autoArchivingDays: 180,
  maintenanceMode: false
};

// All HOD assignments are loaded from the real backend API.
export const INITIAL_HOD_ASSIGNMENTS: HODAssignment[] = [];
