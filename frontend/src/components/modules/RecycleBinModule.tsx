import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { CourseFileItem } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ActionButton } from '../common/ActionButton';
import { Trash2, RotateCcw, AlertTriangle, ShieldAlert, Archive, CheckCircle2 } from 'lucide-react';

interface RecycleBinModuleProps {
  activeModule?: string;
}

export const RecycleBinModule: React.FC<RecycleBinModuleProps> = ({ activeModule }) => {
  const { courseFiles, restoreCourseFile, permanentlyDeleteFile } = useCFMS();
  const [activeTab, setActiveTab] = useState<'all' | 'restore' | 'purge'>('all');

  useEffect(() => {
    if (activeModule === 'Restore') {
      setActiveTab('restore');
    } else if (activeModule === 'Permanent Delete') {
      setActiveTab('purge');
    } else if (activeModule === 'Deleted Files' || activeModule === 'Recycle Bin') {
      setActiveTab('all');
    }
  }, [activeModule]);

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

  const deletedFiles = courseFiles.filter((f) => f.deleted);

  const handleBulkRestore = () => {
    deletedFiles.forEach((f) => restoreCourseFile(f.id));
  };

  const handleEmptyTrash = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Empty Recycle Bin Permanently',
      message: `Are you sure you want to permanently purge all ${deletedFiles.length} files from university server storage? This action cannot be undone.`,
      action: () => {
        deletedFiles.forEach((f) => permanentlyDeleteFile(f.id));
      }
    });
  };

  const columns: Column<CourseFileItem>[] = [
    {
      key: 'title',
      header: 'Deleted Document',
      render: (f) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">{f.title}</span>
          <span className="text-3xs text-slate-500 font-mono">{f.courseCode} • Deleted on: {f.deletedAt || 'Recently'}</span>
        </div>
      )
    },
    {
      key: 'teacherName',
      header: 'Owner',
      render: (f) => <span className="text-xs font-semibold text-slate-800">{f.teacherName}</span>
    },
    {
      key: 'departmentName',
      header: 'Department',
      render: (f) => <span className="text-xs text-slate-600">{f.departmentName}</span>
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Retention & Disposal Management
            </span>
            <span className="text-3xs text-slate-400 font-mono">{deletedFiles.length} Deleted File(s)</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Recycle Bin & Data Purge ({activeModule || 'Permanent Delete'})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {deletedFiles.length > 0 && (
            <>
              <button
                onClick={handleBulkRestore}
                className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore All Files</span>
              </button>
              <button
                onClick={handleEmptyTrash}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash (Purge All)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Warning Notice for Permanent Delete */}
      {(activeTab === 'purge' || activeModule === 'Permanent Delete') && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold font-heading text-rose-950">Permanent Purge Warning</h4>
            <p className="text-rose-700 mt-0.5">
              Permanently deleted course files cannot be recovered from backups or audit logs. Please confirm document identity before executing a server purge.
            </p>
          </div>
        </div>
      )}

      {/* Sub-module Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          { id: 'all', label: `All Deleted Files (${deletedFiles.length})`, icon: Trash2 },
          { id: 'restore', label: 'File Recovery Queue', icon: RotateCcw },
          { id: 'purge', label: 'Permanent Purge Zone', icon: ShieldAlert }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1E7B4E] text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {deletedFiles.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Trash2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">Recycle Bin is currently empty.</p>
            <p className="text-3xs text-slate-400">Soft deleted files will appear here for 30 days before server purge.</p>
          </div>
        ) : (
          <DataTable
            data={deletedFiles}
            columns={columns}
            searchPlaceholder="Search deleted course files by title or teacher..."
            actions={(f) => (
              <div className="flex items-center justify-end gap-2">
                <ActionButton
                  variant="restore"
                  label="Restore File"
                  size="sm"
                  onClick={() => restoreCourseFile(f.id)}
                />
                <ActionButton
                  variant="delete"
                  label="Purge Permanently"
                  size="sm"
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: `Permanently Purge ${f.title}`,
                      message: `Are you sure? This document will be irrevocably deleted from university storage.`,
                      action: () => permanentlyDeleteFile(f.id)
                    });
                  }}
                />
              </div>
            )}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
};
