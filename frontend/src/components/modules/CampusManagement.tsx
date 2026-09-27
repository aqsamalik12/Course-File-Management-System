import React, { useState, useEffect, useMemo } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { Campus } from '../../types';
import {
  Landmark,
  Search,
  Plus,
  Eye,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Building,
  MapPin,
  UserCheck
} from 'lucide-react';

interface CampusManagementProps {
  activeSubModule?: 'All Campus' | 'Add Campus' | string;
  onNavigate?: (moduleName: string) => void;
}

export const CampusManagement: React.FC<CampusManagementProps> = ({
  activeSubModule = 'All Campus',
  onNavigate
}) => {
  const { campuses, createCampus, updateCampus, refreshCampuses } = useCFMS();

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Search State for All Campus
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications (Toast / Banner)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add Campus Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View Campus Modal State
  const [viewCampus, setViewCampus] = useState<Campus | null>(null);

  // Edit Campus Modal State
  const [editCampus, setEditCampus] = useState<Campus | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDirectorName, setEditDirectorName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Status toggle confirmation
  const [togglingCampusId, setTogglingCampusId] = useState<string | null>(null);

  // Auto-dismiss success notifications
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
        await refreshCampuses();
      } catch {
        setLoadError('Unable to load campuses. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Filter campuses by search query (Name or Code)
  const filteredCampuses = useMemo(() => {
    if (!searchQuery.trim()) return campuses;
    const q = searchQuery.toLowerCase().trim();
    return campuses.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.code && c.code.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q))
    );
  }, [campuses, searchQuery]);

  // Handle Add Campus submit
  const handleAddCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Campus Name is required.');
      return;
    }
    if (!code.trim()) {
      setErrorMessage('Campus Code is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCampus({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        status,
        city: city.trim() || 'Punjab',
        address: address.trim(),
        directorName: directorName.trim()
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Failed to add campus.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage('Campus added successfully.');
      setName('');
      setCode('');
      setStatus('Active');
      setCity('');
      setAddress('');
      setDirectorName('');
      setIsSubmitting(false);

      // Navigate back to All Campus list after brief delay
      if (onNavigate) {
        setTimeout(() => {
          onNavigate('All Campus');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (campus: Campus) => {
    setEditCampus(campus);
    setEditName(campus.name || '');
    setEditCode(campus.code || '');
    setEditStatus((campus.status as 'Active' | 'Inactive') || 'Active');
    setEditCity(campus.city || '');
    setEditAddress(campus.address || '');
    setEditDirectorName(campus.directorName || '');
    setEditError(null);
  };

  // Handle Edit Campus submit
  const handleUpdateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCampus) return;
    setEditError(null);

    if (!editName.trim()) {
      setEditError('Campus Name is required.');
      return;
    }
    if (!editCode.trim()) {
      setEditError('Campus Code is required.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await updateCampus(editCampus.id, {
        name: editName.trim(),
        code: editCode.trim().toUpperCase(),
        status: editStatus,
        city: editCity.trim(),
        address: editAddress.trim(),
        directorName: editDirectorName.trim()
      });

      if (!res.success) {
        setEditError(res.message || 'Failed to update campus.');
        setIsUpdating(false);
        return;
      }

      setSuccessMessage('Campus updated successfully.');
      setEditCampus(null);
      setIsUpdating(false);
    } catch (err: any) {
      setEditError(err.message || 'An error occurred while updating campus.');
      setIsUpdating(false);
    }
  };

  // Toggle Status (Active / Inactive)
  const handleToggleStatus = async (campus: Campus) => {
    const nextStatus = campus.status === 'Active' ? 'Inactive' : 'Active';
    setTogglingCampusId(campus.id);
    try {
      const res = await updateCampus(campus.id, { status: nextStatus });
      if (res.success) {
        setSuccessMessage(`Campus "${campus.name}" is now ${nextStatus}.`);
      } else {
        setErrorMessage(res.message || 'Failed to change campus status.');
      }
    } catch {
      setErrorMessage('Unable to change status. Please try again.');
    } finally {
      setTogglingCampusId(null);
    }
  };

  const isAddView = activeSubModule === 'Add Campus';

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
      {/* SUB-CATEGORY 1: ADD CAMPUS VIEW                                           */}
      {/* ========================================================================= */}
      {isAddView ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Add Campus
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create a new campus.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleAddCampus}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div className="space-y-4">
              {/* Campus Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Campus Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Attock Campus"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                />
              </div>

              {/* Campus Code */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Campus Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UE-ATK"
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

              {/* City (Optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Attock"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                />
              </div>

              {/* Address (Optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. College Road, Attock"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                />
              </div>

              {/* Director Name (Optional) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Campus Director
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Dr. Muhammad Aslam"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('All Campus')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Campus
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ========================================================================= */
        /* SUB-CATEGORY 2: ALL CAMPUS VIEW                                           */
        /* ========================================================================= */
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              All Campus
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              View and manage all campuses.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Campus by name or code..."
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

            <button
              onClick={() => refreshCampuses()}
              title="Refresh campuses from database"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors self-end sm:self-auto flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
              <p className="text-sm text-slate-600 font-medium">Loading campuses...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && loadError && (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-white border border-rose-200 rounded-2xl text-center space-y-3 shadow-2xs">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="text-slate-800 font-semibold">{loadError}</p>
              <button
                onClick={() => refreshCampuses()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Real Campus Table */}
          {!isLoading && !loadError && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden">
              {filteredCampuses.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Landmark className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      No campuses found.
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      {searchQuery
                        ? `No campus matches "${searchQuery}". Clear your search or add a new campus.`
                        : 'No campus records exist in the database.'}
                    </p>
                  </div>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('Add Campus')}
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add Campus
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3.5 px-4 sm:px-6">Campus Name</th>
                        <th className="py-3.5 px-4 sm:px-6">Campus Code</th>
                        <th className="py-3.5 px-4 sm:px-6">Status</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {filteredCampuses.map((campus) => {
                        const isActive = campus.status === 'Active';
                        const isToggling = togglingCampusId === campus.id;

                        return (
                          <tr
                            key={campus.id}
                            className="hover:bg-slate-50/70 transition-colors group"
                          >
                            {/* Campus Name */}
                            <td className="py-4 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs flex-shrink-0">
                                  <Landmark className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                    {campus.name}
                                  </p>
                                  {campus.city && (
                                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-slate-300" />
                                      {campus.city}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Campus Code */}
                            <td className="py-4 px-4 sm:px-6">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200/80">
                                {campus.code}
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
                                {campus.status || 'Active'}
                              </span>
                            </td>

                            {/* Actions: View, Edit, Activate/Deactivate */}
                            <td className="py-4 px-4 sm:px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* View */}
                                <button
                                  onClick={() => setViewCampus(campus)}
                                  title="View Campus Details"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => openEditModal(campus)}
                                  title="Edit Campus"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                {/* Activate / Deactivate Toggle */}
                                <button
                                  onClick={() => handleToggleStatus(campus)}
                                  disabled={isToggling}
                                  title={isActive ? 'Deactivate Campus' : 'Activate Campus'}
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
      {/* MODAL: VIEW CAMPUS DETAILS                                                */}
      {/* ========================================================================= */}
      {viewCampus && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">Campus Details</h3>
              </div>
              <button
                onClick={() => setViewCampus(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  Campus Name
                </span>
                <span className="font-bold text-slate-900 text-right">
                  {viewCampus.name}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  Campus Code
                </span>
                <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                  {viewCampus.code}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  Status
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    viewCampus.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {viewCampus.status || 'Active'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  City
                </span>
                <span className="text-slate-700">
                  {viewCampus.city || 'Punjab'}
                </span>
              </div>

              {viewCampus.address && (
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    Address
                  </span>
                  <span className="text-slate-700 text-right max-w-[200px]">
                    {viewCampus.address}
                  </span>
                </div>
              )}

              {viewCampus.directorName && (
                <div className="flex items-center justify-between pb-1">
                  <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    Director
                  </span>
                  <span className="text-slate-700 font-medium">
                    {viewCampus.directorName}
                  </span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewCampus(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT CAMPUS                                                        */}
      {/* ========================================================================= */}
      {editCampus && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Edit2 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">Edit Campus</h3>
              </div>
              <button
                onClick={() => setEditCampus(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCampus} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Campus Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Campus Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 uppercase"
                />
              </div>

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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Campus Director
                </label>
                <input
                  type="text"
                  value={editDirectorName}
                  onChange={(e) => setEditDirectorName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditCampus(null)}
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
