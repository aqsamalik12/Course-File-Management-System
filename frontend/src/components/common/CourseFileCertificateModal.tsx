import React, { useRef } from 'react';
import { CourseFileItem } from '../../types';
import { UELogo } from './UELogo';
import { Award, Printer, Download, X, CheckCircle2, ShieldCheck, Calendar, BookOpen, Building2 } from 'lucide-react';

interface CourseFileCertificateModalProps {
  courseFile: any;
  onClose: () => void;
}

export const CourseFileCertificateModal: React.FC<CourseFileCertificateModalProps> = ({ courseFile, onClose }) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!courseFile) return null;

  const isApproved = courseFile.status === 'Approved';
  const approvalDate = courseFile.reviewedAt
    ? new Date(courseFile.reviewedAt).toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-PK', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

  const certId = `UE-CFMS-${courseFile.batch || '2026'}-${(courseFile.id || 'CERT').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Action Bar (Hidden during Print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Official Course File Completion Certificate</h3>
              <p className="text-2xs text-slate-400">Higher Education Quality Compliance • Attock Campus</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isApproved ? (
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            ) : (
              <span className="text-2xs font-bold text-amber-300 bg-amber-900/40 px-3 py-1.5 rounded-lg border border-amber-600/40">
                Pending Approval
              </span>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Area */}
        <div className="p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div
            ref={certificateRef}
            id="printable-certificate"
            className="w-full max-w-[850px] bg-[#FAF8F2] text-[#14281E] border-[10px] border-double border-[#A67C1E] p-8 sm:p-12 rounded-xl shadow-xl relative overflow-hidden font-serif"
          >
            {/* Background Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
              <div className="w-96 h-96 rounded-full border-[20px] border-[#A67C1E] flex items-center justify-center">
                <span className="text-8xl font-black text-[#A67C1E]">UE</span>
              </div>
            </div>

            {/* Decorative Corner Ornaments */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#A67C1E]" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#A67C1E]" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#A67C1E]" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#A67C1E]" />

            {/* Header / University Banner */}
            <div className="text-center space-y-2 relative z-10">
              <div className="flex justify-center mb-3">
                <UELogo size="lg" variant="circle" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-[#0F2D1F] uppercase font-heading">
                University of Education
              </h1>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#A67C1E]">
                Attock Campus • Punjab, Pakistan
              </p>
              <p className="text-3xs sm:text-2xs uppercase tracking-wider text-slate-500 font-sans font-semibold">
                Directorate of Academic Standards & Quality Enhancement Cell (QEC)
              </p>
            </div>

            {/* Certificate Title Badge */}
            <div className="my-6 text-center relative z-10">
              <div className="inline-block relative">
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[#A67C1E] to-transparent w-full mb-3" />
                <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#1E7B4E] uppercase px-6 py-1">
                  Certificate of Course File Completion
                </h2>
                <div className="h-[2px] bg-gradient-to-r from-transparent via-[#A67C1E] to-transparent w-full mt-3" />
              </div>
            </div>

            {/* Body Text */}
            <div className="text-center space-y-4 my-6 text-sm sm:text-base leading-relaxed relative z-10 px-2 sm:px-6">
              <p className="text-slate-600 italic">This is proudly presented and certified to</p>

              <div className="py-2 border-b-2 border-[#A67C1E]/50 inline-block min-w-[320px]">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F2D1F] tracking-normal font-heading">
                  {courseFile.teacherName}
                </h3>
                <p className="text-xs font-sans font-semibold text-emerald-800 uppercase tracking-wider mt-1">
                  {courseFile.teacherRole === 'VISITING_TEACHER' ? 'Visiting Faculty Member' : 'Regular Faculty Member'} • {courseFile.departmentName}
                </p>
              </div>

              <p className="text-slate-700 max-w-2xl mx-auto leading-relaxed pt-2">
                for the comprehensive development, meticulous compilation, and timely submission of the official academic Course File for the course:
              </p>

              {/* Course Dossier Highlight Card */}
              <div className="bg-white/80 border border-[#A67C1E]/30 rounded-xl p-4 max-w-xl mx-auto shadow-xs font-sans text-left space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-mono font-bold text-xs text-[#0F2D1F] bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    {courseFile.courseCode}
                  </span>
                  <span className="text-xs font-bold text-[#A67C1E]">
                    {courseFile.credits || 3} Credit Hours
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-[#0F2D1F]">
                  {courseFile.courseTitle}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-2xs text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block font-semibold">Semester:</span>
                    <span className="font-bold text-slate-800">{courseFile.semester || '1st Semester'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Academic Session:</span>
                    <span className="font-bold text-slate-800">{courseFile.session || '2024–2025'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Student Batch:</span>
                    <span className="font-bold text-slate-800">Batch {courseFile.batch || '2024'}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 italic max-w-2xl mx-auto pt-2">
                Verified across all 15 statutory criteria including syllabus coverage, continuous assessments, CLO-PLO alignments, midterm & final records, and endorsed by the Departmental Quality Assurance Committee.
              </p>
            </div>

            {/* Footer with Signatures & Official Certificate ID */}
            <div className="mt-10 pt-6 border-t border-[#A67C1E]/40 grid grid-cols-1 sm:grid-cols-3 items-end gap-6 font-sans relative z-10">
              
              {/* HOD Signatory */}
              <div className="text-center sm:text-left space-y-1">
                <div className="font-serif italic font-bold text-base text-[#0F2D1F] min-h-[28px] border-b border-slate-400 pb-1">
                  {courseFile.hodName || courseFile.reviewedBy || 'Head of Department'}
                </div>
                <p className="text-xs font-bold text-slate-900">Head of Department (HOD)</p>
                <p className="text-3xs text-slate-500 uppercase">{courseFile.departmentName}</p>
                <p className="text-3xs text-emerald-700 font-mono font-bold">Approved: {approvalDate}</p>
              </div>

              {/* Official Seal Emblem */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full border-4 border-double border-[#A67C1E] bg-[#FFFBF0] flex flex-col items-center justify-center shadow-md p-1">
                  <ShieldCheck className="w-6 h-6 text-[#1E7B4E]" />
                  <span className="text-[8px] font-black uppercase text-[#A67C1E] leading-none mt-1">VERIFIED</span>
                  <span className="text-[7px] text-slate-500 font-bold leading-none">HEC / UE</span>
                </div>
                <span className="font-mono text-3xs font-extrabold text-slate-500 mt-2 block tracking-wider">
                  CERT-ID: {certId}
                </span>
              </div>

              {/* Campus Director Signatory */}
              <div className="text-center sm:text-right space-y-1">
                <div className="font-serif italic font-bold text-base text-[#0F2D1F] min-h-[28px] border-b border-slate-400 pb-1">
                  Prof. Dr. Muhammad Aslam
                </div>
                <p className="text-xs font-bold text-slate-900">Campus Director / Dean</p>
                <p className="text-3xs text-slate-500 uppercase">University of Education, Attock</p>
                <p className="text-3xs text-slate-400 font-mono">Official Seal Affixed</p>
              </div>

            </div>

          </div>
        </div>

        {/* Modal Footer (Hidden during Print) */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Digital Certificate validated by University of Education Attock Campus Academic System.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
            {isApproved && (
              <button
                onClick={handlePrint}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Certificate PDF</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
