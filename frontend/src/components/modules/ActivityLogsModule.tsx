import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { ActivityLog } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { History, Shield, Terminal, KeyRound, UserCheck, FileText, CheckCircle2 } from 'lucide-react';

interface ActivityLogsModuleProps {
  activeModule?: string;
}

export const ActivityLogsModule: React.FC<ActivityLogsModuleProps> = ({ activeModule }) => {
  const { activityLogs } = useCFMS();
  const [activeTab, setActiveTab] = useState<'all' | 'login' | 'user' | 'approval' | 'file'>('file');

  useEffect(() => {
    if (activeModule === 'Login Logs') {
      setActiveTab('login');
    } else if (activeModule === 'User Logs') {
      setActiveTab('user');
    } else if (activeModule === 'Approval Logs') {
      setActiveTab('approval');
    } else if (activeModule === 'File Logs') {
      setActiveTab('file');
    } else if (activeModule === 'Activity Logs' || activeModule === 'System Logs') {
      setActiveTab('all');
    }
  }, [activeModule]);

  const filteredLogs = activityLogs.filter((a) => {
    if (activeTab === 'login') {
      return a.module === 'Authentication' || a.action.includes('LOGIN') || a.action.includes('LOGOUT') || a.action.includes('PASSWORD');
    }
    if (activeTab === 'user') {
      return a.module === 'User Management' || a.action.includes('USER') || a.action.includes('ROLE') || a.action.includes('LOCK') || a.action.includes('UNLOCK');
    }
    if (activeTab === 'approval') {
      return a.module === 'Approval Management' || a.action.includes('APPROV') || a.action.includes('REVISION') || a.action.includes('REJECT');
    }
    if (activeTab === 'file') {
      return (
        a.module === 'Course File Management' ||
        a.action.includes('FILE') ||
        a.action.includes('UPLOAD') ||
        a.action.includes('SUBMIT') ||
        a.action.includes('VERSION') ||
        a.action.includes('PURGE') ||
        a.action.includes('RESTORE')
      );
    }
    return true;
  });

  const columns: Column<ActivityLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (a) => <span className="font-mono text-3xs font-semibold text-slate-600 whitespace-nowrap">{a.timestamp}</span>
    },
    {
      key: 'userName',
      header: 'User Name',
      sortable: true,
      render: (a) => <span className="font-bold text-slate-900 text-xs whitespace-nowrap">{a.userName}</span>
    },
    {
      key: 'userRole',
      header: 'System Role',
      sortable: true,
      render: (a) => {
        const r = (a.userRole || '').toUpperCase();
        let label: string = a.userRole;
        let color = 'bg-slate-100 text-slate-700 border-slate-200';

        if (r === 'ADMIN' || r === 'SYSTEM ADMIN') {
          label = 'System Admin';
          color = 'bg-purple-50 text-purple-700 border-purple-200/80';
        } else if (r === 'HOD') {
          label = 'HOD';
          color = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
        } else if (r === 'REGULAR_TEACHER' || r.includes('REGULAR')) {
          label = 'Regular Faculty';
          color = 'bg-blue-50 text-blue-700 border-blue-200/80';
        } else if (r === 'VISITING_TEACHER' || r.includes('VISITING')) {
          label = 'Visiting Faculty';
          color = 'bg-amber-50 text-amber-800 border-amber-200/80';
        }

        return (
          <span className={`whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded-full text-3xs font-bold border shadow-2xs ${color}`}>
            {label}
          </span>
        );
      }
    },
    {
      key: 'action',
      header: 'Event Action',
      sortable: true,
      render: (a) => (
        <span className="font-mono text-3xs font-extrabold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md border border-slate-200 whitespace-nowrap">
          {a.action}
        </span>
      )
    },
    {
      key: 'details',
      header: 'Activity Details',
      render: (a) => <span className="text-xs text-slate-700 font-medium">{a.details}</span>
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      sortable: true,
      render: (a) => <span className="font-mono text-xs text-slate-500 font-semibold whitespace-nowrap">{a.ipAddress}</span>
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Audit Trail & System Integrity Stream
            </span>
            <span className="text-3xs text-slate-400 font-mono">{filteredLogs.length} Logged Events</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Activity & Security Logs ({activeModule || 'File Logs'})
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          { id: 'all', label: `All Activity Logs (${activityLogs.length})`, icon: History },
          { id: 'login', label: 'Login Logs', icon: KeyRound },
          { id: 'user', label: 'User Logs', icon: UserCheck },
          { id: 'approval', label: 'Approval Logs', icon: CheckCircle2 },
          { id: 'file', label: 'File Logs', icon: FileText }
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
          searchPlaceholder="Filter activity logs by user, action, IP, or details..."
        />
      </div>
    </div>
  );
};
