import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  BookOpen,
  User,
  Mail,
  Phone,
  Building2,
  Landmark,
  ShieldCheck,
  Calendar
} from 'lucide-react';

export const HODTeacherRequests: React.FC = () => {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [approveConfirmId, setApproveConfirmId] = useState<string | null>(null);
  const [rejectModalReq, setRejectModalReq] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('cfms_token');
      const params = new URLSearchParams();
      if (statusFilter !== 'All') {
        params.append('status', statusFilter === 'Pending' ? 'PendingHODApproval' : statusFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`/api/hod/teacher-requests?${params.toString()}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests(data.data || []);
      } else {
        setError(data.message || 'Unable to load teacher requests. Please try again.');
      }
    } catch {
      setError('Unable to load teacher requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  // ─── Approve Action ──────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('cfms_token');
      const res = await fetch(`/api/hod/teacher-requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Teacher registration request approved successfully! Teacher account is now active.');
        setApproveConfirmId(null);
        if (selectedRequest?.id === id) {
          setSelectedRequest((prev: any) => ({ ...prev, status: 'Approved' }));
        }
        await fetchRequests();
      } else {
        showToast(data.message || 'Approval failed. Please check permissions.', 'error');
      }
    } catch {
      showToast('An error occurred during approval. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Reject Action ───────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectModalReq) return;
    if (!rejectionReason.trim()) {
      showToast('A rejection reason is required.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('cfms_token');
      const res = await fetch(`/api/hod/teacher-requests/${rejectModalReq.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        },
        body: JSON.stringify({ rejectionReason: rejectionReason.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Teacher registration request rejected. The teacher has been notified.');
        setRejectModalReq(null);
        setRejectionReason('');
        if (selectedRequest?.id === rejectModalReq.id) {
          setSelectedRequest((prev: any) => ({ ...prev, status: 'Rejected', rejectionReason }));
        }
        await fetchRequests();
      } else {
        showToast(data.message || 'Rejection failed.', 'error');
      }
    } catch {
      showToast('An error occurred during rejection.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-bold border flex items-center gap-2 animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ─── Page Title Header ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5 border border-emerald-200/70">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HOD Verification & Approval</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Teacher Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review, approve, or reject teacher registration requests submitted for your department
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ─── Search & Status Filters ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'Pending' ? 'Pending Approval' : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by teacher name or email..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>
      </div>

      {/* ─── Table or States ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
            <p className="font-bold text-slate-700">Loading teacher requests...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center text-xs text-rose-700 space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="font-bold">{error}</p>
            <button
              onClick={fetchRequests}
              className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Retry
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Clock className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {statusFilter === 'Pending' ? 'No pending teacher requests.' : 'No teacher requests found.'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Teacher requests submitted for your department and campus will appear here for review.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-2xs tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Teacher Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Campus</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Submitted Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div>{req.teacherName}</div>
                      <div className="text-2xs font-semibold text-slate-400">
                        {req.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {req.teacherEmail}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {req.campusName || 'Attock Campus'}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {req.departmentName}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-extrabold border ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {req.status === 'PendingHODApproval' ? 'Pending' : req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {req.status === 'PendingHODApproval' && (
                          <>
                            <button
                              onClick={() => setApproveConfirmId(req.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                              title="Approve Teacher"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                setRejectModalReq(req);
                                setRejectionReason('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                              title="Reject Request"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── View Request Details Modal ─── */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-fade-in border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-heading">
                  Teacher Registration Details
                </h3>
                <p className="text-xs text-slate-500">
                  Review complete submitted application and course assignments
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Teacher Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Teacher Name</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedRequest.teacherName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Email Address</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedRequest.teacherEmail}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Faculty Type</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedRequest.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Contact / Phone</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedRequest.profileData?.phone || selectedRequest.phone || 'Not Provided'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Campus</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedRequest.campusName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Department</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedRequest.departmentName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Assigned HOD</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedRequest.hodName || currentUser?.name}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Current Status</span>
                <div className="mt-0.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-extrabold border ${
                      selectedRequest.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedRequest.status === 'Rejected'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {selectedRequest.status === 'PendingHODApproval' ? 'Pending Approval' : selectedRequest.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Courses / Credits Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-2xs">
                  Submitted Course Selections
                </span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Total: {selectedRequest.totalCredits || 0} Credit Hours
                </span>
              </div>

              {Array.isArray(selectedRequest.selectedCourses) && selectedRequest.selectedCourses.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  {selectedRequest.selectedCourses.map((c: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <span className="font-bold text-slate-900">{c.courseCode} — {c.courseName}</span>
                        <div className="text-2xs text-slate-500">{c.section || 'Section A'}</div>
                      </div>
                      <span className="font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {c.credits || c.creditHours || 3} Credits
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No course records attached.</p>
              )}
            </div>

            {/* Rejection reason if already rejected */}
            {selectedRequest.rejectionReason && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                <span className="font-bold">HOD Rejection Reason:</span>
                <p className="text-rose-800 italic">"{selectedRequest.rejectionReason}"</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
              {selectedRequest.status === 'PendingHODApproval' && (
                <>
                  <button
                    onClick={() => {
                      setRejectModalReq(selectedRequest);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs cursor-pointer transition-all"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => setApproveConfirmId(selectedRequest.id)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-emerald-950/20"
                  >
                    Approve Teacher
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Professional Approve Confirmation Dialog ─── */}
      {approveConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Approve Teacher Registration
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to approve this teacher registration request?
              </p>
              <p className="text-2xs text-slate-400">
                This will activate the teacher's profile, grant them access to their teacher portal, and assign the selected courses.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setApproveConfirmId(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(approveConfirmId)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Professional Reject Confirmation Dialog ─── */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Reject Teacher Registration
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to reject this teacher registration request?
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-2xs font-bold text-slate-700 uppercase">
                Rejection Reason & Instructions <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain what needs revision (e.g. incorrect credit hours, missing documentation, wrong course assignment)..."
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 text-slate-900"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRejectModalReq(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-950/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
