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

export interface OfficialChecklistItem {
  srNo: number;
  id: string;
  name: string;
  content: string;
  description: string;
  isApplicableOnly?: boolean;
  mandatory: boolean;
}

export const OFFICIAL_COURSE_FILE_CHECKLIST: OfficialChecklistItem[] = [
  {
    srNo: 1,
    id: 'chk-1',
    name: 'Instructor CV',
    content: 'Instructor CV',
    description: 'Updated academic Curriculum Vitae of the assigned course instructor.',
    mandatory: true
  },
  {
    srNo: 2,
    id: 'chk-2',
    name: 'Course Outlines',
    content: 'Course Outlines',
    description: 'Approved official course outline, weekly lecture schedule, and reference textbooks.',
    mandatory: true
  },
  {
    srNo: 3,
    id: 'chk-3',
    name: 'Course Description Form ( Containing weekly course plan)',
    content: 'Course Description Form ( Containing weekly course plan)',
    description: 'Structured course description with weekly topic-wise breakdown and CLO alignments.',
    mandatory: true
  },
  {
    srNo: 4,
    id: 'chk-4',
    name: 'Attendance Record',
    content: 'Attendance Record',
    description: 'Complete student attendance sheet signed by the instructor.',
    mandatory: true
  },
  {
    srNo: 5,
    id: 'chk-5',
    name: 'Assignments(Copy of Assignment questions, its solution, sample of best, average, and worst graded quiz)',
    content: 'Assignments(Copy of Assignment questions, its solution, sample of best, average, and worst graded quiz)',
    description: 'All assignment question sheets, step-marking solution keys, and audited student samples (best, average, worst).',
    mandatory: true
  },
  {
    srNo: 6,
    id: 'chk-6',
    name: 'Quizzes (Copy of quiz questions, its solution, sample of best, average, and worst graded quiz)',
    content: 'Quizzes (Copy of quiz questions, its solution, sample of best, average, and worst graded quiz)',
    description: 'All quiz papers, marking keys, and graded samples across performance bands (best, average, worst).',
    mandatory: true
  },
  {
    srNo: 7,
    id: 'chk-7',
    name: 'Mid Term Paper (question paper ,its solution, photocopy of best, average, and worst answer sheets )',
    content: 'Mid Term Paper (question paper ,its solution, photocopy of best, average, and worst answer sheets )',
    description: 'Midterm exam question paper, standard solution key, and photocopies of best, average, worst answer sheets.',
    mandatory: true
  },
  {
    srNo: 8,
    id: 'chk-8',
    name: 'Final Term paper (question paper ,its solution, photocopy of best, average, and worst answer sheets )',
    content: 'Final Term paper (question paper ,its solution, photocopy of best, average, and worst answer sheets )',
    description: 'Terminal exam paper, official marking scheme, and photocopies of best, average, worst answer sheets.',
    mandatory: true
  },
  {
    srNo: 9,
    id: 'chk-9',
    name: 'Semester project (If applicable) (Best, worst, average)',
    content: 'Semester project (If applicable) (Best, worst, average)',
    description: 'Project statement, evaluation rubric, and audited project reports (best, average, worst) if applicable.',
    isApplicableOnly: true,
    mandatory: false
  },
  {
    srNo: 10,
    id: 'chk-10',
    name: 'Lab Manuals (If applicable) ( Lab Outline, Lab Manuals, with its solution in soft form )',
    content: 'Lab Manuals (If applicable) ( Lab Outline, Lab Manuals, with its solution in soft form )',
    description: 'Lab experiment outlines, structured laboratory manual, and solution code/sheets in soft form if course has lab.',
    isApplicableOnly: true,
    mandatory: false
  },
  {
    srNo: 11,
    id: 'chk-11',
    name: 'Lab Practical ( question paper, its solution, photocopy of best, average and worst answer sheet)',
    content: 'Lab Practical ( question paper, its solution, photocopy of best, average and worst answer sheet)',
    description: 'Practical exam paper, assessment rubric/solution, and photocopied student answer sheets if applicable.',
    isApplicableOnly: true,
    mandatory: false
  },
  {
    srNo: 12,
    id: 'chk-12',
    name: 'Lecture Notes ( Only in soft form)',
    content: 'Lecture Notes ( Only in soft form)',
    description: 'Complete lecture slides, reading packages, or typed lecture notes in soft PDF format.',
    mandatory: true
  },
  {
    srNo: 13,
    id: 'chk-13',
    name: 'Complete Result',
    content: 'Complete Result',
    description: 'Final grade roster, award list, and overall mark distribution sheet.',
    mandatory: true
  },
  {
    srNo: 14,
    id: 'chk-14',
    name: 'Course Completion Certificate',
    content: 'Course Completion Certificate',
    description: 'Official signed Course Completion Certificate affirming curriculum coverage.',
    mandatory: true
  }
];

export const REQUIRED_DOCUMENT_CHECKLIST = OFFICIAL_COURSE_FILE_CHECKLIST;


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
