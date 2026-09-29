import React, { useState } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { CourseFileItem } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { DetailDrawer } from '../common/DetailDrawer';
import { FileUploadModal } from '../common/FileUploadModal';
import { FileText, Upload, Download, Eye, History, CheckCircle, Clock, AlertTriangle, Award } from 'lucide-react';
import { CourseFileCertificateModal } from '../common/CourseFileCertificateModal';
import { CourseFileDossierModal } from '../common/CourseFileDossierModal';

export const TeacherFiles: React.FC = () => {
  const { courseFiles } = useCFMS();
  const { currentUser } = useAuth();

  const [selectedFile, setSelectedFile] = useState<CourseFileItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showCertificateFile, setShowCertificateFile] = useState<any | null>(null);
  const [showDossierFile, setShowDossierFile] = useState<any | null>(null);

  const myFiles = courseFiles.filter(
    (f) => (f.teacherId === currentUser.id || f.teacherName === currentUser.name) && !f.deleted
  );

  const columns: Column<CourseFileItem>[] = [
    {
      key: 'title',
      header: 'Course Document Title',
      render: (f) => (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg shrink-0 mt-0.5">
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs block">{f.title}</span>
            <span className="text-3xs text-slate-500">{f.courseCode} • {f.category}</span>
          </div>
        </div>
      )
    },
    {
      key: 'currentVersion',
      header: 'Version',
      render: (f) => (
        <span className="font-bold text-slate-900 text-3xs px-2 py-0.5 bg-slate-100 rounded border">
          {f.currentVersion}
        </span>
      )
    },
    {
      key: 'status',
      header: 'HOD Signoff Status',
      render: (f) => (
        <span className="px-2.5 py-0.5 rounded-full text-3xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          {f.status}
        </span>
      )
    },
    {
      key: 'lastModified',
      header: 'Last Modified',
      render: (f) => <span className="text-3xs text-slate-500 font-mono">{f.lastModified}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-heading text-slate-900">My Course Files</h2>
          <p className="text-xs text-slate-500">
            View, re-upload, or track HOD approval status for your course file submissions.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload File</span>
        </button>
      </div>

      <DataTable
        data={myFiles}
        columns={columns}
        searchPlaceholder="Search my uploaded course files..."
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
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-3xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Download Approved Course File PDF"
                >
                  <Download className="w-3 h-3 text-slate-300" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCertificateFile(f);
                  }}
                  className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-3xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                  title="Download Certificate"
                >
                  <Award className="w-3 h-3 text-emerald-300" />
                  <span>Certificate</span>
                </button>
              </>
            )}
            <button
              onClick={() => {
                setSelectedFile(f);
                setIsDrawerOpen(true);
              }}
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
              title="Inspect Details & Version History"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedFile?.title || 'File Overview'}
        subtitle={`${selectedFile?.courseCode} - ${selectedFile?.category}`}
      >
        {selectedFile && (
          <div className="space-y-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-3xs text-slate-400 block">Status</span>
                <span className="text-sm font-bold text-indigo-900">{selectedFile.status}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedFile.status === 'Approved' && (
                  <button
                    onClick={() => setShowCertificateFile(selectedFile)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Certificate</span>
                  </button>
                )}
                <button
                  onClick={() => setShowDossierFile(selectedFile)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {selectedFile.remarks && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-2xs font-bold text-amber-900">HOD Remarks:</span>
                <p className="text-xs text-amber-800">{selectedFile.remarks}</p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
                Version History Audit Trail ({selectedFile.versionHistory.length})
              </h4>
              <div className="space-y-3 divide-y divide-slate-100">
                {selectedFile.versionHistory.map((ver) => (
                  <div key={ver.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-3xs border">
                        {ver.versionNumber}
                      </span>
                      <span className="text-3xs text-slate-400">{ver.uploadedAt}</span>
                    </div>
                    <p className="font-semibold text-slate-800">{ver.fileName}</p>
                    <p className="text-3xs text-slate-500">{ver.changeLog}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      <FileUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      {/* Official Certificate Modal (Step 20, 21) */}
      {showCertificateFile && (
        <CourseFileCertificateModal
          courseFile={showCertificateFile}
          onClose={() => setShowCertificateFile(null)}
        />
      )}

      {/* Official Printable Course Dossier Modal (Step 21) */}
      {showDossierFile && (
        <CourseFileDossierModal
          courseFile={showDossierFile}
          onClose={() => setShowDossierFile(null)}
        />
      )}
    </div>
  );
};
