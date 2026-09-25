import React, { useState } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { CourseFileItem } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { DetailDrawer } from '../common/DetailDrawer';
import {
  History,
  FileArchive,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  FileText
} from 'lucide-react';

export const SubmissionHistoryModule: React.FC = () => {
  const { courseFiles } = useCFMS();
  const { currentUser } = useAuth();

  const [selectedFile, setSelectedFile] = useState<CourseFileItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const teacherName = currentUser?.name || 'Dr. Tariq Mahmood';
  const myFiles = courseFiles.filter(
    (f) => (f.teacherId === currentUser?.id || f.teacherName === teacherName) && !f.deleted
  );

  const columns: Column<CourseFileItem>[] = [
    {
      key: 'courseCode',
      header: 'Course Code',
      sortable: true,
      render: (f) => (
        <span className="font-mono text-xs font-extrabold text-[#1E7B4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {f.courseCode}
        </span>
      )
    },
    {
      key: 'title',
      header: 'Course File Title',
      sortable: true,
      render: (f) => <span className="font-bold text-slate-900 text-xs">{f.title}</span>
    },
    {
      key: 'currentVersion',
      header: 'Version',
      sortable: true,
      render: (f) => (
        <span className="font-mono text-3xs font-extrabold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border">
          {f.currentVersion}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Approval Status',
      sortable: true,
      render: (f) => (
        <span
          className={`whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded-full text-3xs font-bold border shadow-2xs ${
            f.status === 'Approved'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : f.status === 'Submitted' || f.status === 'In Review'
              ? 'bg-[#E6F4EC] text-[#165534] border-[#1E7B4E]/30'
              : f.status === 'Returned for Revision' || f.status === 'Revision Requested' || f.status === 'Returned'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {f.status}
        </span>
      )
    },
    {
      key: 'hodRemarks',
      header: 'HOD Remarks & Feedback',
      render: (f) => (
        <span className="text-xs text-slate-600 italic">
          {f.hodRemarks || (f.status === 'Approved' ? 'Course file verified and approved for archiving.' : 'Awaiting HOD review.')}
        </span>
      )
    },
    {
      key: 'uploadDate',
      header: 'Submission Date',
      sortable: true,
      render: (f) => <span className="text-3xs text-slate-500 font-mono">{f.uploadDate}</span>
    },
    {
      key: 'id',
      header: 'Actions',
      render: (f) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => {
              setSelectedFile(f);
              setIsDrawerOpen(true);
            }}
            className="px-2.5 py-1 text-3xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all cursor-pointer"
          >
            View Details
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Personal Audit Log
            </span>
            <span className="text-3xs text-slate-400 font-mono">{myFiles.length} Submissions</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Course File Submission History
          </h1>
        </div>
      </div>

      <DataTable
        data={myFiles}
        columns={columns}
        searchPlaceholder="Search submission history by course code or title..."
        onRowClick={(f) => {
          setSelectedFile(f);
          setIsDrawerOpen(true);
        }}
        actions={(f) => (
          <button
            onClick={() => {
              setSelectedFile(f);
              setIsDrawerOpen(true);
            }}
            className="p-1.5 text-slate-500 hover:text-[#1E7B4E] hover:bg-emerald-50 rounded-lg cursor-pointer"
            title="Inspect Details & Audit Trail"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />

      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedFile?.title || 'Submission Audit Trail'}
        subtitle={`${selectedFile?.courseCode} - ${selectedFile?.departmentName}`}
      >
        {selectedFile && (
          <div className="space-y-6 text-xs font-sans">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-3xs text-slate-400 block font-mono">Current Status</span>
                <span className="text-sm font-extrabold text-[#1E7B4E]">{selectedFile.status}</span>
              </div>
              <button
                onClick={() => alert(`Downloading archive for ${selectedFile.title}`)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Archive</span>
              </button>
            </div>

            {selectedFile.remarks && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-2xs font-extrabold text-amber-900 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-700" />
                  <span>HOD Feedback:</span>
                </span>
                <p className="text-xs text-amber-800 font-medium pl-5">{selectedFile.remarks}</p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
                Version History Audit Trail ({selectedFile.versionHistory.length})
              </h4>
              <div className="space-y-3">
                {selectedFile.versionHistory.map((ver) => (
                  <div key={ver.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#1E7B4E] bg-white px-2 py-0.5 rounded border text-3xs font-mono">
                        {ver.versionNumber}
                      </span>
                      <span className="text-3xs font-mono text-slate-400">{ver.uploadedAt}</span>
                    </div>
                    <p className="font-bold text-slate-800 text-xs">{ver.fileName} ({ver.fileSize})</p>
                    <p className="text-3xs text-slate-600">{ver.changeLog}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
};
