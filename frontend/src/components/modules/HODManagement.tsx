import React, { useState, useEffect, useMemo } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { Department, Campus, User, HODAssignment } from '../../types';
import {
  UserCheck,
  Search,
  Plus,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  RefreshCw,
  Landmark,
  Building2,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Key,
  Shield,
  Filter,
  UserPlus,
  Mail,
  Calendar,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

interface HODManagementProps {
  activeSubModule?: 'Assign HOD' | 'HOD Assignments' | 'Reassign HOD' | string;
  onNavigate?: (moduleName: string) => void;
}

export const HODManagement: React.FC<HODManagementProps> = ({
  activeSubModule = 'HOD Assignments',
  onNavigate
}) => {
  const {
    departments,
    campuses,
    usersList,
    hodAssignments,
    createHODAssignment,
    updateHODAssignment,
    deleteHODAssignment,
    resetHODPassword,
    refreshHODAssignments,
    refreshDepartments,
    refreshCampuses
  } = useCFMS();

  // Internal Navigation Tab if none passed or inside component
  const currentTab = useMemo(() => {
    if (activeSubModule === 'Assign HOD') return 'Assign HOD';
    if (activeSubModule === 'Reassign HOD') return 'Reassign HOD';
    return 'HOD Assignments';
  }, [activeSubModule]);

  // Loading & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [campusFilter, setCampusFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form State for Assign HOD
  const [assignCampusId, setAssignCampusId] = useState('');
  const [assignDeptId, setAssignDeptId] = useState('');
  const [assignMode, setAssignMode] = useState<'SELECT' | 'CREATE'>('SELECT');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newHodName, setNewHodName] = useState('');
  const [newHodEmail, setNewHodEmail] = useState('');
  const [newHodPassword, setNewHodPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [academicSession, setAcademicSession] = useState('Fall 2026');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reassign Form State
  const [reassignCampusId, setReassignCampusId] = useState('');
  const [reassignDeptId, setReassignDeptId] = useState('');
  const [reassignMode, setReassignMode] = useState<'SELECT' | 'CREATE'>('SELECT');
  const [reassignUserId, setReassignUserId] = useState('');
  const [reassignNewName, setReassignNewName] = useState('');
  const [reassignNewEmail, setReassignNewEmail] = useState('');
  const [reassignNewPassword, setReassignNewPassword] = useState('');
  const [reassignSession, setReassignSession] = useState('Fall 2026');
  const [isReassigning, setIsReassigning] = useState(false);

  // Password Reset Modal State
  const [resetModalAssignment, setResetModalAssignment] = useState<HODAssignment | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetModalError, setResetModalError] = useState<string | null>(null);

  // Toggling status state
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          refreshHODAssignments(),
          refreshDepartments(),
          refreshCampuses()
        ]);
      } catch {}
      finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Auto-select initial campus
  useEffect(() => {
    if (!assignCampusId && campuses.length > 0) {
      const activeCamp = campuses.find((c) => c.status !== 'Inactive') || campuses[0];
      if (activeCamp) setAssignCampusId(activeCamp.id);
    }
    if (!reassignCampusId && campuses.length > 0) {
      const activeCamp = campuses.find((c) => c.status !== 'Inactive') || campuses[0];
      if (activeCamp) setReassignCampusId(activeCamp.id);
    }
  }, [campuses, assignCampusId, reassignCampusId]);

  // Filtered Departments for Assign Form (based on selected campus)
  const availableDepartmentsForAssign = useMemo(() => {
    if (!assignCampusId) return [];
    return departments.filter(
      (d) => d.campusId === assignCampusId && d.status !== 'Inactive'
    );
  }, [departments, assignCampusId]);

  // Auto-select department when campus changes
  useEffect(() => {
    if (availableDepartmentsForAssign.length > 0) {
      if (!availableDepartmentsForAssign.some((d) => d.id === assignDeptId)) {
        setAssignDeptId(availableDepartmentsForAssign[0].id);
      }
    } else {
      setAssignDeptId('');
    }
  }, [availableDepartmentsForAssign, assignDeptId]);

  // Filtered Departments for Reassign Form
  const availableDepartmentsForReassign = useMemo(() => {
    if (!reassignCampusId) return [];
    return departments.filter(
      (d) => d.campusId === reassignCampusId && d.status !== 'Inactive'
    );
  }, [departments, reassignCampusId]);

  useEffect(() => {
    if (availableDepartmentsForReassign.length > 0) {
      if (!availableDepartmentsForReassign.some((d) => d.id === reassignDeptId)) {
        setReassignDeptId(availableDepartmentsForReassign[0].id);
      }
    } else {
      setReassignDeptId('');
    }
  }, [availableDepartmentsForReassign, reassignDeptId]);

  // Currently appointed HOD for selected department in Reassign
  const currentAssignedHOD = useMemo(() => {
    if (!reassignCampusId || !reassignDeptId) return null;
    return hodAssignments.find(
      (a) =>
        a.campusId === reassignCampusId &&
        a.departmentId === reassignDeptId &&
        a.status === 'Active'
    );
  }, [hodAssignments, reassignCampusId, reassignDeptId]);

  // Filtered Assignments List
  const filteredAssignments = useMemo(() => {
    let list = hodAssignments || [];

    // Filter by Campus
    if (campusFilter !== 'ALL') {
      list = list.filter((a) => a.campusId === campusFilter);
    }

    // Filter by Status
    if (statusFilter !== 'ALL') {
      list = list.filter((a) => a.status === statusFilter);
    }

    // Filter by Search Query
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

  // Auto-dismiss toast
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // ─── Handle Assign HOD Submit ──────────────────────────────────────────────
  const handleAssignHODSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!assignCampusId) {
      setErrorMessage('Campus is required. Please select a valid campus.');
      return;
    }
    if (!assignDeptId) {
      setErrorMessage('Department is required. Please select a valid department.');
      return;
    }

    let targetHodId = '';
    let targetHodName = '';
    let targetEmail = '';
    let targetPassword = '';

    if (assignMode === 'SELECT') {
      if (!selectedUserId) {
        setErrorMessage('Please select a faculty member from the list.');
        return;
      }
      const chosenUser = usersList.find((u) => u.id === selectedUserId);
      if (!chosenUser) {
        setErrorMessage('Selected user could not be found.');
        return;
      }
      targetHodId = chosenUser.id;
      targetHodName = chosenUser.name;
      targetEmail = chosenUser.email;
    } else {
      if (!newHodName.trim()) {
        setErrorMessage('HOD Name is required.');
        return;
      }
      if (!newHodEmail.trim() || !newHodEmail.includes('@')) {
        setErrorMessage('A valid HOD official email address is required.');
        return;
      }
      if (!newHodPassword || newHodPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      targetHodName = newHodName.trim();
      targetEmail = newHodEmail.trim().toLowerCase();
      targetPassword = newHodPassword.trim();
    }

    setIsSubmitting(true);
    try {
      const targetCampus = campuses.find((c) => c.id === assignCampusId);
      const targetDept = departments.find((d) => d.id === assignDeptId);

      const payload: any = {
        campusId: targetCampus ? targetCampus.id : assignCampusId,
        campusName: targetCampus ? targetCampus.name : '',
        departmentId: targetDept ? targetDept.id : assignDeptId,
        departmentName: targetDept ? targetDept.name : '',
        status,
        academicSession: academicSession.trim() || 'Fall 2026'
      };

      if (assignMode === 'SELECT') {
        payload.hodId = targetHodId;
        payload.hodName = targetHodName;
        payload.email = targetEmail;
      } else {
        payload.hodName = targetHodName;
        payload.email = targetEmail;
        payload.password = targetPassword;
      }

      const res = await createHODAssignment(payload);
      if (!res.success) {
        setErrorMessage(res.message || 'Failed to assign HOD.');
        return;
      }

      setSuccessMessage(
        res.message || `HOD ${targetHodName} successfully assigned to ${targetDept?.name || 'Department'}.`
      );

      // Reset form fields
      setNewHodName('');
      setNewHodEmail('');
      setNewHodPassword('');
      setSelectedUserId('');

      // Navigate to HOD Assignments listing
      if (onNavigate) {
        setTimeout(() => {
          onNavigate('HOD Assignments');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while assigning HOD.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Handle Reassign HOD Submit ────────────────────────────────────────────
  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!reassignCampusId || !reassignDeptId) {
      setErrorMessage('Campus and Department are required.');
      return;
    }

    let targetHodId = '';
    let targetHodName = '';
    let targetEmail = '';
    let targetPassword = '';

    if (reassignMode === 'SELECT') {
      if (!reassignUserId) {
        setErrorMessage('Please select a replacement faculty member.');
        return;
      }
      const chosen = usersList.find((u) => u.id === reassignUserId);
      if (!chosen) {
        setErrorMessage('Selected user could not be found.');
        return;
      }
      targetHodId = chosen.id;
      targetHodName = chosen.name;
      targetEmail = chosen.email;
    } else {
      if (!reassignNewName.trim()) {
        setErrorMessage('New HOD Name is required.');
        return;
      }
      if (!reassignNewEmail.trim() || !reassignNewEmail.includes('@')) {
        setErrorMessage('A valid official email is required.');
        return;
      }
      if (!reassignNewPassword || reassignNewPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      targetHodName = reassignNewName.trim();
      targetEmail = reassignNewEmail.trim().toLowerCase();
      targetPassword = reassignNewPassword.trim();
    }

    setIsReassigning(true);
    try {
      const targetCampus = campuses.find((c) => c.id === reassignCampusId);
      const targetDept = departments.find((d) => d.id === reassignDeptId);

      const payload: any = {
        campusId: targetCampus ? targetCampus.id : reassignCampusId,
        campusName: targetCampus ? targetCampus.name : '',
        departmentId: targetDept ? targetDept.id : reassignDeptId,
        departmentName: targetDept ? targetDept.name : '',
        status: 'Active',
        academicSession: reassignSession.trim() || 'Fall 2026'
      };

      if (reassignMode === 'SELECT') {
        payload.hodId = targetHodId;
        payload.hodName = targetHodName;
        payload.email = targetEmail;
      } else {
        payload.hodName = targetHodName;
        payload.email = targetEmail;
        payload.password = targetPassword;
      }

      const res = await createHODAssignment(payload);
      if (!res.success) {
        setErrorMessage(res.message || 'Failed to reassign HOD.');
        return;
      }

      setSuccessMessage(
        res.message || `Department ${targetDept?.name} successfully reassigned to ${targetHodName}.`
      );

      setReassignNewName('');
      setReassignNewEmail('');
      setReassignNewPassword('');
      setReassignUserId('');

      if (onNavigate) {
        setTimeout(() => {
          onNavigate('HOD Assignments');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while reassigning HOD.');
    } finally {
      setIsReassigning(false);
    }
  };

  // ─── Quick Toggle Status ───────────────────────────────────────────────────
  const handleToggleStatus = async (assignment: HODAssignment) => {
    const nextStatus = assignment.status === 'Active' ? 'Inactive' : 'Active';
    setTogglingId(assignment.id);
    try {
      const ok = await updateHODAssignment(assignment.id, { status: nextStatus });
      if (ok) {
        setSuccessMessage(`HOD assignment for "${assignment.hodName}" is now ${nextStatus}.`);
        await refreshHODAssignments();
      } else {
        setErrorMessage('Failed to update status.');
      }
    } catch {
      setErrorMessage('Network error while updating status.');
    } finally {
      setTogglingId(null);
    }
  };

  // ─── Delete Assignment ─────────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the HOD assignment for ${name}?`)) {
      return;
    }
    try {
      const ok = await deleteHODAssignment(id);
      if (ok) {
        setSuccessMessage('HOD assignment removed successfully.');
        await refreshHODAssignments();
      } else {
        setErrorMessage('Failed to delete HOD assignment.');
      }
    } catch {
      setErrorMessage('Error occurred while deleting assignment.');
    }
  };

  // ─── Reset Password Modal Submit ───────────────────────────────────────────
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalAssignment) return;
    setResetModalError(null);

    if (!newPasswordValue || newPasswordValue.length < 6) {
      setResetModalError('Password must be at least 6 characters long.');
      return;
    }

    setIsResettingPassword(true);
    try {
      const ok = await resetHODPassword(resetModalAssignment.id, newPasswordValue.trim());
      if (ok) {
        setSuccessMessage(`Password for ${resetModalAssignment.hodName} reset successfully.`);
        setResetModalAssignment(null);
        setNewPasswordValue('');
      } else {
        setResetModalError('Failed to reset password. Please try again.');
      }
    } catch {
      setResetModalError('Error resetting password.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-[80vh] w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Breadcrumb & Quick Sub-Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-emerald-700" />
            <span>HOD Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Assign and oversee Heads of Department across university campuses.
          </p>
        </div>

        {/* Sub-tabs pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => onNavigate && onNavigate('Assign HOD')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'Assign HOD'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Assign HOD
          </button>
          <button
            onClick={() => onNavigate && onNavigate('HOD Assignments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'HOD Assignments'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HOD Assignments
          </button>
          <button
            onClick={() => onNavigate && onNavigate('Reassign HOD')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              currentTab === 'Reassign HOD'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reassign HOD
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
      {/* SUB-MODULE 1: ASSIGN HOD VIEW                                         */}
      {/* ===================================================================== */}
      {currentTab === 'Assign HOD' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Assign New HOD</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Appoint a Head of Department for an authorized campus and department.
            </p>
          </div>

          <form
            onSubmit={handleAssignHODSubmit}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5"
          >
            {/* Campus & Department Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Campus <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignCampusId}
                  onChange={(e) => setAssignCampusId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="">Select Campus</option>
                  {campuses
                    .filter((c) => c.status !== 'Inactive')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignDeptId}
                  onChange={(e) => setAssignDeptId(e.target.value)}
                  disabled={availableDepartmentsForAssign.length === 0}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {availableDepartmentsForAssign.length === 0
                      ? 'No departments for campus'
                      : 'Select Department'}
                  </option>
                  {availableDepartmentsForAssign.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mode Selector: Select Existing Faculty vs Create New HOD */}
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                HOD Account Provisioning
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAssignMode('SELECT')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    assignMode === 'SELECT'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Select Existing Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode('CREATE')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    assignMode === 'CREATE'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create New HOD User
                </button>
              </div>
            </div>

            {/* Mode A: Select Existing Faculty */}
            {assignMode === 'SELECT' ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Faculty Member <span className="text-rose-500">*</span>
                </label>
                <select
                  required={assignMode === 'SELECT'}
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="">Choose faculty member...</option>
                  {usersList
                    .filter((u) => u.status !== 'Inactive')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.email} ({u.role})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              /* Mode B: Create New HOD */
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    HOD Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={assignMode === 'CREATE'}
                    placeholder="e.g. Prof. Dr. Muhammad Asif"
                    value={newHodName}
                    onChange={(e) => setNewHodName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Official Email (Login ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required={assignMode === 'CREATE'}
                    placeholder="e.g. hod.cs@ue.edu.pk"
                    value={newHodEmail}
                    onChange={(e) => setNewHodEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={assignMode === 'CREATE'}
                      placeholder="Minimum 6 characters"
                      value={newHodPassword}
                      onChange={(e) => setNewHodPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Academic Session & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Academic Session
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fall 2026"
                  value={academicSession}
                  onChange={(e) => setAcademicSession(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('HOD Assignments')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !assignCampusId || !assignDeptId}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Assign HOD
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-MODULE 2: REASSIGN HOD VIEW                                       */}
      {/* ===================================================================== */}
      {currentTab === 'Reassign HOD' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Reassign HOD</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a department to view the incumbent HOD and reassign leadership seamlessly.
            </p>
          </div>

          <form
            onSubmit={handleReassignSubmit}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5"
          >
            {/* Campus & Department Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Target Campus <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={reassignCampusId}
                  onChange={(e) => setReassignCampusId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="">Select Campus</option>
                  {campuses
                    .filter((c) => c.status !== 'Inactive')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={reassignDeptId}
                  onChange={(e) => setReassignDeptId(e.target.value)}
                  disabled={availableDepartmentsForReassign.length === 0}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 disabled:bg-slate-50"
                >
                  <option value="">
                    {availableDepartmentsForReassign.length === 0
                      ? 'No departments for campus'
                      : 'Select Department'}
                  </option>
                  {availableDepartmentsForReassign.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Currently Appointed HOD Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Currently Appointed HOD
              </span>
              {currentAssignedHOD ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {currentAssignedHOD.hodName}
                    </h4>
                    <p className="text-xs text-slate-500">{currentAssignedHOD.hodEmail}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Assigned:{' '}
                      {new Date(currentAssignedHOD.assignedDate).toLocaleDateString()} (
                      {currentAssignedHOD.academicSession || 'Active Session'})
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Active
                  </span>
                </div>
              ) : (
                <p className="text-xs text-amber-700 italic">
                  No active HOD is currently appointed for this department. Assigning will establish leadership.
                </p>
              )}
            </div>

            {/* Mode Selector for New HOD */}
            <div className="pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                New HOD Appointment
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setReassignMode('SELECT')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    reassignMode === 'SELECT'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Select Existing Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setReassignMode('CREATE')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    reassignMode === 'CREATE'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create New HOD User
                </button>
              </div>
            </div>

            {/* Selection or Creation Fields */}
            {reassignMode === 'SELECT' ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select New HOD <span className="text-rose-500">*</span>
                </label>
                <select
                  required={reassignMode === 'SELECT'}
                  value={reassignUserId}
                  onChange={(e) => setReassignUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="">Choose new faculty member...</option>
                  {usersList
                    .filter((u) => u.status !== 'Inactive')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.email} ({u.role})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    New HOD Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required={reassignMode === 'CREATE'}
                    placeholder="e.g. Dr. Ayesha Khan"
                    value={reassignNewName}
                    onChange={(e) => setReassignNewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Official Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required={reassignMode === 'CREATE'}
                    placeholder="e.g. ayesha.hod@ue.edu.pk"
                    value={reassignNewEmail}
                    onChange={(e) => setReassignNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required={reassignMode === 'CREATE'}
                    placeholder="Minimum 6 characters"
                    value={reassignNewPassword}
                    onChange={(e) => setReassignNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>
            )}

            {/* Academic Session */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Effective Academic Session
              </label>
              <input
                type="text"
                placeholder="e.g. Fall 2026"
                value={reassignSession}
                onChange={(e) => setReassignSession(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('HOD Assignments')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isReassigning || !reassignCampusId || !reassignDeptId}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReassigning && <Loader2 className="w-4 h-4 animate-spin" />}
                Reassign HOD
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-MODULE 3: HOD ASSIGNMENTS LIST VIEW                               */}
      {/* ===================================================================== */}
      {currentTab === 'HOD Assignments' && (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900">All HOD Assignments</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, manage, and monitor all appointed Heads of Department.
            </p>
          </div>

          {/* Search Bar & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search HOD name, email, department, or campus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors shadow-sm"
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Quick Assign Button */}
            <button
              onClick={() => onNavigate && onNavigate('Assign HOD')}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Assign HOD</span>
            </button>
          </div>

          {/* Assignments Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">HOD Info</th>
                    <th className="py-3.5 px-4 sm:px-6">Department & Campus</th>
                    <th className="py-3.5 px-4 sm:px-6">Session</th>
                    <th className="py-3.5 px-4 sm:px-6">Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                        <p className="text-sm font-medium text-slate-700">No HOD assignments found</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          {searchQuery || campusFilter !== 'ALL' || statusFilter !== 'ALL'
                            ? 'Try clearing search filters or changing the campus filter.'
                            : 'Get started by appointing an HOD using the Assign HOD button.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((asgn) => {
                      const isActive = asgn.status === 'Active';
                      return (
                        <tr key={asgn.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200">
                                {asgn.hodName ? asgn.hodName.charAt(0).toUpperCase() : 'H'}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 block leading-tight">
                                  {asgn.hodName}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3" />
                                  {asgn.hodEmail}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                {asgn.departmentName}
                              </span>
                              <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Landmark className="w-3 h-3 text-slate-400" />
                                {asgn.campusName}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 font-medium text-slate-700">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {asgn.academicSession || 'Fall 2026'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6">
                            <button
                              onClick={() => handleToggleStatus(asgn)}
                              disabled={togglingId === asgn.id}
                              title="Click to toggle status"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              {togglingId === asgn.id ? 'Updating...' : asgn.status}
                            </button>
                          </td>

                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Reassign Shortcut */}
                              <button
                                onClick={() => {
                                  setReassignCampusId(asgn.campusId);
                                  setReassignDeptId(asgn.departmentId);
                                  if (onNavigate) onNavigate('Reassign HOD');
                                }}
                                title="Reassign Department HOD"
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </button>

                              {/* Reset Password Shortcut */}
                              <button
                                onClick={() => {
                                  setResetModalAssignment(asgn);
                                  setNewPasswordValue('');
                                  setResetModalError(null);
                                }}
                                title="Reset HOD Password"
                                className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Key className="w-4 h-4" />
                              </button>

                              {/* Delete Assignment */}
                              <button
                                onClick={() => handleDelete(asgn.id, asgn.hodName)}
                                title="Remove HOD Assignment"
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>Total HOD Assignments: {filteredAssignments.length}</span>
              <span>
                Active: {filteredAssignments.filter((a) => a.status === 'Active').length} | Inactive:{' '}
                {filteredAssignments.filter((a) => a.status === 'Inactive').length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* RESET HOD PASSWORD MODAL                                              */}
      {/* ===================================================================== */}
      {resetModalAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-amber-800">
                <Key className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Reset HOD Password</h3>
              </div>
              <button
                onClick={() => setResetModalAssignment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{resetModalError}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-slate-900">{resetModalAssignment.hodName}</p>
              <p className="text-slate-500">{resetModalAssignment.hodEmail}</p>
              <p className="text-slate-500">
                {resetModalAssignment.departmentName} — {resetModalAssignment.campusName}
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter at least 6 characters"
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalAssignment(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm flex items-center gap-2"
                >
                  {isResettingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Password Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
