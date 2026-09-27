import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Clock,
  CheckCircle,
  Eye,
  Check,
  RotateCcw,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  BookOpen,
  Award,
  ListOrdered,
  FileCheck2,
  BookmarkCheck,
  User,
  X
} from 'lucide-react';

interface CourseFileItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits?: number;
  batch?: string;
  session?: string;
  semester?: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  teacherRole?: string;
  campusName?: string;
  departmentName?: string;
  hodName?: string;
  status: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewComment?: string;
  templateData?: any;
  fileUrl?: string;
  fileName?: string;
}

export const HODPendingCourseFiles: React.FC = () => {
  const { currentUser } = useAuth();
  const [files, setFiles] = useState<CourseFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');

  // Modals & Actions
  const [viewFile, setViewFile] = useState<CourseFileItem | null>(null);
  const [approveConfirmId, setApproveConfirmId] = useState<string | null>(null);
  const [returnModalFile, setReturnModalFile] = useState<CourseFileItem | null>(null);
  const [returnComment, setReturnComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPendingFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('cfms_token');
      // Fetch only pending/submitted files
      const res = await fetch('/api/hod/course-files?status=Pending', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setFiles(resData.data || []);
      } else {
        setError(resData.message || 'Unable to load pending course files.');
      }
    } catch (err: any) {
      setError('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingFiles();
  }, [currentUser]);

  // Handle Approve
  const handleApprove = async (fileId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('cfms_token');
      const res = await fetch(`/api/hod/course-files/${fileId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        },
        body: JSON.stringify({ reviewComment: 'Course file reviewed and approved.' })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast('Course file approved successfully!', 'success');
        setApproveConfirmId(null);
        if (viewFile?.id === fileId) setViewFile(null);
        fetchPendingFiles();
      } else {
        showToast(resData.message || 'Failed to approve course file.', 'error');
      }
    } catch (err: any) {
      showToast('Error approving course file. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Return
  const handleReturn = async () => {
    if (!returnModalFile) return;
    if (!returnComment.trim()) {
      showToast('Please provide feedback comments detailing what needs correction.', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('cfms_token');
      const res = await fetch(`/api/hod/course-files/${returnModalFile.id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        },
        body: JSON.stringify({ reviewComment: returnComment.trim() })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        showToast('Course file returned to teacher with review comments.', 'success');
        setReturnModalFile(null);
        setReturnComment('');
        if (viewFile?.id === returnModalFile.id) setViewFile(null);
        fetchPendingFiles();
      } else {
        showToast(resData.message || 'Failed to return course file.', 'error');
      }
    } catch (err: any) {
      showToast('Error returning course file. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter files
  const filteredFiles = files.filter((f) => {
    const matchesSearch =
      f.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBatch = batchFilter === 'All' || f.batch === batchFilter;
    const matchesSemester = semesterFilter === 'All' || f.semester === semesterFilter;
    return matchesSearch && matchesBatch && matchesSemester;
  });

  // Extract unique batches present
  const availableBatches = Array.from(new Set(files.map((f) => f.batch).filter(Boolean)));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-bounce-short ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
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

      {/* Header */}
      <div className="bg-white rounded-2xl border border-amber-200/80 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Review Queue</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading">
            Pending Course Files
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Course files submitted by teachers in your department awaiting HOD evaluation and approval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pending Count: {files.length}</span>
          </div>
          <button
            onClick={fetchPendingFiles}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by course code, title, or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50/70 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {availableBatches.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="font-semibold text-2xs uppercase tracking-wider text-slate-500">Batch:</span>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="All">All Batches</option>
                {availableBatches.map((b) => (
                  <option key={b} value={b}>Batch {b}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-2xs uppercase tracking-wider text-slate-500">Semester:</span>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Semesters</option>
              <option value="1st Semester">1st Semester</option>
              <option value="2nd Semester">2nd Semester</option>
              <option value="3rd Semester">3rd Semester</option>
              <option value="4th Semester">4th Semester</option>
              <option value="5th Semester">5th Semester</option>
              <option value="6th Semester">6th Semester</option>
              <option value="7th Semester">7th Semester</option>
              <option value="8th Semester">8th Semester</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Files Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-600 mb-3" />
            <p className="font-bold text-slate-700 text-sm">Loading pending course files...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-600">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-500 mb-2" />
            <p className="font-bold text-sm">{error}</p>
            <button
              onClick={fetchPendingFiles}
              className="mt-3 px-4 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold hover:bg-rose-100 cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800">No pending course files.</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All course files submitted for your department have been reviewed, or teachers have not yet submitted course files for evaluation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 uppercase font-bold text-2xs tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Course Code & Title</th>
                  <th className="px-6 py-3.5">Teacher</th>
                  <th className="px-6 py-3.5">Batch & Session</th>
                  <th className="px-6 py-3.5">Semester</th>
                  <th className="px-6 py-3.5">Submitted Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-2xs font-extrabold">
                          {file.courseCode}
                        </span>
                        <span>{file.courseTitle}</span>
                      </div>
                      <div className="text-2xs text-slate-500 mt-0.5">
                        {file.credits ? `${file.credits} Credit Hours` : '3 Credit Hours'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{file.teacherName}</span>
                      </div>
                      <div className="text-2xs text-slate-400">{file.teacherEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">Batch {file.batch || '2024'}</div>
                      <div className="text-2xs text-slate-400">{file.session || '2024–2025'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-2xs">
                        {file.semester || '1st Semester'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {file.submittedAt
                        ? new Date(file.submittedAt).toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : 'Recent'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-extrabold border bg-amber-50 text-amber-700 border-amber-200">
                        <Clock className="w-3 h-3" />
                        <span>{file.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewFile(file)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 hover:text-emerald-700 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          title="View Course File"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                        <button
                          onClick={() => setApproveConfirmId(file.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          title="Quick Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setReturnModalFile(file);
                            setReturnComment('');
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          title="Return with Feedback"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Modal 1: Comprehensive Course File View & Review Modal ─── */}
      {viewFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight">
                    {viewFile.courseCode} — {viewFile.courseTitle}
                  </h3>
                  <p className="text-2xs text-slate-300">
                    Submitted by {viewFile.teacherName} • Batch {viewFile.batch} • {viewFile.semester}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewFile(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Structured Course File Information */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Metadata Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Teacher</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{viewFile.teacherName}</p>
                  <p className="text-2xs text-slate-500">{viewFile.teacherEmail || 'Faculty Member'}</p>
                </div>
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Academic Term</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">Batch {viewFile.batch || '2024'}</p>
                  <p className="text-2xs text-slate-500">{viewFile.session || '2024–2025'} • {viewFile.semester}</p>
                </div>
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Credit Hours</span>
                  <p className="font-extrabold text-emerald-800 mt-0.5">{viewFile.credits || 3} Credit Hours</p>
                  <p className="text-2xs text-slate-500">Theory & Practical</p>
                </div>
                <div>
                  <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <p className="mt-0.5">
                    <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold border bg-amber-50 text-amber-700 border-amber-200">
                      {viewFile.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Template Data Tabs / Content */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b pb-2">
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  <span>Course File Components & Verification Sheet</span>
                </h4>

                {/* Official 15-Item Verification Checklist Table */}
                {viewFile.templateData?.checklist && Array.isArray(viewFile.templateData.checklist) && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h5 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-emerald-600" />
                        <span>Official 15-Item Course File Verification Sheet</span>
                      </h5>
                      <span className="text-3xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {viewFile.templateData.checklist.filter((i: any) => i.verified === 'Yes').length} / 15 Verified (Yes)
                      </span>
                    </div>

                    <div className="border border-slate-300 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-300">
                            <th className="py-2 px-3 font-bold text-slate-800 w-16 text-center border-r border-slate-300">Sr No.</th>
                            <th className="py-2 px-3 font-bold text-slate-800 border-r border-slate-300">Content</th>
                            <th className="py-2 px-3 font-bold text-slate-800 w-32 text-center">Verified(Yes/No)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-2xs">
                          {viewFile.templateData.checklist.map((item: any) => (
                            <tr key={item.srNo} className="hover:bg-slate-50">
                              <td className="py-1.5 px-3 font-mono font-bold text-slate-700 text-center border-r border-slate-300">
                                {item.srNo}.
                              </td>
                              <td className="py-1.5 px-3 text-slate-800 border-r border-slate-300">
                                <span className="font-semibold">{item.content}</span>
                                {item.fileName && (
                                  <span className="block text-3xs text-slate-400 font-mono">
                                    File: {item.fileName} ({item.fileSize})
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 px-3 text-center font-bold">
                                {item.verified === 'Yes' ? (
                                  <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-3xs">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded text-3xs">
                                    None
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}


                {/* Course Outline & Description */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h5 className="font-extrabold text-slate-800 text-xs mb-1">Course Description & Objectives</h5>
                  <p className="text-slate-600 leading-relaxed">
                    {viewFile.templateData?.description ||
                      'Comprehensive course file covering core foundational principles, structured laboratory work, assignments, quizzes, and continuous learning outcome assessments.'}
                  </p>
                </div>

                {/* Course Learning Outcomes (CLOs) */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h5 className="font-extrabold text-slate-800 text-xs mb-2">Course Learning Outcomes (CLOs)</h5>
                  <div className="space-y-2">
                    {(viewFile.templateData?.clos || [
                      { code: 'CLO-1', text: 'Understand core theoretical principles and foundational models.', plo: 'PLO-1' },
                      { code: 'CLO-2', text: 'Design and implement practical solutions meeting rigorous design constraints.', plo: 'PLO-3' },
                      { code: 'CLO-3', text: 'Analyze and evaluate performance benchmarks using modern toolsets.', plo: 'PLO-5' }
                    ]).map((clo: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-2xs shrink-0">
                          {clo.code}
                        </span>
                        <div className="flex-1 text-slate-700">{clo.text}</div>
                        <span className="text-2xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                          Mapped to: {clo.plo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assessment Breakdown */}
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h5 className="font-extrabold text-slate-800 text-xs mb-2">Assessment & Grading Scheme</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-2xs text-slate-500 font-semibold block">Quizzes & Assignments</span>
                      <span className="text-sm font-extrabold text-slate-800">15%</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-2xs text-slate-500 font-semibold block">Midterm Exam</span>
                      <span className="text-sm font-extrabold text-slate-800">25%</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-2xs text-slate-500 font-semibold block">Lab / Project</span>
                      <span className="text-sm font-extrabold text-slate-800">10%</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-2xs text-slate-500 font-semibold block">Final Terminal Exam</span>
                      <span className="text-sm font-extrabold text-slate-800">50%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with HOD Review Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setViewFile(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
              >
                Close View
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setReturnModalFile(viewFile);
                    setReturnComment('');
                  }}
                  className="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Return with Comments</span>
                </button>
                <button
                  onClick={() => handleApprove(viewFile.id)}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Course File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Quick Approve Confirmation ─── */}
      {approveConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">Approve this Course File?</h3>
              <p className="text-xs text-slate-500 mt-1">
                The course file will be marked as Approved and the teacher will be notified. It will be moved to the Approved Course Files module.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setApproveConfirmId(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(approveConfirmId)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Confirm Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 3: Return to Teacher with Comments ─── */}
      {returnModalFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Return Course File: {returnModalFile.courseCode}
                  </h3>
                  <p className="text-2xs text-slate-500">Teacher: {returnModalFile.teacherName}</p>
                </div>
              </div>
              <button
                onClick={() => setReturnModalFile(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Feedback & Reason for Return <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={returnComment}
                onChange={(e) => setReturnComment(e.target.value)}
                placeholder="Detail what needs revision (e.g., 'Please update the assessment scheme and add missing weekly lab plans for weeks 8-12.')"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white"
              />
              <p className="text-2xs text-slate-400 mt-1">
                The teacher will receive this feedback and can edit and resubmit this course file.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setReturnModalFile(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                disabled={actionLoading || !returnComment.trim()}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>Return to Teacher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
