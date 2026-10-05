import React, { useRef } from 'react';
import { UELogo } from './UELogo';
import { Award, Printer, Download, X, CheckCircle2 } from 'lucide-react';

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
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('en-PK', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

  const completionDate = courseFile.submittedAt
    ? new Date(courseFile.submittedAt).toLocaleDateString('en-PK', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : approvalDate;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Action Bar (Hidden during Print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Course Completion Certificate</h3>
              <p className="text-2xs text-slate-400">University of Education, Lahore • Quality Enhancement Cell</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isApproved ? (
              <button
                type="button"
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
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Area - Replicating Provided University Document Exactly */}
        <div className="p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div
            ref={certificateRef}
            id="printable-certificate"
            className="w-full max-w-[800px] bg-white text-slate-900 p-8 sm:p-12 border border-slate-300 shadow-xl font-serif text-sm leading-relaxed"
          >
            {/* Header: Logo + University Name & Department */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 shrink-0">
                <UELogo size="lg" variant="circle" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif leading-tight">
                  University of Education, Lahore
                </h1>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-serif mt-1">
                  Department of {courseFile.departmentName ? courseFile.departmentName.replace(/^Department of\s+/i, '') : 'Information Sciences'}
                </h2>
              </div>
            </div>

            {/* Solid Horizontal Line */}
            <div className="h-1 bg-slate-900 w-full mt-4 mb-5" />

            {/* Course Completion Certificate Boxed Heading */}
            <div className="text-center my-5">
              <span className="inline-block border border-slate-900 px-6 py-1 font-bold text-base uppercase tracking-wider font-serif">
                Course Completion Certificate
              </span>
            </div>

            {/* Intro statement */}
            <p className="text-slate-800 mt-4 leading-normal">
              This is to certify that the course outlined below has been successfully completed in accordance with the prescribed academic syllabus and timeline.
            </p>

            {/* Faculty Details */}
            <div className="mt-5 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Faculty Details:</h3>
              <div className="space-y-1.5 pl-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-900 font-bold shrink-0">● Teacher Name:</span>
                  <span className="flex-1 border-b border-slate-900 font-bold px-2 text-slate-900">
                    {courseFile.teacherName}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-900 font-bold shrink-0">● Employee ID (If applicable):</span>
                  <span className="flex-1 border-b border-slate-900 px-2 text-slate-800">
                    {courseFile.teacherEmployeeId || courseFile.teacherId || 'N/A'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-900 font-bold shrink-0">● Department:</span>
                  <span className="flex-1 border-b border-slate-900 font-bold px-2 text-slate-900">
                    {courseFile.departmentName || 'Information Sciences'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-900 font-bold shrink-0">● Campus:</span>
                  <span className="flex-1 border-b border-slate-900 font-bold px-2 text-slate-900">
                    {courseFile.campusName || courseFile.campus || 'Attock Campus'}
                  </span>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="mt-5 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Course Details:</h3>
              <div className="space-y-1.5 pl-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-900 font-bold shrink-0">● Course Title:</span>
                  <span className="flex-1 border-b border-slate-900 font-bold px-2 text-slate-900">
                    {courseFile.courseTitle}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-900 font-bold shrink-0">● Course Code:</span>
                  <span className="flex-1 border-b border-slate-900 font-mono font-bold px-2 text-slate-900">
                    {courseFile.courseCode}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-900 font-bold shrink-0">● Class/Semester:</span>
                  <span className="flex-1 border-b border-slate-900 px-2 text-slate-900">
                    {courseFile.batch ? (courseFile.batch.startsWith('BS') ? courseFile.batch : `Batch ${courseFile.batch}`) : 'BSCS'} • {courseFile.semester || '7th Semester'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-900 font-bold shrink-0">● Academic Term/Year:</span>
                  <span className="flex-1 border-b border-slate-900 px-2 text-slate-900">
                    {courseFile.session || courseFile.academicYear || '2024–25'}
                  </span>
                </div>
              </div>
            </div>

            {/* Statement of Completion */}
            <div className="mt-5 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Statement of Completion:</h3>
              <p className="text-slate-800 leading-normal text-justify">
                I hereby confirm that 100% of the syllabus, including all required lectures, laboratory practicals, and internal assignments, has been thoroughly covered. The student attendance registers and internal assessment marks have also been updated and finalized.
              </p>
            </div>

            {/* Date & Teacher Signature */}
            <div className="mt-6 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-900 font-bold shrink-0">Date of Completion:</span>
                <span className="border-b border-slate-900 px-3 font-semibold text-slate-900">
                  {completionDate}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-900 font-bold shrink-0">Signature of the Class Teacher:</span>
                <span className="flex-1 border-b border-slate-900 px-3 italic font-serif font-bold text-emerald-950 text-base">
                  {courseFile.teacherName}
                </span>
              </div>
            </div>

            {/* Received By & Verified By (2-Column Grid) */}
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-slate-900 font-bold shrink-0">Received By:</span>
                <span className="flex-1 border-b border-slate-900 font-bold px-2 text-slate-900 truncate">
                  {courseFile.hodName || courseFile.reviewedBy || 'Dr. Asif (HOD)'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-900 font-bold shrink-0">Date:</span>
                <span className="flex-1 border-b border-slate-900 px-2 text-slate-900">
                  {approvalDate}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-900 font-bold shrink-0">Verified By (Coordinator):</span>
                <span className="flex-1 border-b border-slate-900 font-bold px-2 text-slate-900 truncate">
                  {courseFile.hodName || 'Dr. Asif'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-slate-900 font-bold shrink-0">Status:</span>
                <span className="flex-1 border-b border-slate-900 font-black px-2 uppercase text-emerald-700">
                  {courseFile.status || 'Approved'}
                </span>
              </div>
            </div>

            {/* Bottom Footer with Divider Line and University Contacts */}
            <div className="h-[1.5px] bg-slate-900 w-full mt-10 mb-3" />
            <div className="text-center text-xs text-slate-700 space-y-0.5">
              <p>University of Education, College Road Township Lahore, Pakistan. Tel: 042 99262232</p>
              <p>
                Email: <span className="underline">coordinator.is.dsnt@ue.edu.pk</span>
              </p>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Official University Course Completion Certificate format verified.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
            {isApproved && (
              <button
                type="button"
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
