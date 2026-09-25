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
  TeacherEnrollmentRequest
} from '../types';
import {
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
  INITIAL_SYSTEM_SETTINGS
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
  createDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (deptId: string, data: Partial<Department>) => void;
  createCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (courseId: string, data: Partial<Course>) => void;

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
}

const CFMSContext = createContext<CFMSContextType | undefined>(undefined);

export const CFMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courseFiles, setCourseFiles] = useState<CourseFileItem[]>(INITIAL_COURSE_FILES);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [categories, setCategories] = useState<FileCategory[]>(INITIAL_CATEGORIES);
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
  const [teacherRequests, setTeacherRequests] = useState<TeacherEnrollmentRequest[]>([]);

  // Sync initial state from backend APIs
  useEffect(() => {
    fetch('/api/teacher-requests')
      .then((res) => res.json())
      .then((res) => { if (res.success && Array.isArray(res.data)) setTeacherRequests(res.data); })
      .catch(() => {});

    fetch('/api/course-files')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data.length > 0) setCourseFiles(res.data); })
      .catch(() => {});

    fetch('/api/departments')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data.length > 0) setDepartments(res.data); })
      .catch(() => {});

    fetch('/api/courses')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data.length > 0) setCourses(res.data); })
      .catch(() => {});

    fetch('/api/deadlines')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data.length > 0) setDeadlines(res.data); })
      .catch(() => {});

    fetch('/api/announcements')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data.length > 0) setAnnouncements(res.data); })
      .catch(() => {});

    fetch('/api/users')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data.length > 0) setUsersList(res.data); })
      .catch(() => {});

    fetch('/api/system/submission-window')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data) setSubmissionWindow(res.data); })
      .catch(() => {});

    fetch('/api/notifications')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data.length > 0) setNotifications(res.data); })
      .catch(() => {});

    fetch('/api/audit-logs')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data.length > 0) setAuditLogs(res.data); })
      .catch(() => {});

    fetch('/api/feedback')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data.length > 0) setFeedbackList(res.data); })
      .catch(() => {});

    fetch('/api/settings')
      .then((res) => res.json())
      .then((res) => { if (res.success && res.data) setSystemSettings(res.data); })
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
      await fetch('/api/course-files/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileData)
      });
    } catch (e) {}
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


  // Dept & Course
  const createDepartment = async (dept: Omit<Department, 'id'>) => {
    setDepartments((prev) => [...prev, { ...dept, id: `dept-${Date.now()}` }]);
    try {
      await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dept)
      });
    } catch (e) {}
  };

  const updateDepartment = async (deptId: string, data: Partial<Department>) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === deptId ? { ...d, ...data } : d))
    );
    try {
      await fetch(`/api/departments/${deptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {}
  };

  const createCourse = async (course: Omit<Course, 'id'>) => {
    setCourses((prev) => [...prev, { ...course, id: `course-${Date.now()}` }]);
    try {
      await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
    } catch (e) {}
  };

  const updateCourse = async (courseId: string, data: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...data } : c))
    );
    try {
      await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {}
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

  const getAuthHeaders = () => {
    try {
      const raw = localStorage.getItem('cfms_current_user');
      if (raw) {
        const u = JSON.parse(raw);
        return {
          'Content-Type': 'application/json',
          'x-user-id': u.id || '',
          'x-user-role': u.role || '',
          'x-user-department-id': u.departmentId || ''
        };
      }
    } catch {}
    return { 'Content-Type': 'application/json' };
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

  return (
    <CFMSContext.Provider
      value={{
        courseFiles,
        departments,
        courses,
        categories,
        deadlines,
        announcements,
        notifications,
        sessions,
        submissionWindow,
        activityLogs,
        auditLogs,
        feedbackList,
        usersList,
        systemSettings,
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
        createDepartment,
        updateDepartment,
        createCourse,
        updateCourse,
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
