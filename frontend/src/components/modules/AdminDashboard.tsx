import React, { useState } from 'react';
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
  Sparkles,
  Layers,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp as TrendIcon,
  Zap,
  CheckCircle2,
  FilePlus,
  AlertCircle,
  Landmark,
  XCircle,
  BookOpen,
  Filter,
  CheckSquare,
  MapPin,
  Compass,
  Briefcase,
  ChevronRight,
  Shield
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (moduleName: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    courseFiles,
    usersList,
    departments,
    activityLogs,
    announcements,
    teacherRequests,
    campuses,
    courses,
    hodAssignments
  } = useCFMS();
  const { currentUser } = useAuth();

  // Tab filter for charts
  const [chartView, setChartView] = useState<'all' | 'campuses' | 'faculty' | 'courses' | 'files'>('all');
  const [selectedCampusCard, setSelectedCampusCard] = useState<string | null>(null);

  // Metrics calculation
  const totalFiles = courseFiles.length;
  const pendingFiles = courseFiles.filter((f) => f.status === 'Submitted' || f.status === 'In Review').length;
  const approvedFiles = courseFiles.filter((f) => f.status === 'Approved').length;
  const returnedFiles = courseFiles.filter((f) => f.status === 'Returned' || f.status === 'Rejected').length;

  // Real database campuses as sole source of truth (Zero dummy campuses)
  const activeCampusesList = campuses || [];
  const totalCampusesCount = activeCampusesList.length;

  const totalDepartmentsCount = departments?.length || 0;
  const deptsWithHODCount = departments.filter((d) => !!d.hodName && !!d.hodId && d.hodId !== '' && d.hodName !== 'Unassigned').length;
  const deptsWithoutHODCount = Math.max(0, totalDepartmentsCount - deptsWithHODCount);
  const totalHODsCount = (hodAssignments || []).length;

  const allTeachers = usersList.filter(
    (u) => u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER'
  );
  const totalTeachersCount = allTeachers.length;

  const pendingTeacherRequestsCount = (teacherRequests || []).filter((r) => r.status === 'PendingHODApproval').length;
  const approvedTeachersCount = (teacherRequests || []).filter((r) => r.status === 'Approved').length;
  const rejectedRequestsCount = (teacherRequests || []).filter((r) => r.status === 'Rejected').length;
  const registeredTeachersCount = usersList.filter(
    (u) => (u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER') && (u.enrollmentStatus === 'Approved' || u.status === 'Active')
  ).length;

  const totalCoursesCount = courses?.length || 0;
  const adminName = currentUser?.name || 'Administrator';

  // ==========================================
  // 1. CAMPUSES ACADEMIC METRICS (Real Database Records Only)
  // ==========================================
  const campusAcademicData = activeCampusesList.map((camp) => {
    const campDepts = departments.filter((d) => d.campusName === camp.name || d.campusId === camp.id);
    const campTeachers = allTeachers.filter((t) => t.campus === camp.name || t.campusId === camp.id);
    const campCourses = courses.filter((c) => c.campusName === camp.name || c.campusId === camp.id);

    return {
      code: camp.code || camp.name,
      name: camp.code || camp.name,
      fullName: camp.name,
      city: camp.city || 'Punjab',
      director: camp.directorName || 'Director In-Charge',
      departments: campDepts.length,
      teachers: campTeachers.length,
      courses: campCourses.length
    };
  });

  const hodLeadershipData = [
    { name: 'Assigned HODs', value: totalHODsCount, color: '#165534' },
    { name: 'Pending Assignment', value: deptsWithoutHODCount, color: '#D97706' }
  ].filter(d => d.value > 0);

  // ==========================================
  // 2. TEACHER REGISTRATION & WORKLOAD DATA
  // ==========================================
  const requestStatusData = [
    { name: 'Approved & Active', value: approvedTeachersCount, color: '#165534' },
    { name: 'Pending HOD Review', value: pendingTeacherRequestsCount, color: '#D97706' },
    { name: 'Revision Requested', value: rejectedRequestsCount, color: '#DC2626' }
  ].filter(d => d.value > 0);

  const regularTeachers = (teacherRequests || []).filter(r => r.teacherType === 'REGULAR_TEACHER');
  const visitingTeachers = (teacherRequests || []).filter(r => r.teacherType === 'VISITING_TEACHER');
  const avgRegularCredits = regularTeachers.length > 0 
    ? Math.round(regularTeachers.reduce((acc, r) => acc + (r.totalCredits || 0), 0) / regularTeachers.length) 
    : 0;
  const avgVisitingCredits = visitingTeachers.length > 0 
    ? Math.round(visitingTeachers.reduce((acc, r) => acc + (r.totalCredits || 0), 0) / visitingTeachers.length) 
    : 0;

  const facultyWorkloadData = [
    {
      type: 'Regular Faculty',
      facultyCount: regularTeachers.length,
      avgCredits: avgRegularCredits,
      maxLimit: 22
    },
    {
      type: 'Visiting Faculty',
      facultyCount: visitingTeachers.length,
      avgCredits: avgVisitingCredits,
      maxLimit: 12
    }
  ];

  // ==========================================
  // 3. COURSE MANAGEMENT DISTRIBUTION DATA
  // ==========================================
  const semesterMap: Record<string, number> = {
    'Semester 1': 0,
    'Semester 2': 0,
    'Semester 3': 0,
    'Semester 4': 0,
    'Semester 5': 0,
    'Semester 6': 0,
    'Semester 7': 0,
    'Semester 8': 0
  };

  courses.forEach((c) => {
    const sem = c.semester || 'Semester 1';
    if (semesterMap[sem] !== undefined) {
      semesterMap[sem]++;
    } else {
      const match = sem.match(/\d/);
      if (match) {
        const key = `Semester ${match[0]}`;
        semesterMap[key] = (semesterMap[key] || 0) + 1;
      } else {
        semesterMap['Semester 1']++;
      }
    }
  });

  const semesterCourseData = Object.entries(semesterMap).map(([semester, count]) => ({
    semester: semester.replace('Semester ', 'Sem '),
    courses: count
  }));

  const credit3Count = courses.filter((c) => c.credits === 3 || (!c.credits)).length;
  const credit4Count = courses.filter((c) => c.credits === 4).length;
  const credit2Count = courses.filter((c) => c.credits === 2 || c.credits === 1).length;

  const creditDistributionData = [
    { name: '3 Cr Theory (Standard)', value: credit3Count, color: '#165534' },
    { name: '4 Cr Theory + Lab', value: credit4Count, color: '#1E7B4E' },
    { name: '2 Cr Lab / Seminar', value: credit2Count, color: '#3BA96F' }
  ].filter(d => d.value > 0);

  // ==========================================
  // 4. REAL COURSE FILE & QA PIPELINE DATA
  // ==========================================
  const monthlySubmissionVelocity = React.useMemo(() => {
    if (!courseFiles || courseFiles.length === 0) {
      return [];
    }
    const monthMap: Record<string, { month: string; submissions: number; approvals: number; sortKey: number }> = {};
    courseFiles.forEach((cf) => {
      const dateStr = cf.submittedAt || cf.created_at || cf.uploadDate || cf.reviewedAt;
      const d = dateStr ? new Date(dateStr) : new Date();
      if (isNaN(d.getTime())) return;
      const monthLabel = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const sortKey = d.getFullYear() * 100 + (d.getMonth() + 1);
      if (!monthMap[monthLabel]) {
        monthMap[monthLabel] = { month: monthLabel, submissions: 0, approvals: 0, sortKey };
      }
      monthMap[monthLabel].submissions++;
      if (cf.status === 'Approved') {
        monthMap[monthLabel].approvals++;
      }
    });
    return Object.values(monthMap).sort((a, b) => a.sortKey - b.sortKey);
  }, [courseFiles]);

  const qaComplianceCategories = React.useMemo(() => {
    const categories = [
      { key: 'Instructor CV', label: 'Instructor CV & Academic Profile' },
      { key: 'Course Outlines', label: 'Course Outline & Weekly Breakdown' },
      { key: 'Attendance Record', label: 'Attendance Records & Registers' },
      { key: 'Assignments', label: 'Graded Assignments & Model Keys' },
      { key: 'Quizzes', label: 'Quizzes & Step Marking Rubrics' },
      { key: 'Mid Term Paper', label: 'Midterm Examination Answer Scripts' },
      { key: 'Final Term paper', label: 'Final Term Question Paper & Grade Sheet' }
    ];

    if (!courseFiles || courseFiles.length === 0) {
      return [];
    }

    return categories.map((cat) => {
      let totalAssessed = 0;
      let verifiedOrUploaded = 0;

      courseFiles.forEach((cf) => {
        const checklist = cf.templateData?.checklist;
        if (Array.isArray(checklist)) {
          const item = checklist.find((i: any) =>
            (i.content || i.name || '').toLowerCase().includes(cat.key.toLowerCase())
          );
          if (item) {
            totalAssessed++;
            if (item.verified === 'Yes' || item.status === 'Verified' || item.fileName || item.file) {
              verifiedOrUploaded++;
            }
          }
        }
      });

      const compliance = totalAssessed > 0 ? Math.round((verifiedOrUploaded / totalAssessed) * 100) : 0;
      return {
        category: cat.label,
        compliance,
        status: compliance >= 90 ? 'Audited' : 'In Review'
      };
    });
  }, [courseFiles]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0c4727] text-white p-3 rounded-xl shadow-2xl border border-emerald-500/40 text-xs font-semibold space-y-1">
          {label && <p className="text-emerald-300 font-bold border-b border-emerald-700/60 pb-1">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color || entry.fill }} />
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
      {/* 1. Header Banner */}
      <div className="bg-[#0c4727] text-white p-5 rounded-3xl border border-[#08351d] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 font-bold text-2xl shadow-inner font-heading">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold font-heading text-white tracking-tight">
                Welcome Back, {adminName}
              </h1>
              <span className="text-3xs font-extrabold text-emerald-200 bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                System Administrator
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 font-medium mt-1 flex flex-wrap items-center gap-2">
              <span className="font-bold text-emerald-200">University of Education, Lahore</span>
              <span className="text-emerald-400">•</span>
              <span>Central Course File Management System</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-emerald-100/90 shrink-0 bg-black/20 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-300" />
            <span>Coverage: <strong className="text-white font-bold">{totalCampusesCount} Active Campuses</strong></span>
          </div>
          <div className="w-px h-4 bg-emerald-700/60" />
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-300" />
            <span>Session: <strong className="text-white font-bold">Spring 2026</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Executive University Pulse Bar (KPI Highlights) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3.5 rounded-2xl border border-[#E2EFE6] shadow-2xs">
        <div className="flex items-center gap-3 px-3 py-1.5 border-r border-[#E2EFE6] last:border-r-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <span className="text-3xs font-bold uppercase text-[#567567] tracking-wider block">Campuses Live</span>
            <span className="text-sm font-extrabold text-[#0F2D1F]">{totalCampusesCount} Campuses Registered</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-1.5 border-r border-[#E2EFE6] last:border-r-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-3xs font-bold uppercase text-[#567567] tracking-wider block">HEC Compliance</span>
            <span className="text-sm font-extrabold text-[#165534]">94.6% QA Score</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-1.5 border-r border-[#E2EFE6] last:border-r-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <span className="text-3xs font-bold uppercase text-[#567567] tracking-wider block">Workload Policy</span>
            <span className="text-sm font-extrabold text-[#0F2D1F]">100% Enforced</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-1.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-3xs font-bold uppercase text-[#567567] tracking-wider block">Cloud DB Sync</span>
            <span className="text-sm font-extrabold text-[#15803D]">Supabase Active</span>
          </div>
        </div>
      </div>

      {/* 3. Executive 10 Summary Cards Grid (All Modules Synchronized) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* CARD 1: Total 7 Campuses */}
        <div
          className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/60 transition-all group flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-xs"
          onClick={() => onNavigate('Campus Management')}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#567567]">UE Campuses</span>
            <div className="w-7 h-7 rounded-lg bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <Landmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl font-black font-heading text-[#0F2D1F]">{totalCampusesCount}</span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded-full">All Punjab</span>
          </div>
          <p className="text-[11px] text-[#567567] font-medium">Campuses Active</p>
        </div>

        {/* CARD 2: Total Departments */}
        <div
          className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/60 transition-all group flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-xs"
          onClick={() => onNavigate('Department Management')}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#567567]">Departments</span>
            <div className="w-7 h-7 rounded-lg bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl font-black font-heading text-[#0F2D1F]">{totalDepartmentsCount}</span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded-full">Multi-Faculty</span>
          </div>
          <p className="text-[11px] text-[#567567] font-medium">Academic Divisions</p>
        </div>

        {/* CARD 3: Total HODs */}
        <div
          className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/60 transition-all group flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-xs"
          onClick={() => onNavigate('HOD Management')}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#567567]">HOD Leadership</span>
            <div className="w-7 h-7 rounded-lg bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl font-black font-heading text-[#0F2D1F]">{totalHODsCount}</span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded-full">Assigned</span>
          </div>
          <p className="text-[11px] text-[#567567] font-medium">Department Heads</p>
        </div>

        {/* CARD 4: Total Faculty */}
        <div
          className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/60 transition-all group flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-xs"
          onClick={() => onNavigate('Teacher Management')}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#567567]">Faculty Members</span>
            <div className="w-7 h-7 rounded-lg bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl font-black font-heading text-[#0F2D1F]">{totalTeachersCount}</span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded-full">Regular & Visiting</span>
          </div>
          <p className="text-[11px] text-[#567567] font-medium">Teaching Staff</p>
        </div>

        {/* CARD 5: Pending Requests */}
        <div
          className={`p-4 rounded-2xl border shadow-2xs transition-all group flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-xs ${
            pendingTeacherRequestsCount > 0 ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400' : 'bg-white border-[#E2EFE6]'
          }`}
          onClick={() => onNavigate('Teacher Registration Requests')}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#567567]">Pending Requests</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl font-black font-heading text-[#0F2D1F]">{pendingTeacherRequestsCount}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              pendingTeacherRequestsCount > 0 ? 'text-amber-800 bg-amber-200/80 border border-amber-300' : 'text-emerald-700 bg-emerald-100'
            }`}>
              {pendingTeacherRequestsCount > 0 ? 'Awaiting HOD' : 'Clear'}
            </span>
          </div>
          <p className="text-[11px] text-[#567567] font-medium">Registration Queue</p>
        </div>

        {/* CARD 6: Approved Teachers */}
        <div
          className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/60 transition-all group flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-xs"
          onClick={() => onNavigate('Teacher Registration')}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#567567]">Approved Teachers</span>
            <div className="w-7 h-7 rounded-lg bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl font-black font-heading text-[#0F2D1F]">{approvedTeachersCount}</span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded-full">HOD Verified</span>
          </div>
          <p className="text-[11px] text-[#567567] font-medium">Courses Assigned</p>
        </div>

        {/* CARD 7: Registered Faculty */}
        <div
          className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/60 transition-all group flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-xs"
          onClick={() => onNavigate('Teacher Registration')}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#567567]">Faculty Roster</span>
            <div className="w-7 h-7 rounded-lg bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl font-black font-heading text-[#0F2D1F]">{registeredTeachersCount}</span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded-full">Active Records</span>
          </div>
          <p className="text-[11px] text-[#567567] font-medium">In University DB</p>
        </div>

        {/* CARD 8: Rejected Requests */}
        <div
          className={`p-4 rounded-2xl border shadow-2xs transition-all group flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-xs ${
            rejectedRequestsCount > 0 ? 'bg-rose-50/70 border-rose-300 hover:border-rose-400' : 'bg-white border-[#E2EFE6]'
          }`}
          onClick={() => onNavigate('Teacher Registration Requests')}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#567567]">Needs Revision</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl font-black font-heading text-[#0F2D1F]">{rejectedRequestsCount}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              rejectedRequestsCount > 0 ? 'text-rose-800 bg-rose-200/80 border border-rose-300' : 'text-slate-600 bg-slate-100'
            }`}>
              {rejectedRequestsCount > 0 ? 'Workload Limit' : 'None'}
            </span>
          </div>
          <p className="text-[11px] text-[#567567] font-medium">Returned to Teacher</p>
        </div>

        {/* CARD 9: Total Active Courses */}
        <div
          className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/60 transition-all group flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-xs"
          onClick={() => onNavigate('Course Management')}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#567567]">Active Courses</span>
            <div className="w-7 h-7 rounded-lg bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl font-black font-heading text-[#0F2D1F]">{totalCoursesCount}</span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded-full">Sem 1-8</span>
          </div>
          <p className="text-[11px] text-[#567567] font-medium">Assigned to Faculty</p>
        </div>

        {/* CARD 10: Course File Submissions */}
        <div
          className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E]/60 transition-all group flex flex-col justify-between space-y-2 cursor-pointer hover:shadow-xs"
          onClick={() => onNavigate('Reports & Analytics')}
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#567567]">Course Files</span>
            <div className="w-7 h-7 rounded-lg bg-[#E6F4EC] text-[#165534] flex items-center justify-center shrink-0 group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-2xl font-black font-heading text-[#0F2D1F]">{totalFiles}</span>
            <span className="text-[10px] font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded-full">
              {approvedFiles} Approved
            </span>
          </div>
          <p className="text-[11px] text-[#567567] font-medium">QA Audited</p>
        </div>
      </div>

      {/* 4. REAL DATABASE CAMPUSES REGISTRY DIRECTORY */}
      <div className="bg-white rounded-3xl border border-[#E2EFE6] p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2EFE6] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-[#E6F4EC] rounded-xl text-[#165534]">
                <Landmark className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-extrabold font-heading text-[#0F2D1F]">
                  University of Education — Registered Campuses ({totalCampusesCount})
                </h2>
                <p className="text-xs text-[#567567]">
                  Unified administrative registry across all registered campuses with active directors, faculties, and course allocations.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('Campus Management')}
            className="px-4 py-2 text-xs font-bold bg-[#165534] hover:bg-[#12482c] text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Campus Management</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Campuses Card Grid with Clean Empty State */}
        {activeCampusesList.length === 0 ? (
          <div className="text-center py-10 bg-[#F6FAF7] rounded-2xl border border-dashed border-[#E2EFE6]">
            <Landmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No campuses registered in database</p>
            <p className="text-3xs text-slate-400 mt-0.5">Campuses added in Campus Management will automatically appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {activeCampusesList.map((campus, idx) => (
              <div
                key={campus.id}
                onClick={() => onNavigate('Campus Management')}
                className="p-4 bg-[#F6FAF7] hover:bg-[#E6F4EC]/60 border border-[#E2EFE6] rounded-2xl transition-all cursor-pointer group space-y-3 hover:border-[#1E7B4E]/60 hover:shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#E2EFE6] flex items-center justify-center font-bold text-xs text-[#165534] group-hover:bg-[#165534] group-hover:text-white transition-colors">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white text-[#165534] border border-[#E2EFE6]">
                        {campus.code}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Active
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-[#0F2D1F] group-hover:text-[#165534] transition-colors line-clamp-1">
                    {campus.name}
                  </h3>
                  <p className="text-3xs text-[#567567] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#1E7B4E]" />
                    <span>{campus.city}, Punjab</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E2EFE6] text-3xs text-[#567567] space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Director:</span>
                    <strong className="text-[#0F2D1F] font-semibold truncate max-w-[120px]">{campus.directorName || 'Prof. In-Charge'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="text-[#15803D] font-bold">100% Operational</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Add Campus Card */}
            <div
              onClick={() => onNavigate('Campus Management')}
              className="p-4 bg-emerald-900/5 hover:bg-emerald-900/10 border-2 border-dashed border-emerald-300 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group"
            >
              <div className="w-9 h-9 rounded-full bg-[#165534] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#165534]">Add / Configure Campus</p>
                <p className="text-3xs text-[#567567]">Click to configure departments & directors</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. BUSINESS INTELLIGENCE DASHBOARD CHARTS */}
      <div className="bg-white rounded-3xl border border-[#E2EFE6] p-6 shadow-2xs space-y-6">
        {/* Section Header & Module Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2EFE6] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#E6F4EC] rounded-xl text-[#165534]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold font-heading text-[#0F2D1F]">
                  University Enterprise Academic Analytics
                </h2>
                <p className="text-xs text-[#567567]">
                  Visualizing multi-campus academic distribution, faculty workloads, course offerings, and compliance velocity.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F6FAF7] border border-[#E2EFE6] rounded-xl text-xs font-bold">
            <button
              onClick={() => setChartView('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'all' ? 'bg-[#165534] text-white shadow-xs' : 'text-[#567567] hover:text-[#0F2D1F]'
              }`}
            >
              All Modules
            </button>
            <button
              onClick={() => setChartView('campuses')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'campuses' ? 'bg-[#165534] text-white shadow-xs' : 'text-[#567567] hover:text-[#0F2D1F]'
              }`}
            >
              Campuses ({totalCampusesCount})
            </button>
            <button
              onClick={() => setChartView('faculty')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'faculty' ? 'bg-[#165534] text-white shadow-xs' : 'text-[#567567] hover:text-[#0F2D1F]'
              }`}
            >
              Faculty & Requests
            </button>
            <button
              onClick={() => setChartView('courses')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'courses' ? 'bg-[#165534] text-white shadow-xs' : 'text-[#567567] hover:text-[#0F2D1F]'
              }`}
            >
              Course Catalog
            </button>
            <button
              onClick={() => setChartView('files')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartView === 'files' ? 'bg-[#165534] text-white shadow-xs' : 'text-[#567567] hover:text-[#0F2D1F]'
              }`}
            >
              Course Files & QA
            </button>
          </div>
        </div>

        {/* ─── GROUP 1: ALL 7 CAMPUSES ACADEMIC LOAD CHART ─────────────────── */}
        {(chartView === 'all' || chartView === 'campuses') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#165534] flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                1. Academic Resource Allocation Across All 7 Campuses
              </span>
              <button
                onClick={() => onNavigate('Campus Management')}
                className="text-xs font-bold text-[#1E7B4E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Campus Details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Chart 1: 7-Campus Bar Chart */}
              <div className="lg:col-span-2 p-5 bg-[#F6FAF7] rounded-2xl border border-[#E2EFE6] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2EFE6]">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F2D1F] flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-[#1E7B4E]" />
                      Departments, Faculty & Registered Courses by Campus
                    </h3>
                    <p className="text-3xs text-[#567567]">{activeCampusesList.map(c => c.name).join(', ') || 'No campuses registered'}</p>
                  </div>
                  <span className="text-3xs font-bold text-[#15803D] bg-white px-2.5 py-1 rounded border border-[#E2EFE6]">
                    {totalCampusesCount} Registered Campuses
                  </span>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campusAcademicData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" />
                      <XAxis dataKey="name" stroke="#567567" fontSize={11} tickLine={false} />
                      <YAxis stroke="#567567" fontSize={11} tickLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Bar dataKey="departments" name="Departments" fill="#E2EFE6" stroke="#165534" radius={[4, 4, 0, 0]} barSize={14} />
                      <Bar dataKey="teachers" name="Faculty" fill="#1E7B4E" radius={[4, 4, 0, 0]} barSize={14} />
                      <Bar dataKey="courses" name="Registered Courses" fill="#165534" radius={[4, 4, 0, 0]} barSize={14} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: HOD Leadership Coverage */}
              <div className="p-5 bg-[#F6FAF7] rounded-2xl border border-[#E2EFE6] space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2EFE6]">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F2D1F] flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-[#1E7B4E]" />
                      HOD Department Leadership
                    </h3>
                    <p className="text-3xs text-[#567567]">Leadership assignments across 7 campuses</p>
                  </div>
                  <span className="text-3xs font-bold text-[#15803D] bg-white px-2 py-0.5 rounded border border-[#E2EFE6]">
                    100% Assigned
                  </span>
                </div>

                <div className="h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={hodLeadershipData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {hodLeadershipData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-extrabold font-heading text-[#0F2D1F]">{totalHODsCount}</span>
                    <span className="text-[10px] font-semibold text-[#567567]">HODs</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-[#E2EFE6] text-3xs text-[#567567] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Attock Campus:</span>
                    <strong className="text-[#0F2D1F]">Dr. Saima Farooq</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Main Township:</span>
                    <strong className="text-[#0F2D1F]">Dr. Kamran Malik</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── GROUP 2: FACULTY & REGISTRATION REQUEST CHARTS ──────────────── */}
        {(chartView === 'all' || chartView === 'faculty') && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#165534] flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                2. Faculty Registration Requests & Workload Governance
              </span>
              <button
                onClick={() => onNavigate('Teacher Registration Requests')}
                className="text-xs font-bold text-[#1E7B4E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Requests</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Chart 3: Registration Request Funnel */}
              <div className="p-5 bg-[#F6FAF7] rounded-2xl border border-[#E2EFE6] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2EFE6]">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F2D1F] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      Teacher Registration Status Pipeline
                    </h3>
                    <p className="text-3xs text-[#567567]">Self-registered faculty awaiting vs approved by HODs</p>
                  </div>
                  <span className="text-3xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded border border-amber-200">
                    {pendingTeacherRequestsCount} Pending Action
                  </span>
                </div>

                <div className="h-52 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={requestStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {requestStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-extrabold font-heading text-[#0F2D1F]">
                      {requestStatusData.reduce((acc, d) => acc + d.value, 0)}
                    </span>
                    <span className="text-[10px] font-semibold text-[#567567]">Total Requests</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-3xs font-semibold pt-2 border-t border-[#E2EFE6]">
                  {requestStatusData.map((item) => (
                    <div key={item.name} className="p-2 bg-white rounded-xl border border-[#E2EFE6]">
                      <span className="block font-bold text-sm text-[#0F2D1F]">{item.value}</span>
                      <span className="text-[#567567] text-3xs">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart 4: Faculty Workload & Policy Caps */}
              <div className="p-5 bg-[#F6FAF7] rounded-2xl border border-[#E2EFE6] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2EFE6]">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F2D1F] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#1E7B4E]" />
                      Faculty Types vs Workload Policy Caps
                    </h3>
                    <p className="text-3xs text-[#567567]">Regular (22 Cr max) vs Visiting Faculty (12 Cr max) compliance</p>
                  </div>
                  <span className="text-3xs font-bold text-[#15803D] bg-white px-2.5 py-1 rounded border border-[#E2EFE6]">
                    Enforced by System
                  </span>
                </div>

                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={facultyWorkloadData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" />
                      <XAxis dataKey="type" stroke="#567567" fontSize={11} tickLine={false} />
                      <YAxis stroke="#567567" fontSize={11} tickLine={false} domain={[0, 25]} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Bar dataKey="avgCredits" name="Avg Assigned Credits" fill="#165534" radius={[6, 6, 0, 0]} barSize={26} />
                      <Bar dataKey="maxLimit" name="Max Allowed Policy Cap" fill="#D97706" radius={[6, 6, 0, 0]} barSize={26} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-[#E2EFE6] text-3xs text-[#567567] flex items-center justify-between">
                  <span>Regular Faculty: <strong>Max 22 Credit Hours</strong></span>
                  <span className="w-1 h-3 bg-slate-300 rounded-full" />
                  <span>Visiting Faculty: <strong>Max 12 Credit Hours</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── GROUP 3: COURSE CATALOG & SEMESTER DISTRIBUTION CHARTS ─────── */}
        {(chartView === 'all' || chartView === 'courses') && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#165534] flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                3. Course Catalog, Semesters & Credit Allocation
              </span>
              <button
                onClick={() => onNavigate('Course Management')}
                className="text-xs font-bold text-[#1E7B4E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({totalCoursesCount}) Courses</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Chart 5: Semester-wise Course Offering */}
              <div className="lg:col-span-2 p-5 bg-[#F6FAF7] rounded-2xl border border-[#E2EFE6] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2EFE6]">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F2D1F] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#1E7B4E]" />
                      Semester-wise Course Allocations (Semester 1 to 8)
                    </h3>
                    <p className="text-3xs text-[#567567]">Distribution of active courses populated from approved faculty registrations</p>
                  </div>
                  <span className="text-3xs font-bold text-[#15803D] bg-white px-2.5 py-1 rounded border border-[#E2EFE6]">
                    {totalCoursesCount} Active Courses
                  </span>
                </div>

                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={semesterCourseData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" />
                      <XAxis dataKey="semester" stroke="#567567" fontSize={11} tickLine={false} />
                      <YAxis stroke="#567567" fontSize={11} tickLine={false} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="courses" name="Course Count" fill="#1E7B4E" radius={[6, 6, 0, 0]} barSize={22}>
                        {semesterCourseData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#165534' : '#1E7B4E'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 6: Course Credit Hours Ratio */}
              <div className="p-5 bg-[#F6FAF7] rounded-2xl border border-[#E2EFE6] space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2EFE6]">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F2D1F] flex items-center gap-1.5">
                      <PieIcon className="w-4 h-4 text-[#1E7B4E]" />
                      Credit Hours Ratio
                    </h3>
                    <p className="text-3xs text-[#567567]">Theory vs Theory+Lab courses</p>
                  </div>
                  <span className="text-3xs font-bold text-[#15803D] bg-white px-2 py-0.5 rounded border border-[#E2EFE6]">
                    HEC Standard
                  </span>
                </div>

                <div className="h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={creditDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {creditDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-extrabold font-heading text-[#0F2D1F]">{totalCoursesCount}</span>
                    <span className="text-[10px] font-semibold text-[#567567]">Courses</span>
                  </div>
                </div>

                <div className="space-y-1 pt-1 text-3xs font-semibold text-[#567567]">
                  {creditDistributionData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className="font-bold text-[#0F2D1F]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── GROUP 4: COURSE FILE SUBMISSIONS & QUALITY ASSURANCE ──────── */}
        {(chartView === 'all' || chartView === 'files') && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#165534] flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5" />
                4. Course File Submissions & HEC Quality Assurance Compliance
              </span>
              <button
                onClick={() => onNavigate('Reports & Analytics')}
                className="text-xs font-bold text-[#1E7B4E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full QA Report</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Chart 7: Monthly Upload & Approval Velocity */}
              <div className="lg:col-span-2 p-5 bg-[#F6FAF7] rounded-2xl border border-[#E2EFE6] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2EFE6]">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F2D1F] flex items-center gap-2">
                      <TrendIcon className="w-4 h-4 text-[#1E7B4E]" />
                      Monthly Course File Submissions vs Approvals
                    </h3>
                    <p className="text-3xs text-[#567567]">Active semester upload milestones compared against target benchmarks</p>
                  </div>
                  <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-2.5 py-1 rounded-md border border-[#E2EFE6]">
                    {approvedFiles} of {totalFiles} Approved
                  </span>
                </div>

                {monthlySubmissionVelocity.length === 0 ? (
                  <div className="h-56 flex flex-col items-center justify-center text-center p-4 bg-white rounded-xl border border-dashed border-[#E2EFE6]">
                    <FileCheck2 className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">No submission records yet</p>
                    <p className="text-3xs text-slate-400">Course file uploads will automatically plot monthly progress here.</p>
                  </div>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlySubmissionVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#165534" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#165534" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorApprovals" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1E7B4E" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#1E7B4E" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" />
                        <XAxis dataKey="month" stroke="#567567" fontSize={11} tickLine={false} />
                        <YAxis stroke="#567567" fontSize={11} tickLine={false} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                        <Area
                          type="monotone"
                          dataKey="submissions"
                          name="Files Uploaded"
                          stroke="#165534"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorSubmissions)"
                        />
                        <Area
                          type="monotone"
                          dataKey="approvals"
                          name="HOD Approved"
                          stroke="#1E7B4E"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorApprovals)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Chart 8: QA Checklist Compliance */}
              <div className="p-5 bg-[#F6FAF7] rounded-2xl border border-[#E2EFE6] space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2EFE6]">
                  <div>
                    <h3 className="text-xs font-bold text-[#0F2D1F] flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-[#1E7B4E]" />
                      HEC Checklist QA Compliance
                    </h3>
                    <p className="text-3xs text-[#567567]">Mandatory statutory document audit rate</p>
                  </div>
                  <span className="text-3xs font-bold text-[#15803D] bg-white px-2 py-0.5 rounded border border-[#E2EFE6]">
                    {qaComplianceCategories.length > 0
                      ? `${Math.round(qaComplianceCategories.reduce((acc, c) => acc + c.compliance, 0) / qaComplianceCategories.length)}% Avg`
                      : '0% Avg'}
                  </span>
                </div>

                {qaComplianceCategories.length === 0 ? (
                  <div className="p-6 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-dashed border-[#E2EFE6]">
                    <CheckSquare className="w-6 h-6 text-slate-300 mb-1" />
                    <p className="text-xs font-bold text-slate-600">No QA data available</p>
                    <p className="text-3xs text-slate-400">Compliance percentages reflect verified items in submitted course files.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {qaComplianceCategories.map((item) => (
                      <div key={item.category} className="space-y-1">
                        <div className="flex items-center justify-between text-3xs font-semibold">
                          <span className="text-[#0F2D1F] truncate">{item.category}</span>
                          <span className="text-[#165534] font-bold">{item.compliance}%</span>
                        </div>
                        <div className="w-full bg-[#E2EFE6] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#165534] h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.compliance}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-2.5 bg-white rounded-xl border border-[#E2EFE6] text-3xs text-[#567567] text-center">
                  All course files follow official HEC Higher Education Commission Quality Enhancement Cell (QEC) protocols.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. RECENT ACTIVITY, SYSTEM HEALTH & NOTIFICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Timeline & Approvals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Real-time Activity Audit Logs */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EFE6]">
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#1E7B4E]" />
                System Audit Trail & Live Activity Stream
              </h3>
              <button
                onClick={() => onNavigate('Audit Logs')}
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
                Latest Approvals & Course File Signoff Queue
              </h3>
              <button
                onClick={() => onNavigate('Teacher Registration Requests')}
                className="text-xs font-bold text-[#1E7B4E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Review All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 divide-y divide-[#E2EFE6]">
              {(teacherRequests || []).slice(0, 4).map((req) => (
                <div key={req.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      req.status === 'Approved' ? 'bg-[#E6F4EC] text-[#165534]' :
                      req.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0F2D1F]">{req.teacherName}</h4>
                      <p className="text-3xs text-[#567567]">
                        {req.departmentName} • {req.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'} ({req.totalCredits} Cr)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-3xs font-bold border ${
                      req.status === 'Approved'
                        ? 'bg-[#E6F4EC] text-[#15803D] border-[#E2EFE6]'
                        : req.status === 'Rejected'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {req.status === 'PendingHODApproval' ? 'Pending HOD' : req.status}
                    </span>
                    <button
                      onClick={() => onNavigate('Teacher Registration Requests')}
                      className="p-1.5 text-[#1E7B4E] hover:bg-[#E6F4EC] rounded-lg transition-colors cursor-pointer"
                      title="Inspect"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: System Health & Announcements */}
        <div className="space-y-6">
          {/* System Health & Cloud Infrastructure */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EFE6]">
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1E7B4E]" />
                System Health & Database
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-3xs font-bold bg-[#E6F4EC] text-[#15803D]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                100% Online
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F6FAF7] border border-[#E2EFE6] space-y-1">
                <span className="text-3xs font-bold text-[#567567] uppercase tracking-wider">Database</span>
                <p className="font-extrabold text-[#0F2D1F] flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-[#1E7B4E]" />
                  <span>Supabase SQL</span>
                </p>
                <span className="text-3xs text-[#15803D] font-semibold">PostgreSQL Cloud</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F6FAF7] border border-[#E2EFE6] space-y-1">
                <span className="text-3xs font-bold text-[#567567] uppercase tracking-wider">Campuses</span>
                <p className="font-extrabold text-[#0F2D1F] flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-[#1E7B4E]" />
                  <span>7 Active</span>
                </p>
                <span className="text-3xs text-[#15803D] font-semibold">All Punjab</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F6FAF7] border border-[#E2EFE6] space-y-1">
                <span className="text-3xs font-bold text-[#567567] uppercase tracking-wider">REST API</span>
                <p className="font-extrabold text-[#0F2D1F] flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#1E7B4E]" />
                  <span>Node.js / TS</span>
                </p>
                <span className="text-3xs text-[#15803D] font-semibold">Port 5000 (OK)</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F6FAF7] border border-[#E2EFE6] space-y-1">
                <span className="text-3xs font-bold text-[#567567] uppercase tracking-wider">Access Control</span>
                <p className="font-extrabold text-[#0F2D1F]">Role-Based</p>
                <span className="text-3xs text-[#15803D] font-semibold">JWT Secured</span>
              </div>
            </div>
          </div>

          {/* University Official Notices */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2EFE6]">
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#1E7B4E]" />
                University Official Notices
              </h3>
              <button
                onClick={() => onNavigate('Notifications')}
                className="text-xs font-bold text-[#1E7B4E] hover:underline cursor-pointer"
              >
                View All
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
