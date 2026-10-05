import React, { useState } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { CourseFileItem } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { DetailDrawer } from '../common/DetailDrawer';
import { FileUploadModal } from '../common/FileUploadModal';
import {
  FileText, Upload, Download, Eye, History, CheckCircle, Clock,
  AlertTriangle, Award, CheckCircle2, RotateCcw, ArrowRight, ShieldCheck
} from 'lucide-react';
import { CourseFileCertificateModal } from '../common/CourseFileCertificateModal';
import { CourseFileDossierModal } from '../common/CourseFileDossierModal';

interface TeacherFilesProps {
  filterStatus?: 'All' | 'Submitted' | 'Needs Improvement' | 'Approved' | 'Certificates' | 'Downloads';
  onNavigate?: (moduleName: string) => void;
}

export const TeacherFiles: React.FC<TeacherFilesProps> = ({
  filterStatus = 'All',
  onNavigate
}) => {
  const { courseFiles } = useCFMS();
  const { currentUser } = useAuth();

  const [selectedFile, setSelectedFile] = useState<CourseFileItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showCertificateFile, setShowCertificateFile] = useState<any | null>(null);
  const [showDossierFile, setShowDossierFile] = useState<any | null>(null);

  const teacherName = currentUser?.name || '';
  const myFiles = courseFiles.filter(
    (f) => (f.teacherId === currentUser?.id || f.teacherName === teacherName) && !f.deleted
  );

  const filteredFiles = myFiles.filter((f) => {
    if (filterStatus === 'Submitted') {
      return f.status === 'Submitted' || f.status === 'Under Review' || f.status === 'In Review';
    }
    if (filterStatus === 'Needs Improvement') {
      return f.status === 'Returned' || f.status === 'Needs Improvement' || f.status === 'Returned for Revision' || f.status === 'Revision Requested';
    }
    if (filterStatus === 'Approved') {
      return f.status === 'Approved';
    }
    if (filterStatus === 'Certificates' || filterStatus === 'Downloads') {
      return f.status === 'Approved';
    }
    return true;
  });

  const getHeaderInfo = () => {
    switch (filterStatus) {
      case 'Submitted':
        return {
          title: 'My Submitted Course Files',
          subtitle: 'Track review and audit progress for course files submitted to your Department HOD.',
          badge: 'Submitted & In Review'
        };
      case 'Needs Improvement':
        return {
          title: 'Files Needing Improvement',
          subtitle: 'Course files returned by your HOD requiring file updates or corrections before final approval.',
          badge: 'Action Required'
        };
      case 'Approved':
        return {
          title: 'Approved Course Files',
          subtitle: 'Official course files fully vetted, approved, and accredited by your Department HOD.',
          badge: 'Accreditation Approved'
        };
      case 'Certificates':
        return {
          title: 'Course Completion Certificates',
          subtitle: 'Official institutional certificates issued upon formal HOD approval and QEC compliance.',
          badge: 'QEC Certificates'
        };
      case 'Downloads':
        return {
          title: 'Downloads Center',
          subtitle: 'Download complete Course File Dossier PDFs and official institutional completion certificates.',
          badge: 'Ready for Download'
        };
      default:
        return {
          title: 'My Course Files',
          subtitle: 'View, re-upload, or track HOD approval status for your course file submissions.',
          badge: 'All Files'
        };
    }
  };

  const header = getHeaderInfo();

  const columns: Column<CourseFileItem>[] = [
    {
      key: 'title',
      header: 'Course Document / Code',
      render: (f) => (
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 mt-0.5 border ${
            f.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
            f.status === 'Returned' || f.status === 'Needs Improvement' ? 'bg-rose-50 border-rose-200 text-rose-700' :
            'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs block">{f.courseCode} — {f.courseTitle || f.title}</span>
            <span className="text-3xs text-slate-500">{f.semester || '7th Semester'} • Batch {f.batch || '2023'} • {f.departmentName || 'Computer Science'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Review Status',
      render: (f) => {
        let badgeCls = 'bg-slate-100 text-slate-800 border-slate-200';
        if (f.status === 'Approved') badgeCls = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold';
        else if (f.status === 'Submitted' || f.status === 'Under Review') badgeCls = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
        else if (f.status === 'Returned' || f.status === 'Needs Improvement') badgeCls = 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold';

        return (
          <span className={`px-2.5 py-0.5 rounded-full text-3xs border ${badgeCls}`}>
            {f.status}
          </span>
        );
      }
    },
    {
      key: 'remarks',
      header: 'HOD Comments / Deficiencies',
      render: (f) => {
        if (f.status === 'Returned' || f.status === 'Needs Improvement') {
          return (
            <div className="max-w-xs space-y-1">
              <span className="text-3xs font-extrabold text-rose-800 block">Needs Revision:</span>
              <p className="text-3xs text-rose-900 bg-rose-50 p-1.5 rounded border border-rose-200 line-clamp-2">
                "{f.reviewComment || f.remarks || 'Please update the returned document(s) and resubmit.'}"
              </p>
            </div>
          );
        }
        if (f.status === 'Approved') {
          return (
            <span className="text-3xs font-medium text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Accreditation Verified</span>
            </span>
          );
        }
        return <span className="text-3xs text-slate-400">Awaiting HOD Signoff</span>;
      }
    },
    {
      key: 'lastModified',
      header: 'Last Modified',
      render: (f) => <span className="text-3xs text-slate-500 font-mono">{f.lastModified || f.submittedAt?.split('T')[0] || '-'}</span>
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{header.badge}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            {header.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {header.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('Course File Submission')}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Submit Course File</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtered Empty State */}
      {filteredFiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Course Files Found in this View</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filterStatus === 'Needs Improvement'
              ? 'Great job! You have no course files pending improvement or returned by your HOD.'
              : filterStatus === 'Approved'
              ? 'You do not have any approved course files yet. Once your HOD approves your submissions, they will appear here.'
              : 'There are currently no records for this section.'}
          </p>
          {onNavigate && (
            <button
              onClick={() => onNavigate('Course File Submission')}
              className="mt-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span>Go to Course File Submission</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <DataTable
          data={filteredFiles}
          columns={columns}
          searchPlaceholder="Search course files..."
          onRowClick={(f) => {
            setSelectedFile(f);
            setIsDrawerOpen(true);
          }}
          actions={(f) => (
            <div className="flex items-center gap-1.5 justify-end">
              {f.status === 'Approved' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDossierFile(f);
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-3xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
                    title="Download Approved Course File PDF"
                  >
                    <Download className="w-3 h-3 text-slate-300" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCertificateFile(f);
                    }}
                    className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-3xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
                    title="Download Certificate"
                  >
                    <Award className="w-3 h-3 text-emerald-300" />
                    <span>Certificate</span>
                  </button>
                </>
              )}

              {(f.status === 'Returned' || f.status === 'Needs Improvement') && onNavigate && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('Course File Submission');
                  }}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-3xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-all"
                  title="Correct Deficiencies and Resubmit"
                >
                  <RotateCcw className="w-3 h-3 text-white" />
                  <span>Correct & Resubmit</span>
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedFile(f);
                  setIsDrawerOpen(true);
                }}
                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      )}

      {/* Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedFile?.title || selectedFile?.courseTitle || 'File Overview'}
        subtitle={`${selectedFile?.courseCode} - ${selectedFile?.semester || '7th Semester'}`}
      >
        {selectedFile && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-3xs text-slate-400 block uppercase font-bold">Signoff Status</span>
                <span className="text-sm font-extrabold text-slate-900">{selectedFile.status}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedFile.status === 'Approved' && (
                  <>
                    <button
                      onClick={() => setShowCertificateFile(selectedFile)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Certificate</span>
                    </button>
                    <button
                      onClick={() => setShowDossierFile(selectedFile)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {selectedFile.reviewComment && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <span className="text-2xs font-bold text-rose-900">HOD Review Feedback:</span>
                <p className="text-xs text-rose-800 font-medium">"{selectedFile.reviewComment}"</p>
              </div>
            )}

            {selectedFile.templateData?.checklist && Array.isArray(selectedFile.templateData.checklist) && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
                  Statutory 15 Checklist Items
                </h4>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {selectedFile.templateData.checklist.map((item: any) => (
                    <div key={item.srNo} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-3xs">
                      <div>
                        <span className="font-bold text-slate-900">{item.srNo}. {item.name}</span>
                        {item.comment && (
                          <p className="text-slate-500 italic mt-0.5">Comment: {item.comment}</p>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        item.status === 'Needs Improvement' ? 'bg-rose-100 text-rose-800' :
                        item.verified === 'Yes' || item.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status || (item.verified === 'Yes' ? 'Verified' : 'Pending')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>

      <FileUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      {/* Official Certificate Modal */}
      {showCertificateFile && (
        <CourseFileCertificateModal
          courseFile={showCertificateFile}
          onClose={() => setShowCertificateFile(null)}
        />
      )}

      {/* Official Printable Course Dossier Modal */}
      {showDossierFile && (
        <CourseFileDossierModal
          courseFile={showDossierFile}
          onClose={() => setShowDossierFile(null)}
        />
      )}
    </div>
  );
};
