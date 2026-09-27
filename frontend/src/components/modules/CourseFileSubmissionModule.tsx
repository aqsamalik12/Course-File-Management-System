import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { OFFICIAL_COURSE_FILE_CHECKLIST, OfficialChecklistItem } from '../../data/mockData';
import {
  Upload,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileArchive,
  History,
  FileText,
  RotateCcw,
  MessageSquare,
  Building2,
  Check,
  Eye,
  Info,
  Printer,
  X,
  FileCheck2,
  AlertCircle,
  FileUp,
  Trash2,
  Lock,
  ChevronDown
} from 'lucide-react';

export interface SectionUploadState {
  srNo: number;
  id: string;
  name: string;
  content: string;
  description: string;
  mandatory: boolean;
  isApplicableOnly?: boolean;
  isNA?: boolean;
  file?: File | null;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
  verified: 'Yes' | 'None';
}

interface CourseFileSubmissionModuleProps {
  onNavigate?: (moduleName: string) => void;
}

export const CourseFileSubmissionModule: React.FC<CourseFileSubmissionModuleProps> = ({ onNavigate }) => {
  const { courseFiles, courses, submissionWindow, uploadCourseFile } = useCFMS();
  const { currentUser } = useAuth();

  const teacherName = currentUser?.name || 'Faculty Member';
  const myCourses = courses.filter(
    (c) =>
      c.assignedTeacherId === currentUser?.id ||
      (currentUser?.email && c.assignedTeacherId === currentUser?.email) ||
      c.assignedTeacherName === teacherName
  );
  const displayCourses = myCourses;

  const [selectedCourseId, setSelectedCourseId] = useState<string>(displayCourses[0]?.id || '');
  const selectedCourse = displayCourses.find((c) => c.id === selectedCourseId) || displayCourses[0];

  // Academic Term & Session State
  const [submissionBatch, setSubmissionBatch] = useState('2024');
  const [submissionSession, setSubmissionSession] = useState('2024–2025');
  const [submissionSemester, setSubmissionSemester] = useState('1st Semester');
  const [uploadNotes, setUploadNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Modals
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showIncompleteWarningModal, setShowIncompleteWarningModal] = useState(false);
  const [viewHistoryModal, setViewHistoryModal] = useState(false);

  // Lookup existing course file matching course + session + batch + semester
  const myFiles = courseFiles.filter(
    (f) => f.teacherId === currentUser?.id || f.teacherName === teacherName
  );

  const currentCourseFile = myFiles.find(
    (f) =>
      (f.courseCode === selectedCourse?.code || f.courseId === selectedCourse?.id) &&
      (!f.semester || f.semester === submissionSemester) &&
      (!f.session || f.session === submissionSession)
  ) || myFiles.find((f) => f.courseCode === selectedCourse?.code);

  // Initialize 15-Item Checklist State
  const [checklist, setChecklist] = useState<SectionUploadState[]>(() => {
    return OFFICIAL_COURSE_FILE_CHECKLIST.map((item) => ({
      srNo: item.srNo,
      id: item.id,
      name: item.name,
      content: item.content,
      description: item.description,
      mandatory: item.mandatory,
      isApplicableOnly: item.isApplicableOnly,
      isNA: item.isApplicableOnly ? false : undefined,
      verified: 'None'
    }));
  });

  // Re-hydrate checklist when selected course, session, or semester changes
  useEffect(() => {
    if (currentCourseFile?.templateData?.checklist && Array.isArray(currentCourseFile.templateData.checklist)) {
      const savedItems = currentCourseFile.templateData.checklist;
      setChecklist(
        OFFICIAL_COURSE_FILE_CHECKLIST.map((item) => {
          const found = savedItems.find((s: any) => s.srNo === item.srNo);
          if (found) {
            return {
              ...item,
              file: null,
              fileName: found.fileName,
              fileSize: found.fileSize,
              uploadedAt: found.uploadedAt,
              isNA: found.isNA ?? (item.isApplicableOnly ? false : undefined),
              verified: found.verified || 'None'
            };
          }
          return {
            ...item,
            file: null,
            isNA: item.isApplicableOnly ? false : undefined,
            verified: 'None'
          };
        })
      );
      if (currentCourseFile.remarks) {
        setUploadNotes(currentCourseFile.remarks.replace('Faculty Changelog: ', ''));
      }
    } else {
      // Clean default for new semester/session
      setChecklist(
        OFFICIAL_COURSE_FILE_CHECKLIST.map((item) => ({
          srNo: item.srNo,
          id: item.id,
          name: item.name,
          content: item.content,
          description: item.description,
          mandatory: item.mandatory,
          isApplicableOnly: item.isApplicableOnly,
          isNA: item.isApplicableOnly ? false : undefined,
          verified: 'None'
        }))
      );
      setUploadNotes('');
    }
  }, [selectedCourse?.code, submissionSemester, submissionSession, currentCourseFile?.id]);

  const showToast = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Handle single PDF file selection for an item
  const handleFileChange = (srNo: number, file: File | null) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Only PDF (.pdf) documents are accepted for course file verification.', 'error');
      return;
    }

    const fileSizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    const nowStr = new Date().toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    setChecklist((prev) =>
      prev.map((item) => {
        if (item.srNo === srNo) {
          return {
            ...item,
            file,
            fileName: file.name,
            fileSize: fileSizeStr,
            uploadedAt: nowStr,
            verified: 'Yes',
            isNA: false
          };
        }
        return item;
      })
    );

    showToast(`Uploaded document for Sr No ${srNo} (${file.name}). Verified: Yes!`, 'success');
  };

  // Handle removal of an uploaded file
  const handleRemoveFile = (srNo: number) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.srNo === srNo) {
          return {
            ...item,
            file: null,
            fileName: undefined,
            fileSize: undefined,
            uploadedAt: undefined,
            verified: 'None'
          };
        }
        return item;
      })
    );
  };

  // Handle "Theory-only / Not Applicable" toggle for items 10, 11, 12
  const handleToggleNA = (srNo: number, isChecked: boolean) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.srNo === srNo) {
          return {
            ...item,
            isNA: isChecked,
            file: isChecked ? null : item.file,
            fileName: isChecked ? undefined : item.fileName,
            fileSize: isChecked ? undefined : item.fileSize,
            verified: isChecked ? 'None' : (item.file || item.fileName ? 'Yes' : 'None')
          };
        }
        return item;
      })
    );
  };

  // Verification Gate Calculation
  // Mandatory items: Sr No 1–9, 13–15 -> MUST be 'Yes'
  // Optional items: Sr No 10–12 -> MUST be 'Yes' OR marked isNA === true
  const mandatoryItems = checklist.filter((i) => !i.isApplicableOnly);
  const optionalItems = checklist.filter((i) => i.isApplicableOnly);

  const missingMandatoryItems = mandatoryItems.filter((i) => i.verified !== 'Yes');
  const missingOptionalItems = optionalItems.filter((i) => !i.isNA && i.verified !== 'Yes');

  const allMandatoryVerified = missingMandatoryItems.length === 0 && missingOptionalItems.length === 0;

  const verifiedYesCount = checklist.filter((i) => i.verified === 'Yes').length;
  const naCount = checklist.filter((i) => i.isApplicableOnly && i.isNA).length;
  const progressPercent = Math.round(((verifiedYesCount + naCount) / 15) * 100);

  // Submission / Draft Handler
  const handleSaveOrSubmit = (targetStatus: 'Draft' | 'Submitted') => {
    if (!selectedCourse) {
      showToast('Please select an assigned course first.', 'warning');
      return;
    }

    if (targetStatus === 'Submitted' && !allMandatoryVerified) {
      setShowIncompleteWarningModal(true);
      return;
    }

    const versionNumber = currentCourseFile
      ? `v${(parseFloat(currentCourseFile.currentVersion.replace('v', '')) + (targetStatus === 'Submitted' ? 1.0 : 0.1)).toFixed(1)}`
      : 'v1.0';

    // Compile template data with 15-item checklist
    const serializableChecklist = checklist.map((item) => ({
      srNo: item.srNo,
      name: item.name,
      content: item.content,
      description: item.description,
      mandatory: item.mandatory,
      isApplicableOnly: item.isApplicableOnly,
      isNA: item.isNA,
      fileName: item.fileName,
      fileSize: item.fileSize,
      uploadedAt: item.uploadedAt,
      verified: item.verified
    }));

    uploadCourseFile({
      courseId: selectedCourse.id,
      courseCode: selectedCourse.code,
      courseTitle: selectedCourse.title,
      credits: selectedCourse.credits || 3,
      departmentId: currentUser?.departmentId || 'dept-1',
      departmentName: selectedCourse.departmentName || currentUser?.departmentName || 'Department of Computer Science',
      campusId: currentUser?.campusId,
      campusName: currentUser?.campus || currentUser?.campusName,
      hodId: currentUser?.hodId,
      hodName: currentUser?.hodName,
      batch: submissionBatch,
      session: submissionSession,
      semester: submissionSemester,
      teacherId: currentUser?.id || 'user-teacher',
      teacherName: teacherName,
      teacherRole: currentUser?.role || 'REGULAR_TEACHER',
      title: `${selectedCourse.code} Complete Course File (${submissionSession} - ${submissionSemester})`,
      category: 'Syllabus & Course Outline',
      currentVersion: versionNumber,
      fileType: 'PDF',
      fileSize: `${(verifiedYesCount * 1.5).toFixed(1)} MB`,
      fileUrl: '#',
      status: targetStatus,
      templateData: {
        checklist: serializableChecklist,
        totalItems: 15,
        verifiedYesCount,
        naCount,
        allMandatoryVerified,
        notes: uploadNotes,
        submittedTimestamp: new Date().toISOString()
      },
      remarks: uploadNotes
        ? `Faculty Changelog: ${uploadNotes}`
        : targetStatus === 'Draft'
        ? 'Draft saved by teacher with checklist.'
        : 'Submitted complete course file with all 15 checklist items verified for HOD approval.'
    });

    if (targetStatus === 'Draft') {
      showToast(`Course file draft saved for ${selectedCourse.code} (${verifiedYesCount} of 15 documents uploaded).`, 'success');
    } else {
      showToast(`Course file for ${selectedCourse.code} successfully submitted to your HOD with full verification!`, 'success');
      setShowVerificationModal(true);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* ─── Hero Header & Quick Controls ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              HEC & QEC Standard Verification
            </span>
            <span className="text-3xs text-slate-400 font-mono">Academic Term: {submissionSession}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Course File Submission & Verification Form
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload course file sections in PDF format according to the official 15-item departmental verification checklist.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowVerificationModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4 text-[#1E7B4E]" />
            <span>Check Verification Form</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveOrSubmit('Draft')}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* ─── Toast Notifications ─── */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xs animate-fade-in border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : toastMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ─── Course Selection & Session Config Bar ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <label className="text-2xs font-extrabold uppercase text-slate-600 tracking-wider">
            Select Assigned Course
          </label>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono text-slate-400">
              Assigned Courses: {displayCourses.length}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {displayCourses.map((c) => {
            const isSelected = selectedCourse?.id === c.id;
            const cFile = myFiles.find((f) => f.courseCode === c.code);
            const statusPill = cFile ? cFile.status : 'Not Uploaded';

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCourseId(c.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-emerald-50/80 border-[#1E7B4E] ring-2 ring-[#1E7B4E]/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-[#1E7B4E] bg-white px-2 py-0.5 rounded border border-emerald-200">
                    {c.code}
                  </span>
                  <span
                    className={`text-3xs font-bold px-2 py-0.5 rounded-full border ${
                      statusPill === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : statusPill === 'Submitted' || statusPill === 'In Review'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : statusPill === 'Returned for Revision' || statusPill === 'Revision Requested'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : statusPill === 'Draft'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {statusPill}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 line-clamp-1">{c.title}</h3>
                  <p className="text-3xs text-slate-500 mt-0.5">
                    {c.departmentName} • {c.credits} Credits
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Academic Session, Batch & Semester Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-2xs font-extrabold uppercase text-slate-600 tracking-wider mb-1">
              Batch *
            </label>
            <select
              value={submissionBatch}
              onChange={(e) => {
                setSubmissionBatch(e.target.value);
                setSubmissionSession(e.target.value === '2024' ? '2024–2025' : `${e.target.value}–${parseInt(e.target.value) + 1}`);
              }}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:bg-white outline-none cursor-pointer"
            >
              <option value="2024">Batch 2024</option>
              <option value="2025">Batch 2025</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-extrabold uppercase text-slate-600 tracking-wider mb-1">
              Academic Session *
            </label>
            <select
              value={submissionSession}
              onChange={(e) => setSubmissionSession(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:bg-white outline-none cursor-pointer"
            >
              <option value="2024–2025">Session 2024–2025</option>
              <option value="2025–2026">Session 2025–2026</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-extrabold uppercase text-slate-600 tracking-wider mb-1">
              Semester *
            </label>
            <select
              value={submissionSemester}
              onChange={(e) => setSubmissionSemester(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:bg-white outline-none cursor-pointer"
            >
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="3rd Semester">3rd Semester</option>
              <option value="4th Semester">4th Semester</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Real-Time Verification Progress & Gate Banner ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#1E7B4E]" />
              <span>Official 15-Item Verification Checklist Status</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Course file submission to HOD strictly requires all mandatory documents to be verified with "Yes".
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-xs font-mono font-extrabold text-[#1E7B4E]">
                {verifiedYesCount} / 15 Verified (Yes)
              </span>
              <span className="text-3xs text-slate-400 block font-mono">
                {naCount > 0 ? `${naCount} Marked N/A` : ''}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-emerald-800 text-sm font-mono">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              allMandatoryVerified ? 'bg-[#1E7B4E]' : 'bg-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Dynamic Gate Notice */}
        {allMandatoryVerified ? (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>
                All mandatory documents verified with "Yes"! The course file is eligible for immediate submission to your Head of Department.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleSaveOrSubmit('Submitted')}
              className="px-4 py-2 bg-[#1E7B4E] hover:bg-[#165534] text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Submit to HOD</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">HOD Submission Gate Locked: </span>
                <span>
                  {missingMandatoryItems.length} mandatory document(s) still missing (Sections:{' '}
                  {missingMandatoryItems.map((m) => `Sr ${m.srNo}`).join(', ')}).
                </span>
              </div>
            </div>
            <span className="text-3xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-1 rounded-md shrink-0">
              Draft Allowed Only
            </span>
          </div>
        )}
      </div>

      {/* ─── 15-Item PDF Upload Checklist Section ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider font-heading">
            Document Upload by Checklist (PDF Only)
          </h2>
          <span className="text-3xs text-slate-400 font-mono">
            Accepted Formats: .PDF (Up to 25 MB per section)
          </span>
        </div>

        <div className="space-y-3">
          {checklist.map((item) => {
            const isVerified = item.verified === 'Yes';
            const isNA = item.isApplicableOnly && item.isNA;

            return (
              <div
                key={item.srNo}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isVerified
                    ? 'bg-white border-emerald-200 hover:border-emerald-300 shadow-2xs'
                    : isNA
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-200 hover:border-amber-300 shadow-2xs'
                }`}
              >
                {/* Left: Sr No & Content Title */}
                <div className="flex items-start gap-3.5 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black font-mono text-xs shrink-0 border ${
                      isVerified
                        ? 'bg-emerald-50 text-[#1E7B4E] border-emerald-200'
                        : isNA
                        ? 'bg-slate-100 text-slate-500 border-slate-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {item.srNo}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-extrabold text-slate-900 leading-snug">
                        {item.content}
                      </h3>
                      {item.isApplicableOnly && (
                        <span className="text-3xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          (If applicable)
                        </span>
                      )}
                    </div>
                    <p className="text-3xs text-slate-500 leading-relaxed font-normal">
                      {item.description}
                    </p>

                    {/* Optional Item Toggle: Theory Course N/A */}
                    {item.isApplicableOnly && (
                      <label className="inline-flex items-center gap-2 mt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isNA || false}
                          onChange={(e) => handleToggleNA(item.srNo, e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#1E7B4E] rounded cursor-pointer"
                        />
                        <span className="text-3xs font-bold text-slate-600">
                          Theory course without lab/project (Mark as Not Applicable)
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                {/* Right: Upload Control & Verification Badge */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap justify-between md:justify-end">
                  {/* Uploaded File Info or Upload Button */}
                  {item.fileName ? (
                    <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200 p-2 px-3 rounded-xl">
                      <FileText className="w-4 h-4 text-[#1E7B4E] shrink-0" />
                      <div className="text-left">
                        <p className="text-2xs font-extrabold text-slate-900 truncate max-w-[160px]" title={item.fileName}>
                          {item.fileName}
                        </p>
                        <span className="text-3xs text-slate-500 font-mono">
                          {item.fileSize || 'PDF'} • {item.uploadedAt || 'Uploaded'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(item.srNo)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ml-1"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : isNA ? (
                    <div className="text-3xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
                      Excluded from Theory Course
                    </div>
                  ) : (
                    <div>
                      <label className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs">
                        <FileUp className="w-3.5 h-3.5 text-slate-600" />
                        <span>Upload PDF</span>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(e) => handleFileChange(item.srNo, e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {/* Verification Status Pill (Matches Image Table) */}
                  <div className="w-24 text-center">
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Yes</span>
                      </span>
                    ) : isNA ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        None
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        None
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Notes & Submission Changelog Box ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <label className="block text-2xs font-extrabold uppercase text-slate-600 tracking-wider">
          Submission Notes & Changelog (Optional)
        </label>
        <textarea
          rows={2}
          value={uploadNotes}
          onChange={(e) => setUploadNotes(e.target.value)}
          placeholder="e.g. Complete 15-item course file compiled for 1st Semester. All best, average, and worst graded samples included."
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
        />
      </div>

      {/* ─── Action Footer ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-3xs text-slate-400 block font-mono">Current File Status:</span>
          <span className="font-extrabold text-xs text-slate-800">
            {currentCourseFile ? currentCourseFile.status : 'Draft Not Saved'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowVerificationModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Preview Verification Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveOrSubmit('Draft')}
            className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl cursor-pointer shadow-2xs transition-all"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSaveOrSubmit('Submitted')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all ${
              allMandatoryVerified
                ? 'bg-[#1E7B4E] hover:bg-[#165534] text-white active:scale-[0.98]'
                : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
            }`}
          >
            {!allMandatoryVerified && <Lock className="w-3.5 h-3.5" />}
            {allMandatoryVerified && <Upload className="w-3.5 h-3.5" />}
            <span>Submit to HOD</span>
          </button>
        </div>
      </div>

      {/* ─── Modal 1: Official Verification Table Modal (Matches Paper Image) ─── */}
      {showVerificationModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl overflow-hidden flex flex-col my-6 max-h-[92vh]">
            {/* Modal Actions Header */}
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
              <div className="flex items-center gap-2">
                <span className="text-3xs font-mono font-extrabold uppercase text-[#1E7B4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Official Verification Review
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedCourse.code} — {submissionSession}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#1E7B4E] hover:bg-[#165534] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Form / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Form Content - Exact Replica of University Verification Sheet */}
            <div id="printable-verification-form" className="p-8 overflow-y-auto space-y-6 font-serif text-slate-900 bg-white">
              {/* Document Header */}
              <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
                <h2 className="text-xl font-black uppercase tracking-wider text-slate-900 font-sans">
                  UNIVERSITY OF EDUCATION, LAHORE
                </h2>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700 font-sans">
                  Quality Enhancement Cell (QEC) • Course File Verification Form
                </h3>
                <p className="text-xs text-slate-500 font-sans italic">
                  Course: {selectedCourse.code} — {selectedCourse.title} • Academic Session: {submissionSession}
                </p>
              </div>

              {/* Course & Faculty Meta Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 text-3xs uppercase block font-bold">Course Code & Title:</span>
                  <span className="font-extrabold text-slate-900">{selectedCourse.code} — {selectedCourse.title}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-3xs uppercase block font-bold">Instructor:</span>
                  <span className="font-extrabold text-slate-900">{teacherName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-3xs uppercase block font-bold">Department & Campus:</span>
                  <span className="font-extrabold text-slate-900">{selectedCourse.departmentName} • {currentUser?.campus || 'Attock'}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-3xs uppercase block font-bold">Session / Batch / Sem:</span>
                  <span className="font-extrabold text-slate-900">{submissionSession} • Batch {submissionBatch} • {submissionSemester}</span>
                </div>
              </div>

              {/* 15-Row Verification Table Matching Physical Form Exactly */}
              <div className="border border-slate-900 overflow-hidden font-sans">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 bg-slate-100">
                      <th className="py-2.5 px-3 font-black text-slate-900 w-16 border-r border-slate-900 text-center">
                        Sr No.
                      </th>
                      <th className="py-2.5 px-4 font-black text-slate-900 border-r border-slate-900">
                        Content
                      </th>
                      <th className="py-2.5 px-4 font-black text-slate-900 w-36 text-center">
                        Verified(Yes/No)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {checklist.map((item) => (
                      <tr key={item.srNo} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-800 border-r border-slate-900 text-center">
                          {item.srNo}.
                        </td>
                        <td className="py-2 px-4 text-slate-900 font-medium border-r border-slate-900 leading-snug">
                          <div>{item.content}</div>
                          {item.fileName && (
                            <span className="text-3xs font-mono text-slate-400 no-print">
                              [Attached: {item.fileName}]
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-center font-bold">
                          {item.verified === 'Yes' ? (
                            <span className="text-emerald-700 font-extrabold">Yes</span>
                          ) : (
                            <span className="text-slate-600 font-semibold">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Verification Policy Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-3xs font-sans text-slate-600 space-y-1">
                <p>
                  <strong>Note:</strong> Items marked <em>(If applicable)</em> (Sections 10, 11, and 12) may remain as <strong>None</strong> for courses that do not include project or laboratory coursework.
                </p>
                <p>
                  <strong>Verification Policy:</strong> All mandatory sections (1–9, 13–15) must be verified as <strong>Yes</strong> before the course file can be submitted to the Head of Department (HOD) for official approval.
                </p>
              </div>

              {/* Signatures Block */}
              <div className="pt-8 grid grid-cols-3 gap-6 font-sans text-xs text-center border-t border-slate-200">
                <div className="space-y-6">
                  <div className="border-b border-slate-400 w-3/4 mx-auto pb-1"></div>
                  <div>
                    <p className="font-bold text-slate-800">Course Instructor</p>
                    <p className="text-3xs text-slate-400">Signature & Date</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border-b border-slate-400 w-3/4 mx-auto pb-1"></div>
                  <div>
                    <p className="font-bold text-slate-800">Department Quality Audit</p>
                    <p className="text-3xs text-slate-400">Signature & Date</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border-b border-slate-400 w-3/4 mx-auto pb-1"></div>
                  <div>
                    <p className="font-bold text-slate-800">Head of Department (HOD)</p>
                    <p className="text-3xs text-slate-400">Approval Stamp & Date</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print">
              <span className="text-3xs text-slate-500 font-mono">
                {verifiedYesCount} / 15 Verified • Status: {allMandatoryVerified ? 'Ready for HOD Approval' : 'Incomplete / Draft'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowVerificationModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Form</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Incomplete Warning Modal (Strict HOD Gate) ─── */}
      {showIncompleteWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Cannot Submit to HOD Yet
              </h3>
              <p className="text-xs text-slate-600">
                According to university QEC policy, all mandatory documents must be uploaded and verified with "Yes" before submission to the Head of Department.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 block">Missing Documents:</span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {missingMandatoryItems.map((item) => (
                  <div key={item.srNo} className="flex items-center gap-2 text-2xs text-amber-800">
                    <span className="font-mono font-bold bg-amber-100 px-1.5 py-0.5 rounded text-3xs">
                      Sr {item.srNo}
                    </span>
                    <span className="truncate">{item.content}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-3xs text-slate-500 text-center">
              You can click <strong>Save Draft</strong> to keep your current progress, or upload the remaining documents to complete submission.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowIncompleteWarningModal(false);
                  handleSaveOrSubmit('Draft');
                }}
                className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => setShowIncompleteWarningModal(false)}
                className="flex-1 py-2 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl cursor-pointer shadow-xs"
              >
                Continue Uploading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
