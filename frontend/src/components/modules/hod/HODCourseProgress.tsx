import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  Layers
} from 'lucide-react';

export const HODCourseProgress: React.FC = () => {
  const { currentUser } = useAuth();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('cfms_token');
      const res = await fetch('/api/hod/course-progress', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProgressData(data.data || []);
      } else {
        setError(data.message || 'Unable to load course progress.');
      }
    } catch {
      setError('Unable to load course progress.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [currentUser]);

  const filtered = progressData.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.teacherName && item.teacherName.toLowerCase().includes(q)) ||
      (item.courseName && item.courseName.toLowerCase().includes(q)) ||
      (item.courseCode && item.courseCode.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Header ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5 border border-emerald-200/70">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Workflow Monitoring</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Course / Teacher Progress
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor course file compilation and submission progress for approved teachers in your department
          </p>
        </div>

        <button
          onClick={fetchProgress}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ─── Search ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course code, title, or teacher..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
            <p className="font-bold text-slate-700">Loading course progress...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center text-xs text-rose-700 space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="font-bold">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No course progress available.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Once teachers with approved courses begin uploading course file components, their progress records will display here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-2xs tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Course Code & Title</th>
                  <th className="px-6 py-3.5">Assigned Teacher</th>
                  <th className="px-6 py-3.5">Credits</th>
                  <th className="px-6 py-3.5">Components Submitted</th>
                  <th className="px-6 py-3.5">Progress</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div>{item.courseCode} — {item.courseName}</div>
                      <div className="text-2xs font-semibold text-slate-400">{item.section}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.teacherName}</div>
                      <div className="text-2xs text-slate-500">{item.teacherEmail}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-800">
                      {item.credits} Credits
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {item.submittedFiles} of {item.totalExpected} files
                    </td>
                    <td className="px-6 py-4 w-48">
                      <div className="space-y-1">
                        <div className="flex justify-between text-2xs font-bold text-slate-600">
                          <span>{item.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(item.progressPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-extrabold border ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.status}
                      </span>
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
