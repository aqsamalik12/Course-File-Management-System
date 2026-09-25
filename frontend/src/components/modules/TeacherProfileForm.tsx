import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCFMS } from '../../context/CFMSContext';
import { SelectedCourseItem, TeacherProfileFormData } from '../../types';
import {
  User, Phone, BookOpen, Calendar, Building2,
  CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft,
  Send, GraduationCap, CreditCard, Search, Check,
  Briefcase, ShieldCheck, AlertCircle, Info, Sparkles
} from 'lucide-react';

const SESSIONS = [
  'Spring 2026', 'Fall 2025', 'Spring 2025', 'Fall 2024', 'Spring 2024'
];

const BATCHES = [
  '2023-2027', '2022-2026', '2021-2025', '2020-2024', '2024-2028'
];

const QUALIFICATIONS = [
  'PhD (Doctor of Philosophy)',
  'MS / M.Phil',
  'M.Sc / M.A / MBA',
  'B.Sc / B.A / BBA',
  'Other'
];

interface Step {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STEPS: Step[] = [
  { title: 'Personal Info', subtitle: 'Basic profile & contact', icon: User },
  { title: 'Teacher Type & Dept', subtitle: 'Faculty load & department', icon: Building2 },
  { title: 'Course Selection', subtitle: 'Select teaching courses', icon: BookOpen },
  { title: 'Credit Summary', subtitle: 'Review & credit check', icon: CreditCard },
  { title: 'Submit Request', subtitle: 'Route to Department HOD', icon: Send }
];

const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, required, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white text-slate-800 placeholder-slate-400 transition-all";
const selectCls = "w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white text-slate-800 transition-all appearance-none cursor-pointer";

interface TeacherProfileFormProps {
  onNavigate?: (module: string) => void;
  onSuccess?: () => void;
}

export const TeacherProfileForm: React.FC<TeacherProfileFormProps> = ({ onNavigate, onSuccess }) => {
  const { currentUser, submitTeacherEnrollment, addFormFilledLog } = useAuth();
  const { departments, courses } = useCFMS();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courseSearch, setCourseSearch] = useState('');
  const [submitError, setSubmitError] = useState('');

  // ─── Form State ─────────────────────────────────────────────────────────────
  const [teacherType, setTeacherType] = useState<'REGULAR_TEACHER' | 'VISITING_TEACHER'>('REGULAR_TEACHER');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourseItem[]>([]);

  const [form, setForm] = useState<Partial<TeacherProfileFormData>>({
    cnic: '',
    dob: '',
    gender: 'Male',
    phone: '',
    bloodGroup: 'B+',
    highestQualification: 'MS / M.Phil',
    specialization: 'Computer Science & Software',
    joiningDate: new Date().toISOString().split('T')[0],
    academicSession: 'Spring 2026',
    batch: '2023-2027',
    employmentType: 'Regular'
  });

  // Prefill existing user data if re-applying after rejection or updating
  useEffect(() => {
    if (currentUser?.profileFormData) {
      setForm((prev) => ({ ...prev, ...currentUser.profileFormData }));
    }
    if (currentUser?.role === 'VISITING_TEACHER') {
      setTeacherType('VISITING_TEACHER');
    }
    if (currentUser?.departmentId) {
      setSelectedDeptId(currentUser.departmentId);
    }
  }, [currentUser]);

  const setField = (field: keyof TeacherProfileFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Credit Limits ─────────────────────────────────────────────────────────
  const creditLimit = teacherType === 'REGULAR_TEACHER' ? 22 : 12;
  const totalCredits = useMemo(() => {
    return selectedCourses.reduce((sum, c) => sum + (c.creditHours || 0), 0);
  }, [selectedCourses]);
  const isCreditOverLimit = totalCredits > creditLimit;
  const remainingCredits = creditLimit - totalCredits;

  // Selected Department Details
  const selectedDept = useMemo(() => {
    return departments.find((d) => d.id === selectedDeptId);
  }, [departments, selectedDeptId]);

  // Courses available for the selected department
  const availableCourses = useMemo(() => {
    if (!selectedDeptId) return [];
    return courses.filter((c) => {
      if (c.departmentId && c.departmentId === selectedDeptId) return true;
      if (selectedDept && c.departmentName && c.departmentName.toLowerCase() === selectedDept.name.toLowerCase()) return true;
      return false;
    });
  }, [courses, selectedDeptId, selectedDept]);

  // Filtered courses by search query
  const filteredCourses = useMemo(() => {
    const q = courseSearch.trim().toLowerCase();
    if (!q) return availableCourses;
    return availableCourses.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q)
    );
  }, [availableCourses, courseSearch]);

  // Toggle course selection
  const handleToggleCourse = (course: any) => {
    const exists = selectedCourses.some((c) => c.courseId === course.id);
    if (exists) {
      setSelectedCourses((prev) => prev.filter((c) => c.courseId !== course.id));
    } else {
      const newItem: SelectedCourseItem = {
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        creditHours: course.creditHours || 3
      };
      setSelectedCourses((prev) => [...prev, newItem]);
    }
  };

  // ─── Step Validation ────────────────────────────────────────────────────────
  const validateCurrentStep = (): boolean => {
    const errs: Record<string, string> = {};

    // Step 0: Personal Info
    if (step === 0) {
      if (!form.cnic?.trim()) errs.cnic = 'CNIC is required';
      else if (!/^\d{5}-\d{7}-\d$/.test(form.cnic) && !/^\d{13}$/.test(form.cnic)) {
        errs.cnic = 'Enter valid 13-digit CNIC (e.g. 12345-1234567-1)';
      }
      if (!form.dob?.trim()) errs.dob = 'Date of birth is required';
      if (!form.phone?.trim()) errs.phone = 'Phone number is required';
      if (!form.highestQualification?.trim()) errs.highestQualification = 'Highest qualification is required';
      if (!form.specialization?.trim()) errs.specialization = 'Specialization field is required';
    }

    // Step 1: Teacher Type & Department
    if (step === 1) {
      if (!teacherType) errs.teacherType = 'Please select your Teacher Type';
      if (!selectedDeptId) errs.departmentId = 'Please select your academic department from the list';
    }

    // Step 2: Course Selection & Credit Limit
    if (step === 2) {
      if (selectedCourses.length === 0) {
        errs.courses = 'Please select at least one course that you will be teaching.';
      }
      if (isCreditOverLimit) {
        errs.credits = `Credit limit exceeded! ${teacherType === 'REGULAR_TEACHER' ? 'Regular Teacher' : 'Visiting Teacher'} maximum limit is ${creditLimit} credits. Current total is ${totalCredits} credits.`;
      }
    }

    // Step 3: Credit Summary & Review
    if (step === 3) {
      if (selectedCourses.length === 0) errs.courses = 'No courses selected';
      if (isCreditOverLimit) errs.credits = 'Credit limit exceeded';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  // ─── Final Submission ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    if (isCreditOverLimit) {
      setSubmitError(`Total credits (${totalCredits}) exceed maximum allowed (${creditLimit}) for ${teacherType === 'REGULAR_TEACHER' ? 'Regular' : 'Visiting'} teachers.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const deptName = selectedDept ? selectedDept.name : 'Academic Department';

    const fullProfileData: TeacherProfileFormData = {
      cnic: form.cnic || '',
      dob: form.dob || '',
      gender: form.gender || 'Male',
      phone: form.phone || '',
      bloodGroup: form.bloodGroup || 'B+',
      highestQualification: form.highestQualification || '',
      specialization: form.specialization || '',
      joiningDate: form.joiningDate || '',
      employmentType: teacherType === 'REGULAR_TEACHER' ? 'Regular' : 'Visiting',
      academicSession: form.academicSession || 'Spring 2026',
      batch: form.batch || '2023-2027',
      departmentId: selectedDeptId,
      departmentName: deptName,
      courseName: selectedCourses.map((c) => c.courseTitle).join(', '),
      courseCode: selectedCourses.map((c) => c.courseCode).join(', '),
      creditHours: String(totalCredits),
      submittedAt: new Date().toISOString()
    };

    const res = await submitTeacherEnrollment(
      fullProfileData,
      selectedCourses,
      totalCredits,
      teacherType,
      selectedDeptId,
      deptName
    );

    setIsSubmitting(false);

    if (res.success) {
      addFormFilledLog(currentUser.id);
      setSubmittedSuccess(true);
      if (onSuccess) onSuccess();
    } else {
      setSubmitError(res.error || 'Failed to submit registration request. Please check credit hours.');
    }
  };

  // ─── Render Success / Pending Screen ────────────────────────────────────────
  if (submittedSuccess || currentUser?.enrollmentStatus === 'PendingHODApproval') {
    return (
      <div className="flex items-center justify-center min-h-[65vh] p-4">
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 sm:p-10 max-w-lg w-full text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Pending Department HOD Approval
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
              Application Submitted!
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hello <strong className="text-emerald-700">{currentUser?.name}</strong>, your teacher registration request has been successfully created and automatically routed to the Head of Department.
            </p>
          </div>

          {/* Department & HOD Routing Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Selected Department:</span>
              <span className="font-bold text-slate-900">{selectedDept?.name || currentUser?.departmentName || 'Selected Department'}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Assigned HOD:</span>
              <span className="font-bold text-emerald-700">
                {selectedDept?.hodName ? `Prof. ${selectedDept.hodName}` : 'HOD Pending Assignment'}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Faculty Role:</span>
              <span className="font-bold text-slate-800">
                {teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty (Max 22 Cr)' : 'Visiting Faculty (Max 12 Cr)'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Total Teaching Credits:</span>
              <span className="font-black text-slate-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {totalCredits} Credit Hours
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 text-left flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Course File dashboard access will be unlocked immediately once your department HOD reviews and approves your course selection.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer text-xs shadow-md shadow-emerald-950/20"
            >
              Refresh Application Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-[#0F2D1F] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-700/40 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-extrabold uppercase tracking-wider bg-emerald-500/20 border border-emerald-400/40 text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Teacher Enrollment & Course Allotment Portal
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
            Complete Teacher Registration
          </h1>
          <p className="text-xs text-emerald-100/90 leading-relaxed max-w-xl">
            Welcome <strong className="text-white">{currentUser?.name}</strong>! Select your teacher classification, department, and course credit load. Your submission will automatically be routed to your department Head of Department (HOD) for official approval.
          </p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200 z-0 mx-8">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = idx === step;
            const isDone = idx < step;
            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    if (idx < step) setStep(idx);
                  }}
                  disabled={idx > step}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isActive
                      ? 'bg-white border-emerald-600 text-emerald-600 ring-4 ring-emerald-500/15 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                </button>
                <div className="text-center hidden sm:block">
                  <p className={`text-[11px] font-bold ${isActive ? 'text-emerald-800' : isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {s.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="font-extrabold text-slate-800">Step {step + 1} of {STEPS.length}:</span>{' '}
            <span className="text-emerald-700 font-bold">{STEPS[step].title}</span>
          </div>
          <span className="text-slate-400 text-[11px]">{STEPS[step].subtitle}</span>
        </div>
      </div>

      {/* Global Submit Error */}
      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Submission Blocked</p>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      {/* Form Content Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 0: Personal & Academic Info
           ══════════════════════════════════════════════════════════════════════ */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Personal & Academic Information
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify your identity credentials and contact information.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <input
                  type="text"
                  disabled
                  value={currentUser?.name || ''}
                  className={`${inputCls} bg-slate-50 text-slate-600 font-semibold cursor-not-allowed`}
                />
              </Field>

              <Field label="Official / Gmail Address" required>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className={`${inputCls} bg-slate-50 text-slate-600 font-semibold cursor-not-allowed`}
                />
              </Field>

              <Field label="National ID / CNIC" required>
                <input
                  type="text"
                  placeholder="e.g. 35201-1234567-1"
                  value={form.cnic || ''}
                  onChange={(e) => setField('cnic', e.target.value)}
                  className={inputCls}
                />
                {errors.cnic && <p className="text-rose-500 text-[11px] font-semibold">{errors.cnic}</p>}
              </Field>

              <Field label="Contact Phone Number" required>
                <input
                  type="text"
                  placeholder="e.g. 0300-1234567"
                  value={form.phone || ''}
                  onChange={(e) => setField('phone', e.target.value)}
                  className={inputCls}
                />
                {errors.phone && <p className="text-rose-500 text-[11px] font-semibold">{errors.phone}</p>}
              </Field>

              <Field label="Date of Birth" required>
                <input
                  type="date"
                  value={form.dob || ''}
                  onChange={(e) => setField('dob', e.target.value)}
                  className={inputCls}
                />
                {errors.dob && <p className="text-rose-500 text-[11px] font-semibold">{errors.dob}</p>}
              </Field>

              <Field label="Gender" required>
                <select
                  value={form.gender || 'Male'}
                  onChange={(e) => setField('gender', e.target.value)}
                  className={selectCls}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Field>

              <Field label="Blood Group">
                <select
                  value={form.bloodGroup || 'B+'}
                  onChange={(e) => setField('bloodGroup', e.target.value)}
                  className={selectCls}
                >
                  <option>A+</option><option>A-</option>
                  <option>B+</option><option>B-</option>
                  <option>AB+</option><option>AB-</option>
                  <option>O+</option><option>O-</option>
                </select>
              </Field>

              <Field label="Highest Academic Qualification" required>
                <select
                  value={form.highestQualification || 'MS / M.Phil'}
                  onChange={(e) => setField('highestQualification', e.target.value)}
                  className={selectCls}
                >
                  {QUALIFICATIONS.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                {errors.highestQualification && <p className="text-rose-500 text-[11px] font-semibold">{errors.highestQualification}</p>}
              </Field>

              <Field label="Subject Specialization" required>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence / Cloud Computing"
                  value={form.specialization || ''}
                  onChange={(e) => setField('specialization', e.target.value)}
                  className={inputCls}
                />
                {errors.specialization && <p className="text-rose-500 text-[11px] font-semibold">{errors.specialization}</p>}
              </Field>

              <Field label="Academic Session" required>
                <select
                  value={form.academicSession || 'Spring 2026'}
                  onChange={(e) => setField('academicSession', e.target.value)}
                  className={selectCls}
                >
                  {SESSIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 1: Teacher Type & Department Selection
           ══════════════════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                Select Teacher Type & Department
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Your teacher type determines your strict semester credit hour limit. Department selection determines which HOD receives your approval request.
              </p>
            </div>

            {/* Teacher Type Selection Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Teacher Classification <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Regular Teacher Card */}
                <div
                  onClick={() => setTeacherType('REGULAR_TEACHER')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    teacherType === 'REGULAR_TEACHER'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Regular Teacher
                      </span>
                      {teacherType === 'REGULAR_TEACHER' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">Permanent / Full-Time Faculty</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Assigned full academic teaching load across degree programs.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Max Credit Load:</span>
                    <span className="font-black text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      22 Credit Hours
                    </span>
                  </div>
                </div>

                {/* Visiting Teacher Card */}
                <div
                  onClick={() => setTeacherType('VISITING_TEACHER')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    teacherType === 'VISITING_TEACHER'
                      ? 'border-cyan-600 bg-cyan-50/50 shadow-sm ring-2 ring-cyan-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-800 bg-cyan-100 px-2.5 py-0.5 rounded-full">
                        Visiting Teacher
                      </span>
                      {teacherType === 'VISITING_TEACHER' && (
                        <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                      )}
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">Visiting / Adjunct Faculty</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Contractual semester appointments with focused course assignments.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-cyan-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Max Credit Load:</span>
                    <span className="font-black text-cyan-700 bg-white px-2 py-0.5 rounded border border-cyan-200">
                      12 Credit Hours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department Selection (Database Driven) */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                Academic Department <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-department"
                value={selectedDeptId}
                onChange={(e) => {
                  setSelectedDeptId(e.target.value);
                  setSelectedCourses([]); // reset selected courses when changing department
                }}
                className={`${selectCls} text-sm font-semibold`}
              >
                <option value="">-- Choose your Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code}) {d.hodName ? `• HOD: ${d.hodName}` : '• No HOD Assigned'}
                  </option>
                ))}
              </select>
              {errors.departmentId && <p className="text-rose-500 text-[11px] font-semibold">{errors.departmentId}</p>}

              {/* Automatic HOD Routing Banner */}
              {selectedDept && (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs space-y-1.5 animate-fade-in mt-3">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    Automatic HOD Routing Destination:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 pt-1">
                    <div>
                      <span className="text-slate-500 font-medium">Department:</span>{' '}
                      <span className="font-bold text-slate-900">{selectedDept.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Assigned HOD:</span>{' '}
                      {selectedDept.hodName ? (
                        <span className="font-bold text-emerald-700">Prof. {selectedDept.hodName}</span>
                      ) : (
                        <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          No HOD assigned (Admin will be notified)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 2: Course Selection & Credit Hour Validation
           ══════════════════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  Select Courses for {selectedDept?.name || 'Department'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pick the courses you will be teaching this semester.
                </p>
              </div>

              {/* Search Courses */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder="Search code or title..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Dynamic Credit Tracker Card */}
            <div className={`p-4 rounded-2xl border-2 transition-all ${
              isCreditOverLimit
                ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300/40'
                : 'bg-emerald-50 border-emerald-300'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Credit Hour Load Calculator
                    </span>
                    <span className="text-2xs font-extrabold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-800">
                      {teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Max Allowed: <strong>{creditLimit} Credit Hours</strong>
                  </p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-black ${isCreditOverLimit ? 'text-rose-700' : 'text-emerald-800'}`}>
                    {totalCredits}
                  </span>
                  <span className="text-xs font-bold text-slate-500">/ {creditLimit} Total Credits</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 space-y-1.5">
                <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCreditOverLimit ? 'bg-rose-600' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, (totalCredits / creditLimit) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-2xs font-bold">
                  <span className={isCreditOverLimit ? 'text-rose-600' : 'text-emerald-700'}>
                    {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
                  </span>
                  <span className={remainingCredits < 0 ? 'text-rose-600' : 'text-slate-600'}>
                    {remainingCredits >= 0
                      ? `${remainingCredits} credits remaining`
                      : `Exceeded by ${Math.abs(remainingCredits)} credits!`}
                  </span>
                </div>
              </div>

              {/* Error Alert if over limit */}
              {isCreditOverLimit && (
                <div className="mt-3 p-2.5 bg-rose-100/80 border border-rose-300 rounded-xl text-xs text-rose-900 font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>
                    Credit limit exceeded! You must deselect courses so total is ≤ {creditLimit} credits.
                  </span>
                </div>
              )}
            </div>

            {/* Courses List */}
            {errors.courses && (
              <p className="text-rose-500 text-xs font-bold">{errors.courses}</p>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Available Courses in {selectedDept?.name} ({availableCourses.length} Total):
              </label>

              {availableCourses.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-xs space-y-2">
                  <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold">No courses mapped to this department yet.</p>
                  <p className="text-2xs text-slate-400">Admin or Department HOD can create courses in Course Management.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                  {filteredCourses.map((c) => {
                    const isSelected = selectedCourses.some((sc) => sc.courseId === c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleToggleCourse(c)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-2xs font-mono font-bold text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                              {c.code}
                            </span>
                            <span className="text-2xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {c.creditHours || 3} Credits
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                            {c.title}
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 3: Summary & Pre-Submission Review
           ══════════════════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Pre-Submission Registration Review
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Carefully verify your details before submitting to the Department HOD.
              </p>
            </div>

            {/* Teacher Details Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Teacher Name:</span>
                <p className="font-bold text-slate-900">{currentUser?.name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Email Address:</span>
                <p className="font-bold text-slate-900">{currentUser?.email}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Teacher Type:</span>
                <p className="font-bold text-emerald-700">
                  {teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'} (Max {creditLimit} Cr)
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Department:</span>
                <p className="font-bold text-slate-900">{selectedDept?.name}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">CNIC:</span>
                <p className="font-bold text-slate-800">{form.cnic}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Contact Phone:</span>
                <p className="font-bold text-slate-800">{form.phone}</p>
              </div>
            </div>

            {/* Selected Courses Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Selected Courses ({selectedCourses.length}):</label>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Total: {totalCredits} Credits
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Course Code</th>
                      <th className="p-3">Course Title</th>
                      <th className="p-3 text-right">Credit Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedCourses.map((c, i) => (
                      <tr key={c.courseId} className="hover:bg-slate-50">
                        <td className="p-3 text-slate-400 font-mono">{i + 1}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">{c.courseCode}</td>
                        <td className="p-3 font-semibold text-slate-800">{c.courseTitle}</td>
                        <td className="p-3 text-right font-black text-slate-900">{c.creditHours} Cr</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50 font-bold">
                      <td colSpan={3} className="p-3 text-emerald-950 font-extrabold text-right">
                        Total Course Credits:
                      </td>
                      <td className="p-3 text-right font-black text-emerald-900 text-sm">
                        {totalCredits} / {creditLimit} Cr
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Validation confirmation */}
            {!isCreditOverLimit ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Credit Validation Passed:</strong> Total credits ({totalCredits}) are within the allowable limit of {creditLimit} for {teacherType === 'REGULAR_TEACHER' ? 'Regular' : 'Visiting'} teachers.
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-xs text-rose-900">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>
                  <strong>Credit Validation Failed:</strong> You have selected {totalCredits} credits, exceeding the {creditLimit} limit. Please go back to Step 3.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 4: Confirmation & HOD Dispatch
           ══════════════════════════════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-700">
              <Send className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                Ready to Submit Request
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                By submitting this form, your teaching registration will be created and routed directly to:
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-left space-y-1.5 mt-2">
                <p><strong>Department:</strong> {selectedDept?.name}</p>
                <p>
                  <strong>HOD In-Charge:</strong>{' '}
                  <span className="text-emerald-700 font-bold">
                    {selectedDept?.hodName ? `Prof. ${selectedDept.hodName}` : 'HOD Pending Assignment'}
                  </span>
                </p>
                <p><strong>Selected Courses:</strong> {selectedCourses.length} ({totalCredits} Credits)</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-left max-w-md mx-auto flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Once submitted, your account status will transition to <strong>Pending HOD Approval</strong>. You will not have access to the Course File Dashboard until your HOD approves the request.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || isSubmitting}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              step === 0 || isSubmitting
                ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={step === 2 && isCreditOverLimit}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950/20"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isCreditOverLimit}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/20"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Registration Request</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
