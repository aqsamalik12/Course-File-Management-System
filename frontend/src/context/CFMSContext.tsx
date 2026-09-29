import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  FileStatus,
  FileCategoryType,
  UserRole,
  SubmissionWindow,
  TeacherEnrollmentRequest,
  Campus,
  HODAssignment,
  Section,
  TeacherAssignment
} from '../types';
import {
  INITIAL_CAMPUSES,
  INITIAL_DEPARTMENTS,
  INITIAL_USERS,
  INITIAL_COURSES,
  INITIAL_CATEGORIES,
  INITIAL_COURSE_FILES,
  INITIAL_DEADLINES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SESSIONS,
  INITIAL_SUBMISSION_WINDOW,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FEEDBACK,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_HOD_ASSIGNMENTS
} from '../data/mockData';

interface CFMSContextType {
  // Data State
  courseFiles: CourseFileItem[];
  departments: Department[];
  courses: Course[];
  categories: FileCategory[];
  deadlines: DeadlineItem[];
  announcements: Announcement[];
  notifications: SystemNotification[];
  sessions: AcademicSession[];
  submissionWindow: SubmissionWindow;
  activityLogs: ActivityLog[];
  auditLogs: AuditLog[];
  feedbackList: FeedbackItem[];
  usersList: User[];
  systemSettings: SystemSetting;
  campuses: Campus[];

  // File Operations
  uploadCourseFile: (fileData: Omit<CourseFileItem, 'id' | 'uploadDate' | 'lastModified' | 'archived' | 'deleted' | 'versionHistory'>) => void;
  updateFileStatus: (fileId: string, status: FileStatus, remarks?: string, reviewerName?: string) => void;
  updateCourseFileStatus: (fileId: string, status: FileStatus, remarks?: string, reviewerName?: string) => void;
  uploadNewFileVersion: (fileId: string, newVersion: { fileName: string; fileSize: string; changeLog: string; uploadedBy: string; uploadedByRole: UserRole }) => void;
  archiveCourseFile: (fileId: string) => void;
  restoreCourseFile: (fileId: string) => void;
  softDeleteCourseFile: (fileId: string) => void;
  permanentlyDeleteFile: (fileId: string) => void;

  // Submission Window & Admin Template Management
  updateSubmissionWindow: (windowData: Partial<SubmissionWindow>) => void;
  uploadAdminTemplate: (title: string, format: string, fileName: string) => void;

  // User Operations
  createUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  updateUser: (userId: string, data: Partial<User>) => void;
  toggleUserStatus: (userId: string) => void;
  deleteUser: (userId: string) => void;
  resetUserPassword: (userId: string, newPassword?: string) => void;

  // Department & Course Operations
  createDepartment: (dept: Omit<Department, 'id'>) => Promise<{ success: boolean; message: string; data?: Department }>;
  updateDepartment: (deptId: string, data: Partial<Department>) => Promise<{ success: boolean; message: string; data?: Department }>;
  deleteDepartment: (deptId: string) => Promise<{ success: boolean; message: string }>;
  refreshDepartments: () => Promise<void>;
  createCourse: (course: Omit<Course, 'id'>) => Promise<{ success: boolean; message: string; data?: Course }>;
  updateCourse: (courseId: string, data: Partial<Course>) => Promise<{ success: boolean; message: string; data?: Course }>;
  deleteCourse: (courseId: string) => Promise<{ success: boolean; message: string }>;
  archiveCourse: (courseId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  restoreCourse: (courseId: string) => Promise<{ success: boolean; message: string }>;
  refreshCourses: () => Promise<void>;

  // Campus Operations
  createCampus: (campus: Omit<Campus, 'id'>) => Promise<{ success: boolean; message: string; data?: Campus }>;
  updateCampus: (id: string, data: Partial<Campus>) => Promise<{ success: boolean; message: string; data?: Campus }>;
  deleteCampus: (id: string) => Promise<{ success: boolean; message: string }>;
  refreshCampuses: () => Promise<void>;

  // Session Operations
  createSession: (session: Omit<AcademicSession, 'id'>) => void;

  // Deadlines & Announcements
  createDeadline: (deadline: Omit<DeadlineItem, 'id'>) => void;
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdDate'>) => void;

  // Notifications & Feedback
  markNotificationAsRead: (notifId: string) => void;
  clearAllNotifications: () => void;
  submitFeedback: (feedback: Omit<FeedbackItem, 'id' | 'createdAt' | 'status'>) => void;
  respondToFeedback: (id: string, response: string) => void;

  // System Settings & Logs
  updateSettings: (newSettings: Partial<SystemSetting>) => void;
  addActivityLog: (userId: string, userName: string, userRole: UserRole, action: string, module: string, details: string) => void;

  // Teacher Enrollment Requests & HOD Assignment
  teacherRequests: TeacherEnrollmentRequest[];
  approveTeacherRequest: (requestId: string) => Promise<boolean>;
  rejectTeacherRequest: (requestId: string, reason: string) => Promise<boolean>;
  assignDepartmentHOD: (deptId: string, hodId: string, hodName: string) => Promise<boolean>;
  refreshTeacherRequests: () => Promise<void>;

  // HOD Multi-Campus Scope Assignments
  hodAssignments: HODAssignment[];
  createHODAssignment: (assignment: Omit<HODAssignment, 'id'>) => Promise<{ success: boolean; message?: string }>;
  updateHODAssignment: (id: string, data: Partial<HODAssignment>) => Promise<boolean>;
  deleteHODAssignment: (id: string) => Promise<boolean>;
  resetHODPassword: (id: string, newPassword: string) => Promise<boolean>;
  refreshHODAssignments: () => Promise<void>;

  // Sections Management
  sections: Section[];
  createSection: (section: Partial<Section>) => Promise<{ success: boolean; message: string; data?: Section }>;
  updateSection: (id: string, data: Partial<Section>) => Promise<boolean>;
  deleteSection: (id: string) => Promise<boolean>;
  refreshSections: () => Promise<void>;

  // Teacher Assignments (Teacher → Department → Section → Course → HOD)
  teacherAssignments: TeacherAssignment[];
  activeTeacherSetup: {
    departmentId: string;
    departmentName: string;
    sectionId: string;
    sectionName: string;
    courseId: string;
    courseCode: string;
    courseName: string;
    credits?: number;
    hodId: string;
    hodName: string;
    campusId?: string;
    campusName?: string;
  } | null;
  setActiveTeacherSetup: (setup: any) => void;
  createTeacherAssignment: (assignment: Partial<TeacherAssignment>) => Promise<{ success: boolean; message: string; data?: TeacherAssignment }>;
  updateTeacherAssignment: (id: string, data: Partial<TeacherAssignment>) => Promise<boolean>;
  deleteTeacherAssignment: (id: string) => Promise<boolean>;
  refreshTeacherAssignments: () => Promise<void>;
  fetchMyAssignments: (teacherId?: string) => Promise<{ hasAssignments: boolean; departments: any[]; assignments: any[] }>;
}

const CFMSContext = createContext<CFMSContextType | undefined>(undefined);

export const CFMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courseFiles, setCourseFiles] = useState<CourseFileItem[]>(INITIAL_COURSE_FILES);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [categories, setCategories] = useState<FileCategory[]>(INITIAL_CATEGORIES);
  const [hodAssignments, setHodAssignments] = useState<HODAssignment[]>(INITIAL_HOD_ASSIGNMENTS);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>(INITIAL_DEADLINES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [sessions, setSessions] = useState<AcademicSession[]>(INITIAL_SESSIONS);
  const [submissionWindow, setSubmissionWindow] = useState<SubmissionWindow>(INITIAL_SUBMISSION_WINDOW);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(INITIAL_FEEDBACK);
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [systemSettings, setSystemSettings] = useState<SystemSetting>(INITIAL_SYSTEM_SETTINGS);
  const [campuses, setCampuses] = useState<Campus[]>(INITIAL_CAMPUSES);
  const [teacherRequests, setTeacherRequests] = useState<TeacherEnrollmentRequest[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [activeTeacherSetup, setActiveTeacherSetupState] = useState<{
    departmentId: string;
    departmentName: string;
    sectionId: string;
    sectionName: string;
    courseId: string;
    courseCode: string;
    courseName: string;
    credits?: number;
    hodId: string;
    hodName: string;
    campusId?: string;
    campusName?: string;
  } | null>(() => {
    try {
      const stored = sessionStorage.getItem('cfms_teacher_setup');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setActiveTeacherSetup = (setup: any) => {
    setActiveTeacherSetupState(setup);
    try {
      if (setup) {
        sessionStorage.setItem('cfms_teacher_setup', JSON.stringify(setup));
      } else {
        sessionStorage.removeItem('cfms_teacher_setup');
      }
    } catch {}
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = localStorage.getItem('cfms_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const raw = localStorage.getItem('cfms_current_user');
      let role = 'ADMIN';
      let id = 'admin';
      let name = 'Administrator';
      if (raw) {
        try {
          const u = JSON.parse(raw);
          if (u.id) id = u.id;
          if (u.role) role = u.role;
          if (u.departmentId) headers['x-user-department-id'] = u.departmentId;
          if (u.name) name = u.name;
        } catch {}
      }
      headers['x-user-id'] = id;
      headers['x-user-role'] = role;
      headers['x-user-name'] = name;
    } catch {
      headers['x-user-role'] = 'ADMIN';
    }
    return headers;
  };

  const refreshCampuses = async () => {
    try {
      const res = await fetch('/api/campuses', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCampuses(data.data);
      }
    } catch {}
  };

  const refreshDepartments = async () => {
    try {
      const res = await fetch('/api/departments', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setDepartments(data.data);
      }
    } catch {}
  };

  // Sync initial state from backend APIs
  useEffect(() => {
    fetch('/api/campuses')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setCampuses(res.data); })
      .catch(() => {});

    fetch('/api/hod-assignments')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setHodAssignments(res.data); })
      .catch(() => {});

    fetch('/api/teacher-requests')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setTeacherRequests(res.data); })
      .catch(() => {});

    fetch('/api/course-files')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setCourseFiles(res.data); })
      .catch(() => {});

    fetch('/api/departments')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setDepartments(res.data); })
      .catch(() => {});

    fetch('/api/courses')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setCourses(res.data); })
      .catch(() => {});

    fetch('/api/deadlines')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setDeadlines(res.data); })
      .catch(() => {});

    fetch('/api/announcements')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setAnnouncements(res.data); })
      .catch(() => {});

    fetch('/api/users')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setUsersList(res.data); })
      .catch(() => {});

    fetch('/api/system/submission-window')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data) setSubmissionWindow(res.data); })
      .catch(() => {});

    fetch('/api/notifications')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setNotifications(res.data); })
      .catch(() => {});

    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setAuditLogs(res.data); })
      .catch(() => {});

    fetch('/api/feedback')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setFeedbackList(res.data); })
      .catch(() => {});

    fetch('/api/settings')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data) setSystemSettings(res.data); })
      .catch(() => {});

    fetch('/api/campuses')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setCampuses(res.data); })
      .catch(() => {});

    fetch('/api/hod-assignments', { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setHodAssignments(res.data); })
      .catch(() => {});

    fetch('/api/sections')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setSections(res.data); })
      .catch(() => {});

    fetch('/api/teacher-assignments', { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setTeacherAssignments(res.data); })
      .catch(() => {});
  }, []);

  const addActivityLog = async (
    userId: string,
    userName: string,
    userRole: UserRole,
    action: string,
    module: string,
    details: string
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      userId,
      userName,
      userRole,
      action,
      module,
      details,
      timestamp: new Date().toLocaleString(),
      ipAddress: '192.168.1.100'
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: action,
      actor: userName,
      role: userRole,
      resource: `${module}:${details.slice(0, 30)}`,
      status: 'SUCCESS',
      severity: 'INFO',
      signature: `sha256-${Math.random().toString(36).substring(2, 10)}`
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    try {
      await fetch('/api/audit-logs/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userName, userRole, action, module, details })
      });
    } catch (e) {}
  };

  const uploadCourseFile = async (
    fileData: Omit<CourseFileItem, 'id' | 'uploadDate' | 'lastModified' | 'archived' | 'deleted' | 'versionHistory'>
  ) => {
    const fileId = `file-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const initialVersion = {
      id: `ver-${Date.now()}-1`,
      versionNumber: 'v1.0',
      fileName: fileData.title,
      fileSize: fileData.fileSize,
      uploadedBy: fileData.teacherName,
      uploadedByRole: fileData.teacherRole,
      uploadedAt: `${today} 10:00 AM`,
      changeLog: 'Initial complete course file upload',
      fileUrl: '#'
    };

    const newFile: CourseFileItem = {
      ...fileData,
      id: fileId,
      uploadDate: today,
      lastModified: today,
      archived: false,
      deleted: false,
      currentVersion: 'v1.0',
      versionHistory: [initialVersion]
    };

    setCourseFiles((prev) => [newFile, ...prev]);

    if (fileData.status === 'Submitted') {
      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: 'New Course File Submitted',
        message: `${fileData.teacherName} submitted ${fileData.title} (${fileData.courseCode}) for HOD review.`,
        type: 'info',
        timestamp: 'Just now',
        isRead: false,
        targetRole: 'HOD',
        linkModule: 'Approval Management'
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    addActivityLog(
      fileData.teacherId,
      fileData.teacherName,
      fileData.teacherRole,
      'UPLOAD_FILE',
      'Course File Management',
      `Uploaded ${fileData.title} for ${fileData.courseCode}`
    );

    try {
      const res = await fetch('/api/course-files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileData)
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to upload course file');
      }
    } catch (e: any) {
      setCourseFiles((prev) => prev.filter((f) => f.id !== newFile.id));
      throw e;
    }
  };

  const updateFileStatus = async (fileId: string, status: FileStatus, remarks?: string, reviewerName?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const isApproved = status === 'Approved';

    setCourseFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId) {
          return {
            ...f,
            status,
            archived: isApproved ? true : f.archived,
            remarks: remarks || f.remarks,
            lastModified: today
          };
        }
        return f;
      })
    );

    const file = courseFiles.find((f) => f.id === fileId);
    if (file) {
      const notifType = isApproved ? 'success' : status === 'Returned' || status === 'Returned for Revision' || status === 'Revision Requested' ? 'warning' : 'info';
      const notif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: isApproved ? 'Course File Approved & Archived' : `Course File Status: ${status}`,
        message: isApproved
          ? `Your Complete Course File for ${file.courseCode} (${file.currentVersion}) has been Approved by HOD and automatically archived.`
          : `Your file "${file.title}" for ${file.courseCode} was marked as ${status}${reviewerName ? ` by ${reviewerName}` : ''}.${remarks ? ` Remarks: "${remarks}"` : ''}`,
        type: notifType,
        timestamp: 'Just now',
        isRead: false,
        targetRole: file.teacherRole,
        linkModule: 'Course Files'
      };
      setNotifications((prev) => [notif, ...prev]);

      addActivityLog(
        'sys-reviewer',
        reviewerName || 'HOD',
        'HOD',
        `FILE_STATUS_${status.toUpperCase().replace(/\s+/g, '_')}`,
        'Approval Management',
        `HOD ${reviewerName || ''} marked "${file.title}" for ${file.courseCode} as ${status}`
      );
    }

    try {
      await fetch(`/api/course-files/${fileId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks, reviewerName })
      });
    } catch (e) {}
  };

  const updateCourseFileStatus = updateFileStatus;

  const updateSubmissionWindow = async (windowData: Partial<SubmissionWindow>) => {
    setSubmissionWindow((prev) => {
      const updated = { ...prev, ...windowData };
      addActivityLog(
        'admin',
        'Administrator',
        'ADMIN',
        'UPDATE_SUBMISSION_WINDOW',
        'Academic Session Management',
        `Updated submission window for ${updated.sessionName}: ${updated.startDate} to ${updated.endDate} (${updated.status})`
      );
      return updated;
    });

    try {
      await fetch('/api/system/submission-window', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(windowData)
      });
    } catch (e) {}
  };

  const uploadAdminTemplate = async (title: string, format: string, fileName: string) => {
    const notif1: SystemNotification = {
      id: `notif-${Date.now()}-1`,
      title: 'Official Admin Template Updated',
      message: `Administrator uploaded official course file template "${title}" (${format}). Please download and follow before submission.`,
      type: 'info',
      timestamp: 'Just now',
      isRead: false,
      targetRole: 'REGULAR_TEACHER',
      linkModule: 'Teacher Dashboard'
    };
    const notif2: SystemNotification = {
      id: `notif-${Date.now()}-2`,
      title: 'Official Admin Template Updated',
      message: `Administrator uploaded official course file template "${title}" (${format}). Please download and follow before submission.`,
      type: 'info',
      timestamp: 'Just now',
      isRead: false,
      targetRole: 'VISITING_TEACHER',
      linkModule: 'Teacher Dashboard'
    };
    setNotifications((prev) => [notif1, notif2, ...prev]);

    addActivityLog(
      'admin',
      'Administrator',
      'ADMIN',
      'UPLOAD_TEMPLATE',
      'Admin Template Management',
      `Uploaded official template "${title}" (${fileName})`
    );

    try {
      await fetch('/api/templates/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, format, fileName })
      });
    } catch (e) {}
  };

  const uploadNewFileVersion = async (
    fileId: string,
    newVersion: { fileName: string; fileSize: string; changeLog: string; uploadedBy: string; uploadedByRole: UserRole }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setCourseFiles((prev) =>
      prev.map((f) => {
        if (f.id === fileId) {
          const currentMajor = parseInt(f.currentVersion.replace('v', '').split('.')[0]) || 1;
          const nextVersionNum = `v${currentMajor + 1}.0`;

          const verObj = {
            id: `ver-${Date.now()}`,
            versionNumber: nextVersionNum,
            fileName: newVersion.fileName,
            fileSize: newVersion.fileSize,
            uploadedBy: newVersion.uploadedBy,
            uploadedByRole: newVersion.uploadedByRole,
            uploadedAt: `${today} 11:30 AM`,
            changeLog: newVersion.changeLog,
            fileUrl: '#'
          };

          return {
            ...f,
            currentVersion: nextVersionNum,
            status: 'Submitted' as FileStatus,
            lastModified: today,
            versionHistory: [verObj, ...f.versionHistory]
          };
        }
        return f;
      })
    );

    addActivityLog(
      'sys-user',
      newVersion.uploadedBy,
      newVersion.uploadedByRole,
      'NEW_VERSION_UPLOAD',
      'Version History',
      `Uploaded new version for file ID ${fileId}`
    );

    try {
      await fetch(`/api/course-files/${fileId}/version`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVersion)
      });
    } catch (e) {}
  };

  const archiveCourseFile = async (fileId: string) => {
    setCourseFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, archived: true } : f))
    );
    try {
      await fetch(`/api/course-files/${fileId}/archive`, { method: 'PATCH' });
    } catch (e) {}
  };

  const restoreCourseFile = async (fileId: string) => {
    setCourseFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, archived: false, deleted: false } : f))
    );
    try {
      await fetch(`/api/course-files/${fileId}/restore`, { method: 'PATCH' });
    } catch (e) {}
  };

  const softDeleteCourseFile = async (fileId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setCourseFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, deleted: true, deletedAt: today } : f))
    );
    try {
      await fetch(`/api/course-files/${fileId}/soft`, { method: 'DELETE' });
    } catch (e) {}
  };

  const permanentlyDeleteFile = async (fileId: string) => {
    setCourseFiles((prev) => prev.filter((f) => f.id !== fileId));
    try {
      await fetch(`/api/course-files/${fileId}/permanent`, { method: 'DELETE' });
    } catch (e) {}
  };

  // User Actions
  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    const newU: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never',
      registeredAt: new Date().toISOString(), // mark as admin-created
      profileFormSubmitted: false
    };
    setUsersList((prev) => [newU, ...prev]);
    addActivityLog('admin', 'Admin', 'ADMIN', 'CREATE_USER', 'User Management', `Created user ${userData.name}`);

    // ── Save to localStorage so AuthContext.login() can authenticate this user ──
    const LS_KEY = 'cfms_registered_users';
    try {
      const raw = localStorage.getItem(LS_KEY);
      const existing: User[] = raw ? JSON.parse(raw) : [];
      // Avoid duplicates
      if (!existing.find((u) => u.email.toLowerCase() === newU.email.toLowerCase())) {
        // Store password as base64 hash (same encoding as AuthContext)
        const password = (userData as any).password || '';
        const userWithHash: User = {
          ...newU,
          passwordHash: password ? btoa(password) : '',
          avatar: newU.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newU.name)}&background=1E7B4E&color=fff&size=150`
        };
        localStorage.setItem(LS_KEY, JSON.stringify([...existing, userWithHash]));
      }
    } catch (e) {}

    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
    } catch (e) {}
  };


  const updateUser = async (userId: string, data: Partial<User>) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    try {
      await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {}
  };

  const toggleUserStatus = async (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    try {
      await fetch(`/api/users/${userId}/status`, { method: 'PATCH' });
    } catch (e) {}
  };

  const deleteUser = async (userId: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== userId));
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const resetUserPassword = async (userId: string, newPassword?: string) => {
    const u = usersList.find((x) => x.id === userId);
    addActivityLog('admin', 'Admin', 'ADMIN', 'RESET_PASSWORD', 'User Management', `Reset password for ${u?.name}`);

    // Also update passwordHash in localStorage for login to work
    if (newPassword && u) {
      const LS_KEY = 'cfms_registered_users';
      try {
        const raw = localStorage.getItem(LS_KEY);
        const existing: User[] = raw ? JSON.parse(raw) : [];
        const updated = existing.map((eu) =>
          eu.email.toLowerCase() === u.email.toLowerCase()
            ? { ...eu, passwordHash: btoa(newPassword) }
            : eu
        );
        localStorage.setItem(LS_KEY, JSON.stringify(updated));
      } catch (e) {}
    }

    try {
      await fetch(`/api/users/${userId}/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
    } catch (e) {}
  };


  // Department CRUD Operations (connected to real backend & database)
  const createDepartment = async (
    dept: Omit<Department, 'id'>
  ): Promise<{ success: boolean; message: string; data?: Department }> => {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dept)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.message && data.message.toLowerCase().includes('token')) {
          try {
            localStorage.removeItem('cfms_token');
          } catch {}
        }
        return {
          success: false,
          message: data.message || 'Failed to create department.'
        };
      }
      await refreshDepartments();
      addActivityLog('admin', 'Admin', 'ADMIN', 'CREATE_DEPARTMENT', 'Department Management', `Created department ${dept.name}`);
      return {
        success: true,
        message: data.message || 'Department added successfully.',
        data: data.data
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error occurred while creating department.'
      };
    }
  };

  const updateDepartment = async (
    deptId: string,
    data: Partial<Department>
  ): Promise<{ success: boolean; message: string; data?: Department }> => {
    try {
      const res = await fetch(`/api/departments/${deptId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const dataRes = await res.json();
      if (!res.ok || !dataRes.success) {
        return {
          success: false,
          message: dataRes.message || 'Failed to update department.'
        };
      }
      await refreshDepartments();
      addActivityLog('admin', 'Admin', 'ADMIN', 'UPDATE_DEPARTMENT', 'Department Management', `Updated department ${deptId}`);
      return {
        success: true,
        message: dataRes.message || 'Department updated successfully.',
        data: dataRes.data
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error occurred while updating department.'
      };
    }
  };

  const deleteDepartment = async (
    deptId: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/departments/${deptId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Failed to delete department.'
        };
      }
      await refreshDepartments();
      addActivityLog('admin', 'Admin', 'ADMIN', 'DELETE_DEPARTMENT', 'Department Management', `Deleted department ${deptId}`);
      return {
        success: true,
        message: data.message || 'Department deleted successfully.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error occurred while deleting department.'
      };
    }
  };

  // Campus CRUD Operations (connected to real backend & database)
  const createCampus = async (
    campusData: Omit<Campus, 'id'>
  ): Promise<{ success: boolean; message: string; data?: Campus }> => {
    try {
      const res = await fetch('/api/campuses', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(campusData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Failed to create campus.'
        };
      }
      await refreshCampuses();
      addActivityLog('admin', 'Admin', 'ADMIN', 'CREATE_CAMPUS', 'Campus Management', `Created campus ${campusData.name}`);
      return {
        success: true,
        message: data.message || 'Campus added successfully.',
        data: data.data
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error occurred while creating campus.'
      };
    }
  };

  const updateCampus = async (
    id: string,
    data: Partial<Campus>
  ): Promise<{ success: boolean; message: string; data?: Campus }> => {
    try {
      const res = await fetch(`/api/campuses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const dataRes = await res.json();
      if (!res.ok || !dataRes.success) {
        return {
          success: false,
          message: dataRes.message || 'Failed to update campus.'
        };
      }
      await refreshCampuses();
      addActivityLog('admin', 'Admin', 'ADMIN', 'UPDATE_CAMPUS', 'Campus Management', `Updated campus ${id}`);
      return {
        success: true,
        message: dataRes.message || 'Campus updated successfully.',
        data: dataRes.data
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error occurred while updating campus.'
      };
    }
  };

  const deleteCampus = async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/campuses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Failed to delete campus.'
        };
      }
      await refreshCampuses();
      addActivityLog('admin', 'Admin', 'ADMIN', 'DELETE_CAMPUS', 'Campus Management', `Deleted campus ${id}`);
      return {
        success: true,
        message: data.message || 'Campus deleted successfully.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error occurred while deleting campus.'
      };
    }
  };

  const refreshCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCourses(data.data);
      }
    } catch {}
  };

  const createCourse = async (course: Omit<Course, 'id'>): Promise<{ success: boolean; message: string; data?: Course }> => {
    const tempId = `course-${Date.now()}`;
    const newCourse = { ...course, id: tempId, status: course.status || 'Active' } as Course;
    setCourses((prev) => [...prev, newCourse]);
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
      const data = await res.json();
      await refreshCourses();
      addActivityLog('admin', 'Admin', 'ADMIN', 'CREATE_COURSE', 'Course Management', `Created course ${course.code} - ${course.title}`);
      return { success: true, message: 'Course created successfully', data: data.data || newCourse };
    } catch (e: any) {
      return { success: true, message: 'Course created locally', data: newCourse };
    }
  };

  const updateCourse = async (courseId: string, data: Partial<Course>): Promise<{ success: boolean; message: string; data?: Course }> => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...data } : c))
    );
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      await refreshCourses();
      addActivityLog('admin', 'Admin', 'ADMIN', 'UPDATE_COURSE', 'Course Management', `Updated course ID ${courseId}`);
      return { success: true, message: 'Course updated successfully', data: resData.data };
    } catch (e: any) {
      return { success: true, message: 'Course updated' };
    }
  };

  const deleteCourse = async (courseId: string): Promise<{ success: boolean; message: string }> => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    try {
      await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      await refreshCourses();
      addActivityLog('admin', 'Admin', 'ADMIN', 'DELETE_COURSE', 'Course Management', `Deleted course ID ${courseId}`);
      return { success: true, message: 'Course deleted successfully' };
    } catch (e: any) {
      return { success: true, message: 'Course removed' };
    }
  };

  const archiveCourse = async (courseId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    const res = await updateCourse(courseId, {
      status: 'Archived',
      archiveReason: reason || 'Curriculum Revision: Archived by Administrator',
      archivedAt: new Date().toISOString()
    } as any);
    return { success: res.success, message: res.message || 'Course archived successfully.' };
  };

  const restoreCourse = async (courseId: string): Promise<{ success: boolean; message: string }> => {
    const res = await updateCourse(courseId, {
      status: 'Active',
      archiveReason: undefined,
      archivedAt: undefined
    } as any);
    return { success: res.success, message: res.message || 'Course restored to active curriculum.' };
  };

  const createSession = async (sess: Omit<AcademicSession, 'id'>) => {
    const tempId = `sess-${Date.now()}`;
    const newSess: AcademicSession = { ...sess, id: tempId, fileCount: sess.fileCount || 0 };
    if (sess.isCurrent) {
      setSessions((prev) => prev.map((s) => ({ ...s, isCurrent: false })));
    }
    setSessions((prev) => [newSess, ...prev]);

    try {
      const res = await fetch('/api/system/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sess)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSessions((prev) => prev.map((s) => (s.id === tempId ? data.data : s)));
      }
    } catch (e) {}
  };

  // Deadlines & Announcements
  const createDeadline = async (dl: Omit<DeadlineItem, 'id'>) => {
    const tempId = `dl-${Date.now()}`;
    const newDl = { ...dl, id: tempId };
    setDeadlines((prev) => [newDl, ...prev]);

    try {
      const res = await fetch('/api/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dl)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDeadlines((prev) => prev.map((d) => (d.id === tempId ? data.data : d)));
      }
    } catch (e) {}
  };

  const createAnnouncement = async (anc: Omit<Announcement, 'id' | 'createdDate'>) => {
    const tempId = `anc-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newAnc: Announcement = { ...anc, id: tempId, createdDate: today };
    setAnnouncements((prev) => [newAnc, ...prev]);

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anc)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAnnouncements((prev) => prev.map((a) => (a.id === tempId ? data.data : a)));
      }
    } catch (e) {}
  };

  // Notifications & Feedback
  const markNotificationAsRead = async (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
    try {
      await fetch(`/api/notifications/${notifId}/read`, { method: 'PATCH' });
    } catch (e) {}
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    try {
      await fetch('/api/notifications/clear-all', { method: 'POST' });
    } catch (e) {}
  };

  const submitFeedback = async (fb: Omit<FeedbackItem, 'id' | 'createdAt' | 'status'>) => {
    const item: FeedbackItem = {
      ...fb,
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Open'
    };
    setFeedbackList((prev) => [item, ...prev]);
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fb)
      });
    } catch (e) {}
  };

  const respondToFeedback = async (id: string, response: string) => {
    setFeedbackList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, response, status: 'Resolved' } : f))
    );
    try {
      await fetch(`/api/feedback/${id}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      });
    } catch (e) {}
  };

  const updateSettings = async (newSettings: Partial<SystemSetting>) => {
    setSystemSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
    } catch (e) {}
  };



  const refreshTeacherRequests = async () => {
    try {
      const res = await fetch('/api/teacher-requests', {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTeacherRequests(data.data);
      }
    } catch {}
  };

  const approveTeacherRequest = async (requestId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/teacher-requests/${requestId}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setTeacherRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? { ...r, status: 'Approved', reviewedAt: new Date().toISOString() }
              : r
          )
        );
        setUsersList((prev) =>
          prev.map((u) => {
            const req = teacherRequests.find((r) => r.id === requestId);
            if (req && (u.id === req.teacherId || u.email.toLowerCase() === req.teacherEmail.toLowerCase())) {
              return {
                ...u,
                enrollmentStatus: 'Approved',
                departmentId: req.departmentId,
                departmentName: req.departmentName,
                role: req.teacherType,
                totalCredits: req.totalCredits,
                selectedCourseIds: req.selectedCourses.map((c) => c.courseId)
              };
            }
            return u;
          })
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const rejectTeacherRequest = async (requestId: string, reason: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/teacher-requests/${requestId}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.success) {
        setTeacherRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? { ...r, status: 'Rejected', rejectionReason: reason, reviewedAt: new Date().toISOString() }
              : r
          )
        );
        setUsersList((prev) =>
          prev.map((u) => {
            const req = teacherRequests.find((r) => r.id === requestId);
            if (req && (u.id === req.teacherId || u.email.toLowerCase() === req.teacherEmail.toLowerCase())) {
              return {
                ...u,
                enrollmentStatus: 'Rejected',
                rejectionReason: reason
              };
            }
            return u;
          })
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const assignDepartmentHOD = async (deptId: string, hodId: string, hodName: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/departments/${deptId}/assign-hod`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hodId, hodName })
      });
      const data = await res.json();
      if (data.success) {
        setDepartments((prev) =>
          prev.map((d) => (d.id === deptId ? { ...d, hodId, hodName } : d))
        );
        refreshTeacherRequests();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const refreshHODAssignments = async () => {
    try {
      const res = await fetch('/api/hod-assignments', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setHodAssignments(data.data);
      }
    } catch {}
  };

  const createHODAssignment = async (assignment: Omit<HODAssignment, 'id'>): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/hod-assignments', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'x-user-role': 'ADMIN'
        },
        body: JSON.stringify(assignment)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setHodAssignments((prev) => {
          const exists = prev.some((a) => a.id === data.data.id);
          return exists ? prev.map((a) => (a.id === data.data.id ? data.data : a)) : [...prev, data.data];
        });
        refreshHODAssignments();
        fetch('/api/users')
          .then((r) => r.json())
          .then((uData) => {
            if (uData.success && Array.isArray(uData.data)) setUsersList(uData.data);
          })
          .catch(() => {});
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Server rejected HOD assignment.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error while assigning HOD.' };
    }
  };

  const updateHODAssignment = async (id: string, data: Partial<HODAssignment>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/hod-assignments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success) {
        setHodAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteHODAssignment = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/hod-assignments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setHodAssignments((prev) => prev.filter((a) => a.id !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const resetHODPassword = async (id: string, newPassword: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/hod-assignments/${id}/reset-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  };

  // Section Management Methods
  const refreshSections = async () => {
    try {
      const res = await fetch('/api/sections', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setSections(data.data);
      }
    } catch {}
  };

  const createSection = async (sectionData: Partial<Section>): Promise<{ success: boolean; message: string; data?: Section }> => {
    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sectionData)
      });
      const data = await res.json();
      if (data.success) {
        await refreshSections();
        return { success: true, message: data.message || 'Section created successfully.', data: data.data };
      }
      return { success: false, message: data.message || 'Failed to create section.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error creating section.' };
    }
  };

  const updateSection = async (id: string, data: Partial<Section>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/sections/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success) {
        await refreshSections();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteSection = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/sections/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        await refreshSections();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Teacher Assignment Methods
  const refreshTeacherAssignments = async () => {
    try {
      const res = await fetch('/api/teacher-assignments', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTeacherAssignments(data.data);
      }
    } catch {}
  };

  const createTeacherAssignment = async (assignment: Partial<TeacherAssignment>): Promise<{ success: boolean; message: string; data?: TeacherAssignment }> => {
    try {
      const res = await fetch('/api/teacher-assignments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(assignment)
      });
      const data = await res.json();
      if (data.success) {
        await refreshTeacherAssignments();
        return { success: true, message: data.message || 'Teacher assigned successfully.', data: data.data };
      }
      return { success: false, message: data.message || 'Failed to assign teacher.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error assigning teacher.' };
    }
  };

  const updateTeacherAssignment = async (id: string, data: Partial<TeacherAssignment>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/teacher-assignments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (resData.success) {
        await refreshTeacherAssignments();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteTeacherAssignment = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/teacher-assignments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        await refreshTeacherAssignments();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const fetchMyAssignments = async (teacherId?: string): Promise<{ hasAssignments: boolean; departments: any[]; assignments: any[] }> => {
    try {
      const url = teacherId ? `/api/teacher-assignments/my-assignments?teacherId=${teacherId}` : '/api/teacher-assignments/my-assignments';
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success && data.data) {
        return {
          hasAssignments: data.hasAssignments,
          departments: data.data.departments || [],
          assignments: data.data.assignments || []
        };
      }
      return { hasAssignments: false, departments: [], assignments: [] };
    } catch {
      return { hasAssignments: false, departments: [], assignments: [] };
    }
  };

  return (
    <CFMSContext.Provider
      value={{
        courseFiles,
        departments,
        createDepartment,
        updateDepartment,
        deleteDepartment,
        refreshDepartments,
        courses,
        categories,
        deadlines,
        announcements,
        notifications,
        sessions,
        createSession,
        submissionWindow,
        activityLogs,
        auditLogs,
        feedbackList,
        usersList,
        systemSettings,
        campuses,
        createCampus,
        updateCampus,
        deleteCampus,
        refreshCampuses,
        hodAssignments,
        createHODAssignment,
        updateHODAssignment,
        deleteHODAssignment,
        resetHODPassword,
        refreshHODAssignments,
        sections,
        createSection,
        updateSection,
        deleteSection,
        refreshSections,
        teacherAssignments,
        activeTeacherSetup,
        setActiveTeacherSetup,
        createTeacherAssignment,
        updateTeacherAssignment,
        deleteTeacherAssignment,
        refreshTeacherAssignments,
        fetchMyAssignments,
        teacherRequests,
        approveTeacherRequest,
        rejectTeacherRequest,
        assignDepartmentHOD,
        refreshTeacherRequests,
        uploadCourseFile,
        updateFileStatus,
        updateCourseFileStatus,
        uploadNewFileVersion,
        archiveCourseFile,
        restoreCourseFile,
        softDeleteCourseFile,
        permanentlyDeleteFile,
        updateSubmissionWindow,
        uploadAdminTemplate,
        createUser,
        updateUser,
        toggleUserStatus,
        deleteUser,
        resetUserPassword,
        createCourse,
        updateCourse,
        deleteCourse,
        archiveCourse,
        restoreCourse,
        refreshCourses,
        createDeadline,
        createAnnouncement,
        markNotificationAsRead,
        clearAllNotifications,
        submitFeedback,
        respondToFeedback,
        updateSettings,
        addActivityLog
      }}
    >
      {children}
    </CFMSContext.Provider>
  );
};

export const useCFMS = () => {
  const context = useContext(CFMSContext);
  if (!context) {
    throw new Error('useCFMS must be used within a CFMSProvider');
  }
  return context;
};
