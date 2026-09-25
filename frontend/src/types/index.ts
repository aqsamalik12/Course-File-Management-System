export type UserRole = 'ADMIN' | 'HOD' | 'REGULAR_TEACHER' | 'VISITING_TEACHER';

// Teacher profile form data submitted to Admin
export interface TeacherProfileFormData {
  cnic: string;
  dob: string;
  gender: string;
  phone: string;
  personalEmail?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  // Academic fields
  highestQualification: string;
  specialization: string;
  employmentType: string; // Regular / Visiting / Contract
  joiningDate: string;
  // Session/Batch info
  academicSession: string;  // e.g. "Spring 2026"
  batch: string;            // e.g. "2023-2027"
  departmentId: string;
  departmentName: string;
  // Course info
  courseName: string;       // e.g. "Data Structures"
  courseCode: string;       // e.g. "CS-301"
  creditHours: string;      // e.g. "3"
  // Address
  residentialAddress?: string;
  city?: string;
  // Submission metadata
  submittedAt: string;
}

// Login activity log entry
export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  loginAt: string;          // ISO timestamp
  formFilledAt?: string;    // ISO timestamp if they submitted form in this session
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string; // for localStorage auth
  avatar: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  designation: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Locked' | 'Suspended';
  createdAt: string;
  lastLogin: string;
  registeredAt?: string;       // when they self-registered
  profileFormSubmitted?: boolean; // gate: must fill form before course file
  profileFormData?: TeacherProfileFormData; // submitted form data visible to admin
  employeeId?: string;
  gender?: 'Male' | 'Female' | 'Other';
  academicSession?: string;
  loginCount?: number;
  deleted?: boolean;
  // Visiting Teacher specific fields
  contractStartDate?: string;
  contractEndDate?: string;
  contractStatus?: 'Active' | 'Expiring Soon' | 'Expired';
  supervisorName?: string;
  enrollmentStatus?: EnrollmentStatus;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: string;
  totalCredits?: number;
  selectedCourseIds?: string[];
}

export type EnrollmentStatus =
  | 'New'
  | 'ProfileIncomplete'
  | 'FormSubmitted'
  | 'PendingHODApproval'
  | 'Approved'
  | 'Rejected'
  | 'NeedsUpdate';

export interface SelectedCourseItem {
  courseId: string;
  courseCode: string;
  courseName?: string;
  courseTitle?: string;
  credits?: number;
  creditHours?: number;
  type?: 'Core' | 'Elective' | 'Lab';
}

export interface TeacherEnrollmentRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  teacherType: 'REGULAR_TEACHER' | 'VISITING_TEACHER';
  departmentId: string;
  departmentName: string;
  hodId?: string;
  hodName?: string;
  selectedCourses: SelectedCourseItem[];
  totalCredits: number;
  creditLimit: number;
  status: 'PendingHODApproval' | 'Approved' | 'Rejected' | 'NeedsUpdate';
  rejectionReason?: string;
  profileData?: any;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  hodId: string;
  hodName: string;
  facultyCount: number;
  courseCount: number;
  submissionRate: number;
  building: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId: string;
  departmentName: string;
  credits: number;
  type: 'Core' | 'Elective' | 'Lab';
  assignedTeacherId: string;
  assignedTeacherName: string;
  assignedTeacherRole: UserRole;
  semester: string;
  academicSession: string;
  batch?: string; // Student Batch e.g. "2023-2027", "2022-2026"
  totalStudents: number;
  status: 'Active' | 'Archived';
}

export type FileCategoryType =
  | 'Syllabus & Course Outline'
  | 'Lecture Notes & Slides'
  | 'Assignments & Solutions'
  | 'Quizzes & Solutions'
  | 'Midterm Examination'
  | 'Final Examination'
  | 'Lab Manual & Reports'
  | 'Attendance Sheet'
  | 'Grade Sheet & Result'
  | 'Course Feedback & Analysis';

export interface FileCategory {
  id: string;
  name: FileCategoryType;
  description: string;
  isRequired: boolean;
  maxUploads: number;
  allowedFormats: string[];
}

export type FileStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'In Review'
  | 'Returned for Revision'
  | 'Returned'
  | 'Revision Requested'
  | 'Approved'
  | 'Archived'
  | 'Late Submission'
  | 'Rejected';

export interface SubmissionWindow {
  id: string;
  sessionId: string;
  sessionName: string;
  startDate: string;
  endDate: string;
  status: 'Submission Window Active' | 'Submission Closed' | 'Upcoming';
  allowLateSubmission: boolean;
}

export interface VersionItem {
  id: string;
  versionNumber: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedByRole: UserRole;
  uploadedAt: string;
  changeLog: string;
  fileUrl: string;
}

export interface CourseFileItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  departmentId: string;
  departmentName: string;
  teacherId: string;
  teacherName: string;
  teacherRole: UserRole;
  title: string;
  category: FileCategoryType;
  currentVersion: string;
  fileType: 'PDF' | 'DOCX' | 'PPT' | 'ZIP' | 'XLSX';
  fileSize: string;
  fileUrl: string;
  status: FileStatus;
  batch?: string; // Student Batch e.g. "2023-2027", "2022-2026"
  uploadDate: string;
  lastModified: string;
  archived: boolean;
  deleted: boolean; // For recycle bin
  deletedAt?: string;
  remarks?: string;
  hodRemarks?: string;
  versionHistory: VersionItem[];
  approvalStage?: string;
}

export interface ApprovalRequest {
  id: string;
  fileId: string;
  fileTitle: string;
  courseCode: string;
  courseTitle: string;
  category: FileCategoryType;
  teacherId: string;
  teacherName: string;
  teacherRole: UserRole;
  departmentId: string;
  departmentName: string;
  submittedAt: string;
  status: FileStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  remarks?: string;
  version: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  courseCode: string;
  category: FileCategoryType;
  departmentId: string;
  departmentName: string;
  dueDate: string;
  gracePeriodDays: number;
  status: 'Upcoming' | 'Completed' | 'Missed' | 'Extended';
  description: string;
  targetRole?: 'ALL' | 'REGULAR_TEACHER' | 'VISITING_TEACHER';
}

export interface AcademicSession {
  id: string;
  name: string;
  term: 'Fall' | 'Spring' | 'Summer';
  year: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'Active' | 'Locked' | 'Archived';
  fileCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: UserRole;
  targetDepartmentId?: string; // 'ALL' or specific
  targetRole?: 'ALL' | 'HOD' | 'REGULAR_TEACHER' | 'VISITING_TEACHER';
  createdDate: string;
  scheduledDate?: string;
  status?: 'Published' | 'Scheduled' | 'Archived';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  isPinned: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'email' | 'system';
  timestamp: string;
  isRead: boolean;
  targetRole: 'ALL' | UserRole;
  linkModule?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventType: string;
  actor: string;
  role: UserRole;
  resource: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  severity: 'INFO' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  signature: string;
}

export interface FeedbackItem {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  departmentName: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  response?: string;
}

export interface SystemSetting {
  systemName: string;
  universityName: string;
  academicYear: string;
  currentSession: string;
  mfaRequired: boolean;
  maxFileSizeMB: number;
  allowedExtensions: string[];
  smtpHost: string;
  smtpStatus: 'Connected' | 'Error';
  autoArchivingDays: number;
  maintenanceMode: boolean;
}
