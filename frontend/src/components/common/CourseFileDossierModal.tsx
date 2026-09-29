import React, { useRef } from 'react';
import { CourseFileItem } from '../../types';
import { UELogo } from './UELogo';
import { FileText, Printer, Download, X, CheckCircle2, AlertTriangle, Building2, Calendar, BookOpen, User, Layers, ShieldCheck } from 'lucide-react';

interface CourseFileDossierModalProps {
  courseFile: any;
  onClose: () => void;
}

export const CourseFileDossierModal: React.FC<CourseFileDossierModalProps> = ({ courseFile, onClose }) => {
  const dossierRef = useRef<HTMLDivElement>(null);

  if (!courseFile) return null;

  const handlePrint = () => {
    window.print();
  };

  const checklist: any[] = courseFile.templateData?.checklist && Array.isArray(courseFile.templateData.checklist)
    ? courseFile.templateData.checklist
    : [];

  const verifiedCount = checklist.filter((item: any) => item.verified === 'Yes' || item.status === 'Verified' || item.status === 'Approved').length;
  const needsImprovementCount = checklist.filter((item: any) => item.status === 'Needs Improvement' || item.status === 'Returned').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header (Hidden during Print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Course File Dossier PDF View</h3>
              <p className="text-2xs text-slate-400">Complete Academic Documentation Package • Attock Campus</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dossier Content View (Printable) */}
        <div className="p-4 sm:p-8 bg-slate-100 max-h-[80vh] overflow-y-auto flex justify-center">
          <div
            ref={dossierRef}
            id="printable-dossier"
            className="w-full max-w-[850px] bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-200 space-y-8 font-sans"
          >
            {/* Institution Banner */}
            <div className="text-center pb-6 border-b-2 border-emerald-800 space-y-2">
              <div className="flex justify-center mb-3">
                <UELogo size="md" variant="circle" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 uppercase font-heading tracking-wide">
                University of Education, Attock Campus
              </h1>
              <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                {courseFile.departmentName || 'Department of Computer Science'}
              </p>
              <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-widest pt-2">
                Official Course File & Accreditation Dossier
              </h2>
            </div>

            {/* Course Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold block">Course Code</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{courseFile.courseCode}</span>
              </div>
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold block">Course Title</span>
                <span className="font-bold text-slate-900">{courseFile.courseTitle}</span>
              </div>
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold block">Credit Hours</span>
                <span className="font-bold text-emerald-800">{courseFile.credits || 3} Credits</span>
              </div>
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold block">Status</span>
                <span className={`inline-block font-extrabold text-2xs px-2 py-0.5 rounded-full border ${
                  courseFile.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : courseFile.status === 'Returned'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {courseFile.status}
                </span>
              </div>

              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold block">Teacher</span>
                <span className="font-bold text-slate-900">{courseFile.teacherName}</span>
                <span className="text-3xs text-slate-500 block">({courseFile.teacherRole === 'VISITING_TEACHER' ? 'Visiting' : 'Regular'})</span>
              </div>
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold block">Assigned HOD</span>
                <span className="font-bold text-slate-900">{courseFile.hodName || courseFile.reviewedBy || 'HOD'}</span>
              </div>
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold block">Semester & Session</span>
                <span className="font-bold text-slate-800">{courseFile.semester || '1st Semester'} • {courseFile.session || '2024–2025'}</span>
              </div>
              <div>
                <span className="text-3xs text-slate-500 uppercase font-bold block">Student Batch</span>
                <span className="font-bold text-slate-800">Batch {courseFile.batch || '2024'}</span>
              </div>
            </div>

            {/* Official 15-Item Verification Checklist Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Statutory 15-Item Course File Checklist & Individual Item Reviews</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-3xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {verifiedCount} / {checklist.length || 15} Verified
                  </span>
                  {needsImprovementCount > 0 && (
                    <span className="text-3xs font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {needsImprovementCount} Needs Improvement
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                      <th className="py-2.5 px-3 font-bold w-12 text-center border-r border-slate-300">Sr.</th>
                      <th className="py-2.5 px-3 font-bold border-r border-slate-300">Document / Section</th>
                      <th className="py-2.5 px-3 font-bold w-24 text-center border-r border-slate-300">Status</th>
                      <th className="py-2.5 px-3 font-bold w-56">HOD Mandatory Comment / Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-2xs">
                    {checklist.map((item: any, idx: number) => {
                      const isNeedsImp = item.status === 'Needs Improvement' || item.status === 'Returned';
                      const isVer = item.verified === 'Yes' || item.status === 'Verified' || item.status === 'Approved';
                      return (
                        <tr key={item.id || idx} className={isNeedsImp ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                          <td className="py-2 px-3 font-mono font-bold text-center border-r border-slate-300 text-slate-600">
                            {item.srNo || idx + 1}
                          </td>
                          <td className="py-2 px-3 border-r border-slate-300">
                            <span className="font-bold text-slate-900 block">{item.name || item.content}</span>
                            {item.fileName && (
                              <span className="text-3xs text-slate-400 font-mono">
                                📎 {item.fileName} ({item.fileSize || 'PDF'})
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center border-r border-slate-300 font-bold">
                            {isNeedsImp ? (
                              <span className="inline-block text-3xs font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                                Needs Improvement
                              </span>
                            ) : isVer ? (
                              <span className="inline-block text-3xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Verified (Yes)
                              </span>
                            ) : (
                              <span className="inline-block text-3xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {item.comment ? (
                              <p className={`text-2xs font-semibold ${isNeedsImp ? 'text-rose-900 font-bold' : 'text-slate-700'}`}>
                                "{item.comment}"
                              </p>
                            ) : (
                              <span className="text-3xs text-slate-400 italic">Verified & compliant</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Course Description & CLOs */}
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-black text-slate-800 uppercase mb-1">Course Description & Objectives</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {courseFile.templateData?.description ||
                    'Comprehensive course file covering core foundational principles, structured laboratory work, assignments, quizzes, and continuous learning outcome assessments.'}
                </p>
              </div>

              {courseFile.remarks && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <h4 className="text-xs font-black text-amber-900 uppercase mb-1">Overall Review Remarks</h4>
                  <p className="text-xs text-amber-800 font-semibold">{courseFile.remarks}</p>
                </div>
              )}
            </div>

            {/* Verification Signatures */}
            <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs">
              <div className="space-y-1">
                <div className="font-serif italic font-bold text-sm text-slate-900 min-h-[24px] border-b border-slate-400 pb-1">
                  {courseFile.teacherName}
                </div>
                <p className="font-bold text-slate-900">Course Instructor / Teacher Signature</p>
                <p className="text-3xs text-slate-500">{courseFile.departmentName}</p>
                <p className="text-3xs text-slate-400 font-mono">Submission Date: {courseFile.uploadDate || '2026-02-15'}</p>
              </div>

              <div className="text-right space-y-1">
                <div className="font-serif italic font-bold text-sm text-slate-900 min-h-[24px] border-b border-slate-400 pb-1">
                  {courseFile.hodName || courseFile.reviewedBy || 'Head of Department'}
                </div>
                <p className="font-bold text-slate-900">Head of Department (HOD) Approval</p>
                <p className="text-3xs text-slate-500">{courseFile.departmentName}</p>
                <p className="text-3xs text-emerald-700 font-mono font-bold">
                  {courseFile.status === 'Approved' ? `Approved: ${courseFile.reviewedAt ? new Date(courseFile.reviewedAt).toLocaleDateString() : 'Yes'}` : 'Status: Under Review'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">Official course dossier generated for University Course File Management System.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download / Print Dossier PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
