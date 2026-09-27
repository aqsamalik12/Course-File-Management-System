import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCFMS } from '../../context/CFMSContext';
import { User, TeacherEnrollmentRequest, SelectedCourseItem } from '../../types';
import {
  Users, CheckCircle2, Clock, Building2, Calendar, ChevronDown,
  ChevronUp, Search, Filter, Download, Mail, Phone,
  GraduationCap, ClipboardList, AlertTriangle, UserCheck,
  LogIn, BookMarked, Activity, FileText, ShieldCheck,
  Eye, Check, X, CreditCard, Sparkles, BookOpen, Layers,
  ExternalLink, XCircle
} from 'lucide-react';

// Date formatter
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

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const isRegular = role === 'REGULAR_TEACHER';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-3xs font-bold rounded-full border ${
        isRegular
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-purple-50 text-purple-700 border-purple-200'
      }`}
    >
      {isRegular ? 'Regular Faculty' : 'Visiting Faculty'}
    </span>
  );
};

interface TeacherRegistrationsModuleProps {
  activeModule?: string;
}

export const TeacherRegistrationsModule: React.FC<TeacherRegistrationsModuleProps> = ({ activeModule }) => {
  const { users, loginLogs } = useAuth();
  const { teacherRequests, campuses, departments, usersList } = useCFMS();

  const [activeTab, setActiveTab] = useState<'registrations' | 'requests' | 'login'>('registrations');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<string>('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [viewingRecord, setViewingRecord] = useState<any | null>(null);

  useEffect(() => {
    if (activeModule === 'Teacher Registration Requests' || activeModule === 'Pending Requests' || activeModule === 'All Requests' || activeModule === 'Rejected Requests') {
      setActiveTab('requests');
      if (activeModule === 'Pending Requests') setSelectedStatusFilter('PendingHODApproval');
      else if (activeModule === 'Rejected Requests') setSelectedStatusFilter('Rejected');
      else setSelectedStatusFilter('ALL');
    } else if (activeModule === 'Teacher Registration' || activeModule === 'Registered Teachers' || activeModule === 'Registration Records' || activeModule === 'Teacher Registrations') {
      setActiveTab('registrations');
    } else if (activeModule === 'Search / Advanced Filters') {
      setActiveTab('registrations');
    }
  }, [activeModule]);

  // Combine and normalize registered teachers
  // An approved teacher can come from approved teacherRequests or users with approved status
  const registeredTeachers = useMemo(() => {
    const list: any[] = [];
    const seenTeacherIds = new Set<string>();

    // 1. Process Approved requests first
    (teacherRequests || [])
      .filter((r) => r.status === 'Approved')
      .forEach((r) => {
        seenTeacherIds.add(r.teacherId);
        const userObj = (usersList || users || []).find((u) => u.id === r.teacherId);
        list.push({
          id: r.id,
          teacherId: r.teacherId,
          name: r.teacherName,
          email: r.teacherEmail,
          phone: r.profileData?.phone || userObj?.phone || '—',
          cnic: r.profileData?.cnic || '—',
          dob: r.profileData?.dob || '—',
          bloodGroup: r.profileData?.bloodGroup || '—',
          qualification: r.profileData?.highestQualification || 'MS / M.Phil',
          specialization: r.profileData?.specialization || 'Computer Science',
          campus: r.campusName || userObj?.campus || 'Attock Campus',
          campusId: r.campusId,
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
    (usersList || users || [])
      .filter((u) => (u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER') && u.enrollmentStatus === 'Approved')
      .forEach((u) => {
        if (!seenTeacherIds.has(u.id)) {
          seenTeacherIds.add(u.id);
          const dept = departments.find((d) => d.id === u.departmentId);
          list.push({
            id: `reg-${u.id}`,
            teacherId: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || u.profileFormData?.phone || '—',
            cnic: u.profileFormData?.cnic || '—',
            dob: u.profileFormData?.dob || '—',
            bloodGroup: u.profileFormData?.bloodGroup || '—',
            qualification: u.profileFormData?.highestQualification || 'MS / M.Phil',
            specialization: u.profileFormData?.specialization || 'Computer Science',
            campus: u.campus || 'Attock Campus',
            campusId: u.profileFormData?.campusId,
            department: u.departmentName || dept?.name || 'Computer Science',
            departmentId: u.departmentId,
            hod: u.approvedBy || dept?.hodName || 'Dr. Muhammad Asif',
            teacherType: u.role,
            courses: (u.courses as any) || [],
            totalCredits: u.totalCredits || 12,
            creditLimit: u.role === 'REGULAR_TEACHER' ? 22 : 12,
            status: 'Registered',
            registeredDate: u.approvedAt || u.createdAt,
            approvedDate: u.approvedAt || u.createdAt,
            approvedBy: u.approvedBy || dept?.hodName || 'Dr. Muhammad Asif',
            accountStatus: u.status || 'Active',
            session: u.profileFormData?.academicSession || 'Spring 2026',
            batch: u.profileFormData?.batch || '2023-2027',
            rawUser: u
          });
        }
      });

    return list;
  }, [teacherRequests, usersList, users, departments]);

  // Filtered Registered Teachers
  const filteredRegisteredTeachers = useMemo(() => {
    return registeredTeachers.filter((t) => {
      // Search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = t.name.toLowerCase().includes(q);
        const matchEmail = t.email.toLowerCase().includes(q);
        const matchDept = t.department.toLowerCase().includes(q);
        const matchCampus = t.campus.toLowerCase().includes(q);
        const matchCourse = t.courses.some(
          (c: any) =>
            (c.courseCode && c.courseCode.toLowerCase().includes(q)) ||
            (c.courseTitle && c.courseTitle.toLowerCase().includes(q)) ||
            (c.courseName && c.courseName.toLowerCase().includes(q))
        );
        if (!matchName && !matchEmail && !matchDept && !matchCampus && !matchCourse) return false;
      }

      // Campus
      if (selectedCampusFilter !== 'ALL' && t.campus.toLowerCase() !== selectedCampusFilter.toLowerCase()) {
        return false;
      }

      // Department
      if (selectedDeptFilter !== 'ALL' && t.departmentId !== selectedDeptFilter && !t.department.toLowerCase().includes(selectedDeptFilter.toLowerCase())) {
        return false;
      }

      // Teacher Type
      if (selectedTypeFilter !== 'ALL' && t.teacherType !== selectedTypeFilter) {
        return false;
      }

      return true;
    });
  }, [registeredTeachers, search, selectedCampusFilter, selectedDeptFilter, selectedTypeFilter]);

  // Filtered Requests (All statuses across all campuses)
  const filteredAllRequests = useMemo(() => {
    return (teacherRequests || []).filter((r) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = r.teacherName.toLowerCase().includes(q);
        const matchEmail = r.teacherEmail.toLowerCase().includes(q);
        const matchDept = r.departmentName.toLowerCase().includes(q);
        const matchCampus = (r.campusName || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchDept && !matchCampus) return false;
      }

      if (selectedCampusFilter !== 'ALL' && (r.campusName || '').toLowerCase() !== selectedCampusFilter.toLowerCase()) {
        return false;
      }

      if (selectedDeptFilter !== 'ALL' && r.departmentId !== selectedDeptFilter) {
        return false;
      }

      if (selectedTypeFilter !== 'ALL' && r.teacherType !== selectedTypeFilter) {
        return false;
      }

      if (selectedStatusFilter !== 'ALL' && r.status !== selectedStatusFilter) {
        return false;
      }

      return true;
    });
  }, [teacherRequests, search, selectedCampusFilter, selectedDeptFilter, selectedTypeFilter, selectedStatusFilter]);

  // KPI Metrics
  const totalRegisteredCount = registeredTeachers.length;
  const pendingRequestsCount = (teacherRequests || []).filter((r) => r.status === 'PendingHODApproval').length;
  const uniqueCampusesCount = new Set(registeredTeachers.map((t) => t.campus)).size || 1;
  const totalAllocatedCredits = registeredTeachers.reduce((sum, t) => sum + (Number(t.totalCredits) || 0), 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Teacher Name',
      'Email',
      'Phone',
      'Campus',
      'Department',
      'Assigned HOD',
      'Faculty Type',
      'Courses',
      'Total Credits',
      'Registration Status',
      'Approval Date',
      'Approved By'
    ];

    const rows = filteredRegisteredTeachers.map((t) => [
      `"${t.name}"`,
      `"${t.email}"`,
      `"${t.phone}"`,
      `"${t.campus}"`,
      `"${t.department}"`,
      `"${t.hod}"`,
      `"${t.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}"`,
      `"${t.courses.map((c: any) => `${c.courseCode} (${c.credits || c.creditHours}Cr)`).join('; ')}"`,
      `"${t.totalCredits}"`,
      `"${t.status}"`,
      `"${fmtDate(t.approvedDate)}"`,
      `"${t.approvedBy}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UE_Registered_Teachers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Module Header */}
      <div className="bg-[#0c4727] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold font-heading">
                Teacher Registration & Compliance Module
              </h1>
              <span className="text-3xs font-bold text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded border border-white/10">
                Admin Global Access
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 mt-0.5">
              Permanent central repository of HOD-approved teachers across all University of Education campuses
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-emerald-300" />
          <span>Export Master CSV</span>
        </button>
      </div>

      {/* 2. Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 font-heading">{totalRegisteredCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Registered Teachers</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-800">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 font-heading">{pendingRequestsCount}</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Pending HOD Review</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-800">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 font-heading">{uniqueCampusesCount} Active</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Campuses Covered</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 text-purple-800">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-slate-900 font-heading">{totalAllocatedCredits} Cr</p>
            <p className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Total Teaching Credits</p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'registrations'
              ? 'bg-[#165534] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Registered Teachers</span>
          <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${
            activeTab === 'registrations' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {registeredTeachers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'requests'
              ? 'bg-[#165534] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Registration Requests</span>
          <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${
            activeTab === 'requests' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {(teacherRequests || []).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('login')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'login'
              ? 'bg-[#165534] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Login & Session Audit</span>
          <span className={`px-2 py-0.5 rounded-full text-3xs font-extrabold ${
            activeTab === 'login' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {loginLogs.length}
          </span>
        </button>
      </div>

      {/* 4. Global Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-400 bg-white transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by teacher name, email, course code, campus..."
              className="w-full text-xs border-none outline-none bg-transparent text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Campus Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedCampusFilter}
              onChange={(e) => setSelectedCampusFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="ALL">All Campuses</option>
              {campuses && campuses.length > 0 ? (
                campuses.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))
              ) : (
                <option value="Attock Campus">Attock Campus</option>
              )}
            </select>
          </div>

          {/* Department Filter */}
          <div className="w-full sm:w-48">
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Type Filter */}
          <div className="w-full sm:w-40">
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="ALL">All Faculty Types</option>
              <option value="REGULAR_TEACHER">Regular Faculty</option>
              <option value="VISITING_TEACHER">Visiting Faculty</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(search || selectedCampusFilter !== 'ALL' || selectedDeptFilter !== 'ALL' || selectedTypeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCampusFilter('ALL');
                setSelectedDeptFilter('ALL');
                setSelectedTypeFilter('ALL');
              }}
              className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 5. TAB 1: REGISTERED TEACHERS TABLE (Mandatory Requirement 10 & 22) */}
      {activeTab === 'registrations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs font-extrabold text-slate-700">
              Showing {filteredRegisteredTeachers.length} of {registeredTeachers.length} Registered Teachers
            </p>
            <span className="text-3xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Permanent Database Records
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-3xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3.5">Teacher Name</th>
                  <th className="py-3 px-3">Email & Contact</th>
                  <th className="py-3 px-3">Campus</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Assigned HOD</th>
                  <th className="py-3 px-3">Faculty Type</th>
                  <th className="py-3 px-3">Teaching Courses</th>
                  <th className="py-3 px-3 text-center">Credit Hours</th>
                  <th className="py-3 px-3">Registration Status</th>
                  <th className="py-3 px-3">Approved On</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRegisteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-slate-300" />
                        <span className="font-bold text-slate-700">No registered teachers matching filter</span>
                        <span className="text-3xs text-slate-400">
                          When an HOD accepts a teacher registration request, the approved teacher will immediately appear here.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRegisteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Teacher */}
                      <td className="py-3.5 px-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                            {t.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-extrabold text-slate-900">{t.name}</p>
                            <p className="text-3xs font-medium text-slate-400 truncate">{t.qualification}</p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Email & Contact */}
                      <td className="py-3.5 px-3 text-2xs text-slate-600">
                        <p className="font-mono truncate">{t.email}</p>
                        <p className="text-3xs text-slate-400 font-mono mt-0.5">{t.phone}</p>
                      </td>

                      {/* 3. Campus */}
                      <td className="py-3.5 px-3 text-2xs font-extrabold text-emerald-800">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80 truncate max-w-[130px]">
                          <Building2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">{t.campus}</span>
                        </span>
                      </td>

                      {/* 4. Department */}
                      <td className="py-3.5 px-3 text-2xs font-semibold text-slate-700">
                        {t.department.replace('Department of ', '')}
                      </td>

                      {/* 5. Assigned HOD */}
                      <td className="py-3.5 px-3 text-2xs font-medium text-slate-800">
                        <span className="inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-bold truncate">{t.hod}</span>
                        </span>
                      </td>

                      {/* 6. Teacher Type */}
                      <td className="py-3.5 px-3">
                        <RoleBadge role={t.teacherType} />
                      </td>

                      {/* 7. Courses */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap items-center gap-1 max-w-[180px]">
                          {t.courses && t.courses.length > 0 ? (
                            t.courses.map((c: any, i: number) => (
                              <span
                                key={`${c.courseId || c.courseCode}-${i}`}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded border border-slate-200"
                                title={c.courseTitle || c.courseName}
                              >
                                {c.courseCode} ({c.credits || c.creditHours || 3}Cr)
                              </span>
                            ))
                          ) : (
                            <span className="text-3xs text-slate-400 italic">No courses</span>
                          )}
                        </div>
                      </td>

                      {/* 8. Total Credits */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {t.totalCredits} / {t.creditLimit} Cr
                        </span>
                      </td>

                      {/* 9. Registration Status */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-3xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Registered
                        </span>
                      </td>

                      {/* 10. Approved On */}
                      <td className="py-3.5 px-3 text-3xs text-slate-500 font-medium">
                        {fmtDate(t.approvedDate)}
                      </td>

                      {/* 11. Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => setViewingRecord(t)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-3xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 border border-slate-200"
                        >
                          <Eye className="w-3 h-3 text-slate-600" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 2: ALL REGISTRATION REQUESTS (Requirement 11) */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs font-extrabold text-slate-700">
              Showing {filteredAllRequests.length} of {(teacherRequests || []).length} Total Requests Across All Campuses
            </p>
            <div className="flex items-center gap-2">
              <span className="text-3xs font-bold text-slate-500">Filter Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 font-semibold cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PendingHODApproval">Pending HOD Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-3xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3.5">Teacher Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Campus</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Target HOD</th>
                  <th className="py-3 px-3">Faculty Type</th>
                  <th className="py-3 px-3 text-center">Credit Hours</th>
                  <th className="py-3 px-3">Submitted On</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAllRequests.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Layers className="w-8 h-8 text-slate-300" />
                        <span className="font-bold text-slate-700">No requests found matching criteria</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAllRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-slate-900">
                        {req.teacherName}
                      </td>
                      <td className="py-3 px-3 text-2xs font-mono text-slate-600">
                        {req.teacherEmail}
                      </td>
                      <td className="py-3 px-3 text-2xs font-bold text-emerald-800">
                        {req.campusName || 'Attock Campus'}
                      </td>
                      <td className="py-3 px-3 text-2xs font-semibold text-slate-700">
                        {req.departmentName.replace('Department of ', '')}
                      </td>
                      <td className="py-3 px-3 text-2xs font-medium text-slate-800">
                        {req.hodName || 'Assigned HOD'}
                      </td>
                      <td className="py-3 px-3">
                        <RoleBadge role={req.teacherType} />
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                        {req.totalCredits} / {req.creditLimit || (req.teacherType === 'REGULAR_TEACHER' ? 22 : 12)} Cr
                      </td>
                      <td className="py-3 px-3 text-3xs text-slate-500">
                        {fmtDate(req.submittedAt)}
                      </td>
                      <td className="py-3 px-3">
                        {req.status === 'Approved' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Approved
                          </span>
                        )}
                        {req.status === 'PendingHODApproval' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending HOD
                          </span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-bold bg-rose-50 text-rose-800 border border-rose-200" title={req.rejectionReason}>
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setViewingRecord(req)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-3xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 border border-slate-200"
                        >
                          <Eye className="w-3 h-3 text-slate-600" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. TAB 3: LOGIN & SESSION AUDIT */}
      {activeTab === 'login' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-600">{loginLogs.length} Login Events Recorded</p>
            <span className="text-3xs text-slate-400 font-medium">Chronological order</span>
          </div>

          <div className="divide-y divide-slate-100">
            {loginLogs.map((log) => (
              <div key={log.id} className="grid grid-cols-12 gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors items-center text-xs">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200">
                    <span className="text-emerald-800 font-bold text-xs">{log.userName.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">{log.userName}</p>
                    <p className="text-3xs text-slate-500 font-mono truncate">{log.userEmail}</p>
                  </div>
                </div>

                <div className="col-span-3 hidden sm:flex">
                  <RoleBadge role={log.userRole} />
                </div>

                <div className="col-span-3 text-slate-600 hidden md:block">
                  <div className="flex items-center gap-1.5 font-medium text-3xs">
                    <LogIn className="w-3 h-3 text-blue-500" />
                    <span>{fmtDate(log.loginAt)}</span>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-end">
                  {log.formFilledAt ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-3xs font-bold rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> Form Done
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-3xs font-bold rounded-full border border-slate-200">
                      <Clock className="w-3 h-3" /> Logged In
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. DETAIL VIEW MODAL (Complete dossier for Admin inspection) */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-lg flex items-center justify-center">
                  {(viewingRecord.name || viewingRecord.teacherName || 'T').charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                    {viewingRecord.name || viewingRecord.teacherName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {viewingRecord.email || viewingRecord.teacherEmail}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scope & Authorization Details */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-3xs uppercase font-extrabold text-emerald-800 block">Assigned Scope</span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  {viewingRecord.campus || viewingRecord.campusName} • {viewingRecord.department || viewingRecord.departmentName}
                </span>
              </div>
              <div>
                <span className="text-3xs uppercase font-extrabold text-emerald-800 block">Approval Authority / HOD</span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  {viewingRecord.approvedBy || viewingRecord.hod || viewingRecord.hodName || 'Department HOD'}
                </span>
              </div>
              <div>
                <span className="text-3xs uppercase font-extrabold text-emerald-800 block">Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {viewingRecord.status || 'Registered'}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Teacher Type</span>
                <span className="font-bold text-slate-800">
                  {(viewingRecord.teacherType || viewingRecord.role) === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Phone Contact</span>
                <span className="font-bold text-slate-800">{viewingRecord.phone || viewingRecord.profileData?.phone || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">CNIC / ID</span>
                <span className="font-bold text-slate-800">{viewingRecord.cnic || viewingRecord.profileData?.cnic || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Academic Session</span>
                <span className="font-bold text-slate-800">{viewingRecord.session || viewingRecord.profileData?.academicSession || 'Spring 2026'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Student Batch</span>
                <span className="font-bold text-slate-800">{viewingRecord.batch || viewingRecord.profileData?.batch || '2023-2027'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Credit Load</span>
                <span className="font-bold text-emerald-700">
                  {viewingRecord.totalCredits} / {viewingRecord.creditLimit || ((viewingRecord.teacherType || viewingRecord.role) === 'REGULAR_TEACHER' ? 22 : 12)} Cr
                </span>
              </div>
            </div>

            {/* Teaching Courses Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800">
                Assigned Teaching Courses & Credits:
              </h4>

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
                    {(viewingRecord.courses || viewingRecord.selectedCourses || []).map((c: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-emerald-700">{c.courseCode}</td>
                        <td className="p-2.5 text-slate-800 font-medium">
                          {c.courseTitle || c.courseName}
                          {c.section && (
                            <span className="ml-2 text-3xs font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              {c.section}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-black text-slate-900">{c.creditHours || c.credits || 3} Cr</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50 font-bold">
                      <td colSpan={2} className="p-2.5 text-right text-emerald-950 font-extrabold">
                        Total Credits:
                      </td>
                      <td className="p-2.5 text-right font-black text-emerald-900">
                        {viewingRecord.totalCredits} Credits
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
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
