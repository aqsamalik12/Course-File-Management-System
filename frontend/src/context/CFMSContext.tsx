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

import { safeJson } from '../utils/safeJson';
export { safeJson };

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(fallback)) {
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as unknown as T;
      } else if (parsed && typeof parsed === 'object') {
        return parsed as unknown as T;
      }
    }
  } catch {}
  return fallback;
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

const CFMSContext = createContext<CFMSContextType | undefined>(undefined);

export const CFMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courseFiles, setCourseFiles] = useState<CourseFileItem[]>(() => loadStorage('cfms_course_files', INITIAL_COURSE_FILES));
  const [departments, setDepartments] = useState<Department[]>(() => loadStorage('cfms_departments', INITIAL_DEPARTMENTS));
  const [courses, setCourses] = useState<Course[]>(() => loadStorage('cfms_courses', INITIAL_COURSES));
  const [categories, setCategories] = useState<FileCategory[]>(INITIAL_CATEGORIES);
  const [hodAssignments, setHodAssignments] = useState<HODAssignment[]>(() => loadStorage('cfms_hod_assignments', INITIAL_HOD_ASSIGNMENTS));
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>(() => loadStorage('cfms_deadlines', INITIAL_DEADLINES));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadStorage('cfms_announcements', INITIAL_ANNOUNCEMENTS));
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [sessions, setSessions] = useState<AcademicSession[]>(() => loadStorage('cfms_sessions', INITIAL_SESSIONS));
  const [submissionWindow, setSubmissionWindow] = useState<SubmissionWindow>(INITIAL_SUBMISSION_WINDOW);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(INITIAL_FEEDBACK);
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [systemSettings, setSystemSettings] = useState<SystemSetting>(INITIAL_SYSTEM_SETTINGS);
  const [campuses, setCampuses] = useState<Campus[]>(() => loadStorage('cfms_campuses', INITIAL_CAMPUSES));
  const [teacherRequests, setTeacherRequests] = useState<TeacherEnrollmentRequest[]>(() => loadStorage('cfms_teacher_requests', []));
  const [sections, setSections] = useState<Section[]>(() => loadStorage('cfms_sections', []));
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>(() => loadStorage('cfms_teacher_assignments', []));
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
      const data = await safeJson(res);
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        setCampuses(data.data);
        saveStorage('cfms_campuses', data.data);
      }
    } catch {}
  };

  const refreshDepartments = async () => {
    try {
      const res = await fetch('/api/departments', { headers: getAuthHeaders() });
      const data = await safeJson(res);
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        setDepartments(data.data);
        saveStorage('cfms_departments', data.data);
      }
    } catch {}
  };

  // Optimized data loading: Core tier first, deferred non-critical data after initial paint
  useEffect(() => {
    let isMounted = true;
    const authHeaders = getAuthHeaders();

    // Tier 1: Core academic entities required immediately for UI layout & dropdowns
    const loadCoreData = async () => {
      try {
        const [campRes, deptRes, crsRes, hodRes, cfRes, reqRes] = await Promise.all([
          fetch('/api/campuses', { headers: authHeaders }).catch(() => null),
          fetch('/api/departments', { headers: authHeaders }).catch(() => null),
          fetch('/api/courses', { headers: authHeaders }).catch(() => null),
          fetch('/api/hod-assignments', { headers: authHeaders }).catch(() => null),
          fetch('/api/course-files', { headers: authHeaders }).catch(() => null),
          fetch('/api/teacher-requests', { headers: authHeaders }).catch(() => null)
        ]);

        const [campData, deptData, crsData, hodData, cfData, reqData] = await Promise.all([
          campRes ? safeJson(campRes) : null,
          deptRes ? safeJson(deptRes) : null,
          crsRes ? safeJson(crsRes) : null,
          hodRes ? safeJson(hodRes) : null,
          cfRes ? safeJson(cfRes) : null,
          reqRes ? safeJson(reqRes) : null
        ]);

        if (!isMounted) return;
        if (campData?.success && Array.isArray(campData.data) && campData.data.length > 0) {
          setCampuses(campData.data);
          saveStorage('cfms_campuses', campData.data);
        }
        if (deptData?.success && Array.isArray(deptData.data) && deptData.data.length > 0) {
          setDepartments(deptData.data);
          saveStorage('cfms_departments', deptData.data);
        }
        if (crsData?.success && Array.isArray(crsData.data) && crsData.data.length > 0) {
          setCourses(crsData.data);
          saveStorage('cfms_courses', crsData.data);
        }
        if (hodData?.success && Array.isArray(hodData.data) && hodData.data.length > 0) {
          setHodAssignments(hodData.data);
          saveStorage('cfms_hod_assignments', hodData.data);
        }
        if (cfData?.success && Array.isArray(cfData.data) && cfData.data.length > 0) {
          setCourseFiles(cfData.data);
          saveStorage('cfms_course_files', cfData.data);
        }
        if (reqData?.success && Array.isArray(reqData.data) && reqData.data.length > 0) {
          setTeacherRequests(reqData.data);
          saveStorage('cfms_teacher_requests', reqData.data);
        }
      } catch (err) {
        console.warn('[CFMS] Core load non-fatal error:', err);
      }
    };

    // Tier 2: Ancillary info loaded slightly deferred so main layout is interactive immediately
    const loadSecondaryData = () => {
      setTimeout(async () => {
        if (!isMounted) return;
        try {
          const [notifRes, winRes, dlnRes, annRes, usrRes] = await Promise.all([
            fetch('/api/notifications', { headers: authHeaders }).catch(() => null),
            fetch('/api/system/submission-window', { headers: authHeaders }).catch(() => null),
            fetch('/api/deadlines', { headers: authHeaders }).catch(() => null),
            fetch('/api/announcements', { headers: authHeaders }).catch(() => null),
            fetch('/api/users', { headers: authHeaders }).catch(() => null)
          ]);

          const [notifData, winData, dlnData, annData, usrData] = await Promise.all([
            notifRes ? safeJson(notifRes) : null,
            winRes ? safeJson(winRes) : null,
            dlnRes ? safeJson(dlnRes) : null,
            annRes ? safeJson(annRes) : null,
            usrRes ? safeJson(usrRes) : null
          ]);

          if (!isMounted) return;
          if (notifData?.success && Array.isArray(notifData.data)) setNotifications(notifData.data);
          if (winData?.success && winData.data) setSubmissionWindow(winData.data);
          if (dlnData?.success && Array.isArray(dlnData.data)) setDeadlines(dlnData.data);
          if (annData?.success && Array.isArray(annData.data)) setAnnouncements(annData.data);
          if (usrData?.success && Array.isArray(usrData.data)) setUsersList(usrData.data);
        } catch {}
      }, 300);
    };

    loadCoreData();
    loadSecondaryData();

    return () => {
      isMounted = false;
    };
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

    setCourseFiles((prev) => {
      const updated = [newFile, ...prev];
      saveStorage('cfms_course_files', updated);
      return updated;
    });

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
      const data = await safeJson(res);
      if (res.ok && data?.success && data.data) {
        setCourseFiles((prev) => {
          const synced = prev.map((f) => (f.id === fileId ? data.data : f));
          saveStorage('cfms_course_files', synced);
          return synced;
        });
      }
    } catch (e: any) {
      // Offline fallback: keep locally saved file
    }
  };

  const updateFileStatus = async (fileId: string, status: FileStatus, remarks?: string, reviewerName?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const isApproved = status === 'Approved';

    setCourseFiles((prev) => {
      const updated = prev.map((f) => {
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
      });
      saveStorage('cfms_course_files', updated);
      return updated;
    });

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
    setCourseFiles((prev) => {
      const updated = prev.map((f) => (f.id === fileId ? { ...f, archived: true } : f));
      saveStorage('cfms_course_files', updated);
      return updated;
    });
    try {
      await fetch(`/api/course-files/${fileId}/archive`, { method: 'PATCH' });
    } catch (e) {}
  };

  const restoreCourseFile = async (fileId: string) => {
    setCourseFiles((prev) => {
      const updated = prev.map((f) => (f.id === fileId ? { ...f, archived: false, deleted: false } : f));
      saveStorage('cfms_course_files', updated);
      return updated;
    });
    try {
      await fetch(`/api/course-files/${fileId}/restore`, { method: 'PATCH' });
    } catch (e) {}
  };

  const softDeleteCourseFile = async (fileId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setCourseFiles((prev) => {
      const updated = prev.map((f) => (f.id === fileId ? { ...f, deleted: true, deletedAt: today } : f));
      saveStorage('cfms_course_files', updated);
      return updated;
    });
    try {
      await fetch(`/api/course-files/${fileId}/soft`, { method: 'DELETE' });
    } catch (e) {}
  };

  const permanentlyDeleteFile = async (fileId: string) => {
    setCourseFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      saveStorage('cfms_course_files', updated);
      return updated;
    });
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
  // Department CRUD Operations (offline-first & real backend synced)
  const createDepartment = async (
    dept: Omit<Department, 'id'>
  ): Promise<{ success: boolean; message: string; data?: Department }> => {
    const tempId = `dept-${Date.now()}`;
    const newDept: Department = {
      ...dept,
      id: tempId,
      code: dept.code ? dept.code.toUpperCase() : 'DEPT',
      status: dept.status || 'Active',
      totalCourses: dept.totalCourses || 0,
      totalTeachers: dept.totalTeachers || 0
    };

    setDepartments((prev) => {
      const updated = [newDept, ...prev.filter((d) => d.name.toLowerCase() !== dept.name.toLowerCase())];
      saveStorage('cfms_departments', updated);
      return updated;
    });
    addActivityLog('admin', 'Admin', 'ADMIN', 'CREATE_DEPARTMENT', 'Department Management', `Created department ${dept.name}`);

    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(dept)
      });
      const data = await safeJson(res);
      if (res.ok && data?.success && data.data) {
        setDepartments((prev) => {
          const synced = prev.map((d) => (d.id === tempId ? data.data : d));
          saveStorage('cfms_departments', synced);
          return synced;
        });
        return {
          success: true,
          message: data.message || 'Department added successfully.',
          data: data.data
        };
      }
    } catch {}

    return {
      success: true,
      message: 'Department added successfully.',
      data: newDept
    };
  };

  const updateDepartment = async (
    deptId: string,
    data: Partial<Department>
  ): Promise<{ success: boolean; message: string; data?: Department }> => {
    let updatedDept: Department | undefined;
    setDepartments((prev) => {
      const updated = prev.map((d) => {
        if (d.id === deptId) {
          updatedDept = { ...d, ...data };
          return updatedDept;
        }
        return d;
      });
      saveStorage('cfms_departments', updated);
      return updated;
    });
    addActivityLog('admin', 'Admin', 'ADMIN', 'UPDATE_DEPARTMENT', 'Department Management', `Updated department ${deptId}`);

    try {
      const res = await fetch(`/api/departments/${deptId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const dataRes = await safeJson(res);
      if (res.ok && dataRes?.success && dataRes.data) {
        setDepartments((prev) => {
          const synced = prev.map((d) => (d.id === deptId ? dataRes.data : d));
          saveStorage('cfms_departments', synced);
          return synced;
        });
        return {
          success: true,
          message: dataRes.message || 'Department updated successfully.',
          data: dataRes.data
        };
      }
    } catch {}

    return {
      success: true,
      message: 'Department updated successfully.',
      data: updatedDept
    };
  };

  const deleteDepartment = async (
    deptId: string
  ): Promise<{ success: boolean; message: string }> => {
    setDepartments((prev) => {
      const updated = prev.filter((d) => d.id !== deptId);
      saveStorage('cfms_departments', updated);
      return updated;
    });
    addActivityLog('admin', 'Admin', 'ADMIN', 'DELETE_DEPARTMENT', 'Department Management', `Deleted department ${deptId}`);

    try {
      const res = await fetch(`/api/departments/${deptId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await safeJson(res);
    } catch {}

    return {
      success: true,
      message: 'Department deleted successfully.'
    };
  };

  // Campus CRUD Operations (offline-first & real backend synced)
  const createCampus = async (
    campusData: Omit<Campus, 'id'>
  ): Promise<{ success: boolean; message: string; data?: Campus }> => {
    const tempId = `camp-${Date.now()}`;
    const newCampus: Campus = {
      ...campusData,
      id: tempId,
      code: campusData.code ? campusData.code.toUpperCase() : 'CAMP',
      status: campusData.status || 'Active'
    };

    setCampuses((prev) => {
      const updated = [newCampus, ...prev.filter((c) => c.name.toLowerCase() !== campusData.name.toLowerCase())];
      saveStorage('cfms_campuses', updated);
      return updated;
    });
    addActivityLog('admin', 'Admin', 'ADMIN', 'CREATE_CAMPUS', 'Campus Management', `Created campus ${campusData.name}`);

    try {
      const res = await fetch('/api/campuses', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(campusData)
      });
      const data = await safeJson(res);
      if (res.ok && data?.success && data.data) {
        setCampuses((prev) => {
          const synced = prev.map((c) => (c.id === tempId ? data.data : c));
          saveStorage('cfms_campuses', synced);
          return synced;
        });
        return {
          success: true,
          message: data.message || 'Campus added successfully.',
          data: data.data
        };
      }
    } catch {}

    return {
      success: true,
      message: 'Campus added successfully.',
      data: newCampus
    };
  };

  const updateCampus = async (
    id: string,
    data: Partial<Campus>
  ): Promise<{ success: boolean; message: string; data?: Campus }> => {
    let updatedCampus: Campus | undefined;
    setCampuses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          updatedCampus = { ...c, ...data };
          return updatedCampus;
        }
        return c;
      });
      saveStorage('cfms_campuses', updated);
      return updated;
    });
    addActivityLog('admin', 'Admin', 'ADMIN', 'UPDATE_CAMPUS', 'Campus Management', `Updated campus ${id}`);

    try {
      const res = await fetch(`/api/campuses/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const dataRes = await safeJson(res);
      if (res.ok && dataRes?.success && dataRes.data) {
        setCampuses((prev) => {
          const synced = prev.map((c) => (c.id === id ? dataRes.data : c));
          saveStorage('cfms_campuses', synced);
          return synced;
        });
        return {
          success: true,
          message: dataRes.message || 'Campus updated successfully.',
          data: dataRes.data
        };
      }
    } catch {}

    return {
      success: true,
      message: 'Campus updated successfully.',
      data: updatedCampus
    };
  };

  const deleteCampus = async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    setCampuses((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveStorage('cfms_campuses', updated);
      return updated;
    });
    addActivityLog('admin', 'Admin', 'ADMIN', 'DELETE_CAMPUS', 'Campus Management', `Deleted campus ${id}`);

    try {
      const res = await fetch(`/api/campuses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await safeJson(res);
    } catch {}

    return {
      success: true,
      message: 'Campus deleted successfully.'
    };
  };

  const refreshCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await safeJson(res);
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        setCourses(data.data);
        saveStorage('cfms_courses', data.data);
      }
    } catch {}
  };

  const createCourse = async (course: Omit<Course, 'id'>): Promise<{ success: boolean; message: string; data?: Course }> => {
    const tempId = `course-${Date.now()}`;
    const newCourse = { ...course, id: tempId, status: course.status || 'Active' } as Course;
    setCourses((prev) => {
      const updated = [...prev, newCourse];
      saveStorage('cfms_courses', updated);
      return updated;
    });
    addActivityLog('admin', 'Admin', 'ADMIN', 'CREATE_COURSE', 'Course Management', `Created course ${course.code} - ${course.title}`);

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course)
      });
      const data = await safeJson(res);
      if (res.ok && data?.success && data.data) {
        setCourses((prev) => {
          const synced = prev.map((c) => (c.id === tempId ? data.data : c));
          saveStorage('cfms_courses', synced);
          return synced;
        });
        return { success: true, message: data.message || 'Course created successfully', data: data.data };
      }
    } catch {}

    return { success: true, message: 'Course created successfully', data: newCourse };
  };

  const updateCourse = async (courseId: string, data: Partial<Course>): Promise<{ success: boolean; message: string; data?: Course }> => {
    let updatedCourse: Course | undefined;
    setCourses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === courseId) {
          updatedCourse = { ...c, ...data };
          return updatedCourse;
        }
        return c;
      });
      saveStorage('cfms_courses', updated);
      return updated;
    });
    addActivityLog('admin', 'Admin', 'ADMIN', 'UPDATE_COURSE', 'Course Management', `Updated course ID ${courseId}`);

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await safeJson(res);
      if (res.ok && resData?.success && resData.data) {
        setCourses((prev) => {
          const synced = prev.map((c) => (c.id === courseId ? resData.data : c));
          saveStorage('cfms_courses', synced);
          return synced;
        });
        return { success: true, message: resData.message || 'Course updated successfully', data: resData.data };
      }
    } catch {}

    return { success: true, message: 'Course updated successfully', data: updatedCourse };
  };

  const deleteCourse = async (courseId: string): Promise<{ success: boolean; message: string }> => {
    setCourses((prev) => {
      const updated = prev.filter((c) => c.id !== courseId);
      saveStorage('cfms_courses', updated);
      return updated;
    });
    addActivityLog('admin', 'Admin', 'ADMIN', 'DELETE_COURSE', 'Course Management', `Deleted course ID ${courseId}`);

    try {
      await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });
    } catch {}

    return { success: true, message: 'Course deleted successfully' };
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
    setSessions((prev) => {
      const updated = sess.isCurrent
        ? [newSess, ...prev.map((s) => ({ ...s, isCurrent: false }))]
        : [newSess, ...prev];
      saveStorage('cfms_sessions', updated);
      return updated;
    });

    try {
      const res = await fetch('/api/system/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sess)
      });
      const data = await safeJson(res);
      if (res.ok && data?.success && data.data) {
        setSessions((prev) => {
          const synced = prev.map((s) => (s.id === tempId ? data.data : s));
          saveStorage('cfms_sessions', synced);
          return synced;
        });
      }
    } catch {}
  };

  // Deadlines & Announcements
  const createDeadline = async (dl: Omit<DeadlineItem, 'id'>) => {
    const tempId = `dl-${Date.now()}`;
    const newDl = { ...dl, id: tempId };
    setDeadlines((prev) => {
      const updated = [newDl, ...prev];
      saveStorage('cfms_deadlines', updated);
      return updated;
    });

    try {
      const res = await fetch('/api/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dl)
      });
      const data = await safeJson(res);
      if (res.ok && data?.success && data.data) {
        setDeadlines((prev) => {
          const synced = prev.map((d) => (d.id === tempId ? data.data : d));
          saveStorage('cfms_deadlines', synced);
          return synced;
        });
      }
    } catch {}
  };

  const createAnnouncement = async (anc: Omit<Announcement, 'id' | 'createdDate'>) => {
    const tempId = `anc-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newAnc: Announcement = { ...anc, id: tempId, createdDate: today };
    setAnnouncements((prev) => {
      const updated = [newAnc, ...prev];
      saveStorage('cfms_announcements', updated);
      return updated;
    });

    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anc)
      });
      const data = await safeJson(res);
      if (res.ok && data?.success && data.data) {
        setAnnouncements((prev) => {
          const synced = prev.map((a) => (a.id === tempId ? data.data : a));
          saveStorage('cfms_announcements', synced);
          return synced;
        });
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
      const data = await safeJson(res);
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        setTeacherRequests(data.data);
        saveStorage('cfms_teacher_requests', data.data);
      }
    } catch {}
  };

  const approveTeacherRequest = async (requestId: string): Promise<boolean> => {
    setTeacherRequests((prev) => {
      const updated = prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'Approved' as const, reviewedAt: new Date().toISOString() }
          : r
      );
      saveStorage('cfms_teacher_requests', updated);
      return updated;
    });

    setUsersList((prev) =>
      prev.map((u) => {
        const req = teacherRequests.find((r) => r.id === requestId);
        if (req && (u.id === req.teacherId || u.email.toLowerCase() === req.teacherEmail.toLowerCase())) {
          return {
            ...u,
            enrollmentStatus: 'Approved' as const,
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

    try {
      const res = await fetch(`/api/teacher-requests/${requestId}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      await safeJson(res);
    } catch {}
    return true;
  };

  const rejectTeacherRequest = async (requestId: string, reason: string): Promise<boolean> => {
    setTeacherRequests((prev) => {
      const updated = prev.map((r) =>
        r.id === requestId
          ? { ...r, status: 'Rejected' as const, rejectionReason: reason, reviewedAt: new Date().toISOString() }
          : r
      );
      saveStorage('cfms_teacher_requests', updated);
      return updated;
    });

    setUsersList((prev) =>
      prev.map((u) => {
        const req = teacherRequests.find((r) => r.id === requestId);
        if (req && (u.id === req.teacherId || u.email.toLowerCase() === req.teacherEmail.toLowerCase())) {
          return {
            ...u,
            enrollmentStatus: 'Rejected' as const,
            rejectionReason: reason
          };
        }
        return u;
      })
    );

    try {
      const res = await fetch(`/api/teacher-requests/${requestId}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });
      await safeJson(res);
    } catch {}
    return true;
  };

  const assignDepartmentHOD = async (deptId: string, hodId: string, hodName: string): Promise<boolean> => {
    setDepartments((prev) => {
      const updated = prev.map((d) => (d.id === deptId ? { ...d, hodId, hodName } : d));
      saveStorage('cfms_departments', updated);
      return updated;
    });

    try {
      const res = await fetch(`/api/departments/${deptId}/assign-hod`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ hodId, hodName })
      });
      await safeJson(res);
    } catch {}
    return true;
  };

  const refreshHODAssignments = async () => {
    try {
      const res = await fetch('/api/hod-assignments', { headers: getAuthHeaders() });
      const data = await safeJson(res);
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        setHodAssignments(data.data);
        saveStorage('cfms_hod_assignments', data.data);
      }
    } catch {}
  };

  const createHODAssignment = async (assignment: Omit<HODAssignment, 'id'>): Promise<{ success: boolean; message?: string }> => {
    const tempId = `hod-asg-${Date.now()}`;
    const newAsg: HODAssignment = {
      ...assignment,
      id: tempId,
      assignedAt: new Date().toISOString()
    };
    setHodAssignments((prev) => {
      const updated = [newAsg, ...prev];
      saveStorage('cfms_hod_assignments', updated);
      return updated;
    });

    try {
      const res = await fetch('/api/hod-assignments', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'x-user-role': 'ADMIN'
        },
        body: JSON.stringify(assignment)
      });
      const data = await safeJson(res);
      if (res.ok && data?.success && data.data) {
        setHodAssignments((prev) => {
          const synced = prev.map((a) => (a.id === tempId ? data.data : a));
          saveStorage('cfms_hod_assignments', synced);
          return synced;
        });
        return { success: true, message: data.message || 'HOD assigned successfully.' };
      }
    } catch {}

    return { success: true, message: 'HOD assigned successfully.' };
  };

  const updateHODAssignment = async (id: string, data: Partial<HODAssignment>): Promise<boolean> => {
    setHodAssignments((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...data } : a));
      saveStorage('cfms_hod_assignments', updated);
      return updated;
    });

    try {
      const res = await fetch(`/api/hod-assignments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      await safeJson(res);
    } catch {}
    return true;
  };

  const deleteHODAssignment = async (id: string): Promise<boolean> => {
    setHodAssignments((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveStorage('cfms_hod_assignments', updated);
      return updated;
    });

    try {
      const res = await fetch(`/api/hod-assignments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await safeJson(res);
    } catch {}
    return true;
  };

  const resetHODPassword = async (id: string, newPassword: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/hod-assignments/${id}/reset-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ password: newPassword })
      });
      await safeJson(res);
    } catch {}
    return true;
  };

  // Section Management Methods
  const refreshSections = async () => {
    try {
      const res = await fetch('/api/sections', { headers: getAuthHeaders() });
      const data = await safeJson(res);
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        setSections(data.data);
        saveStorage('cfms_sections', data.data);
      }
    } catch {}
  };

  const createSection = async (sectionData: Partial<Section>): Promise<{ success: boolean; message: string; data?: Section }> => {
    const tempId = `sec-${Date.now()}`;
    const newSec: Section = {
      id: tempId,
      name: sectionData.name || 'A',
      departmentId: sectionData.departmentId || '',
      departmentName: sectionData.departmentName || '',
      campusId: sectionData.campusId || '',
      campusName: sectionData.campusName || '',
      status: sectionData.status || 'Active',
      academicSession: sectionData.academicSession || 'Fall 2024',
      ...(sectionData as Section)
    };

    setSections((prev) => {
      const updated = [newSec, ...prev];
      saveStorage('cfms_sections', updated);
      return updated;
    });

    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sectionData)
      });
      const data = await safeJson(res);
      if (res.ok && data?.success && data.data) {
        setSections((prev) => {
          const synced = prev.map((s) => (s.id === tempId ? data.data : s));
          saveStorage('cfms_sections', synced);
          return synced;
        });
        return { success: true, message: data.message || 'Section created successfully.', data: data.data };
      }
    } catch {}

    return { success: true, message: 'Section created successfully.', data: newSec };
  };

  const updateSection = async (id: string, data: Partial<Section>): Promise<boolean> => {
    setSections((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      saveStorage('cfms_sections', updated);
      return updated;
    });

    try {
      const res = await fetch(`/api/sections/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      await safeJson(res);
    } catch {}
    return true;
  };

  const deleteSection = async (id: string): Promise<boolean> => {
    setSections((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveStorage('cfms_sections', updated);
      return updated;
    });

    try {
      const res = await fetch(`/api/sections/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await safeJson(res);
    } catch {}
    return true;
  };

  // Teacher Assignment Methods
  const refreshTeacherAssignments = async () => {
    try {
      const res = await fetch('/api/teacher-assignments', { headers: getAuthHeaders() });
      const data = await safeJson(res);
      if (data?.success && Array.isArray(data.data) && data.data.length > 0) {
        setTeacherAssignments(data.data);
        saveStorage('cfms_teacher_assignments', data.data);
      }
    } catch {}
  };

  const createTeacherAssignment = async (assignment: Partial<TeacherAssignment>): Promise<{ success: boolean; message: string; data?: TeacherAssignment }> => {
    const tempId = `tasg-${Date.now()}`;
    const newAsg: TeacherAssignment = {
      id: tempId,
      teacherId: assignment.teacherId || '',
      teacherName: assignment.teacherName || '',
      teacherEmail: assignment.teacherEmail || '',
      departmentId: assignment.departmentId || '',
      departmentName: assignment.departmentName || '',
      sectionId: assignment.sectionId || '',
      sectionName: assignment.sectionName || '',
      courseId: assignment.courseId || '',
      courseCode: assignment.courseCode || '',
      courseName: assignment.courseName || '',
      campusId: assignment.campusId || '',
      campusName: assignment.campusName || '',
      hodId: assignment.hodId || '',
      hodName: assignment.hodName || '',
      status: assignment.status || 'Active',
      assignedAt: new Date().toISOString()
    };

    setTeacherAssignments((prev) => {
      const updated = [newAsg, ...prev];
      saveStorage('cfms_teacher_assignments', updated);
      return updated;
    });

    try {
      const res = await fetch('/api/teacher-assignments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(assignment)
      });
      const data = await safeJson(res);
      if (res.ok && data?.success && data.data) {
        setTeacherAssignments((prev) => {
          const synced = prev.map((t) => (t.id === tempId ? data.data : t));
          saveStorage('cfms_teacher_assignments', synced);
          return synced;
        });
        return { success: true, message: data.message || 'Teacher assigned successfully.', data: data.data };
      }
    } catch {}

    return { success: true, message: 'Teacher assigned successfully.', data: newAsg };
  };

  const updateTeacherAssignment = async (id: string, data: Partial<TeacherAssignment>): Promise<boolean> => {
    setTeacherAssignments((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...data } : t));
      saveStorage('cfms_teacher_assignments', updated);
      return updated;
    });

    try {
      const res = await fetch(`/api/teacher-assignments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      await safeJson(res);
    } catch {}
    return true;
  };

  const deleteTeacherAssignment = async (id: string): Promise<boolean> => {
    setTeacherAssignments((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveStorage('cfms_teacher_assignments', updated);
      return updated;
    });

    try {
      const res = await fetch(`/api/teacher-assignments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await safeJson(res);
    } catch {}
    return true;
  };

  const fetchMyAssignments = async (teacherId?: string): Promise<{ hasAssignments: boolean; departments: any[]; assignments: any[] }> => {
    try {
      const url = teacherId ? `/api/teacher-assignments/my-assignments?teacherId=${teacherId}` : '/api/teacher-assignments/my-assignments';
      const res = await fetch(url, { headers: getAuthHeaders() });
      const data = await safeJson(res);
      if (data?.success && data.data) {
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
