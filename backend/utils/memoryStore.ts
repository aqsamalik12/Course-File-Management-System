export interface MemoryStore {
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
}

export const memoryStore: MemoryStore = {
  notifications: [
    {
      id: 'notif-1',
      title: 'Course Dossier Audit',
      message: 'Quality Assurance Committee audit for Fall 2025 starts next week.',
      type: 'info',
      timestamp: 'Today',
      isRead: false,
      targetRole: 'ALL'
    }
  ],
  users: [
    {
      id: 'usr-admin',
      name: 'Prof. Dr. Muhammad Aslam',
      email: 'admin@ue.edu.pk',
      role: 'ADMIN',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      designation: 'System Administrator & Dean',
      phone: '+92 300 1234567',
      status: 'Active',
      createdAt: '2024-01-15',
      lastLogin: new Date().toISOString().split('T')[0]
    },
    {
      id: 'usr-hod-cs',
      name: 'Dr. Sarah Ahmad',
      email: 'hod.cs@ue.edu.pk',
      role: 'HOD',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      designation: 'Head of Department (CS)',
      phone: '+92 301 9876543',
      status: 'Active',
      createdAt: '2024-02-01',
      lastLogin: new Date().toISOString().split('T')[0]
    },
    {
      id: 'usr-teacher-1',
      name: 'Dr. Tariq Mahmood',
      email: 'tariq.mahmood@ue.edu.pk',
      role: 'REGULAR_TEACHER',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      designation: 'Assistant Professor',
      phone: '+92 321 4567890',
      status: 'Active',
      createdAt: '2024-03-10',
      lastLogin: new Date().toISOString().split('T')[0]
    },
    {
      id: 'usr-visiting-1',
      name: 'Engr. Bilal Khan',
      email: 'bilal.visiting@ue.edu.pk',
      role: 'VISITING_TEACHER',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      designation: 'Visiting Lecturer',
      phone: '+92 333 7890123',
      status: 'Active',
      contractStartDate: '2025-09-01',
      contractEndDate: '2026-08-31',
      contractStatus: 'Active',
      supervisorName: 'Dr. Sarah Ahmad',
      createdAt: '2025-08-25',
      lastLogin: new Date().toISOString().split('T')[0]
    }
  ],
  departments: [
    {
      id: 'dept-cs',
      code: 'CS',
      name: 'Computer Science',
      hodId: 'usr-hod-cs',
      hodName: 'Dr. Sarah Ahmad',
      facultyCount: 18,
      courseCount: 42,
      submissionRate: 92,
      building: 'Academic Block A (IT Wing)'
    },
    {
      id: 'dept-math',
      code: 'MATH',
      name: 'Mathematics',
      hodId: 'usr-hod-math',
      hodName: 'Dr. Usman Ghani',
      facultyCount: 12,
      courseCount: 28,
      submissionRate: 88,
      building: 'Science Block B'
    },
    {
      id: 'dept-eng',
      code: 'ENG',
      name: 'English Literature',
      hodId: 'usr-hod-eng',
      hodName: 'Dr. Ayesha Malik',
      facultyCount: 10,
      courseCount: 22,
      submissionRate: 95,
      building: 'Humanities Block C'
    },
    {
      id: 'dept-phy',
      code: 'PHY',
      name: 'Department of Physics',
      hodId: '',
      hodName: 'Unassigned',
      facultyCount: 0,
      courseCount: 4,
      submissionRate: 0,
      building: 'Science Hall Block D'
    }
  ],
  courses: [
    {
      id: 'course-1',
      code: 'CS-401',
      title: 'Advanced Software Engineering',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      credits: 3,
      type: 'Core',
      assignedTeacherId: 'usr-teacher-1',
      assignedTeacherName: 'Dr. Tariq Mahmood',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 7',
      academicSession: 'Fall 2025',
      totalStudents: 45,
      status: 'Active'
    },
    {
      id: 'course-2',
      code: 'CS-302',
      title: 'Database Management Systems',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      credits: 4,
      type: 'Core',
      assignedTeacherId: 'usr-visiting-1',
      assignedTeacherName: 'Engr. Bilal Khan',
      assignedTeacherRole: 'VISITING_TEACHER',
      semester: 'Semester 5',
      academicSession: 'Fall 2025',
      totalStudents: 52,
      status: 'Active'
    },
    {
      id: 'course-3',
      code: 'CS-201',
      title: 'Data Structures & Algorithms',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      credits: 4,
      type: 'Core',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 3',
      academicSession: 'Fall 2025',
      totalStudents: 55,
      status: 'Active'
    },
    {
      id: 'course-4',
      code: 'CS-101',
      title: 'Introduction to Computer Programming',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      credits: 3,
      type: 'Core',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 1',
      academicSession: 'Fall 2025',
      totalStudents: 60,
      status: 'Active'
    },
    {
      id: 'course-101L',
      code: 'CS-101L',
      title: 'Computer Programming Lab',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      credits: 2,
      type: 'Lab',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'VISITING_TEACHER',
      semester: 'Semester 1',
      academicSession: 'Fall 2025',
      totalStudents: 60,
      status: 'Active'
    },
    {
      id: 'course-201L',
      code: 'CS-201L',
      title: 'Data Structures Lab',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      credits: 2,
      type: 'Lab',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'VISITING_TEACHER',
      semester: 'Semester 3',
      academicSession: 'Fall 2025',
      totalStudents: 55,
      status: 'Active'
    },
    {
      id: 'course-302L',
      code: 'CS-302L',
      title: 'Database Systems Lab',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      credits: 2,
      type: 'Lab',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'VISITING_TEACHER',
      semester: 'Semester 5',
      academicSession: 'Fall 2025',
      totalStudents: 50,
      status: 'Active'
    },
    {
      id: 'course-5',
      code: 'CS-501',
      title: 'Artificial Intelligence & Machine Learning',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      credits: 3,
      type: 'Elective',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 8',
      academicSession: 'Fall 2025',
      totalStudents: 40,
      status: 'Active'
    },
    {
      id: 'course-6',
      code: 'CS-405',
      title: 'Computer Networks & Security',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      credits: 3,
      type: 'Core',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 6',
      academicSession: 'Fall 2025',
      totalStudents: 48,
      status: 'Active'
    },
    {
      id: 'course-math-1',
      code: 'MATH-101',
      title: 'Calculus & Analytical Geometry',
      departmentId: 'dept-math',
      departmentName: 'Mathematics',
      credits: 3,
      type: 'Core',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 1',
      academicSession: 'Fall 2025',
      totalStudents: 50,
      status: 'Active'
    },
    {
      id: 'course-math-2',
      code: 'MATH-201',
      title: 'Linear Algebra & Differential Equations',
      departmentId: 'dept-math',
      departmentName: 'Mathematics',
      credits: 3,
      type: 'Core',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 3',
      academicSession: 'Fall 2025',
      totalStudents: 45,
      status: 'Active'
    },
    {
      id: 'course-math-3',
      code: 'MATH-301',
      title: 'Numerical Analysis & Computing',
      departmentId: 'dept-math',
      departmentName: 'Mathematics',
      credits: 3,
      type: 'Core',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 5',
      academicSession: 'Fall 2025',
      totalStudents: 40,
      status: 'Active'
    },
    {
      id: 'course-eng-1',
      code: 'ENG-101',
      title: 'Functional English & Communication Skills',
      departmentId: 'dept-eng',
      departmentName: 'English Literature',
      credits: 3,
      type: 'Core',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 1',
      academicSession: 'Fall 2025',
      totalStudents: 60,
      status: 'Active'
    },
    {
      id: 'course-eng-2',
      code: 'ENG-102',
      title: 'Technical Report Writing & Presentation',
      departmentId: 'dept-eng',
      departmentName: 'English Literature',
      credits: 3,
      type: 'Core',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 2',
      academicSession: 'Fall 2025',
      totalStudents: 55,
      status: 'Active'
    },
    {
      id: 'course-eng-3',
      code: 'ENG-201',
      title: 'Classical Poetry & Drama',
      departmentId: 'dept-eng',
      departmentName: 'English Literature',
      credits: 3,
      type: 'Core',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 4',
      academicSession: 'Fall 2025',
      totalStudents: 42,
      status: 'Active'
    },
    {
      id: 'course-phy-1',
      code: 'PHY-101',
      title: 'Applied Physics & Mechanics',
      departmentId: 'dept-phy',
      departmentName: 'Department of Physics',
      credits: 3,
      type: 'Core',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 1',
      academicSession: 'Fall 2025',
      totalStudents: 35,
      status: 'Active'
    },
    {
      id: 'course-phy-2',
      code: 'PHY-102',
      title: 'Applied Physics Practical Lab',
      departmentId: 'dept-phy',
      departmentName: 'Department of Physics',
      credits: 1,
      type: 'Lab',
      assignedTeacherId: '',
      assignedTeacherName: 'Unassigned',
      assignedTeacherRole: 'REGULAR_TEACHER',
      semester: 'Semester 1',
      academicSession: 'Fall 2025',
      totalStudents: 35,
      status: 'Active'
    }
  ],
  programs: [
    {
      id: 'prog-bs-cs',
      code: 'BSCS',
      name: 'Bachelor of Science in Computer Science',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      degreeLevel: 'BS',
      durationYears: 4
    },
    {
      id: 'prog-ms-cs',
      code: 'MSCS',
      name: 'Master of Science in Computer Science',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      degreeLevel: 'MS',
      durationYears: 2
    }
  ],
  deadlines: [
    {
      id: 'dl-midterm',
      title: 'Midterm Complete Course File Submission',
      courseCode: 'ALL',
      category: 'Midterm Submission',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      dueDate: '2025-11-15',
      gracePeriodDays: 3,
      status: 'Upcoming',
      description: 'Submit mid-semester course files including lecture notes, quizzes, and midterm papers.',
      targetRole: 'ALL'
    },
    {
      id: 'dl-final',
      title: 'Final Complete Course File Submission',
      courseCode: 'ALL',
      category: 'Final Submission',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      dueDate: '2026-02-10',
      gracePeriodDays: 5,
      status: 'Upcoming',
      description: 'Submit complete end-of-semester course file compilation for HOD audit.',
      targetRole: 'ALL'
    }
  ],
  announcements: [
    {
      id: 'anc-1',
      title: 'Fall 2025 Course File Submission Deadline Announcement',
      content: 'All faculty members (Regular & Visiting) are reminded to upload single compiled course PDF files before the designated window closes.',
      authorName: 'Prof. Dr. Muhammad Aslam',
      authorRole: 'System Administrator & Dean',
      targetDepartmentId: 'ALL',
      targetRole: 'ALL',
      priority: 'High',
      isPinned: true,
      createdDate: '2025-09-02'
    }
  ],
  courseFiles: [
    {
      id: 'file-1',
      courseId: 'course-1',
      courseCode: 'CS-401',
      courseTitle: 'Advanced Software Engineering',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      teacherId: 'usr-teacher-1',
      teacherName: 'Dr. Tariq Mahmood',
      teacherRole: 'REGULAR_TEACHER',
      title: 'CS-401 Complete Course File Fall 2025',
      category: 'Syllabus & Course Outline',
      currentVersion: 'v1.0',
      fileType: 'PDF',
      fileSize: '4.8 MB',
      fileUrl: '/uploads/sample_cs401.pdf',
      status: 'Submitted',
      uploadDate: '2025-10-12',
      lastModified: '2025-10-12',
      archived: false,
      deleted: false,
      versionHistory: [
        {
          id: 'ver-file1-1',
          versionNumber: 'v1.0',
          fileName: 'CS401_Course_File_Fall2025.pdf',
          fileSize: '4.8 MB',
          uploadedBy: 'Dr. Tariq Mahmood',
          uploadedByRole: 'REGULAR_TEACHER',
          uploadedAt: '2025-10-12 10:00 AM',
          changeLog: 'Initial complete course file compilation',
          fileUrl: '/uploads/sample_cs401.pdf'
        }
      ],
      remarks: ''
    }
  ],
  sessions: [
    {
      id: 'sess-fall2025',
      name: 'Fall 2025',
      term: 'Fall',
      year: 2025,
      startDate: '2025-09-01',
      endDate: '2026-02-15',
      isCurrent: true,
      status: 'Active',
      fileCount: 42
    }
  ],
  submissionWindow: {
    id: 'sub-window-1',
    sessionId: 'sess-fall2025',
    sessionName: 'Fall 2025',
    startDate: '2025-09-01',
    endDate: '2026-02-15',
    status: 'Submission Window Active',
    allowLateSubmission: true
  },
  templates: [
    {
      id: 'tmpl-official-1',
      title: 'Official UE Attock Course File Master Template',
      description: 'Single official PDF compilation structure required by HOD Quality Assurance Committee.',
      format: 'PDF / DOCX',
      fileName: 'UE_Attock_Official_Course_File_Template.pdf',
      fileUrl: '#',
      uploadedBy: 'Administrator',
      targetRole: 'ALL',
      uploadedAt: '2025-09-01'
    }
  ],
  instructions: [
    {
      id: 'inst-official-1',
      title: 'Course File Preparation & Single File Submission Guidelines',
      content: 'Teachers must compile all course documents into ONE PDF file including Syllabus, Attendance, Lecture Slides, Midterm/Final Papers, Sample Answer Sheets, and Result Analysis.',
      fileName: 'Course_File_Instructions.pdf',
      fileUrl: '#',
      updatedAtStr: '2025-09-01'
    }
  ],
  settings: {
    systemName: 'University Course File Management System (CFMS)',
    universityName: 'University of Education, Attock Campus',
    academicYear: '2025-2026',
    currentSession: 'Fall 2025',
    mfaRequired: false,
    maxFileSizeMB: 50,
    allowedExtensions: ['.pdf', '.docx', '.zip', '.xlsx', '.ppt'],
    smtpHost: 'smtp.ue.edu.pk',
    smtpStatus: 'Connected',
    autoArchivingDays: 180,
    maintenanceMode: false
  },
  auditLogs: [
    {
      id: 'aud-initial-1',
      timestamp: new Date().toISOString(),
      eventType: 'SYSTEM_STARTUP',
      actor: 'Administrator',
      role: 'ADMIN',
      resource: 'System:Init',
      status: 'SUCCESS',
      severity: 'INFO',
      signature: 'sha256-system-init'
    }
  ],
  feedback: [],
  archives: [],
  teacherRequests: [] as any[]
};
