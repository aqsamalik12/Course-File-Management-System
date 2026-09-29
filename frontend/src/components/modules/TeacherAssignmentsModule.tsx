import React, { useState, useMemo, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import {
  Users,
  Search,
  Filter,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  BookOpen,
  Layers,
  ShieldCheck,
  RefreshCw,
  X,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Calendar,
  Check
} from 'lucide-react';
import { TeacherAssignment } from '../../types';

export const TeacherAssignmentsModule: React.FC = () => {
  const {
    usersList,
    departments,
    courses,
    sections,
    teacherAssignments,
    createTeacherAssignment,
    updateTeacherAssignment,
    deleteTeacherAssignment,
    createSection,
    refreshTeacherAssignments,
    refreshSections
  } = useCFMS();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Loading & Alert feedback
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

  // Form State for Assign Teacher
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formDeptId, setFormDeptId] = useState('');
  const [formSectionId, setFormSectionId] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Form State for New Section
  const [newSectionDeptId, setNewSectionDeptId] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [isSubmittingSection, setIsSubmittingSection] = useState(false);

  useEffect(() => {
    refreshTeacherAssignments();
    refreshSections();
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
      const t = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshTeacherAssignments(), refreshSections()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter teachers only (regular or visiting)
  const teacherUsers = useMemo(() => {
    return (usersList || []).filter(
      (u) => u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER'
    );
  }, [usersList]);

  // Dynamic sections and courses for the assign modal
  const modalSections = useMemo(() => {
    if (!formDeptId) return [];
    return (sections || []).filter((s) => s.departmentId === formDeptId && s.status === 'Active');
  }, [sections, formDeptId]);

  const modalCourses = useMemo(() => {
    if (!formDeptId) return [];
    return (courses || []).filter(
      (c) => c.departmentId === formDeptId && (c.status === 'Active' || !c.status)
    );
  }, [courses, formDeptId]);

  // Selected Department details for preview
  const selectedDeptObj = useMemo(() => {
    return (departments || []).find((d) => d.id === formDeptId) || null;
  }, [departments, formDeptId]);

  const selectedTeacherObj = useMemo(() => {
    return teacherUsers.find((t) => t.id === formTeacherId) || null;
  }, [teacherUsers, formTeacherId]);

  const selectedSectionObj = useMemo(() => {
    return modalSections.find((s) => s.id === formSectionId) || null;
  }, [modalSections, formSectionId]);

  const selectedCourseObj = useMemo(() => {
    return modalCourses.find((c) => c.id === formCourseId) || null;
  }, [modalCourses, formCourseId]);

  // Filter assignments table
  const filteredAssignments = useMemo(() => {
    let list = teacherAssignments || [];

    if (deptFilter !== 'ALL') {
      list = list.filter((a) => a.departmentId === deptFilter);
    }

    if (statusFilter !== 'ALL') {
      const isActive = statusFilter === 'Active';
      list = list.filter((a) => a.active === isActive);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          (a.teacherName && a.teacherName.toLowerCase().includes(q)) ||
          (a.teacherEmail && a.teacherEmail.toLowerCase().includes(q)) ||
          (a.departmentName && a.departmentName.toLowerCase().includes(q)) ||
          (a.sectionName && a.sectionName.toLowerCase().includes(q)) ||
          (a.courseName && a.courseName.toLowerCase().includes(q)) ||
          (a.courseCode && a.courseCode.toLowerCase().includes(q)) ||
          (a.hodName && a.hodName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [teacherAssignments, deptFilter, statusFilter, search]);

  // Submit Assignment
  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeacherId || !formDeptId || !formSectionId || !formCourseId) {
      setErrorMsg('Please select Teacher, Department, Section, and Course.');
      return;
    }

    setIsSubmittingAssign(true);
    setErrorMsg(null);
    try {
      const res = await createTeacherAssignment({
        teacherId: formTeacherId,
        departmentId: formDeptId,
        sectionId: formSectionId,
        courseId: formCourseId
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setIsAssignModalOpen(false);
        setFormTeacherId('');
        setFormDeptId('');
        setFormSectionId('');
        setFormCourseId('');
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Failed to create assignment.');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Submit New Section
  const handleCreateSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionDeptId || !newSectionName.trim()) {
      setErrorMsg('Please select a Department and enter Section Name.');
      return;
    }

    setIsSubmittingSection(true);
    setErrorMsg(null);
    try {
      const res = await createSection({
        departmentId: newSectionDeptId,
        name: newSectionName.trim().toUpperCase(),
        status: 'Active'
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setNewSectionName('');
        setIsSectionModalOpen(false);
        // If assigning, auto-select newly created section if dept matches
        if (formDeptId === newSectionDeptId && res.data) {
          setFormSectionId(res.data.id);
        }
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg('Failed to create section.');
    } finally {
      setIsSubmittingSection(false);
    }
  };

  // Toggle Active/Inactive
  const handleToggleActive = async (assignment: TeacherAssignment) => {
    try {
      const newStatus = !assignment.active;
      const ok = await updateTeacherAssignment(assignment.id, { active: newStatus });
      if (ok) {
        setSuccessMsg(
          `Assignment ${newStatus ? 'activated' : 'deactivated'} for ${assignment.teacherName}. Available selections updated.`
        );
      } else {
        setErrorMsg('Failed to update assignment status.');
      }
    } catch {
      setErrorMsg('Error updating status.');
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove assignment for ${name}? The teacher will immediately lose access to this combination.`)) {
      return;
    }

    try {
      const ok = await deleteTeacherAssignment(id);
      if (ok) {
        setSuccessMsg('Assignment deleted successfully.');
      } else {
        setErrorMsg('Failed to delete assignment.');
      }
    } catch {
      setErrorMsg('Error deleting assignment.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Teacher Authorization & Assignment Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Admin controls teacher access: <strong>Teacher → Department → Section → Course → HOD</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setIsSectionModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Add Section</span>
          </button>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-emerald-950/20"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Teacher</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between animate-shake">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Teacher, Course, Section, Department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800"
          />
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800 font-medium cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {(departments || []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-800 font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive / Suspended</option>
          </select>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Teacher</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Section</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Department HOD</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No Teacher Assignments Found</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Click "+ Assign Teacher" above to create an assignment.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Teacher */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{a.teacherName}</div>
                      <div className="text-[11px] text-slate-500">{a.teacherEmail}</div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{a.departmentName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{a.campusName || 'Attock Campus'}</div>
                    </td>

                    {/* Section */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                        <Layers className="w-3 h-3 text-blue-600" />
                        {a.sectionName}
                      </span>
                    </td>

                    {/* Course */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{a.courseName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {a.courseCode} • {a.credits || 3} Credits
                      </div>
                    </td>

                    {/* HOD */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{a.hodName || 'Assigned HOD'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Routes requests here</div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(a)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                          a.active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                        title="Click to toggle assignment status"
                      >
                        {a.active ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3 h-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteAssignment(a.id, a.teacherName)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Assign Teacher (Teacher → Department → Section → Course → HOD)  */}
      {/* ========================================================================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-[#0c4727] to-[#125732] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                  Assign Teacher to Course
                </h3>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Teacher → Department → Section → Course → HOD
                </p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 text-xs">
              {/* 1. Teacher Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Select Teacher <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="">— Select Teacher —</option>
                  {teacherUsers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email}) – {t.role === 'REGULAR_TEACHER' ? 'Regular' : 'Visiting'}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Department Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  Select Department <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formDeptId}
                  onChange={(e) => {
                    setFormDeptId(e.target.value);
                    setFormSectionId('');
                    setFormCourseId('');
                  }}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="">— Select Department —</option>
                  {(departments || []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.campusName || 'Attock Campus'})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Section Selector */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    Select Section <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (formDeptId) setNewSectionDeptId(formDeptId);
                      setIsSectionModalOpen(true);
                    }}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Add Section
                  </button>
                </div>
                <select
                  value={formSectionId}
                  onChange={(e) => setFormSectionId(e.target.value)}
                  disabled={!formDeptId}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white text-slate-900 font-semibold cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formDeptId ? '— Select Department first —' : '— Select Section —'}
                  </option>
                  {modalSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Course Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                  Select Course <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formCourseId}
                  onChange={(e) => setFormCourseId(e.target.value)}
                  disabled={!formDeptId}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white text-slate-900 font-semibold cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formDeptId ? '— Select Department first —' : '— Select Course —'}
                  </option>
                  {modalCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} – {c.title} ({c.credits || 3} Credits)
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Preview Card */}
              {selectedDeptObj && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-[11px]">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Assignment Preview
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-slate-400">Teacher:</span>{' '}
                      <span className="font-bold text-slate-800">{selectedTeacherObj?.name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Department:</span>{' '}
                      <span className="font-bold text-slate-800">{selectedDeptObj?.name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Section:</span>{' '}
                      <span className="font-bold text-blue-700">{selectedSectionObj?.name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Course:</span>{' '}
                      <span className="font-bold text-emerald-700">{selectedCourseObj?.title || '—'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-700">
                    <span>Auto-Linked HOD:</span>
                    <span className="font-extrabold text-emerald-800">
                      {selectedDeptObj.hodName || 'Assigned Department HOD'}
                    </span>
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAssign}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold transition-all cursor-pointer shadow-md shadow-emerald-950/20"
                >
                  {isSubmittingAssign ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Create Section for Department                                   */}
      {/* ========================================================================= */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Add Department Section
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  e.g. BSCS-5A, BSCS-7A, BBA-3A, BSMath-5B
                </p>
              </div>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSectionSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Department</label>
                <select
                  value={newSectionDeptId}
                  onChange={(e) => setNewSectionDeptId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="">— Select Department —</option>
                  {(departments || []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Section Name</label>
                <input
                  type="text"
                  placeholder="e.g. BSCS-5A"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white text-slate-900 font-bold uppercase"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSection}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold transition-all cursor-pointer"
                >
                  {isSubmittingSection ? 'Creating...' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
