import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Clock,
  CheckCircle,
  Users,
  ArrowRight,
  Eye,
  AlertCircle,
  RefreshCw,
  Building2,
  Landmark,
  GraduationCap,
  Folder,
  FileText,
  Layers,
  Calendar,
  BookOpen
} from 'lucide-react';

interface HODDashboardProps {
  onNavigate: (moduleName: string, state?: any) => void;
}

interface SemesterSummary {
  name: string;
  fileCount: number;
  pendingCount: number;
}

interface BatchOverview {
  batch: string;
  session: string;
  semesters: SemesterSummary[];
}

interface DashboardData {
  hod: {
    id: string;
    name: string;
    email: string;
    campusId: string;
    campusName: string;
    departmentId: string;
    departmentName: string;
    role: string;
  };
  stats: {
    pendingRequests: number;
    registeredTeachers: number;
    pendingCourseFiles: number;
    approvedCourseFiles: number;
    returnedCourseFiles?: number;
    totalCourseFiles?: number;
  };
  batchesOverview: BatchOverview[];
  recentCourseFiles: any[];
  recentRequests: any[];
}

export const HODDashboard: React.FC<HODDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatchIdx, setSelectedBatchIdx] = useState(0);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('cfms_token');
      const res = await fetch('/api/hod/dashboard', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setData(resData);
      } else {
        setError(resData.message || 'Unable to load HOD dashboard data.');
      }
    } catch (err: any) {
      setError('Unable to connect to the server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [currentUser]);

  const hodName = data?.hod?.name || currentUser?.name || 'Head of Department';
  const departmentName = data?.hod?.departmentName || currentUser?.departmentName || 'Department';
  const campusName = data?.hod?.campusName || currentUser?.campus || currentUser?.campusName || 'Attock Campus';

  const batches = data?.batchesOverview || [];
  const currentBatch = batches[selectedBatchIdx] || batches[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Header: HOD & Scope Identification ─── */}
      <div className="bg-white rounded-2xl border border-emerald-100/80 shadow-xs p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold tracking-wide">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>HOD Course File Workspace</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 font-heading tracking-tight">
            {hodName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              HOD — {departmentName}
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
              <Landmark className="w-3.5 h-3.5 text-slate-500" />
              {campusName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigate('Course Files')}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950/20"
          >
            <span>Manage Course Files</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <div className="flex-1 font-medium">{error}</div>
          <button
            onClick={fetchDashboard}
            className="font-bold underline text-rose-900 hover:text-rose-700 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && !data && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-16 text-center text-xs text-slate-500 shadow-xs">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
          <p className="font-bold text-slate-700 text-sm">Loading dashboard data from real database records...</p>
        </div>
      )}

      {/* ─── Real Database Metrics Cards (Requirements 29 & 30) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Pending Teacher Requests */}
        <div
          onClick={() => onNavigate('Teacher Requests')}
          className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Pending Requests
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-amber-200/60">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-heading">
              {loading ? '-' : data?.stats?.pendingRequests ?? 0}
            </span>
            <span className="text-2xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Teacher Signups
            </span>
          </div>
          <p className="text-2xs text-slate-500 mt-2">
            Awaiting registration review
          </p>
        </div>

        {/* 2. Pending Course Files */}
        <div
          onClick={() => onNavigate('Pending Course Files')}
          className="bg-white rounded-2xl border border-sky-200/80 p-5 shadow-xs hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Pending Course Files
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-sky-200/60">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-heading">
              {loading ? '-' : data?.stats?.pendingCourseFiles ?? 0}
            </span>
            <span className="text-2xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
              Needs Evaluation
            </span>
          </div>
          <p className="text-2xs text-slate-500 mt-2">
            Submitted by approved teachers
          </p>
        </div>

        {/* 3. Approved Course Files */}
        <div
          onClick={() => onNavigate('Approved Course Files')}
          className="bg-white rounded-2xl border border-emerald-200/80 p-5 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Approved Course Files
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform border border-emerald-200/60">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-heading">
              {loading ? '-' : data?.stats?.approvedCourseFiles ?? 0}
            </span>
            <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Archived & Approved
            </span>
          </div>
          <p className="text-2xs text-slate-500 mt-2">
            Successfully vetted course files
          </p>
        </div>

        {/* 4. Registered Teachers */}
        <div
          onClick={() => onNavigate('Approved Teachers')}
          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Registered Teachers
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform border border-slate-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900 font-heading">
              {loading ? '-' : data?.stats?.registeredTeachers ?? 0}
            </span>
            <span className="text-2xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              Active Faculty
            </span>
          </div>
          <p className="text-2xs text-slate-500 mt-2">
            Approved teachers in {departmentName}
          </p>
        </div>
      </div>

      {/* ─── Course File Overview: Batch / Session / 4 Semesters Structure (Requirements 30 & 31) ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-extrabold text-slate-900 font-heading">
                Course File Overview
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated hierarchical semester containers populated from real teacher submissions.
            </p>
          </div>

          {/* Batch Selector Tabs */}
          {batches.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              {batches.map((b, idx) => (
                <button
                  key={b.batch}
                  onClick={() => setSelectedBatchIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedBatchIdx === idx
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Batch {b.batch} ({b.session})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4 Standard Semester Cards for Selected Batch & Session */}
        {currentBatch ? (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Batch {currentBatch.batch} • Session {currentBatch.session}</span>
              </span>
              <button
                onClick={() => onNavigate('Course Files')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Folder Hierarchy</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentBatch.semesters.map((sem) => (
                <div
                  key={sem.name}
                  onClick={() => onNavigate('Course Files')}
                  className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-5 hover:bg-emerald-50/30 hover:border-emerald-300 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-emerald-700 flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-2xs">
                      <Folder className="w-4 h-4" />
                    </div>
                    {sem.pendingCount > 0 && (
                      <span className="text-2xs font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {sem.pendingCount} Pending
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 mt-4 group-hover:text-emerald-800 transition-colors">
                    {sem.name}
                  </h3>

                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-black text-slate-800">
                      {sem.fileCount} <span className="text-xs font-medium text-slate-500">Course Files</span>
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-2xs font-bold text-emerald-700 group-hover:text-emerald-800">
                    <span>View Files</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No batch overview data available.
          </div>
        )}
      </div>

      {/* ─── Recent Course Files Preview Table (Requirements 30 & 54) ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 font-heading">
              Recent Course Files
            </h2>
            <p className="text-xs text-slate-500">
              Latest submissions from teachers in your department
            </p>
          </div>
          <button
            onClick={() => onNavigate('Course Files')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>All Course Files</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            <span>Loading course files...</span>
          </div>
        ) : !data?.recentCourseFiles || data.recentCourseFiles.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No course files found.</p>
            <p className="text-xs text-slate-400">
              When approved teachers submit course files for your department, they will be listed here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-bold text-2xs tracking-wider">
                <tr>
                  <th className="px-6 py-3">Course</th>
                  <th className="px-6 py-3">Teacher</th>
                  <th className="px-6 py-3">Batch & Semester</th>
                  <th className="px-6 py-3">Credits</th>
                  <th className="px-6 py-3">Submitted Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentCourseFiles.map((file: any) => (
                  <tr key={file.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900">{file.courseTitle || file.courseName}</div>
                      <div className="text-2xs text-emerald-800 font-extrabold">{file.courseCode}</div>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-700">
                      {file.teacherName}
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      <div>Batch {file.batch || '2024'}</div>
                      <div className="text-2xs text-slate-400">{file.semester || '1st Semester'}</div>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-700">
                      {file.credits || 3} CH
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {file.submittedAt
                        ? new Date(file.submittedAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
                        : 'Recent'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-extrabold border ${
                          file.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : file.status === 'Returned' || file.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {file.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => onNavigate('Course Files')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 hover:text-emerald-700 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Recent Teacher Requests Preview ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 font-heading">
              Recent Teacher Requests
            </h2>
            <p className="text-xs text-slate-500">
              Latest registration submissions routed to your department
            </p>
          </div>
          <button
            onClick={() => onNavigate('Teacher Requests')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
            <span>Loading teacher requests...</span>
          </div>
        ) : !data?.recentRequests || data.recentRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Clock className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No teacher requests found.</p>
            <p className="text-xs text-slate-400">
              When teachers select your department and submit their registration, requests will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-bold text-2xs tracking-wider">
                <tr>
                  <th className="px-6 py-3">Teacher</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Credit Hours</th>
                  <th className="px-6 py-3">Submitted Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentRequests.map((req: any) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900">{req.teacherName}</div>
                      <div className="text-2xs text-slate-500">{req.teacherEmail}</div>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-700">
                      {req.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-emerald-800">
                      {req.totalCredits || 0} Credits
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-extrabold border ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {req.status === 'PendingHODApproval' ? 'Pending Approval' : req.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => onNavigate('Teacher Requests')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 hover:text-emerald-700 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
