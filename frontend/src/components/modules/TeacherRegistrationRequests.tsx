import React, { useState, useMemo, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { TeacherEnrollmentRequest, SelectedCourseItem } from '../../types';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  Building2,
  Landmark,
  UserCheck,
  UserX,
  Eye,
  Mail,
  Phone,
  CreditCard,
  BookOpen,
  Calendar,
  AlertCircle,
  RefreshCw,
  X,
  FileText,
  ShieldAlert,
  Send,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';

interface TeacherRegistrationRequestsProps {
  activeSubModule?: 'Pending Requests' | 'All Requests' | 'Rejected Requests' | string;
  onNavigate?: (moduleName: string) => void;
}

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-PK', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch {
    return iso;
  }
};

export const TeacherRegistrationRequests: React.FC<TeacherRegistrationRequestsProps> = ({
  activeSubModule = 'Pending Requests',
  onNavigate
}) => {
  const {
    teacherRequests,
    campuses,
    departments,
    hodAssignments,
    refreshTeacherRequests,
    approveTeacherRequest,
    rejectTeacherRequest
  } = useCFMS();

  // Tab State
  const currentTab = useMemo(() => {
    if (activeSubModule === 'All Requests') return 'All Requests';
    if (activeSubModule === 'Rejected Requests') return 'Rejected Requests';
    return 'Pending Requests';
  }, [activeSubModule]);

  // Loading & Feedback
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [campusFilter, setCampusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [detailModalReq, setDetailModalReq] = useState<TeacherEnrollmentRequest | null>(null);
  const [rejectModalReq, setRejectModalReq] = useState<TeacherEnrollmentRequest | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Auto-clear notifications
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 5000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  // Always refresh latest data on mount
  useEffect(() => {
    refreshTeacherRequests();
  }, []);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTeacherRequests();
    } finally {
      setIsRefreshing(false);
    }
  };

  // KPI Counts
  const totalCount = (teacherRequests || []).length;
  const pendingCount = (teacherRequests || []).filter(
    (r) => r.status === 'PendingHODApproval' || r.status === 'Pending'
  ).length;
  const approvedCount = (teacherRequests || []).filter((r) => r.status === 'Approved').length;
  const rejectedCount = (teacherRequests || []).filter((r) => r.status === 'Rejected').length;

  // Filter requests based on current tab & dropdowns
  const filteredList = useMemo(() => {
    return (teacherRequests || []).filter((r) => {
      // 1. Tab enforcement
      if (currentTab === 'Pending Requests') {
        if (r.status !== 'PendingHODApproval' && r.status !== 'Pending') return false;
      } else if (currentTab === 'Rejected Requests') {
        if (r.status !== 'Rejected') return false;
      } else if (currentTab === 'All Requests') {
        if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      }

      // 2. Campus Filter
      if (campusFilter !== 'ALL') {
        const matchesCampus =
          (r.campusId && r.campusId === campusFilter) ||
          (r.campusName && r.campusName.toLowerCase() === campusFilter.toLowerCase());
        if (!matchesCampus) return false;
      }

      // 3. Department Filter
      if (deptFilter !== 'ALL' && r.departmentId !== deptFilter) {
        return false;
      }

      // 4. Teacher Type Filter
      if (typeFilter !== 'ALL' && r.teacherType !== typeFilter) {
        return false;
      }

      // 5. Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchTeacher =
          (r.teacherName && r.teacherName.toLowerCase().includes(q)) ||
          (r.teacherEmail && r.teacherEmail.toLowerCase().includes(q));
        const matchDept = r.departmentName && r.departmentName.toLowerCase().includes(q);
        const matchCampus = r.campusName && r.campusName.toLowerCase().includes(q);
        const matchHOD = r.hodName && r.hodName.toLowerCase().includes(q);
        const matchCourse =
          Array.isArray(r.selectedCourses) &&
          r.selectedCourses.some(
            (c: any) =>
              (c.courseName && c.courseName.toLowerCase().includes(q)) ||
              (c.courseTitle && c.courseTitle.toLowerCase().includes(q)) ||
              (c.courseCode && c.courseCode.toLowerCase().includes(q))
          );
        if (!matchTeacher && !matchDept && !matchCampus && !matchHOD && !matchCourse) {
          return false;
        }
      }

      return true;
    });
  }, [teacherRequests, currentTab, statusFilter, campusFilter, deptFilter, typeFilter, search]);

  // Handle Approve Request
  const handleApprove = async (req: TeacherEnrollmentRequest) => {
    setActionLoadingId(req.id);
    try {
      const ok = await approveTeacherRequest(req.id);
      if (ok) {
        setSuccessMsg(`Teacher request for ${req.teacherName} approved successfully.`);
        if (detailModalReq?.id === req.id) setDetailModalReq(null);
        await refreshTeacherRequests();
      } else {
        setErrorMsg('Failed to approve teacher request.');
      }
    } catch {
      setErrorMsg('Network error while approving request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Rejection Modal
  const handleOpenRejectModal = (req: TeacherEnrollmentRequest) => {
    setRejectModalReq(req);
    setRejectionReasonInput(req.rejectionReason || 'Please adjust selected courses/credit hours and resubmit.');
  };

  // Submit Rejection
  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReq) return;
    if (!rejectionReasonInput.trim()) {
      setErrorMsg('Please specify a rejection reason for the teacher.');
      return;
    }

    setActionLoadingId(rejectModalReq.id);
    try {
      const ok = await rejectTeacherRequest(rejectModalReq.id, rejectionReasonInput.trim());
      if (ok) {
        setSuccessMsg(
          `Request for ${rejectModalReq.teacherName} marked as Rejected with feedback sent to teacher.`
        );
        setRejectModalReq(null);
        if (detailModalReq?.id === rejectModalReq.id) setDetailModalReq(null);
        await refreshTeacherRequests();
      } else {
        setErrorMsg('Failed to reject teacher request.');
      }
    } catch {
      setErrorMsg('Network error while rejecting request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Request ID',
      'Teacher Name',
      'Email',
      'Teacher Type',
      'Campus',
      'Department',
      'Routed HOD',
      'Total Credits',
      'Courses Count',
      'Status',
      'Submitted At',
      'Reviewed At',
      'Rejection Reason'
    ];

    const rows = filteredList.map((r) => [
      `"${r.id}"`,
      `"${r.teacherName}"`,
      `"${r.teacherEmail}"`,
      `"${r.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}"`,
      `"${r.campusName || 'Attock Campus'}"`,
      `"${r.departmentName}"`,
      `"${r.hodName || 'Department HOD'}"`,
      `"${r.totalCredits || 0}"`,
      `"${(r.selectedCourses || []).length}"`,
      `"${r.status}"`,
      `"${fmtDate(r.submittedAt)}"`,
      `"${fmtDate(r.reviewedAt)}"`,
      `"${(r.rejectionReason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `UE_Teacher_Requests_${currentTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh] w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Teacher Registration Requests
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Multi-campus faculty enrollment verification, HOD departmental routing, and approval tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Refresh requests from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Module Tabs (Matching Sidebar Items exactly) */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => onNavigate && onNavigate('Pending Requests')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
            currentTab === 'Pending Requests'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Pending Requests</span>
          <span
            className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${
              pendingCount > 0
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('All Requests')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
            currentTab === 'All Requests'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-emerald-700" />
          <span>All Requests</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('Rejected Requests')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
            currentTab === 'Rejected Requests'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <XCircle className="w-4 h-4 text-rose-500" />
          <span>Rejected Requests</span>
          <span
            className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${
              rejectedCount > 0
                ? 'bg-rose-100 text-rose-900 border border-rose-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* 3. Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{pendingCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Awaiting HOD Review</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{approvedCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Approved / Enrolled</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-800">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{rejectedCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Needs Revision / Rejected</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-800">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{totalCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Total Lifetime Submissions</p>
          </div>
        </div>
      </div>

      {/* 5. Filter & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by teacher, email, campus, HOD, or course..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Campus Filter */}
          <div>
            <select
              value={campusFilter}
              onChange={(e) => setCampusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white cursor-pointer"
            >
              <option value="ALL">All Campuses</option>
              {(campuses || []).map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {(departments || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white cursor-pointer"
            >
              <option value="ALL">All Faculty Types</option>
              <option value="REGULAR_TEACHER">Regular Faculty (Max 22 Cr)</option>
              <option value="VISITING_TEACHER">Visiting Faculty (Max 12 Cr)</option>
            </select>
          </div>
        </div>

        {/* Status Filter (Only in "All Requests" tab) */}
        {currentTab === 'All Requests' && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Status Filter:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['ALL', 'PendingHODApproval', 'Approved', 'Rejected'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-3xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL'
                    ? 'All'
                    : st === 'PendingHODApproval'
                    ? 'Pending HOD'
                    : st}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Main Data Cards / Table */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No registration requests found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || campusFilter !== 'ALL' || deptFilter !== 'ALL'
              ? 'No requests match your selected search or filter criteria.'
              : currentTab === 'Pending Requests'
              ? 'No pending registration requests currently awaiting HOD review.'
              : currentTab === 'Rejected Requests'
              ? 'No rejected registration requests on record.'
              : 'No faculty registration requests have been submitted yet.'}
          </p>
          {(search || campusFilter !== 'ALL' || deptFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setCampusFilter('ALL');
                setDeptFilter('ALL');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Showing {filteredList.length} of {totalCount} Requests
            </span>
            <span className="text-3xs font-medium text-slate-500">
              {currentTab === 'Pending Requests'
                ? 'Sorted by submission date (newest first)'
                : 'Directly synced with database and HOD routing'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-3xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Teacher / Applicant</th>
                  <th className="py-3 px-4">Faculty Role</th>
                  <th className="py-3 px-4">Campus & Department</th>
                  <th className="py-3 px-4">Assigned HOD Scope</th>
                  <th className="py-3 px-4">Selected Courses</th>
                  <th className="py-3 px-4">Status & Applied</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredList.map((req) => {
                  const isRegular = req.teacherType === 'REGULAR_TEACHER';
                  const isPending = req.status === 'PendingHODApproval' || req.status === 'Pending';
                  const isApproved = req.status === 'Approved';
                  const isRejected = req.status === 'Rejected';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Teacher Applicant */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {req.teacherName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{req.teacherName}</p>
                            <p className="text-3xs text-slate-500 font-mono mt-0.5">{req.teacherEmail}</p>
                            {req.profileData?.phone && (
                              <p className="text-3xs text-slate-400 mt-0.5 flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5" />
                                <span>{req.profileData.phone}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Faculty Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-bold border ${
                            isRegular
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {isRegular ? 'Regular Faculty' : 'Visiting Faculty'}
                        </span>
                        <p className="text-3xs text-slate-400 mt-0.5">
                          Limit: {req.creditLimit || (isRegular ? 22 : 12)} Cr
                        </p>
                      </td>

                      {/* Campus & Department */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 flex items-center gap-1 text-xs">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {req.departmentName}
                          </span>
                          <span className="text-3xs text-slate-500 block">
                            {req.campusName || 'Attock Campus'}
                          </span>
                        </div>
                      </td>

                      {/* Assigned HOD Scope */}
                      <td className="py-3.5 px-4">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 space-y-0.5 max-w-[200px]">
                          <div className="flex items-center gap-1 text-3xs font-bold text-slate-700">
                            <UserCheck className="w-3 h-3 text-emerald-700" />
                            <span className="truncate">{req.hodName || 'Department HOD'}</span>
                          </div>
                          <span className="text-4xs text-slate-400 block truncate">
                            Scope: {req.departmentName}
                          </span>
                        </div>
                      </td>

                      {/* Selected Courses & Workload */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs">
                              {req.totalCredits || 0} Credits
                            </span>
                            <span className="text-3xs text-slate-500">
                              ({(req.selectedCourses || []).length} course
                              {(req.selectedCourses || []).length === 1 ? '' : 's'})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {(req.selectedCourses || []).slice(0, 3).map((c: SelectedCourseItem, idx: number) => (
                              <span
                                key={idx}
                                className="text-4xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-mono"
                                title={c.courseTitle || c.courseName}
                              >
                                {c.courseCode} ({c.credits || c.creditHours}Cr)
                              </span>
                            ))}
                            {(req.selectedCourses || []).length > 3 && (
                              <span className="text-4xs bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                                +{(req.selectedCourses || []).length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status & Applied Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                              <Clock className="w-2.5 h-2.5 animate-pulse" />
                              Pending HOD
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Approved
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                              <XCircle className="w-2.5 h-2.5" />
                              Rejected
                            </span>
                          )}
                          <p className="text-3xs text-slate-400 block">{fmtDate(req.submittedAt)}</p>
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailModalReq(req)}
                            className="p-1.5 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="View Full Application Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(req)}
                                disabled={actionLoadingId === req.id}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-3xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                title="Approve Request (Direct Admin Action)"
                              >
                                {actionLoadingId === req.id ? 'Approving...' : 'Approve'}
                              </button>

                              <button
                                onClick={() => handleOpenRejectModal(req)}
                                disabled={actionLoadingId === req.id}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-3xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                title="Reject / Request Revisions"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {isRejected && (
                            <button
                              onClick={() => setDetailModalReq(req)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-3xs font-bold transition-all cursor-pointer"
                            >
                              View Reason
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. FULL APPLICATION DOSSIER MODAL */}
      {detailModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Application ID: {detailModalReq.id}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {detailModalReq.teacherName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{detailModalReq.teacherEmail}</p>
              </div>

              <button
                onClick={() => setDetailModalReq(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rejection Alert if Rejected */}
            {detailModalReq.status === 'Rejected' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Rejection Feedback / Notes:</span>
                </div>
                <p className="text-xs text-rose-800 pl-6 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-rose-200/80">
                  "{detailModalReq.rejectionReason || 'No specific feedback provided.'}"
                </p>
                <p className="text-3xs text-rose-600 pl-6">
                  Reviewed by: {detailModalReq.reviewedBy || 'HOD'} on {fmtDate(detailModalReq.reviewedAt)}
                </p>
              </div>
            )}

            {/* Scope & Routing Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-3xs font-bold text-slate-500 uppercase">Campus</span>
                <p className="font-bold text-slate-900 mt-0.5">
                  {detailModalReq.campusName || 'Attock Campus'}
                </p>
              </div>
              <div>
                <span className="text-3xs font-bold text-slate-500 uppercase">Department</span>
                <p className="font-bold text-slate-900 mt-0.5">{detailModalReq.departmentName}</p>
              </div>
              <div>
                <span className="text-3xs font-bold text-slate-500 uppercase">Assigned HOD</span>
                <p className="font-bold text-emerald-800 mt-0.5">
                  {detailModalReq.hodName || 'Department HOD'}
                </p>
              </div>
            </div>

            {/* Profile Data Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Personal & Academic Profile
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-3xs text-slate-400 block">Faculty Type</span>
                  <span className="font-bold text-slate-800">
                    {detailModalReq.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                  </span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">CNIC</span>
                  <span className="font-mono text-slate-800">
                    {detailModalReq.profileData?.cnic || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Phone</span>
                  <span className="text-slate-800">{detailModalReq.profileData?.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Date of Birth</span>
                  <span className="text-slate-800">{detailModalReq.profileData?.dob || '—'}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Blood Group</span>
                  <span className="text-slate-800">{detailModalReq.profileData?.bloodGroup || '—'}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Qualification</span>
                  <span className="text-slate-800">
                    {detailModalReq.profileData?.highestQualification || 'MS / M.Phil'}
                  </span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Session</span>
                  <span className="text-slate-800">
                    {detailModalReq.profileData?.academicSession || 'Spring 2026'}
                  </span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Batch</span>
                  <span className="text-slate-800">{detailModalReq.profileData?.batch || '2023-2027'}</span>
                </div>
              </div>
            </div>

            {/* Selected Courses Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Selected Teaching Courses & Load
                </h4>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Total: {detailModalReq.totalCredits || 0} /{' '}
                  {detailModalReq.creditLimit || (detailModalReq.teacherType === 'REGULAR_TEACHER' ? 22 : 12)}{' '}
                  Credits
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Course Code</th>
                      <th className="py-2.5 px-3">Course Title</th>
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3 text-right">Credits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(detailModalReq.selectedCourses || []).map((c: SelectedCourseItem, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{c.courseCode}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {c.courseTitle || c.courseName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{c.section || 'Section A'}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {c.credits || c.creditHours || 3} Cr
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setDetailModalReq(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>

              {(detailModalReq.status === 'PendingHODApproval' || detailModalReq.status === 'Pending') && (
                <>
                  <button
                    onClick={() => handleOpenRejectModal(detailModalReq)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Reject Application
                  </button>

                  <button
                    onClick={() => handleApprove(detailModalReq)}
                    disabled={actionLoadingId === detailModalReq.id}
                    className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {actionLoadingId === detailModalReq.id ? 'Approving...' : 'Approve & Enroll Faculty'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. REJECT WITH FEEDBACK MODAL */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-700 font-bold text-base">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Reject Registration Request</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are rejecting the registration for{' '}
              <strong className="text-slate-900">{rejectModalReq.teacherName}</strong> (
              {rejectModalReq.departmentName}). Please provide the reason or required revisions so the
              teacher can update their form:
            </p>

            <form onSubmit={handleSubmitReject} className="space-y-4">
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                rows={4}
                required
                placeholder="e.g. Please select courses within the 12 credit limit, or select only Computer Science department courses..."
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalReq(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoadingId === rejectModalReq.id}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {actionLoadingId === rejectModalReq.id ? 'Submitting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
