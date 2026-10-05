import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCFMS } from '../../context/CFMSContext';
import {
  User, Phone, Building2, CheckCircle2, ChevronRight, ChevronLeft,
  Send, AlertCircle, Sparkles, School, GraduationCap, ShieldCheck,
  Check, Mail, Calendar, ArrowRight, Clock
} from 'lucide-react';

interface TeacherProfileFormProps {
  onNavigate?: (module: string) => void;
  onSuccess?: () => void;
}

const inputCls = "w-full px-4 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white text-slate-800 placeholder-slate-400 transition-all font-medium";
const selectCls = "w-full px-4 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white text-slate-800 transition-all font-medium appearance-none cursor-pointer";

export const TeacherProfileForm: React.FC<TeacherProfileFormProps> = ({ onNavigate, onSuccess }) => {
  const { currentUser, submitTeacherEnrollment, updateCurrentUserProfile } = useAuth();
  const { departments, campuses, hodAssignments } = useCFMS();

  // Step 0: Personal Information, Step 1: Teacher & Department Information
  const [currentStep, setCurrentStep] = useState<0 | 1>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingStep1, setIsSavingStep1] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [routedHODName, setRoutedHODName] = useState('');

  // ─── Step 1: Personal Information State ─────────────────────────────────────
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [email] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || (currentUser?.profileFormData as any)?.phone || '');
  const [teacherType, setTeacherType] = useState<'REGULAR_TEACHER' | 'VISITING_TEACHER'>(
    currentUser?.role === 'VISITING_TEACHER' ? 'VISITING_TEACHER' : 'REGULAR_TEACHER'
  );
  const [cnic, setCnic] = useState((currentUser?.profileFormData as any)?.cnic || '');
  const [gender, setGender] = useState((currentUser?.profileFormData as any)?.gender || 'Male');
  const [highestQualification, setHighestQualification] = useState(
    (currentUser?.profileFormData as any)?.highestQualification || 'MS / M.Phil'
  );

  // ─── Step 2: Teacher & Department Information State ─────────────────────────
  const [selectedCampusId, setSelectedCampusId] = useState<string>(
    currentUser?.campusId || (currentUser?.profileFormData as any)?.campusId || ''
  );
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    currentUser?.departmentId || (currentUser?.profileFormData as any)?.departmentId || ''
  );
  const [selectedHodId, setSelectedHodId] = useState<string>(
    currentUser?.hodId || (currentUser?.profileFormData as any)?.hodId || ''
  );
  const [sessionType, setSessionType] = useState<'Spring' | 'Fall'>('Spring');
  const [academicYear, setAcademicYear] = useState<string>('2026');

  // Hydrate from previous profile on reload
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !fullName) setFullName(currentUser.name);
      if (currentUser.phone && !phone) setPhone(currentUser.phone);
      if (currentUser.role === 'VISITING_TEACHER') setTeacherType('VISITING_TEACHER');
      const pData = currentUser.profileFormData as any;
      if (pData) {
        if (pData.phone && !phone) setPhone(pData.phone);
        if (pData.cnic && !cnic) setCnic(pData.cnic);
        if (pData.gender) setGender(pData.gender);
        if (pData.highestQualification) setHighestQualification(pData.highestQualification);
        if (pData.sessionType) setSessionType(pData.sessionType);
        if (pData.academicYear) setAcademicYear(pData.academicYear);
        if (pData.campusId && !selectedCampusId) setSelectedCampusId(pData.campusId);
        if (pData.departmentId && !selectedDeptId) setSelectedDeptId(pData.departmentId);
        if (pData.hodId && !selectedHodId) setSelectedHodId(pData.hodId);
      }
    }
  }, [currentUser]);

  // Pakistani CNIC Formatter: 12345-1234567-1
  const handleCnicChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    let formatted = digits;
    if (digits.length > 5 && digits.length <= 12) {
      formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
    } else if (digits.length > 12) {
      formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
    }
    setCnic(formatted);
    if (errors.cnic) setErrors(prev => ({ ...prev, cnic: '' }));
  };

  // Pakistani Phone Formatter: 0300-1234567
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    setPhone(formatted);
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  // ─── 3.1 & 3.2 Cascading Dependencies: Campus → Department → HOD ────────────
  // Selected Campus details
  const selectedCampus = useMemo(() => {
    return (campuses || []).find(
      c => c.id === selectedCampusId || c.name.toLowerCase() === selectedCampusId.toLowerCase()
    ) || null;
  }, [campuses, selectedCampusId]);

  // Available departments: strictly belong to selected Campus
  const availableDepartments = useMemo(() => {
    if (!selectedCampus) return [];
    return (departments || []).filter(d => {
      const matchId = d.campusId === selectedCampus.id;
      const matchName = d.campusName && d.campusName.toLowerCase() === selectedCampus.name.toLowerCase();
      return (matchId || matchName) && d.status !== 'Inactive';
    });
  }, [departments, selectedCampus]);

  // Selected Department details
  const selectedDept = useMemo(() => {
    return (departments || []).find(d => d.id === selectedDeptId) || null;
  }, [departments, selectedDeptId]);

  // Available HODs: strictly assigned by Admin to selected Department and Campus
  const availableHODs = useMemo(() => {
    if (!selectedDept || !selectedCampus) return [];

    const list: Array<{ id: string; name: string; email?: string; departmentName?: string }> = [];

    // 1. From HOD Assignments table
    (hodAssignments || []).forEach(h => {
      const matchDept =
        h.departmentId === selectedDept.id ||
        (h.departmentName && h.departmentName.toLowerCase() === selectedDept.name.toLowerCase());
      const matchCampus =
        !h.campusId ||
        h.campusId === selectedCampus.id ||
        (h.campusName && h.campusName.toLowerCase() === selectedCampus.name.toLowerCase());

      if (matchDept && matchCampus && h.status === 'Active') {
        if (!list.some(existing => existing.id === h.hodId)) {
          list.push({
            id: h.hodId,
            name: h.hodName,
            email: h.hodEmail,
            departmentName: h.departmentName || selectedDept.name
          });
        }
      }
    });

    // 2. From Department model hodName / hodId
    if (selectedDept.hodName && selectedDept.hodName !== 'Unassigned') {
      const deptHodId = selectedDept.hodId || `hod-${selectedDept.id}`;
      if (!list.some(existing => existing.id === deptHodId || existing.name.toLowerCase() === selectedDept.hodName.toLowerCase())) {
        list.push({
          id: deptHodId,
          name: selectedDept.hodName,
          email: 'hod@ue.edu.pk',
          departmentName: selectedDept.name
        });
      }
    }

    return list;
  }, [selectedDept, selectedCampus, hodAssignments]);

  // Auto-sync selected HOD when availableHODs changes
  useEffect(() => {
    if (availableHODs.length > 0) {
      if (!selectedHodId || !availableHODs.some(h => h.id === selectedHodId)) {
        setSelectedHodId(availableHODs[0].id);
      }
    } else {
      setSelectedHodId('');
    }
  }, [availableHODs]);

  // Currently active/selected HOD
  const assignedHOD = useMemo(() => {
    if (!availableHODs.length) return null;
    return availableHODs.find(h => h.id === selectedHodId) || availableHODs[0];
  }, [availableHODs, selectedHodId]);

  const handleCampusChange = (newCampusId: string) => {
    setSelectedCampusId(newCampusId);
    setSelectedDeptId('');
    setSelectedHodId('');
    setErrors(prev => ({ ...prev, campus: '', department: '', hod: '' }));
  };

  const handleDepartmentChange = (newDeptId: string) => {
    setSelectedDeptId(newDeptId);
    setSelectedHodId('');
    setErrors(prev => ({ ...prev, department: '', hod: '' }));
  };

  // ─── Step 1 Validation & Save to Database ───────────────────────────────────
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!phone.trim()) {
      errs.phone = 'Contact Number is required.';
    } else if (phone.replace(/\D/g, '').length < 11) {
      errs.phone = 'Please enter a valid 11-digit mobile number (e.g. 0300-1234567).';
    }
    if (!cnic.trim()) {
      errs.cnic = 'CNIC number is required.';
    } else if (cnic.replace(/\D/g, '').length < 13) {
      errs.cnic = 'Please enter a complete 13-digit CNIC (e.g. 12345-1234567-1).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep1 = async () => {
    if (!validateStep1()) return;

    setIsSavingStep1(true);
    try {
      const step1Payload = {
        name: fullName.trim(),
        phone: phone.trim(),
        role: teacherType,
        profileFormData: {
          ...(currentUser?.profileFormData || {}),
          name: fullName.trim(),
          phone: phone.trim(),
          cnic: cnic.trim(),
          gender,
          highestQualification,
          teacherType
        }
      };

      // Save to database so information persists upon reload
      if (currentUser?.id) {
        await fetch(`/api/users/${currentUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(step1Payload)
        });
        await updateCurrentUserProfile(step1Payload as any);
      }

      setCurrentStep(1);
    } catch {
      // Proceed even if server save had a transient error
      setCurrentStep(1);
    } finally {
      setIsSavingStep1(false);
    }
  };

  // ─── Step 2 Validation & Submission to HOD ──────────────────────────────────
  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!selectedCampusId || !selectedCampus) {
      errs.campus = 'Please select your campus.';
    }
    if (!selectedDeptId || !selectedDept) {
      errs.department = 'Please select your department.';
    }
    if (!selectedHodId || !assignedHOD) {
      errs.hod = 'Please select your Head of Department (HOD).';
    }
    if (!academicYear || !String(academicYear).trim()) {
      errs.academicYear = 'Academic Year / Session Year is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitRequest = async () => {
    if (!validateStep2()) return;
    if (!assignedHOD || !selectedCampus || !selectedDept) return;

    setIsSubmitting(true);
    try {
      const profileData = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        cnic: cnic.trim(),
        gender,
        highestQualification,
        campusId: selectedCampus.id,
        campusName: selectedCampus.name,
        departmentId: selectedDept.id,
        departmentName: selectedDept.name,
        hodId: assignedHOD.id,
        hodName: assignedHOD.name,
        sessionType,
        academicYear,
        academicSession: `${sessionType} ${academicYear}`
      };

      const result = await submitTeacherEnrollment(
        profileData,
        [], // No courses pre-selected; courses are added in Step 3 after HOD approval!
        0,
        teacherType,
        selectedDept.id,
        selectedDept.name,
        selectedCampus.name,
        assignedHOD.id,
        assignedHOD.name
      );

      if (result.success) {
        setRoutedHODName(assignedHOD.name);
        setSubmitSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        setErrors({ submit: result.error || 'Failed to submit registration request. Please try again.' });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'An error occurred during submission.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render Success Confirmation ────────────────────────────────────────────
  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-8">
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 sm:p-10 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-700 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              Request Submitted Successfully
            </span>
            <h2 className="text-2xl font-black text-slate-900 font-heading">
              Awaiting HOD Approval
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Your teacher profile and department details have been routed to <strong className="text-emerald-800">{routedHODName}</strong>, Head of Department ({selectedDept?.name}).
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-700">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Teacher Name:</span>
              <span className="font-bold text-slate-900">{fullName}</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Campus:</span>
              <span className="font-bold text-slate-900">{selectedCampus?.name}</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Department:</span>
              <span className="font-bold text-slate-900">{selectedDept?.name}</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
              <span className="text-slate-500 font-medium">Routed to HOD:</span>
              <span className="font-bold text-emerald-800">{routedHODName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Session & Academic Year:</span>
              <span className="font-bold text-slate-900">{sessionType} {academicYear}</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 text-left flex items-start gap-3">
            <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">What happens next?</p>
              <p className="text-emerald-800/90 leading-relaxed">
                As soon as the HOD approves your request, <strong>Step 3 — Course Assignment</strong> will unlock automatically. You will be able to assign individual courses for your specific batches and semesters and start submitting course files.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xs font-extrabold uppercase tracking-wider text-[#1E7B4E] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Official CFMS Faculty Onboarding
              </span>
              <span className="text-3xs font-mono text-slate-400">Step {currentStep + 1} of 2</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading mt-2">
              Teacher Profile & Department Form
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete your profile information and select your department to route your request to the HOD.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Step Progression Bar */}
        <div className="grid grid-cols-2 gap-3 pt-6">
          <button
            type="button"
            onClick={() => setCurrentStep(0)}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              currentStep === 0
                ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
              currentStep === 0 ? 'bg-[#1E7B4E] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              1
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">STEP 1</p>
              <p className="text-[11px] text-slate-500">Personal Information</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateStep1()) handleNextStep1();
            }}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
              currentStep === 1
                ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
              currentStep === 1 ? 'bg-[#1E7B4E] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              2
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">STEP 2</p>
              <p className="text-[11px] text-slate-500">Teacher & Department</p>
            </div>
          </button>
        </div>
      </div>

      {/* ─── STEP 1: PERSONAL INFORMATION ─────────────────────────────────────── */}
      {currentStep === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <User className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-heading">
                Step 1 — Personal Information
              </h2>
              <p className="text-xs text-slate-500">
                Please enter your personal details. This information will be saved to your profile record.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                }}
                placeholder="e.g. Dr. Muhammad Tariq"
                className={inputCls}
              />
              {errors.fullName && <p className="text-2xs text-rose-500 font-semibold">{errors.fullName}</p>}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Registered Email <span className="text-slate-400 font-normal">(Verified)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed font-medium pl-10"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Contact Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="0300-1234567"
                  className={`${inputCls} pl-10`}
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              {errors.phone && <p className="text-2xs text-rose-500 font-semibold">{errors.phone}</p>}
            </div>

            {/* Teacher Type */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Teacher Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTeacherType('REGULAR_TEACHER')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    teacherType === 'REGULAR_TEACHER'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-900">Regular Teacher</p>
                    <p className="text-[11px] text-slate-500">Permanent university faculty member</p>
                  </div>
                  {teacherType === 'REGULAR_TEACHER' && (
                    <div className="w-5 h-5 rounded-full bg-[#1E7B4E] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTeacherType('VISITING_TEACHER')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    teacherType === 'VISITING_TEACHER'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-black text-slate-900">Visiting Teacher</p>
                    <p className="text-[11px] text-slate-500">Adjunct / visiting faculty appointment</p>
                  </div>
                  {teacherType === 'VISITING_TEACHER' && (
                    <div className="w-5 h-5 rounded-full bg-[#1E7B4E] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* CNIC Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                CNIC Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={cnic}
                onChange={(e) => handleCnicChange(e.target.value)}
                placeholder="37101-1234567-1"
                className={inputCls}
              />
              {errors.cnic && <p className="text-2xs text-rose-500 font-semibold">{errors.cnic}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={selectCls}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Highest Qualification */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">Highest Qualification</label>
              <select
                value={highestQualification}
                onChange={(e) => setHighestQualification(e.target.value)}
                className={selectCls}
              >
                <option value="PhD (Doctor of Philosophy)">PhD (Doctor of Philosophy)</option>
                <option value="MS / M.Phil">MS / M.Phil</option>
                <option value="M.Sc / M.A / MBA">M.Sc / M.A / MBA</option>
                <option value="BS (4-Year Degree)">BS (4-Year Degree)</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleNextStep1}
              disabled={isSavingStep1}
              className="px-6 py-3 bg-[#1E7B4E] hover:bg-[#165534] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-950/20"
            >
              <span>{isSavingStep1 ? 'Saving...' : 'NEXT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: TEACHER & DEPARTMENT INFORMATION ─────────────────────────── */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-heading">
                Step 2 — Teacher & Department Information
              </h2>
              <p className="text-xs text-slate-500">
                Select your Campus, Department, and Academic Session. Your request will be routed directly to the assigned HOD.
              </p>
            </div>
          </div>

          {errors.submit && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* 3.1 Campus Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Campus <span className="text-rose-500">*</span>
              </label>
              <select
                id="teacher-form-campus"
                value={selectedCampusId}
                onChange={(e) => handleCampusChange(e.target.value)}
                className={selectCls}
              >
                <option value="">-- Select Campus --</option>
                {(campuses || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.campus && <p className="text-2xs text-rose-500 font-semibold">{errors.campus}</p>}
            </div>

            {/* 3.2 Department Selection (strictly belongs to selected campus) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Department <span className="text-rose-500">*</span>
                {!selectedCampus && <span className="text-slate-400 font-normal">(Please select a Campus first)</span>}
              </label>
              <select
                id="teacher-form-dept"
                value={selectedDeptId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                disabled={!selectedCampus}
                className={`${selectCls} ${!selectedCampus ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
              >
                <option value="">-- Select Department --</option>
                {availableDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
              {errors.department && <p className="text-2xs text-rose-500 font-semibold">{errors.department}</p>}
            </div>

            {/* 3.3 HOD (strictly same dropdown style as Campus and Department) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Head of Department (HOD) <span className="text-rose-500">*</span>
                {!selectedDept && <span className="text-slate-400 font-normal">(Please select a Department first)</span>}
              </label>
              <select
                id="teacher-form-hod"
                value={selectedHodId}
                onChange={(e) => {
                  setSelectedHodId(e.target.value);
                  if (errors.hod) setErrors(prev => ({ ...prev, hod: '' }));
                }}
                disabled={!selectedDept || availableHODs.length === 0}
                className={`${selectCls} ${!selectedDept || availableHODs.length === 0 ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {!selectedDept
                    ? '-- Select Department First --'
                    : availableHODs.length === 0
                    ? '-- No HOD Assigned to this Department --'
                    : '-- Select Head of Department (HOD) --'}
                </option>
                {availableHODs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} — Head of Department
                  </option>
                ))}
              </select>
              {errors.hod && <p className="text-2xs text-rose-500 font-semibold">{errors.hod}</p>}
              {selectedDept && availableHODs.length === 0 && (
                <p className="text-2xs text-amber-600 font-medium">
                  No HOD is currently assigned to {selectedDept.name} ({selectedCampus?.name}). Please contact Administrator.
                </p>
              )}
            </div>

            {/* 4. Session Selection: Session Type + Academic Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Session Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  Session Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSessionType('Spring')}
                    className={`py-3 px-4 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      sessionType === 'Spring'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Spring
                  </button>
                  <button
                    type="button"
                    onClick={() => setSessionType('Fall')}
                    className={`py-3 px-4 rounded-xl border text-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      sessionType === 'Fall'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    Fall
                  </button>
                </div>
              </div>

              {/* Academic Year / Session Year (Countable Number Stepper) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    Academic Year / Session Year <span className="text-rose-500">*</span>
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const yr = parseInt(academicYear) || 2026;
                      if (yr > 2020) setAcademicYear((yr - 1).toString());
                    }}
                    className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-lg cursor-pointer transition-all shrink-0"
                    title="Previous Year"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={2020}
                    max={2035}
                    step={1}
                    value={academicYear}
                    onChange={(e) => {
                      setAcademicYear(e.target.value);
                      if (errors.academicYear) setErrors(prev => ({ ...prev, academicYear: '' }));
                    }}
                    placeholder="e.g. 2026"
                    className={`${inputCls} text-center font-bold text-sm`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const yr = parseInt(academicYear) || 2026;
                      if (yr < 2035) setAcademicYear((yr + 1).toString());
                    }}
                    className="w-11 h-11 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-black text-lg cursor-pointer transition-all shrink-0"
                    title="Next Year"
                  >
                    +
                  </button>
                </div>
                {errors.academicYear && <p className="text-2xs text-rose-500 font-semibold">{errors.academicYear}</p>}
              </div>
            </div>

            {/* Request Summary Box */}
            {selectedCampus && selectedDept && assignedHOD && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-slate-700">
                <p className="font-bold text-slate-900 pb-1 border-b border-slate-200">
                  📋 Submission Summary
                </p>
                <div className="grid grid-cols-2 gap-2 text-2xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Campus:</span>
                    <span className="font-bold text-slate-800">{selectedCampus.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Department:</span>
                    <span className="font-bold text-slate-800">{selectedDept.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Department HOD:</span>
                    <span className="font-bold text-emerald-800">{assignedHOD.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Session Term:</span>
                    <span className="font-bold text-slate-800">{sessionType} {academicYear}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(0)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitRequest}
              disabled={isSubmitting || !assignedHOD}
              className="px-6 py-3 bg-[#1E7B4E] hover:bg-[#165534] text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-950/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Request...' : 'SUBMIT REQUEST'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
