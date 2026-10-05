import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CFMSProvider } from './context/CFMSContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { AlertTriangle, ClipboardList, Clock, CheckCircle2, RotateCcw, XCircle, AlertCircle, FileEdit } from 'lucide-react';

// Admin Modules
import { AdminDashboard } from './components/modules/AdminDashboard';
import { UserManagement } from './components/modules/UserManagement';
import { RoleManagement } from './components/modules/RoleManagement';
import { DepartmentManagement } from './components/modules/DepartmentManagement';
import { HODManagement } from './components/modules/HODManagement';
import { HODManagementModule } from './components/modules/HODManagementModule';
import { HODAccessPermissions } from './components/modules/HODAccessPermissions';
import { CourseManagement } from './components/modules/CourseManagement';
import { CampusManagement } from './components/modules/CampusManagement';
import { CourseFileManagement } from './components/modules/CourseFileManagement';
import { ApprovalManagement } from './components/modules/ApprovalManagement';
import { FileCategories } from './components/modules/FileCategories';
import { CourseFileDeadlines } from './components/modules/CourseFileDeadlines';
import { ReportsAnalytics } from './components/modules/ReportsAnalytics';
import { NotificationsModule } from './components/modules/NotificationsModule';
import { AnnouncementsModule } from './components/modules/AnnouncementsModule';
import { ArchiveModule } from './components/modules/ArchiveModule';
import { RecycleBinModule } from './components/modules/RecycleBinModule';
import { ActivityLogsModule } from './components/modules/ActivityLogsModule';
import { FeedbackModule } from './components/modules/FeedbackModule';
import { CalendarModule } from './components/modules/CalendarModule';
import { SecurityCenterModule } from './components/modules/SecurityCenterModule';
import { AuditLogsModule } from './components/modules/AuditLogsModule';
import { SystemSettingsModule } from './components/modules/SystemSettingsModule';
import { MyProfileModule } from './components/modules/MyProfileModule';
import { HelpSupportModule } from './components/modules/HelpSupportModule';
import { TeacherRegistrationsModule } from './components/modules/TeacherRegistrationsModule';
import { TeacherRegistrationRequests } from './components/modules/TeacherRegistrationRequests';
import { TeacherRegistration } from './components/modules/TeacherRegistration';
import { TeacherManagement } from './components/modules/TeacherManagement';

// HOD Specific Modules
import { HODDashboard } from './components/modules/hod/HODDashboard';
import { HODCourseFiles } from './components/modules/hod/HODCourseFiles';
import { HODPendingCourseFiles } from './components/modules/hod/HODPendingCourseFiles';
import { HODApprovedCourseFiles } from './components/modules/hod/HODApprovedCourseFiles';
import { HODTeacherRequests } from './components/modules/hod/HODTeacherRequests';
import { HODApprovedTeachers } from './components/modules/hod/HODApprovedTeachers';
import { HODTeacherProfiles } from './components/modules/hod/HODTeacherProfiles';
import { HODCourseProgress } from './components/modules/hod/HODCourseProgress';
import { HODNotifications } from './components/modules/hod/HODNotifications';
import { HODProfile } from './components/modules/hod/HODProfile';
import { HODTeachers } from './components/modules/HODTeachers';
import { TeacherDashboard } from './components/modules/TeacherDashboard';
import { TeacherCourses } from './components/modules/TeacherCourses';
import { TeacherFiles } from './components/modules/TeacherFiles';
import { TeacherUpload } from './components/modules/TeacherUpload';
import { TeacherVersions } from './components/modules/TeacherVersions';
import { TemplatesInstructionsModule } from './components/modules/TemplatesInstructionsModule';
import { CourseFileSubmissionModule } from './components/modules/CourseFileSubmissionModule';
import { SubmissionHistoryModule } from './components/modules/SubmissionHistoryModule';
import { ChangePasswordModule } from './components/modules/ChangePasswordModule';
import { TeacherProfileForm } from './components/modules/TeacherProfileForm';

import { LoginPage } from './components/auth/LoginPage';

// ─── Form-gate banner for teachers who haven't submitted profile form ─────────
const ProfileFormGate: React.FC<{ onGoToForm: () => void }> = ({ onGoToForm }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="bg-white rounded-2xl border border-amber-200 shadow-lg p-10 max-w-md w-full text-center space-y-5">
      <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-extrabold text-slate-900 font-heading">Profile Form Required</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          You must complete your <strong>Teacher Profile Form</strong> before you can access this feature.
          Please fill and submit the form first.
        </p>
      </div>
      <button
        onClick={onGoToForm}
        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
      >
        <ClipboardList className="w-4 h-4" />
        Fill Profile Form Now →
      </button>
    </div>
  </div>
);

const MainAppContent: React.FC = () => {
  const { activeRole, isAuthenticated, currentUser, logout, refreshMyRequest } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [isEditingApplication, setIsEditingApplication] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dedicated role checks
  const isAdmin = activeRole === 'ADMIN' || currentUser?.role === 'ADMIN';
  const isTeacher = !isAdmin && (activeRole === 'REGULAR_TEACHER' || activeRole === 'VISITING_TEACHER');

  // Reset module when role switches or when user logs in
  useEffect(() => {
    if (isAdmin) {
      setActiveModule('Dashboard');
    } else if (activeRole === 'HOD') {
      setActiveModule('HOD Dashboard');
    } else {
      setActiveModule('Teacher Dashboard');
    }
  }, [activeRole, isAdmin, isAuthenticated]);

  // For teachers: check status
  const enrollmentStatus = currentUser?.enrollmentStatus || (currentUser?.profileFormSubmitted ? 'PendingHODApproval' : 'ProfileIncomplete');
  const isApproved = enrollmentStatus === 'Approved';
  const formSubmitted = isApproved || (currentUser?.profileFormSubmitted ?? false);

  // Automatic live unlock polling: When teacher is waiting on pending HOD approval, poll status automatically every 5 seconds
  useEffect(() => {
    if (isTeacher && enrollmentStatus === 'PendingHODApproval') {
      const timer = setInterval(() => {
        refreshMyRequest();
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isTeacher, enrollmentStatus, refreshMyRequest]);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    await refreshMyRequest();
    setIsRefreshing(false);
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // ─── Teachers Gate: Must be Approved by HOD to access Dashboard (Never for Admin) ─────────────
  if (!isAdmin && isTeacher && !isApproved) {
    // 1. Rejected State: Show Rejection reason and allow resubmission
    if (enrollmentStatus === 'Rejected' && !isEditingApplication) {
      return (
        <div className="min-h-screen bg-[#F6FAF7] overflow-y-auto">
          <div className="bg-[#0c4727] text-white px-6 py-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <img src="/ue_logo_transparent.png" alt="UE" className="w-8 h-8 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/ue_logo.png'; }} />
              <div>
                <p className="text-xs font-extrabold tracking-wider">UNIVERSITY OF EDUCATION</p>
                <p className="text-[10px] text-emerald-300 font-medium">Course File Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-200 font-semibold">👤 {currentUser.name}</span>
              <button onClick={logout}
                className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-bold transition-all cursor-pointer">
                Logout
              </button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto p-4 sm:p-8 my-6">
            <div className="bg-white rounded-3xl border border-rose-200 shadow-xl p-8 sm:p-10 text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-rose-100 border-2 border-rose-300 flex items-center justify-center mx-auto text-rose-700 shadow-inner">
                <XCircle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200">
                  Status: Request Rejected / Revisions Requested
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-heading">
                  Registration Needs Revision
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Hello <strong className="text-slate-800">{currentUser.name}</strong>, your teacher registration request was reviewed by your department HOD and returned with feedback.
                </p>
              </div>

              {/* Rejection Reason Alert Box */}
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-left space-y-1.5">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>HOD Rejection Reason & Instructions:</span>
                </div>
                <p className="text-xs text-rose-800 font-medium pl-6 leading-relaxed bg-white/80 p-3 rounded-xl border border-rose-200">
                  "{currentUser.rejectionReason || 'Please review your selected courses and credit hour allotment and resubmit for HOD approval.'}"
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <span className="font-bold text-slate-900">{currentUser.departmentName || 'Not Set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Teacher Type:</span>
                  <span className="font-bold text-slate-900">{currentUser.role === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Selected Credit Hours:</span>
                  <span className="font-bold text-slate-900">{currentUser.totalCredits || 0} Credits</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                You can adjust your department, course selections, or profile data and resubmit immediately without creating a duplicate record.
              </p>

              <button
                onClick={() => setIsEditingApplication(true)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
              >
                <FileEdit className="w-4 h-4" />
                <span>Update Information & Resubmit Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 2. Pending HOD Approval State: Show waiting screen
    if (enrollmentStatus === 'PendingHODApproval' && !isEditingApplication) {
      return (
        <div className="min-h-screen bg-[#F6FAF7] overflow-y-auto">
          <div className="bg-[#0c4727] text-white px-6 py-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <img src="/ue_logo_transparent.png" alt="UE" className="w-8 h-8 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/ue_logo.png'; }} />
              <div>
                <p className="text-xs font-extrabold tracking-wider">UNIVERSITY OF EDUCATION</p>
                <p className="text-[10px] text-emerald-300 font-medium">Course File Management System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-emerald-200 font-semibold">👤 {currentUser.name}</span>
              <button onClick={logout}
                className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-bold transition-all cursor-pointer">
                Logout
              </button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto p-4 sm:p-8 my-6">
            <div className="bg-white rounded-3xl border border-amber-200 shadow-xl p-8 sm:p-10 text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto text-amber-700 shadow-inner">
                <Clock className="w-10 h-10 animate-pulse" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Status: Pending HOD Approval
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-heading">
                  Registration Awaiting HOD Review
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Hello <strong className="text-emerald-800">{currentUser.name}</strong>! Your registration request has been submitted and is currently awaiting review and approval by the Head of Department.
                </p>
              </div>

              {/* Department Routing Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <span className="font-bold text-slate-900">{currentUser.departmentName || 'Selected Department'}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Faculty Role:</span>
                  <span className="font-bold text-slate-800">
                    {currentUser.role === 'REGULAR_TEACHER' ? 'Regular Faculty (Max 22 Credits)' : 'Visiting Faculty (Max 12 Credits)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Total Teaching Credits:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {currentUser.totalCredits || 0} Credit Hours
                  </span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-left flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Next Steps:</p>
                  <p className="text-emerald-800/90 leading-relaxed">
                    Once the HOD of your department approves your course selections, your Teacher Dashboard and Course File submission features will be unlocked immediately.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleRefreshStatus}
                  disabled={isRefreshing}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20"
                >
                  <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Checking Status...' : 'Check Status / Refresh'}</span>
                </button>
                <button
                  onClick={() => setIsEditingApplication(true)}
                  className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-2 border border-slate-300"
                >
                  <FileEdit className="w-4 h-4" />
                  <span>Modify Courses</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 3. Profile Incomplete or User actively editing application
    return (
      <div className="min-h-screen bg-[#F6FAF7] overflow-y-auto">
        <div className="bg-[#0c4727] text-white px-6 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <img src="/ue_logo_transparent.png" alt="UE" className="w-8 h-8 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/ue_logo.png'; }} />
            <div>
              <p className="text-xs font-extrabold tracking-wider">UNIVERSITY OF EDUCATION</p>
              <p className="text-[10px] text-emerald-300 font-medium">Course File Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-emerald-200 font-semibold">👤 {currentUser.name}</span>
            {isEditingApplication && (
              <button
                onClick={() => setIsEditingApplication(false)}
                className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-bold transition-all cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
            <button onClick={logout}
              className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-bold transition-all cursor-pointer">
              Logout
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <TeacherProfileForm
            onNavigate={(m) => setActiveModule(m)}
            onSuccess={() => setIsEditingApplication(false)}
          />
        </div>
      </div>
    );
  }

  const renderModule = () => {
    // ─── HOD Dedicated Modules (Centered on Course File Management - Requirements 3 & 51) ───
    if (activeRole === 'HOD') {
      switch (activeModule) {
        case 'Dashboard':
        case 'HOD Dashboard':
          return <HODDashboard onNavigate={(m) => setActiveModule(m)} />;
        case 'Teacher Requests':
        case 'Teacher Registration Requests':
        case 'Pending Requests':
          return <HODTeacherRequests />;
        case 'Teachers':
        case 'Approved Teachers':
          return <HODApprovedTeachers />;
        case 'Teacher Profiles':
        case 'Department Teachers':
          return <HODTeacherProfiles />;
        case 'Course Files':
        case 'Academic / Course Files':
        case 'All Course Files':
          return <HODCourseFiles />;
        case 'Course File Status / Pending Review':
        case 'Pending Course Files':
        case 'Pending Files':
        case 'Needs Improvement':
          return <HODPendingCourseFiles />;
        case 'Approved Course Files':
        case 'Approved Files':
        case 'Certificates':
        case 'Downloads':
          return <HODApprovedCourseFiles />;
        case 'My Course Files':
          return <CourseFileSubmissionModule onNavigate={(m) => setActiveModule(m)} />;
        case 'Course / File Progress':
        case 'Progress':
          return <HODCourseProgress />;
        case 'Notifications':
        case 'All Notifications':
          return <HODNotifications />;
        case 'HOD Profile':
        case 'My Profile':
        case 'Profile':
          return <HODProfile />;
        default:
          return <HODDashboard onNavigate={(m) => setActiveModule(m)} />;
      }
    }

    // ─── Teacher Dedicated Modules (Exact Section 11 Navigation) ───
    if (activeRole === 'REGULAR_TEACHER' || activeRole === 'VISITING_TEACHER') {
      switch (activeModule) {
        case 'Dashboard':
        case 'Teacher Dashboard':
          return <TeacherDashboard onNavigate={(m) => setActiveModule(m)} />;
        case 'My Profile':
        case 'Teacher Profile':
        case 'My Profile Form':
        case 'Teacher Profile Form':
          return <TeacherProfileForm onNavigate={(m) => setActiveModule(m)} />;
        case 'My Assigned Courses':
        case 'Assigned Courses':
        case 'My Courses':
          return <TeacherCourses onNavigate={(m) => setActiveModule(m)} />;
        case 'Course File Submission':
        case 'Upload Course File':
        case 'Upload File':
        case 'New File Upload':
          return <CourseFileSubmissionModule onNavigate={(m) => setActiveModule(m)} />;
        case 'My Submitted Files':
        case 'Submitted Files':
          return <TeacherFiles filterStatus="Submitted" onNavigate={(m) => setActiveModule(m)} />;
        case 'Needs Improvement':
          return <TeacherFiles filterStatus="Needs Improvement" onNavigate={(m) => setActiveModule(m)} />;
        case 'Approved Course Files':
        case 'Approved Files':
          return <TeacherFiles filterStatus="Approved" onNavigate={(m) => setActiveModule(m)} />;
        case 'Certificates':
          return <TeacherFiles filterStatus="Certificates" onNavigate={(m) => setActiveModule(m)} />;
        case 'Downloads':
          return <TeacherFiles filterStatus="Downloads" onNavigate={(m) => setActiveModule(m)} />;
        case 'Notifications':
        case 'All Notifications':
          return <NotificationsModule activeModule={activeModule} />;
        default:
          return <TeacherDashboard onNavigate={(m) => setActiveModule(m)} />;
      }
    }

    switch (activeModule) {
      // 1. Dashboard
      case 'Dashboard':
        return <AdminDashboard onNavigate={(m) => setActiveModule(m)} />;

      // 2. Campus Management
      case 'Campus Management':
      case 'All Campus':
      case 'All Campuses':
      case 'Campuses':
        return <CampusManagement activeSubModule="All Campus" onNavigate={(m) => setActiveModule(m)} />;
      case 'Add Campus':
        return <CampusManagement activeSubModule="Add Campus" onNavigate={(m) => setActiveModule(m)} />;

      // 3. Department Management
      case 'Department Management':
      case 'All Department':
      case 'All Departments':
        return <DepartmentManagement activeSubModule="All Department" onNavigate={(m) => setActiveModule(m)} />;
      case 'Add Department':
      case 'Create Department':
        return <DepartmentManagement activeSubModule="Add Department" onNavigate={(m) => setActiveModule(m)} />;

      // 4. HOD Management
      case 'HOD Management':
      case 'HOD Assignments':
        return <HODManagement activeSubModule="HOD Assignments" onNavigate={(m) => setActiveModule(m)} />;
      case 'Assign HOD':
        return <HODManagement activeSubModule="Assign HOD" onNavigate={(m) => setActiveModule(m)} />;
      case 'Reassign HOD':
        return <HODManagement activeSubModule="Reassign HOD" onNavigate={(m) => setActiveModule(m)} />;

      // 5. HOD Access & Permissions
      case 'HOD Access & Permissions':
      case 'HOD Access Control':
        return <HODAccessPermissions activeSubModule="HOD Access Control" onNavigate={(m) => setActiveModule(m)} />;
      case 'Reset HOD Password':
        return <HODAccessPermissions activeSubModule="Reset HOD Password" onNavigate={(m) => setActiveModule(m)} />;

      // 6. Teacher Registration Requests
      case 'Teacher Registration Requests':
      case 'Pending Requests':
        return <TeacherRegistrationRequests activeSubModule="Pending Requests" onNavigate={(m) => setActiveModule(m)} />;
      case 'All Requests':
        return <TeacherRegistrationRequests activeSubModule="All Requests" onNavigate={(m) => setActiveModule(m)} />;
      case 'Rejected Requests':
        return <TeacherRegistrationRequests activeSubModule="Rejected Requests" onNavigate={(m) => setActiveModule(m)} />;

      // 7. Teacher Registration
      case 'Teacher Registration':
      case 'Registered Teachers':
      case 'Teacher Registrations':
        return <TeacherRegistration activeSubModule="Registered Teachers" onNavigate={(m) => setActiveModule(m)} />;
      case 'Registration Records':
        return <TeacherRegistration activeSubModule="Registration Records" onNavigate={(m) => setActiveModule(m)} />;

      // 8. Teacher Management
      case 'Teacher Management':
      case 'All Teachers':
      case 'Regular Faculty':
      case 'Visiting Faculty':
      case 'Teacher Directory':
      case 'Teacher Assignments':
      case 'Assignments':
        if ((activeRole as string) === 'HOD') {
          return <HODTeachers activeModule={activeModule} />;
        }
        return (
          <TeacherManagement
            activeSubModule={activeModule === 'Teacher Management' ? 'All Teachers' : activeModule}
            onNavigate={(m) => setActiveModule(m)}
          />
        );

      // 9. Course Management
      case 'Course Management':
      case 'All Courses':
      case 'Campus Wise':
      case 'Department Wise':
      case 'Semester Wise':
        return <CourseManagement activeModule={activeModule} onNavigate={(m) => setActiveModule(m)} />;

      // 11. Notifications
      case 'Notifications':
      case 'All Notifications':
      case 'Email Notifications':
      case 'System Notifications':
        return <NotificationsModule activeModule={activeModule} />;

      // 16. Roles & Permissions
      case 'Roles & Permissions':
      case 'Role & Permission':
      case 'Role & Permission Matrix':
      case 'Roles':
      case 'Permissions':
      case 'Assign Permissions':
        return <RoleManagement activeModule={activeModule} />;

      // 17. Reports & Analytics
      case 'Reports & Analytics':
      case 'Dashboard Reports':
      case 'Department Reports':
      case 'Teacher Reports':
      case 'Course Reports':
      case 'Approval Reports':
      case 'Storage Reports':
      case 'Department Performance':
        return <ReportsAnalytics activeModule={activeModule} />;

      // 18. Audit Logs
      case 'Audit Logs':
      case 'User Audit':
      case 'File Audit':
      case 'Approval Audit':
        return <AuditLogsModule activeModule={activeModule} />;

      // 20. System Settings
      case 'System Settings':
      case 'Settings':
      case 'General Settings':
      case 'University Profile':
      case 'Email Settings':
      case 'Backup & Restore':
      case 'Department Settings':
      case 'Preferences':
        return <SystemSettingsModule activeModule={activeModule} />;

      // 21. Admin Profile
      case 'Admin Profile':
      case 'My Profile':
      case 'Profile':
      case 'Profile Overview':
      case 'Overview':
      case 'Personal Information':
      case 'Contact & Address':
      case 'Address & Contact':
      case 'Professional & Academic':
      case 'Academic & Professional':
      case 'Security':
      case 'Login History':
      case 'Activity History':
      case 'Change Password':
      case 'Settings & Security':
        return <MyProfileModule activeModule={activeModule} />;

      // 22. Help / Support
      case 'Help / Support':
      case 'Help & Support':
      case 'Documentation':
      case 'FAQs':
      case 'Contact Support':
        return <HelpSupportModule activeModule={activeModule} />;

      // HOD Views
      case 'HOD Dashboard':
        return <HODDashboard onNavigate={(m) => setActiveModule(m)} />;
      case 'Department Teachers':
        return <HODTeachers activeModule={activeModule} />;

      // Teacher Views
      case 'Teacher Dashboard':
        return <TeacherDashboard onNavigate={(m) => setActiveModule(m)} />;
      case 'Teacher Form Setup':
      case 'Form Setup':
        return <CourseFileSubmissionModule onNavigate={(m) => setActiveModule(m)} />;
      case 'My Profile Form':
      case 'Teacher Profile Form':
        if (isAdmin) return <AdminDashboard onNavigate={(m) => setActiveModule(m)} />;
        return <TeacherProfileForm onNavigate={(m) => setActiveModule(m)} />;
      case 'Assigned Courses':
      case 'My Courses':
        if (isTeacher && !formSubmitted) return <ProfileFormGate onGoToForm={() => setActiveModule('My Profile Form')} />;
        return <TeacherCourses />;
      case 'Course File Submission':
      case 'Upload Course File':
      case 'Upload File':
      case 'New File Upload':
        if (isTeacher && !formSubmitted) return <ProfileFormGate onGoToForm={() => setActiveModule('My Profile Form')} />;
        return <CourseFileSubmissionModule onNavigate={(m) => setActiveModule(m)} />;
      case 'Templates & Instructions':
      case 'Templates & Guidelines':
      case 'All Templates':
      case 'Upload Template':
      case 'Upload Official Template':
      case 'Submission Guidelines':
      case 'Mandatory Checklist':
      case 'Upload Guidelines':
        if (isTeacher && !formSubmitted) return <ProfileFormGate onGoToForm={() => setActiveModule('My Profile Form')} />;
        return <TemplatesInstructionsModule activeModule={activeModule} />;
      case 'Submission History':
      case 'My Course Files':
      case 'Submitted Files':
      case 'Draft Files':
        if (isTeacher && !formSubmitted) return <ProfileFormGate onGoToForm={() => setActiveModule('My Profile Form')} />;
        return <SubmissionHistoryModule />;

      default:
        return <AdminDashboard onNavigate={(m) => setActiveModule(m)} />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F6FAF7] font-body text-[#0F2D1F] antialiased flex flex-col selection:bg-[#1E7B4E] selection:text-white">
      {/* Fixed Enterprise Header */}
      <Header
        activeModuleName={activeModule}
        onNavigateToModule={(m) => setActiveModule(m)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        {/* Collapsible Enterprise Sidebar */}
        <Sidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          activeModule={activeModule}
          onSelectModule={(m) => setActiveModule(m)}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="w-full space-y-6">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CFMSProvider>
        <MainAppContent />
      </CFMSProvider>
    </AuthProvider>
  );
}
