import React, { useState, useMemo, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { User, TeacherEnrollmentRequest, SelectedCourseItem } from '../../types';
import {
  CheckCircle2,
  Users,
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
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Layers,
  Award,
  ToggleLeft,
  ToggleRight,
  IdCard,
  Briefcase
} from 'lucide-react';

interface TeacherRegistrationProps {
  activeSubModule?: 'Registered Teachers' | 'Registration Records' | string;
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

export const TeacherRegistration: React.FC<TeacherRegistrationProps> = ({
  activeSubModule = 'Registered Teachers',
  onNavigate
}) => {
  const {
    teacherRequests,
    usersList,
    campuses,
    departments,
    hodAssignments,
    toggleUserStatus,
    refreshTeacherRequests
  } = useCFMS();

  // Active Tab
  const currentTab = useMemo(() => {
    if (activeSubModule === 'Registration Records') return 'Registration Records';
    return 'Registered Teachers';
  }, [activeSubModule]);

  // Loading & Feedback
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [campusFilter, setCampusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sessionFilter, setSessionFilter] = useState('ALL');

  // Dossier Modal
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Auto-dismiss alerts
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  // Always refresh latest data on mount
  useEffect(() => {
    refreshTeacherRequests();
  }, []);

  // Handle Manual Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTeacherRequests();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Combine and normalize registered teachers from both teacherRequests (Approved) and usersList (Approved)
  const registeredTeachers = useMemo(() => {
    const list: any[] = [];
    const seenTeacherIds = new Set<string>();

    // 1. Process Approved requests first
    (teacherRequests || [])
      .filter((r) => r.status === 'Approved')
      .forEach((r) => {
        seenTeacherIds.add(r.teacherId);
        const userObj = (usersList || []).find((u) => u.id === r.teacherId || (u.email && u.email.toLowerCase() === r.teacherEmail.toLowerCase()));
        list.push({
          id: r.id,
          teacherId: r.teacherId,
          name: r.teacherName,
          email: r.teacherEmail,
          phone: r.profileData?.phone || userObj?.phone || '—',
          cnic: r.profileData?.cnic || (userObj as any)?.cnic || '—',
          dob: r.profileData?.dob || (userObj as any)?.dob || '—',
          bloodGroup: r.profileData?.bloodGroup || (userObj as any)?.bloodGroup || '—',
          qualification: r.profileData?.highestQualification || (userObj as any)?.qualification || 'MS / M.Phil',
          specialization: r.profileData?.specialization || 'Computer Science',
          campus: r.campusName || userObj?.campus || 'Attock Campus',
          campusId: r.campusId || (userObj as any)?.campusId,
          department: r.departmentName,
          departmentId: r.departmentId,
          hod: r.reviewedBy || r.hodName || 'Department HOD',
          teacherType: r.teacherType,
          courses: r.selectedCourses || [],
          totalCredits: r.totalCredits || 0,
          creditLimit: r.creditLimit || (r.teacherType === 'REGULAR_TEACHER' ? 22 : 12),
          status: 'Registered',
          registeredDate: r.reviewedAt || r.submittedAt,
          approvedDate: r.reviewedAt || r.submittedAt,
          approvedBy: r.reviewedBy || r.hodName || 'Department HOD',
          accountStatus: userObj?.status || 'Active',
          session: r.profileData?.academicSession || 'Spring 2026',
          batch: r.profileData?.batch || '2023-2027',
          rawRequest: r,
          rawUser: userObj
        });
      });

    // 2. Process users marked Approved who might not have an in-memory request record
    (usersList || [])
      .filter((u) => (u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER') && u.enrollmentStatus === 'Approved')
      .forEach((u) => {
        if (!seenTeacherIds.has(u.id)) {
          seenTeacherIds.add(u.id);
          const dept = (departments || []).find((d) => d.id === u.departmentId);
          list.push({
            id: `reg-${u.id}`,
            teacherId: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || u.profileFormData?.phone || '—',
            cnic: u.profileFormData?.cnic || (u as any)?.cnic || '—',
            dob: u.profileFormData?.dob || '—',
            bloodGroup: u.profileFormData?.bloodGroup || '—',
            qualification: u.profileFormData?.highestQualification || (u as any)?.qualification || 'MS / M.Phil',
            specialization: u.profileFormData?.specialization || 'Computer Science',
            campus: u.campus || 'Attock Campus',
            campusId: u.profileFormData?.campusId,
            department: u.departmentName || dept?.name || 'Computer Science',
            departmentId: u.departmentId,
            hod: u.approvedBy || dept?.hodName || 'Department HOD',
            teacherType: u.role,
            courses: (u.courses as any) || [],
            totalCredits: u.totalCredits || 12,
            creditLimit: u.role === 'REGULAR_TEACHER' ? 22 : 12,
            status: 'Registered',
            registeredDate: u.approvedAt || u.createdAt,
            approvedDate: u.approvedAt || u.createdAt,
            approvedBy: u.approvedBy || dept?.hodName || 'Department HOD',
            accountStatus: u.status || 'Active',
            session: u.profileFormData?.academicSession || 'Spring 2026',
            batch: u.profileFormData?.batch || '2023-2027',
            rawUser: u
          });
        }
      });

    return list;
  }, [teacherRequests, usersList, departments]);

  // Unique Sessions for Filter
  const availableSessions = useMemo(() => {
    const set = new Set<string>();
    registeredTeachers.forEach((t) => {
      if (t.session) set.add(t.session);
    });
    return Array.from(set);
  }, [registeredTeachers]);

  // Filtered List
  const filteredTeachers = useMemo(() => {
    return registeredTeachers.filter((t) => {
      // Search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchEmail = t.email.toLowerCase().includes(q);
        const matchDept = t.department.toLowerCase().includes(q);
        const matchCampus = t.campus.toLowerCase().includes(q);
        const matchHOD = t.hod.toLowerCase().includes(q);
        const matchCourse = t.courses.some(
          (c: any) =>
            (c.courseCode && c.courseCode.toLowerCase().includes(q)) ||
            (c.courseTitle && c.courseTitle.toLowerCase().includes(q)) ||
            (c.courseName && c.courseName.toLowerCase().includes(q))
        );
        if (!matchName && !matchEmail && !matchDept && !matchCampus && !matchHOD && !matchCourse) {
          return false;
        }
      }

      // Campus
      if (campusFilter !== 'ALL' && t.campus.toLowerCase() !== campusFilter.toLowerCase()) {
        return false;
      }

      // Department
      if (deptFilter !== 'ALL' && t.departmentId !== deptFilter) {
        return false;
      }

      // Faculty Type
      if (typeFilter !== 'ALL' && t.teacherType !== typeFilter) {
        return false;
      }

      // Account Status
      if (statusFilter !== 'ALL' && t.accountStatus !== statusFilter) {
        return false;
      }

      // Session (for Registration Records tab)
      if (currentTab === 'Registration Records' && sessionFilter !== 'ALL' && t.session !== sessionFilter) {
        return false;
      }

      return true;
    });
  }, [registeredTeachers, search, campusFilter, deptFilter, typeFilter, statusFilter, sessionFilter, currentTab]);

  // KPI Calculations
  const totalRegisteredCount = registeredTeachers.length;
  const regularCount = registeredTeachers.filter((t) => t.teacherType === 'REGULAR_TEACHER').length;
  const visitingCount = registeredTeachers.filter((t) => t.teacherType === 'VISITING_TEACHER').length;
  const totalCreditsAllocated = registeredTeachers.reduce((sum, t) => sum + (Number(t.totalCredits) || 0), 0);
  const activeCampusesCount = new Set(registeredTeachers.map((t) => t.campus)).size || 1;

  // Toggle Account Active / Inactive Status
  const handleToggleStatus = async (teacher: any) => {
    if (!teacher.teacherId) return;
    setTogglingId(teacher.teacherId);
    try {
      const nextStatus = teacher.accountStatus === 'Active' ? 'Inactive' : 'Active';
      // Call toggleUserStatus from CFMSContext
      await toggleUserStatus(teacher.teacherId);
      setSuccessMsg(`Account status for ${teacher.name} updated to ${nextStatus}.`);
    } catch {
      setErrorMsg('Failed to update account status.');
    } finally {
      setTogglingId(null);
    }
  };

  // Export Official CSV
  const handleExportCSV = () => {
    const isRecords = currentTab === 'Registration Records';
    const headers = isRecords
      ? [
          'Registration ID',
          'Faculty Name',
          'Email',
          'Phone',
          'CNIC',
          'Faculty Role',
          'Campus',
          'Department',
          'Academic Session',
          'Batch',
          'Qualification',
          'Specialization',
          'Approved By HOD',
          'Approval Date',
          'Total Credits',
          'Account Status'
        ]
      : [
          'Faculty Name',
          'Email',
          'Phone',
          'Faculty Role',
          'Campus',
          'Department',
          'Assigned HOD',
          'Courses Assigned',
          'Total Credits',
          'Workload Limit',
          'Account Status',
          'Enrolled Date'
        ];

    const rows = filteredTeachers.map((t) =>
      isRecords
        ? [
            `"${t.id}"`,
            `"${t.name}"`,
            `"${t.email}"`,
            `"${t.phone}"`,
            `"${t.cnic}"`,
            `"${t.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}"`,
            `"${t.campus}"`,
            `"${t.department}"`,
            `"${t.session}"`,
            `"${t.batch}"`,
            `"${t.qualification}"`,
            `"${t.specialization}"`,
            `"${t.approvedBy}"`,
            `"${fmtDate(t.approvedDate)}"`,
            `"${t.totalCredits}"`,
            `"${t.accountStatus}"`
          ]
        : [
            `"${t.name}"`,
            `"${t.email}"`,
            `"${t.phone}"`,
            `"${t.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}"`,
            `"${t.campus}"`,
            `"${t.department}"`,
            `"${t.hod}"`,
            `"${t.courses.map((c: any) => `${c.courseCode} (${c.credits || c.creditHours}Cr)`).join('; ')}"`,
            `"${t.totalCredits}"`,
            `"${t.creditLimit}"`,
            `"${t.accountStatus}"`,
            `"${fmtDate(t.registeredDate)}"`
          ]
    );

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `UE_${isRecords ? 'Registration_Records' : 'Registered_Faculty'}_${new Date().toISOString().split('T')[0]}.csv`
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
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Teacher Registration
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Centralized registry of approved university faculty members, departmental scopes, and academic compliance records.
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
            title="Refresh records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{currentTab === 'Registration Records' ? 'Export Compliance CSV' : 'Export Faculty Register'}</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Module Tabs (Matching Sidebar Items exactly) */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => onNavigate && onNavigate('Registered Teachers')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
            currentTab === 'Registered Teachers'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-700" />
          <span>Registered Teachers</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            {totalRegisteredCount}
          </span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('Registration Records')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
            currentTab === 'Registration Records'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-700" />
          <span>Registration Records</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
            {totalRegisteredCount} Records
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{totalRegisteredCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-800">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{regularCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Regular Faculty</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 text-purple-800">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{visitingCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Visiting Faculty</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{activeCampusesCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Campuses Covered</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{totalCreditsAllocated} Cr</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Teaching Credits</p>
          </div>
        </div>
      </div>

      {/* 5. Filter & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search faculty, email, course..."
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

          {/* Dynamic Filter (Session for Records, Account Status for Registered) */}
          {currentTab === 'Registration Records' ? (
            <div>
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white cursor-pointer"
              >
                <option value="ALL">All Academic Sessions</option>
                {availableSessions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white cursor-pointer"
              >
                <option value="ALL">All Account Statuses</option>
                <option value="Active">Active Accounts</option>
                <option value="Inactive">Inactive Accounts</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 6. MAIN CONTENT AREA */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No registered teachers found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || campusFilter !== 'ALL' || deptFilter !== 'ALL' || typeFilter !== 'ALL'
              ? 'No faculty members match your selected search or filter criteria.'
              : 'Approved faculty members will appear here once their registration requests are approved by their department HOD.'}
          </p>
          {(search || campusFilter !== 'ALL' || deptFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setCampusFilter('ALL');
                setDeptFilter('ALL');
                setTypeFilter('ALL');
                setStatusFilter('ALL');
                setSessionFilter('ALL');
              }}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : currentTab === 'Registered Teachers' ? (
        /* SUB-MODULE 1: REGISTERED TEACHERS TABLE & WORKLOAD VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Showing {filteredTeachers.length} of {totalRegisteredCount} Enrolled Teachers
            </span>
            <span className="text-3xs font-medium text-slate-500">
              Approved by departmental HODs across all University Campuses
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-3xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Role & Campus</th>
                  <th className="py-3 px-4">Department & HOD</th>
                  <th className="py-3 px-4">Allocated Courses</th>
                  <th className="py-3 px-4">Teaching Workload</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTeachers.map((teacher) => {
                  const isRegular = teacher.teacherType === 'REGULAR_TEACHER';
                  const percentLoad = Math.min(
                    100,
                    Math.round(((teacher.totalCredits || 0) / teacher.creditLimit) * 100)
                  );
                  const isNearLimit = percentLoad >= 80;
                  const isFull = percentLoad >= 100;

                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Faculty Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {teacher.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{teacher.name}</p>
                            <p className="text-3xs text-slate-500 font-mono mt-0.5">{teacher.email}</p>
                            {teacher.phone && teacher.phone !== '—' && (
                              <p className="text-3xs text-slate-400 mt-0.5 flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5" />
                                <span>{teacher.phone}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role & Campus */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-bold border ${
                              isRegular
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            {isRegular ? 'Regular Faculty' : 'Visiting Faculty'}
                          </span>
                          <p className="text-3xs text-slate-500 font-medium flex items-center gap-1">
                            <Building2 className="w-2.5 h-2.5 text-slate-400" />
                            {teacher.campus}
                          </p>
                        </div>
                      </td>

                      {/* Department & HOD */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 block text-xs">
                            {teacher.department}
                          </span>
                          <span className="text-3xs text-slate-500 flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-700" />
                            HOD: {teacher.hod}
                          </span>
                        </div>
                      </td>

                      {/* Allocated Courses */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {(teacher.courses || []).slice(0, 3).map((c: SelectedCourseItem, idx: number) => (
                              <span
                                key={idx}
                                className="text-4xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-mono"
                                title={c.courseTitle || c.courseName}
                              >
                                {c.courseCode} ({c.credits || c.creditHours}Cr)
                              </span>
                            ))}
                            {(teacher.courses || []).length > 3 && (
                              <span className="text-4xs bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                                +{(teacher.courses || []).length - 3} more
                              </span>
                            )}
                          </div>
                          <span className="text-3xs text-slate-400 block">
                            {(teacher.courses || []).length} assigned course
                            {(teacher.courses || []).length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </td>

                      {/* Teaching Workload Progress */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1.5 w-36">
                          <div className="flex items-center justify-between text-3xs font-bold">
                            <span className="text-slate-800">{teacher.totalCredits} Credits</span>
                            <span className="text-slate-400">/ {teacher.creditLimit} Cr</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${
                                isFull ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-600'
                              }`}
                              style={{ width: `${percentLoad}%` }}
                            />
                          </div>
                          <span className="text-4xs text-slate-400 block text-right font-medium">
                            {percentLoad}% capacity
                          </span>
                        </div>
                      </td>

                      {/* Account Status Switch */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(teacher)}
                          disabled={togglingId === teacher.teacherId}
                          className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
                          title="Click to toggle account Active/Inactive status"
                        >
                          {teacher.accountStatus === 'Active' ? (
                            <>
                              <ToggleRight className="w-6 h-6 text-emerald-600" />
                              <span className="text-emerald-700 text-3xs font-bold">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-6 h-6 text-slate-400" />
                              <span className="text-slate-500 text-3xs font-bold">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRecord(teacher)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-xl text-3xs font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* SUB-MODULE 2: REGISTRATION RECORDS & COMPLIANCE ARCHIVE */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Faculty Registration Compliance Archive ({filteredTeachers.length} Official Records)
            </span>
            <span className="text-3xs font-medium text-slate-500">
              Audit trail of approved academic appointments, sessions, and credentials
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-3xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Ref / Faculty Name</th>
                  <th className="py-3 px-4">CNIC & Contact</th>
                  <th className="py-3 px-4">Academic Session & Batch</th>
                  <th className="py-3 px-4">Campus & Dept</th>
                  <th className="py-3 px-4">Approved By HOD</th>
                  <th className="py-3 px-4">Approval Date</th>
                  <th className="py-3 px-4 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTeachers.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Ref & Faculty Name */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="text-4xs font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {rec.id}
                        </span>
                        <p className="font-bold text-slate-900 mt-1">{rec.name}</p>
                        <span className="text-3xs text-slate-400 font-mono">{rec.email}</span>
                      </div>
                    </td>

                    {/* CNIC & Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono text-slate-800 font-medium text-3xs block">
                          CNIC: {rec.cnic || '—'}
                        </span>
                        <span className="text-slate-500 text-3xs block">Ph: {rec.phone}</span>
                        <span className="text-4xs text-slate-400 block">{rec.qualification}</span>
                      </div>
                    </td>

                    {/* Academic Session & Batch */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 text-xs block">
                          {rec.session || 'Spring 2026'}
                        </span>
                        <span className="text-3xs text-slate-500 block">
                          Batch: {rec.batch || '2023-2027'}
                        </span>
                        <span
                          className={`inline-block text-4xs font-bold px-1.5 py-0.2 rounded border ${
                            rec.teacherType === 'REGULAR_TEACHER'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {rec.teacherType === 'REGULAR_TEACHER' ? 'Regular' : 'Visiting'}
                        </span>
                      </div>
                    </td>

                    {/* Campus & Dept */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-800 text-xs block">
                          {rec.department}
                        </span>
                        <span className="text-3xs text-slate-500 block">{rec.campus}</span>
                      </div>
                    </td>

                    {/* Approved By HOD */}
                    <td className="py-3.5 px-4">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 space-y-0.5 max-w-[190px]">
                        <div className="flex items-center gap-1 text-3xs font-bold text-slate-700">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          <span className="truncate">{rec.approvedBy}</span>
                        </div>
                        <span className="text-4xs text-slate-400 block truncate">
                          Scope: {rec.department}
                        </span>
                      </div>
                    </td>

                    {/* Approval Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs text-slate-700 font-medium block">
                        {fmtDate(rec.approvedDate)}
                      </span>
                      <span className="text-3xs text-emerald-700 font-bold mt-0.5 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified Enrolled
                      </span>
                    </td>

                    {/* Dossier Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-xl text-3xs font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <IdCard className="w-3.5 h-3.5" />
                        <span>Full Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. FULL FACULTY PROFILE & DOSSIER MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center">
                  {selectedRecord.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">{selectedRecord.name}</h3>
                    <span
                      className={`text-3xs font-bold px-2 py-0.5 rounded-full border ${
                        selectedRecord.teacherType === 'REGULAR_TEACHER'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {selectedRecord.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedRecord.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Institutional Affiliation & Scope Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-3xs font-bold text-slate-500 uppercase">Campus</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedRecord.campus}</p>
              </div>
              <div>
                <span className="text-3xs font-bold text-slate-500 uppercase">Department</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedRecord.department}</p>
              </div>
              <div>
                <span className="text-3xs font-bold text-slate-500 uppercase">Assigned HOD</span>
                <p className="font-bold text-emerald-800 mt-0.5">{selectedRecord.hod}</p>
              </div>
            </div>

            {/* Academic & Profile Details */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Academic & Personal Information
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-3xs text-slate-400 block">CNIC</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedRecord.cnic || '—'}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Phone</span>
                  <span className="text-slate-800">{selectedRecord.phone}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Highest Qualification</span>
                  <span className="text-slate-800">{selectedRecord.qualification}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Specialization</span>
                  <span className="text-slate-800">{selectedRecord.specialization || '—'}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Academic Session</span>
                  <span className="text-slate-800 font-bold">{selectedRecord.session}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Batch</span>
                  <span className="text-slate-800">{selectedRecord.batch}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Approval Date</span>
                  <span className="text-slate-800">{fmtDate(selectedRecord.approvedDate)}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Approved Authority</span>
                  <span className="text-emerald-800 font-semibold">{selectedRecord.approvedBy}</span>
                </div>
              </div>
            </div>

            {/* Allocated Courses Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Approved Teaching Allotments
                </h4>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Total Workload: {selectedRecord.totalCredits} / {selectedRecord.creditLimit} Credit Hours
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
                    {(selectedRecord.courses || []).map((c: SelectedCourseItem, idx: number) => (
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

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
