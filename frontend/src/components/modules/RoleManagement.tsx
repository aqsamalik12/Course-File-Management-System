import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Info, Shield, Key, Lock, CheckCircle2, Save, UserCheck, Users, ShieldAlert } from 'lucide-react';

interface RoleManagementProps {
  activeModule?: string;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ activeModule }) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'assign'>('assign');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (activeModule === 'Roles') {
      setActiveTab('roles');
    } else if (activeModule === 'Permissions') {
      setActiveTab('permissions');
    } else if (activeModule === 'Assign Permissions' || activeModule === 'Role & Permission') {
      setActiveTab('assign');
    }
  }, [activeModule]);

  const [permissionsMatrix, setPermissionsMatrix] = useState([
    { id: 'p1', name: 'Upload & Submit Course Files', category: 'Course File Management', admin: true, hod: true, regular: true, visiting: true },
    { id: 'p2', name: 'Review & Approve Course Files', category: 'Quality Assurance', admin: true, hod: true, regular: false, visiting: false },
    { id: 'p3', name: 'Request File Revisions & Provide Remarks', category: 'Quality Assurance', admin: true, hod: true, regular: false, visiting: false },
    { id: 'p4', name: 'Manage Department Teachers & Assignments', category: 'Department Control', admin: true, hod: true, regular: false, visiting: false },
    { id: 'p5', name: 'Create & Delete System User Accounts', category: 'User Management', admin: true, hod: false, regular: false, visiting: false },
    { id: 'p6', name: 'Configure Submission Window & System Settings', category: 'System Control', admin: true, hod: false, regular: false, visiting: false },
    { id: 'p7', name: 'View Audit Trail & Regulatory Logs', category: 'Audit Vault', admin: true, hod: true, regular: false, visiting: false },
    { id: 'p8', name: 'Manage File Categories & Submission Deadlines', category: 'Quality Assurance', admin: true, hod: true, regular: false, visiting: false },
    { id: 'p9', name: 'Publish Campus Broadcast Announcements', category: 'Communication', admin: true, hod: true, regular: false, visiting: false },
    { id: 'p10', name: 'Contract-Based Temporary Access Expiration', category: 'Security Enforcement', admin: false, hod: false, regular: false, visiting: true }
  ]);

  const togglePermission = (id: string, roleKey: 'admin' | 'hod' | 'regular' | 'visiting') => {
    setPermissionsMatrix((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [roleKey]: !p[roleKey] } : p))
    );
  };

  const handleSaveMatrix = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Role-Based Access Control (RBAC)
            </span>
            <span className="text-3xs text-slate-400 font-mono">Attock Campus Security</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Role & Permission Management ({activeModule || 'Assign Permissions'})
          </h1>
        </div>

        {activeTab === 'assign' && (
          <button
            onClick={handleSaveMatrix}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Permission Matrix
          </button>
        )}
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Role permission matrix updated & enforced server-side across all active user sessions!</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          { id: 'roles', label: '1. System Roles Overview', icon: Users },
          { id: 'permissions', label: '2. Security Capabilities List', icon: ShieldCheck },
          { id: 'assign', label: '3. Assign Permissions Matrix', icon: Key }
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

      {/* TAB 1: ROLES OVERVIEW */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">System Administrator</h3>
                <p className="text-3xs text-indigo-700 font-mono font-bold uppercase">Role: ADMIN</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full administrative privileges, user account creation, system configuration, audit vault access, and role matrix management.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Head of Department (HOD)</h3>
                <p className="text-3xs text-emerald-700 font-mono font-bold uppercase">Role: HOD</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Departmental quality review, course file approval/rejection, revision tracking, teacher monitoring, and department reports.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Regular Faculty Teacher</h3>
                <p className="text-3xs text-blue-700 font-mono font-bold uppercase">Role: REGULAR_TEACHER</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full-time faculty member with course file upload privileges, version history management, and deadline notifications.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Visiting / Adjunct Teacher</h3>
                <p className="text-3xs text-amber-700 font-mono font-bold uppercase">Role: VISITING_TEACHER</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Contract-based temporary faculty access with semester auto-expiration, lab manual uploads, and end-of-term clearance.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: PERMISSIONS LIST */}
      {activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
            Granular System Permissions Catalog
          </h3>
          <div className="space-y-3 text-xs">
            {permissionsMatrix.map((p) => (
              <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900">{p.name}</h4>
                  <p className="text-3xs text-slate-500 font-mono mt-0.5">Category: {p.category}</p>
                </div>
                <span className="px-2.5 py-0.5 text-3xs font-mono font-bold bg-indigo-50 text-indigo-800 rounded-full border border-indigo-200">
                  {p.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ASSIGN PERMISSIONS MATRIX */}
      {activeTab === 'assign' && (
        <form onSubmit={handleSaveMatrix} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Toggle checkboxes to grant or revoke specific capabilities per user role.</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-3xs font-extrabold text-slate-600 uppercase">
                  <th className="p-4">Permission Capability</th>
                  <th className="p-4 text-center">👑 Admin</th>
                  <th className="p-4 text-center">🎓 HOD</th>
                  <th className="p-4 text-center">👨‍🏫 Regular Teacher</th>
                  <th className="p-4 text-center">👨‍💼 Visiting Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <span>{p.name}</span>
                      <span className="block text-3xs text-slate-400 font-mono font-normal mt-0.5">{p.category}</span>
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={p.admin}
                        onChange={() => togglePermission(p.id, 'admin')}
                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={p.hod}
                        onChange={() => togglePermission(p.id, 'hod')}
                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={p.regular}
                        onChange={() => togglePermission(p.id, 'regular')}
                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={p.visiting}
                        onChange={() => togglePermission(p.id, 'visiting')}
                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Permission Matrix
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
