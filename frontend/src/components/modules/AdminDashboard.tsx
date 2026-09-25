import React from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  FileCheck2,
  Users,
  Building2,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  ShieldAlert,
  ArrowRight,
  GraduationCap,
  Calendar,
  ShieldCheck,
  Activity,
  Settings,
  HardDrive,
  Award,
  Upload,
  UserCheck,
  Bell,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Layers,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp as TrendIcon,
  Zap,
  CheckCircle2,
  FilePlus,
  AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (moduleName: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { courseFiles, usersList, departments, activityLogs, announcements, teacherRequests } = useCFMS();
  const { currentUser, registeredTeachers, users: allUsers } = useAuth();

  const totalFiles = courseFiles.length > 0 ? courseFiles.length : 1248;
  const pendingFiles = courseFiles.filter((f) => f.status === 'Submitted' || f.status === 'In Review').length || 12;
  const approvedFiles = courseFiles.filter((f) => f.status === 'Approved').length || 1150;
  const totalUsers = usersList.length > 0 ? usersList.length : 168;

  // Department HOD metrics
  const totalDepartmentsCount = departments.length;
  const deptsWithHODCount = departments.filter((d) => !!d.hodName && !!d.hodId).length;
  const deptsWithoutHODCount = totalDepartmentsCount - deptsWithHODCount;

  // Teacher registration & approval metrics
  const pendingTeacherRequestsCount = (teacherRequests || []).filter((r) => r.status === 'PendingHODApproval').length;
  const approvedTeachersCount = usersList.filter(
    (u) => (u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER') && (u.enrollmentStatus === 'Approved' || (u.enrollmentStatus === undefined && u.profileFormSubmitted))
  ).length;

  // Teacher registration stats
  const allTeachers = allUsers.filter((u) => u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER');
  const pendingForms = pendingTeacherRequestsCount;
  const submittedForms = approvedTeachersCount;

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const timeGreeting = getGreeting();
  const adminName = currentUser?.name || 'Aqsa Rasool';
  const todayDateStr = 'Wednesday, July 22, 2026';

  // --- CHART DATA (Green Theme Palette) ---
  const submissionProgressData = [
    { name: 'Submitted & Approved', value: 1150, color: '#165534' },
    { name: 'Under Review', value: 86, color: '#1E7B4E' },
    { name: 'Pending Upload', value: 34, color: '#D97706' },
    { name: 'Rejected/Returned', value: 14, color: '#DC2626' }
  ];

  const deptCompletionData = [
    { name: 'Computer Science', rate: 98, files: 420 },
    { name: 'Information Tech', rate: 94, files: 380 },
    { name: 'Mathematics', rate: 91, files: 240 },
    { name: 'Education', rate: 89, files: 208 }
  ];

  const facultyPerformanceData = [
    { category: 'On-Time', count: 128 },
    { category: '1-3 Days Late', count: 10 },
    { category: 'Pending', count: 3 },
    { category: 'Overdue', count: 1 }
  ];

  const approvalWorkflowData = [
    { name: 'Approved', value: 1150, color: '#165534' },
    { name: 'Pending HOD', value: 68, color: '#1E7B4E' },
    { name: 'Returned', value: 20, color: '#D97706' },
    { name: 'Rejected', value: 10, color: '#DC2626' }
  ];

  const uploadTrendData = [
    { month: 'Feb', uploads: 180, approvals: 165 },
    { month: 'Mar', uploads: 320, approvals: 300 },
    { month: 'Apr', uploads: 450, approvals: 430 },
    { month: 'May', uploads: 680, approvals: 650 },
    { month: 'Jun', uploads: 950, approvals: 910 },
    { month: 'Jul', uploads: 1248, approvals: 1150 }
  ];

  const deptComparisonData = [
    { dept: 'CS', assigned: 45, submitted: 44 },
    { dept: 'IT', assigned: 40, submitted: 38 },
    { dept: 'Math', assigned: 28, submitted: 25 },
    { dept: 'Edu', assigned: 24, submitted: 22 }
  ];

  const activityTrendData = [
    { day: 'Mon', logins: 142, uploads: 85 },
    { day: 'Tue', logins: 156, uploads: 94 },
    { day: 'Wed', logins: 168, uploads: 112 },
    { day: 'Thu', logins: 160, uploads: 102 },
    { day: 'Fri', logins: 148, uploads: 78 },
    { day: 'Sat', logins: 92, uploads: 35 },
    { day: 'Sun', logins: 64, uploads: 18 }
  ];

  const categoriesData = [
    { name: 'Outlines', value: 320, color: '#165534' },
    { name: 'Lecture Notes', value: 290, color: '#1E7B4E' },
    { name: 'Midterm Papers', value: 210, color: '#22C55E' },
    { name: 'Final Papers', value: 248, color: '#4ADE80' },
    { name: 'Result Sheets', value: 180, color: '#86EFAC' }
  ];

  // Custom Chart Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F2D1F] text-white p-3 rounded-xl shadow-xl border border-emerald-700/60 text-xs font-semibold space-y-1">
          {label && <p className="text-emerald-300 font-bold border-b border-emerald-800 pb-1">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-emerald-100">{entry.name}:</span>
              <span className="font-bold text-white">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 1. Compact Hero Header (Reduced height by >60%, contains ONLY Welcome Back, Admin Name, Role, University, Academic Session & Last Login) */}
      <div className="bg-[#0c4727] text-white p-4 sm:p-5 rounded-2xl border border-[#08351d] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 font-bold text-lg font-heading">
            👋
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold font-heading text-white tracking-tight">
                Welcome Back, {adminName}
              </h1>
              <span className="text-3xs font-bold text-emerald-200 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                System Administrator
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 font-medium mt-0.5 flex flex-wrap items-center gap-2">
              <span>University of Education Attock Campus</span>
              <span className="text-emerald-400">•</span>
              <span>Course File Management System</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-emerald-100/90 shrink-0 bg-black/15 px-4 py-2 rounded-xl border border-white/10">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span>Session: <strong className="text-white font-bold">Spring 2026</strong></span>
          </div>
          <div className="w-px h-4 bg-emerald-700/60" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span>Last Login: <strong className="text-white font-bold">Today, 9:10 AM</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Enterprise Quick Actions Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E2EFE6] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0F2D1F]">
          <Zap className="w-4 h-4 text-[#1E7B4E]" />
          <span>Quick Actions:</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          <button
            onClick={() => onNavigate('Teacher Registrations')}
            className="px-3.5 py-2 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer group relative"
          >
            <Users className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>Teacher Registrations</span>
            {pendingForms > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">{pendingForms}</span>
            )}
          </button>

          <button
            onClick={() => onNavigate('User Management')}
            className="px-3.5 py-2 text-xs font-bold bg-[#F6FAF7] hover:bg-[#E6F4EC] text-[#0F2D1F] border border-[#E2EFE6] rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer group"
          >
            <Users className="w-3.5 h-3.5 text-[#1E7B4E] group-hover:scale-110 transition-transform" />
            <span>Create User</span>
          </button>

          <button
            onClick={() => onNavigate('Templates & Instructions')}
            className="px-3.5 py-2 text-xs font-bold bg-[#F6FAF7] hover:bg-[#E6F4EC] text-[#0F2D1F] border border-[#E2EFE6] rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer group"
          >
            <FilePlus className="w-3.5 h-3.5 text-[#1E7B4E] group-hover:scale-110 transition-transform" />
            <span>Upload Template</span>
          </button>

          <button
            onClick={() => onNavigate('Announcements')}
            className="px-3.5 py-2 text-xs font-bold bg-[#F6FAF7] hover:bg-[#E6F4EC] text-[#0F2D1F] border border-[#E2EFE6] rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer group"
          >
            <Bell className="w-3.5 h-3.5 text-[#1E7B4E] group-hover:scale-110 transition-transform" />
            <span>Send Announcement</span>
          </button>

          <button
            onClick={() => onNavigate('Reports & Analytics')}
            className="px-3.5 py-2 text-xs font-bold bg-[#F6FAF7] hover:bg-[#E6F4EC] text-[#0F2D1F] border border-[#E2EFE6] rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer group"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#1E7B4E] group-hover:scale-110 transition-transform" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={() => onNavigate('System Settings')}
            className="px-3.5 py-2 text-xs font-bold bg-[#165534] hover:bg-[#12482c] text-white rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer group"
          >
            <Settings className="w-3.5 h-3.5 text-emerald-200 group-hover:rotate-45 transition-transform" />
            <span>System Settings</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Cards (8 Key Metrics Grid matching Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: TOTAL DEPARTMENTS */}
        <div
          className="bg-white p-5 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/50 transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
          onClick={() => onNavigate('Department Management')}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#567567]">Total Departments</span>
            <div className="w-8 h-8 rounded-full bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-extrabold font-heading text-[#0F2D1F]">{totalDepartmentsCount}</span>
            <span className="text-xs font-bold text-[#15803D] bg-[#E6F4EC] px-2.5 py-1 rounded-full">Active</span>
          </div>
          <p className="text-xs text-[#567567] font-medium pt-1">Academic Campus Faculties</p>
        </div>

        {/* KPI 2: DEPARTMENTS WITH HOD */}
        <div
          className="bg-white p-5 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/50 transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
          onClick={() => onNavigate('Department Management')}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#567567]">Departments with HOD</span>
            <div className="w-8 h-8 rounded-full bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-extrabold font-heading text-[#0F2D1F]">{deptsWithHODCount}</span>
            <span className="text-xs font-bold text-[#15803D] bg-[#E6F4EC] px-2.5 py-1 rounded-full">Assigned</span>
          </div>
          <p className="text-xs text-[#567567] font-medium pt-1">HOD In-Charge Assigned</p>
        </div>

        {/* KPI 3: DEPARTMENTS WITHOUT HOD */}
        <div
          className={`p-5 rounded-2xl border shadow-2xs transition-all group flex flex-col justify-between space-y-3 cursor-pointer ${
            deptsWithoutHODCount > 0
              ? 'bg-amber-50/60 border-amber-300 hover:border-amber-500'
              : 'bg-white border-[#E2EFE6]'
          }`}
          onClick={() => onNavigate('Department Management')}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#567567]">Depts Without HOD</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-extrabold font-heading text-[#0F2D1F]">{deptsWithoutHODCount}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              deptsWithoutHODCount > 0 ? 'text-amber-800 bg-amber-100' : 'text-emerald-700 bg-emerald-100'
            }`}>
              {deptsWithoutHODCount > 0 ? 'Requires Action' : 'All Assigned'}
            </span>
          </div>
          <p className="text-xs text-[#567567] font-medium pt-1">Pending Admin Assignment</p>
        </div>

        {/* KPI 4: PENDING TEACHER REQUESTS */}
        <div
          className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs hover:border-amber-400 transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
          onClick={() => onNavigate('Teacher Registrations')}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#567567]">Pending Teacher Requests</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors relative">
              <Clock className="w-4 h-4" />
              {pendingTeacherRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center border border-white">
                  {pendingTeacherRequestsCount}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-extrabold font-heading text-[#0F2D1F]">{pendingTeacherRequestsCount}</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              pendingTeacherRequestsCount > 0 ? 'text-amber-700 bg-amber-100 border border-amber-200' : 'text-emerald-700 bg-emerald-100'
            }`}>
              {pendingTeacherRequestsCount > 0 ? 'Pending HOD' : 'Clear'}
            </span>
          </div>
          <p className="text-xs text-[#567567] font-medium pt-1">Awaiting Department HOD</p>
        </div>

        {/* KPI 5: APPROVED TEACHERS */}
        <div
          className="bg-white p-5 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/50 transition-all group flex flex-col justify-between space-y-3 cursor-pointer"
          onClick={() => onNavigate('Teacher Registrations')}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#567567]">Approved Teachers</span>
            <div className="w-8 h-8 rounded-full bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-extrabold font-heading text-[#0F2D1F]">{approvedTeachersCount}</span>
            <span className="text-xs font-bold text-[#15803D] bg-[#E6F4EC] px-2.5 py-1 rounded-full">Enrolled</span>
          </div>
          <p className="text-xs text-[#567567] font-medium pt-1">Active Regular & Visiting Faculty</p>
        </div>

        {/* KPI 6: UPLOADED COURSE FILES */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/50 transition-all group flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#567567]">Uploaded Course Files</span>
            <div className="w-8 h-8 rounded-full bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-extrabold font-heading text-[#0F2D1F]">{totalFiles.toLocaleString()}</span>
            <span className="text-xs font-bold text-[#15803D] bg-[#E6F4EC] px-2.5 py-1 rounded-full">+18.4% YoY</span>
          </div>
          <p className="text-xs text-[#567567] font-medium pt-1">Spring 2026 Repositories</p>
        </div>

        {/* KPI 7: PENDING FILE APPROVALS */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-amber-400/60 transition-all group flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#567567]">Pending File Approvals</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-extrabold font-heading text-[#0F2D1F]">{pendingFiles}</span>
            <span className="text-xs font-bold text-[#b45309] bg-[#fef3c7] border border-[#fde68a] px-2.5 py-1 rounded-full">In Review</span>
          </div>
          <p className="text-xs text-[#567567] font-medium pt-1">Awaiting HOD Verification</p>
        </div>

        {/* KPI 8: ACTIVE SYSTEM USERS */}
        <div className="bg-white p-5 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/50 transition-all group flex flex-col justify-between space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#567567]">Active System Users</span>
            <div className="w-8 h-8 rounded-full bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-extrabold font-heading text-[#0F2D1F]">{totalUsers}</span>
            <span className="text-xs font-bold text-[#15803D] bg-[#E6F4EC] px-2.5 py-1 rounded-full">100% Logged</span>
          </div>
          <p className="text-xs text-[#567567] font-medium pt-1">Admins, HODs, Faculty</p>
        </div>
      </div>

      {/* 3. BI ANALYTICS CHARTS SECTION */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2EFE6] pb-3">
          <div>
            <h2 className="text-lg font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#1E7B4E]" />
              Executive Business Intelligence Analytics
            </h2>
            <p className="text-xs text-[#567567] mt-0.5">Real-time performance metrics, submission progress, and workflow status across campus departments.</p>
          </div>
          <button
            onClick={() => onNavigate('Reports & Analytics')}
            className="text-xs font-bold text-[#1E7B4E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Full Analytics Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Charts Row 1: Line Chart & Donut Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Upload Trend (Smooth Line) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EFE6]">
              <div>
                <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                  <TrendIcon className="w-4 h-4 text-[#1E7B4E]" />
                  Monthly Course File Upload & Approval Trend
                </h3>
                <p className="text-3xs text-[#567567]">Spring 2026 cumulative submissions vs verified files</p>
              </div>
              <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-2.5 py-1 rounded-md border border-[#E2EFE6]">
                +31.3% Growth
              </span>
            </div>

            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uploadTrendData}>
                  <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#165534" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#165534" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorApprovals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3BA96F" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3BA96F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" />
                  <XAxis dataKey="month" stroke="#567567" fontSize={11} tickLine={false} />
                  <YAxis stroke="#567567" fontSize={11} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="uploads" name="Files Uploaded" stroke="#165534" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUploads)" />
                  <Area type="monotone" dataKey="approvals" name="Files Approved" stroke="#3BA96F" strokeWidth={2} fillOpacity={1} fill="url(#colorApprovals)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Submission Progress (Donut Chart) */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs flex flex-col justify-between">
            <div className="pb-3 border-b border-[#E2EFE6]">
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#1E7B4E]" />
                Course File Submission Progress
              </h3>
              <p className="text-3xs text-[#567567]">Overall status distribution</p>
            </div>

            <div className="h-52 my-2 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={submissionProgressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {submissionProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-extrabold font-heading text-[#0F2D1F]">1,248</span>
                <span className="text-3xs font-semibold text-[#567567]">Total Files</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-3xs font-semibold pt-2 border-t border-[#E2EFE6]">
              {submissionProgressData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-[#567567] truncate">{item.name}:</span>
                  <span className="font-bold text-[#0F2D1F]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2: Department Completion & Approval Workflow */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department-wise Completion (Horizontal Bar Chart) */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EFE6]">
              <div>
                <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1E7B4E]" />
                  Department-wise Course File Completion (%)
                </h3>
                <p className="text-3xs text-[#567567]">Compliance percentage per academic department</p>
              </div>
              <button onClick={() => onNavigate('Department Management')} className="text-xs font-bold text-[#1E7B4E] hover:underline">
                Manage Depts
              </button>
            </div>

            <div className="h-60 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={deptCompletionData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#567567" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" stroke="#567567" fontSize={11} width={110} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="rate" name="Completion Rate (%)" fill="#165534" radius={[0, 8, 8, 0]} barSize={20}>
                    {deptCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#165534' : index === 1 ? '#1E7B4E' : index === 2 ? '#3BA96F' : '#86EFAC'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Comparison (Grouped Bar Chart) */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EFE6]">
              <div>
                <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1E7B4E]" />
                  Department Course Load vs Submissions
                </h3>
                <p className="text-3xs text-[#567567]">Assigned course files versus uploaded repositories</p>
              </div>
              <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded">
                137 / 143 Submitted
              </span>
            </div>

            <div className="h-60 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptComparisonData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" />
                  <XAxis dataKey="dept" stroke="#567567" fontSize={11} tickLine={false} />
                  <YAxis stroke="#567567" fontSize={11} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                  <Bar dataKey="assigned" name="Assigned Courses" fill="#E2EFE6" radius={[6, 6, 0, 0]} barSize={18} />
                  <Bar dataKey="submitted" name="Submitted Files" fill="#165534" radius={[6, 6, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 3: Faculty Activity & Course File Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Faculty Activity Trend (Area Chart) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EFE6]">
              <div>
                <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#1E7B4E]" />
                  Weekly Faculty Portal Activity & Uploads
                </h3>
                <p className="text-3xs text-[#567567]">Daily active logins vs file upload operations</p>
              </div>
              <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded">Peak: Wednesday</span>
            </div>

            <div className="h-60 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" />
                  <XAxis dataKey="day" stroke="#567567" fontSize={11} tickLine={false} />
                  <YAxis stroke="#567567" fontSize={11} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="logins" name="Faculty Logins" stroke="#165534" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="uploads" name="Files Uploaded" stroke="#3BA96F" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Course File Categories Distribution (Pie Chart) */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs flex flex-col justify-between">
            <div className="pb-3 border-b border-[#E2EFE6]">
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#1E7B4E]" />
                Course File Categories Distribution
              </h3>
              <p className="text-3xs text-[#567567]">Breakdown by document classification</p>
            </div>

            <div className="h-52 my-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoriesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="text-3xs text-[#567567] text-center border-t border-[#E2EFE6] pt-2">
              All documents compliant with HEC Quality Assurance guidelines.
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY, APPROVALS, UPLOADS & NOTIFICATIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Timeline & Approvals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Real-time Activity Audit Logs */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EFE6]">
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#1E7B4E]" />
                System Audit Trail & Recent Activity Logs
              </h3>
              <button
                onClick={() => onNavigate('Activity Logs')}
                className="text-xs font-bold text-[#1E7B4E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Audit Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 divide-y divide-[#E2EFE6]">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                  <div className="p-2 bg-[#E6F4EC] text-[#165534] rounded-xl shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F2D1F]">{log.userName}</span>
                      <span className="text-3xs text-[#567567]">{log.timestamp}</span>
                    </div>
                    <p className="text-[#567567] text-2xs mt-0.5">{log.details}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block text-3xs font-semibold px-2 py-0.5 bg-[#F6FAF7] text-[#15803D] border border-[#E2EFE6] rounded">
                        Module: {log.module}
                      </span>
                      <span className="text-3xs text-[#567567]">IP: {log.ipAddress}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending & Latest Approvals Queue */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EFE6]">
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Latest Approvals & Signoff Queue
              </h3>
              <button
                onClick={() => onNavigate('Approval Management')}
                className="text-xs font-bold text-[#1E7B4E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Approvals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 divide-y divide-[#E2EFE6]">
              {courseFiles.slice(0, 4).map((file) => (
                <div key={file.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#E6F4EC] text-[#165534] rounded-xl shrink-0">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F2D1F]">{file.title}</h4>
                      <p className="text-3xs text-[#567567]">
                        {file.courseCode} • Submitted by {file.teacherName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-3xs font-bold border ${
                      file.status === 'Approved'
                        ? 'bg-[#E6F4EC] text-[#15803D] border-[#E2EFE6]'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {file.status}
                    </span>
                    <button
                      onClick={() => onNavigate('Approval Management')}
                      className="p-1.5 text-[#1E7B4E] hover:bg-[#E6F4EC] rounded-lg transition-colors cursor-pointer"
                      title="Review"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & System Announcements */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2 pb-3 border-b border-[#E2EFE6]">
              <Zap className="w-4 h-4 text-[#1E7B4E]" />
              Executive Quick Actions
            </h3>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onNavigate('User Management')}
                className="w-full text-left p-3 rounded-xl bg-[#F6FAF7] hover:bg-[#E6F4EC] border border-[#E2EFE6] transition-all flex items-center justify-between text-xs font-semibold text-[#0F2D1F] group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#1E7B4E]" />
                  <span>Provision New Faculty Account</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#567567] group-hover:text-[#165534] transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('Department Management')}
                className="w-full text-left p-3 rounded-xl bg-[#F6FAF7] hover:bg-[#E6F4EC] border border-[#E2EFE6] transition-all flex items-center justify-between text-xs font-semibold text-[#0F2D1F] group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-[#1E7B4E]" />
                  <span>Manage Campus Departments</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#567567] group-hover:text-[#165534] transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('Course File Management')}
                className="w-full text-left p-3 rounded-xl bg-[#F6FAF7] hover:bg-[#E6F4EC] border border-[#E2EFE6] transition-all flex items-center justify-between text-xs font-semibold text-[#0F2D1F] group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-[#1E7B4E]" />
                  <span>Audit Master Repositories</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#567567] group-hover:text-[#165534] transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('System Settings')}
                className="w-full text-left p-3 rounded-xl bg-[#F6FAF7] hover:bg-[#E6F4EC] border border-[#E2EFE6] transition-all flex items-center justify-between text-xs font-semibold text-[#0F2D1F] group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-[#1E7B4E]" />
                  <span>Configure ERP System Parameters</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#567567] group-hover:text-[#165534] transition-colors" />
              </button>
            </div>
          </div>

          {/* System Health & Infrastructure Panel */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EFE6]">
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1E7B4E]" />
                System Health & ERP Status
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-3xs font-bold bg-[#E6F4EC] text-[#15803D]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                100% Operational
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F6FAF7] border border-[#E2EFE6] space-y-1">
                <span className="text-3xs font-bold text-[#567567] uppercase tracking-wider">Database</span>
                <p className="font-extrabold text-[#0F2D1F] flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-[#1E7B4E]" />
                  <span>MongoDB</span>
                </p>
                <span className="text-3xs text-[#15803D] font-semibold">Connected</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F6FAF7] border border-[#E2EFE6] space-y-1">
                <span className="text-3xs font-bold text-[#567567] uppercase tracking-wider">REST API</span>
                <p className="font-extrabold text-[#0F2D1F] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#1E7B4E]" />
                  <span>Node / Express</span>
                </p>
                <span className="text-3xs text-[#15803D] font-semibold">Healthy (200 OK)</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F6FAF7] border border-[#E2EFE6] space-y-1">
                <span className="text-3xs font-bold text-[#567567] uppercase tracking-wider">ERP Version</span>
                <p className="font-extrabold text-[#0F2D1F]">v2.4.0-Production</p>
                <span className="text-3xs text-[#567567] font-semibold">Build 2026.07</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F6FAF7] border border-[#E2EFE6] space-y-1">
                <span className="text-3xs font-bold text-[#567567] uppercase tracking-wider">Security</span>
                <p className="font-extrabold text-[#0F2D1F]">256-bit AES</p>
                <span className="text-3xs text-[#15803D] font-semibold">JWT Secured</span>
              </div>
            </div>
          </div>

          {/* Announcements Widget */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EFE6]">
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#1E7B4E]" />
                University System Notices
              </h3>
              <button
                onClick={() => onNavigate('Announcements')}
                className="text-xs font-bold text-[#1E7B4E] hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {announcements.map((anc) => (
                <div
                  key={anc.id}
                  className="p-3 rounded-xl bg-[#F6FAF7] border border-[#E2EFE6] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded-md border border-[#E2EFE6]">
                      {anc.priority} Priority
                    </span>
                    <span className="text-3xs text-[#567567]">{anc.createdDate}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#0F2D1F]">{anc.title}</h4>
                  <p className="text-3xs text-[#567567] line-clamp-2">{anc.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
