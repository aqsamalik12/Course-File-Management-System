import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  Building2,
  Landmark,
  GraduationCap,
  BookOpen,
  RefreshCw,
  AlertCircle,
  X,
  FileText
} from 'lucide-react';

export const HODTeacherProfiles: React.FC = () => {
  const { currentUser } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProfile, setActiveProfile] = useState<any | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('cfms_token');
      const res = await fetch('/api/hod/teachers', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTeachers(data.data || []);
      } else {
        setError(data.message || 'Unable to load teacher profiles.');
      }
    } catch {
      setError('Unable to load teacher profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [currentUser]);

  const viewFullProfile = async (id: string) => {
    try {
      const token = localStorage.getItem('cfms_token');
      const res = await fetch(`/api/hod/teachers/${id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveProfile(data.data);
      }
    } catch {}
  };

  const filtered = teachers.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.name && t.name.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      (t.teacherType && t.teacherType.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Header ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5 border border-emerald-200/70">
            <Users className="w-3.5 h-3.5" />
            <span>Faculty Directory</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Teacher Profiles
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View detailed faculty profiles and academic credentials within your department
          </p>
        </div>

        <button
          onClick={fetchProfiles}
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
            placeholder="Search teacher profiles..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ─── Grid of Teacher Cards ─── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-xs text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
          <p className="font-bold text-slate-700">Loading teacher profiles...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-16 text-center text-xs text-rose-700 space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="font-bold">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No teacher profiles found.</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No approved faculty members match your query under your assigned department.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-black text-lg">
                    {t.name?.charAt(0) || 'T'}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-heading">
                    {t.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.email}</span>
                  </p>
                  {t.phone && (
                    <p className="text-2xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-300" />
                      <span>{t.phone}</span>
                    </p>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs text-slate-400 font-bold uppercase">Campus</span>
                    <span className="font-semibold text-slate-800">{t.campus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xs text-slate-400 font-bold uppercase">Department</span>
                    <span className="font-semibold text-slate-800">{t.department}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xs text-slate-400 font-bold uppercase">Credits</span>
                    <span className="font-bold text-emerald-800">{t.totalCredits || 0} Credit Hours</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => viewFullProfile(t.id)}
                className="w-full py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 hover:border-emerald-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Profile</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ─── Detailed Profile Modal ─── */}
      {activeProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-fade-in border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-heading">
                  Faculty Member Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Complete official credentials and course assignments
                </p>
              </div>
              <button
                onClick={() => setActiveProfile(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Teacher Name</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{activeProfile.name}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Email</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{activeProfile.email}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Designation</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{activeProfile.designation}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Phone</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{activeProfile.phone || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Campus</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{activeProfile.campus}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Department</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{activeProfile.department}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Assigned HOD</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{activeProfile.approvedBy || currentUser?.name}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Registration Status</span>
                <div className="mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active & Approved
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Courses */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-2xs">
                  Assigned Courses & Credit Allotment
                </span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {activeProfile.totalCredits || 0} Total Credits
                </span>
              </div>

              {Array.isArray(activeProfile.courses) && activeProfile.courses.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {activeProfile.courses.map((c: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <span className="font-bold text-slate-900">{c.courseCode || c.code} — {c.courseName || c.title}</span>
                        <div className="text-2xs text-slate-500">{c.section || 'Section A'}</div>
                      </div>
                      <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {c.credits || c.creditHours || 3} Credits
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No courses recorded.</p>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveProfile(null)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
