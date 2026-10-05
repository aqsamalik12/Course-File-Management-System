import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { CourseFileItem, FileStatus } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { DetailDrawer } from '../common/DetailDrawer';
import { FileUploadModal } from '../common/FileUploadModal';
import { ApprovalModal } from '../common/ApprovalModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ActionButton } from '../common/ActionButton';
import {
  FileText,
  Upload,
  Download,
  Eye,
  History,
  Archive,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Layers,
  Sparkles
} from 'lucide-react';

interface CourseFileManagementProps {
  activeModule?: string;
}

export const CourseFileManagement: React.FC<CourseFileManagementProps> = ({ activeModule }) => {
  const { courseFiles, sessions, archiveCourseFile, softDeleteCourseFile } = useCFMS();
  const { activeRole } = useAuth();

  const [selectedFile, setSelectedFile] = useState<CourseFileItem | null>(null);
  const [selectedSessionFolder, setSelectedSessionFolder] = useState<string | null>(
    activeModule === 'Session Folders' ? 'Fall 2026' : null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {}
  });

  useEffect(() => {
    if (activeModule === 'Upload Files') {
      setIsUploadOpen(true);
    }
  }, [activeModule]);

  const activeFiles = courseFiles.filter((f) => {
    if (activeModule === 'Archived Files') return f.archived;
    if (f.deleted) return false;

    if (activeModule === 'Pending Files' || activeModule === 'Submitted Files') {
      return f.status === 'Submitted' || f.status === 'Under Review' || f.status === 'In Review';
    }
    if (activeModule === 'Approved Files') {
      return f.status === 'Approved';
    }
    if (activeModule === 'Revision Requests' || activeModule === 'Rejected Files') {
      return f.status === 'Returned' || f.status === 'Returned for Revision' || f.status === 'Revision Requested' || f.status === 'Rejected';
    }
    return !f.archived;
  });

  const columns: Column<CourseFileItem>[] = [
    {
      key: 'title',
      header: 'Document / Course Code',
      render: (f) => (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg shrink-0 mt-0.5">
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs block">{f.title}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-3xs font-bold font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">
                {f.courseCode}
              </span>
              <span className="text-3xs text-slate-400">• {f.category}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'teacherName',
      header: 'Faculty Member',
      render: (f) => (
        <div>
          <p className="font-bold text-slate-800 text-2xs">{f.teacherName}</p>
          <span className="text-3xs text-slate-400">{(f.departmentName || '').replace('Department of ', '')}</span>
        </div>
      )
    },
    {
      key: 'currentVersion',
      header: 'Version / Size',
      render: (f) => (
        <div>
          <span className="font-bold text-slate-900 text-3xs px-2 py-0.5 bg-slate-100 rounded border">
            {f.currentVersion}
          </span>
          <span className="text-3xs text-slate-400 block mt-0.5">{f.fileSize} • {f.fileType}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Approval Status',
      render: (f) => {
        const statusMap: Record<string, { bg: string; text: string; icon: any }> = {
          Approved: { bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-800', icon: CheckCircle },
          Submitted: { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-800', icon: Clock },
          'In Review': { bg: 'bg-indigo-100 border-indigo-200', text: 'text-indigo-800', icon: Clock },
          Returned: { bg: 'bg-rose-100 border-rose-200', text: 'text-rose-800', icon: AlertTriangle },
          'Returned for Revision': { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-800', icon: AlertTriangle }
        };
        const s = statusMap[f.status] || { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700', icon: Clock };
        const IconComponent = s.icon;
        return (
          <span className={`px-2.5 py-1 rounded-full text-3xs font-bold border flex items-center gap-1 w-max ${s.bg} ${s.text}`}>
            <IconComponent className="w-3 h-3" />
            {f.status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Student Batch Folder Directory
            </span>
            {selectedSessionFolder && (
              <span className="text-3xs text-slate-500 font-bold">
                • Filtered by Batch: {selectedSessionFolder}
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 mt-1">
            Batch-Wise Course File Folders
          </h2>
          <p className="text-xs text-slate-500">
            Admin created student batches (e.g. 2023–2027, 2022–2026) automatically organize HOD & Faculty course files into batch-wise directory folders.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedSessionFolder && (
            <button
              onClick={() => setSelectedSessionFolder(null)}
              className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
            >
              Clear Batch Filter
            </button>
          )}
          {(activeRole === 'REGULAR_TEACHER' || activeRole === 'VISITING_TEACHER' || activeRole === 'HOD') && (
            <ActionButton
              variant="primary"
              label="Upload Course File"
              onClick={() => setIsUploadOpen(true)}
              size="md"
            />
          )}
        </div>
      </div>

      {/* Interactive Student Batch Directory Folders Grid (Created by Admin) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 font-heading">
            HOD Batch Directory Folders (Student Batches)
          </h3>
          <span className="text-3xs font-mono text-slate-400 font-bold">Admin Managed Batches</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { batchName: 'Batch 2023–2027', status: 'Active (5th Sem)', code: '2023-2027' },
            { batchName: 'Batch 2022–2026', status: 'Active (7th Sem)', code: '2022-2026' },
            { batchName: 'Batch 2024–2028', status: 'Active (3rd Sem)', code: '2024-2028' },
            { batchName: 'Batch 2021–2025', status: 'Graduating Batch', code: '2021-2025' }
          ].map((b) => {
            const isSelected = selectedSessionFolder === b.code;
            const batchFilesCount = courseFiles.filter(
              (f) => !f.deleted && (f.batch === b.code || (b.code === '2023-2027' && !f.batch))
            ).length;

            return (
              <button
                key={b.code}
                type="button"
                onClick={() => setSelectedSessionFolder(isSelected ? null : b.code)}
                className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-[#165534] text-white border-[#165534] shadow-md ring-2 ring-emerald-600/30'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-50 text-[#165534]'
                    }`}
                  >
                    <Layers className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-3xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-emerald-800 text-emerald-100 border-emerald-700'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {batchFilesCount} Files
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold font-heading">{b.batchName}</h4>
                  <span
                    className={`text-3xs font-mono font-semibold block mt-0.5 ${
                      isSelected ? 'text-emerald-200' : 'text-slate-500'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <DataTable
        data={activeFiles}
        columns={columns}
        searchPlaceholder="Search files by course code, title, teacher name..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'Submitted', label: 'Submitted' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Returned', label: 'Returned for Revision' }
            ]
          }
        ]}
        onRowClick={(f) => {
          setSelectedFile(f);
          setIsDrawerOpen(true);
        }}
        actions={(f) => (
          <div className="flex items-center justify-end gap-1.5">
            <ActionButton
              variant="view"
              label="Preview"
              size="sm"
              onClick={() => {
                setSelectedFile(f);
                setIsDrawerOpen(true);
              }}
            />
            <ActionButton
              variant="history"
              label="Versions"
              size="sm"
              onClick={() => {
                setSelectedFile(f);
                setIsDrawerOpen(true);
              }}
            />
            <ActionButton
              variant="archive"
              label="Archive"
              size="sm"
              onClick={() => archiveCourseFile(f.id)}
            />
            {activeRole === 'ADMIN' && (
              <ActionButton
                variant="delete"
                label="Recycle"
                size="sm"
                onClick={() => softDeleteCourseFile(f.id)}
              />
            )}
          </div>
        )}
      />

      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedFile?.title || 'Course File Details'}
        subtitle={selectedFile?.courseCode}
      >
        {selectedFile && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <p><strong>Course:</strong> {selectedFile.courseTitle} ({selectedFile.courseCode})</p>
              <p><strong>Teacher / Instructor:</strong> {selectedFile.teacherName} ({selectedFile.teacherRole === 'VISITING_TEACHER' ? 'Visiting Faculty' : 'Regular Faculty'})</p>
              <p><strong>Department:</strong> {selectedFile.departmentName}</p>
              <p><strong>Version & File Size:</strong> {selectedFile.currentVersion} • {selectedFile.fileSize}</p>
              <p><strong>Submission Date:</strong> {selectedFile.uploadDate}</p>
            </div>

            {/* HOD Review & Decision Card */}
            <div
              className={`p-4 rounded-xl border space-y-2.5 ${
                selectedFile.status === 'Approved'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : selectedFile.status === 'Returned' || selectedFile.status === 'Returned for Revision'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : selectedFile.status === 'Rejected'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between border-b pb-2 border-slate-200/60">
                <span className="font-extrabold text-3xs uppercase tracking-wider">HOD Review Status</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-3xs font-bold border ${
                    selectedFile.status === 'Approved'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : selectedFile.status === 'Returned' || selectedFile.status === 'Returned for Revision'
                      ? 'bg-amber-600 text-white border-amber-700'
                      : selectedFile.status === 'Rejected'
                      ? 'bg-rose-600 text-white border-rose-700'
                      : 'bg-slate-600 text-white border-slate-700'
                  }`}
                >
                  {selectedFile.status}
                </span>
              </div>
              <p><strong>Reviewed By HOD:</strong> {selectedFile.reviewedBy || 'Department HOD'}</p>
              <p><strong>Review Date:</strong> {selectedFile.reviewedAt || selectedFile.uploadDate}</p>
              <div>
                <p className="font-bold text-slate-800 mb-1">HOD Remarks & Feedback Notes:</p>
                <div className="p-3 bg-white/90 rounded-lg border border-slate-200 text-slate-800 font-medium italic">
                  "{selectedFile.remarks || 'No detailed HOD remarks recorded.'}"
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">Version History ({selectedFile.versionHistory.length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFile.versionHistory.map((ver) => (
                  <div key={ver.id} className="p-3 bg-white border rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{ver.versionNumber} - {ver.fileName}</p>
                      <p className="text-3xs text-slate-500">{ver.uploadedBy} on {ver.uploadedAt}</p>
                      <p className="text-3xs text-indigo-700 font-semibold">{ver.changeLog}</p>
                    </div>
                    <a
                      href={ver.fileUrl}
                      download
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-md hover:bg-slate-200 text-3xs"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {selectedFile && (
        <ApprovalModal
          isOpen={isApprovalOpen}
          onClose={() => setIsApprovalOpen(false)}
          file={selectedFile}
        />
      )}
    </div>
  );
};
