import React, { useState } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { OFFICIAL_COURSE_FILE_TEMPLATES, REQUIRED_DOCUMENT_CHECKLIST } from '../../data/mockData';
import { Upload, Download, FileText, CheckCircle2, AlertCircle, Info, ShieldCheck, FileArchive } from 'lucide-react';

export const TeacherUpload: React.FC = () => {
  const { uploadCourseFile, courses } = useCFMS();
  const { currentUser } = useAuth();

  // Filter assigned courses for current teacher
  const myCourses = courses.filter(
    (c) => c.assignedTeacherId === currentUser.id || c.assignedTeacherName === currentUser.name
  );
  const availableCourses = myCourses.length > 0 ? myCourses : courses;

  const [selectedCourseCode, setSelectedCourseCode] = useState(availableCourses[0]?.code || 'CS-101');
  const [academicSession, setAcademicSession] = useState('Spring 2026');
  const [fileTitle, setFileTitle] = useState(`${selectedCourseCode}_Complete_Course_File_Spring2026`);
  const [changeLog, setChangeLog] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  const currentCourse = availableCourses.find((c) => c.code === selectedCourseCode) || availableCourses[0];

  const handleCourseChange = (code: string) => {
    setSelectedCourseCode(code);
    setFileTitle(`${code}_Complete_Course_File_Spring2026`);
  };

  const handleDownloadTemplate = (tmplTitle: string, fileName: string) => {
    setDownloadMsg(`Downloading official template: "${fileName}"`);
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTitle) return;

    uploadCourseFile({
      courseId: currentCourse?.id || 'course-101',
      courseCode: selectedCourseCode,
      courseTitle: currentCourse?.title || 'Course Title',
      departmentId: currentUser.departmentId,
      departmentName: currentUser.departmentName,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      teacherRole: currentUser.role,
      title: `${selectedCourseCode} Complete Course File (${academicSession})`,
      category: 'Syllabus & Course Outline',
      currentVersion: 'v1.0',
      fileType: file ? (file.name.split('.').pop()?.toUpperCase() as any || 'ZIP') : 'ZIP',
      fileSize: file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : '18.5 MB',
      fileUrl: '#',
      status: 'Submitted',
      remarks: changeLog ? `Teacher Notes: ${changeLog}` : 'Submitted for HOD review.'
    });

    setUploaded(true);
    setTimeout(() => setUploaded(false), 4000);
    setFile(null);
    setChangeLog('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#1E7B4E] uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>University of Education CFMS Protocol</span>
        </div>
        <h2 className="text-xl font-extrabold font-heading text-slate-900">Upload Complete Course File</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit the <strong>ONE Complete Course File</strong> for your course at the end of the semester. Separate item uploads are strictly prohibited.
        </p>
      </div>

      {/* Official Guidelines Banner */}
      <div className="bg-[#165534] text-white rounded-2xl p-5 shadow-sm border border-[#12482c] space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-800/80 rounded-xl shrink-0 mt-0.5">
            <Info className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">University Policy: Single Course File Submission</h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              In accordance with University of Education guidelines, each faculty member must submit <strong>ONLY ONE compiled Course File package</strong> per course per semester. Do not submit exams, quizzes, or attendance records individually.
            </p>
          </div>
        </div>

        {/* Official Template Downloads Bar */}
        <div className="pt-2 border-t border-emerald-700/60 flex flex-wrap items-center justify-between gap-3">
          <span className="text-2xs font-bold text-emerald-200 uppercase tracking-wider">Official Admin Downloads:</span>
          <div className="flex flex-wrap items-center gap-2">
            {OFFICIAL_COURSE_FILE_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleDownloadTemplate(tmpl.title, tmpl.fileName)}
                className="px-3 py-1.5 text-3xs font-bold bg-[#12482c] hover:bg-[#0e3b24] text-emerald-100 hover:text-white rounded-lg border border-emerald-600/50 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-300" />
                <span>{tmpl.fileName} ({tmpl.format})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Download Alert Message */}
      {downloadMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* Upload Success Alert */}
      {uploaded && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 font-bold flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs">Complete Course File successfully submitted to HOD!</p>
            <p className="text-3xs text-emerald-700 font-normal">Your HOD has been notified and the file is now in the review queue.</p>
          </div>
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-800 mb-1">Select Assigned Course *</label>
            <select
              value={selectedCourseCode}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#1E7B4E] outline-none"
            >
              {availableCourses.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} - {c.title} ({c.semester})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">Academic Session *</label>
            <select
              value={academicSession}
              onChange={(e) => setAcademicSession(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-[#1E7B4E] outline-none"
            >
              <option value="Spring 2026">Spring 2026 (Current Session)</option>
              <option value="Fall 2026">Fall 2026</option>
              <option value="Summer 2026">Summer 2026</option>
            </select>
          </div>
        </div>

        {/* Required Checklist Verification */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <FileArchive className="w-4 h-4 text-[#1E7B4E]" />
              <span>Required Documents Compiled inside this Course File (10 Mandatory Items):</span>
            </h4>
            <span className="text-3xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
              Complete Package Checklist
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-2xs">
            {REQUIRED_DOCUMENT_CHECKLIST.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-800">{idx + 1}. {item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Drag & Drop File Upload Zone */}
        <div>
          <label className="block font-bold text-slate-800 mb-1">Upload ONE Complete Course File (.PDF Format Only) *</label>
          <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-8 text-center bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors cursor-pointer relative">
            <Upload className="w-10 h-10 text-[#1E7B4E] mx-auto mb-2" />
            <p className="font-bold text-slate-900 text-xs">
              {file ? file.name : 'Drag & drop compiled Complete Course File here, or click to browse'}
            </p>
            <p className="text-3xs text-slate-500 mt-1">
              Supported format: PDF only (Maximum file size: 100MB)
            </p>
            {file && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-white border border-emerald-300 text-emerald-900 text-3xs font-bold rounded-lg shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
              </div>
            )}
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-800 mb-1">Submission Notes / Version Changelog (Optional)</label>
          <textarea
            rows={2}
            value={changeLog}
            onChange={(e) => setChangeLog(e.target.value)}
            placeholder="e.g. Initial complete course file submission including midterm, final exam, solutions, and CLO mapping..."
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#1E7B4E]"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl shadow-sm cursor-pointer flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Submit Complete Course File to HOD</span>
          </button>
        </div>
      </form>
    </div>
  );
};

