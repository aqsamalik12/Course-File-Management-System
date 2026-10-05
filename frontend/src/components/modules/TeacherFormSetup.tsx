import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCFMS } from '../../context/CFMSContext';
import {
  GraduationCap,
  Building2,
  Layers,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  User,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';

interface TeacherFormSetupProps {
  onContinue?: () => void;
  isModal?: boolean;
  onCancel?: () => void;
}

export const TeacherFormSetup: React.FC<TeacherFormSetupProps> = ({
  onContinue,
  isModal = false,
  onCancel
}) => {
  const { currentUser } = useAuth();
  const {
    activeTeacherSetup,
    setActiveTeacherSetup,
    fetchMyAssignments
  } = useCFMS();

  const [isLoading, setIsLoading] = useState(true);
  const [departmentsTree, setDepartmentsTree] = useState<any[]>([]);
  const [hasAssignments, setHasAssignments] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cascading selections
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // Load authorized assignments from server
  const loadAssignments = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchMyAssignments(currentUser?.id);
      setHasAssignments(res.hasAssignments);
      setDepartmentsTree(res.departments);

      // Pre-select if existing activeTeacherSetup or single department
      if (activeTeacherSetup && res.departments.some((d: any) => d.id === activeTeacherSetup.departmentId)) {
        setSelectedDeptId(activeTeacherSetup.departmentId);
        const dept = res.departments.find((d: any) => d.id === activeTeacherSetup.departmentId);
        if (dept && dept.sections.some((s: any) => s.id === activeTeacherSetup.sectionId)) {
          setSelectedSectionId(activeTeacherSetup.sectionId);
          const sec = dept.sections.find((s: any) => s.id === activeTeacherSetup.sectionId);
          if (sec && sec.courses.some((c: any) => c.id === activeTeacherSetup.courseId)) {
            setSelectedCourseId(activeTeacherSetup.courseId);
          }
        }
      } else if (res.departments.length === 1) {
        const singleDept = res.departments[0];
        setSelectedDeptId(singleDept.id);
        if (singleDept.sections.length === 1) {
          const singleSec = singleDept.sections[0];
          setSelectedSectionId(singleSec.id);
          if (singleSec.courses.length === 1) {
            setSelectedCourseId(singleSec.courses[0].id);
          }
        }
      }
    } catch {
      setErrorMsg('Failed to load your authorized assignments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [currentUser?.id]);

  // Derived options based on selection hierarchy
  const currentDepartment = useMemo(() => {
    return departmentsTree.find((d) => d.id === selectedDeptId) || null;
  }, [departmentsTree, selectedDeptId]);

  const availableSections = useMemo(() => {
    if (!currentDepartment) return [];
    return currentDepartment.sections || [];
  }, [currentDepartment]);

  const currentSection = useMemo(() => {
    return availableSections.find((s: any) => s.id === selectedSectionId) || null;
  }, [availableSections, selectedSectionId]);

  const availableCourses = useMemo(() => {
    if (!currentSection) return [];
    return currentSection.courses || [];
  }, [currentSection]);

  const currentCourse = useMemo(() => {
    return availableCourses.find((c: any) => c.id === selectedCourseId) || null;
  }, [availableCourses, selectedCourseId]);

  // Handle Department change
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setSelectedSectionId('');
    setSelectedCourseId('');
    setErrorMsg(null);
  };

  // Handle Section change
  const handleSectionChange = (secId: string) => {
    setSelectedSectionId(secId);
    setSelectedCourseId('');
    setErrorMsg(null);
  };

  // Handle Course change
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setErrorMsg(null);
  };

  // Validate and submit selection
  const handleContinue = async () => {
    if (!selectedDeptId || !selectedSectionId || !selectedCourseId) {
      setErrorMsg('Please select Department, Section, and Course to proceed.');
      return;
    }

    if (!currentDepartment || !currentSection || !currentCourse) {
      setErrorMsg('Invalid selection. This Department, Section, or Course is not assigned to your account. Please select an authorized option.');
      return;
    }

    // Verify on server if available as dual-layer defense
    try {
      const res = await fetch('/api/teacher-assignments/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: currentUser?.id,
          departmentId: selectedDeptId,
          sectionId: selectedSectionId,
          courseId: selectedCourseId
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const text = await res.text();
        if (text && text.trim()) {
          const data = JSON.parse(text);
          if (data && (!data.success || !data.isValid)) {
            setErrorMsg(data.message || 'Invalid selection. This Department, Section, or Course is not assigned to your account. Please select an authorized option.');
            return;
          }
        }
      }
    } catch {
      // Offline fallback: local validation already passed
    }

    // Save valid setup in context & session
    setActiveTeacherSetup({
      departmentId: currentDepartment.id,
      departmentName: currentDepartment.name,
      sectionId: currentSection.id,
      sectionName: currentSection.name,
      courseId: currentCourse.id,
      courseCode: currentCourse.code,
      courseName: currentCourse.name,
      credits: currentCourse.credits || 3,
      hodId: currentDepartment.hodId || '',
      hodName: currentDepartment.hodName || 'Department HOD',
      campusId: currentDepartment.campusId,
      campusName: currentDepartment.campusName
    });

    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className={isModal ? "p-6" : "max-w-xl mx-auto my-8 p-4 sm:p-6"}>
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0c4727] to-[#125732] text-white p-6 sm:p-8">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Authorized Workflow Setup
            </span>
            <button
              onClick={loadAssignments}
              disabled={isLoading}
              title="Refresh authorized assignments"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-emerald-200 hover:text-white cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <h2 className="text-2xl font-black font-heading text-white tracking-tight">
            Teacher Form Setup
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
            Select your assigned Department, Section, and Course configured by the Administrator to access your course files and submission workflow.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Teacher Info Card */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-extrabold text-sm shadow-sm shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 font-medium">Logged-in Faculty Member</p>
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {currentUser?.name || 'Ahmed Khan'}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                {currentUser?.email} • {currentUser?.role === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-600 font-medium">Loading your authorized assignments from Admin...</p>
            </div>
          )}

          {/* No Assignments Warning */}
          {!isLoading && !hasAssignments && (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-left space-y-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                    No Assignments Found
                  </h4>
                  <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                    No Department, Section, or Course has been assigned to your account. Please contact the Administrator.
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-amber-200/80 text-[11px] text-amber-700">
                The administrator must assign you to a specific <strong>Department → Section → Course → HOD</strong> before you can proceed with the course workflow.
              </div>
            </div>
          )}

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 font-medium leading-relaxed">
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Dynamic Cascading Dropdowns */}
          {!isLoading && hasAssignments && (
            <div className="space-y-5">
              {/* 1. Department Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Department <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="teacher-setup-department"
                    value={selectedDeptId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full px-4 py-3 text-xs font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white text-slate-900 shadow-sm transition-all cursor-pointer"
                  >
                    <option value="">— Select Authorized Department —</option>
                    {departmentsTree.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.campusName || 'Attock Campus'})
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400">
                  Only departments assigned to your account by Admin appear here.
                </p>
              </div>

              {/* 2. Section Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Section <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="teacher-setup-section"
                    value={selectedSectionId}
                    onChange={(e) => handleSectionChange(e.target.value)}
                    disabled={!selectedDeptId || availableSections.length === 0}
                    className={`w-full px-4 py-3 text-xs font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm transition-all cursor-pointer ${
                      !selectedDeptId || availableSections.length === 0
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">
                      {!selectedDeptId
                        ? '— Please select Department first —'
                        : availableSections.length === 0
                        ? '— No Sections assigned for this Department —'
                        : '— Select Authorized Section —'}
                    </option>
                    {availableSections.map((sec: any) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400">
                  Only sections belonging to the selected department and assigned to you appear.
                </p>
              </div>

              {/* 3. Course Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Course <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="teacher-setup-course"
                    value={selectedCourseId}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    disabled={!selectedSectionId || availableCourses.length === 0}
                    className={`w-full px-4 py-3 text-xs font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm transition-all cursor-pointer ${
                      !selectedSectionId || availableCourses.length === 0
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="">
                      {!selectedSectionId
                        ? '— Please select Section first —'
                        : availableCourses.length === 0
                        ? '— No Courses assigned for this Section —'
                        : '— Select Authorized Course —'}
                    </option>
                    {availableCourses.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.code} – {c.name} ({c.credits} Credits)
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400">
                  Only courses belonging to the selected Department + Section assigned to you appear.
                </p>
              </div>

              {/* Department HOD Routing Preview Card */}
              {currentDepartment && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      HOD
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
                        Assigned Department Reviewer
                      </p>
                      <p className="font-bold text-slate-900 text-xs">
                        {currentDepartment.hodName || 'Assigned Department HOD'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-1 bg-white border border-emerald-300 text-emerald-800 font-bold rounded-md">
                    Direct Routing
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 flex items-center gap-3">
                {onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  id="teacher-setup-continue-btn"
                  type="button"
                  onClick={handleContinue}
                  disabled={!selectedDeptId || !selectedSectionId || !selectedCourseId}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
                    !selectedDeptId || !selectedSectionId || !selectedCourseId
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20 cursor-pointer'
                  }`}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
