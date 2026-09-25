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
import { CourseManagement } from './components/modules/CourseManagement';
import { AcademicSessions } from './components/modules/AcademicSessions';
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

// HOD & Teacher Specific Modules
import { HODDashboard } from './components/modules/HODDashboard';
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

  // Reset module when role switches
  useEffect(() => {
    if (activeRole === 'ADMIN') setActiveModule('Dashboard');
    else if (activeRole === 'HOD') setActiveModule('HOD Dashboard');
    else setActiveModule('Teacher Dashboard');
  }, [activeRole]);

  // For teachers: check status
  const isTeacher = activeRole === 'REGULAR_TEACHER' || activeRole === 'VISITING_TEACHER';
  const enrollmentStatus = currentUser?.enrollmentStatus || (currentUser?.profileFormSubmitted ? 'Approved' : 'ProfileIncomplete');
  const isApproved = enrollmentStatus === 'Approved';
  const formSubmitted = isApproved || (currentUser?.profileFormSubmitted ?? false);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    await refreshMyRequest();
    setIsRefreshing(false);
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // ─── Teachers Gate: Must be Approved by HOD to access Dashboard ─────────────
  if (isTeacher && !isApproved) {
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
    switch (activeModule) {
      // Dashboard Router
      case 'Dashboard':
        if (activeRole === 'REGULAR_TEACHER' || activeRole === 'VISITING_TEACHER') {
          return <TeacherDashboard onNavigate={(m) => setActiveModule(m)} />;
        }
        if (activeRole === 'HOD') {
          return <HODDashboard onNavigate={(m) => setActiveModule(m)} />;
        }
        return <AdminDashboard onNavigate={(m) => setActiveModule(m)} />;

      case 'User Management':
      case 'All Users':
      case 'Admins':
      case 'HODs':
      case 'Regular Teachers':
      case 'Visiting Teachers':
      case 'Active Users':
      case 'Inactive Users':
      case 'Create User':
        if (activeRole === 'HOD') {
          return <HODTeachers activeModule={activeModule} />;
        }
        return <UserManagement activeModule={activeModule} />;

      case 'Role & Permission':
      case 'Role & Permission Matrix':
      case 'Roles':
      case 'Permissions':
      case 'Assign Permissions':
        return <RoleManagement activeModule={activeModule} />;

      case 'Department Management':
      case 'All Departments':
      case 'Create Department':
      case 'Assign HOD':
      case 'Department Statistics':
        return <DepartmentManagement activeModule={activeModule} />;

      case 'Course Management':
      case 'All Courses':
      case 'Create Course':
      case 'Active Courses':
      case 'Archived Courses':
      case 'Semester Wise':
      case 'Department Wise':
      case 'Department Courses':
      case 'Assigned Teachers':
      case 'My Assigned Courses':
        return <CourseManagement activeModule={activeModule} />;

      case 'Academic Sessions':
      case 'Current Session':
      case 'Previous Sessions':
      case 'Create Session':
        return <AcademicSessions activeModule={activeModule} />;

      case 'Course File Management':
      case 'All Course Files':
      case 'Upload Files':
      case 'Pending Files':
      case 'Approved Files':
      case 'Rejected Files':
      case 'Revision Requests':
      case 'Archived Files':
      case 'Version History':
        return <CourseFileManagement activeModule={activeModule} />;

      case 'Approval Management':
      case 'Pending Approvals':
      case 'Approved':
      case 'Rejected':
      case 'Approval History':
        return <ApprovalManagement activeModule={activeModule} />;

      case 'File Categories':
      case 'All Categories':
      case 'Create Category':
        return <FileCategories activeModule={activeModule} />;

      case 'Course File Deadlines':
      case 'Deadlines':
      case 'Upcoming Deadlines':
      case 'Missed Deadlines':
      case 'Completed Deadlines':
      case 'Calendar View':
        return <CourseFileDeadlines activeModule={activeModule} />;

      case 'Reports & Analytics':
      case 'Dashboard Reports':
      case 'Department Reports':
      case 'Teacher Reports':
      case 'Course Reports':
      case 'Approval Reports':
      case 'Storage Reports':
      case 'Department Performance':
        return <ReportsAnalytics activeModule={activeModule} />;

      case 'Notifications':
      case 'All Notifications':
      case 'Email Notifications':
      case 'System Notifications':
        return <NotificationsModule activeModule={activeModule} />;

      case 'Announcements':
      case 'All Announcements':
      case 'Create Announcement':
      case 'Scheduled':
      case 'Archived Announcements':
        return <AnnouncementsModule activeModule={activeModule} />;

      case 'Archive':
      case 'Restore Files':
        return <ArchiveModule activeModule={activeModule} />;

      case 'Recycle Bin':
      case 'Deleted Files':
      case 'Restore':
      case 'Permanent Delete':
        return <RecycleBinModule activeModule={activeModule} />;

      case 'Activity Logs':
      case 'Login Logs':
      case 'User Logs':
      case 'Approval Logs':
      case 'File Logs':
      case 'Department Logs':
        return <ActivityLogsModule activeModule={activeModule} />;

      case 'Feedback':
      case 'Suggestions':
      case 'Bug Reports':
        return <FeedbackModule activeModule={activeModule} />;

      case 'Calendar':
      case 'Academic Calendar':
      case 'Meetings':
      case 'Department Calendar':
        return <CalendarModule activeModule={activeModule} />;

      case 'Security Center':
      case 'Login Attempts':
      case 'Active Sessions':
      case 'Password Policy':
        return <SecurityCenterModule activeModule={activeModule} />;

      case 'Audit Logs':
      case 'User Audit':
      case 'File Audit':
      case 'Approval Audit':
        return <AuditLogsModule activeModule={activeModule} />;

      case 'System Settings':
      case 'Settings':
      case 'General Settings':
      case 'University Profile':
      case 'Email Settings':
      case 'Backup & Restore':
      case 'Department Settings':
      case 'Preferences':
        return <SystemSettingsModule activeModule={activeModule} />;

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

      case 'Help & Support':
      case 'Documentation':
      case 'FAQs':
      case 'Contact Support':
        return <HelpSupportModule activeModule={activeModule} />;

      // HOD Views
      case 'HOD Dashboard':
        return <HODDashboard onNavigate={(m) => setActiveModule(m)} />;
      case 'Teacher Management':
      case 'Department Teachers':
      case 'All Teachers':
        return <HODTeachers activeModule={activeModule} />;

      // Teacher Views
      case 'Teacher Dashboard':
        return <TeacherDashboard onNavigate={(m) => setActiveModule(m)} />;
      case 'My Profile Form':
      case 'Teacher Profile Form':
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

      // Admin: Teacher Registrations
      case 'Teacher Registrations':
        return <TeacherRegistrationsModule />;

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
