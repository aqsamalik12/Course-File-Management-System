import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  Search,
  CheckCircle,
  Clock,
  RotateCcw,
  Eye,
  Check,
  X,
  AlertCircle,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  BookOpen,
  User,
  Award,
  ListOrdered,
  FileCheck2,
  BookmarkCheck,
  Download,
  Printer
} from 'lucide-react';
import { CourseFileCertificateModal } from '../../common/CourseFileCertificateModal';
import { CourseFileDossierModal } from '../../common/CourseFileDossierModal';

interface SemesterFolder {
  name: string;
  fileCount: number;
  pendingCount: number;
  approvedCount: number;
  returnedCount: number;
}

interface SessionData {
  session: string;
  totalFiles: number;
  semesters: SemesterFolder[];
}

interface BatchData {
  batch: string;
  totalFiles: number;
  sessions: SessionData[];
}

interface CourseFileItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  title?: string;
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

export const HODCourseFiles: React.FC = () => {
  const { currentUser } = useAuth();

  // Hierarchy Data & Navigation State
  const [hierarchy, setHierarchy] = useState<BatchData[]>([]);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState<string | null>('2024');
  const [selectedSession, setSelectedSession] = useState<string | null>('2024–2025');
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  // Files in selected scope
  const [files, setFiles] = useState<CourseFileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals & Actions
  const [viewFile, setViewFile] = useState<CourseFileItem | null>(null);
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [approveConfirmId, setApproveConfirmId] = useState<string | null>(null);
  const [returnModalFile, setReturnModalFile] = useState<CourseFileItem | null>(null);
  const [returnComment, setReturnComment] = useState('');
  const [showCertificateFile, setShowCertificateFile] = useState<CourseFileItem | null>(null);
  const [showDossierFile, setShowDossierFile] = useState<CourseFileItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (viewFile?.templateData?.checklist && Array.isArray(viewFile.templateData.checklist)) {
      setReviewItems(
        viewFile.templateData.checklist.map((item: any) => ({
          ...item,
          status: item.status || (item.verified === 'Yes' ? 'Verified' : 'Needs Improvement'),
          comment: item.comment || (item.verified === 'Yes' ? 'Verified and compliant.' : '')
        }))
      );
    } else {
      setReviewItems([]);
    }
  }, [viewFile]);

  const updateItemStatus = (srNo: number, status: 'Verified' | 'Needs Improvement') => {
    setReviewItems((prev) =>
      prev.map((it) =>
        it.srNo === srNo
          ? {
              ...it,
              status,
              verified: status === 'Verified' ? 'Yes' : 'None',
              comment: it.comment || (status === 'Verified' ? 'Complete and verified.' : 'Needs improvement.')
            }
          : it
      )
    );
  };

  const updateItemComment = (srNo: number, comment: string) => {
    setReviewItems((prev) =>
      prev.map((it) => (it.srNo === srNo ? { ...it, comment } : it))
    );
  };

  const getHeaders = () => {
    const token = localStorage.getItem('cfms_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'x-user-id': currentUser?.id || '',
      'x-user-role': currentUser?.role || 'HOD',
      'x-department-id': currentUser?.departmentId || ''
    };
  };

  // 1. Fetch Hierarchy (Batches -> Sessions -> 4 Semesters)
  const fetchHierarchy = async () => {
    setLoadingHierarchy(true);
    try {
      const res = await fetch('/api/hod/batches', { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setHierarchy(data.data);
        if (data.data.length > 0 && !selectedBatch) {
          setSelectedBatch(data.data[0].batch);
          if (data.data[0].sessions?.length > 0) {
            setSelectedSession(data.data[0].sessions[0].session);
          }
        }
      }
    } catch {
      // keep empty hierarchy
    } finally {
      setLoadingHierarchy(false);
    }
  };

  // 2. Fetch Files for current selection
  const fetchFiles = async () => {
    setLoadingFiles(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatch) params.append('batch', selectedBatch);
      if (selectedSession) params.append('session', selectedSession);
      if (selectedSemester) params.append('semester', selectedSemester);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/hod/course-files?${params.toString()}`, { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success) {
        setFiles(data.data || []);
      }
    } catch {
      // error handling
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, [currentUser]);

  useEffect(() => {
    fetchFiles();
  }, [selectedBatch, selectedSession, selectedSemester, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles();
  };

  // ─── Approve Action ──────────────────────────────────────────────────────────
  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/hod/course-files/${id}/approve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          checklist: reviewItems.length > 0 ? reviewItems : undefined,
          remarks: 'Approved by HOD'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Course file approved successfully! Certificate generated.');
        setApproveConfirmId(null);
        if (viewFile?.id === id) {
          const approvedObj = {
            ...viewFile,
            status: 'Approved',
            reviewedAt: new Date().toISOString(),
            reviewedBy: currentUser?.name,
            templateData: {
              ...viewFile.templateData,
              checklist: reviewItems.length > 0 ? reviewItems : viewFile.templateData?.checklist
            }
          };
          setViewFile(null);
          setShowCertificateFile(approvedObj);
        }
        await fetchFiles();
        await fetchHierarchy();
      } else {
        showToast(data.message || 'Approval failed.', 'error');
      }
    } catch {
      showToast('An error occurred during approval.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Return Action ───────────────────────────────────────────────────────────
  const handleReturn = async () => {
    if (!returnModalFile) return;
    const finalComment = returnComment.trim() || 'Returned for revision with individual item comments.';

    setActionLoading(true);
    try {
      const res = await fetch(`/api/hod/course-files/${returnModalFile.id}/return`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          checklist: reviewItems.length > 0 ? reviewItems : undefined,
          reviewComment: finalComment
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Course file returned for revision with feedback.');
        setReturnModalFile(null);
        setReturnComment('');
        if (viewFile?.id === returnModalFile.id) {
          setViewFile(null);
        }
        await fetchFiles();
        await fetchHierarchy();
      } else {
        showToast(data.message || 'Action failed.', 'error');
      }
    } catch {
      showToast('An error occurred during return.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Active Batch & Session objects
  const activeBatchObj = hierarchy.find(b => b.batch === selectedBatch) || hierarchy[0];
  const activeSessionObj = activeBatchObj?.sessions?.find(s => s.session === selectedSession) || activeBatchObj?.sessions?.[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Alert */}
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

      {/* ─── Header: Primary Purpose Course Files ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5 border border-emerald-200/70">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Course File Repository</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Course Files
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hierarchical management: Batch → Session → 4 Semesters → Submitted Course Files
          </p>
        </div>

        <button
          onClick={() => { fetchHierarchy(); fetchFiles(); }}
          disabled={loadingFiles || loadingHierarchy}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${(loadingFiles || loadingHierarchy) ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh Files</span>
        </button>
      </div>

      {/* ─── Breadcrumb Navigation (Requirement 32) ─── */}
      <nav className="flex items-center gap-2 text-xs font-bold bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto text-slate-600">
        <button
          onClick={() => { setSelectedSemester(null); }}
          className="hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Folder className="w-4 h-4 text-emerald-600" />
          <span>Course Files</span>
        </button>

        {selectedBatch && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 shrink-0">Batch {selectedBatch}</span>
          </>
        )}

        {selectedSession && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => setSelectedSemester(null)}
              className={`hover:text-emerald-700 transition-colors cursor-pointer shrink-0 ${!selectedSemester ? 'text-emerald-700 font-extrabold' : 'text-slate-700'}`}
            >
              Session {selectedSession}
            </button>
          </>
        )}

        {selectedSemester && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
              {selectedSemester}
            </span>
          </>
        )}
      </nav>

      {/* ─── Level 1 & 2: Batch & Session Selector Bar ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Batch Selection Tabs */}
        <div className="flex items-center gap-2">
          <span className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider mr-1">Batch:</span>
          {hierarchy.map(b => (
            <button
              key={b.batch}
              onClick={() => {
                setSelectedBatch(b.batch);
                if (b.sessions?.length > 0) setSelectedSession(b.sessions[0].session);
                setSelectedSemester(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedBatch === b.batch
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Batch {b.batch}
            </button>
          ))}
        </div>

        {/* Session Selection */}
        {activeBatchObj && activeBatchObj.sessions && (
          <div className="flex items-center gap-2">
            <span className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider mr-1">Session:</span>
            {activeBatchObj.sessions.map(s => (
              <button
                key={s.session}
                onClick={() => {
                  setSelectedSession(s.session);
                  setSelectedSemester(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSession === s.session
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60'
                }`}
              >
                {s.session}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Level 3: The 4 Standard Semester Containers (Requirements 7, 8, 31, 33) ─── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-extrabold uppercase text-slate-500 tracking-wider text-2xs">
            Standard Semester Containers (Batch {selectedBatch} • Session {selectedSession})
          </span>
          {selectedSemester && (
            <button
              onClick={() => setSelectedSemester(null)}
              className="text-2xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Show All Semesters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(activeSessionObj?.semesters || [
            { name: '1st Semester', fileCount: 0, pendingCount: 0, approvedCount: 0, returnedCount: 0 },
            { name: '2nd Semester', fileCount: 0, pendingCount: 0, approvedCount: 0, returnedCount: 0 },
            { name: '3rd Semester', fileCount: 0, pendingCount: 0, approvedCount: 0, returnedCount: 0 },
            { name: '4th Semester', fileCount: 0, pendingCount: 0, approvedCount: 0, returnedCount: 0 },
            { name: '5th Semester', fileCount: 0, pendingCount: 0, approvedCount: 0, returnedCount: 0 },
            { name: '6th Semester', fileCount: 0, pendingCount: 0, approvedCount: 0, returnedCount: 0 },
            { name: '7th Semester', fileCount: 0, pendingCount: 0, approvedCount: 0, returnedCount: 0 },
            { name: '8th Semester', fileCount: 0, pendingCount: 0, approvedCount: 0, returnedCount: 0 }
          ]).map((sem) => {
            const isSelected = selectedSemester === sem.name;
            return (
              <div
                key={sem.name}
                onClick={() => setSelectedSemester(isSelected ? null : sem.name)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer select-none group relative overflow-hidden ${
                  isSelected
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-600'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-2xs hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {isSelected ? (
                      <FolderOpen className="w-5 h-5 text-emerald-200" />
                    ) : (
                      <Folder className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                    )}
                    <h3 className={`text-sm font-extrabold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {sem.name}
                    </h3>
                  </div>
                  {sem.pendingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-amber-500 text-white">
                      {sem.pendingCount} Pending
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <span className={`text-2xl font-black font-heading ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {sem.fileCount}
                  </span>
                  <span className={`text-2xs font-bold ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    Course {sem.fileCount === 1 ? 'File' : 'Files'}
                  </span>
                </div>

                <div className={`mt-3 pt-2 border-t text-2xs flex items-center justify-between font-bold ${
                  isSelected ? 'border-emerald-700 text-emerald-100' : 'border-slate-100 text-emerald-700'
                }`}>
                  <span>{isSelected ? 'Viewing Semester Files' : 'Open Semester Folder →'}</span>
                  {sem.approvedCount > 0 && (
                    <span className="text-3xs opacity-80">{sem.approvedCount} Approved</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Search & Status Filters for Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          {['All', 'Pending', 'Approved', 'Returned'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'Pending' ? 'Pending Review' : tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code, title, teacher..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </form>
      </div>

      {/* ─── Level 4: Course Files Table (Requirement 18, 33) ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 font-heading">
              {selectedSemester ? `${selectedSemester} Course Files` : 'All Semester Course Files'}
            </h2>
            <p className="text-2xs text-slate-500">
              Batch {selectedBatch} • Session {selectedSession} • Scoped to {currentUser?.departmentName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const approvedInScope = files.filter(f => f.status === 'Approved');
                if (approvedInScope.length === 0) {
                  showToast('No approved course files available to download in this semester.', 'error');
                  return;
                }
                setShowDossierFile(approvedInScope[0]);
                showToast(`Preparing package for ${selectedSemester || 'Current Semester'} (${approvedInScope.length} course files)...`, 'success');
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
              title="Download all approved files in this semester"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Semester Files</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const approvedInScope = files.filter(f => f.status === 'Approved');
                if (approvedInScope.length === 0) {
                  showToast('No approved course files available in this batch.', 'error');
                  return;
                }
                setShowDossierFile(approvedInScope[0]);
                showToast(`Preparing batch folder package for Batch ${selectedBatch} (${approvedInScope.length} files)...`, 'success');
              }}
              className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
              title="Download complete batch course file folder package"
            >
              <Folder className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download Batch Package</span>
            </button>
            <span className="text-xs font-bold text-slate-500 ml-2">
              Total: <strong className="text-slate-900">{files.length}</strong>
            </span>
          </div>
        </div>

        {loadingFiles ? (
          <div className="p-16 text-center text-xs text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
            <p className="font-bold text-slate-700">Loading course files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No course files found.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When approved teachers submit course files for {selectedSemester || 'this session'}, they will automatically appear inside their respective semester folders.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-2xs tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Course Code & Title</th>
                  <th className="px-6 py-3.5">Teacher</th>
                  <th className="px-6 py-3.5">Semester</th>
                  <th className="px-6 py-3.5">Credits</th>
                  <th className="px-6 py-3.5">Submitted Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{file.courseCode} — {file.courseTitle}</div>
                      <div className="text-2xs text-slate-500">{file.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{file.teacherName}</div>
                      <div className="text-2xs text-slate-500">{file.teacherEmail || file.teacherRole}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {file.semester || '1st Semester'}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-800">
                      {file.credits || 3} Credits
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {file.submittedAt ? new Date(file.submittedAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Draft'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-extrabold border ${
                          file.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : file.status === 'Returned' || file.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : file.status === 'Draft'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {file.status === 'Submitted' ? 'Pending Review' : file.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setViewFile(file)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                          title="Open and Review Course File"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Review</span>
                        </button>

                        {file.status === 'Approved' && (
                          <>
                            <button
                              onClick={() => setShowDossierFile(file)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="Download Course File PDF Dossier"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-700" />
                              <span>Download PDF</span>
                            </button>
                            <button
                              onClick={() => setShowCertificateFile(file)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="View & Download Official Certificate"
                            >
                              <Award className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Certificate</span>
                            </button>
                          </>
                        )}

                        {(file.status === 'Submitted' || file.status === 'Under Review') && (
                          <>
                            <button
                              onClick={() => setApproveConfirmId(file.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="Approve File"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                setReturnModalFile(file);
                                setReturnComment('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                              title="Return for Revision"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Return</span>
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

      {/* ─── Detailed Course File Review Modal (Requirement 19) ─── */}
      {viewFile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-fade-in border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-3xs font-extrabold uppercase mb-1">
                  <span>Course Dossier Review</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 font-heading">
                  {viewFile.courseCode} — {viewFile.courseTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewFile.semester} • Session {viewFile.session} • Batch {viewFile.batch}
                </p>
              </div>
              <button
                onClick={() => setViewFile(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata Grid (Requirement 19) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-3xs font-bold text-slate-400 uppercase">Teacher</span>
                <p className="font-bold text-slate-900 truncate">{viewFile.teacherName}</p>
              </div>
              <div>
                <span className="text-3xs font-bold text-slate-400 uppercase">Department</span>
                <p className="font-bold text-slate-900 truncate">{viewFile.departmentName || currentUser?.departmentName}</p>
              </div>
              <div>
                <span className="text-3xs font-bold text-slate-400 uppercase">Campus</span>
                <p className="font-bold text-slate-900 truncate">{viewFile.campusName || currentUser?.campus}</p>
              </div>
              <div>
                <span className="text-3xs font-bold text-slate-400 uppercase">Status</span>
                <p className="font-bold text-emerald-700">{viewFile.status}</p>
              </div>
              <div>
                <span className="text-3xs font-bold text-slate-400 uppercase">Credit Hours</span>
                <p className="font-bold text-slate-900">{viewFile.credits || 3} Credits</p>
              </div>
              <div>
                <span className="text-3xs font-bold text-slate-400 uppercase">Submitted Date</span>
                <p className="font-bold text-slate-900">
                  {viewFile.submittedAt ? new Date(viewFile.submittedAt).toLocaleDateString('en-PK') : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-3xs font-bold text-slate-400 uppercase">Assigned HOD</span>
                <p className="font-bold text-slate-900 truncate">{viewFile.hodName || currentUser?.name}</p>
              </div>
              <div>
                <span className="text-3xs font-bold text-slate-400 uppercase">Reviewed By</span>
                <p className="font-bold text-slate-900 truncate">{viewFile.reviewedBy || 'Pending'}</p>
              </div>
            </div>

            {/* Rejection / Return comments banner if any */}
            {viewFile.reviewComment && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1">
                <span className="font-bold">HOD Review Notes / Return Comments:</span>
                <p className="text-rose-800 italic">"{viewFile.reviewComment}"</p>
              </div>
            )}

            {/* Course File Template Content Sections (Requirement 11, 19) */}
            <div className="space-y-4 text-xs">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-2xs flex items-center gap-1.5 border-b pb-2">
                <FileCheck2 className="w-4 h-4 text-emerald-700" />
                <span>Submitted Template Content & Verification Sheet</span>
              </h4>

              {/* Official 15-Item Verification Checklist Table */}
              {(reviewItems.length > 0 || (viewFile.templateData?.checklist && Array.isArray(viewFile.templateData.checklist))) && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h5 className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>Official 15-Item Course File Verification Sheet</span>
                    </h5>
                    <span className="text-3xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {(reviewItems.length > 0 ? reviewItems : viewFile.templateData?.checklist || []).filter((i: any) => i.status === 'Verified' || i.verified === 'Yes').length} / 15 Verified
                    </span>
                  </div>

                  <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/90 border-b border-slate-300 text-slate-700">
                          <th className="py-2.5 px-3 font-bold w-12 text-center border-r border-slate-300">Sr.</th>
                          <th className="py-2.5 px-3 font-bold w-1/3 border-r border-slate-300">Document / Section</th>
                          <th className="py-2.5 px-3 font-bold w-48 text-center border-r border-slate-300">Review Decision</th>
                          <th className="py-2.5 px-3 font-bold">Mandatory HOD Comment / Feedback</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-2xs">
                        {(reviewItems.length > 0 ? reviewItems : viewFile.templateData?.checklist || []).map((item: any) => {
                          const isNeedsImp = item.status === 'Needs Improvement';
                          const isVer = item.status === 'Verified' || item.verified === 'Yes';
                          const isEditable = viewFile.status === 'Submitted' || viewFile.status === 'Under Review';

                          return (
                            <tr
                              key={item.srNo}
                              className={`transition-colors ${
                                isNeedsImp ? 'bg-rose-50/70' : isVer ? 'hover:bg-emerald-50/20' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-2 px-3 font-mono font-bold text-slate-700 text-center border-r border-slate-300 align-top pt-3">
                                {item.srNo}.
                              </td>

                              <td className="py-2 px-3 border-r border-slate-300 align-top">
                                <span className="font-extrabold text-slate-900 block text-xs">
                                  {item.content || item.name}
                                </span>
                                {item.fileName ? (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-3xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                      <span>📄</span>
                                      <span className="truncate max-w-[200px]">{item.fileName}</span>
                                      <span>({item.fileSize || 'PDF'})</span>
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-3xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                                    No direct file attached
                                  </span>
                                )}
                              </td>

                              {/* Review Decision */}
                              <td className="py-2 px-3 border-r border-slate-300 align-top text-center">
                                {isEditable ? (
                                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 gap-1">
                                    <button
                                      type="button"
                                      onClick={() => updateItemStatus(item.srNo, 'Verified')}
                                      className={`px-2.5 py-1 rounded-md font-bold text-3xs flex items-center gap-1 transition-all cursor-pointer ${
                                        isVer && !isNeedsImp
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'text-slate-600 hover:text-emerald-700 hover:bg-white'
                                      }`}
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Verified</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateItemStatus(item.srNo, 'Needs Improvement')}
                                      className={`px-2.5 py-1 rounded-md font-bold text-3xs flex items-center gap-1 transition-all cursor-pointer ${
                                        isNeedsImp
                                          ? 'bg-rose-600 text-white shadow-xs'
                                          : 'text-slate-600 hover:text-rose-700 hover:bg-white'
                                      }`}
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      <span>Return</span>
                                    </button>
                                  </div>
                                ) : (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded font-extrabold text-3xs border ${
                                      isNeedsImp
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}
                                  >
                                    {isNeedsImp ? 'Needs Improvement' : 'Verified'}
                                  </span>
                                )}
                              </td>

                              {/* Mandatory Individual Comment */}
                              <td className="py-2 px-3 align-top space-y-1.5">
                                {isEditable ? (
                                  <>
                                    <input
                                      type="text"
                                      value={item.comment || ''}
                                      onChange={(e) => updateItemComment(item.srNo, e.target.value)}
                                      placeholder="Enter specific mandatory comment for this document..."
                                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                                        isNeedsImp
                                          ? 'border-rose-400 bg-white text-rose-900 focus:ring-1 focus:ring-rose-500 font-semibold'
                                          : 'border-slate-300 bg-white text-slate-800 focus:ring-1 focus:ring-emerald-500'
                                      }`}
                                    />
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <button
                                        type="button"
                                        onClick={() => updateItemComment(item.srNo, 'Complete and verified.')}
                                        className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 cursor-pointer"
                                      >
                                        + Complete & Verified
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateItemComment(item.srNo, 'CV mein required information missing hai.')}
                                        className="text-[9px] font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 cursor-pointer"
                                      >
                                        + CV missing info
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateItemComment(item.srNo, 'Mid Term paper upload kar dein.')}
                                        className="text-[9px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 cursor-pointer"
                                      >
                                        + Upload Midterm
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => updateItemComment(item.srNo, 'Final examination record complete hai.')}
                                        className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 cursor-pointer"
                                      >
                                        + Final Exam Complete
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-700 italic">
                                    {item.comment || 'No specific comment recorded.'}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              {/* 1. Course Description */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 uppercase text-3xs tracking-wider">1. Course Description & Objectives</span>
                <p className="text-slate-700 leading-relaxed">
                  {viewFile.templateData?.courseDescription ||
                    viewFile.templateData?.courseObjectives ||
                    'Comprehensive curriculum coverage designed to equip students with theoretical foundations and practical skills in accordance with Higher Education Commission (HEC) standard guidelines.'}
                </p>
              </div>

              {/* 2. Course Learning Outcomes (CLOs) */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 uppercase text-3xs tracking-wider">2. Course Learning Outcomes (CLOs)</span>
                {Array.isArray(viewFile.templateData?.clos) && viewFile.templateData.clos.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {viewFile.templateData.clos.map((clo: any, idx: number) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <span className="font-bold text-slate-800">{clo.code}: {clo.description}</span>
                        <span className="text-3xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{clo.plo || 'Mapped to PLO-1'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 italic">
                    {typeof viewFile.templateData?.clos === 'string'
                      ? viewFile.templateData.clos
                      : 'CLO-1: Understand fundamental principles; CLO-2: Analyze and design solutions; CLO-3: Evaluate system performance.'}
                  </p>
                )}
              </div>

              {/* 3. Weekly Lecture Plan */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 uppercase text-3xs tracking-wider">3. 16-Week Lecture & Lab Schedule</span>
                {Array.isArray(viewFile.templateData?.weeklyPlan) && viewFile.templateData.weeklyPlan.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {viewFile.templateData.weeklyPlan.map((w: any, idx: number) => (
                      <div key={idx} className="py-1 flex items-center justify-between text-2xs">
                        <span className="font-bold text-slate-900">Week {w.week || idx + 1}:</span>
                        <span className="text-slate-700 flex-1 ml-3 truncate">{w.topic}</span>
                        <span className="text-slate-400">{w.activity || 'Lecture'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600 italic">
                    Standard 16-week timetable followed: Weeks 1–8: Pre-Midterm lectures and Quizzes; Week 9: Midterm Examination; Weeks 10–16: Post-Midterm lectures, assignments, and Final Examination.
                  </p>
                )}
              </div>

              {/* 4. Assessment Plan */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 uppercase text-3xs tracking-wider">4. Assessment & Grading Criteria</span>
                <div className="grid grid-cols-4 gap-2 text-center text-2xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-3xs text-slate-400 uppercase font-bold">Quizzes</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">15%</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-3xs text-slate-400 uppercase font-bold">Assignments</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">15%</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-3xs text-slate-400 uppercase font-bold">Midterm</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">30%</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-3xs text-slate-400 uppercase font-bold">Final Exam</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">40%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setViewFile(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>

              {viewFile.status === 'Approved' && (
                <>
                  <button
                    onClick={() => setShowDossierFile(viewFile)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-4 h-4 text-slate-700" />
                    <span>Download PDF Dossier</span>
                  </button>
                  <button
                    onClick={() => setShowCertificateFile(viewFile)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>View Certificate</span>
                  </button>
                </>
              )}

              {(viewFile.status === 'Submitted' || viewFile.status === 'Under Review') && (
                <>
                  <button
                    onClick={() => {
                      setReturnModalFile(viewFile);
                      setReturnComment('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs cursor-pointer transition-all"
                  >
                    Return for Revision
                  </button>
                  <button
                    onClick={() => setApproveConfirmId(viewFile.id)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer transition-all shadow-md shadow-emerald-950/20"
                  >
                    Approve Course File
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Approve Confirmation Dialog ─── */}
      {approveConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Approve Course File
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to approve this course file?
              </p>
              <p className="text-2xs text-slate-400">
                The file status will be updated to Approved, and the teacher will receive an official approval notification.
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

      {/* ─── Return Confirmation Dialog (Requirement 21, 43) ─── */}
      {returnModalFile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fade-in border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 font-heading">
                Return Course File for Revision
              </h3>
              <p className="text-xs text-slate-600">
                Provide constructive feedback explaining what needs revision.
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-2xs font-bold text-slate-700 uppercase">
                Return Feedback & Instructions <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={returnComment}
                onChange={(e) => setReturnComment(e.target.value)}
                placeholder="E.g. Please update CLO assessment mapping, attach missing lecture breakdown for Week 12, or revise grading rubric..."
                rows={3}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 text-slate-900"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setReturnModalFile(null)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReturn}
                disabled={actionLoading || !returnComment.trim()}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-950/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Return File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Official Certificate Modal (Step 20, 23) ─── */}
      {showCertificateFile && (
        <CourseFileCertificateModal
          courseFile={showCertificateFile}
          onClose={() => setShowCertificateFile(null)}
        />
      )}

      {/* ─── Printable Course Dossier Modal (Step 21, 22) ─── */}
      {showDossierFile && (
        <CourseFileDossierModal
          courseFile={showDossierFile}
          onClose={() => setShowDossierFile(null)}
        />
      )}
    </div>
  );
};
