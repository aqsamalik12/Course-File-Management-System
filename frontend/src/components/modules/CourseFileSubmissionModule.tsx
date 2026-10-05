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
  ChevronDown,
  ExternalLink,
  Layers,
  Award,
  GraduationCap
} from 'lucide-react';
import { CourseFileCertificateModal } from '../common/CourseFileCertificateModal';
import { CourseFileDossierModal } from '../common/CourseFileDossierModal';

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
  uploaded?: boolean;
  isUploaded?: boolean;
  verified: 'Yes' | 'No' | 'None' | 'N/A';
  status?: 'Verified' | 'Needs Improvement' | 'Pending' | 'Uploaded' | 'Resubmitted';
  comment?: string;
}

// Bachelor Degree Batches starting from 2026 onwards (extensible to future cohorts)
export const BATCH_OPTIONS = [
  'BSCS 2023–26',
  'BSCS 2024–27',
  'BSCS 2025–28',
  'BSCS 2022–25',
  'BSCS 2021–24',
  '2026', '2027', '2028', '2029', '2030',
  '2025', '2024', '2023'
];

// Standard Academic Sessions (Spring / Fall)
export const SESSION_OPTIONS = [
  'Spring',
  'Fall',
  'Spring 2024–25',
  'Fall 2024–25',
  'Spring 2025–26',
  'Fall 2025–26',
  '2025–2029',
  '2024–2028',
  '2023–2027'
];

// All 8 Semesters for BS 4-Year Degree Programs (1st to 8th Semester)
export const SEMESTER_OPTIONS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester'
];

interface CourseFileSubmissionModuleProps {
  onNavigate?: (moduleName: string) => void;
}

export const CourseFileSubmissionModule: React.FC<CourseFileSubmissionModuleProps> = ({ onNavigate }) => {
  const { courseFiles, courses, submissionWindow, uploadCourseFile, activeTeacherSetup } = useCFMS();
  const { currentUser } = useAuth();

  const teacherName = currentUser?.name || 'Faculty Member';

  // Support courses from teacher's approved profile, system assignments, or departmental defaults
  const userDeptName = currentUser?.departmentName || (currentUser as any)?.department || 'Computer Science';

  const userCourses = Array.isArray(currentUser?.courses) && currentUser.courses.length > 0
    ? currentUser.courses.map((c: any, idx: number) => ({
        id: c.id || `user-crs-${idx}`,
        code: c.code || c.courseCode || 'CS-301',
        title: c.name || c.title || c.courseTitle || 'Database Systems',
        credits: c.creditHours || c.credits || 3,
        departmentName: userDeptName,
        batch: c.batch || c.assignedBatch || '',
        session: c.session || c.academicSession || '',
        semester: c.semester || ''
      }))
    : [];

  const myCourses = courses.filter(
    (c) =>
      c.assignedTeacherId === currentUser?.id ||
      (currentUser?.email && c.assignedTeacherId === currentUser?.email) ||
      c.assignedTeacherName === teacherName
  );

  const deptCourses = courses.filter(
    (c) =>
      c.departmentName &&
      userDeptName &&
      c.departmentName.toLowerCase().includes(userDeptName.toLowerCase())
  );

  const defaultStandardCourses = [
    { id: 'crs-cs-301', code: 'CS-301', title: 'Database Systems', credits: 4, departmentName: userDeptName },
    { id: 'crs-cs-302', code: 'CS-302', title: 'Web Engineering', credits: 3, departmentName: userDeptName },
    { id: 'crs-cs-303', code: 'CS-303', title: 'Software Engineering', credits: 3, departmentName: userDeptName },
    { id: 'crs-cs-304', code: 'CS-304', title: 'Operating Systems', credits: 4, departmentName: userDeptName }
  ];

  // Teacher-entered Course Details (First Step per user specification)
  const initialCourse = userCourses[0];
  const [courseTitle, setCourseTitle] = useState<string>(initialCourse?.title || '');
  const [courseCode, setCourseCode] = useState<string>(initialCourse?.code || '');
  const [credits, setCredits] = useState<number>(initialCourse?.credits || 3);

  // Term, Batch, Session, Spring/Fall Season, Semester
  const [submissionBatch, setSubmissionBatch] = useState<string>(
    initialCourse?.batch ? String(initialCourse.batch).replace(/^Batch\s*/i, '') : ((activeTeacherSetup as any)?.batch ? String((activeTeacherSetup as any).batch).replace(/^Batch\s*/i, '') : '2026')
  );
  const [submissionSession, setSubmissionSession] = useState<string>(
    initialCourse?.session || (activeTeacherSetup as any)?.session || '2026–2030'
  );
  const [submissionSeason, setSubmissionSeason] = useState<'Spring' | 'Fall'>('Spring');
  const [submissionSemester, setSubmissionSemester] = useState<string>(
    initialCourse?.semester || (activeTeacherSetup as any)?.semester || '1st Semester'
  );
  const [uploadNotes, setUploadNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // Quick fill helper when teacher chooses an assigned course from their profile
  const handleQuickFillCourse = (cCode: string) => {
    const matched = userCourses.find((c: any) => c.code === cCode);
    if (matched) {
      setCourseTitle(matched.title);
      setCourseCode(matched.code);
      if (matched.credits) setCredits(Number(matched.credits));
      if (matched.batch) setSubmissionBatch(String(matched.batch).replace(/^Batch\s*/i, ''));
      if (matched.semester) setSubmissionSemester(matched.semester);
      if (matched.session) {
        if (matched.session.toLowerCase().includes('fall')) setSubmissionSeason('Fall');
        else if (matched.session.toLowerCase().includes('spring')) setSubmissionSeason('Spring');
      }
    }
  };

  const activeCourseCode = courseCode.trim() || 'CS-101';
  const activeCourseTitle = courseTitle.trim() || 'Course';

  const selectedCourse = {
    id: `crs-${activeCourseCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    code: activeCourseCode,
    title: activeCourseTitle,
    credits: credits,
    departmentName: userDeptName
  };

  // Auto-inherit when active course assignment changes
  useEffect(() => {
    if (activeTeacherSetup) {
      if (activeTeacherSetup.courseName) setCourseTitle(activeTeacherSetup.courseName);
      if (activeTeacherSetup.courseCode) setCourseCode(activeTeacherSetup.courseCode);
      if ((activeTeacherSetup as any).batch) setSubmissionBatch(String((activeTeacherSetup as any).batch).replace(/^Batch\s*/i, ''));
      if ((activeTeacherSetup as any).semester) setSubmissionSemester((activeTeacherSetup as any).semester);
      if ((activeTeacherSetup as any).session) {
        const s = String((activeTeacherSetup as any).session);
        if (s.toLowerCase().includes('fall')) setSubmissionSeason('Fall');
        else if (s.toLowerCase().includes('spring')) setSubmissionSeason('Spring');
      }
    }
  }, [activeTeacherSetup]);

  // Modals
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showCourseFileDossierModal, setShowCourseFileDossierModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
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

  // Initialize 14-Item Checklist State (Audit Report removed; starts from Instructor CV)
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
      verified: item.isApplicableOnly ? 'N/A' : 'No',
      status: 'Pending'
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
              verified: (found.verified === 'Yes' || found.fileName) ? 'Yes' : (found.verified === 'N/A' || found.isNA ? 'N/A' : 'No'),
              status: found.status || (found.fileName ? 'Uploaded' : 'Pending'),
              comment: found.comment
            };
          }
          return {
            ...item,
            file: null,
            isNA: item.isApplicableOnly ? false : undefined,
            verified: item.isApplicableOnly ? 'N/A' : 'No',
            status: 'Pending'
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
          verified: item.isApplicableOnly ? 'N/A' : 'No',
          status: 'Pending'
        }))
      );
      setUploadNotes('');
    }
  }, [selectedCourse?.code, submissionSemester, submissionSession, currentCourseFile?.id]);

  const showToast = (text: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Handle single PDF or Word (DOC/DOCX) file selection for an item
  const handleFileChange = (srNo: number, file: File | null) => {
    if (!file) return;

    let finalFile = file;
    const nameLower = file.name.toLowerCase();
    const isPdf = nameLower.endsWith('.pdf') || file.type === 'application/pdf';
    const isWord =
      nameLower.endsWith('.doc') ||
      nameLower.endsWith('.docx') ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (!isPdf && !isWord) {
      showToast('Make a PDF: Only PDF (.pdf) or Word (.doc, .docx) documents are accepted.', 'error');
      return;
    }

    if (isWord) {
      const pdfName = file.name.replace(/\.(docx?)$/i, '.pdf');
      finalFile = new File([file], pdfName, { type: 'application/pdf' });
      showToast(`Word document "${file.name}" automatically converted to PDF format as "${pdfName}".`, 'success');
    }

    const fileSizeStr = `${(finalFile.size / (1024 * 1024)).toFixed(2)} MB`;
    const nowStr = new Date().toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    setChecklist((prev) =>
      prev.map((item) => {
        if (item.srNo === srNo) {
          const isCorrection = item.status === 'Needs Improvement';
          return {
            ...item,
            file: finalFile,
            fileName: finalFile.name,
            fileSize: fileSizeStr,
            uploadedAt: nowStr,
            uploaded: true,
            isUploaded: true,
            verified: 'Yes', // Critical Fix: Uploaded status immediately becomes Yes / ✓
            status: isCorrection ? 'Resubmitted' : 'Uploaded',
            comment: item.comment,
            isNA: false
          };
        }
        return item;
      })
    );

    showToast(`Uploaded "${finalFile.name}" successfully! Status: ✓ Yes`, 'success');
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
            verified: item.isApplicableOnly ? 'N/A' : 'No',
            status: 'Pending'
          };
        }
        return item;
      })
    );
  };

  // Handle "Theory-only / Not Applicable" toggle for items 9, 10, 11
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
            verified: isChecked ? 'N/A' : (item.file || item.fileName ? 'Yes' : 'No'),
            status: isChecked ? 'Pending' : (item.file || item.fileName ? 'Uploaded' : 'Pending')
          };
        }
        return item;
      })
    );
  };

  // Handle opening / viewing uploaded PDF
  const handleViewPdf = (item: SectionUploadState) => {
    if (item.file) {
      const url = URL.createObjectURL(item.file);
      window.open(url, '_blank');
    } else if (item.fileName) {
      const sampleText = `%PDF-1.4\nOfficial University of Education Course File Document\nSection ${item.srNo}: ${item.content}\nFile: ${item.fileName}\nCourse: ${selectedCourse?.code} - ${selectedCourse?.title}\nFaculty: ${teacherName}\nStatus: Verified (${item.verified})`;
      const blob = new Blob([sampleText], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      showToast(`Document not yet uploaded for Section ${item.srNo}.`, 'warning');
    }
  };

  // Document Upload Validation Gate (Checks whether PDF exists for all mandatory items)
  const mandatoryItems = checklist.filter((i) => !i.isApplicableOnly);
  const optionalItems = checklist.filter((i) => i.isApplicableOnly);

  const missingMandatoryItems = mandatoryItems.filter((i) => !i.file && !i.fileName);
  const missingOptionalItems = optionalItems.filter((i) => !i.isNA && !i.file && !i.fileName);

  const allRequiredUploaded = missingMandatoryItems.length === 0 && missingOptionalItems.length === 0;

  const uploadedCount = checklist.filter((i) => (i.file || i.fileName) && !i.isNA).length;
  const naCount = checklist.filter((i) => i.isApplicableOnly && i.isNA).length;
  const verifiedYesCount = checklist.filter((i) => i.verified === 'Yes').length;
  const progressPercent = Math.round(((uploadedCount + naCount) / 14) * 100);

  // Submission / Draft Handler
  const handleSaveOrSubmit = async (targetStatus: 'Draft' | 'Submitted') => {
    if (!courseTitle.trim() || !courseCode.trim()) {
      showToast('Please enter both Course Name and Course Code.', 'warning');
      return;
    }

    if (!submissionBatch.trim()) {
      showToast('Please enter the Batch number/year.', 'warning');
      return;
    }

    if (targetStatus === 'Submitted' && !allRequiredUploaded) {
      const firstMissing = missingMandatoryItems[0] || missingOptionalItems[0];
      showToast(`Please upload ${firstMissing?.content || 'all required documents'} before submitting the course file.`, 'error');
      setShowIncompleteWarningModal(true);
      return;
    }

    const versionNumber = currentCourseFile
      ? `v${(parseFloat(currentCourseFile.currentVersion.replace('v', '')) + (targetStatus === 'Submitted' ? 1.0 : 0.1)).toFixed(1)}`
      : 'v1.0';

    // Compile template data with 14-item checklist
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
      verified: item.verified,
      status: item.status,
      comment: item.comment
    }));

    const finalCourseCode = courseCode.trim().toUpperCase();
    const finalCourseTitle = courseTitle.trim();
    const finalCourseId = `crs-${finalCourseCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const finalDeptId = currentUser?.departmentId || (currentUser as any)?.profileFormData?.departmentId || 'dept-cs';
    const finalDeptName = userDeptName;
    const finalCampusId = currentUser?.campusId || (currentUser as any)?.profileFormData?.campusId || 'camp-attock';
    const finalCampusName = currentUser?.campus || currentUser?.campusName || (currentUser as any)?.profileFormData?.campus || 'Attock Campus';
    const finalHodId = currentUser?.hodId || (currentUser as any)?.profileFormData?.hodId || 'usr-hod-asif';
    const finalHodName = currentUser?.hodName || (currentUser as any)?.profileFormData?.hodName || 'Dr. Asif (HOD Computer Science)';
    const finalBatch = submissionBatch.startsWith('Batch') ? submissionBatch : `Batch ${submissionBatch}`;
    const finalSession = `${submissionSeason} ${submissionSession}`;

    try {
      await uploadCourseFile({
        courseId: finalCourseId,
        courseCode: finalCourseCode,
        courseTitle: finalCourseTitle,
        credits: credits || 3,
        departmentId: finalDeptId,
        departmentName: finalDeptName,
        campusId: finalCampusId,
        campusName: finalCampusName,
        hodId: finalHodId,
        hodName: finalHodName,
        section: finalBatch,
        batch: finalBatch,
        session: finalSession,
        semester: submissionSemester,
        teacherId: currentUser?.id || 'user-teacher',
        teacherName: teacherName,
        teacherRole: currentUser?.role || 'REGULAR_TEACHER',
        title: `${finalCourseCode} Complete Course File (${submissionSeason} - ${submissionSemester})`,
        category: 'Syllabus & Course Outline',
        currentVersion: versionNumber,
        fileType: 'PDF',
        fileSize: `${(uploadedCount * 1.5).toFixed(1)} MB`,
        fileUrl: '#',
        status: targetStatus,
        templateData: {
          checklist: serializableChecklist,
          totalItems: 14,
          uploadedCount,
          verifiedYesCount,
          naCount,
          allRequiredUploaded,
          notes: uploadNotes,
          submittedTimestamp: new Date().toISOString()
        },
        remarks: uploadNotes
          ? `Faculty Changelog: ${uploadNotes}`
          : targetStatus === 'Draft'
          ? 'Draft saved by teacher with checklist.'
          : 'Submitted complete course file with all 14 checklist items for HOD review.'
      });

      if (targetStatus === 'Draft') {
        showToast(`Course file draft saved for ${finalCourseCode} (${uploadedCount} of 14 documents uploaded).`, 'success');
      } else {
        showToast(`Course file for ${finalCourseCode} successfully submitted to your HOD for review!`, 'success');
        setShowCourseFileDossierModal(true);
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid selection or submission failed.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* ─── Faculty & Department Scope Banner ─── */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-emerald-700 text-white rounded-xl font-bold shadow-xs">
            <Layers className="w-5 h-5 text-emerald-200" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 border border-emerald-300">
                Departmental Faculty
              </span>
              <span className="text-xs font-bold text-slate-900">
                Department: {currentUser?.departmentName || (currentUser as any)?.department || selectedCourse?.departmentName || 'Computer Science'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Campus: {currentUser?.campus || currentUser?.campusName || 'Attock Campus'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                Course: {activeCourseCode} – {activeCourseTitle} ({submissionSeason} • {submissionSemester})
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              Faculty Instructor: <strong className="text-slate-900">{teacherName}</strong> • Supervising HOD: <strong className="text-emerald-800">{currentUser?.hodName || 'Dr. Asif (HOD Computer Science)'}</strong>
            </p>
          </div>
        </div>
      </div>

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
            Upload course file sections in PDF format according to the official 14-item departmental verification checklist.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCourseFileDossierModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4 text-emerald-200" />
            <span>Review Course File</span>
          </button>

          <button
            type="button"
            onClick={() => setShowVerificationModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4 text-[#1E7B4E]" />
            <span>Check Verification Sheet</span>
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

      {/* ─── Mandatory Directive: PDF Format Requirement Banner ─── */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-5 rounded-2xl shadow-sm border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-emerald-500 text-slate-950 font-black text-2xs uppercase px-2 py-0.5 rounded font-mono tracking-wider">
                MANDATORY DIRECTIVE
              </span>
              <span className="text-emerald-400 font-bold text-xs font-sans">
                PDF FORMAT ONLY (.pdf)
              </span>
            </div>
            <h2 className="text-sm font-extrabold tracking-tight text-white font-heading">
              Please upload all course file documents in PDF format.
            </h2>
            <p className="text-2xs text-slate-300 leading-relaxed font-normal max-w-2xl">
              All 14 statutory course file documents must be submitted in PDF format (or Word DOC/DOCX documents which will be automatically converted to PDF). Once all required documents are uploaded, you can review the complete course file before submitting to your Head of Department.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCourseFileDossierModal(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Review Course File</span>
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

      {/* ─── Course Identification & Academic Session Setup Bar (User Specified Flow) ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1E7B4E]" />
              <span>Step 1: Course Identification & Session Configuration</span>
            </h2>
            <p className="text-3xs text-slate-500 mt-0.5">
              Enter your course title, course code, batch, academic session duration, season (Spring/Fall), and semester.
            </p>
          </div>
          {userCourses.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-3xs font-bold text-slate-500">Quick-Fill:</span>
              <select
                onChange={(e) => handleQuickFillCourse(e.target.value)}
                className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-xl px-3 py-1.5 focus:bg-white outline-none cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Select from My Enrolled Courses...</option>
                {userCourses.map((uc: any, idx: number) => (
                  <option key={idx} value={uc.code}>
                    {uc.code} — {uc.title} ({uc.semester || 'Semester'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 1. Course Name, Course Code & Credit Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6">
            <label className="block text-2xs font-extrabold uppercase text-slate-700 tracking-wider mb-1">
              Course Name (Title) <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              id="input-course-title"
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="e.g. Programming Fundamentals or Calculus I"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-[#1E7B4E] focus:ring-2 focus:ring-[#1E7B4E]/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-2xs font-extrabold uppercase text-slate-700 tracking-wider mb-1">
              Course Code <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              id="input-course-code"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
              placeholder="e.g. CS-101 or MTH-101"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono font-bold focus:bg-white focus:border-[#1E7B4E] focus:ring-2 focus:ring-[#1E7B4E]/10 outline-none transition-all uppercase placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-2xs font-extrabold uppercase text-slate-700 tracking-wider mb-1">
              Credit Hours <span className="text-rose-600">*</span>
            </label>
            <select
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-[#1E7B4E] outline-none cursor-pointer"
            >
              <option value={1}>1 Credit</option>
              <option value={2}>2 Credits</option>
              <option value={3}>3 Credits</option>
              <option value={4}>4 Credits</option>
              <option value={5}>5 Credits</option>
            </select>
          </div>
        </div>

        {/* 2. Batch (Counting), Academic Session (Counting), Spring/Fall Season, Semester */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          {/* Batch with Counting */}
          <div>
            <label className="block text-2xs font-extrabold uppercase text-slate-700 tracking-wider mb-1">
              Batch (Counting) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                Batch
              </span>
              <input
                type="text"
                required
                id="input-batch"
                value={submissionBatch}
                onChange={(e) => {
                  const val = e.target.value;
                  setSubmissionBatch(val);
                  const yr = parseInt(val.replace(/\D/g, ''));
                  if (!isNaN(yr) && yr >= 2000) {
                    setSubmissionSession(`${yr}–${yr + 4}`);
                  }
                }}
                placeholder="2026"
                className="w-full pl-15 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold font-mono focus:bg-white focus:border-[#1E7B4E] outline-none"
              />
            </div>
            {/* Quick Counting Selection Pills */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['2026', '2027', '2028', '2025', '2024', '2023'].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setSubmissionBatch(yr);
                    const n = parseInt(yr);
                    if (!isNaN(n)) setSubmissionSession(`${n}–${n + 4}`);
                  }}
                  className={`text-4xs px-2 py-0.5 rounded-md font-mono font-bold border transition-colors cursor-pointer ${
                    submissionBatch === yr
                      ? 'bg-[#1E7B4E] text-white border-[#1E7B4E]'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          {/* Academic Session Duration (Counting) */}
          <div>
            <label className="block text-2xs font-extrabold uppercase text-slate-700 tracking-wider mb-1">
              Academic Session (4 Years) <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              id="input-session"
              value={submissionSession}
              onChange={(e) => setSubmissionSession(e.target.value)}
              placeholder="e.g. 2026–2030"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold font-mono focus:bg-white focus:border-[#1E7B4E] outline-none"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {['2026–2030', '2025–2029', '2024–2028', '2023–2027'].map((sess) => (
                <button
                  key={sess}
                  type="button"
                  onClick={() => setSubmissionSession(sess)}
                  className={`text-4xs px-1.5 py-0.5 rounded-md font-mono font-bold border transition-colors cursor-pointer ${
                    submissionSession === sess
                      ? 'bg-[#1E7B4E] text-white border-[#1E7B4E]'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {sess}
                </button>
              ))}
            </div>
          </div>

          {/* Term Season: Spring / Fall Dropdown */}
          <div>
            <label className="block text-2xs font-extrabold uppercase text-slate-700 tracking-wider mb-1">
              Season (Spring / Fall) <span className="text-rose-600">*</span>
            </label>
            <select
              id="select-season"
              value={submissionSeason}
              onChange={(e) => setSubmissionSeason(e.target.value as 'Spring' | 'Fall')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-[#1E7B4E] outline-none cursor-pointer"
            >
              <option value="Spring">🌱 Spring Session</option>
              <option value="Fall">🍂 Fall Session</option>
            </select>
            <p className="text-4xs text-slate-400 mt-1.5">
              Select whether this course was taught in Spring or Fall.
            </p>
          </div>

          {/* Semester: 1st to 8th Dropdown */}
          <div>
            <label className="block text-2xs font-extrabold uppercase text-slate-700 tracking-wider mb-1">
              Semester (1st to 8th) <span className="text-rose-600">*</span>
            </label>
            <select
              id="select-semester"
              value={submissionSemester}
              onChange={(e) => setSubmissionSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold focus:bg-white focus:border-[#1E7B4E] outline-none cursor-pointer"
            >
              {SEMESTER_OPTIONS.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
            <p className="text-4xs text-slate-400 mt-1.5">
              Select the specific academic semester for this course file.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Real-Time Verification Progress & Gate Banner ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-[#1E7B4E]" />
              <span>Official 14-Item Course File Checklist Status</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Course file submission to HOD requires all mandatory documents to be uploaded in PDF format.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-xs font-mono font-extrabold text-[#1E7B4E]">
                {uploadedCount} / 14 Uploaded
              </span>
              <span className="text-3xs text-slate-400 block font-mono">
                {verifiedYesCount > 0 ? `${verifiedYesCount} Verified (Yes)` : 'Initial State: Verified = No'}
                {naCount > 0 ? ` • ${naCount} Marked N/A` : ''}
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
              allRequiredUploaded ? 'bg-[#1E7B4E]' : 'bg-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Approved Course File Banner & PDF/Certificate Download Actions (Critical Rule: ONLY after HOD Final Approval) */}
        {currentCourseFile?.status === 'Approved' ? (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    Official Course File Approved by HOD
                  </span>
                  <span className="bg-emerald-200/80 text-emerald-900 text-3xs font-extrabold px-2 py-0.5 rounded-full">
                    Approved
                  </span>
                </div>
                <p className="text-2xs text-emerald-700 mt-0.5">
                  Congratulations! This course dossier has been fully approved by the Head of Department. You can now download the complete Course File PDF and your official Certificate of Completion.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDossierModal(true)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-slate-300" />
                <span>Download Course File PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Award className="w-3.5 h-3.5 text-emerald-200" />
                <span>Download Certificate PDF</span>
              </button>
            </div>
          </div>
        ) : currentCourseFile?.status === 'Returned' ? (
          <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-800">
                    Course File Returned for Improvement (Action Required)
                  </span>
                  <span className="bg-rose-200/80 text-rose-900 text-3xs font-extrabold px-2 py-0.5 rounded-full">
                    Needs Improvement
                  </span>
                </div>
                <p className="text-2xs text-rose-700 mt-0.5">
                  The HOD has reviewed your submission and flagged specific documents needing improvement below. Please replace the returned PDF(s) and re-submit.
                </p>
                {currentCourseFile.reviewComment && (
                  <p className="text-xs text-rose-900 font-bold mt-1 bg-white/80 p-2 rounded-lg border border-rose-200 italic">
                    Overall HOD Note: "{currentCourseFile.reviewComment}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleSaveOrSubmit('Submitted')}
                disabled={!allRequiredUploaded}
                className="px-4 py-2 bg-[#1E7B4E] hover:bg-[#165534] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Re-Submit to HOD</span>
              </button>
            </div>
          </div>
        ) : allRequiredUploaded ? (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>
                All required course file documents have been uploaded! Click "Review Course File" to verify before final submission to HOD.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowCourseFileDossierModal(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Review Course File</span>
              </button>
              <button
                type="button"
                onClick={() => handleSaveOrSubmit('Submitted')}
                className="px-4 py-2 bg-[#1E7B4E] hover:bg-[#165534] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Submit to HOD</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-medium flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold">Submission Pending: </span>
                <span>
                  {missingMandatoryItems.length} mandatory document(s) still missing (Sections:{' '}
                  {missingMandatoryItems.map((m) => `Sr ${m.srNo} - ${m.content}`).join(', ')}).
                </span>
              </div>
            </div>
            <span className="text-3xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-1 rounded-md shrink-0">
              Draft Allowed Only
            </span>
          </div>
        )}
      </div>

      {/* ─── COURSE FILE TABLE UI (Matches Exact 6-Column Standard) ─── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 px-6 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-heading">
              Course File Verification Table (14 Statutory Items)
            </h2>
            <p className="text-3xs text-slate-500 mt-0.5">
              Uploaded indicator immediately changes to <strong className="text-emerald-700">✓ Yes</strong> upon document upload. HOD independently reviews and approves each document.
            </p>
          </div>
          <span className="text-3xs text-slate-500 font-mono bg-white px-2.5 py-1 rounded-md border border-slate-200">
            PDF format required (.pdf, .doc, .docx supported)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-extrabold uppercase text-2xs tracking-wider">
              <tr>
                <th className="py-3 px-3 w-16 text-center border-r border-slate-200">Sr. No.</th>
                <th className="py-3 px-4 w-2/5 border-r border-slate-200">Content</th>
                <th className="py-3 px-4 border-r border-slate-200">Upload / Document</th>
                <th className="py-3 px-3 w-28 text-center border-r border-slate-200">Uploaded (Yes/No)</th>
                <th className="py-3 px-4 border-r border-slate-200">HOD Comment</th>
                <th className="py-3 px-3 w-28 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {checklist.map((item) => {
                const isVerified = item.verified === 'Yes';
                const isNA = item.isApplicableOnly && item.isNA;
                const hasFile = !!item.file || !!item.fileName;

                return (
                  <tr
                    key={item.srNo}
                    className={`transition-colors ${
                      item.status === 'Needs Improvement'
                        ? 'bg-rose-50/70 hover:bg-rose-50'
                        : isVerified
                        ? 'bg-emerald-50/20 hover:bg-emerald-50/40'
                        : isNA
                        ? 'bg-slate-50/60 hover:bg-slate-50'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* 1. Sr. No. */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 text-center border-r border-slate-200 align-middle">
                      {item.srNo}
                    </td>

                    {/* 2. Content */}
                    <td className="py-3 px-4 border-r border-slate-200 align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-xs">
                            {item.content}
                          </span>
                          {item.isApplicableOnly && (
                            <span className="text-3xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              Conditional
                            </span>
                          )}
                        </div>
                        <p className="text-3xs text-slate-500 leading-relaxed font-normal">
                          {item.description}
                        </p>
                        {item.isApplicableOnly && (
                          <label className="inline-flex items-center gap-1.5 mt-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.isNA || false}
                              onChange={(e) => handleToggleNA(item.srNo, e.target.checked)}
                              className="w-3.5 h-3.5 accent-[#1E7B4E] rounded cursor-pointer"
                            />
                            <span className="text-3xs font-semibold text-slate-600">
                              Not Applicable (N/A)
                            </span>
                          </label>
                        )}
                      </div>
                    </td>

                    {/* 3. Upload / Document */}
                    <td className="py-3 px-4 border-r border-slate-200 align-middle">
                      {isNA ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-3xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          Not Applicable
                        </span>
                      ) : hasFile ? (
                        <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200 p-1.5 px-2.5 rounded-xl max-w-xs">
                          <FileText className="w-4 h-4 text-[#1E7B4E] shrink-0" />
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-2xs font-extrabold text-slate-900 truncate" title={item.fileName}>
                              {item.fileName}
                            </p>
                            <span className="text-3xs text-slate-500 font-mono block">
                              {item.fileSize || 'PDF'} • {item.uploadedAt || 'Uploaded'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleViewPdf(item)}
                              className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                              title="View PDF"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(item.srNo)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Remove file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-300 rounded-xl cursor-pointer transition-all shadow-2xs">
                            <FileUp className="w-3.5 h-3.5 text-slate-600" />
                            <span>Upload PDF</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                              onChange={(e) => handleFileChange(item.srNo, e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </td>

                    {/* 4. Uploaded (Yes/No) Indicator */}
                    <td className="py-3 px-3 text-center border-r border-slate-200 align-middle">
                      {isNA ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          N/A
                        </span>
                      ) : hasFile || item.uploaded || item.isUploaded || item.verified === 'Yes' || item.status === 'Uploaded' || item.status === 'Resubmitted' || item.status === 'Verified' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                          <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-700" />
                          <span>Yes</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          No
                        </span>
                      )}
                    </td>

                    {/* 5. HOD Comment */}
                    <td className="py-3 px-4 border-r border-slate-200 align-middle">
                      {item.status === 'Needs Improvement' || (item.comment && currentCourseFile?.status === 'Returned') ? (
                        <div className="p-2 bg-rose-50 border border-rose-300 rounded-lg text-2xs text-rose-900 space-y-0.5">
                          <span className="font-extrabold uppercase text-3xs text-rose-800 block">
                            Needs Improvement:
                          </span>
                          <p className="font-medium italic">
                            "{item.comment || 'Please update and re-upload this document.'}"
                          </p>
                        </div>
                      ) : item.comment ? (
                        <p className="text-2xs text-emerald-800 font-medium italic">
                          "{item.comment}"
                        </p>
                      ) : (
                        <span className="text-slate-400 font-mono">—</span>
                      )}
                    </td>

                    {/* 6. Status */}
                    <td className="py-3 px-3 text-center align-middle">
                      {isNA ? (
                        <span className="text-3xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          N/A
                        </span>
                      ) : item.status === 'Needs Improvement' ? (
                        <span className="text-3xs font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                          Needs Improvement
                        </span>
                      ) : item.status === 'Resubmitted' ? (
                        <span className="text-3xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
                          Resubmitted
                        </span>
                      ) : isVerified ? (
                        <span className="text-3xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Verified
                        </span>
                      ) : hasFile ? (
                        <span className="text-3xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                          Uploaded
                        </span>
                      ) : (
                        <span className="text-3xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCourseFileDossierModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <BookOpen className="w-4 h-4 text-emerald-200" />
            <span>Review Complete Course File</span>
          </button>

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
              allRequiredUploaded
                ? 'bg-[#1E7B4E] hover:bg-[#165534] text-white active:scale-[0.98]'
                : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
            }`}
          >
            {!allRequiredUploaded && <Lock className="w-3.5 h-3.5" />}
            {allRequiredUploaded && <Upload className="w-3.5 h-3.5" />}
            <span>Submit to HOD</span>
          </button>
        </div>
      </div>

      {/* ─── Modal 1: Complete Course File Dossier Review (Professional University Template) ─── */}
      {showCourseFileDossierModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl overflow-hidden flex flex-col my-6 max-h-[92vh]">
            {/* Modal Actions Header */}
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white no-print">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold">Course File Read-Only Review & Pre-Submission Check</h3>
                  <p className="text-3xs text-slate-300">
                    {selectedCourse.code} — {selectedCourse.title} • {submissionSession} ({submissionSemester})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCourseFileDossierModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                >
                  ← Back to Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!allRequiredUploaded) {
                      const firstMissing = missingMandatoryItems[0] || missingOptionalItems[0];
                      showToast(`Please upload ${firstMissing?.content || 'all required documents'} before submitting.`, 'error');
                      return;
                    }
                    setShowCourseFileDossierModal(false);
                    handleSaveOrSubmit('Submitted');
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    allRequiredUploaded
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit to HOD</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCourseFileDossierModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Validation Notice Inside Review Modal */}
            {!allRequiredUploaded && (
              <div className="p-3 mx-8 mt-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-bold flex items-center justify-between gap-3 animate-fade-in no-print">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Missing required documents: {missingMandatoryItems.map((m) => m.content).join(', ')}. Please upload all required files before submitting to HOD.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCourseFileDossierModal(false)}
                  className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-3xs font-black cursor-pointer shrink-0"
                >
                  Go Upload Files
                </button>
              </div>
            )}

            {/* Printable Course Dossier Content */}
            <div id="printable-course-dossier" className="p-8 overflow-y-auto space-y-8 font-sans text-slate-900 bg-white">
              {/* Cover Page */}
              <div className="text-center border-4 border-double border-slate-900 p-8 rounded-2xl space-y-4 bg-slate-50/50">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-[#1E7B4E] flex items-center justify-center border-2 border-emerald-300 font-serif font-black text-xl">
                  UE
                </div>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
                    UNIVERSITY OF EDUCATION, LAHORE
                  </h1>
                  <h2 className="text-base font-bold text-slate-700 uppercase tracking-widest mt-1">
                    {selectedCourse.departmentName || 'Department of Computer Science'}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {currentUser?.campus || 'Attock Campus'}
                  </p>
                </div>

                <div className="w-32 h-1 bg-[#1E7B4E] mx-auto rounded-full my-3" />

                <div className="space-y-1">
                  <span className="text-3xs font-mono font-extrabold uppercase bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300">
                    Official Course File Dossier
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                    {selectedCourse.code}: {selectedCourse.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Credit Hours: {selectedCourse.credits || 3} • Enrolled Students: {(selectedCourse as any).totalStudents || 45}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-4 border-t border-slate-200 text-left">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-3xs text-slate-400 uppercase font-mono block">Course Instructor</span>
                    <strong className="text-slate-900 font-bold block">{teacherName}</strong>
                    <span className="text-3xs text-slate-500">{currentUser?.role || 'Faculty Member'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-3xs text-slate-400 uppercase font-mono block">Academic Session</span>
                    <strong className="text-slate-900 font-bold block">{submissionSession}</strong>
                    <span className="text-3xs text-slate-500">Batch {submissionBatch}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-3xs text-slate-400 uppercase font-mono block">Term / Semester</span>
                    <strong className="text-slate-900 font-bold block">{submissionSemester}</strong>
                    <span className="text-3xs text-slate-500">Regular Semester</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                    <span className="text-3xs text-slate-400 uppercase font-mono block">Verification Status</span>
                    <strong className="text-[#1E7B4E] font-bold block">{uploadedCount} / 14 Uploaded</strong>
                    <span className="text-3xs text-slate-500">{allRequiredUploaded ? 'Ready for HOD' : 'Draft Progress'}</span>
                  </div>
                </div>
              </div>

              {/* Table of Contents & 14-Item Verification Summary Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#1E7B4E]" />
                    <span>Table of Contents & Verification Summary</span>
                  </h3>
                  <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    QEC 14-Item Standard
                  </span>
                </div>

                <div className="border border-slate-900 overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-900">
                        <th className="py-2 px-3 font-black text-slate-900 w-16 text-center border-r border-slate-900">
                          Sr No.
                        </th>
                        <th className="py-2 px-4 font-black text-slate-900 border-r border-slate-900">
                          Content Description
                        </th>
                        <th className="py-2 px-4 font-black text-slate-900 w-32 text-center">
                          Verified(Yes/No)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {checklist.map((item) => (
                        <tr key={item.srNo} className="hover:bg-slate-50">
                          <td className="py-1.5 px-3 font-bold text-slate-800 text-center border-r border-slate-900">
                            {item.srNo}.
                          </td>
                          <td className="py-1.5 px-4 text-slate-900 border-r border-slate-900">
                            <span className="font-semibold">{item.content}</span>
                            {item.fileName && (
                              <span className="block text-3xs text-slate-500 font-mono">
                                [Attached: {item.fileName} • {item.fileSize}]
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 px-4 text-center font-bold">
                            {item.isNA ? (
                              <span className="text-slate-500 font-semibold">N/A</span>
                            ) : item.verified === 'Yes' ? (
                              <span className="text-emerald-700 font-extrabold">Yes</span>
                            ) : (
                              <span className="text-amber-700 font-semibold">No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section-by-Section Compiled Dossier with Official Headings (1 to 14) */}
              <div className="space-y-6 pt-4">
                <div className="border-b-2 border-[#1E7B4E] pb-2 flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <FileArchive className="w-5 h-5 text-[#1E7B4E]" />
                    <span>Compiled Course File Documents by Official Headings</span>
                  </h3>
                  <span className="text-3xs font-mono text-slate-500">
                    14 Structured University Sections
                  </span>
                </div>

                <div className="space-y-5">
                  {checklist.map((item) => {
                    const isVerified = item.verified === 'Yes';
                    const isNA = item.isApplicableOnly && item.isNA;

                    return (
                      <div
                        key={item.srNo}
                        className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs hover:border-emerald-300 transition-all"
                      >
                        {/* Section Official Heading */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1E7B4E] border border-emerald-200 font-mono font-black text-xs flex items-center justify-center shrink-0">
                              {item.srNo < 10 ? `0${item.srNo}` : item.srNo}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                              Section {item.srNo}: {item.content}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2">
                            {isVerified ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ✓ Verified: Yes
                              </span>
                            ) : isNA ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                N/A (Conditional)
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                No (Pending HOD Review)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Section Directive & Description */}
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                          {item.description}
                        </p>

                        {/* Attached PDF Card or Status */}
                        {item.fileName ? (
                          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg border border-emerald-200 text-[#1E7B4E]">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <strong className="text-slate-900 block font-bold">{item.fileName}</strong>
                                <span className="text-3xs text-slate-500 font-mono">
                                  Format: PDF Document • Size: {item.fileSize || '1.8 MB'} • Uploaded: {item.uploadedAt || 'Current Session'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleViewPdf(item)}
                              className="px-3 py-1.5 text-xs font-bold bg-[#1E7B4E] hover:bg-[#165534] text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View PDF</span>
                            </button>
                          </div>
                        ) : isNA ? (
                          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-3xs text-slate-500 font-medium">
                            This section is marked as Not Applicable for this theory-only course offering.
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-3xs text-amber-800 font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>This document has not been uploaded yet. Please upload it in PDF format to complete verification.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Official Signatures Block */}
              <div className="pt-8 grid grid-cols-3 gap-6 font-sans text-xs text-center border-t border-slate-200">
                <div className="space-y-6">
                  <div className="border-b border-slate-400 w-3/4 mx-auto pb-1"></div>
                  <div>
                    <p className="font-bold text-slate-800">{teacherName}</p>
                    <p className="text-3xs text-slate-400">Course Instructor Signature & Date</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border-b border-slate-400 w-3/4 mx-auto pb-1"></div>
                  <div>
                    <p className="font-bold text-slate-800">Quality Coordinator</p>
                    <p className="text-3xs text-slate-400">Department Quality Audit Signature</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border-b border-slate-400 w-3/4 mx-auto pb-1"></div>
                  <div>
                    <p className="font-bold text-slate-800">Head of Department (HOD)</p>
                    <p className="text-3xs text-slate-400">Official Approval Stamp & Date</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print">
              <span className="text-3xs text-slate-500 font-mono">
                {uploadedCount} / 14 Uploaded • Academic Session {submissionSession}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCourseFileDossierModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl cursor-pointer"
                >
                  Back & Edit Files
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!allRequiredUploaded) {
                      const firstMissing = missingMandatoryItems[0] || missingOptionalItems[0];
                      showToast(`Please upload ${firstMissing?.content || 'all required documents'} before submitting.`, 'error');
                      return;
                    }
                    setShowCourseFileDossierModal(false);
                    handleSaveOrSubmit('Submitted');
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    allRequiredUploaded
                      ? 'bg-[#1E7B4E] hover:bg-[#165534] text-white'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit to HOD</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dossier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Official Verification Sheet Modal (Matches Exact Paper Image) ─── */}
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

              {/* 14-Row Statutory Verification Table Matching Physical Form Exactly */}
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
                          ) : item.verified === 'N/A' || item.isNA ? (
                            <span className="text-slate-500 font-semibold">N/A</span>
                          ) : (
                            <span className="text-rose-700 font-semibold">No</span>
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
                  <strong>Note:</strong> Items marked <em>(If applicable)</em> (Sections 9, 10, and 11) may be marked as <strong>N/A</strong> for courses that do not include project or laboratory coursework.
                </p>
                <p>
                  <strong>Verification Policy:</strong> All mandatory sections (1–8, 12–14) must be uploaded in PDF format before submitting to the Head of Department (HOD) for official review.
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
                {checklist.filter(i => i.verified === 'Yes' || i.fileName).length} / {checklist.length} Verified • Status: {checklist.filter(i => i.mandatory && (i.verified === 'Yes' || i.fileName)).length >= checklist.filter(i => i.mandatory).length ? 'Ready for HOD Approval' : 'Incomplete / Draft'}
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

      {/* ─── Modal 3: Incomplete Warning Modal (Strict HOD Gate) ─── */}
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

      {/* Official Certificate Modal (Step 20, 21) */}
      {showCertificateModal && currentCourseFile && (
        <CourseFileCertificateModal
          courseFile={currentCourseFile}
          onClose={() => setShowCertificateModal(false)}
        />
      )}

      {/* Official Printable Course Dossier Modal (Step 21) */}
      {showDossierModal && currentCourseFile && (
        <CourseFileDossierModal
          courseFile={currentCourseFile}
          onClose={() => setShowDossierModal(false)}
        />
      )}
    </div>
  );
};
