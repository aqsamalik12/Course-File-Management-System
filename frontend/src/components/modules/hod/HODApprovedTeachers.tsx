import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Users,
  Search,
  Eye,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  X,
  Mail,
  Phone,
  Building2,
  Landmark,
  GraduationCap,
  BookOpen
} from 'lucide-react';

export const HODApprovedTeachers: React.FC = () => {
  const { currentUser } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

  const fetchTeachers = async () => {
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
        setError(data.message || 'Unable to load approved teachers.');
      }
    } catch {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [currentUser]);

  const filteredTeachers = teachers.filter((t) => {
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
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Active Department Faculty</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Approved Teachers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered and verified teachers under your assigned Campus & Department
          </p>
        </div>

        <button
          onClick={fetchTeachers}
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
            placeholder="Search approved teachers..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900 placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <span className="text-xs font-bold text-slate-500">
          Total: <strong className="text-slate-900">{filteredTeachers.length}</strong> Faculty
        </span>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
            <p className="font-bold text-slate-700">Loading approved teachers...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center text-xs text-rose-700 space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="font-bold">{error}</p>
            <button
              onClick={fetchTeachers}
              className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No approved teachers found.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Once you review and approve pending teacher registration requests, authorized teachers will appear in this directory.
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
                  <th className="px-6 py-3.5">Teacher Type</th>
                  <th className="px-6 py-3.5">Registration Status</th>
                  <th className="px-6 py-3.5">Approved Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {teacher.email}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {teacher.campus}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {teacher.department}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700">
                        {teacher.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Registered / Approved
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {teacher.approvedDate ? new Date(teacher.approvedDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedTeacher(teacher)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 hover:text-emerald-700 text-slate-700 font-bold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── View Profile Modal ─── */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-fade-in border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-heading">
                  Approved Teacher Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Faculty profile details under your department scope
                </p>
              </div>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Teacher Name</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedTeacher.name}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Email</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedTeacher.email}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Faculty Type</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedTeacher.teacherType === 'REGULAR_TEACHER' ? 'Regular Faculty' : 'Visiting Faculty'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Phone / Contact</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedTeacher.phone || 'N/A'}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Campus</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedTeacher.campus}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Department</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedTeacher.department}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Approved By</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedTeacher.approvedBy || currentUser?.name}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Approved Date</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedTeacher.approvedDate ? new Date(selectedTeacher.approvedDate).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Verified'}
                </p>
              </div>
            </div>

            {/* Courses summary */}
            {Array.isArray(selectedTeacher.courses) && selectedTeacher.courses.length > 0 && (
              <div className="space-y-2 text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-2xs">
                  Assigned Teaching Courses
                </span>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {selectedTeacher.courses.map((c: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <span className="font-bold text-slate-900">{c.courseCode || c.code} — {c.courseName || c.title}</span>
                        <div className="text-2xs text-slate-500">{c.section || 'Section A'}</div>
                      </div>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {c.credits || c.creditHours || 3} Credits
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedTeacher(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
