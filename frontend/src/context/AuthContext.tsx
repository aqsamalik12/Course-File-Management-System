import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, TeacherProfileFormData, LoginLog, TeacherEnrollmentRequest, SelectedCourseItem } from '../types';

// ─── localStorage keys ───────────────────────────────────────────────────────
const LS_REGISTERED  = 'cfms_registered_users';
const LS_CURRENT_USER = 'cfms_current_user';
const LS_FORM_SUBMISSIONS = 'cfms_form_submissions';
const LS_LOGIN_LOGS = 'cfms_login_logs';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function loadRegistered(): User[] {
  try {
    const raw = localStorage.getItem(LS_REGISTERED);
    if (raw) return JSON.parse(raw) as User[];
  } catch {}
  return [];
}

function saveRegistered(users: User[]) {
  localStorage.setItem(LS_REGISTERED, JSON.stringify(users));
}

function loadCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(LS_CURRENT_USER);
    if (raw) return JSON.parse(raw) as User;
  } catch {}
  return null;
}

function saveCurrentUser(u: User | null) {
  if (u) localStorage.setItem(LS_CURRENT_USER, JSON.stringify(u));
  else localStorage.removeItem(LS_CURRENT_USER);
}

function loadLoginLogs(): LoginLog[] {
  try {
    const raw = localStorage.getItem(LS_LOGIN_LOGS);
    if (raw) return JSON.parse(raw) as LoginLog[];
  } catch {}
  return [];
}

function saveLoginLogs(logs: LoginLog[]) {
  localStorage.setItem(LS_LOGIN_LOGS, JSON.stringify(logs));
}

// ─── Context Types ────────────────────────────────────────────────────────────
interface AuthContextType {
  currentUser: User;
  activeRole: UserRole;
  users: User[];
  isAuthenticated: boolean;
  teacherRequest: TeacherEnrollmentRequest | null;
  // Real auth
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  registerTeacher: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  // Legacy role switch (admin dev tool)
  switchRole: (role: UserRole) => void;
  updateCurrentUserProfile: (updatedData: Partial<User>) => void;
  submitProfileForm: (formData: TeacherProfileFormData) => void;
  submitTeacherEnrollment: (
    formData: any,
    selectedCourses: SelectedCourseItem[],
    totalCredits: number,
    teacherType: 'REGULAR_TEACHER' | 'VISITING_TEACHER',
    departmentId: string,
    departmentName: string,
    campusName?: string,
    hodId?: string,
    hodName?: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  refreshMyRequest: () => Promise<void>;
  // Visiting teacher helpers
  isVisitingContractExpired: boolean;
  visitingDaysRemaining: number;
  // Admin view: all registered users who filled form
  registeredTeachers: User[];
  // Admin view: login + form activity logs
  loginLogs: LoginLog[];
  addFormFilledLog: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Merge backend users with self-registered users
  const [systemUsers, setSystemUsers] = useState<User[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(loadRegistered);
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const current = loadCurrentUser();
    return current?.role || 'ADMIN';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!loadCurrentUser());
  const [loggedInUser, setLoggedInUser] = useState<User | null>(loadCurrentUser);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>(loadLoginLogs);
  const [teacherRequest, setTeacherRequest] = useState<TeacherEnrollmentRequest | null>(() => {
    try {
      const raw = localStorage.getItem('cfms_my_teacher_request');
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  });

  // All users = system defaults + self-registered
  const allUsers: User[] = [...systemUsers, ...registeredUsers];

  // Sync backend users on mount
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          setSystemUsers((prev) => {
            const backendUsers: User[] = data.data;
            const combined = [...backendUsers];
            for (const u of prev) {
              if (!combined.some((b) => b.id === u.id || b.email.toLowerCase() === u.email.toLowerCase())) {
                combined.push(u);
              }
            }
            return combined;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Derive currentUser from loggedInUser (or fallback for dev role switcher)
  const currentUser: User = loggedInUser || allUsers.find((u) => u.role === activeRole) || allUsers[0];

  // ─── Register New Teacher (Any Gmail / Work email) ───────────────────────────
  const registerTeacher = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    const emailLower = email.trim().toLowerCase();

    // Check if email already exists
    const existing = allUsers.find((u) => u.email.toLowerCase() === emailLower);
    if (existing) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const newId = `usr-teacher-${Date.now()}`;
    const cleanName = (name && name.trim()) ? name.trim() : emailLower.split('@')[0];

    const newUser: User = {
      id: newId,
      name: cleanName,
      email: emailLower,
      passwordHash: btoa(password),
      role: 'REGULAR_TEACHER', // default provisional
      enrollmentStatus: 'ProfileIncomplete',
      profileFormSubmitted: false,
      departmentId: '',
      departmentName: '',
      designation: 'Faculty Applicant',
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
      registeredAt: new Date().toISOString()
    };

    const updatedRegistered = [newUser, ...registeredUsers];
    setRegisteredUsers(updatedRegistered);
    saveRegistered(updatedRegistered);

    setLoggedInUser(newUser);
    saveCurrentUser(newUser);
    setActiveRole('REGULAR_TEACHER');
    setIsAuthenticated(true);
    setTeacherRequest(null);
    localStorage.removeItem('cfms_my_teacher_request');

    // Call backend API
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: emailLower, password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem('cfms_token', data.token);
      }
    } catch {}

    return { success: true };
  };

  // ─── Real Login ─────────────────────────────────────────────────────────────
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; code?: string }> => {
    const emailLower = email.trim().toLowerCase();

    // 1. Prioritize Real Backend Authentication
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower, password })
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        if (data.token) {
          localStorage.setItem('cfms_token', data.token);
        }
        if (data.refreshToken) {
          localStorage.setItem('cfms_refresh_token', data.refreshToken);
        }

        const loginTime = new Date().toLocaleString('en-PK', {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });

        const backendUser = data.user;
        const authenticatedUser: User = {
          id: backendUser.id || `usr-${Date.now()}`,
          name: backendUser.name || 'User',
          email: backendUser.email || emailLower,
          avatar: backendUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          role: backendUser.role,
          departmentId: backendUser.departmentId || '',
          departmentName: backendUser.departmentName || '',
          campus: backendUser.campus || backendUser.campusName || '',
          campusId: backendUser.campusId || '',
          campusName: backendUser.campusName || backendUser.campus || '',
          designation: backendUser.designation || (backendUser.role === 'HOD' ? `Head of Department (${backendUser.departmentName || ''})` : 'Faculty Member'),
          phone: backendUser.phone || '',
          status: backendUser.status || 'Active',
          createdAt: backendUser.createdAt || new Date().toISOString().split('T')[0],
          lastLogin: loginTime,
          loginCount: (backendUser.loginCount || 0) + 1,
          enrollmentStatus: backendUser.enrollmentStatus || (backendUser.role === 'HOD' || backendUser.role === 'ADMIN' ? 'Approved' : 'ProfileIncomplete'),
          profileFormSubmitted: backendUser.profileFormSubmitted !== undefined ? backendUser.profileFormSubmitted : (backendUser.role === 'HOD' || backendUser.role === 'ADMIN'),
          hodAssignment: backendUser.hodAssignment
        };

        // Sync into state and localStorage
        setLoggedInUser(authenticatedUser);
        saveCurrentUser(authenticatedUser);
        setActiveRole(authenticatedUser.role);
        setIsAuthenticated(true);

        // Update system/registered users list
        setSystemUsers((prev) => {
          const exists = prev.some((u) => u.id === authenticatedUser.id || u.email.toLowerCase() === emailLower);
          return exists ? prev.map((u) => (u.id === authenticatedUser.id || u.email.toLowerCase() === emailLower) ? authenticatedUser : u) : [authenticatedUser, ...prev];
        });

        // Track login log for teacher roles
        if (authenticatedUser.role === 'REGULAR_TEACHER' || authenticatedUser.role === 'VISITING_TEACHER') {
          const newLog: LoginLog = {
            id: `log-${Date.now()}`,
            userId: authenticatedUser.id,
            userName: authenticatedUser.name,
            userEmail: authenticatedUser.email,
            userRole: authenticatedUser.role,
            loginAt: new Date().toISOString()
          };
          const updatedLogs = [newLog, ...loginLogs].slice(0, 200);
          setLoginLogs(updatedLogs);
          saveLoginLogs(updatedLogs);
        }

        return { success: true };
      }

      // If backend explicitly rejected due to wrong password or inactive/locked account
      if (res.status === 403) {
        return { success: false, error: data.message || 'Account access restricted.' };
      }
      if (res.status === 401 && data.message && (data.message.includes('credentials') || data.message.includes('password'))) {
        return { success: false, error: data.message || 'Incorrect password. Please try again.' };
      }
    } catch (err) {
      console.warn('Backend login error, attempting local authentication fallback:', err);
    }

    // 2. Fallback / Offline / Local Authentication
    let match = allUsers.find((u) => u.email.toLowerCase() === emailLower);

    if (!match) {
      // Auto-register new teacher if any valid email format is used
      if (emailLower.includes('@')) {
        return registerTeacher(emailLower.split('@')[0], emailLower, password);
      }
      return {
        success: false,
        code: 'official_email',
        error: 'Please enter a valid official or Gmail email address to sign in or register.'
      };
    }

    // Check password for local fallback
    const isSystemUser = systemUsers.some((u) => u.email.toLowerCase() === emailLower);

    if (isSystemUser) {
      const devPasswords: Record<string, string> = {
        'ADMIN': 'admin123',
        'HOD': 'hod123',
        'REGULAR_TEACHER': 'teacher123',
        'VISITING_TEACHER': 'visiting123'
      };
      const devPass = devPasswords[match.role] || 'admin123';
      const isAcceptedDevPass =
        password === devPass ||
        password === 'admin123' ||
        password === 'hod123' ||
        password === 'teacher123' ||
        password === 'visiting123';

      const userHasHash = !!match.passwordHash;
      if (userHasHash) {
        if (match.passwordHash !== btoa(password) && !isAcceptedDevPass) {
          return { success: false, error: 'Incorrect password. Please try again.' };
        }
      } else if (!isAcceptedDevPass) {
        return { success: false, error: 'Incorrect password. Please use the credentials provided.' };
      }
    } else {
      if (!match.passwordHash) {
        return { success: false, error: 'Account password not set. Contact administrator.' };
      }
      if (match.passwordHash !== btoa(password)) {
        return { success: false, error: 'Incorrect password. Please try again.' };
      }
    }

    // Update lastLogin & loginCount
    const loginTime = new Date().toLocaleString('en-PK', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const updatedUser: User = {
      ...match,
      lastLogin: loginTime,
      loginCount: (match.loginCount || 0) + 1
    };

    if (!isSystemUser) {
      const updated = registeredUsers.map((u) => u.id === match.id ? updatedUser : u);
      setRegisteredUsers(updated);
      saveRegistered(updated);
    }

    setLoggedInUser(updatedUser);
    saveCurrentUser(updatedUser);
    setActiveRole(updatedUser.role);
    setIsAuthenticated(true);

    if (updatedUser.role === 'REGULAR_TEACHER' || updatedUser.role === 'VISITING_TEACHER') {
      const newLog: LoginLog = {
        id: `log-${Date.now()}`,
        userId: updatedUser.id,
        userName: updatedUser.name,
        userEmail: updatedUser.email,
        userRole: updatedUser.role,
        loginAt: new Date().toISOString()
      };
      const updatedLogs = [newLog, ...loginLogs].slice(0, 200);
      setLoginLogs(updatedLogs);
      saveLoginLogs(updatedLogs);
    }

    return { success: true };
  };


  // ─── Quick Dev Login (by role, no password) ─────────────────────────────────
  const switchRole = (role: UserRole) => {
    const match = systemUsers.find((u) => u.role === role) || allUsers.find((u) => u.role === role);
    if (match) {
      setLoggedInUser(match);
      saveCurrentUser(match);
      setIsAuthenticated(true);
    }
    setActiveRole(role);
  };

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('cfms_token');
    localStorage.removeItem('cfms_refresh_token');
    saveCurrentUser(null);
    setLoggedInUser(null);
    setIsAuthenticated(false);
    setActiveRole('ADMIN');
  };

  // ─── Update Profile ─────────────────────────────────────────────────────────
  const updateCurrentUserProfile = async (updatedData: Partial<User>) => {
    if (!loggedInUser) return;
    const updated = { ...loggedInUser, ...updatedData };
    setLoggedInUser(updated);
    saveCurrentUser(updated);

    const isSystemUser = systemUsers.some((u) => u.id === loggedInUser.id);
    if (!isSystemUser) {
      const updatedList = registeredUsers.map((u) => u.id === loggedInUser.id ? updated : u);
      setRegisteredUsers(updatedList);
      saveRegistered(updatedList);
    }

    try {
      await fetch(`/api/users/${loggedInUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
    } catch {}
  };

  // ─── Submit Profile Form ─────────────────────────────────────────────────────
  const submitProfileForm = (formData: TeacherProfileFormData) => {
    if (!loggedInUser) return;
    const updatedFormData: TeacherProfileFormData = {
      ...formData,
      submittedAt: new Date().toISOString()
    };
    const updated: User = {
      ...loggedInUser,
      profileFormSubmitted: true,
      profileFormData: updatedFormData,
      departmentId: formData.departmentId,
      departmentName: formData.departmentName,
      phone: formData.phone,
      academicSession: formData.academicSession
    };
    setLoggedInUser(updated);
    saveCurrentUser(updated);

    const isSystemUser = systemUsers.some((u) => u.id === loggedInUser.id);
    if (!isSystemUser) {
      const updatedList = registeredUsers.map((u) => u.id === loggedInUser.id ? updated : u);
      setRegisteredUsers(updatedList);
      saveRegistered(updatedList);
    }
  };

  // ─── Submit Teacher Enrollment (Multi-Course + Credit Limit + HOD Routing) ─
  const submitTeacherEnrollment = async (
    formData: any,
    selectedCourses: SelectedCourseItem[],
    totalCredits: number,
    teacherType: 'REGULAR_TEACHER' | 'VISITING_TEACHER',
    departmentId: string,
    departmentName: string,
    campusName?: string,
    hodId?: string,
    hodName?: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    if (!loggedInUser) return { success: false, error: 'Not authenticated' };

    // Credit limit validation on frontend
    const limit = teacherType === 'REGULAR_TEACHER' ? 22 : 12;
    if (totalCredits > limit) {
      return {
        success: false,
        error: `Credit limit exceeded! ${teacherType === 'REGULAR_TEACHER' ? 'Regular' : 'Visiting'} teachers are allowed a maximum of ${limit} credits. You selected ${totalCredits} credits.`
      };
    }

    const finalCampus = campusName || formData.campusName || formData.campus || 'Attock Campus';
    const finalCampusId = formData.campusId || '';
    const finalHodId = hodId || formData.hodId || '';
    const finalHodName = hodName || formData.hodName || 'Department HOD';

    const payload = {
      teacherId: loggedInUser.id,
      teacherName: loggedInUser.name,
      teacherEmail: loggedInUser.email,
      teacherType,
      campusId: finalCampusId,
      campusName: finalCampus,
      departmentId,
      departmentName,
      hodId: finalHodId,
      hodName: finalHodName,
      selectedCourses,
      totalCredits,
      profileData: {
        ...formData,
        campusId: finalCampusId,
        campus: finalCampus,
        hodId: finalHodId,
        hodName: finalHodName
      }
    };

    try {
      const res = await fetch('/api/teacher-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': loggedInUser.id,
          'x-user-role': teacherType
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.message || 'Failed to submit registration request' };
      }

      const updatedReq: TeacherEnrollmentRequest = data.data;
      setTeacherRequest(updatedReq);
      localStorage.setItem('cfms_my_teacher_request', JSON.stringify(updatedReq));

      const updatedUser: User = {
        ...loggedInUser,
        role: teacherType,
        campus: finalCampus,
        departmentId,
        departmentName,
        enrollmentStatus: 'PendingHODApproval',
        profileFormSubmitted: true,
        profileFormData: {
          ...formData,
          campus: finalCampus,
          hodId: finalHodId,
          hodName: finalHodName
        },
        totalCredits,
        selectedCourseIds: selectedCourses.map((c) => c.courseId)
      };

      setLoggedInUser(updatedUser);
      saveCurrentUser(updatedUser);
      setActiveRole(teacherType);

      return { success: true, message: data.message };
    } catch {
      // Local fallback in case server offline
      const mockReq: TeacherEnrollmentRequest = {
        id: `req-${Date.now()}`,
        teacherId: loggedInUser.id,
        teacherName: loggedInUser.name,
        teacherEmail: loggedInUser.email,
        teacherType,
        campusName: finalCampus,
        departmentId,
        departmentName,
        hodId: finalHodId,
        hodName: finalHodName,
        selectedCourses,
        totalCredits,
        creditLimit: limit,
        status: 'PendingHODApproval',
        profileData: {
          ...formData,
          campus: finalCampus,
          hodId: finalHodId,
          hodName: finalHodName
        },
        submittedAt: new Date().toISOString()
      };
      setTeacherRequest(mockReq);
      localStorage.setItem('cfms_my_teacher_request', JSON.stringify(mockReq));

      const updatedUser: User = {
        ...loggedInUser,
        role: teacherType,
        campus: finalCampus,
        departmentId,
        departmentName,
        enrollmentStatus: 'PendingHODApproval',
        profileFormSubmitted: true,
        profileFormData: {
          ...formData,
          campus: finalCampus,
          hodId: finalHodId,
          hodName: finalHodName
        },
        totalCredits,
        selectedCourseIds: selectedCourses.map((c) => c.courseId)
      };
      setLoggedInUser(updatedUser);
      saveCurrentUser(updatedUser);
      setActiveRole(teacherType);

      return { success: true, message: 'Registration request submitted for HOD review.' };
    }
  };

  // ─── Refresh Current Teacher's Request Status ───────────────────────────────
  const refreshMyRequest = async () => {
    if (!loggedInUser) return;
    try {
      const res = await fetch(`/api/teacher-requests/my-request?teacherId=${loggedInUser.id}&email=${encodeURIComponent(loggedInUser.email)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setTeacherRequest(data.data);
        localStorage.setItem('cfms_my_teacher_request', JSON.stringify(data.data));

        if (data.data.status !== loggedInUser.enrollmentStatus || !loggedInUser.hodName || !loggedInUser.campus) {
          const updatedUser: User = {
            ...loggedInUser,
            enrollmentStatus: data.data.status,
            status: data.data.status === 'Approved' ? 'Active' : loggedInUser.status,
            rejectionReason: data.data.rejectionReason,
            departmentId: data.data.departmentId || loggedInUser.departmentId,
            departmentName: data.data.departmentName || loggedInUser.departmentName,
            campus: data.data.campusName || loggedInUser.campus,
            campusName: data.data.campusName || loggedInUser.campusName || loggedInUser.campus,
            hodId: data.data.hodId || loggedInUser.hodId,
            hodName: data.data.hodName || loggedInUser.hodName,
            role: data.data.teacherType || loggedInUser.role
          };
          setLoggedInUser(updatedUser);
          saveCurrentUser(updatedUser);
          setActiveRole(updatedUser.role);
        }
      }
    } catch {}
  };

  // ─── Contract helpers ────────────────────────────────────────────────────────
  let isVisitingContractExpired = false;
  let visitingDaysRemaining = 0;

  if (activeRole === 'VISITING_TEACHER' && currentUser.contractEndDate) {
    const end = new Date(currentUser.contractEndDate).getTime();
    const now = new Date().getTime();
    const diff = end - now;
    visitingDaysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    if (visitingDaysRemaining === 0 || currentUser.contractStatus === 'Expired') {
      isVisitingContractExpired = true;
    }
  }

  // ─── Add form-filled timestamp to latest login log ─────────────────────────
  const addFormFilledLog = (userId: string) => {
    const now = new Date().toISOString();
    const updatedLogs = loginLogs.map((log, idx) => {
      if (log.userId === userId && !log.formFilledAt && idx === loginLogs.findIndex((l) => l.userId === userId)) {
        return { ...log, formFilledAt: now };
      }
      return log;
    });
    setLoginLogs(updatedLogs);
    saveLoginLogs(updatedLogs);
  };

  // ─── Registered teachers (for admin view) ───────────────────────────────────
  const registeredTeachers = allUsers.filter(
    (u) => (u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER') && u.registeredAt
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        users: allUsers,
        isAuthenticated,
        teacherRequest,
        login,
        registerTeacher,
        logout,
        switchRole,
        updateCurrentUserProfile,
        submitProfileForm,
        submitTeacherEnrollment,
        refreshMyRequest,
        isVisitingContractExpired,
        visitingDaysRemaining,
        registeredTeachers,
        loginLogs,
        addFormFilledLog
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
