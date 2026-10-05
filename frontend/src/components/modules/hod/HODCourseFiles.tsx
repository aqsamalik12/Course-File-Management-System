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
  courseCount?: number;
  pendingCount: number;
  approvedCount: number;
  returnedCount: number;
}

interface SessionData {
  session: string;
  name: string;
  fileCount: number;
  totalFiles?: number;
  approvedCount: number;
  pendingCount?: number;
  semesters: SemesterFolder[];
}

interface BatchData {
  batch: string;
  totalFiles: number;
  semesters?: any[];
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
  uploadDate?: string;
}

export const HODCourseFiles: React.FC = () => {
  const { currentUser } = useAuth();

  // Hierarchy Data & Navigation State
  const [hierarchy, setHierarchy] = useState<BatchData[]>([]);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  const [hierarchyError, setHierarchyError] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
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
  const [savingItemSr, setSavingItemSr] = useState<number | null>(null);
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
              verified: status === 'Verified' ? 'Yes' : 'No',
              comment: it.comment || (status === 'Verified' ? 'Complete and verified.' : 'Needs improvement.')
            }
          : it
      )
    );
  };

  const updateItemNA = (srNo: number) => {
    setReviewItems((prev) =>
      prev.map((it) =>
        it.srNo === srNo
          ? {
              ...it,
              status: 'N/A',
              verified: 'N/A',
              comment: 'Not applicable for this course.'
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

  // Save individual item review & comment directly to database (Requirements 10, 23, 24)
  const handleSaveItemReview = async (item: any) => {
    if (!viewFile) return;
    const currentComment = (item.comment || '').trim();

    // Mandatory comment validation for Needs Improvement (Requirement 24)
    if (item.status === 'Needs Improvement' && !currentComment) {
      showToast('Please enter a comment explaining what needs to be corrected.', 'error');
      return;
    }

    setSavingItemSr(item.srNo);
    try {
      const res = await fetch(`/api/hod/course-files/${viewFile.id}/item-review`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          srNo: item.srNo,
          status: item.status || 'Verified',
          comment: currentComment
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Review and comment for Section ${item.srNo} saved successfully.`, 'success');
        if (data.data?.checklist) {
          setReviewItems(data.data.checklist);
          setViewFile((prev) => (prev ? {
            ...prev,
            status: data.data.checklist.some((it: any) => it.status === 'Needs Improvement') ? 'Needs Improvement' : prev.status,
            templateData: {
              ...prev.templateData,
              checklist: data.data.checklist
            }
          } : null));
        }
        await fetchFiles();
      } else {
        showToast(data.message || 'Failed to save item review.', 'error');
      }
    } catch {
      showToast('Network error occurred while saving review.', 'error');
    } finally {
      setSavingItemSr(null);
    }
  };

  // Save all items and comments at once
  const handleSaveAllReviews = async () => {
    if (!viewFile) return;
    const currentChecklist = reviewItems.length > 0 ? reviewItems : (viewFile.templateData?.checklist || []);

    for (const it of currentChecklist) {
      if (it.status === 'Needs Improvement' && (!it.comment || !it.comment.trim())) {
        showToast(`Please enter a comment explaining what needs to be corrected for Section ${it.srNo}.`, 'error');
        return;
      }
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/hod/course-files/${viewFile.id}/checklist-review`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ checklist: currentChecklist })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('All item reviews and comments saved to database successfully.', 'success');
        if (data.data?.templateData?.checklist) {
          setReviewItems(data.data.templateData.checklist);
        }
        await fetchFiles();
      } else {
        showToast(data.message || 'Failed to save all reviews.', 'error');
      }
    } catch {
      showToast('Network error occurred while saving reviews.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getHeaders = () => {
    const token = localStorage.getItem('cfms_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'x-user-id': currentUser?.id || '',
      'x-user-email': currentUser?.email || '',
      'x-user-role': currentUser?.role || 'HOD',
      'x-department-id': currentUser?.departmentId || '',
      'x-department-name': currentUser?.departmentName || '',
      'x-campus-id': currentUser?.campusId || '',
      'x-campus-name': currentUser?.campusName || currentUser?.campus || ''
    };
  };

  // 1. Fetch Hierarchy (Batches -> Sessions -> 4 Semesters)
  const fetchHierarchy = async () => {
    setLoadingHierarchy(true);
    setHierarchyError(null);
    try {
      const res = await fetch('/api/hod/batches', { headers: getHeaders() });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setHierarchy(data.data);
      } else {
        setHierarchyError(data.message || 'Server error loading batches.');
      }
    } catch {
      setHierarchyError('Network error connecting to CFMS server.');
    } finally {
      setLoadingHierarchy(false);
    }
  };

  // 2. Fetch Files for current selection (Progressive loading: only when semester is opened)
  const fetchFiles = async () => {
    if (!selectedSemester) {
      setFiles([]);
      return;
    }
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

  // ─── Download Handlers (All 4 Levels: Batch, Spring/Fall, Semester, Individual File) ─────────
  const handleDownloadBatchZip = async (batch: string, session?: string) => {
    try {
      const sessLabel = session ? ` ${session} session` : '';
      showToast(`Generating Batch ${batch}${sessLabel} ZIP package...`);
      const token = localStorage.getItem('cfms_token');
      const params = new URLSearchParams();
      params.append('batch', batch);
      if (session) params.append('session', session);

      const res = await fetch(`/api/hod/downloads/batch?${params.toString()}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Batch_${batch.replace(/\s+/g, '_')}${session ? '_' + session : ''}_CourseFiles.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast(`Batch ${batch}${sessLabel} course files ZIP downloaded successfully.`);
      } else {
        showToast('Failed to download batch ZIP.', 'error');
      }
    } catch {
      showToast('Error downloading batch package.', 'error');
    }
  };

  const handleDownloadSemesterZip = async (semester: string, batch?: string, session?: string) => {
    try {
      showToast(`Generating ${semester}${session ? ' ' + session : ''} ZIP package...`);
      const token = localStorage.getItem('cfms_token');
      const params = new URLSearchParams();
      params.append('semester', semester);
      if (batch) params.append('batch', batch);
      if (session) params.append('session', session);
      const res = await fetch(`/api/hod/downloads/semester?${params.toString()}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${semester.replace(/\s+/g, '_')}${session ? '_' + session : ''}_CourseFiles.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast(`${semester}${session ? ' ' + session : ''} files ZIP downloaded successfully.`);
      } else {
        showToast('Failed to download semester ZIP.', 'error');
      }
    } catch {
      showToast('Error downloading semester package.', 'error');
    }
  };

  const handleDownloadSingleFile = async (file: CourseFileItem) => {
    try {
      showToast(`Downloading course file for ${file.courseCode}...`);
      const token = localStorage.getItem('cfms_token');
      const res = await fetch(`/api/hod/downloads/course-file/${file.id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeTeacher = (file.teacherName || 'Faculty').replace(/[^a-zA-Z0-9]/g, '_');
        const safeCourse = (file.courseCode || 'Course').replace(/[^a-zA-Z0-9]/g, '_');
        a.download = `${safeTeacher}_${safeCourse}_CourseFile.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast(`${file.courseCode} course file downloaded successfully.`);
      } else {
        showToast('Failed to download course file.', 'error');
      }
    } catch {
      showToast('Error downloading course file.', 'error');
    }
  };

  const handleDownloadCertificatesZip = async (batch?: string, semester?: string) => {
    try {
      showToast('Generating Certificates ZIP package...');
      const token = localStorage.getItem('cfms_token');
      const params = new URLSearchParams();
      if (batch) params.append('batch', batch);
      if (semester) params.append('semester', semester);
      const res = await fetch(`/api/hod/downloads/certificates?${params.toString()}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificates_${batch || 'All'}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast('Approved certificates ZIP downloaded successfully.');
      } else {
        showToast('Failed to download certificates ZIP.', 'error');
      }
    } catch {
      showToast('Error downloading certificates package.', 'error');
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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleDownloadBatchZip(selectedBatch || '2023')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Download Complete Batch Package (ZIP)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download Batch ZIP</span>
          </button>

          {selectedSemester && (
            <button
              onClick={() => handleDownloadSemesterZip(selectedSemester, selectedBatch || undefined)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Download Current Semester Files (ZIP)"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Download {selectedSemester} ZIP</span>
            </button>
          )}

          <button
            onClick={() => handleDownloadCertificatesZip(selectedBatch || undefined, selectedSemester || undefined)}
            className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Download Approved Certificates (ZIP)"
          >
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            <span>Certificates ZIP</span>
          </button>

          <button
            onClick={() => { fetchHierarchy(); fetchFiles(); }}
            disabled={loadingFiles || loadingHierarchy}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(loadingFiles || loadingHierarchy) ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Breadcrumb Navigation (Exact Hierarchy: Course Files → Batch → Session → Semester) ─── */}
      <nav className="flex items-center gap-2 text-xs font-bold bg-white px-5 py-3 rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto text-slate-600">
        <button
          onClick={() => { setSelectedBatch(null); setSelectedSession(null); setSelectedSemester(null); setViewFile(null); }}
          className={`hover:text-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${!selectedBatch ? 'text-emerald-700 font-extrabold' : ''}`}
        >
          <Folder className="w-4 h-4 text-emerald-600" />
          <span>Course Files</span>
        </button>

        {selectedBatch && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => { setSelectedSession(null); setSelectedSemester(null); setViewFile(null); }}
              className={`hover:text-emerald-700 transition-colors cursor-pointer shrink-0 ${selectedBatch && !selectedSession ? 'text-emerald-700 font-extrabold' : 'text-slate-700'}`}
            >
              📁 {selectedBatch}
            </button>
          </>
        )}

        {selectedSession && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => { setSelectedSemester(null); setViewFile(null); }}
              className={`hover:text-emerald-700 transition-colors cursor-pointer shrink-0 ${selectedSession && !selectedSemester ? 'text-emerald-700 font-extrabold' : 'text-slate-700'}`}
            >
              📁 {selectedSession}
            </button>
          </>
        )}

        {selectedSemester && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 font-extrabold shrink-0">
              📁 {selectedSemester}
            </span>
          </>
        )}
      </nav>

      {/* ─── LEVEL 1: BATCH VIEW (Only batches with real department records) ─── */}
      {!selectedBatch ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-extrabold uppercase text-slate-500 tracking-wider text-2xs">
              Level 1 — Academic Batches ({hierarchy.length} Found)
            </span>
            <span className="text-2xs text-slate-400 font-medium">
              Authorized Campus: {currentUser?.campus || 'Attock Campus'} • Department: {currentUser?.departmentName || 'Computer Science'}
            </span>
          </div>

          {loadingHierarchy ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Loading Academic Batches...</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Retrieving approved course file folders from repository...
              </p>
            </div>
          ) : hierarchyError ? (
            <div className="bg-white rounded-3xl border border-rose-200 p-12 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">Unable to Load Batches</p>
              <p className="text-xs text-rose-600 max-w-sm mx-auto">{hierarchyError}</p>
              <button
                onClick={() => fetchHierarchy()}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : hierarchy.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Folder className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Batches Available</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No course files or assignments have been submitted yet under your department.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hierarchy.map((b) => (
                <div
                  key={b.batch}
                  onClick={() => setSelectedBatch(b.batch)}
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        <Folder className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 text-3xs font-extrabold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                        {b.totalFiles} File{b.totalFiles === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 font-heading group-hover:text-emerald-800 transition-colors">
                        📁 {b.batch}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {b.sessions?.length || 0} active session{(b.sessions?.length || 0) === 1 ? '' : 's'} ({b.sessions?.map(s => s.name || s.session).join(', ') || 'None'})
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-2xs text-slate-600 flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Department</span>
                      <span className="font-bold text-slate-800">{currentUser?.departmentName || 'Computer Science'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDownloadBatchZip(b.batch)}
                      title="Download Complete Batch"
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Download</span>
                    </button>

                    <button
                      onClick={() => setSelectedBatch(b.batch)}
                      className="flex-1 py-2 px-3.5 bg-[#1E7B4E] hover:bg-[#165534] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Open Batch</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : !selectedSession ? (
        /* ─── LEVEL 2: BATCH FOLDER (Spring / Fall Sessions) ─── */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelectedBatch(null); }}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Course Files
                </button>
                <span className="text-slate-300">•</span>
                <span className="text-3xs font-extrabold uppercase tracking-wider text-[#1E7B4E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Level 2 — Sessions
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 font-heading">
                📁 {selectedBatch}
              </h2>
              <p className="text-xs text-slate-500">
                Inside this batch, only sessions with real course file records appear below.
              </p>
            </div>

            <button
              onClick={() => handleDownloadBatchZip(selectedBatch)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs shrink-0"
              title="Download Complete Batch"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Batch</span>
            </button>
          </div>

          {(!activeBatchObj?.sessions || activeBatchObj.sessions.length === 0) ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Folder className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Sessions Available</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No course files have been submitted yet under Batch {selectedBatch}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeBatchObj.sessions.map((sess) => (
                <div
                  key={sess.name}
                  onClick={() => setSelectedSession(sess.session)}
                  className={`bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs transition-all flex flex-col justify-between space-y-4 group cursor-pointer ${
                    sess.name === 'Spring' ? 'hover:border-emerald-400 hover:shadow-md' : 'hover:border-indigo-400 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        sess.name === 'Spring'
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                      }`}>
                        <Calendar className="w-6 h-6" />
                      </div>
                      <span className={`px-2.5 py-1 text-3xs font-extrabold rounded-full border ${
                        sess.name === 'Spring'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      }`}>
                        {sess.fileCount} File{sess.fileCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 font-heading group-hover:text-emerald-800 transition-colors">
                        📁 {sess.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sess.semesters?.length || 0} active semester{(sess.semesters?.length || 0) === 1 ? '' : 's'} • {sess.approvedCount} approved
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDownloadBatchZip(selectedBatch, sess.session)}
                      title={`Download Complete ${sess.name}`}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Download</span>
                    </button>

                    <button
                      onClick={() => setSelectedSession(sess.session)}
                      className={`flex-1 py-2 px-3.5 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                        sess.name === 'Spring' ? 'bg-[#1E7B4E] hover:bg-[#165534]' : 'bg-indigo-700 hover:bg-indigo-800'
                      }`}
                    >
                      <span>Open {sess.name}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : !selectedSemester ? (
        /* ─── LEVEL 3: SPRING / FALL FOLDER (Semesters inside Session) ─── */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelectedSession(null); }}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back to {selectedBatch}
                </button>
                <span className="text-slate-300">•</span>
                <span className="text-3xs font-extrabold uppercase tracking-wider text-[#1E7B4E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Level 3 — Semesters
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 font-heading">
                📁 {selectedSession} — {selectedBatch}
              </h2>
              <p className="text-xs text-slate-500">
                Showing only semesters with course-file records for {selectedBatch} ({selectedSession}).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleDownloadBatchZip(selectedBatch, selectedSession)}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs shrink-0"
                title={`Download All ${selectedSession} Files for ${selectedBatch}`}
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download {selectedSession}</span>
              </button>
            </div>
          </div>

          {(!activeSessionObj?.semesters || activeSessionObj.semesters.length === 0) ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No Semesters Found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No {selectedSession} course files available for this batch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeSessionObj.semesters.map((sem) => (
                <div
                  key={sem.name}
                  onClick={() => setSelectedSemester(sem.name)}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        <FolderOpen className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-1 text-3xs font-extrabold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                        {sem.fileCount} File{sem.fileCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 font-heading group-hover:text-emerald-800 transition-colors">
                        📁 {sem.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sem.courseCount || sem.fileCount} course{(sem.courseCount || sem.fileCount) === 1 ? '' : 's'} • {sem.approvedCount} approved
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {sem.approvedCount > 0 && (
                        <span className="text-3xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {sem.approvedCount} Approved
                        </span>
                      )}
                      {sem.pendingCount > 0 && (
                        <span className="text-3xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {sem.pendingCount} Pending
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDownloadSemesterZip(sem.name, selectedBatch, selectedSession)}
                      title="Download Complete Semester"
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-600" />
                      <span>Download</span>
                    </button>

                    <button
                      onClick={() => setSelectedSemester(sem.name)}
                      className="flex-1 py-2 px-3 bg-[#1E7B4E] hover:bg-[#165534] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>Open</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ─── LEVEL 4: SEMESTER FOLDER (Course Files in Semester) ─── */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelectedSemester(null); }}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  ← Back to {selectedSession}
                </button>
                <span className="text-slate-300">•</span>
                <span className="text-3xs font-extrabold uppercase tracking-wider text-[#1E7B4E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Level 4 — Course Files
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 font-heading">
                {selectedSemester} ({selectedBatch} • {selectedSession})
              </h2>
              <p className="text-xs text-slate-500">
                All course files for {selectedBatch} → {selectedSession} → {selectedSemester}.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleDownloadSemesterZip(selectedSemester, selectedBatch, selectedSession)}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Download Complete Semester"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download Semester</span>
              </button>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

          {/* Courses & Course Files Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700">
                Course Files ({files.length})
              </span>
              <span className="text-2xs text-slate-400 font-medium">
                Scoped to {currentUser?.departmentName || 'Computer Science'}
              </span>
            </div>

            {loadingFiles ? (
              <div className="p-16 text-center text-xs text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
                <p className="font-bold text-slate-700">Loading course files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="p-16 text-center text-slate-500 space-y-2">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No course files are available for this semester.</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When assigned teachers submit course files for Batch {selectedBatch} ({selectedSemester}), they will automatically appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-2xs tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Course Name & Code</th>
                      <th className="px-6 py-3.5">Teacher Name</th>
                      <th className="px-6 py-3.5">Submission Date</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{file.courseTitle || file.title || 'Course'}</div>
                          <div className="text-2xs font-mono text-emerald-700 font-bold">{file.courseCode}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{file.teacherName}</div>
                          <div className="text-2xs text-slate-500">{file.teacherEmail || file.teacherRole}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {file.submittedAt ? new Date(file.submittedAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : (file.uploadDate || 'Draft')}
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
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => setViewFile(file)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
                              title="View & Review Course File"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span>View</span>
                            </button>

                            <button
                              onClick={() => handleDownloadSingleFile(file)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title="Download Individual Approved Course File"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Download</span>
                            </button>

                            {file.status === 'Approved' && (
                              <button
                                onClick={() => setShowCertificateFile(file)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                                title="View Certificate"
                              >
                                <Award className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Certificate</span>
                              </button>
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
        </div>
      )}



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
                      <span>Official 14-Item Statutory Course File Verification Sheet</span>
                    </h5>
                    <span className="text-3xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {(reviewItems.length > 0 ? reviewItems : viewFile.templateData?.checklist || []).filter((i: any) => i.status === 'Verified' || i.verified === 'Yes' || i.verified === 'N/A' || i.status === 'N/A').length} / {(reviewItems.length > 0 ? reviewItems : viewFile.templateData?.checklist || []).length || 14} Verified/Compliant
                    </span>
                  </div>

                  <div className="border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/90 border-b border-slate-300 text-slate-700 font-extrabold uppercase text-3xs tracking-wider">
                          <th className="py-2.5 px-3 w-10 text-center border-r border-slate-300">Sr.</th>
                          <th className="py-2.5 px-3 w-1/3 border-r border-slate-300">Document / Section</th>
                          <th className="py-2.5 px-2 w-24 text-center border-r border-slate-300">Uploaded</th>
                          <th className="py-2.5 px-3 w-52 text-center border-r border-slate-300">Review Decision</th>
                          <th className="py-2.5 px-3">Mandatory HOD Comment & Review Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-2xs">
                        {(reviewItems.length > 0 ? reviewItems : viewFile.templateData?.checklist || []).map((item: any) => {
                          const isNeedsImp = item.status === 'Needs Improvement' || item.verified === 'No';
                          const isVer = item.status === 'Verified' || item.verified === 'Yes';
                          const isNA = item.status === 'N/A' || item.verified === 'N/A' || item.isNA;
                          const isEditable = viewFile.status === 'Submitted' || viewFile.status === 'Under Review' || viewFile.status === 'Needs Improvement';
                          const isConditional = [9, 10, 11].includes(item.srNo) || item.isApplicableOnly;
                          const hasFile = !!item.fileName || !!item.file || item.uploaded || item.isUploaded || item.verified === 'Yes';

                          return (
                            <tr
                              key={item.srNo}
                              className={`transition-colors ${
                                isNeedsImp ? 'bg-rose-50/70' : isVer ? 'hover:bg-emerald-50/20' : isNA ? 'bg-slate-50/50' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-700 text-center border-r border-slate-300 align-top pt-3">
                                {item.srNo}.
                              </td>

                              <td className="py-2.5 px-3 border-r border-slate-300 align-top">
                                <span className="font-extrabold text-slate-900 block text-xs">
                                  {item.content || item.name}
                                </span>
                                {item.fileName ? (
                                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                    <span className="text-3xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                      <span>📄</span>
                                      <span className="truncate max-w-[140px]">{item.fileName}</span>
                                      <span>({item.fileSize || 'PDF'})</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (item.fileUrl) {
                                          window.open(item.fileUrl, '_blank');
                                        } else {
                                          const sampleText = `%PDF-1.4\nOfficial University of Education Course File Document\nSr No. ${item.srNo}: ${item.content || item.name}\nFile: ${item.fileName}\nCourse: ${viewFile.courseCode} - ${viewFile.courseTitle}\nFaculty: ${viewFile.teacherName}\nStatus: ${item.status || 'Verified'}\nComment: ${item.comment || 'Verified and compliant'}`;
                                          const blob = new Blob([sampleText], { type: 'application/pdf' });
                                          const url = URL.createObjectURL(blob);
                                          window.open(url, '_blank');
                                        }
                                      }}
                                      className="px-2 py-0.5 rounded text-3xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                                      title="Preview uploaded PDF"
                                    >
                                      <Eye className="w-3 h-3 text-emerald-700" />
                                      <span>View PDF</span>
                                    </button>
                                  </div>
                                ) : isNA ? (
                                  <span className="text-3xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 mt-1 inline-block font-semibold">
                                    Not Applicable (Theory Course)
                                  </span>
                                ) : (
                                  <span className="text-3xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                                    No document attached
                                  </span>
                                )}
                              </td>

                              {/* Uploaded Indicator (Requirement 6, 23) */}
                              <td className="py-2.5 px-2 text-center border-r border-slate-300 align-top pt-3">
                                {isNA ? (
                                  <span className="text-slate-400 font-semibold text-3xs">N/A</span>
                                ) : hasFile ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-3xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    <Check className="w-3 h-3 stroke-[3] text-emerald-700" />
                                    <span>Yes</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                    No
                                  </span>
                                )}
                              </td>

                              {/* Review Decision (Requirement 9, 23) */}
                              <td className="py-2.5 px-3 border-r border-slate-300 align-top text-center">
                                {isEditable ? (
                                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 gap-1 flex-wrap justify-center">
                                    <button
                                      type="button"
                                      onClick={() => updateItemStatus(item.srNo, 'Verified')}
                                      className={`px-2 py-1 rounded-md font-bold text-3xs flex items-center gap-1 transition-all cursor-pointer ${
                                        isVer && !isNeedsImp && !isNA
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'text-slate-600 hover:text-emerald-700 hover:bg-white'
                                      }`}
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Verified (Yes)</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateItemStatus(item.srNo, 'Needs Improvement')}
                                      className={`px-2 py-1 rounded-md font-bold text-3xs flex items-center gap-1 transition-all cursor-pointer ${
                                        isNeedsImp
                                          ? 'bg-rose-600 text-white shadow-xs'
                                          : 'text-slate-600 hover:text-rose-700 hover:bg-white'
                                      }`}
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      <span>Needs Imp. (No)</span>
                                    </button>
                                    {isConditional && (
                                      <button
                                        type="button"
                                        onClick={() => updateItemNA(item.srNo)}
                                        className={`px-1.5 py-1 rounded-md font-bold text-3xs flex items-center gap-0.5 transition-all cursor-pointer ${
                                          isNA
                                            ? 'bg-slate-700 text-white shadow-xs'
                                            : 'text-slate-500 hover:text-slate-700 hover:bg-white'
                                        }`}
                                      >
                                        <span>N/A</span>
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded font-extrabold text-3xs border ${
                                      isNeedsImp
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : isNA
                                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}
                                  >
                                    {isNeedsImp ? 'Needs Improvement (No)' : isNA ? 'N/A' : 'Verified (Yes)'}
                                  </span>
                                )}
                              </td>

                              {/* Mandatory Individual Comment & Save Review Button (Requirements 7, 10, 23, 24) */}
                              <td className="py-2.5 px-3 align-top space-y-2">
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
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
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
                                      </div>

                                      <button
                                        type="button"
                                        disabled={savingItemSr === item.srNo}
                                        onClick={() => handleSaveItemReview(item)}
                                        className={`px-3 py-1 rounded-lg text-2xs font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                                          isNeedsImp
                                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                            : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                                        }`}
                                        title="Save this item review and comment to database"
                                      >
                                        {savingItemSr === item.srNo ? (
                                          <RefreshCw className="w-3 h-3 animate-spin" />
                                        ) : (
                                          <Check className="w-3 h-3" />
                                        )}
                                        <span>Save Review</span>
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

              {(viewFile.status === 'Submitted' || viewFile.status === 'Under Review') && (() => {
                const currentChecklist = reviewItems.length > 0 ? reviewItems : (viewFile.templateData?.checklist || []);
                const hasNeedsImp = currentChecklist.some((item: any) => item.status === 'Needs Improvement');
                const allRequiredApproved = currentChecklist.length > 0 && currentChecklist.every((item: any) => {
                  if (item.isApplicableOnly || item.isConditional || [9, 10, 11].includes(item.srNo)) {
                    if (item.verified === 'N/A' || item.status === 'N/A' || item.isNA) return true;
                  }
                  return item.verified === 'Yes' || item.status === 'Verified';
                });
                const isSelfCourse = viewFile.teacherId === currentUser?.id ||
                  (!!currentUser?.email && !!viewFile.teacherEmail && viewFile.teacherEmail.toLowerCase() === currentUser.email.toLowerCase());
                const isSuperAdmin = currentUser?.role === 'ADMIN';
                const canApprove = !hasNeedsImp && allRequiredApproved && (!isSelfCourse || isSuperAdmin);

                return (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
                    {isSelfCourse && !isSuperAdmin && (
                      <div className="px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl text-2xs text-amber-900 font-medium flex items-center gap-1.5 flex-1">
                        <span>⚠️</span>
                        <span><strong>Self-Approval Restricted:</strong> You are the instructor for this course. Per academic policy, an HOD cannot self-approve their own file; approval is delegated to Dean / Admin.</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 justify-end ml-auto">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleSaveAllReviews}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
                        title="Save all item reviews and comments to database"
                      >
                        <Check className="w-3.5 h-3.5 text-slate-700" />
                        <span>Save All Reviews</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReturnModalFile(viewFile);
                          setReturnComment('');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs cursor-pointer transition-all"
                      >
                        Return for Revision
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (isSelfCourse && !isSuperAdmin) {
                            showToast('Self-approval restricted: HOD cannot approve their own course file.', 'error');
                            return;
                          }
                          if (!canApprove) {
                            if (hasNeedsImp) {
                              showToast('Cannot approve: One or more documents are marked as "Needs Improvement". Please return for revision or verify them.', 'error');
                            } else {
                              showToast('Cannot approve: All required documents must be Verified (Yes) before final approval.', 'error');
                            }
                            return;
                          }
                          setApproveConfirmId(viewFile.id);
                        }}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md ${
                          canApprove
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-950/20'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                        }`}
                        title={isSelfCourse && !isSuperAdmin ? 'Self-approval is prohibited' : canApprove ? 'Approve Course File' : 'All required items must be verified (Yes) before approval'}
                      >
                        Approve Course File
                      </button>
                    </div>
                  </div>
                );
              })()}
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
