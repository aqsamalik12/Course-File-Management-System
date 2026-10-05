import React, { useState } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { CourseFileItem } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { ApprovalModal } from '../common/ApprovalModal';
import { ActionButton } from '../common/ActionButton';
import { CheckCircle, Clock, FileText, AlertTriangle } from 'lucide-react';

interface ApprovalManagementProps {
  activeModule?: string;
}

export const ApprovalManagement: React.FC<ApprovalManagementProps> = ({ activeModule }) => {
  const { courseFiles } = useCFMS();
  const [selectedFile, setSelectedFile] = useState<CourseFileItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredApprovals = courseFiles.filter((f) => {
    if (activeModule === 'Approved') return f.status === 'Approved';
    if (activeModule === 'Rejected' || activeModule === 'Returned Files') {
      return f.status === 'Returned' || f.status === 'Returned for Revision' || f.status === 'Revision Requested' || f.status === 'Rejected';
    }
    return f.status === 'Submitted' || f.status === 'In Review' || f.status === 'Revision Requested';
  });

  const columns: Column<CourseFileItem>[] = [
    {
      key: 'title',
      header: 'Course File Document',
      sortable: true,
      render: (f) => (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-lg shrink-0 mt-0.5">
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs block">{f.title}</span>
            <span className="text-3xs font-mono text-indigo-700 font-semibold">{f.courseCode} • {f.category}</span>
          </div>
        </div>
      )
    },
    {
      key: 'teacherName',
      header: 'Submitted By',
      sortable: true,
      render: (f) => (
        <div>
          <p className="font-bold text-slate-900 text-xs whitespace-nowrap">{f.teacherName}</p>
          <span className="text-3xs text-slate-500 whitespace-nowrap">{f.teacherRole === 'VISITING_TEACHER' ? 'Visiting Faculty' : 'Regular Faculty'}</span>
        </div>
      )
    },
    {
      key: 'departmentName',
      header: 'Department',
      sortable: true,
      render: (f) => (
        <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">
          {(f.departmentName || '').replace('Department of ', '')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Approval Status',
      sortable: true,
      render: (f) => (
        <span
          className={`whitespace-nowrap inline-flex items-center px-2.5 py-1 rounded-full text-3xs font-bold border shadow-2xs ${
            f.status === 'Approved'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : f.status === 'Returned' || f.status === 'Returned for Revision'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : f.status === 'Rejected'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
          }`}
        >
          {f.status}
        </span>
      )
    },
    {
      key: 'remarks',
      header: 'HOD Remarks & Feedback',
      render: (f) => (
        <span className="text-2xs font-medium text-slate-700 italic max-w-xs truncate block">
          {f.remarks ? `"${f.remarks}"` : 'Pending HOD evaluation'}
        </span>
      )
    },
    {
      key: 'uploadDate',
      header: 'Submitted Date',
      sortable: true,
      render: (f) => <span className="text-2xs font-mono text-slate-600 whitespace-nowrap">{f.uploadDate}</span>
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold font-heading text-slate-900">Approval Management Queue</h2>
      </div>

      <DataTable
        data={filteredApprovals}
        columns={columns}
        searchPlaceholder="Search approvals by title, course, teacher..."
        onRowClick={(f) => {
          setSelectedFile(f);
          setIsModalOpen(true);
        }}
        actions={(f) => (
          <ActionButton
            variant="approve"
            label="Review File"
            size="sm"
            onClick={() => {
              setSelectedFile(f);
              setIsModalOpen(true);
            }}
          />
        )}
      />

      <ApprovalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        file={selectedFile}
      />
    </div>
  );
};
