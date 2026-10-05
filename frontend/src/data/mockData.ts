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

// University of Education Campuses
export const INITIAL_CAMPUSES: Campus[] = [
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
    name: 'Main Campus (Lahore)',
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
  },
  {
    id: 'camp-faisalabad',
    code: 'UE-FSD',
    name: 'Faisalabad Campus',
    city: 'Faisalabad',
    address: 'Satyana Road, Faisalabad',
    directorName: 'Prof. Dr. Noman Khan',
    status: 'Active'
  },
  {
    id: 'camp-bank-road',
    code: 'UE-BR',
    name: 'Bank Road Campus (Lahore)',
    city: 'Lahore',
    address: 'Bank Road, Lahore',
    directorName: 'Prof. Dr. Aisha Begum',
    status: 'Active'
  }
];

// University Academic Departments
export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-cs',
    code: 'CS',
    name: 'Computer Science',
    campusId: 'camp-attock',
    campusName: 'Attock Campus',
    status: 'Active',
    hodId: 'usr-hod-cs',
    hodName: 'Dr. Sarah Ahmad',
    facultyCount: 14,
    courseCount: 18,
    submissionRate: 94,
    building: 'Academic Block A'
  },
  {
    id: 'dept-business-admin',
    code: 'BBA',
    name: 'Business Administration',
    campusId: 'camp-attock',
    campusName: 'Attock Campus',
    status: 'Active',
    hodId: 'usr-hod-business',
    hodName: 'Dr. Tariq Mahmood',
    facultyCount: 10,
    courseCount: 12,
    submissionRate: 88,
    building: 'Management Sciences Block'
  },
  {
    id: 'dept-math',
    code: 'MATH',
    name: 'Mathematics',
    campusId: 'camp-attock',
    campusName: 'Attock Campus',
    status: 'Active',
    hodId: 'usr-hod-math',
    hodName: 'Dr. Abu Zarr',
    facultyCount: 8,
    courseCount: 10,
    submissionRate: 91,
    building: 'Academic Block A'
  },
  {
    id: 'dept-it',
    code: 'IT',
    name: 'Information Technology',
    campusId: 'camp-main',
    campusName: 'Main Campus (Lahore)',
    status: 'Active',
    hodId: 'usr-hod-it',
    hodName: 'Dr. Asif Raza',
    facultyCount: 12,
    courseCount: 15,
    submissionRate: 90,
    building: 'IT Block'
  },
  {
    id: 'dept-eng',
    code: 'ENG',
    name: 'English',
    campusId: 'camp-attock',
    campusName: 'Attock Campus',
    status: 'Active',
    hodId: 'usr-hod-eng',
    hodName: 'Dr. Nadia Malik',
    facultyCount: 9,
    courseCount: 11,
    submissionRate: 85,
    building: 'Humanities Block'
  }
];

// Initial Core Users
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Administrator',
    email: 'admin@ue.edu.pk',
    role: 'ADMIN',
    departmentId: '',
    departmentName: 'Central Administration',
    campus: 'Main Campus (Lahore)',
    campusId: 'camp-main',
    campusName: 'Main Campus (Lahore)',
    designation: 'System Administrator',
    phone: '+92 300 1234567',
    status: 'Active',
    enrollmentStatus: 'Approved',
    profileFormSubmitted: true,
    createdAt: '2024-01-15'
  },
  {
    id: 'usr-hod-cs',
    name: 'Dr. Sarah Ahmad',
    email: 'hod.cs@ue.edu.pk',
    role: 'HOD',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    campus: 'Attock Campus',
    campusId: 'camp-attock',
    campusName: 'Attock Campus',
    designation: 'Head of Department (Computer Science)',
    phone: '+92 301 9876543',
    status: 'Active',
    enrollmentStatus: 'Approved',
    profileFormSubmitted: true,
    createdAt: '2024-02-01'
  },
  {
    id: 'usr-teacher-1',
    name: 'Dr. Tariq Mahmood',
    email: 'tariq.mahmood@ue.edu.pk',
    role: 'REGULAR_TEACHER',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    campus: 'Attock Campus',
    campusId: 'camp-attock',
    campusName: 'Attock Campus',
    designation: 'Assistant Professor',
    phone: '+92 321 4567890',
    status: 'Active',
    enrollmentStatus: 'Approved',
    profileFormSubmitted: true,
    totalCredits: 12,
    createdAt: '2024-03-10'
  }
];

// Initial Academic Courses
export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-pf-001',
    code: 'CS-101',
    title: 'Programming Fundamentals',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    credits: 3,
    type: 'Core',
    assignedTeacherId: 'usr-teacher-1',
    assignedTeacherName: 'Dr. Tariq Mahmood',
    assignedTeacherRole: 'REGULAR_TEACHER',
    semester: 'Semester 1',
    academicSession: 'Spring 2026',
    totalStudents: 45,
    status: 'Active'
  },
  {
    id: 'crs-oop-002',
    code: 'CS-102',
    title: 'Object Oriented Programming',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    credits: 3,
    type: 'Core',
    assignedTeacherId: 'usr-teacher-1',
    assignedTeacherName: 'Dr. Tariq Mahmood',
    assignedTeacherRole: 'REGULAR_TEACHER',
    semester: 'Semester 2',
    academicSession: 'Spring 2026',
    totalStudents: 40,
    status: 'Active'
  },
  {
    id: 'crs-dsa-003',
    code: 'CS-201',
    title: 'Data Structures & Algorithms',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    credits: 3,
    type: 'Core',
    semester: 'Semester 3',
    academicSession: 'Spring 2026',
    totalStudents: 42,
    status: 'Active'
  },
  {
    id: 'crs-db-004',
    code: 'CS-301',
    title: 'Database Systems',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    credits: 3,
    type: 'Core',
    semester: 'Semester 4',
    academicSession: 'Spring 2026',
    totalStudents: 38,
    status: 'Active'
  },
  {
    id: 'crs-math-005',
    code: 'MATH-101',
    title: 'Calculus & Analytical Geometry',
    departmentId: 'dept-math',
    departmentName: 'Mathematics',
    credits: 3,
    type: 'Core',
    semester: 'Semester 1',
    academicSession: 'Spring 2026',
    totalStudents: 50,
    status: 'Active'
  },
  {
    id: 'crs-bba-006',
    code: 'BBA-101',
    title: 'Introduction to Business Administration',
    departmentId: 'dept-business-admin',
    departmentName: 'Business Administration',
    credits: 3,
    type: 'Core',
    semester: 'Semester 1',
    academicSession: 'Spring 2026',
    totalStudents: 48,
    status: 'Active'
  }
];

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

// All course file data
export const INITIAL_COURSE_FILES: CourseFileItem[] = [];

// Official deadlines
export const INITIAL_DEADLINES: DeadlineItem[] = [
  {
    id: 'dln-1',
    title: 'Midterm Course File Submission',
    description: 'Submission of initial course files including Course Outline, Attendance, and Midterm Papers.',
    academicSession: 'Spring 2026',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    campusId: 'camp-attock',
    campusName: 'Attock Campus',
    dueDate: '2026-05-15',
    dueTime: '23:59',
    status: 'Upcoming',
    targetSemesters: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'],
    createdAt: '2026-02-01'
  },
  {
    id: 'dln-2',
    title: 'Final Term Comprehensive Course Dossier',
    description: 'Final submission including graded final exam sheets, CLO assessment, and lab reports.',
    academicSession: 'Spring 2026',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    campusId: 'camp-attock',
    campusName: 'Attock Campus',
    dueDate: '2026-07-20',
    dueTime: '23:59',
    status: 'Upcoming',
    targetSemesters: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'],
    createdAt: '2026-02-01'
  }
];

// Announcements
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Spring 2026 Course File Dossier Submission Active',
    content: 'All faculty members are notified that the official Course File submission window for Spring 2026 is now open. Please adhere to the 15 official University checklist headings.',
    targetRoles: ['ADMIN', 'HOD', 'REGULAR_TEACHER', 'VISITING_TEACHER'],
    priority: 'High',
    author: 'Prof. Dr. Muhammad Aslam (Dean)',
    date: '2026-02-15',
    isPinned: true
  }
];

// Notifications
export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-admin',
    title: 'System Initialized',
    message: 'Course File Management System (CFMS) is operating normally.',
    type: 'System',
    date: '2026-02-01',
    isRead: false
  }
];

// Academic Sessions
export const INITIAL_SESSIONS: AcademicSession[] = [
  {
    id: 'sess-sp26',
    name: 'Spring 2026',
    year: '2026',
    startDate: '2026-02-01',
    endDate: '2026-07-31',
    isCurrent: true,
    fileCount: 24,
    status: 'Active'
  },
  {
    id: 'sess-fa25',
    name: 'Fall 2025',
    year: '2025',
    startDate: '2025-09-01',
    endDate: '2026-01-31',
    isCurrent: false,
    fileCount: 42,
    status: 'Completed'
  }
];

// Submission Window
export const INITIAL_SUBMISSION_WINDOW: SubmissionWindow = {
  id: 'win-current',
  sessionId: 'sess-sp26',
  sessionName: 'Spring 2026',
  startDate: '2026-02-01',
  endDate: '2026-07-31',
  status: 'Submission Open',
  allowLateSubmission: true
};

// Activity logs
export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

// Audit logs
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

// Feedback
export const INITIAL_FEEDBACK: FeedbackItem[] = [];

// System settings
export const INITIAL_SYSTEM_SETTINGS: SystemSetting = {
  systemName: 'University Course File Management System (CFMS)',
  universityName: 'University of Education',
  academicYear: '2025-2026',
  currentSession: 'Spring 2026',
  mfaRequired: false,
  maxFileSizeMB: 50,
  allowedExtensions: ['.pdf', '.docx', '.ppt', '.pptx', '.zip', '.xlsx'],
  smtpHost: 'smtp.ue.edu.pk',
  smtpStatus: 'Active',
  autoArchivingDays: 180,
  maintenanceMode: false
};

// HOD Assignments
export const INITIAL_HOD_ASSIGNMENTS: HODAssignment[] = [
  {
    id: 'asgn-cs',
    hodId: 'usr-hod-cs',
    hodName: 'Dr. Sarah Ahmad',
    hodEmail: 'hod.cs@ue.edu.pk',
    departmentId: 'dept-cs',
    departmentName: 'Computer Science',
    campusId: 'camp-attock',
    campusName: 'Attock Campus',
    assignedDate: '2024-02-01',
    status: 'Active'
  },
  {
    id: 'asgn-bba',
    hodId: 'usr-hod-business',
    hodName: 'Dr. Tariq Mahmood',
    hodEmail: 'hod.bba@ue.edu.pk',
    departmentId: 'dept-business-admin',
    departmentName: 'Business Administration',
    campusId: 'camp-attock',
    campusName: 'Attock Campus',
    assignedDate: '2024-02-01',
    status: 'Active'
  },
  {
    id: 'asgn-math',
    hodId: 'usr-hod-math',
    hodName: 'Dr. Abu Zarr',
    hodEmail: 'hod.math@ue.edu.pk',
    departmentId: 'dept-math',
    departmentName: 'Mathematics',
    campusId: 'camp-attock',
    campusName: 'Attock Campus',
    assignedDate: '2024-02-01',
    status: 'Active'
  }
];
