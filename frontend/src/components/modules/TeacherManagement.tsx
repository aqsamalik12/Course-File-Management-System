import React, { useState, useMemo, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { SelectedCourseItem, User } from '../../types';
import { TeacherAssignmentsModule } from './TeacherAssignmentsModule';
import {
  GraduationCap,
  Users,
  Briefcase,
  BookOpen,
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
  Calendar,
  AlertCircle,
  RefreshCw,
  X,
  FileText,
  ShieldCheck,
  Sparkles,
  Layers,
  Award,
  ToggleLeft,
  ToggleRight,
  IdCard,
  CheckCircle2,
  BookMarked,
  MapPin,
  Clock,
  Copy,
  Check,
  LayoutGrid,
  List
} from 'lucide-react';

interface TeacherManagementProps {
  activeSubModule?: 'All Teachers' | 'Regular Faculty' | 'Visiting Faculty' | 'Teacher Directory' | string;
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

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  activeSubModule = 'All Teachers',
  onNavigate
}) => {
  const {
    teacherRequests,
    usersList,
    campuses,
    departments,
    hodAssignments,
    teacherAssignments,
    toggleUserStatus,
    refreshTeacherRequests
  } = useCFMS();

  const [localTab, setLocalTab] = useState<string | null>(null);

  // Active Sub-Module Tab
  const currentTab = useMemo(() => {
    if (localTab) return localTab;
    if (activeSubModule === 'Teacher Assignments' || activeSubModule === 'Assignments') return 'Teacher Assignments';
    if (activeSubModule === 'Regular Faculty') return 'Regular Faculty';
    if (activeSubModule === 'Visiting Faculty') return 'Visiting Faculty';
    if (activeSubModule === 'Teacher Directory') return 'Teacher Directory';
    return 'All Teachers';
  }, [activeSubModule, localTab]);

  // Loading & Feedback
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [campusFilter, setCampusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dossier Modal
  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);

  // Always refresh on mount
  useEffect(() => {
    refreshTeacherRequests();
  }, []);

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

  // Manual Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTeacherRequests();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Normalize all registered faculty members with ALL profile form fields
  const allFaculty = useMemo(() => {
    const list: any[] = [];
    const seenTeacherIds = new Set<string>();

    // 1. Process Approved requests
    (teacherRequests || [])
      .filter((r) => r.status === 'Approved')
      .forEach((r) => {
        seenTeacherIds.add(r.teacherId);
        const userObj = (usersList || []).find(
          (u) => u.id === r.teacherId || (u.email && u.email.toLowerCase() === r.teacherEmail.toLowerCase())
        );

        list.push({
          id: r.id,
          teacherId: r.teacherId,
          name: r.teacherName,
          email: r.teacherEmail,
          phone: r.profileData?.phone || userObj?.phone || '—',
          cnic: r.profileData?.cnic || (userObj as any)?.cnic || '—',
          dob: r.profileData?.dob || (userObj as any)?.dob || '—',
          gender: r.profileData?.gender || (userObj as any)?.gender || 'Male',
          bloodGroup: r.profileData?.bloodGroup || (userObj as any)?.bloodGroup || 'B+',
          qualification: r.profileData?.highestQualification || (userObj as any)?.qualification || 'MS / M.Phil',
          specialization: r.profileData?.specialization || 'Computer Science',
          campus: r.campusName || userObj?.campus || 'Attock Campus',
          campusId: r.campusId || (userObj as any)?.campusId,
          department: r.departmentName,
          departmentId: r.departmentId,
          hod: r.reviewedBy || r.hodName || 'Department HOD',
          hodEmail: r.profileData?.hodEmail || 'hod@ue.edu.pk',
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

    // 2. Process users marked Approved in usersList who might not have an in-memory request record
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
            gender: u.profileFormData?.gender || 'Male',
            bloodGroup: u.profileFormData?.bloodGroup || '—',
            qualification: u.profileFormData?.highestQualification || (u as any)?.qualification || 'MS / M.Phil',
            specialization: u.profileFormData?.specialization || 'Computer Science',
            campus: u.campus || 'Attock Campus',
            campusId: u.profileFormData?.campusId,
            department: u.departmentName || dept?.name || 'Computer Science',
            departmentId: u.departmentId,
            hod: u.approvedBy || dept?.hodName || 'Department HOD',
            hodEmail: 'hod@ue.edu.pk',
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

  // Filtered by current tab & search/dropdowns
  const filteredFaculty = useMemo(() => {
    return allFaculty.filter((t) => {
      // Tab filter
      if (currentTab === 'Regular Faculty' && t.teacherType !== 'REGULAR_TEACHER') {
        return false;
      }
      if (currentTab === 'Visiting Faculty' && t.teacherType !== 'VISITING_TEACHER') {
        return false;
      }

      // Campus filter
      if (campusFilter !== 'ALL' && t.campus.toLowerCase() !== campusFilter.toLowerCase()) {
        return false;
      }

      // Department filter
      if (deptFilter !== 'ALL' && t.departmentId !== deptFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && t.accountStatus !== statusFilter) {
        return false;
      }

      // Search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchEmail = t.email.toLowerCase().includes(q);
        const matchDept = t.department.toLowerCase().includes(q);
        const matchCampus = t.campus.toLowerCase().includes(q);
        const matchHOD = t.hod.toLowerCase().includes(q);
        const matchCnic = t.cnic.toLowerCase().includes(q);
        const matchSpec = t.specialization.toLowerCase().includes(q);
        const matchCourse = t.courses.some(
          (c: any) =>
            (c.courseCode && c.courseCode.toLowerCase().includes(q)) ||
            (c.courseTitle && c.courseTitle.toLowerCase().includes(q)) ||
            (c.courseName && c.courseName.toLowerCase().includes(q))
        );
        if (!matchName && !matchEmail && !matchDept && !matchCampus && !matchHOD && !matchCnic && !matchSpec && !matchCourse) {
          return false;
        }
      }

      return true;
    });
  }, [allFaculty, currentTab, campusFilter, deptFilter, statusFilter, search]);

  // KPI Calculations
  const totalCount = allFaculty.length;
  const regularCount = allFaculty.filter((t) => t.teacherType === 'REGULAR_TEACHER').length;
  const visitingCount = allFaculty.filter((t) => t.teacherType === 'VISITING_TEACHER').length;
  const totalCredits = allFaculty.reduce((sum, t) => sum + (Number(t.totalCredits) || 0), 0);
  const activeCount = allFaculty.filter((t) => t.accountStatus === 'Active').length;

  // Toggle Account Active / Inactive Status
  const handleToggleStatus = async (teacher: any) => {
    if (!teacher.teacherId) return;
    setTogglingId(teacher.teacherId);
    try {
      const nextStatus = teacher.accountStatus === 'Active' ? 'Inactive' : 'Active';
      await toggleUserStatus(teacher.teacherId);
      setSuccessMsg(`Account status for ${teacher.name} updated to ${nextStatus}.`);
    } catch {
      setErrorMsg('Failed to update account status.');
    } finally {
      setTogglingId(null);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Faculty Name',
      'Email',
      'Phone',
      'CNIC',
      'Faculty Role',
      'Campus',
      'Department',
      'Assigned HOD',
      'Academic Session',
      'Batch',
      'Qualification',
      'Specialization',
      'Courses Assigned',
      'Total Credits',
      'Workload Limit',
      'Account Status',
      'Approval Date'
    ];

    const rows = filteredFaculty.map((t) => [
      `"${t.name}"`,
      `"${t.email}"`,
      `"${t.phone}"`,
      `"${t.cnic}"`,
      `"${t.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}"`,
      `"${t.campus}"`,
      `"${t.department}"`,
      `"${t.hod}"`,
      `"${t.session}"`,
      `"${t.batch}"`,
      `"${t.qualification}"`,
      `"${t.specialization}"`,
      `"${t.courses.map((c: any) => `${c.courseCode} (${c.credits || c.creditHours}Cr)`).join('; ')}"`,
      `"${t.totalCredits}"`,
      `"${t.creditLimit}"`,
      `"${t.accountStatus}"`,
      `"${fmtDate(t.approvedDate)}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `UE_Faculty_${currentTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[80vh] w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Teacher Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Comprehensive faculty governance: view profiles, institutional assignments, course workloads, and registration dossiers.
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
            title="Refresh faculty roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Module Navigation Tabs (Matching Sidebar Items exactly) */}
      <div className="flex border-b border-slate-200 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => onNavigate && onNavigate('All Teachers')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            currentTab === 'All Teachers'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-700" />
          <span>All Teachers</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600">
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('Regular Faculty')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            currentTab === 'Regular Faculty'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Briefcase className="w-4 h-4 text-blue-600" />
          <span>Regular Faculty</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-900 border border-blue-200">
            {regularCount}
          </span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('Visiting Faculty')}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            currentTab === 'Visiting Faculty'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-purple-600" />
          <span>Visiting Faculty</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-900 border border-purple-200">
            {visitingCount}
          </span>
        </button>

        <button
          onClick={() => {
            setLocalTab('Teacher Directory');
            onNavigate && onNavigate('Teacher Directory');
          }}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            currentTab === 'Teacher Directory'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-emerald-700" />
          <span>Teacher Directory</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-900">
            Grid View
          </span>
        </button>

        <button
          onClick={() => {
            setLocalTab('Teacher Assignments');
            onNavigate && onNavigate('Teacher Assignments');
          }}
          className={`flex items-center gap-2 py-3 px-5 text-sm font-semibold border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
            currentTab === 'Teacher Assignments'
              ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Teacher Assignments</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            {teacherAssignments?.length || 0}
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

      {currentTab === 'Teacher Assignments' ? (
        <TeacherAssignmentsModule />
      ) : (
        <>
          {/* 4. KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{totalCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Total Faculty</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-800">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{regularCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Regular (Max 22 Cr)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 text-purple-800">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{visitingCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Visiting (Max 12 Cr)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{totalCredits} Cr</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Total Teaching Credits</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900">{activeCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Active Faculty Accounts</p>
          </div>
        </div>
      </div>

      {/* 5. Filter & Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by teacher, email, CNIC, specialization..."
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

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white cursor-pointer"
            >
              <option value="ALL">All Account Statuses</option>
              <option value="Active">Active Accounts Only</option>
              <option value="Inactive">Inactive Accounts Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. MAIN CONTENT AREA */}
      {filteredFaculty.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No faculty members found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || campusFilter !== 'ALL' || deptFilter !== 'ALL'
              ? 'No teachers match your search or filter parameters.'
              : 'Registered and approved teachers will appear here automatically.'}
          </p>
          {(search || campusFilter !== 'ALL' || deptFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setCampusFilter('ALL');
                setDeptFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : currentTab === 'Teacher Directory' ? (
        /* SUB-MODULE 4: TEACHER DIRECTORY (GRID CARDS PHONEBOOK VIEW) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFaculty.map((teacher) => {
            const isRegular = teacher.teacherType === 'REGULAR_TEACHER';
            const percentLoad = Math.min(
              100,
              Math.round(((teacher.totalCredits || 0) / teacher.creditLimit) * 100)
            );

            return (
              <div
                key={teacher.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top card banner */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-base flex items-center justify-center shadow-inner shrink-0">
                        {teacher.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">{teacher.name}</h3>
                        <p className="text-3xs text-slate-500 font-mono mt-0.5">{teacher.email}</p>
                      </div>
                    </div>

                    <span
                      className={`text-4xs font-bold px-2 py-0.5 rounded-full border ${
                        isRegular
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {isRegular ? 'Regular Faculty' : 'Visiting Faculty'}
                    </span>
                  </div>

                  {/* Institutional Scope Info */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-3xs">
                      <span className="text-slate-400 font-medium">Campus:</span>
                      <span className="font-bold text-slate-800">{teacher.campus}</span>
                    </div>
                    <div className="flex items-center justify-between text-3xs">
                      <span className="text-slate-400 font-medium">Department:</span>
                      <span className="font-bold text-slate-800">{teacher.department}</span>
                    </div>
                    <div className="flex items-center justify-between text-3xs">
                      <span className="text-slate-400 font-medium">Assigned HOD:</span>
                      <span className="font-bold text-emerald-800">{teacher.hod}</span>
                    </div>
                    <div className="flex items-center justify-between text-3xs pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400 font-medium">CNIC:</span>
                      <span className="font-mono text-slate-800 font-semibold">{teacher.cnic || '—'}</span>
                    </div>
                  </div>

                  {/* Specialization Tags */}
                  <div>
                    <span className="text-4xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Qualification & Focus:
                    </span>
                    <p className="text-3xs font-semibold text-slate-700 line-clamp-1">
                      {teacher.qualification} • {teacher.specialization}
                    </p>
                  </div>

                  {/* Course Allocations & Workload Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-3xs font-bold">
                      <span className="text-slate-700">
                        {teacher.courses.length} Courses Assigned
                      </span>
                      <span className="text-emerald-800">
                        {teacher.totalCredits} / {teacher.creditLimit} Credits
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${percentLoad}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        teacher.accountStatus === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                    <span className="text-3xs font-bold text-slate-600">
                      {teacher.accountStatus === 'Active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedFaculty(teacher)}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-3xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <IdCard className="w-3.5 h-3.5" />
                    <span>View Full Dossier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* SUB-MODULE 1, 2, 3: MASTER ROSTER TABLE (All Teachers, Regular Faculty, Visiting Faculty) */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Showing {filteredFaculty.length} of {totalCount} Faculty Members
            </span>
            <span className="text-3xs font-medium text-slate-500">
              Every detail recorded during faculty registration form submission
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-3xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">CNIC & Contact</th>
                  <th className="py-3 px-4">Campus & Dept</th>
                  <th className="py-3 px-4">Assigned HOD</th>
                  <th className="py-3 px-4">Courses & Workload</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredFaculty.map((teacher) => {
                  const isRegular = teacher.teacherType === 'REGULAR_TEACHER';
                  const percentLoad = Math.min(
                    100,
                    Math.round(((teacher.totalCredits || 0) / teacher.creditLimit) * 100)
                  );
                  const isNearLimit = percentLoad >= 80;
                  const isFull = percentLoad >= 100;

                  return (
                    <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Faculty Member Name & Role */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0 shadow-inner">
                            {teacher.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{teacher.name}</p>
                            <span
                              className={`inline-block mt-0.5 text-4xs font-bold px-2 py-0.2 rounded-full border ${
                                isRegular
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-purple-50 text-purple-700 border-purple-200'
                              }`}
                            >
                              {isRegular ? 'Regular Faculty' : 'Visiting Faculty'}
                            </span>
                            <p className="text-3xs text-slate-400 font-mono mt-0.5">{teacher.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* CNIC & Phone */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="font-mono text-slate-800 font-semibold text-3xs block">
                            CNIC: {teacher.cnic || '—'}
                          </span>
                          <span className="text-slate-500 text-3xs flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            {teacher.phone}
                          </span>
                          <span className="text-4xs text-slate-400 block truncate max-w-[160px]">
                            {teacher.qualification}
                          </span>
                        </div>
                      </td>

                      {/* Campus & Department */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-800 text-xs block">
                            {teacher.department}
                          </span>
                          <span className="text-3xs text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            {teacher.campus}
                          </span>
                        </div>
                      </td>

                      {/* Assigned HOD */}
                      <td className="py-3.5 px-4">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/80 space-y-0.5 max-w-[190px]">
                          <div className="flex items-center gap-1 text-3xs font-bold text-slate-700">
                            <UserCheck className="w-3 h-3 text-emerald-700 shrink-0" />
                            <span className="truncate">{teacher.hod}</span>
                          </div>
                          <span className="text-4xs text-slate-400 block truncate">
                            Department Head
                          </span>
                        </div>
                      </td>

                      {/* Courses & Workload Bar */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1 w-36">
                          <div className="flex items-center justify-between text-3xs font-bold">
                            <span className="text-slate-900">{teacher.totalCredits} Credits</span>
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
                          <span className="text-4xs text-slate-400 block text-right">
                            {teacher.courses.length} course{teacher.courses.length === 1 ? '' : 's'} assigned
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

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedFaculty(teacher)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-xl text-3xs font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Full Dossier</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )}

      {/* 7. COMPREHENSIVE FACULTY DOSSIER MODAL (SHOWING EVERY SINGLE ENTERED DATA POINT) */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center shadow-inner shrink-0">
                  {selectedFaculty.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-slate-900">{selectedFaculty.name}</h3>
                    <span
                      className={`text-3xs font-bold px-2 py-0.5 rounded-full border ${
                        selectedFaculty.teacherType === 'REGULAR_TEACHER'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {selectedFaculty.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                    </span>
                    <span className="text-3xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Account: {selectedFaculty.accountStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                    <span>{selectedFaculty.email}</span>
                    <button
                      onClick={() => handleCopy(selectedFaculty.email)}
                      className="text-slate-400 hover:text-emerald-700"
                      title="Copy Email"
                    >
                      {copiedText === selectedFaculty.email ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedFaculty(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Institutional & Departmental Scope */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-700" />
                <span>1. Institutional & Governance Scope</span>
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-3xs font-bold text-slate-500 uppercase">Campus</span>
                  <p className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {selectedFaculty.campus}
                  </p>
                </div>
                <div>
                  <span className="text-3xs font-bold text-slate-500 uppercase">Academic Department</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedFaculty.department}</p>
                </div>
                <div>
                  <span className="text-3xs font-bold text-slate-500 uppercase">Supervising HOD</span>
                  <p className="font-bold text-emerald-800 mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    {selectedFaculty.hod}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Personal Profile Data from Form */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <IdCard className="w-3.5 h-3.5 text-emerald-700" />
                <span>2. Personal & Identity Records (Registration Form)</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-3xs text-slate-400 block font-medium">CNIC Number</span>
                  <span className="font-mono text-slate-900 font-bold">{selectedFaculty.cnic || '—'}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block font-medium">Phone Number</span>
                  <span className="text-slate-800 font-semibold">{selectedFaculty.phone}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block font-medium">Date of Birth</span>
                  <span className="text-slate-800">{selectedFaculty.dob || '—'}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block font-medium">Blood Group</span>
                  <span className="text-slate-800 font-bold text-rose-700">{selectedFaculty.bloodGroup || '—'}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block font-medium">Academic Session</span>
                  <span className="text-slate-900 font-bold">{selectedFaculty.session}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block font-medium">Batch Assigned</span>
                  <span className="text-slate-800 font-medium">{selectedFaculty.batch}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block font-medium">Approval Date</span>
                  <span className="text-slate-800">{fmtDate(selectedFaculty.approvedDate)}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block font-medium">Approved By</span>
                  <span className="text-emerald-800 font-bold">{selectedFaculty.approvedBy}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Academic Qualifications & Specialization */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. Academic Qualifications & Specialization</span>
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="text-slate-500 font-medium">Highest Degree:</span>
                  <span className="font-bold text-slate-900">{selectedFaculty.qualification}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block mb-1">Specialized Research & Subject Areas:</span>
                  <p className="font-semibold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                    {selectedFaculty.specialization || 'General Subject Specialization'}
                  </p>
                </div>
              </div>
            </div>

            {/* Section 4: Course Allotment Matrix & Workload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>4. Approved Course Allocations & Workload</span>
                </h4>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Load: {selectedFaculty.totalCredits} / {selectedFaculty.creditLimit} Credit Hours
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Course Code</th>
                      <th className="py-2.5 px-3">Course Title</th>
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3 text-right">Credit Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedFaculty.courses || []).map((c: SelectedCourseItem, idx: number) => (
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

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => handleToggleStatus(selectedFaculty)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Toggle Status ({selectedFaculty.accountStatus === 'Active' ? 'Deactivate' : 'Activate'})
              </button>

              <button
                onClick={() => setSelectedFaculty(null)}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md"
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
