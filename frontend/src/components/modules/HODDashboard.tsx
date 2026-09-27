import React, { useState, useEffect } from 'react';
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
  Users,
  BookOpen,
  FileCheck2,
  Clock,
  CheckCircle,
  RotateCcw,
  Award,
  UserCheck,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Activity,
  Settings,
  ArrowRight,
  Zap,
  Building2,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp as TrendIcon,
  FileText,
  Check,
  X,
  AlertCircle,
  Briefcase,
  Layers,
  Sparkles,
  MessageSquare,
  FileCheck,
  Filter,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Search,
  Eye,
  CreditCard,
  UserCheck2,
  FileX
} from 'lucide-react';
import { TeacherEnrollmentRequest } from '../../types';

interface HODDashboardProps {
  onNavigate: (moduleName: string) => void;
}

export const HODDashboard: React.FC<HODDashboardProps> = ({ onNavigate }) => {
  const {
    courseFiles,
    usersList,
    courses,
    activityLogs,
    updateCourseFileStatus,
    teacherRequests,
    approveTeacherRequest,
    rejectTeacherRequest
  } = useCFMS();
  const { currentUser } = useAuth();

  // Dynamic HOD Scope Resolution (Campus + Department)
  const [hodScope, setHodScope] = useState<{
    campusId: string;
    campusName: string;
    departmentId: string;
    departmentName: string;
    hodName: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchScope = async () => {
      try {
        const res = await fetch('/api/hod-assignments/my-scope', {
          headers: {
            'x-user-id': currentUser?.id || '',
            'x-user-role': currentUser?.role || 'HOD',
            'x-department-id': currentUser?.departmentId || ''
          }
        });
        const data = await res.json();
        if (isMounted && data.success && data.data) {
          setHodScope(data.data);
        }
      } catch (err) {
        console.error('Error fetching HOD scope:', err);
      }
    };
    if (currentUser?.role === 'HOD') {
      fetchScope();
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const campusName = hodScope?.campusName || currentUser?.campus || 'Attock Campus';
  const deptName = hodScope?.departmentName || currentUser?.departmentName || 'Computer Science';
  const deptId = hodScope?.departmentId || currentUser?.departmentId || 'dept-cs';
  const hodName = currentUser?.name || hodScope?.hodName || 'Department HOD';

  // Scoped Department Data (Strictly isolated to this HOD's campus + department)
  const deptFiles = courseFiles.filter(
    (f) => (f.departmentId === deptId || f.departmentName === deptName)
  );
  const totalDeptFiles = deptFiles.length;
  const pendingApprovals = deptFiles.filter(
    (f) => f.status === 'Submitted' || f.status === 'In Review'
  );
  const approvedFilesCount = deptFiles.filter((f) => f.status === 'Approved').length;
  const returnedFilesCount = deptFiles.filter((f) => f.status === 'Returned' || f.status === 'Rejected').length;

  const deptTeachers = usersList.filter(
    (u) =>
      (u.departmentId === deptId || (u.departmentName && u.departmentName.toLowerCase().includes(deptName.toLowerCase()))) &&
      (!u.campus || !campusName || u.campus.toLowerCase() === campusName.toLowerCase()) &&
      (u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER')
  );
  const totalFacultyCount = deptTeachers.length;

  const deptCoursesList = courses.filter(
    (c) => c.departmentId === deptId || (c.departmentName && c.departmentName.toLowerCase().includes(deptName.toLowerCase()))
  );
  const assignedCoursesCount = deptCoursesList.length;

  // Time-based Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const timeGreeting = getGreeting();
  const todayDateStr = 'Wednesday, July 22, 2026';

  // Action Notification State
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // ── Scoped Teacher Requests (strictly filtered to this HOD's assigned campus + department) ────
  const deptTeacherRequests = (teacherRequests || []).filter((r) => {
    // If request has specific hodId, ensure it matches caller
    if (r.hodId && currentUser?.id && r.hodId !== currentUser.id) {
      return false;
    }
    const matchDept = r.departmentId === deptId || (r.departmentName && deptName && r.departmentName.toLowerCase().includes(deptName.toLowerCase().replace('department of ', '')));
    const matchCampus = !r.campusName || !campusName || r.campusName.toLowerCase() === campusName.toLowerCase();
    return matchDept && matchCampus;
  });

  const pendingTeacherRequests = deptTeacherRequests.filter((r) => r.status === 'PendingHODApproval');
  const approvedTeacherRequests = deptTeacherRequests.filter((r) => r.status === 'Approved');
  const rejectedTeacherRequests = deptTeacherRequests.filter((r) => r.status === 'Rejected');

  // Teacher Request filtering & search state
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PendingHODApproval' | 'Approved' | 'Rejected'>('ALL');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [viewRequestModal, setViewRequestModal] = useState<TeacherEnrollmentRequest | null>(null);
  const [rejectionModalReq, setRejectionModalReq] = useState<TeacherEnrollmentRequest | null>(null);
  const [confirmApproveModalReq, setConfirmApproveModalReq] = useState<TeacherEnrollmentRequest | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const filteredTeacherRequests = deptTeacherRequests.filter((r) => {
    if (requestFilter !== 'ALL' && r.status !== requestFilter) return false;
    if (teacherSearch.trim()) {
      const q = teacherSearch.trim().toLowerCase();
      const matchName = r.teacherName.toLowerCase().includes(q);
      const matchEmail = r.teacherEmail.toLowerCase().includes(q);
      const matchCourse = r.selectedCourses.some(
        (c) => c.courseCode.toLowerCase().includes(q) || c.courseTitle.toLowerCase().includes(q)
      );
      if (!matchName && !matchEmail && !matchCourse) return false;
    }
    return true;
  });

  const handleApproveTeacher = async (req: TeacherEnrollmentRequest) => {
    setIsProcessingAction(true);
    const success = await approveTeacherRequest(req.id);
    setIsProcessingAction(false);
    if (success) {
      if (viewRequestModal?.id === req.id) setViewRequestModal(null);
      setActionSuccessMsg(`Approved registration for ${req.teacherName}. Teacher Dashboard access enabled.`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    }
  };

  const handleOpenReject = (req: TeacherEnrollmentRequest) => {
    setRejectionModalReq(req);
    setRejectionReasonText('');
  };

  const handleConfirmReject = async () => {
    if (!rejectionModalReq) return;
    if (!rejectionReasonText.trim()) return;

    setIsProcessingAction(true);
    const success = await rejectTeacherRequest(rejectionModalReq.id, rejectionReasonText.trim());
    setIsProcessingAction(false);
    if (success) {
      if (viewRequestModal?.id === rejectionModalReq.id) setViewRequestModal(null);
      setRejectionModalReq(null);
      setRejectionReasonText('');
      setActionSuccessMsg(`Rejected registration for ${rejectionModalReq.teacherName}. Feedback recorded.`);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    }
  };

  const handleQuickApprove = (fileId: string, title: string) => {
    updateCourseFileStatus(fileId, 'Approved', 'Quick approval by HOD from Executive Dashboard');
    setActionSuccessMsg(`Successfully approved "${title}". Notification sent to faculty.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleQuickReturn = (fileId: string, title: string) => {
    updateCourseFileStatus(fileId, 'Returned', 'Returned for revisions by HOD');
    setActionSuccessMsg(`Returned "${title}" to faculty for revision.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // --- CHART DATA (Scoped to Department Performance) ---
  const submissionProgressData = [
    { name: 'Approved & Verified', value: 342, color: '#165534' },
    { name: 'Under HOD Review', value: 26, color: '#1E7B4E' },
    { name: 'Pending Upload', value: 12, color: '#D97706' },
    { name: 'Returned for Revision', value: 8, color: '#DC2626' }
  ];

  const facultySubmissionData = [
    { name: 'Dr. Tariq Mahmood', rate: 100, submitted: 8, total: 8 },
    { name: 'Prof. Aisha Siddiqui', rate: 100, submitted: 6, total: 6 },
    { name: 'Dr. Usman Farooq', rate: 92, submitted: 11, total: 12 },
    { name: 'Engr. Bilal Ahmed', rate: 88, submitted: 7, total: 8 },
    { name: 'Dr. Sana Rashid', rate: 85, submitted: 6, total: 7 },
    { name: 'Prof. Kamran Shah', rate: 75, submitted: 3, total: 4 }
  ];

  const monthlyUploadTrendData = [
    { month: 'Feb', uploads: 45, approvals: 42 },
    { month: 'Mar', uploads: 95, approvals: 90 },
    { month: 'Apr', uploads: 140, approvals: 132 },
    { month: 'May', uploads: 210, approvals: 200 },
    { month: 'Jun', uploads: 310, approvals: 295 },
    { month: 'Jul', uploads: 380, approvals: 342 }
  ];

  const approvalStatusDistributionData = [
    { name: 'Approved', value: 342, color: '#165534' },
    { name: 'Pending HOD', value: 26, color: '#1E7B4E' },
    { name: 'Returned', value: 8, color: '#D97706' },
    { name: 'Rejected', value: 4, color: '#DC2626' }
  ];

  const courseCompletionData = [
    { semester: 'BS CS 1st', completion: 98 },
    { semester: 'BS CS 3rd', completion: 95 },
    { semester: 'BS CS 5th', completion: 92 },
    { semester: 'BS CS 7th', completion: 96 },
    { semester: 'MS CS 1st', completion: 90 },
    { semester: 'MS CS 3rd', completion: 94 }
  ];

  const facultyPerformanceComparison = [
    { name: 'Dr. Tariq', onTime: 8, late: 0, pending: 0 },
    { name: 'Prof. Aisha', onTime: 6, late: 0, pending: 0 },
    { name: 'Dr. Usman', onTime: 10, late: 1, pending: 1 },
    { name: 'Engr. Bilal', onTime: 6, late: 1, pending: 1 },
    { name: 'Dr. Sana', onTime: 5, late: 1, pending: 1 }
  ];

  // Custom Chart Tooltip
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
      {/* Action Notification Feedback */}
      {actionSuccessMsg && (
        <div className="bg-[#E6F4EC] border border-[#1E7B4E] text-[#165534] px-4 py-3 rounded-2xl shadow-sm text-xs font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-[#165534] hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Compact Executive HOD Hero Bar with Explicit Scope Banner */}
      <div className="bg-[#0c4727] text-white p-4 sm:p-5 rounded-2xl border border-[#08351d] shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 font-bold text-lg font-heading">
            👋
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold font-heading text-white tracking-tight">
                Welcome Back, {hodName}
              </h1>
              <span className="text-3xs font-bold text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded border border-white/10">
                Head of Department
              </span>
            </div>
            
            {/* Mandatory Scope Banner: Campus + Department */}
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                <Building2 className="w-3.5 h-3.5 text-emerald-300" />
                Campus: <strong className="text-amber-200">{campusName}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 backdrop-blur-xs">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                Department: <strong className="text-amber-200">{deptName}</strong>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-3xs font-black bg-emerald-400/20 text-emerald-200 border border-emerald-400/40">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Authorized Scope
              </span>
            </div>
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
            <span>Pending Approvals: <strong className="text-amber-300 font-bold">{pendingApprovals.length}</strong></span>
          </div>
        </div>
      </div>

      {/* 1.5 Urgent Action Banner: Pending Teacher Registration Request */}
      {pendingTeacherRequests.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-700 text-white p-5 rounded-2xl shadow-lg border-2 border-amber-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
          <div className="flex items-start gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
              <Users className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider bg-white text-amber-900 shadow-2xs">
                  ⚠️ Action Required ({pendingTeacherRequests.length} Pending)
                </span>
                <span className="text-3xs font-bold text-amber-100 bg-black/20 px-2 py-0.5 rounded">
                  {deptName} • {pendingTeacherRequests[0]?.campusName || 'Attock Campus'}
                </span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
                This faculty member belongs to your department and has submitted an enrollment request. Please review and accept to grant access for course file preparation.
              </p>
              <p className="text-xs text-amber-100 font-medium flex items-center gap-2 flex-wrap">
                <span>Applicant: <strong className="text-white underline">{pendingTeacherRequests[0]?.teacherName}</strong></span>
                <span>•</span>
                <span>Type: <strong className="text-white">{pendingTeacherRequests[0]?.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}</strong></span>
                <span>•</span>
                <span>Courses: <strong className="text-white">{pendingTeacherRequests[0]?.selectedCourses?.length || 0} ({pendingTeacherRequests[0]?.totalCredits || 0} Credits)</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 relative z-10 w-full lg:w-auto justify-end">
            <button
              onClick={() => setConfirmApproveModalReq(pendingTeacherRequests[0])}
              disabled={isProcessingAction}
              className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-105 active:scale-95"
            >
              <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
              <span>Accept & Unlock Course Files</span>
            </button>
            <button
              onClick={() => setViewRequestModal(pendingTeacherRequests[0])}
              className="px-3.5 py-2.5 bg-black/25 hover:bg-black/35 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Details</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Enterprise Quick Actions Toolbar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E2EFE6] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0F2D1F]">
          <Zap className="w-4 h-4 text-[#1E7B4E]" />
          <span>HOD Quick Actions:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
          <button
            onClick={() => onNavigate('Approval Management')}
            className="px-3.5 py-2 text-xs font-bold bg-[#165534] hover:bg-[#12482c] text-white rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer group"
          >
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>Review Pending Files ({pendingApprovals.length})</span>
          </button>

          <button
            onClick={() => onNavigate('Department Teachers')}
            className="px-3.5 py-2 text-xs font-bold bg-[#F6FAF7] hover:bg-[#E6F4EC] text-[#0F2D1F] border border-[#E2EFE6] rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer group"
          >
            <Users className="w-3.5 h-3.5 text-[#1E7B4E] group-hover:scale-110 transition-transform" />
            <span>Faculty Roster</span>
          </button>

          <button
            onClick={() => onNavigate('Course Management')}
            className="px-3.5 py-2 text-xs font-bold bg-[#F6FAF7] hover:bg-[#E6F4EC] text-[#0F2D1F] border border-[#E2EFE6] rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer group"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#1E7B4E] group-hover:scale-110 transition-transform" />
            <span>Department Courses</span>
          </button>

          <button
            onClick={() => onNavigate('Reports & Analytics')}
            className="px-3.5 py-2 text-xs font-bold bg-[#F6FAF7] hover:bg-[#E6F4EC] text-[#0F2D1F] border border-[#E2EFE6] rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer group"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#1E7B4E] group-hover:scale-110 transition-transform" />
            <span>Department Analytics</span>
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI OVERVIEW (8 Scoped Department Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E] transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#567567]">Department Faculty</span>
            <div className="p-2 bg-[#E6F4EC] text-[#165534] rounded-xl group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-heading text-[#0F2D1F]">{totalFacultyCount}</span>
            <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-1.5 py-0.5 rounded">Active Staff</span>
          </div>
          <p className="text-3xs text-[#567567] mt-1">14 Regular, 4 Visiting</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E] transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#567567]">Assigned Courses</span>
            <div className="p-2 bg-[#E6F4EC] text-[#165534] rounded-xl group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-heading text-[#0F2D1F]">{assignedCoursesCount}</span>
            <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-1.5 py-0.5 rounded">Spring 2026</span>
          </div>
          <p className="text-3xs text-[#567567] mt-1">BS & MS Programs</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E] transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#567567]">Course Files Submitted</span>
            <div className="p-2 bg-[#E6F4EC] text-[#165534] rounded-xl group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-heading text-[#0F2D1F]">{totalDeptFiles}</span>
            <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-1.5 py-0.5 rounded">+14.2% YoY</span>
          </div>
          <p className="text-3xs text-[#567567] mt-1">Total Submissions</p>
        </div>

        {/* Card 4: PENDING TEACHER REQUESTS */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-amber-400 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#567567]">Pending Teacher Requests</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors relative">
              <Users className="w-4 h-4" />
              {pendingTeacherRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full border border-white" />
              )}
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-heading text-[#0F2D1F]">{pendingTeacherRequests.length}</span>
            <span className={`text-3xs font-bold px-1.5 py-0.5 rounded border ${
              pendingTeacherRequests.length > 0
                ? 'text-amber-800 bg-amber-50 border-amber-200'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200'
            }`}>
              {pendingTeacherRequests.length > 0 ? 'Requires Action' : 'All Cleared'}
            </span>
          </div>
          <p className="text-3xs text-[#567567] mt-1">Faculty enrollment applications</p>
        </div>

        {/* Card 5 */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E] transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#567567]">Approved Files</span>
            <div className="p-2 bg-[#E6F4EC] text-[#165534] rounded-xl group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-heading text-[#0F2D1F]">{approvedFilesCount}</span>
            <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-1.5 py-0.5 rounded">Verified</span>
          </div>
          <p className="text-3xs text-[#567567] mt-1">HOD Approved & Locked</p>
        </div>

        {/* Card 6 */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E] transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#567567]">Pending Approvals</span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-heading text-[#0F2D1F]">{pendingApprovals.length}</span>
            <span className="text-3xs font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Needs Review</span>
          </div>
          <p className="text-3xs text-[#567567] mt-1">Course files awaiting signoff</p>
        </div>

        {/* Card 7: APPROVED FACULTY */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-[#1E7B4E] transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#567567]">Approved Teachers</span>
            <div className="p-2 bg-[#E6F4EC] text-[#165534] rounded-xl group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-heading text-[#0F2D1F]">
              {deptTeachers.filter(u => u.enrollmentStatus === 'Approved').length || totalFacultyCount}
            </span>
            <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-1.5 py-0.5 rounded">Enrolled</span>
          </div>
          <p className="text-3xs text-[#567567] mt-1">Active departmental faculty</p>
        </div>

        {/* Card 8: REJECTED REQUESTS */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2EFE6] shadow-2xs hover:border-rose-300 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-bold uppercase tracking-wider text-[#567567]">Rejected Requests</span>
            <div className="p-2 bg-rose-100 text-rose-800 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold font-heading text-[#0F2D1F]">{rejectedTeacherRequests.length}</span>
            <span className="text-3xs font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              Revisions
            </span>
          </div>
          <p className="text-3xs text-[#567567] mt-1">Returned for revision</p>
        </div>
      </div>

      {/* 3. DEPARTMENT ANALYTICS SECTION (6 BI Visualizations) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2EFE6] pb-3">
          <div>
            <h2 className="text-base font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#1E7B4E]" />
              Department Business Intelligence & Performance Analytics
            </h2>
            <p className="text-xs text-[#567567] mt-0.5">Faculty submission metrics, course completion rates, and approval workflow status.</p>
          </div>
          <button
            onClick={() => onNavigate('Reports & Analytics')}
            className="text-xs font-bold text-[#1E7B4E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Detailed Dept Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Row 1: Submission Progress Donut + Faculty-wise Horizontal Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart: Submission Progress */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs flex flex-col justify-between">
            <div className="pb-3 border-b border-[#E2EFE6]">
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#1E7B4E]" />
                Course File Submission Progress
              </h3>
              <p className="text-3xs text-[#567567]">Overall department status breakdown</p>
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
                <span className="text-lg font-extrabold font-heading text-[#0F2D1F]">380</span>
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

          {/* Horizontal Bar Chart: Faculty-wise Submission Status */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EFE6]">
              <div>
                <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1E7B4E]" />
                  Faculty-wise Course File Submission Rates (%)
                </h3>
                <p className="text-3xs text-[#567567]">Individual compliance tracking across department faculty</p>
              </div>
              <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-2.5 py-1 rounded-md border border-[#E2EFE6]">
                Avg: 91.6%
              </span>
            </div>

            <div className="h-60 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={facultySubmissionData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#567567" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" stroke="#567567" fontSize={10} width={120} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="rate" name="Completion Rate (%)" fill="#165534" radius={[0, 8, 8, 0]} barSize={18}>
                    {facultySubmissionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 2 ? '#165534' : index < 4 ? '#1E7B4E' : '#3BA96F'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Monthly Upload Trend + Approval Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Smooth Line Chart: Monthly Course File Upload Trend */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EFE6]">
              <div>
                <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                  <TrendIcon className="w-4 h-4 text-[#1E7B4E]" />
                  Monthly Course File Upload & Approval Trend
                </h3>
                <p className="text-3xs text-[#567567]">Cumulative department course file trajectory</p>
              </div>
              <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded">
                +22.5% Growth
              </span>
            </div>

            <div className="h-60 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyUploadTrendData}>
                  <defs>
                    <linearGradient id="colorDeptUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#165534" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#165534" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" />
                  <XAxis dataKey="month" stroke="#567567" fontSize={11} tickLine={false} />
                  <YAxis stroke="#567567" fontSize={11} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="uploads" name="Department Uploads" stroke="#165534" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDeptUploads)" />
                  <Area type="monotone" dataKey="approvals" name="HOD Approvals" stroke="#3BA96F" strokeWidth={2} fillOpacity={0.2} fill="#3BA96F" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Approval Status Distribution */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs flex flex-col justify-between">
            <div className="pb-3 border-b border-[#E2EFE6]">
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#1E7B4E]" />
                Approval Workflow Status Distribution
              </h3>
              <p className="text-3xs text-[#567567]">Breakdown of review states in {deptName}</p>
            </div>

            <div className="h-52 my-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={approvalStatusDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {approvalStatusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="text-3xs text-[#567567] text-center border-t border-[#E2EFE6] pt-2">
              All files are archived under 256-bit encrypted department storage.
            </div>
          </div>
        </div>

        {/* Row 3: Course Completion Progress + Faculty Performance Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Bar Chart: Course Completion Progress */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EFE6]">
              <div>
                <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#1E7B4E]" />
                  Program & Semester Completion Progress (%)
                </h3>
                <p className="text-3xs text-[#567567]">Percentage of course files verified per semester level</p>
              </div>
              <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded">Target: 90%</span>
            </div>

            <div className="h-60 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseCompletionData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" />
                  <XAxis dataKey="semester" stroke="#567567" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#567567" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="completion" name="Completion Rate (%)" fill="#165534" radius={[6, 6, 0, 0]} barSize={24}>
                    {courseCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#165534' : '#1E7B4E'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grouped Bar Chart: Faculty Performance Comparison */}
          <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2EFE6]">
              <div>
                <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1E7B4E]" />
                  Faculty Timeliness & Submission Breakdown
                </h3>
                <p className="text-3xs text-[#567567]">On-time vs Late vs Pending file submissions</p>
              </div>
            </div>

            <div className="h-60 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facultyPerformanceComparison} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EFE6" />
                  <XAxis dataKey="name" stroke="#567567" fontSize={11} tickLine={false} />
                  <YAxis stroke="#567567" fontSize={11} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                  <Bar dataKey="onTime" name="On-Time Submissions" fill="#165534" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="late" name="Late Submissions" fill="#D97706" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="pending" name="Pending Files" fill="#DC2626" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTIONS PANEL */}
      <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2 pb-3 border-b border-[#E2EFE6]">
          <Zap className="w-4 h-4 text-[#1E7B4E]" />
          Executive HOD Quick Actions
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('Approval Management')}
            className="p-3.5 rounded-xl bg-[#F6FAF7] hover:bg-[#E6F4EC] border border-[#E2EFE6] transition-all flex flex-col items-center text-center gap-2 text-xs font-bold text-[#0F2D1F] group cursor-pointer hover:border-[#1E7B4E]"
          >
            <div className="p-2.5 bg-[#E6F4EC] text-[#165534] rounded-xl group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span>Approve Files</span>
          </button>

          <button
            onClick={() => onNavigate('Approval Management')}
            className="p-3.5 rounded-xl bg-[#F6FAF7] hover:bg-[#E6F4EC] border border-[#E2EFE6] transition-all flex flex-col items-center text-center gap-2 text-xs font-bold text-[#0F2D1F] group cursor-pointer hover:border-[#1E7B4E]"
          >
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <span>Review Pending</span>
          </button>

          <button
            onClick={() => onNavigate('User Management')}
            className="p-3.5 rounded-xl bg-[#F6FAF7] hover:bg-[#E6F4EC] border border-[#E2EFE6] transition-all flex flex-col items-center text-center gap-2 text-xs font-bold text-[#0F2D1F] group cursor-pointer hover:border-[#1E7B4E]"
          >
            <div className="p-2.5 bg-[#E6F4EC] text-[#165534] rounded-xl group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <span>Manage Faculty</span>
          </button>

          <button
            onClick={() => onNavigate('Course File Management')}
            className="p-3.5 rounded-xl bg-[#F6FAF7] hover:bg-[#E6F4EC] border border-[#E2EFE6] transition-all flex flex-col items-center text-center gap-2 text-xs font-bold text-[#0F2D1F] group cursor-pointer hover:border-[#1E7B4E]"
          >
            <div className="p-2.5 bg-[#E6F4EC] text-[#165534] rounded-xl group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>Assign Courses</span>
          </button>

          <button
            onClick={() => onNavigate('Reports & Analytics')}
            className="p-3.5 rounded-xl bg-[#F6FAF7] hover:bg-[#E6F4EC] border border-[#E2EFE6] transition-all flex flex-col items-center text-center gap-2 text-xs font-bold text-[#0F2D1F] group cursor-pointer hover:border-[#1E7B4E]"
          >
            <div className="p-2.5 bg-[#E6F4EC] text-[#165534] rounded-xl group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span>View Reports</span>
          </button>

          <button
            onClick={() => onNavigate('System Settings')}
            className="p-3.5 rounded-xl bg-[#F6FAF7] hover:bg-[#E6F4EC] border border-[#E2EFE6] transition-all flex flex-col items-center text-center gap-2 text-xs font-bold text-[#0F2D1F] group cursor-pointer hover:border-[#1E7B4E]"
          >
            <div className="p-2.5 bg-[#E6F4EC] text-[#165534] rounded-xl group-hover:bg-[#165534] group-hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </div>
            <span>Dept Settings</span>
          </button>
        </div>
      </div>

      {/* 4.5 TEACHER REGISTRATION & COURSE ALLOCATION REQUESTS */}
      <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2EFE6]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1E7B4E]" />
                Teacher Registration & Course Allocation Requests
              </h3>
              {pendingTeacherRequests.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                  {pendingTeacherRequests.length} Action Needed
                </span>
              )}
            </div>
            <p className="text-3xs text-[#567567] mt-0.5">
              Review and approve faculty registration and teaching course loads strictly for <strong className="text-slate-800">{deptName}</strong>
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              placeholder="Search teacher, email, course..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* HOD Notification Alert Banner in Request section */}
        {pendingTeacherRequests.length > 0 && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>HOD Action Required:</strong> This faculty member belongs to your department and has submitted an enrollment request. Please review and accept to grant access for course file preparation.
              </span>
            </div>
            <span className="font-extrabold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full text-3xs shrink-0">
              {pendingTeacherRequests.length} Pending
            </span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => setRequestFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              requestFilter === 'ALL'
                ? 'bg-[#165534] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Requests ({deptTeacherRequests.length})
          </button>
          <button
            onClick={() => setRequestFilter('PendingHODApproval')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              requestFilter === 'PendingHODApproval'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <span>Pending Review</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-3xs">{pendingTeacherRequests.length}</span>
          </button>
          <button
            onClick={() => setRequestFilter('Approved')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              requestFilter === 'Approved'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span>Approved</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-3xs">{approvedTeacherRequests.length}</span>
          </button>
          <button
            onClick={() => setRequestFilter('Rejected')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              requestFilter === 'Rejected'
                ? 'bg-rose-700 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <span>Rejected / Revision</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-3xs">{rejectedTeacherRequests.length}</span>
          </button>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-[#E2EFE6] bg-[#F6FAF7] text-3xs font-bold text-[#567567] uppercase tracking-wider">
                <th className="py-2.5 px-3">Teacher Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Campus</th>
                <th className="py-2.5 px-3">Teacher Type</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Selected Courses</th>
                <th className="py-2.5 px-3 text-center">Total Credits</th>
                <th className="py-2.5 px-3">Submitted Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EFE6] text-xs">
              {filteredTeacherRequests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-[#567567]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <span className="font-bold text-[#0F2D1F]">No teacher requests found.</span>
                      <span className="text-3xs text-[#567567]">
                        {requestFilter === 'ALL'
                          ? `No teachers have submitted registration requests for ${deptName} yet.`
                          : `No requests currently matching "${requestFilter}".`}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTeacherRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#F6FAF7] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#0F2D1F]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                          {req.teacherName.charAt(0)}
                        </div>
                        <span>{req.teacherName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-2xs font-mono text-slate-600">
                      {req.teacherEmail}
                    </td>
                    <td className="py-3 px-3 text-2xs font-bold text-emerald-800">
                      {req.campusName || 'Attock Campus'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-bold border ${
                        req.teacherType === 'REGULAR_TEACHER'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                      }`}>
                        {req.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-2xs font-semibold text-slate-700">
                      {req.departmentName.replace('Department of ', '')}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
                        {req.selectedCourses.map((c, i) => (
                          <span key={`${c.courseId}-${i}`} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded border border-slate-200" title={c.courseTitle || c.courseName}>
                            {c.courseCode} {c.section ? `(${c.section})` : ''} ({c.creditHours || c.credits}Cr)
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {req.totalCredits} / {req.creditLimit || (req.teacherType === 'REGULAR_TEACHER' ? 22 : 12)} Cr
                      </span>
                    </td>
                    <td className="py-3 px-3 text-3xs text-[#567567]">
                      {new Date(req.submittedAt).toLocaleDateString('en-PK', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-3">
                      {req.status === 'Approved' && (
                        <span className="px-2.5 py-1 rounded-full text-3xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Approved
                        </span>
                      )}
                      {req.status === 'PendingHODApproval' && (
                        <span className="px-2.5 py-1 rounded-full text-3xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending Review
                        </span>
                      )}
                      {req.status === 'Rejected' && (
                        <span className="px-2.5 py-1 rounded-full text-3xs font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1 w-fit" title={req.rejectionReason}>
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewRequestModal(req)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-3xs font-bold transition-all cursor-pointer flex items-center gap-1 border border-slate-200"
                          title="View Full Application"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        {req.status === 'PendingHODApproval' && (
                          <>
                            <button
                              onClick={() => setConfirmApproveModalReq(req)}
                              disabled={isProcessingAction}
                              className="px-2.5 py-1 rounded-lg bg-[#165534] hover:bg-[#1E7B4E] text-white text-3xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                              title="Approve Teacher & Unlock Course Files"
                            >
                              <Check className="w-3 h-3" />
                              <span>Accept & Unlock</span>
                            </button>
                            <button
                              onClick={() => handleOpenReject(req)}
                              disabled={isProcessingAction}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-3xs font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="Reject / Return with Feedback"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          DETAILED HOD REVIEW MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {viewRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center">
                  {viewRequestModal.teacherName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                    {viewRequestModal.teacherName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{viewRequestModal.teacherEmail}</p>
                </div>
              </div>
              <button
                onClick={() => setViewRequestModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Teacher Classification</span>
                <span className="font-bold text-slate-800">
                  {viewRequestModal.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Department</span>
                <span className="font-bold text-slate-800">{viewRequestModal.departmentName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Applicable Limit</span>
                <span className="font-bold text-emerald-700">
                  Max {viewRequestModal.creditLimit || (viewRequestModal.teacherType === 'REGULAR_TEACHER' ? 22 : 12)} Credits
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">CNIC / ID</span>
                <span className="font-bold text-slate-800">{viewRequestModal.profileData?.cnic || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Phone Contact</span>
                <span className="font-bold text-slate-800">{viewRequestModal.profileData?.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Highest Qualification</span>
                <span className="font-bold text-slate-800">{viewRequestModal.profileData?.highestQualification || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Academic Session</span>
                <span className="font-bold text-slate-800">{viewRequestModal.profileData?.academicSession || 'Spring 2026'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Specialization</span>
                <span className="font-bold text-slate-800">{viewRequestModal.profileData?.specialization || 'General'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Current Status</span>
                <span className="font-bold text-slate-900">{viewRequestModal.status}</span>
              </div>
            </div>

            {/* Selected Courses Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">
                  Selected Courses & Credit Hours ({viewRequestModal.selectedCourses.length}):
                </h4>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Total: {viewRequestModal.totalCredits} Credits
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Course Code</th>
                      <th className="p-2.5">Course Title</th>
                      <th className="p-2.5 text-right">Credit Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewRequestModal.selectedCourses.map((c, i) => (
                      <tr key={`${c.courseId}-${i}`} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-emerald-700">{c.courseCode}</td>
                        <td className="p-2.5 text-slate-800 font-medium">
                          {c.courseTitle || c.courseName}
                          {c.section && (
                            <span className="ml-2 text-2xs font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              {c.section}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-black text-slate-900">{c.creditHours || c.credits} Cr</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50 font-bold">
                      <td colSpan={2} className="p-2.5 text-right text-emerald-950 font-extrabold">
                        Total Course Credits:
                      </td>
                      <td className="p-2.5 text-right font-black text-emerald-900">
                        {viewRequestModal.totalCredits} / {viewRequestModal.creditLimit || (viewRequestModal.teacherType === 'REGULAR_TEACHER' ? 22 : 12)} Cr
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rejection Notice if rejected */}
            {viewRequestModal.status === 'Rejected' && (
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-rose-900 block">Rejection Feedback / Reason:</span>
                <p className="text-rose-800">"{viewRequestModal.rejectionReason || 'No reason provided.'}"</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewRequestModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>

              {viewRequestModal.status === 'PendingHODApproval' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenReject(viewRequestModal)}
                    disabled={isProcessingAction}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Reject Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmApproveModalReq(viewRequestModal)}
                    disabled={isProcessingAction}
                    className="px-5 py-2 bg-[#165534] hover:bg-[#1E7B4E] text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Approve & Enroll Faculty
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          REJECTION REASON MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {rejectionModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  Reject Registration Request
                </h3>
                <p className="text-3xs text-slate-500 mt-0.5">
                  Provide instructions for <strong>{rejectionModalReq.teacherName}</strong> to revise their application.
                </p>
              </div>
              <button
                onClick={() => setRejectionModalReq(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Template Reasons */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-2xs">Quick Fill Suggestions:</label>
              <div className="space-y-1">
                {[
                  'Selected course load requires adjustment for this semester schedule.',
                  'Credit hours exceed departmental teaching allocations. Please adjust.',
                  'Course assignment conflict. Please contact the HOD office.'
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setRejectionReasonText(reason)}
                    className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-2xs transition-colors border border-slate-200"
                  >
                    • {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Rejection Reason & Required Changes <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="Enter specific reason so the teacher can correct and resubmit..."
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectionModalReq(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectionReasonText.trim() || isProcessingAction}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer transition-all shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CONFIRMATION MODAL BEFORE APPROVAL (Requirement 26)
         ══════════════════════════════════════════════════════════════════════ */}
      {confirmApproveModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Confirm Teacher Registration Approval
                  </h3>
                  <p className="text-3xs text-slate-500">
                    Authority: {hodName} ({deptName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmApproveModalReq(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">{confirmApproveModalReq.teacherName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Faculty Type:</span>
                <span className="font-bold text-slate-900">
                  {confirmApproveModalReq.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Department / Scope:</span>
                <span className="font-bold text-emerald-800">
                  {confirmApproveModalReq.departmentName} ({confirmApproveModalReq.campusName || campusName})
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Teaching Load:</span>
                <span className="font-bold text-slate-900">
                  {confirmApproveModalReq.selectedCourses.length} Courses ({confirmApproveModalReq.totalCredits} Credit Hours)
                </span>
              </div>
            </div>

            <p className="text-2xs text-slate-600 leading-relaxed">
              Accepting this request will immediately grant <strong>{confirmApproveModalReq.teacherName}</strong> full access to create course files and automatically sync their permanent record into the <strong>Admin Teacher Registration Module</strong>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmApproveModalReq(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const reqToApprove = confirmApproveModalReq;
                  setConfirmApproveModalReq(null);
                  handleApproveTeacher(reqToApprove);
                }}
                disabled={isProcessingAction}
                className="px-5 py-2 bg-[#165534] hover:bg-[#1E7B4E] text-white font-bold rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PENDING APPROVALS EXECUTIVE TABLE */}
      <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2EFE6]">
          <div>
            <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Pending Department Course File Approvals Queue
            </h3>
            <p className="text-3xs text-[#567567] mt-0.5">Direct signoff and revision feedback tools for HOD</p>
          </div>
          <button
            onClick={() => onNavigate('Approval Management')}
            className="text-xs font-bold text-[#1E7B4E] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>Open Master Approval Workflow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#E2EFE6] bg-[#F6FAF7] text-3xs font-bold text-[#567567] uppercase tracking-wider">
                <th className="py-2.5 px-3">Faculty Member</th>
                <th className="py-2.5 px-3">Course Code & Title</th>
                <th className="py-2.5 px-3">Submission Date</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Priority</th>
                <th className="py-2.5 px-3 text-right">HOD Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2EFE6] text-xs">
              {pendingApprovals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#567567]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-[#15803D]" />
                      <span className="font-bold text-[#0F2D1F]">All department submissions are up to date!</span>
                      <span className="text-3xs text-[#567567]">No files currently awaiting HOD signoff.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingApprovals.map((file) => (
                  <tr key={file.id} className="hover:bg-[#F6FAF7] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#0F2D1F]">
                      {file.teacherName}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#0F2D1F]">{file.title}</div>
                      <div className="text-3xs text-[#567567]">{file.courseCode}</div>
                    </td>
                    <td className="py-3 px-3 text-3xs text-[#567567]">
                      {file.updatedAt || 'July 21, 2026'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-3xs font-bold border border-slate-200">
                        v{file.version || 1.0}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full text-3xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {file.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-3xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        High
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleQuickApprove(file.id, file.title)}
                          className="px-2.5 py-1 rounded-lg bg-[#165534] hover:bg-[#1E7B4E] text-white text-3xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                          title="Approve File"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleQuickReturn(file.id, file.title)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-3xs font-bold transition-all cursor-pointer flex items-center gap-1"
                          title="Return for Revisions"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Return</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. DEPARTMENT PERFORMANCE & RECENT ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Performance Ranking */}
        <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EFE6]">
            <div>
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#1E7B4E]" />
                Department Faculty Performance Ranking
              </h3>
              <p className="text-3xs text-[#567567]">Top compliant faculty members based on upload deadlines</p>
            </div>
            <span className="text-3xs font-bold text-[#15803D] bg-[#E6F4EC] px-2 py-0.5 rounded">
              Rank #1 Campus-wide
            </span>
          </div>

          <div className="space-y-3 divide-y divide-[#E2EFE6]">
            {facultySubmissionData.slice(0, 4).map((f, idx) => (
              <div key={f.name} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shadow-2xs ${
                    idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-[#E6F4EC] text-[#165534]'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <span className="font-bold text-[#0F2D1F] block">{f.name}</span>
                    <span className="text-3xs text-[#567567]">Submissions: {f.submitted} / {f.total} Files</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200 hidden sm:block">
                    <div className="bg-[#165534] h-full rounded-full" style={{ width: `${f.rate}%` }} />
                  </div>
                  <span className="font-extrabold text-[#0F2D1F] text-xs">{f.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Audit Logs for Department */}
        <div className="bg-white rounded-2xl border border-[#E2EFE6] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2EFE6]">
            <div>
              <h3 className="text-sm font-bold font-heading text-[#0F2D1F] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#1E7B4E]" />
                Recent Department Activity & Upload Logs
              </h3>
              <p className="text-3xs text-[#567567]">Real-time operational stream for {deptName}</p>
            </div>
            <button
              onClick={() => onNavigate('Activity Logs')}
              className="text-xs font-bold text-[#1E7B4E] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 divide-y divide-[#E2EFE6]">
            {activityLogs
              .filter((log) => log.module === 'Course File' || log.module === 'Approval' || log.module === 'Dashboard')
              .slice(0, 4)
              .map((log) => (
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
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
