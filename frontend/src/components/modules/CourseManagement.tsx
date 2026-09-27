import React, { useState, useEffect, useMemo } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { Course, User } from '../../types';
import {
  BookOpen, Filter, CheckCircle2, AlertTriangle, TrendingUp, BarChart2,
  BookMarked, Users, ShieldCheck, Trash2, Edit2, Eye, X, Clock, Sparkles, Scale,
  AlertCircle, ArrowRight, Building2, Landmark, CheckSquare, Square, Download,
  Search, Check, Copy, FileText, Layers, Calendar, UserCheck, Phone, CreditCard,
  GraduationCap
} from 'lucide-react';

interface CourseManagementProps {
  activeModule?: string;
  onNavigate?: (moduleName: string) => void;
}

export type CourseSubTab = 'All Courses' | 'Campus Wise' | 'Department Wise' | 'Semester Wise';

export const CourseManagement: React.FC<CourseManagementProps> = ({ activeModule = 'All Courses', onNavigate }) => {
  const {
    courses = [],
    teacherRequests = [],
    departments = [],
    campuses = [],
    usersList = [],
    refreshTeacherRequests,
    refreshCourses
  } = useCFMS();

  // Sub-tabs for Course Management (Order requested: All Courses -> Campus Wise -> Department Wise -> Semester Wise)
  const [currentTab, setCurrentTab] = useState<CourseSubTab>('All Courses');

  // Sync activeModule prop with currentTab
  useEffect(() => {
    if (activeModule === 'Campus Wise') setCurrentTab('Campus Wise');
    else if (activeModule === 'Department Wise' || activeModule === 'Department Courses') setCurrentTab('Department Wise');
    else if (activeModule === 'Semester Wise') setCurrentTab('Semester Wise');
    else if (activeModule === 'All Courses' || activeModule === 'Course Management') setCurrentTab('All Courses');
  }, [activeModule]);

  // Initial data refresh on mount
  useEffect(() => {
    refreshTeacherRequests();
    refreshCourses();
  }, []);

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [campusFilter, setCampusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [facultyTypeFilter, setFacultyTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Tab selections
  const [selectedCampusTab, setSelectedCampusTab] = useState<string>('Attock Campus');
  const [selectedDeptTab, setSelectedDeptTab] = useState<string>(departments[0]?.id || 'dept-1790466035357');
  const [selectedSemesterTab, setSelectedSemesterTab] = useState<string>('Semester 1');

  // Multi-select state
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  // Modals & Details
  const [viewCourseDossier, setViewCourseDossier] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Auto-dismiss copied indicator
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // DYNAMIC NORMALIZATION: Combine courses from Teacher Registration Requests &
  // backend courses so every course entered during form filling appears seamlessly.
  // ─────────────────────────────────────────────────────────────────────────────
  const normalizedFacultyCourses = useMemo(() => {
    const list: any[] = [];
    const seenKeys = new Set<string>();

    // 1. Process all courses entered by faculty members in registration requests
    (teacherRequests || []).forEach((req) => {
      const teacherUser = usersList.find(
        (u) => u.id === req.teacherId || (u.email && u.email.toLowerCase() === req.teacherEmail?.toLowerCase())
      );

      (req.selectedCourses || []).forEach((sc: any, idx: number) => {
        const uniqueKey = `${req.teacherId}-${sc.courseCode || sc.code}-${sc.section || idx}`;
        seenKeys.add(uniqueKey);

        // Derive semester from code (e.g. CS-101 -> Semester 1, CS-201 -> Semester 3, CS-301 -> Semester 2/3)
        let derivedSemester = 'Semester 1';
        const numMatch = (sc.courseCode || sc.code || '').match(/\d+/);
        if (numMatch) {
          const num = parseInt(numMatch[0], 10);
          if (num >= 400) derivedSemester = 'Semester 7';
          else if (num >= 300) derivedSemester = 'Semester 5';
          else if (num >= 200) derivedSemester = 'Semester 3';
          else derivedSemester = 'Semester 1';
        }

        list.push({
          id: `${req.id}-course-${idx}`,
          requestId: req.id,
          code: sc.courseCode || sc.code || 'CRS-000',
          title: sc.courseTitle || sc.courseName || sc.title || 'Course Title',
          campusId: req.campusId || req.profileData?.campusId || 'camp-attock',
          campusName: req.campusName || req.profileData?.campus || 'Attock Campus',
          departmentId: req.departmentId,
          departmentName: req.departmentName || 'Computer Science',
          hodId: req.hodId || req.profileData?.hodId,
          hodName: req.hodName || req.profileData?.hodName || 'Dr. Saima Farooq',
          credits: Number(sc.creditHours || sc.credits || 3),
          section: sc.section || (Array.isArray(sc.sections) ? sc.sections.join(', ') : 'Section A'),
          sections: Array.isArray(sc.sections) ? sc.sections : [sc.section || 'Section A'],
          semester: derivedSemester,
          academicSession: req.profileData?.academicSession || 'Spring 2026',
          batch: req.profileData?.batch || '2023-2027',
          // Teacher Details from Form
          teacherId: req.teacherId,
          teacherName: req.teacherName,
          teacherEmail: req.teacherEmail,
          teacherType: req.teacherType || 'REGULAR_TEACHER',
          phone: req.profileData?.phone || teacherUser?.phone || '—',
          cnic: req.profileData?.cnic || (teacherUser as any)?.cnic || '—',
          gender: req.profileData?.gender || (teacherUser as any)?.gender || 'Male',
          bloodGroup: req.profileData?.bloodGroup || '—',
          highestQualification: req.profileData?.highestQualification || 'MS / M.Phil',
          specialization: req.profileData?.specialization || 'Computer Science',
          totalTeacherCredits: req.totalCredits || 12,
          creditLimit: req.creditLimit || (req.teacherType === 'REGULAR_TEACHER' ? 22 : 12),
          formStatus: req.status || 'Approved',
          submittedAt: req.submittedAt,
          reviewedAt: req.reviewedAt,
          reviewedBy: req.reviewedBy,
          rejectionReason: req.rejectionReason,
          rawRequest: req
        });
      });
    });

    // 2. Also incorporate any course from backend catalogue not yet covered
    (courses || []).forEach((c, idx) => {
      const matchTeacher = usersList.find((u) => u.id === c.assignedTeacherId);
      const uniqueKey = `${c.assignedTeacherId || 'unassigned'}-${c.code}-${idx}`;

      if (!seenKeys.has(uniqueKey) && c.assignedTeacherName && c.assignedTeacherName !== 'Unassigned') {
        seenKeys.add(uniqueKey);
        list.push({
          id: c.id,
          code: c.code,
          title: c.title,
          campusId: c.campusId || 'camp-attock',
          campusName: c.campusName || 'Attock Campus',
          departmentId: c.departmentId,
          departmentName: c.departmentName,
          hodId: 'usr-hod-1790467146146',
          hodName: 'Dr. Saima Farooq',
          credits: c.credits || 3,
          section: (c.sections && c.sections[0]) || 'Section A',
          sections: c.sections || ['Section A'],
          semester: c.semester || 'Semester 1',
          academicSession: c.academicSession || 'Spring 2026',
          batch: c.batch || '2023-2027',
          teacherId: c.assignedTeacherId,
          teacherName: c.assignedTeacherName,
          teacherEmail: matchTeacher?.email || 'faculty@ue.edu.pk',
          teacherType: c.assignedTeacherRole || 'REGULAR_TEACHER',
          phone: matchTeacher?.phone || '—',
          cnic: (matchTeacher as any)?.cnic || '—',
          gender: (matchTeacher as any)?.gender || 'Male',
          bloodGroup: '—',
          highestQualification: 'MS / M.Phil',
          specialization: 'Computer Science',
          totalTeacherCredits: c.credits || 3,
          creditLimit: c.assignedTeacherRole === 'REGULAR_TEACHER' ? 22 : 12,
          formStatus: 'Approved',
          submittedAt: (c as any).created_at || new Date().toISOString()
        });
      }
    });

    return list;
  }, [teacherRequests, courses, usersList]);

  // Teaching faculty list
  const facultyMembers = useMemo(() => {
    return usersList.filter((u) => u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER');
  }, [usersList]);

  // Workload calculations per teacher
  const facultyWorkloads = useMemo(() => {
    return facultyMembers.map((teacher) => {
      const assigned = normalizedFacultyCourses.filter((c) => c.teacherId === teacher.id);
      const totalCredits = assigned.reduce((sum, c) => sum + (c.credits || 0), 0);
      const isRegular = teacher.role === 'REGULAR_TEACHER';
      const minLimit = isRegular ? 9 : 3;
      const targetLimit = isRegular ? 12 : 6;
      const maxLimit = isRegular ? 22 : 12;

      let status: 'Underload' | 'Balanced' | 'Overload' = 'Balanced';
      if (totalCredits < minLimit) status = 'Underload';
      else if (totalCredits > maxLimit) status = 'Overload';

      return {
        teacher,
        assignedCourses: assigned,
        totalCredits,
        courseCount: assigned.length,
        minLimit,
        targetLimit,
        maxLimit,
        status,
        percentage: Math.min(100, Math.round((totalCredits / maxLimit) * 100))
      };
    });
  }, [facultyMembers, normalizedFacultyCourses]);

  // Filtered courses based on current sub-tab, search, and dropdowns
  const filteredCourses = useMemo(() => {
    return normalizedFacultyCourses.filter((c) => {
      // 1. Tab filters
      if (currentTab === 'Campus Wise' && c.campusName.toLowerCase() !== selectedCampusTab.toLowerCase()) {
        return false;
      }
      if (currentTab === 'Department Wise' && selectedDeptTab && c.departmentId !== selectedDeptTab) {
        return false;
      }
      if (currentTab === 'Semester Wise' && c.semester !== selectedSemesterTab) {
        return false;
      }

      // 2. Dropdown Filters
      if (campusFilter !== 'ALL' && c.campusName.toLowerCase() !== campusFilter.toLowerCase()) {
        return false;
      }
      if (deptFilter !== 'ALL' && c.departmentId !== deptFilter) {
        return false;
      }
      if (semesterFilter !== 'ALL' && c.semester !== semesterFilter) {
        return false;
      }
      if (facultyTypeFilter !== 'ALL' && c.teacherType !== facultyTypeFilter) {
        return false;
      }
      if (statusFilter !== 'ALL' && c.formStatus !== statusFilter) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchCode = c.code.toLowerCase().includes(q);
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchTeacher = (c.teacherName || '').toLowerCase().includes(q);
        const matchDept = c.departmentName.toLowerCase().includes(q);
        const matchCampus = c.campusName.toLowerCase().includes(q);
        const matchHOD = (c.hodName || '').toLowerCase().includes(q);
        const matchCnic = (c.cnic || '').toLowerCase().includes(q);

        if (!matchCode && !matchTitle && !matchTeacher && !matchDept && !matchCampus && !matchHOD && !matchCnic) {
          return false;
        }
      }

      return true;
    });
  }, [
    normalizedFacultyCourses,
    currentTab,
    selectedCampusTab,
    selectedDeptTab,
    selectedSemesterTab,
    campusFilter,
    deptFilter,
    semesterFilter,
    facultyTypeFilter,
    statusFilter,
    searchQuery
  ]);

  // KPI Metrics
  const totalAllocatedCourses = normalizedFacultyCourses.length;
  const regularFacultyCourses = normalizedFacultyCourses.filter((c) => c.teacherType === 'REGULAR_TEACHER').length;
  const visitingFacultyCourses = normalizedFacultyCourses.filter((c) => c.teacherType === 'VISITING_TEACHER').length;
  const totalCreditLoad = normalizedFacultyCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
  const approvedCount = normalizedFacultyCourses.filter((c) => c.formStatus === 'Approved').length;
  const pendingCount = normalizedFacultyCourses.filter((c) => c.formStatus === 'PendingHODApproval').length;

  // Multi-select toggle helpers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCourseIds(filteredCourses.map((c) => c.id));
    } else {
      setSelectedCourseIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Course Code',
      'Course Title',
      'Campus',
      'Department',
      'Assigned HOD',
      'Enrolled Faculty',
      'Faculty Type',
      'Phone',
      'CNIC',
      'Credit Hours',
      'Allocated Section',
      'Semester',
      'Academic Session',
      'Batch',
      'Form Status'
    ];

    const rows = filteredCourses.map((c) => [
      `"${c.code}"`,
      `"${c.title}"`,
      `"${c.campusName}"`,
      `"${c.departmentName}"`,
      `"${c.hodName}"`,
      `"${c.teacherName}"`,
      `"${c.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}"`,
      `"${c.phone}"`,
      `"${c.cnic}"`,
      c.credits,
      `"${c.section}"`,
      `"${c.semester}"`,
      `"${c.academicSession}"`,
      `"${c.batch}"`,
      `"${c.formStatus}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UE_Courses_Form_Records_${currentTab.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTabClick = (tab: CourseSubTab) => {
    setCurrentTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* ── Top Header Banner ── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              Faculty Form Submission Data
            </span>
            <span className="text-3xs text-slate-400 font-mono">University of Education, Attock</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-slate-900">
            Course Management & Faculty Form Records
          </h1>
          <p className="text-xs text-slate-500">
            Real courses and sections selected by teaching faculty during registration form submission.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Download CSV export"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" /> Export Excel/CSV
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STANDARD COURSE MANAGEMENT SUB-MODULES (4 EXACT TABS)
          1. All Courses
          2. Campus Wise
          3. Department Wise
          4. Semester Wise
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
          {/* Sub-Navigation Pill Bar (Exact 4 Sub-modules Requested) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5">
            {[
              { id: 'All Courses' as CourseSubTab, label: 'All Courses', icon: BookOpen, count: totalAllocatedCourses },
              { id: 'Campus Wise' as CourseSubTab, label: 'Campus Wise', icon: Landmark, count: campuses.length },
              { id: 'Department Wise' as CourseSubTab, label: 'Department Wise', icon: Building2, count: departments.length },
              { id: 'Semester Wise' as CourseSubTab, label: 'Semester Wise', icon: Calendar, count: 8 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-4 py-2.5 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1E7B4E] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-3xs px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* KPI Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Allocated Courses</span>
              <p className="text-xl font-black text-slate-900 mt-1">{totalAllocatedCourses}</p>
              <span className="text-3xs text-slate-500">From faculty forms</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-blue-100 bg-blue-50/20 shadow-2xs">
              <span className="text-3xs font-extrabold text-blue-800 uppercase tracking-wider block">Regular Faculty</span>
              <p className="text-xl font-black text-blue-900 mt-1">{regularFacultyCourses}</p>
              <span className="text-3xs text-blue-700">Permanent staff</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-100 bg-amber-50/20 shadow-2xs">
              <span className="text-3xs font-extrabold text-amber-800 uppercase tracking-wider block">Visiting Faculty</span>
              <p className="text-xl font-black text-amber-900 mt-1">{visitingFacultyCourses}</p>
              <span className="text-3xs text-amber-700">Semester contracts</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-3xs font-extrabold text-slate-400 uppercase tracking-wider block">Total Workload</span>
              <p className="text-xl font-black text-emerald-900 mt-1">{totalCreditLoad} Cr</p>
              <span className="text-3xs text-slate-500">Registered credit hours</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
              <span className="text-3xs font-extrabold text-emerald-800 uppercase tracking-wider block">HOD Approved</span>
              <p className="text-xl font-black text-emerald-900 mt-1">{approvedCount}</p>
              <span className="text-3xs text-emerald-700">Active enrollments</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-purple-100 bg-purple-50/20 shadow-2xs">
              <span className="text-3xs font-extrabold text-purple-800 uppercase tracking-wider block">Pending HOD</span>
              <p className="text-xl font-black text-purple-900 mt-1">{pendingCount}</p>
              <span className="text-3xs text-purple-700">Under verification</span>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              SUB-TAB 1: ALL COURSES (Master Table of Form Data)
          ═══════════════════════════════════════════════════════════ */}
          {currentTab === 'All Courses' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 animate-fade-in">
              {/* Search & Dynamic Filters Header */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[280px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by course code, title, faculty name, CNIC, HOD, campus, or department..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Campus Filter */}
                  <select
                    value={campusFilter}
                    onChange={(e) => setCampusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:bg-white"
                  >
                    <option value="ALL">All Campuses</option>
                    {campuses.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Department Filter */}
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:bg-white"
                  >
                    <option value="ALL">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>

                  {/* Faculty Type Filter */}
                  <select
                    value={facultyTypeFilter}
                    onChange={(e) => setFacultyTypeFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:bg-white"
                  >
                    <option value="ALL">All Faculty Types</option>
                    <option value="REGULAR_TEACHER">Regular Faculty</option>
                    <option value="VISITING_TEACHER">Visiting Faculty</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:bg-white"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="PendingHODApproval">Pending HOD Approval</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  {(campusFilter !== 'ALL' || deptFilter !== 'ALL' || facultyTypeFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
                    <button
                      onClick={() => {
                        setCampusFilter('ALL');
                        setDeptFilter('ALL');
                        setFacultyTypeFilter('ALL');
                        setStatusFilter('ALL');
                        setSearchQuery('');
                      }}
                      className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl cursor-pointer transition-colors"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Master Course Data Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-3xs font-extrabold uppercase tracking-wider text-slate-500">
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={filteredCourses.length > 0 && selectedCourseIds.length === filteredCourses.length}
                          onChange={handleSelectAll}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </th>
                      <th className="p-3.5">COURSE CODE</th>
                      <th className="p-3.5">COURSE TITLE</th>
                      <th className="p-3.5">CAMPUS</th>
                      <th className="p-3.5">DEPARTMENT</th>
                      <th className="p-3.5">ASSIGNED HOD</th>
                      <th className="p-3.5">ENROLLED FACULTY</th>
                      <th className="p-3.5">FACULTY ROLE</th>
                      <th className="p-3.5">SECTION</th>
                      <th className="p-3.5 text-center">CREDITS</th>
                      <th className="p-3.5 text-center">STATUS</th>
                      <th className="p-3.5 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="p-12 text-center text-slate-400">
                          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="font-bold text-sm text-slate-600">No course form submissions found</p>
                          <p className="text-2xs text-slate-400 mt-1">Courses will appear here automatically when faculty members submit their registration forms.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((c) => {
                        const isSelected = selectedCourseIds.includes(c.id);
                        return (
                          <tr
                            key={c.id}
                            className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}
                          >
                            <td className="p-3.5 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectOne(c.id)}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>

                            <td className="p-3.5">
                              <span className="font-mono font-black text-xs text-[#0c4727] bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md shadow-2xs whitespace-nowrap">
                                {c.code}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <div className="font-bold text-slate-900 text-xs">
                                {c.title}
                              </div>
                              <span className="text-3xs text-slate-400 font-mono">
                                {c.academicSession} • {c.batch}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="font-semibold text-slate-800 text-xs whitespace-nowrap flex items-center gap-1">
                                <Landmark className="w-3 h-3 text-emerald-700 shrink-0" />
                                {c.campusName}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="font-semibold text-slate-800 text-xs whitespace-nowrap">
                                {c.departmentName ? c.departmentName.replace('Department of ', '') : 'Computer Science'}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="font-bold text-indigo-950 text-xs whitespace-nowrap flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                {c.hodName || 'Dr. Saima Farooq'}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <div className="font-bold text-slate-900 text-xs whitespace-nowrap">
                                {c.teacherName}
                              </div>
                              <span className="text-3xs text-slate-500 font-mono">
                                {c.phone}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span
                                className={`whitespace-nowrap inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-bold border shadow-2xs ${
                                  c.teacherType === 'VISITING_TEACHER'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                                    : 'bg-blue-50 text-blue-800 border-blue-200/80'
                                }`}
                              >
                                {c.teacherType === 'VISITING_TEACHER' ? 'Visiting Faculty' : 'Regular Faculty'}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="text-2xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 whitespace-nowrap">
                                {c.section}
                              </span>
                            </td>

                            <td className="p-3.5 text-center">
                              <span className="px-2.5 py-0.5 font-black text-xs rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs whitespace-nowrap">
                                {c.credits} Cr
                              </span>
                            </td>

                            <td className="p-3.5 text-center">
                              <span
                                className={`px-2 py-0.5 font-bold text-3xs rounded-full border shadow-2xs whitespace-nowrap ${
                                  c.formStatus === 'Approved'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : c.formStatus === 'Rejected'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                {c.formStatus === 'PendingHODApproval' ? 'Pending HOD' : c.formStatus}
                              </span>
                            </td>

                            <td className="p-3.5 text-right whitespace-nowrap">
                              <button
                                onClick={() => setViewCourseDossier(c)}
                                title="View Complete Form Data & Syllabus Details"
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-2xs font-bold"
                              >
                                <Eye className="w-3.5 h-3.5" /> Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between text-2xs text-slate-500 pt-2 gap-2">
                <span>
                  Showing <strong>{filteredCourses.length}</strong> of <strong>{normalizedFacultyCourses.length}</strong> course allocations
                </span>
                <span className="font-mono text-slate-400">
                  Total Active Credit Workload: <strong>{filteredCourses.reduce((s, c) => s + (c.credits || 0), 0)} Credit Hours</strong>
                </span>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SUB-TAB 2: CAMPUS WISE VIEW
          ═══════════════════════════════════════════════════════════ */}
          {currentTab === 'Campus Wise' && (
            <div className="space-y-6 animate-fade-in">
              {/* Campus Selector Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {campuses.map((campus) => {
                  const campusCourses = normalizedFacultyCourses.filter(
                    (c) => c.campusName.toLowerCase() === campus.name.toLowerCase()
                  );
                  const campusCredits = campusCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
                  const campusTeachers = new Set(campusCourses.map((c) => c.teacherId)).size;
                  const isSelected = selectedCampusTab.toLowerCase() === campus.name.toLowerCase();

                  return (
                    <div
                      key={campus.id}
                      onClick={() => setSelectedCampusTab(campus.name)}
                      className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? 'bg-emerald-50/50 border-emerald-600 shadow-sm ring-2 ring-emerald-600/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-3xs px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-200">
                            {campus.code}
                          </span>
                          <span className="text-3xs font-bold text-slate-400">{campus.city}</span>
                        </div>
                        <h3 className="font-black text-slate-900 text-base">{campus.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">Director: {campus.directorName || 'Prof. Dr. Campus Director'}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center bg-white p-3 rounded-2xl border border-slate-200 text-2xs">
                        <div>
                          <span className="text-3xs text-slate-400 block font-bold">Courses</span>
                          <span className="font-black text-slate-900 text-sm">{campusCourses.length}</span>
                        </div>
                        <div>
                          <span className="text-3xs text-slate-400 block font-bold">Credits</span>
                          <span className="font-black text-emerald-800 text-sm">{campusCredits} Cr</span>
                        </div>
                        <div>
                          <span className="text-3xs text-slate-400 block font-bold">Faculty</span>
                          <span className="font-black text-indigo-700 text-sm">{campusTeachers}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Campus Courses Roster */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-heading">
                      Courses Registered by Faculty in {selectedCampusTab}
                    </h3>
                    <p className="text-xs text-slate-500">
                      All course offerings submitted by regular and visiting instructors for this campus.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-extrabold uppercase text-slate-500">
                        <th className="p-3">COURSE CODE</th>
                        <th className="p-3">COURSE TITLE</th>
                        <th className="p-3">DEPARTMENT</th>
                        <th className="p-3">ASSIGNED HOD</th>
                        <th className="p-3">INSTRUCTOR</th>
                        <th className="p-3">FACULTY ROLE</th>
                        <th className="p-3 text-center">CREDITS</th>
                        <th className="p-3 text-center">SECTION</th>
                        <th className="p-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {normalizedFacultyCourses.filter((c) => c.campusName.toLowerCase() === selectedCampusTab.toLowerCase()).length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-slate-400">
                            No faculty course submissions found for {selectedCampusTab}.
                          </td>
                        </tr>
                      ) : (
                        normalizedFacultyCourses
                          .filter((c) => c.campusName.toLowerCase() === selectedCampusTab.toLowerCase())
                          .map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-emerald-900">{c.code}</td>
                              <td className="p-3 font-bold text-slate-800">{c.title}</td>
                              <td className="p-3">{c.departmentName}</td>
                              <td className="p-3 font-semibold text-indigo-900">{c.hodName}</td>
                              <td className="p-3 font-bold text-slate-900">{c.teacherName}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-3xs font-bold ${
                                  c.teacherType === 'REGULAR_TEACHER' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'
                                }`}>
                                  {c.teacherType === 'REGULAR_TEACHER' ? 'Regular' : 'Visiting'}
                                </span>
                              </td>
                              <td className="p-3 text-center font-bold text-emerald-800">{c.credits} Cr</td>
                              <td className="p-3 text-center">{c.section}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => setViewCourseDossier(c)}
                                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                                >
                                  View Form
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SUB-TAB 3: DEPARTMENT WISE VIEW
          ═══════════════════════════════════════════════════════════ */}
          {currentTab === 'Department Wise' && (
            <div className="space-y-6 animate-fade-in">
              {/* Department Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {departments.map((dept) => {
                  const deptCourses = normalizedFacultyCourses.filter((c) => c.departmentId === dept.id);
                  const deptCredits = deptCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
                  const deptTeachers = new Set(deptCourses.map((c) => c.teacherId)).size;
                  const isSelected = selectedDeptTab === dept.id;

                  return (
                    <div
                      key={dept.id}
                      onClick={() => setSelectedDeptTab(dept.id)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? 'bg-emerald-50/50 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-3xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {dept.code}
                          </span>
                          <span className="text-3xs font-bold text-slate-400">
                            {dept.campusName || 'Attock Campus'}
                          </span>
                        </div>
                        <h3 className="font-black text-slate-900 text-sm">{dept.name}</h3>
                        <p className="text-3xs text-slate-500">HOD: {dept.hodName || 'Dr. Saima Farooq'}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center bg-white p-2.5 rounded-2xl border border-slate-200 text-2xs">
                        <div>
                          <span className="text-3xs text-slate-400 block font-bold">Courses</span>
                          <span className="font-black text-slate-800">{deptCourses.length}</span>
                        </div>
                        <div>
                          <span className="text-3xs text-slate-400 block font-bold">Credits</span>
                          <span className="font-black text-emerald-800">{deptCredits} Cr</span>
                        </div>
                        <div>
                          <span className="text-3xs text-slate-400 block font-bold">Faculty</span>
                          <span className="font-black text-indigo-700">{deptTeachers}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Department Courses Table */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-heading">
                      Courses Allocated to: {departments.find((d) => d.id === selectedDeptTab)?.name || 'Selected Department'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Curriculum courses chosen by teachers under this department's academic supervision.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-3xs font-extrabold uppercase text-slate-500">
                        <th className="p-3">CODE</th>
                        <th className="p-3">TITLE</th>
                        <th className="p-3">CAMPUS</th>
                        <th className="p-3">INSTRUCTOR</th>
                        <th className="p-3">FACULTY ROLE</th>
                        <th className="p-3 text-center">CREDITS</th>
                        <th className="p-3 text-center">SECTION</th>
                        <th className="p-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {normalizedFacultyCourses.filter((c) => c.departmentId === selectedDeptTab).length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400">
                            No faculty course submissions found for this department.
                          </td>
                        </tr>
                      ) : (
                        normalizedFacultyCourses
                          .filter((c) => c.departmentId === selectedDeptTab)
                          .map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono font-bold text-emerald-900">{c.code}</td>
                              <td className="p-3 font-bold text-slate-800">{c.title}</td>
                              <td className="p-3">{c.campusName}</td>
                              <td className="p-3 font-bold text-slate-900">{c.teacherName}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full text-3xs font-bold ${
                                  c.teacherType === 'REGULAR_TEACHER' ? 'bg-blue-50 text-blue-800' : 'bg-amber-50 text-amber-800'
                                }`}>
                                  {c.teacherType === 'REGULAR_TEACHER' ? 'Regular' : 'Visiting'}
                                </span>
                              </td>
                              <td className="p-3 text-center font-bold text-emerald-800">{c.credits} Cr</td>
                              <td className="p-3 text-center">{c.section}</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => setViewCourseDossier(c)}
                                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                                >
                                  View Form
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              SUB-TAB 4: SEMESTER WISE ROADMAP VIEW
          ═══════════════════════════════════════════════════════════ */}
          {currentTab === 'Semester Wise' && (
            <div className="space-y-6 animate-fade-in">
              {/* Semester Selector Pills */}
              <div className="bg-white rounded-3xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
                  const semName = `Semester ${s}`;
                  const semCourses = normalizedFacultyCourses.filter((c) => c.semester === semName);
                  const semCredits = semCourses.reduce((sum, c) => sum + (c.credits || 0), 0);
                  const isSelected = selectedSemesterTab === semName;

                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedSemesterTab(semName)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? 'bg-[#1E7B4E] text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>Semester {s}</span>
                      <span
                        className={`text-3xs px-2 py-0.5 rounded-full font-mono ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        {semCredits} Cr
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Semester Breakdown Header Banner */}
              {(() => {
                const currentSemCourses = normalizedFacultyCourses.filter((c) => c.semester === selectedSemesterTab);
                const semTotalCredits = currentSemCourses.reduce((sum, c) => sum + (c.credits || 0), 0);

                return (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-emerald-900 to-[#0c4727] text-white p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-3xs font-mono font-bold bg-white/10 px-2 py-0.5 rounded text-emerald-300">
                            SEMESTER ALLOCATION
                          </span>
                          <span className="text-3xs text-emerald-200">Faculty Course Selection Matrix</span>
                        </div>
                        <h2 className="text-xl font-black font-heading mt-1">{selectedSemesterTab} Courses</h2>
                        <p className="text-xs text-emerald-100/90 mt-0.5">
                          Total registered workload for {selectedSemesterTab}: <strong>{semTotalCredits} Credit Hours</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-2xl text-center">
                          <span className="text-3xs uppercase tracking-wider text-emerald-200 block">Total Load</span>
                          <span className="text-xl font-black font-mono">{semTotalCredits} Cr</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-2xl text-center">
                          <span className="text-3xs uppercase tracking-wider text-emerald-200 block">Courses</span>
                          <span className="text-xl font-black font-mono">{currentSemCourses.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Semester Course Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentSemCourses.length === 0 ? (
                        <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
                          <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="font-bold text-sm text-slate-600">No faculty form submissions for {selectedSemesterTab}</p>
                        </div>
                      ) : (
                        currentSemCourses.map((c) => (
                          <div
                            key={c.id}
                            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-black text-xs text-[#0c4727] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                  {c.code}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {c.section}
                                </span>
                              </div>

                              <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{c.title}</h3>

                              <div className="space-y-1.5 text-2xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Campus:</span>
                                  <span className="font-bold text-slate-800">{c.campusName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Department:</span>
                                  <span className="font-bold text-slate-800">{c.departmentName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Instructor:</span>
                                  <span className="font-bold text-slate-800">{c.teacherName}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Faculty Role:</span>
                                  <span className="font-bold text-indigo-900">
                                    {c.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                              <span className="px-2.5 py-1 rounded-full font-black text-xs bg-emerald-50 text-emerald-900 border border-emerald-200">
                                {c.credits} Credit Hours
                              </span>
                              <button
                                onClick={() => setViewCourseDossier(c)}
                                className="text-xs font-bold text-[#1E7B4E] hover:text-[#0c4727] inline-flex items-center gap-1 cursor-pointer"
                              >
                                View Form Details <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: FULL FACULTY FORM SUBMISSION & COURSE DOSSIER
      ───────────────────────────────────────────────────────────── */}
      {viewCourseDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 bg-[#0c4727] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-mono font-black text-base text-emerald-300">
                  {viewCourseDossier.code}
                </div>
                <div>
                  <h3 className="text-base font-extrabold">{viewCourseDossier.title}</h3>
                  <p className="text-2xs text-emerald-200">
                    {viewCourseDossier.campusName} • {viewCourseDossier.departmentName}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewCourseDossier(null)} className="text-white/80 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {/* Stat Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div>
                  <span className="text-3xs text-slate-400 block font-bold uppercase">Credit Hours</span>
                  <span className="font-mono font-black text-emerald-900 text-base">{viewCourseDossier.credits} Cr</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block font-bold uppercase">Allocated Section</span>
                  <span className="font-bold text-slate-800 text-sm">{viewCourseDossier.section}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block font-bold uppercase">Semester Roadmap</span>
                  <span className="font-bold text-slate-800 text-sm">{viewCourseDossier.semester}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block font-bold uppercase">Form Status</span>
                  <span className={`font-bold text-sm ${viewCourseDossier.formStatus === 'Approved' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {viewCourseDossier.formStatus}
                  </span>
                </div>
              </div>

              {/* 1. Faculty Details (Form Data) */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Faculty Member Identity (Entered at Registration)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-3xs text-slate-400 block">Teacher Full Name:</span>
                    <strong className="text-slate-900">{viewCourseDossier.teacherName}</strong>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400 block">Faculty Type:</span>
                    <strong className="text-indigo-950">
                      {viewCourseDossier.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400 block">Institutional Email:</span>
                    <span className="font-mono text-slate-800">{viewCourseDossier.teacherEmail}</span>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400 block">Phone / WhatsApp:</span>
                    <strong className="text-slate-900">{viewCourseDossier.phone}</strong>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400 block">CNIC Number:</span>
                    <span className="font-mono text-slate-800">{viewCourseDossier.cnic}</span>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400 block">Highest Qualification:</span>
                    <strong className="text-slate-900">{viewCourseDossier.highestQualification}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-3xs text-slate-400 block">Specialization / Research:</span>
                    <strong className="text-slate-900">{viewCourseDossier.specialization}</strong>
                  </div>
                </div>
              </div>

              {/* 2. Institutional & HOD Governance */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Campus & Department Authorization Scope
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-3xs text-slate-400 block">Campus:</span>
                    <strong className="text-slate-900">{viewCourseDossier.campusName}</strong>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400 block">Department:</span>
                    <strong className="text-slate-900">{viewCourseDossier.departmentName}</strong>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400 block">Assigned HOD:</span>
                    <strong className="text-indigo-950">{viewCourseDossier.hodName}</strong>
                  </div>
                  <div>
                    <span className="text-3xs text-slate-400 block">Academic Session & Batch:</span>
                    <strong className="text-slate-900">{viewCourseDossier.academicSession} • {viewCourseDossier.batch}</strong>
                  </div>
                </div>
              </div>

              {/* 3. Workload Ceiling Details */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-xs">Instructor Total Registered Workload</span>
                  <span className="font-mono font-black text-emerald-900 text-sm">
                    {viewCourseDossier.totalTeacherCredits} / {viewCourseDossier.creditLimit} Cr
                  </span>
                </div>
                <div className="w-full bg-emerald-200/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#1E7B4E] h-full"
                    style={{
                      width: `${Math.min(100, Math.round((viewCourseDossier.totalTeacherCredits / viewCourseDossier.creditLimit) * 100))}%`
                    }}
                  />
                </div>
                <p className="text-3xs text-emerald-800">
                  {viewCourseDossier.teacherType === 'REGULAR_TEACHER'
                    ? 'Regular Faculty maximum workload ceiling is 22 credit hours.'
                    : 'Visiting Faculty maximum workload ceiling is 12 credit hours.'}
                </p>
              </div>

              {/* Rejection / Note if applicable */}
              {viewCourseDossier.rejectionReason && (
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
                  <span className="text-3xs font-extrabold uppercase text-rose-900">HOD Review Feedback</span>
                  <p className="text-xs text-rose-800 font-medium">"{viewCourseDossier.rejectionReason}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-3xs text-slate-400 font-mono">
                Submitted: {viewCourseDossier.submittedAt ? new Date(viewCourseDossier.submittedAt).toLocaleDateString() : 'Active'}
              </span>
              <button
                onClick={() => setViewCourseDossier(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
