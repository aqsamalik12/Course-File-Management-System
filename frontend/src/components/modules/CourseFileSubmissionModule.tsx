import React, { useState } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { REQUIRED_DOCUMENT_CHECKLIST } from '../../data/mockData';
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
  Info
} from 'lucide-react';

interface CourseFileSubmissionModuleProps {
  onNavigate?: (moduleName: string) => void;
}

export const CourseFileSubmissionModule: React.FC<CourseFileSubmissionModuleProps> = ({ onNavigate }) => {
  const { courseFiles, courses, submissionWindow, uploadCourseFile } = useCFMS();
  const { currentUser } = useAuth();

  const teacherName = currentUser?.name || 'Faculty Member';
  const myCourses = courses.filter(
    (c) => c.assignedTeacherId === currentUser?.id || (currentUser?.email && c.assignedTeacherId === currentUser?.email) || c.assignedTeacherName === teacherName
  );
  const displayCourses = myCourses;

  const [selectedCourseId, setSelectedCourseId] = useState<string>(displayCourses[0]?.id || '');
  const selectedCourse = displayCourses.find((c) => c.id === selectedCourseId) || displayCourses[0];

  const myFiles = courseFiles.filter(
    (f) => f.teacherId === currentUser?.id || f.teacherName === teacherName
  );

  const currentCourseFile = myFiles.find((f) => f.courseCode === selectedCourse?.code);

  // Upload Form State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [submissionBatch, setSubmissionBatch] = useState('2024');
  const [submissionSession, setSubmissionSession] = useState('2024–2025');
  const [submissionSemester, setSubmissionSemester] = useState('1st Semester');
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [viewHistoryModal, setViewHistoryModal] = useState(false);

  const isPastDeadline =
    submissionWindow.status === 'Submission Closed' || new Date() > new Date(submissionWindow.endDate);

  const handleUploadSubmit = (e: React.FormEvent, targetStatus: 'Draft' | 'Submitted' = 'Submitted') => {
    e.preventDefault();
    if (!selectedCourse) return;

    const versionNumber = currentCourseFile
      ? `v${(parseFloat(currentCourseFile.currentVersion.replace('v', '')) + 1.0).toFixed(1)}`
      : 'v1.0';

    const statusToSave = targetStatus;

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
      fileType: selectedFileObj ? (selectedFileObj.name.split('.').pop()?.toUpperCase() as any || 'PDF') : 'PDF',
      fileSize: selectedFileObj ? `${(selectedFileObj.size / 1024 / 1024).toFixed(1)} MB` : '18.5 MB',
      fileUrl: '#',
      status: statusToSave,
      remarks: uploadNotes
        ? `Faculty Changelog: ${uploadNotes}`
        : targetStatus === 'Draft' ? 'Draft saved by teacher.' : 'Submitted complete course file for HOD review.'
    });

    setUploadSuccess(
      targetStatus === 'Draft'
        ? `Course file draft saved for ${selectedCourse.code}.`
        : `Successfully submitted course file for ${selectedCourse.code} to your HOD!`
    );
    setTimeout(() => setUploadSuccess(null), 5000);
    setUploadModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Course File Submission Portal
            </span>
            <span className="text-3xs text-slate-400 font-mono">Academic Term: {submissionWindow.sessionName}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Course File Submission & Signoff
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl shadow-2xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>
              {currentCourseFile?.status === 'Returned for Revision' || currentCourseFile?.status === 'Revision Requested'
                ? 'Replace / Re-upload File'
                : 'Upload Complete Course File'}
            </span>
          </button>
        </div>
      </div>

      {/* Upload Success Alert */}
      {uploadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Course Selection Dropdown / Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <label className="block text-2xs font-extrabold uppercase text-slate-600 tracking-wider">
          Select Assigned Course
        </label>
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
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {statusPill}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 line-clamp-1">{c.title}</h3>
                  <p className="text-3xs text-slate-500 mt-0.5">{c.departmentName} • {c.semester}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Course & Submission Detailed Panel */}
      {selectedCourse && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Course & Deadline Details */}
          <div className="md:col-span-5 space-y-4">
            {/* Course Information Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h2 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                Course Information
              </h2>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-3xs text-slate-400 block font-mono">Course Code & Title</span>
                  <p className="font-extrabold text-slate-900">
                    {selectedCourse.code} — {selectedCourse.title}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-3xs pt-1">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">Credit Hours</span>
                    <span className="font-bold text-slate-800">{selectedCourse.credits} Credit Hours</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">Enrolled Students</span>
                    <span className="font-bold text-slate-800">{selectedCourse.totalStudents} Students</span>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-3xs">
                  <span className="text-slate-400 block">Department</span>
                  <span className="font-bold text-slate-800">{selectedCourse.departmentName}</span>
                </div>
              </div>
            </div>

            {/* Academic Session & Deadline Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h2 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider border-b border-slate-100 pb-2">
                Academic Session & Deadline
              </h2>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-3xs">
                  <span className="text-slate-500">Session Name:</span>
                  <strong className="text-slate-900 font-mono">{submissionWindow.sessionName}</strong>
                </div>

                <div className="flex justify-between items-center text-3xs">
                  <span className="text-slate-500">Submission Opening:</span>
                  <strong className="text-slate-800 font-mono">{submissionWindow.startDate}</strong>
                </div>

                <div className="flex justify-between items-center text-3xs">
                  <span className="text-slate-500">Submission Cutoff:</span>
                  <strong className="text-emerald-700 font-mono font-bold">{submissionWindow.endDate}</strong>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-3xs">
                  <span className="font-bold text-[#165534] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#1E7B4E]" />
                    <span>Operational Window:</span>
                  </span>
                  <span className="font-extrabold text-[#1E7B4E] uppercase">{submissionWindow.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Submission Status & Upload Action */}
          <div className="md:col-span-7 space-y-4">
            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Current Submission Status
                </h3>
                <span
                  className={`px-3 py-1 text-xs font-extrabold rounded-full border ${
                    currentCourseFile?.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : currentCourseFile?.status === 'Submitted' || currentCourseFile?.status === 'In Review'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : currentCourseFile?.status === 'Returned for Revision' || currentCourseFile?.status === 'Revision Requested'
                      ? 'bg-red-100 text-red-900 border-red-300'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {currentCourseFile ? currentCourseFile.status : 'Not Uploaded'}
                </span>
              </div>

              {currentCourseFile ? (
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <FileArchive className="w-6 h-6 text-[#1E7B4E]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{currentCourseFile.title}</h4>
                        <p className="text-3xs text-slate-500 font-mono mt-0.5">
                          Version: {currentCourseFile.currentVersion} • Size: {currentCourseFile.fileSize} • Format: {currentCourseFile.fileType}
                        </p>
                        <p className="text-3xs text-slate-400 mt-0.5">Submitted: {currentCourseFile.uploadDate}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setViewHistoryModal(true)}
                      className="px-3 py-1.5 text-3xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <History className="w-3 h-3" />
                      <span>Version Log ({currentCourseFile.versionHistory.length})</span>
                    </button>
                  </div>

                  {currentCourseFile.remarks && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs">
                      <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-amber-700" />
                        <span>HOD Feedback & Remarks:</span>
                      </span>
                      <p className="text-amber-800 text-2xs pl-5">{currentCourseFile.remarks}</p>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl flex items-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {currentCourseFile.status === 'Returned for Revision' || currentCourseFile.status === 'Revision Requested'
                          ? 'Replace File with Revised Version'
                          : 'Upload Updated Version'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-3 bg-slate-50/50">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-[#1E7B4E] flex items-center justify-center">
                    <FileArchive className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">No Course File Uploaded Yet</h4>
                    <p className="text-3xs text-slate-500 mt-0.5">
                      Upload ONE complete course file containing all 10 mandatory sections.
                    </p>
                  </div>
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl shadow-2xs cursor-pointer inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Complete Course File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-3xs font-mono font-extrabold uppercase text-[#1E7B4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedCourse.code}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">Upload Complete Course File</h3>
                <p className="text-xs text-slate-500">{selectedCourse.title} • {submissionWindow.sessionName}</p>
              </div>
              <button onClick={() => setUploadModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-3xs font-medium leading-relaxed">
                <strong>Mandatory Rule:</strong> Please compile all 10 required items (Syllabus, Plan, Attendance, Mid Package, Final Package, Quizzes, Assignments, CLO Matrix, Results, Samples) inside ONE single PDF document (.PDF Format Only).
              </div>

              {/* Batch, Session, and 4 Semesters Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Batch *</label>
                  <select
                    value={submissionBatch}
                    onChange={(e) => {
                      setSubmissionBatch(e.target.value);
                      setSubmissionSession(e.target.value === '2024' ? '2024–2025' : `${e.target.value}–${parseInt(e.target.value) + 1}`);
                    }}
                    className="w-full p-2 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="2024">Batch 2024</option>
                    <option value="2025">Batch 2025</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Session *</label>
                  <select
                    value={submissionSession}
                    onChange={(e) => setSubmissionSession(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="2024–2025">2024–2025</option>
                    <option value="2025–2026">2025–2026</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Semester *</label>
                  <select
                    value={submissionSemester}
                    onChange={(e) => setSubmissionSemester(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl text-xs text-slate-800 font-bold focus:outline-none"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Select Course File (.PDF Format Only) *</label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  required
                  onChange={(e) => setSelectedFileObj(e.target.files?.[0] || null)}
                  className="w-full text-xs bg-slate-50 p-2.5 border rounded-xl cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Submission Notes / Changelog</label>
                <textarea
                  rows={3}
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  placeholder="e.g. Initial complete course file submission for 1st Semester."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-800 focus:ring-2 focus:ring-[#1E7B4E] outline-none"
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => handleUploadSubmit(e, 'Draft')}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={(e) => handleUploadSubmit(e, 'Submitted')}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Submit to HOD</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {viewHistoryModal && currentCourseFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">{currentCourseFile.courseCode} Version Audit Log</h3>
                <p className="text-3xs text-slate-500">{currentCourseFile.title}</p>
              </div>
              <button onClick={() => setViewHistoryModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {currentCourseFile.versionHistory.map((ver) => (
                <div key={ver.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-2xs font-sans">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#1E7B4E] bg-white px-2 py-0.5 rounded border">
                      {ver.versionNumber}
                    </span>
                    <span className="text-3xs font-mono text-slate-400">{ver.uploadedAt}</span>
                  </div>
                  <p className="font-bold text-slate-800">{ver.fileName} ({ver.fileSize})</p>
                  <p className="text-3xs text-slate-600">{ver.changeLog}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewHistoryModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-xl cursor-pointer"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
