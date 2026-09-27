import React, { useState, useEffect, useMemo } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { HODAssignment } from '../../types';
import {
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
  Building2,
  Landmark,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  FileCheck2,
  UserCheck,
  Clock,
  BarChart3,
  Mail,
  Copy,
  Check
} from 'lucide-react';

interface HODAccessPermissionsProps {
  activeSubModule?: 'HOD Access Control' | 'Reset HOD Password' | string;
  onNavigate?: (moduleName: string) => void;
}

export const HODAccessPermissions: React.FC<HODAccessPermissionsProps> = ({
  activeSubModule = 'HOD Access Control',
  onNavigate
}) => {
  const {
    hodAssignments,
    campuses,
    departments,
    updateHODAssignment,
    resetHODPassword,
    refreshHODAssignments,
    refreshCampuses,
    refreshDepartments
  } = useCFMS();

  // Active view tab (derived from subModule or internal toggle)
  const currentTab = useMemo(() => {
    if (activeSubModule === 'Reset HOD Password') return 'Reset HOD Password';
    return 'HOD Access Control';
  }, [activeSubModule]);

  // Loading & Notification States
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [campusFilter, setCampusFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Updating permission tracking
  const [savingHodId, setSavingHodId] = useState<string | null>(null);

  // Reset Password State
  const [selectedHodIdForReset, setSelectedHodIdForReset] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          refreshHODAssignments(),
          refreshCampuses(),
          refreshDepartments()
        ]);
      } catch {}
      finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Filtered HODs list
  const filteredHODs = useMemo(() => {
    let list = hodAssignments || [];

    if (campusFilter !== 'ALL') {
      list = list.filter((a) => a.campusId === campusFilter);
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          (a.hodName && a.hodName.toLowerCase().includes(q)) ||
          (a.hodEmail && a.hodEmail.toLowerCase().includes(q)) ||
          (a.departmentName && a.departmentName.toLowerCase().includes(q)) ||
          (a.campusName && a.campusName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [hodAssignments, campusFilter, statusFilter, searchQuery]);

  // Stats calculation
  const totalHODs = hodAssignments.length;
  const activeHODs = hodAssignments.filter((a) => a.status === 'Active').length;
  const inactiveHODs = hodAssignments.filter((a) => a.status === 'Inactive').length;

  // Toggle Account Active / Inactive Status
  const handleToggleAccountStatus = async (assignment: HODAssignment) => {
    const nextStatus = assignment.status === 'Active' ? 'Inactive' : 'Active';
    setSavingHodId(assignment.id);
    try {
      const ok = await updateHODAssignment(assignment.id, { status: nextStatus });
      if (ok) {
        setSuccessMessage(
          `Account for ${assignment.hodName} is now ${nextStatus === 'Active' ? 'Enabled (Active)' : 'Disabled (Inactive)'}.`
        );
        await refreshHODAssignments();
      } else {
        setErrorMessage('Failed to update HOD account status.');
      }
    } catch {
      setErrorMessage('Network error while updating status.');
    } finally {
      setSavingHodId(null);
    }
  };

  // Toggle Specific Permission
  const handleTogglePermission = async (
    assignment: HODAssignment,
    permissionKey:
      | 'canApproveCourseFiles'
      | 'canApproveTeacherRequests'
      | 'canGrantDeadlineExtensions'
      | 'canViewDepartmentReports'
  ) => {
    const currentPermissions = assignment.permissions || {
      canApproveCourseFiles: true,
      canApproveTeacherRequests: true,
      canGrantDeadlineExtensions: true,
      canViewDepartmentReports: true
    };

    const updatedPermissions = {
      ...currentPermissions,
      [permissionKey]: !currentPermissions[permissionKey]
    };

    setSavingHodId(assignment.id);
    try {
      const ok = await updateHODAssignment(assignment.id, {
        permissions: updatedPermissions
      });
      if (ok) {
        setSuccessMessage(`Updated access permissions for ${assignment.hodName}.`);
        await refreshHODAssignments();
      } else {
        setErrorMessage('Failed to update permission.');
      }
    } catch {
      setErrorMessage('Network error updating permission.');
    } finally {
      setSavingHodId(null);
    }
  };

  // Grant or Revoke All Permissions
  const handleSetAllPermissions = async (assignment: HODAssignment, grant: boolean) => {
    const updatedPermissions = {
      canApproveCourseFiles: grant,
      canApproveTeacherRequests: grant,
      canGrantDeadlineExtensions: grant,
      canViewDepartmentReports: grant
    };

    setSavingHodId(assignment.id);
    try {
      const ok = await updateHODAssignment(assignment.id, {
        permissions: updatedPermissions
      });
      if (ok) {
        setSuccessMessage(
          grant
            ? `Granted all permissions to ${assignment.hodName}.`
            : `Restricted all special permissions for ${assignment.hodName}.`
        );
        await refreshHODAssignments();
      } else {
        setErrorMessage('Failed to update permissions.');
      }
    } catch {
      setErrorMessage('Network error updating permissions.');
    } finally {
      setSavingHodId(null);
    }
  };

  // Generate Random Password Helper
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(result);
    setShowPassword(true);
  };

  // Copy Password to Clipboard
  const handleCopyPassword = () => {
    if (!newPassword) return;
    navigator.clipboard.writeText(newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedHodIdForReset) {
      setErrorMessage('Please select an HOD account to reset password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    const targetHOD = hodAssignments.find((a) => a.id === selectedHodIdForReset);
    if (!targetHOD) {
      setErrorMessage('Selected HOD assignment could not be found.');
      return;
    }

    setIsResetting(true);
    try {
      const ok = await resetHODPassword(targetHOD.id, newPassword.trim());
      if (ok) {
        setSuccessMessage(
          `Password for ${targetHOD.hodName} (${targetHOD.hodEmail}) has been reset successfully. They can now log in with the new password.`
        );
        setNewPassword('');
        setSelectedHodIdForReset('');
      } else {
        setErrorMessage('Failed to reset HOD password.');
      }
    } catch {
      setErrorMessage('Network error occurred while resetting password.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[80vh] w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Key className="w-7 h-7 text-emerald-700" />
            <span>HOD Access & Permissions</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Control operational authority, role privileges, and credentials for Heads of Department.
          </p>
        </div>

        {/* Sub-tabs pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => onNavigate && onNavigate('HOD Access Control')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'HOD Access Control'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HOD Access Control
          </button>
          <button
            onClick={() => onNavigate && onNavigate('Reset HOD Password')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'Reset HOD Password'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reset HOD Password
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium shadow-sm transition-all animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-auto text-emerald-600 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-medium shadow-sm transition-all animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-rose-600 hover:text-rose-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-MODULE 1: HOD ACCESS CONTROL VIEW                                 */}
      {/* ===================================================================== */}
      {currentTab === 'HOD Access Control' && (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Appointed HODs
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold text-slate-900">{totalHODs}</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
                Active & Authorized
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold text-emerald-700">{activeHODs}</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Inactive / Suspended
              </span>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold text-slate-700">{inactiveHODs}</span>
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search HOD name, email, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Campus Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                <select
                  value={campusFilter}
                  onChange={(e) => setCampusFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-sm"
                >
                  <option value="ALL">All Campuses</option>
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-sm"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>
            </div>

            <button
              onClick={() => onNavigate && onNavigate('Reset HOD Password')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>Reset Credentials</span>
            </button>
          </div>

          {/* HOD Permissions Cards Grid */}
          <div className="space-y-4">
            {filteredHODs.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
                <Shield className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="text-sm font-medium text-slate-700">No HOD records found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery || campusFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'No HOD matches the selected search filters.'
                    : 'Assign an HOD in HOD Management first to configure access privileges.'}
                </p>
              </div>
            ) : (
              filteredHODs.map((asgn) => {
                const isActive = asgn.status === 'Active';
                const perms = asgn.permissions || {
                  canApproveCourseFiles: true,
                  canApproveTeacherRequests: true,
                  canGrantDeadlineExtensions: true,
                  canViewDepartmentReports: true
                };

                const isSavingThis = savingHodId === asgn.id;

                return (
                  <div
                    key={asgn.id}
                    className={`bg-white border rounded-2xl p-5 sm:p-6 transition-all shadow-sm ${
                      isActive ? 'border-slate-200/90' : 'border-slate-200/70 bg-slate-50/50'
                    }`}
                  >
                    {/* Header: HOD Info & Account Status Switch */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl font-bold text-sm flex items-center justify-center border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {asgn.hodName ? asgn.hodName.charAt(0).toUpperCase() : 'H'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">{asgn.hodName}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {asgn.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {asgn.hodEmail}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              {asgn.departmentName}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <Landmark className="w-3.5 h-3.5 text-slate-400" />
                              {asgn.campusName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Account Access Toggle & Quick Shortcuts */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <button
                          onClick={() => handleSetAllPermissions(asgn, true)}
                          disabled={isSavingThis}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          Grant All
                        </button>
                        <button
                          onClick={() => handleSetAllPermissions(asgn, false)}
                          disabled={isSavingThis}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          Revoke All
                        </button>
                        <div className="h-4 w-px bg-slate-200" />
                        <button
                          onClick={() => handleToggleAccountStatus(asgn)}
                          disabled={isSavingThis}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            isActive
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                          }`}
                        >
                          {isSavingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : isActive ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          )}
                          <span>{isActive ? 'Account Enabled' : 'Account Disabled'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Permissions Matrix Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
                      {/* 1. Course File Approvals */}
                      <div
                        onClick={() => handleTogglePermission(asgn, 'canApproveCourseFiles')}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 select-none ${
                          perms.canApproveCourseFiles
                            ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                            : 'bg-slate-50 border-slate-200/80 text-slate-500 opacity-75'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <FileCheck2
                              className={`w-3.5 h-3.5 ${
                                perms.canApproveCourseFiles ? 'text-emerald-700' : 'text-slate-400'
                              }`}
                            />
                            <span>Course File Review</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Approve or request revisions on course files.
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            perms.canApproveCourseFiles ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {perms.canApproveCourseFiles ? 'ON' : 'OFF'}
                        </span>
                      </div>

                      {/* 2. Teacher Enrollment Approvals */}
                      <div
                        onClick={() => handleTogglePermission(asgn, 'canApproveTeacherRequests')}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 select-none ${
                          perms.canApproveTeacherRequests
                            ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                            : 'bg-slate-50 border-slate-200/80 text-slate-500 opacity-75'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <UserCheck
                              className={`w-3.5 h-3.5 ${
                                perms.canApproveTeacherRequests
                                  ? 'text-emerald-700'
                                  : 'text-slate-400'
                              }`}
                            />
                            <span>Faculty Enrollment</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Approve faculty registrations & courses.
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            perms.canApproveTeacherRequests ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {perms.canApproveTeacherRequests ? 'ON' : 'OFF'}
                        </span>
                      </div>

                      {/* 3. Deadline Extensions */}
                      <div
                        onClick={() =>
                          handleTogglePermission(asgn, 'canGrantDeadlineExtensions')
                        }
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 select-none ${
                          perms.canGrantDeadlineExtensions
                            ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                            : 'bg-slate-50 border-slate-200/80 text-slate-500 opacity-75'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <Clock
                              className={`w-3.5 h-3.5 ${
                                perms.canGrantDeadlineExtensions
                                  ? 'text-emerald-700'
                                  : 'text-slate-400'
                              }`}
                            />
                            <span>Deadline Extensions</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Grant submission grace periods.
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            perms.canGrantDeadlineExtensions ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {perms.canGrantDeadlineExtensions ? 'ON' : 'OFF'}
                        </span>
                      </div>

                      {/* 4. Departmental Reports */}
                      <div
                        onClick={() => handleTogglePermission(asgn, 'canViewDepartmentReports')}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 select-none ${
                          perms.canViewDepartmentReports
                            ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                            : 'bg-slate-50 border-slate-200/80 text-slate-500 opacity-75'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold">
                            <BarChart3
                              className={`w-3.5 h-3.5 ${
                                perms.canViewDepartmentReports
                                  ? 'text-emerald-700'
                                  : 'text-slate-400'
                              }`}
                            />
                            <span>Department Reports</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Access submission rate analytics.
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            perms.canViewDepartmentReports ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          {perms.canViewDepartmentReports ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-MODULE 2: RESET HOD PASSWORD VIEW                                 */}
      {/* ===================================================================== */}
      {currentTab === 'Reset HOD Password' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              <span>Reset HOD Password & Credentials</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Securely update login passwords for appointed Heads of Department.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Password Reset Form Card */}
            <form
              onSubmit={handleResetPasswordSubmit}
              className="md:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5"
            >
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Reset Password Console
              </h3>

              {/* HOD Account Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select HOD Account <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedHodIdForReset}
                  onChange={(e) => setSelectedHodIdForReset(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="">Select HOD to reset...</option>
                  {hodAssignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.hodName} — {a.departmentName} ({a.campusName})
                    </option>
                  ))}
                </select>
              </div>

              {/* New Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Secure</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter at least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-20 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {newPassword && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        title="Copy password"
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Password must be at least 6 characters. HOD will be able to sign in immediately.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHodIdForReset('');
                    setNewPassword('');
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={isResetting || !selectedHodIdForReset || !newPassword}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>

            {/* Right: Quick Selection List */}
            <div className="md:col-span-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Select HOD to Reset
              </h3>
              <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
                {hodAssignments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No HOD assignments available.
                  </p>
                ) : (
                  hodAssignments.map((a) => (
                    <div
                      key={a.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 p-2 rounded-xl transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-xs text-slate-900 block">
                          {a.hodName}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {a.hodEmail}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {a.departmentName} • {a.campusName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHodIdForReset(a.id);
                          handleGeneratePassword();
                        }}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Key className="w-3 h-3 text-amber-600" />
                        <span>Select</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
