import {
  User,
  Department,
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
  SubmissionWindow
} from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    code: 'CS',
    name: 'Department of Computer Science',
    hodId: 'usr-hod-cs',
    hodName: 'Dr. Sarah Ahmad',
    facultyCount: 24,
    courseCount: 38,
    submissionRate: 94.5,
    building: 'Block A, 3rd Floor'
  },
  {
    id: 'dept-2',
    code: 'SE',
    name: 'Department of Software Engineering',
    hodId: 'user-6',
    hodName: 'Dr. Tariq Mahmood',
    facultyCount: 18,
    courseCount: 26,
    submissionRate: 91.2,
    building: 'Block B, 2nd Floor'
  },
  {
    id: 'dept-3',
    code: 'EE',
    name: 'Department of Electrical Engineering',
    hodId: 'user-7',
    hodName: 'Dr. Ayesha Malik',
    facultyCount: 20,
    courseCount: 30,
    submissionRate: 88.0,
    building: 'Engineering Complex, 1st Floor'
  },
  {
    id: 'dept-4',
    code: 'BBA',
    name: 'Department of Business Administration',
    hodId: 'user-8',
    hodName: 'Dr. Bilal Ahmed',
    facultyCount: 15,
    courseCount: 22,
    submissionRate: 96.0,
    building: 'Management Block, 4th Floor'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Prof. Dr. Muhammad Aslam',
    email: 'admin@ue.edu.pk',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'ADMIN',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    designation: 'Chief System Administrator & Dean of IT',
    phone: '+92 300 1234567',
    status: 'Active',
    createdAt: '2024-01-15',
    lastLogin: '2026-09-25 09:14 AM'
  },
  {
    id: 'usr-hod-cs',
    name: 'Dr. Sarah Ahmad',
    email: 'hod.cs@ue.edu.pk',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    role: 'HOD',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    designation: 'Head of Department & Professor',
    phone: '+92 301 9876543',
    status: 'Active',
    createdAt: '2024-02-01',
    lastLogin: '2026-09-25 08:30 AM'
  },
  {
    id: 'usr-teacher-1',
    name: 'Dr. Tariq Mahmood',
    email: 'tariq.mahmood@ue.edu.pk',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'REGULAR_TEACHER',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    designation: 'Associate Professor',
    phone: '+92 321 4567890',
    status: 'Active',
    createdAt: '2024-03-10',
    lastLogin: '2026-09-25 04:15 PM'
  },
  {
    id: 'usr-visiting-1',
    name: 'Engr. Bilal Khan',
    email: 'bilal.visiting@ue.edu.pk',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'VISITING_TEACHER',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    designation: 'Visiting Lecturer & Industry Specialist',
    phone: '+92 333 7890123',
    status: 'Active',
    createdAt: '2025-08-25',
    lastLogin: '2026-09-25 06:45 PM',
    contractStartDate: '2025-09-01',
    contractEndDate: '2026-08-31',
    contractStatus: 'Active',
    supervisorName: 'Dr. Sarah Ahmad'
  },
  {
    id: 'user-1',
    name: 'Dr. Robert Sterling',
    email: 'admin.sterling@university.edu',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'ADMIN',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    designation: 'Chief System Administrator & Dean of IT',
    phone: '+1 (555) 019-2831',
    status: 'Active',
    createdAt: '2023-01-15',
    lastLogin: '2026-07-23 09:14 AM'
  },
  {
    id: 'user-2',
    name: 'Dr. Sarah Khan',
    email: 'hod.cs@university.edu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    role: 'HOD',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    designation: 'Head of Department & Professor',
    phone: '+1 (555) 018-9922',
    status: 'Active',
    createdAt: '2023-02-10',
    lastLogin: '2026-07-23 08:30 AM'
  },
  {
    id: 'user-3',
    name: 'Prof. Ahmad Raza',
    email: 'ahmad.raza@university.edu',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'REGULAR_TEACHER',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    designation: 'Associate Professor',
    phone: '+1 (555) 014-5511',
    status: 'Active',
    createdAt: '2023-08-20',
    lastLogin: '2026-07-22 04:15 PM'
  },
  {
    id: 'user-4',
    name: 'Alex Vance',
    email: 'alex.vance@university.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'VISITING_TEACHER',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    designation: 'Adjunct Industry Specialist',
    phone: '+1 (555) 017-3344',
    status: 'Active',
    createdAt: '2026-01-10',
    lastLogin: '2026-07-22 06:45 PM',
    contractStartDate: '2026-02-01',
    contractEndDate: '2026-08-31',
    contractStatus: 'Active',
    supervisorName: 'Dr. Sarah Khan'
  },
  {
    id: 'user-5',
    name: 'Elena Rostova',
    email: 'elena.rostova@university.edu',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    role: 'VISITING_TEACHER',
    departmentId: 'dept-2',
    departmentName: 'Department of Software Engineering',
    designation: 'Visiting Senior Lecturer',
    phone: '+1 (555) 012-7788',
    status: 'Active',
    createdAt: '2025-09-01',
    lastLogin: '2026-07-20 11:10 AM',
    contractStartDate: '2025-09-01',
    contractEndDate: '2026-05-31',
    contractStatus: 'Expired',
    supervisorName: 'Dr. Tariq Mahmood'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-101',
    code: 'CS-101',
    title: 'Introduction to Computer Programming',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    credits: 3,
    type: 'Core',
    assignedTeacherId: 'usr-teacher-1',
    assignedTeacherName: 'Dr. Tariq Mahmood',
    assignedTeacherRole: 'REGULAR_TEACHER',
    semester: '1st Semester',
    academicSession: 'Spring 2026',
    totalStudents: 65,
    status: 'Active'
  },
  {
    id: 'course-101L',
    code: 'CS-101L',
    title: 'Computer Programming Lab',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    credits: 2,
    type: 'Lab',
    assignedTeacherId: '',
    assignedTeacherName: 'Unassigned',
    assignedTeacherRole: 'VISITING_TEACHER',
    semester: '1st Semester',
    academicSession: 'Spring 2026',
    totalStudents: 60,
    status: 'Active'
  },
  {
    id: 'course-201',
    code: 'CS-201',
    title: 'Data Structures & Algorithms',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    credits: 4,
    type: 'Core',
    assignedTeacherId: 'usr-teacher-1',
    assignedTeacherName: 'Dr. Tariq Mahmood',
    assignedTeacherRole: 'REGULAR_TEACHER',
    semester: '3rd Semester',
    academicSession: 'Spring 2026',
    totalStudents: 58,
    status: 'Active'
  },
  {
    id: 'course-201L',
    code: 'CS-201L',
    title: 'Data Structures Lab',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    credits: 2,
    type: 'Lab',
    assignedTeacherId: '',
    assignedTeacherName: 'Unassigned',
    assignedTeacherRole: 'VISITING_TEACHER',
    semester: '3rd Semester',
    academicSession: 'Spring 2026',
    totalStudents: 55,
    status: 'Active'
  },
  {
    id: 'course-302',
    code: 'CS-302',
    title: 'Database Management Systems',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    credits: 4,
    type: 'Core',
    assignedTeacherId: 'usr-visiting-1',
    assignedTeacherName: 'Engr. Bilal Khan',
    assignedTeacherRole: 'VISITING_TEACHER',
    semester: '5th Semester',
    academicSession: 'Spring 2026',
    totalStudents: 52,
    status: 'Active'
  },
  {
    id: 'course-302L',
    code: 'CS-302L',
    title: 'Database Systems Lab',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    credits: 2,
    type: 'Lab',
    assignedTeacherId: '',
    assignedTeacherName: 'Unassigned',
    assignedTeacherRole: 'VISITING_TEACHER',
    semester: '5th Semester',
    academicSession: 'Spring 2026',
    totalStudents: 50,
    status: 'Active'
  },
  {
    id: 'course-401',
    code: 'CS-401',
    title: 'Advanced Software Engineering',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    credits: 3,
    type: 'Core',
    assignedTeacherId: 'usr-teacher-1',
    assignedTeacherName: 'Dr. Tariq Mahmood',
    assignedTeacherRole: 'REGULAR_TEACHER',
    semester: '7th Semester',
    academicSession: 'Spring 2026',
    totalStudents: 45,
    status: 'Active'
  },
  {
    id: 'course-405',
    code: 'CS-405',
    title: 'Computer Networks & Security',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    credits: 4,
    type: 'Core',
    assignedTeacherId: '',
    assignedTeacherName: 'Unassigned',
    assignedTeacherRole: 'REGULAR_TEACHER',
    semester: '6th Semester',
    academicSession: 'Spring 2026',
    totalStudents: 48,
    status: 'Active'
  },
  {
    id: 'course-305',
    code: 'CS-305',
    title: 'Cloud Computing & Distributed Systems',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    credits: 3,
    type: 'Elective',
    assignedTeacherId: 'usr-visiting-1',
    assignedTeacherName: 'Engr. Bilal Khan',
    assignedTeacherRole: 'VISITING_TEACHER',
    semester: '6th Semester',
    academicSession: 'Spring 2026',
    totalStudents: 42,
    status: 'Active'
  },
  {
    id: 'course-402',
    code: 'SE-402',
    title: 'Software Quality Assurance & Testing',
    departmentId: 'dept-2',
    departmentName: 'Department of Software Engineering',
    credits: 3,
    type: 'Core',
    assignedTeacherId: 'user-5',
    assignedTeacherName: 'Elena Rostova',
    assignedTeacherRole: 'VISITING_TEACHER',
    semester: '7th Semester',
    academicSession: 'Spring 2026',
    totalStudents: 38,
    status: 'Active'
  }
];

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

export const INITIAL_COURSE_FILES: CourseFileItem[] = [
  {
    id: 'file-101',
    courseId: 'course-101',
    courseCode: 'CS-101',
    courseTitle: 'Introduction to Computer Programming',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    teacherId: 'user-3',
    teacherName: 'Prof. Ahmad Raza',
    teacherRole: 'REGULAR_TEACHER',
    title: 'CS-101 Complete Course File (Spring 2026)',
    category: 'Syllabus & Course Outline',
    currentVersion: 'v2.0',
    fileType: 'ZIP',
    fileSize: '18.4 MB',
    fileUrl: '#',
    status: 'Approved',
    uploadDate: '2026-06-15',
    lastModified: '2026-06-20',
    archived: false,
    deleted: false,
    remarks: 'Complete Course File reviewed and approved by HOD. All 10 mandatory sections, exam papers, solutions, attendance, and CLO mapping are verified.',
    versionHistory: [
      {
        id: 'ver-101-1',
        versionNumber: 'v1.0',
        fileName: 'CS101_Complete_CourseFile_Draft_v1.zip',
        fileSize: '17.2 MB',
        uploadedBy: 'Prof. Ahmad Raza',
        uploadedByRole: 'REGULAR_TEACHER',
        uploadedAt: '2026-06-15 10:15 AM',
        changeLog: 'Initial submission of complete course file for Spring 2026.',
        fileUrl: '#'
      },
      {
        id: 'ver-101-2',
        versionNumber: 'v2.0',
        fileName: 'CS101_Complete_CourseFile_Spring2026_v2.zip',
        fileSize: '18.4 MB',
        uploadedBy: 'Prof. Ahmad Raza',
        uploadedByRole: 'REGULAR_TEACHER',
        uploadedAt: '2026-06-20 02:30 PM',
        changeLog: 'Updated final exam solution key and added missing student sample answer sheets per HOD review.',
        fileUrl: '#'
      }
    ]
  },
  {
    id: 'file-201',
    courseId: 'course-201',
    courseCode: 'CS-201',
    courseTitle: 'Data Structures & Algorithms',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    teacherId: 'user-3',
    teacherName: 'Prof. Ahmad Raza',
    teacherRole: 'REGULAR_TEACHER',
    title: 'CS-201 Complete Course File (Spring 2026)',
    category: 'Syllabus & Course Outline',
    currentVersion: 'v1.0',
    fileType: 'ZIP',
    fileSize: '22.8 MB',
    fileUrl: '#',
    status: 'Submitted',
    uploadDate: '2026-07-02',
    lastModified: '2026-07-02',
    archived: false,
    deleted: false,
    approvalStage: 'Awaiting HOD Review',
    versionHistory: [
      {
        id: 'ver-201-1',
        versionNumber: 'v1.0',
        fileName: 'CS201_Complete_CourseFile_Spring2026.zip',
        fileSize: '22.8 MB',
        uploadedBy: 'Prof. Ahmad Raza',
        uploadedByRole: 'REGULAR_TEACHER',
        uploadedAt: '2026-07-02 11:00 AM',
        changeLog: 'Submitted complete compiled course file including all exams, assignments, quizzes, and CLO result analysis.',
        fileUrl: '#'
      }
    ]
  },
  {
    id: 'file-305',
    courseId: 'course-305',
    courseCode: 'CS-305',
    courseTitle: 'Cloud Computing & Distributed Systems',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    teacherId: 'user-4',
    teacherName: 'Alex Vance',
    teacherRole: 'VISITING_TEACHER',
    title: 'CS-305 Complete Course File (Spring 2026)',
    category: 'Syllabus & Course Outline',
    currentVersion: 'v1.0',
    fileType: 'ZIP',
    fileSize: '29.5 MB',
    fileUrl: '#',
    status: 'Revision Requested',
    uploadDate: '2026-07-08',
    lastModified: '2026-07-10',
    archived: false,
    deleted: false,
    remarks: 'Returned for revision: Please include the signed student attendance roster and midterm step-marking key in Section 4.',
    versionHistory: [
      {
        id: 'ver-305-1',
        versionNumber: 'v1.0',
        fileName: 'CS305_Complete_CourseFile_Spring2026.zip',
        fileSize: '29.5 MB',
        uploadedBy: 'Alex Vance',
        uploadedByRole: 'VISITING_TEACHER',
        uploadedAt: '2026-07-08 04:20 PM',
        changeLog: 'Initial upload of complete course file package.',
        fileUrl: '#'
      }
    ]
  },
  {
    id: 'file-301',
    courseId: 'course-301',
    courseCode: 'CS-301',
    courseTitle: 'Database Systems',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    teacherId: 'user-2',
    teacherName: 'Dr. Sarah Khan',
    teacherRole: 'HOD',
    title: 'CS-301 Complete Course File (Spring 2026)',
    category: 'Syllabus & Course Outline',
    currentVersion: 'v1.0',
    fileType: 'ZIP',
    fileSize: '25.1 MB',
    fileUrl: '#',
    status: 'Approved',
    uploadDate: '2026-06-18',
    lastModified: '2026-06-18',
    archived: false,
    deleted: false,
    remarks: 'Verified and archived for accreditation.',
    versionHistory: [
      {
        id: 'ver-301-1',
        versionNumber: 'v1.0',
        fileName: 'CS301_Complete_CourseFile_Spring2026.zip',
        fileSize: '25.1 MB',
        uploadedBy: 'Dr. Sarah Khan',
        uploadedByRole: 'HOD',
        uploadedAt: '2026-06-18 09:30 AM',
        changeLog: 'Complete course file compiled and uploaded.',
        fileUrl: '#'
      }
    ]
  },
  {
    id: 'file-402',
    courseId: 'course-402',
    courseCode: 'SE-402',
    courseTitle: 'Software Quality Assurance & Testing',
    departmentId: 'dept-2',
    departmentName: 'Department of Software Engineering',
    teacherId: 'user-5',
    teacherName: 'Elena Rostova',
    teacherRole: 'VISITING_TEACHER',
    title: 'SE-402 Complete Course File (Fall 2025)',
    category: 'Syllabus & Course Outline',
    currentVersion: 'v1.0',
    fileType: 'ZIP',
    fileSize: '31.2 MB',
    fileUrl: '#',
    status: 'Approved',
    uploadDate: '2025-12-10',
    lastModified: '2025-12-12',
    archived: true,
    deleted: false,
    remarks: 'Archived from Fall 2025 session.',
    versionHistory: [
      {
        id: 'ver-402-1',
        versionNumber: 'v1.0',
        fileName: 'SE402_Complete_CourseFile_Fall2025.zip',
        fileSize: '31.2 MB',
        uploadedBy: 'Elena Rostova',
        uploadedByRole: 'VISITING_TEACHER',
        uploadedAt: '2025-12-10 09:00 AM',
        changeLog: 'Fall 2025 Complete Course File uploaded.',
        fileUrl: '#'
      }
    ]
  }
];

export const INITIAL_DEADLINES: DeadlineItem[] = [
  {
    id: 'dl-1',
    title: 'Submit Course Syllabus & CLO Matrix',
    courseCode: 'ALL',
    category: 'Syllabus & Course Outline',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    dueDate: '2026-08-05',
    gracePeriodDays: 3,
    status: 'Upcoming',
    description: 'Mandatory course outline and assessment rubric upload for all Spring 2026 offerings.',
    targetRole: 'ALL'
  },
  {
    id: 'dl-2',
    title: 'Midterm Examination Papers & Keys',
    courseCode: 'CS-201',
    category: 'Midterm Examination',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    dueDate: '2026-08-15',
    gracePeriodDays: 2,
    status: 'Upcoming',
    description: 'HOD approval required prior to midterm printing window.',
    targetRole: 'REGULAR_TEACHER'
  },
  {
    id: 'dl-3',
    title: 'Visiting Faculty Lab Manuals & Code Repos',
    courseCode: 'CS-305',
    category: 'Lab Manual & Reports',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    dueDate: '2026-07-28',
    gracePeriodDays: 1,
    status: 'Upcoming',
    description: 'Industry project rubrics for adjunct courses.',
    targetRole: 'VISITING_TEACHER'
  },
  {
    id: 'dl-4',
    title: 'Final Grade Sheet & Attendance Upload',
    courseCode: 'ALL',
    category: 'Grade Sheet & Result',
    departmentId: 'dept-1',
    departmentName: 'Department of Computer Science',
    dueDate: '2026-06-30',
    gracePeriodDays: 0,
    status: 'Missed',
    description: 'Past due deadline flag logged for compliance records.'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-1',
    title: 'University Quality Assurance & QEC End-of-Term Audit Schedule',
    content: 'The Quality Enhancement Cell (QEC) will conduct formal course file reviews starting August 10th. All faculty must complete pending submissions.',
    authorName: 'Dr. Robert Sterling',
    authorRole: 'ADMIN',
    targetDepartmentId: 'ALL',
    targetRole: 'ALL',
    createdDate: '2026-07-20',
    status: 'Published',
    priority: 'High',
    isPinned: true
  },
  {
    id: 'anc-2',
    title: 'CS Department HOD Notice: Revision Request SLA',
    content: 'Resubmissions following revision requests must be uploaded within 72 hours to ensure timely grade clearance.',
    authorName: 'Dr. Sarah Khan',
    authorRole: 'HOD',
    targetDepartmentId: 'dept-1',
    targetRole: 'ALL',
    createdDate: '2026-07-21',
    status: 'Published',
    priority: 'Medium',
    isPinned: false
  },
  {
    id: 'anc-3',
    title: 'Contract Renewal Deadline for Visiting Faculty',
    content: 'Visiting faculty whose contracts expire in August must submit their end-of-term compliance forms to the HOD office.',
    authorName: 'Dr. Robert Sterling',
    authorRole: 'ADMIN',
    targetDepartmentId: 'ALL',
    targetRole: 'VISITING_TEACHER',
    createdDate: '2026-07-18',
    status: 'Published',
    priority: 'Urgent',
    isPinned: true
  },
  {
    id: 'anc-4',
    title: 'Upcoming: Fall 2026 Course Catalog & Allocation Broadcast',
    content: 'Scheduled broadcast for faculty course assignments and teaching load distribution for the upcoming Fall 2026 semester.',
    authorName: 'Dr. Robert Sterling',
    authorRole: 'ADMIN',
    targetDepartmentId: 'ALL',
    targetRole: 'ALL',
    createdDate: '2026-07-24',
    scheduledDate: '2026-08-01',
    status: 'Scheduled',
    priority: 'High',
    isPinned: false
  },
  {
    id: 'anc-5',
    title: 'Upcoming: Visiting Faculty Annual Performance Review',
    content: 'Scheduled evaluation notice for adjunct and visiting professors regarding course file ratings and contract extensions.',
    authorName: 'Dr. Sarah Khan',
    authorRole: 'HOD',
    targetDepartmentId: 'dept-1',
    targetRole: 'VISITING_TEACHER',
    createdDate: '2026-07-24',
    scheduledDate: '2026-08-15',
    status: 'Scheduled',
    priority: 'Urgent',
    isPinned: true
  },
  {
    id: 'anc-6',
    title: 'Archived: Fall 2025 Midterm Grade Submissions',
    content: 'Historical notice regarding Fall 2025 midterm grade entry deadline.',
    authorName: 'Dr. Robert Sterling',
    authorRole: 'ADMIN',
    targetDepartmentId: 'ALL',
    targetRole: 'ALL',
    createdDate: '2025-10-15',
    status: 'Archived',
    priority: 'Low',
    isPinned: false
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    title: 'Revision Requested on CS-305 Lab Manual',
    message: 'Dr. Sarah Khan requested revisions on "Kubernetes & Docker Lab Manual v1". Please check remarks.',
    type: 'warning',
    timestamp: '10 minutes ago',
    isRead: false,
    targetRole: 'VISITING_TEACHER',
    linkModule: 'Course File Management'
  },
  {
    id: 'notif-2',
    title: 'New File Awaiting HOD Approval',
    message: 'Prof. Ahmad Raza uploaded Midterm Question Paper for CS-201.',
    type: 'info',
    timestamp: '1 hour ago',
    isRead: false,
    targetRole: 'HOD',
    linkModule: 'Approval Management'
  },
  {
    id: 'notif-3',
    title: 'Email Dispatch: QEC Audit Announcement Broadcast',
    message: 'Official email broadcast sent to all Attock Campus faculty members regarding Spring 2026 Quality Audit.',
    type: 'email',
    timestamp: '2 hours ago',
    isRead: false,
    targetRole: 'ALL',
    linkModule: 'Announcements'
  },
  {
    id: 'notif-4',
    title: 'Email Dispatch: Password Reset Credentials Sent',
    message: 'Automated email dispatch containing password reset instructions delivered to teacher1@ue.edu.pk.',
    type: 'email',
    timestamp: '3 hours ago',
    isRead: true,
    targetRole: 'REGULAR_TEACHER',
    linkModule: 'User Management'
  },
  {
    id: 'notif-5',
    title: 'System Security Alert: Account Locked',
    message: 'System security policy locked account for visiting teacher due to semester contract expiration.',
    type: 'system',
    timestamp: 'Yesterday',
    isRead: false,
    targetRole: 'ADMIN',
    linkModule: 'Security Center'
  },
  {
    id: 'notif-6',
    title: 'System Alert: Submission Window Toggled',
    message: 'Administrator updated submission window status to "Submission Window Active" for Spring 2026 term.',
    type: 'system',
    timestamp: 'Yesterday',
    isRead: true,
    targetRole: 'ALL',
    linkModule: 'Academic Sessions'
  },
  {
    id: 'notif-7',
    title: 'Course File Approved & Archived',
    message: 'CS101 Complete Syllabus & Assessment Blueprint was approved by HOD and stored in QA archive.',
    type: 'success',
    timestamp: '2 days ago',
    isRead: true,
    targetRole: 'REGULAR_TEACHER',
    linkModule: 'Course Files'
  }
];

export const INITIAL_SESSIONS: AcademicSession[] = [
  {
    id: 'sess-1',
    name: 'Spring 2026',
    term: 'Spring',
    year: 2026,
    startDate: '2026-02-01',
    endDate: '2026-06-30',
    isCurrent: true,
    status: 'Active',
    fileCount: 412
  },
  {
    id: 'sess-2',
    name: 'Fall 2025',
    term: 'Fall',
    year: 2025,
    startDate: '2025-09-01',
    endDate: '2025-01-20',
    isCurrent: false,
    status: 'Locked',
    fileCount: 890
  },
  {
    id: 'sess-3',
    name: 'Spring 2025',
    term: 'Spring',
    year: 2025,
    startDate: '2025-02-01',
    endDate: '2025-06-30',
    isCurrent: false,
    status: 'Archived',
    fileCount: 820
  }
];

export const INITIAL_SUBMISSION_WINDOW: SubmissionWindow = {
  id: 'sub-win-spring-2026',
  sessionId: 'sess-1',
  sessionName: 'Spring 2026',
  startDate: '2026-06-01',
  endDate: '2026-06-30',
  status: 'Submission Window Active',
  allowLateSubmission: true
};

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-1',
    userId: 'user-3',
    userName: 'Prof. Ahmad Raza',
    userRole: 'REGULAR_TEACHER',
    action: 'UPLOAD_FILE',
    module: 'Course File Management',
    details: 'Uploaded CS201_Midterm_Paper_Solutions.pdf (v1.1)',
    timestamp: '2026-07-24 09:10:22',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'act-2',
    userId: 'user-2',
    userName: 'Dr. Sarah Khan',
    userRole: 'HOD',
    action: 'APPROVE_COURSE_FILE',
    module: 'Approval Management',
    details: 'Approved CS-101 Complete Syllabus & Assessment Blueprint',
    timestamp: '2026-07-24 08:50:15',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'act-3',
    userId: 'user-2',
    userName: 'Dr. Sarah Khan',
    userRole: 'HOD',
    action: 'REQUEST_REVISION',
    module: 'Approval Management',
    details: 'Requested revision on CS-305 Lab Manual for Alex Vance',
    timestamp: '2026-07-23 08:45:10',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'act-4',
    userId: 'user-1',
    userName: 'Dr. Robert Sterling',
    userRole: 'ADMIN',
    action: 'CREATE_USER_ACCOUNT',
    module: 'User Management',
    details: 'Created user account for Dr. Ahmad Farooq (EMP-2026-999)',
    timestamp: '2026-07-23 07:15:00',
    ipAddress: '192.168.1.1'
  },
  {
    id: 'act-5',
    userId: 'user-3',
    userName: 'Prof. Ahmad Raza',
    userRole: 'REGULAR_TEACHER',
    action: 'USER_LOGIN_SUCCESS',
    module: 'Authentication',
    details: 'User logged in successfully via web browser interface',
    timestamp: '2026-07-24 08:00:12',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'act-6',
    userId: 'user-5',
    userName: 'Elena Rostova',
    userRole: 'VISITING_TEACHER',
    action: 'LOCK_USER_ACCOUNT',
    module: 'User Management',
    details: 'Account status updated to LOCKED due to contract expiration',
    timestamp: '2026-07-22 14:30:00',
    ipAddress: '192.168.1.1'
  },
  {
    id: 'act-7',
    userId: 'user-4',
    userName: 'Alex Vance',
    userRole: 'VISITING_TEACHER',
    action: 'SUBMIT_FILE_VERSION',
    module: 'Course File Management',
    details: 'Submitted CS305_Docker_Lab_Manual_v2.pdf for HOD re-approval',
    timestamp: '2026-07-22 11:20:45',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'act-8',
    userId: 'user-1',
    userName: 'Dr. Robert Sterling',
    userRole: 'ADMIN',
    action: 'USER_LOGOUT',
    module: 'Authentication',
    details: 'Administrator logged out cleanly',
    timestamp: '2026-07-21 18:00:00',
    ipAddress: '192.168.1.1'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-101',
    timestamp: '2026-07-24T08:50:15Z',
    eventType: 'APPROVAL_DECISION_VERIFIED',
    actor: 'Dr. Sarah Khan',
    role: 'HOD',
    resource: 'ApprovalQueue:CS-101',
    status: 'SUCCESS',
    severity: 'INFO',
    signature: 'sha256-e9a823b19283fcc8271a091829381'
  },
  {
    id: 'aud-102',
    timestamp: '2026-07-23T08:45:10Z',
    eventType: 'REVISION_REQUESTED_STAMP',
    actor: 'Dr. Sarah Khan',
    role: 'HOD',
    resource: 'ApprovalQueue:CS-305',
    status: 'WARNING',
    severity: 'MEDIUM',
    signature: 'sha256-b918239019283019283a019283'
  },
  {
    id: 'aud-103',
    timestamp: '2026-07-24T08:00:12Z',
    eventType: 'HOD_DIGITAL_SIGNATURE_APPLIED',
    actor: 'Dr. Sarah Khan',
    role: 'HOD',
    resource: 'CourseFile:CS-101',
    status: 'SUCCESS',
    severity: 'INFO',
    signature: 'sha256-f910293019283019283a90129'
  },
  {
    id: 'aud-104',
    timestamp: '2026-07-23T09:10:22Z',
    eventType: 'FILE_CHECKSUM_VALIDATED',
    actor: 'Prof. Ahmad Raza',
    role: 'REGULAR_TEACHER',
    resource: 'StorageBucket:CS201_Midterm.pdf',
    status: 'SUCCESS',
    severity: 'INFO',
    signature: 'sha256-81723f9a1288219c001a91829'
  },
  {
    id: 'aud-105',
    timestamp: '2026-07-22T14:00:00Z',
    eventType: 'CONTRACT_EXPIRY_SWEEP',
    actor: 'SYSTEM_CRON',
    role: 'ADMIN',
    resource: 'UserAccount:user-5',
    status: 'WARNING',
    severity: 'MEDIUM',
    signature: 'sha256-4411aa99010202029ff901928'
  },
  {
    id: 'aud-106',
    timestamp: '2026-07-23T07:15:00Z',
    eventType: 'USER_ACCOUNT_PROVISIONED',
    actor: 'Dr. Robert Sterling',
    role: 'ADMIN',
    resource: 'UserAccount:user-999',
    status: 'SUCCESS',
    severity: 'INFO',
    signature: 'sha256-cc91029381029381029381920'
  }
];

export const INITIAL_FEEDBACK: FeedbackItem[] = [
  {
    id: 'fb-1',
    senderId: 'user-3',
    senderName: 'Prof. Ahmad Raza',
    senderRole: 'REGULAR_TEACHER',
    departmentName: 'Department of Computer Science',
    subject: 'Bulk Zip Upload for Past Exam Samples',
    message: 'Could we increase the max file upload size from 25MB to 50MB for scanned lab scripts?',
    status: 'In Progress',
    createdAt: '2026-07-19',
    response: 'IT department is reviewing server storage caps.'
  },
  {
    id: 'fb-2',
    senderId: 'user-4',
    senderName: 'Alex Vance',
    senderRole: 'VISITING_TEACHER',
    departmentName: 'Department of Computer Science',
    subject: 'Contract Date Extension Confirmation',
    message: 'Requesting clarification on final date for summer semester grade submissions.',
    status: 'Open',
    createdAt: '2026-07-22'
  }
];

export const INITIAL_SYSTEM_SETTINGS: SystemSetting = {
  systemName: 'University Course File Management System (CFMS)',
  universityName: 'Apex International University',
  academicYear: '2025 - 2026',
  currentSession: 'Spring 2026',
  mfaRequired: true,
  maxFileSizeMB: 50,
  allowedExtensions: ['.pdf', '.docx', '.ppt', '.pptx', '.zip', '.xlsx'],
  smtpHost: 'smtp.university.edu:587',
  smtpStatus: 'Connected',
  autoArchivingDays: 365,
  maintenanceMode: false
};
