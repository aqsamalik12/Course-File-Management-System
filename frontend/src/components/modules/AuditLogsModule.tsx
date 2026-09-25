import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { AuditLog } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { FileText, Shield, Key, CheckCircle2, UserCheck, Lock, ShieldCheck } from 'lucide-react';

interface AuditLogsModuleProps {
  activeModule?: string;
}

export const AuditLogsModule: React.FC<AuditLogsModuleProps> = ({ activeModule }) => {
  const { auditLogs } = useCFMS();
  const [activeTab, setActiveTab] = useState<'all' | 'approval' | 'file' | 'user'>('approval');

  useEffect(() => {
    if (activeModule === 'Approval Audit') {
      setActiveTab('approval');
    } else if (activeModule === 'File Audit') {
      setActiveTab('file');
    } else if (activeModule === 'User Audit') {
      setActiveTab('user');
    } else if (activeModule === 'Audit Logs' || activeModule === 'System Audit') {
      setActiveTab('all');
    }
  }, [activeModule]);

  const filteredLogs = auditLogs.filter((a) => {
    if (activeTab === 'approval') {
      return (
        a.resource.includes('Approval') ||
        a.eventType.includes('APPROVAL') ||
        a.eventType.includes('REVISION') ||
        a.eventType.includes('HOD') ||
        a.role === 'HOD'
      );
    }
    if (activeTab === 'file') {
      return (
        a.resource.includes('Storage') ||
        a.resource.includes('CourseFile') ||
        a.eventType.includes('FILE') ||
        a.eventType.includes('CHECKSUM')
      );
    }
    if (activeTab === 'user') {
      return (
        a.resource.includes('User') ||
        a.eventType.includes('USER') ||
        a.eventType.includes('CONTRACT') ||
        a.eventType.includes('PERMISSION')
      );
    }
    return true;
  });

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'UTC Timestamp',
      render: (a) => <span className="font-mono text-3xs font-semibold text-slate-600">{a.timestamp}</span>
    },
    {
      key: 'actor',
      header: 'Actor / Role',
      render: (a) => (
        <div>
          <p className="font-bold text-slate-900 text-2xs">{a.actor}</p>
          <span className="text-3xs font-semibold text-indigo-700">{a.role}</span>
        </div>
      )
    },
    {
      key: 'eventType',
      header: 'Event Type',
      render: (a) => (
        <span className="font-mono text-3xs font-extrabold px-2 py-0.5 bg-[#1E7B4E]/10 text-[#1E7B4E] rounded border border-emerald-200">
          {a.eventType}
        </span>
      )
    },
    {
      key: 'resource',
      header: 'Target Resource',
      render: (a) => <span className="font-mono text-3xs font-semibold text-slate-700">{a.resource}</span>
    },
    {
      key: 'signature',
      header: 'SHA-256 Hash Signature',
      render: (a) => <span className="font-mono text-3xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{a.signature}</span>
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              QEC Immutable Audit Vault
            </span>
            <span className="text-3xs text-slate-400 font-mono">{filteredLogs.length} Verified Entries</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Regulatory Audit Logs ({activeModule || 'Approval Audit'})
          </h1>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          { id: 'all', label: `All Audit Logs (${auditLogs.length})`, icon: ShieldCheck },
          { id: 'approval', label: 'Approval Audit Logs', icon: CheckCircle2 },
          { id: 'file', label: 'File Checksum Audit', icon: FileText },
          { id: 'user', label: 'User Provisioning Audit', icon: UserCheck }
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
        <DataTable
          data={filteredLogs}
          columns={columns}
          searchPlaceholder="Filter audit logs by actor, event, resource, or SHA-256 signature..."
        />
      </div>
    </div>
  );
};
