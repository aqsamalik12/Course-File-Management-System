import React, { useState, useEffect, useMemo } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { Department, Campus } from '../../types';
import {
  Building2,
  Search,
  Plus,
  Eye,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Landmark,
  MapPin,
  Filter
} from 'lucide-react';

interface DepartmentManagementProps {
  activeSubModule?: 'All Department' | 'Add Department' | string;
  onNavigate?: (moduleName: string) => void;
}

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({
  activeSubModule = 'All Department',
  onNavigate
}) => {
  const {
    departments,
    campuses,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    refreshDepartments,
    refreshCampuses
  } = useCFMS();

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Search & Filter States for All Department
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState('ALL');

  // Notifications (Toast / Banner)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add Department Form State
  const [selectedCampusId, setSelectedCampusId] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Department Modal State
  const [viewDept, setViewDept] = useState<Department | null>(null);

  // Edit Department Modal State
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [editCampusId, setEditCampusId] = useState('');
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Status toggle confirmation / loading tracking
  const [togglingDeptId, setTogglingDeptId] = useState<string | null>(null);

  // Auto-dismiss success notification
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
      setLoadError(null);
      try {
        await Promise.all([refreshDepartments(), refreshCampuses()]);
      } catch {
        setLoadError('Unable to load departments. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Auto-select first active campus if none selected
  useEffect(() => {
    if (!selectedCampusId && campuses.length > 0) {
      const activeCampus = campuses.find((c) => c.status !== 'Inactive') || campuses[0];
      if (activeCampus) setSelectedCampusId(activeCampus.id);
    }
  }, [campuses, selectedCampusId]);

  // Filtered Departments (Search by Name or Code, and Filter by Campus)
  const filteredDepartments = useMemo(() => {
    let list = departments || [];

    // 1. Filter by Campus
    if (selectedCampusFilter !== 'ALL') {
      list = list.filter(
        (d) => d.campusId === selectedCampusFilter || d.campusName === selectedCampusFilter
      );
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          (d.name && d.name.toLowerCase().includes(q)) ||
          (d.code && d.code.toLowerCase().includes(q)) ||
          (d.campusName && d.campusName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [departments, selectedCampusFilter, searchQuery]);

  // Handle Add Department submit
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedCampusId || !selectedCampusId.trim()) {
      setErrorMessage('Campus is required. Please select a valid campus.');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Department Name is required.');
      return;
    }
    if (!code.trim()) {
      setErrorMessage('Department Code is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetCampus = campuses.find(
        (c) => c.id === selectedCampusId || c.name === selectedCampusId
      );

      const res = await createDepartment({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        campusId: targetCampus ? targetCampus.id : selectedCampusId,
        campusName: targetCampus ? targetCampus.name : '',
        status
      } as any);

      if (!res.success) {
        setErrorMessage(res.message || 'Failed to add department.');
        return;
      }

      setSuccessMessage('Department added successfully.');
      setName('');
      setCode('');
      setStatus('Active');

      // Navigate back to All Department list after brief delay
      if (onNavigate) {
        setTimeout(() => {
          onNavigate('All Department');
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (dept: Department) => {
    setEditDept(dept);
    setEditCampusId(dept.campusId || '');
    setEditName(dept.name || '');
    setEditCode(dept.code || '');
    setEditStatus((dept.status as 'Active' | 'Inactive') || 'Active');
    setEditError(null);
  };

  // Handle Edit Department submit
  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDept) return;
    setEditError(null);

    if (!editCampusId || !editCampusId.trim()) {
      setEditError('Campus is required. Please select a valid campus.');
      return;
    }
    if (!editName.trim()) {
      setEditError('Department Name is required.');
      return;
    }
    if (!editCode.trim()) {
      setEditError('Department Code is required.');
      return;
    }

    setIsUpdating(true);
    try {
      const targetCampus = campuses.find(
        (c) => c.id === editCampusId || c.name === editCampusId
      );

      const res = await updateDepartment(editDept.id, {
        name: editName.trim(),
        code: editCode.trim().toUpperCase(),
        campusId: targetCampus ? targetCampus.id : editCampusId,
        campusName: targetCampus ? targetCampus.name : '',
        status: editStatus
      } as any);

      if (!res.success) {
        setEditError(res.message || 'Failed to update department.');
        setIsUpdating(false);
        return;
      }

      setSuccessMessage('Department updated successfully.');
      setEditDept(null);
      setIsUpdating(false);
    } catch (err: any) {
      setEditError(err.message || 'An error occurred while updating department.');
      setIsUpdating(false);
    }
  };

  // Toggle Department Status (Active / Inactive)
  const handleToggleStatus = async (dept: Department) => {
    const nextStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    setTogglingDeptId(dept.id);
    try {
      const res = await updateDepartment(dept.id, { status: nextStatus } as any);
      if (res.success) {
        setSuccessMessage(`Department "${dept.name}" is now ${nextStatus}.`);
      } else {
        setErrorMessage(res.message || 'Failed to change department status.');
      }
    } catch {
      setErrorMessage('Unable to change status. Please try again.');
    } finally {
      setTogglingDeptId(null);
    }
  };

  const isAddView = activeSubModule === 'Add Department';

  return (
    <div className="min-h-[80vh] w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Global Alerts / Toasts */}
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

      {/* ========================================================================= */}
      {/* SUB-CATEGORY 1: ADD DEPARTMENT VIEW                                       */}
      {/* ========================================================================= */}
      {isAddView ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Add Department
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create a department under an existing campus.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleAddDepartment}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
          >
            {/* Inline Form Error / Success Alerts */}
            {errorMessage && (
              <div className="flex items-center gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Campus Selector (Department ALWAYS belongs to a Campus) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Campus <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedCampusId}
                  onChange={(e) => setSelectedCampusId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
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
                {campuses.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1.5">
                    No campuses found. Please create a campus in Campus Management first.
                  </p>
                )}
              </div>

              {/* Department Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                />
              </div>

              {/* Department Code */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Department Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors uppercase"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
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
                onClick={() => onNavigate && onNavigate('All Department')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || campuses.length === 0}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Department
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ========================================================================= */
        /* SUB-CATEGORY 2: ALL DEPARTMENT VIEW                                       */
        /* ========================================================================= */
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              All Department
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage departments within their respective campuses.
            </p>
          </div>

          {/* Search Bar & Campus Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Departments by name or code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Optional Campus Filter (Loads REAL Campuses from database) */}
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCampusFilter}
                  onChange={(e) => setSelectedCampusFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors shadow-2xs cursor-pointer font-medium"
                >
                  <option value="ALL">All Campus</option>
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                refreshDepartments();
                refreshCampuses();
              }}
              title="Refresh departments from database"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors self-end sm:self-auto flex items-center gap-1.5 text-xs font-semibold shadow-2xs"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
              <p className="text-sm text-slate-600 font-medium">Loading departments...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && loadError && (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-white border border-rose-200 rounded-2xl text-center space-y-3 shadow-2xs">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="text-slate-800 font-semibold">{loadError}</p>
              <button
                onClick={() => {
                  refreshDepartments();
                  refreshCampuses();
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Real Department Table */}
          {!isLoading && !loadError && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
              {filteredDepartments.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      No departments found.
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      {searchQuery || selectedCampusFilter !== 'ALL'
                        ? 'No departments match the selected search or campus filter.'
                        : 'There are currently no departments configured.'}
                    </p>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('Add Department')}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add Department
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4 sm:px-6">Department Name</th>
                        <th className="py-3.5 px-4 sm:px-6">Department Code</th>
                        <th className="py-3.5 px-4 sm:px-6">Campus</th>
                        <th className="py-3.5 px-4 sm:px-6">Status</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredDepartments.map((dept) => {
                        const isActive = dept.status === 'Active';
                        const isToggling = togglingDeptId === dept.id;

                        return (
                          <tr
                            key={dept.id}
                            className="hover:bg-slate-50/70 transition-colors group"
                          >
                            {/* Department Name */}
                            <td className="py-4 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0">
                                  <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                    {dept.name}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Department Code */}
                            <td className="py-4 px-4 sm:px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                                {dept.code}
                              </span>
                            </td>

                            {/* Campus */}
                            <td className="py-4 px-4 sm:px-6">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
                                <Landmark className="w-3.5 h-3.5 text-slate-400" />
                                {dept.campusName || 'Attock Campus'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4 sm:px-6">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  isActive
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                  }`}
                                />
                                {dept.status || 'Active'}
                              </span>
                            </td>

                            {/* Actions: View, Edit, Activate/Deactivate */}
                            <td className="py-4 px-4 sm:px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* View */}
                                <button
                                  onClick={() => setViewDept(dept)}
                                  title="View Department Details"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => openEditModal(dept)}
                                  title="Edit Department"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                {/* Activate / Deactivate Toggle */}
                                <button
                                  onClick={() => handleToggleStatus(dept)}
                                  disabled={isToggling}
                                  title={isActive ? 'Deactivate Department' : 'Activate Department'}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isActive
                                      ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {isToggling ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                                  ) : isActive ? (
                                    <ToggleRight className="w-5 h-5 text-emerald-600" />
                                  ) : (
                                    <ToggleLeft className="w-5 h-5 text-slate-400" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW DEPARTMENT DETAILS                                            */}
      {/* ========================================================================= */}
      {viewDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">Department Details</h3>
              </div>
              <button
                onClick={() => setViewDept(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  Department Name
                </span>
                <span className="font-bold text-slate-900 text-right">
                  {viewDept.name}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  Department Code
                </span>
                <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                  {viewDept.code}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  Campus
                </span>
                <span className="text-slate-800 font-medium flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-slate-400" />
                  {viewDept.campusName || 'Attock Campus'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-1">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    viewDept.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {viewDept.status || 'Active'}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewDept(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT DEPARTMENT                                                    */}
      {/* ========================================================================= */}
      {editDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Edit2 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">Edit Department</h3>
              </div>
              <button
                onClick={() => setEditDept(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateDepartment} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Campus */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Campus <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={editCampusId}
                  onChange={(e) => setEditCampusId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="">Select Campus</option>
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Department Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              {/* Department Code */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Department Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 uppercase"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditDept(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
