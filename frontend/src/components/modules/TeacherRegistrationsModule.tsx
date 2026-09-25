import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LoginLog } from '../../types';
import {
  Users, CheckCircle2, Clock, Building2, Calendar, ChevronDown,
  ChevronUp, Search, Filter, Download, Mail, Phone,
  GraduationCap, ClipboardList, AlertTriangle, UserCheck,
  LogIn, BookMarked, Activity, FileText, ShieldCheck
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-PK', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  } catch { return iso; }
};

const StatusBadge: React.FC<{ submitted?: boolean }> = ({ submitted }) =>
  submitted ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
      <CheckCircle2 className="w-3 h-3" /> Form Submitted
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
      <Clock className="w-3 h-3" /> Pending Form
    </span>
  );

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const map: Record<string, string> = {
    REGULAR_TEACHER: 'bg-blue-100 text-blue-800 border-blue-200',
    VISITING_TEACHER: 'bg-purple-100 text-purple-800 border-purple-200',
  };
  const labels: Record<string, string> = {
    REGULAR_TEACHER: 'Regular Teacher',
    VISITING_TEACHER: 'Visiting Teacher',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${map[role] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {labels[role] || role}
    </span>
  );
};

// ─── Row helper ───────────────────────────────────────────────────────────────
const Row: React.FC<{ label: string; value?: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex justify-between items-start gap-2">
    <span className="text-slate-500 font-medium shrink-0">{label}:</span>
    <span className={`font-bold text-right ${highlight ? 'text-emerald-700' : 'text-slate-800'}`}>{value || '—'}</span>
  </div>
);

// ─── Form detail expand ───────────────────────────────────────────────────────
const ExpandedFormRow: React.FC<{ user: User }> = ({ user }) => {
  const fd = user.profileFormData;
  if (!fd) {
    return (
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 text-sm text-amber-700 font-medium flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <span>This teacher has not yet submitted their profile form.</span>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Personal */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Personal Info</p>
        <div className="space-y-2 text-xs">
          <Row label="CNIC" value={fd.cnic} />
          <Row label="Date of Birth" value={fd.dob} />
          <Row label="Gender" value={fd.gender} />
          <Row label="Phone" value={fd.phone} />
          {fd.personalEmail && <Row label="Personal Email" value={fd.personalEmail} />}
          {fd.bloodGroup && <Row label="Blood Group" value={fd.bloodGroup} />}
          {fd.emergencyContact && <Row label="Emergency Contact" value={fd.emergencyContact} />}
          {fd.city && <Row label="City" value={fd.city} />}
          {fd.residentialAddress && <Row label="Address" value={fd.residentialAddress} />}
        </div>
      </div>
      {/* Academic */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Academic & Employment</p>
        <div className="space-y-2 text-xs">
          <Row label="Qualification" value={fd.highestQualification} />
          <Row label="Specialization" value={fd.specialization} />
          <Row label="Employment Type" value={fd.employmentType} />
          <Row label="Joining Date" value={fd.joiningDate} />
        </div>
      </div>
      {/* Course */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Course Info</p>
        <div className="space-y-2 text-xs">
          <Row label="Course Name" value={fd.courseName} highlight />
          <Row label="Course Code" value={fd.courseCode} highlight />
          <Row label="Credit Hours" value={fd.creditHours ? `${fd.creditHours} hrs` : undefined} />
        </div>
      </div>
      {/* Session */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Session & Assignment</p>
        <div className="space-y-2 text-xs">
          <Row label="Academic Session" value={fd.academicSession} highlight />
          <Row label="Student Batch" value={fd.batch} highlight />
          <Row label="Department" value={fd.departmentName.replace('Department of ', '')} />
          <Row label="Form Submitted" value={fmtDate(fd.submittedAt)} />
        </div>
      </div>
    </div>
  );
};

// ─── Main Module ─────────────────────────────────────────────────────────────
export const TeacherRegistrationsModule: React.FC = () => {
  const { users, loginLogs } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'forms'>('login');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'' | 'submitted' | 'pending'>('');

  // All teachers
  const allTeachers = useMemo(() =>
    users.filter((u) => u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER'),
    [users]
  );

  // KPI counts
  const submittedCount = allTeachers.filter((u) => u.profileFormSubmitted).length;
  const pendingCount = allTeachers.length - submittedCount;
  const totalLogins = loginLogs.length;
  const formFilledAfterLogin = loginLogs.filter((l) => !!l.formFilledAt).length;

  // Filter teachers for forms tab
  const filteredTeachers = useMemo(() => {
    return allTeachers.filter((u) => {
      const q = search.toLowerCase();
      const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchStatus = !filterStatus || (filterStatus === 'submitted' ? !!u.profileFormSubmitted : !u.profileFormSubmitted);
      return matchSearch && matchStatus;
    });
  }, [allTeachers, search, filterStatus]);

  // Filter login logs
  const filteredLogs = useMemo(() => {
    if (!search) return loginLogs;
    const q = search.toLowerCase();
    return loginLogs.filter((l) =>
      l.userName.toLowerCase().includes(q) || l.userEmail.toLowerCase().includes(q)
    );
  }, [loginLogs, search]);

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#0c4727] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold font-heading">Teacher Activity</h1>
            <p className="text-xs text-emerald-200">Login logs & profile form submissions from all teachers</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Teachers', value: allTeachers.length, icon: Users, color: 'text-slate-700', bg: 'bg-slate-100' },
          { label: 'Total Logins', value: totalLogins, icon: LogIn, color: 'text-blue-700', bg: 'bg-blue-100' },
          { label: 'Form Submitted', value: submittedCount, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-100' },
          { label: 'Form Pending', value: pendingCount, icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-100' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-xs">
            <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center shrink-0`}>
              <k.icon className={`w-5 h-5 ${k.color}`} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900 font-heading">{k.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => { setActiveTab('login'); setExpandedId(null); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'login' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4" /> Login Activity
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === 'login' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
            {loginLogs.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveTab('forms'); setExpandedId(null); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'forms' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" /> Form Submissions
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${activeTab === 'forms' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
            {submittedCount}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-400 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full text-xs border-none outline-none bg-transparent text-slate-700 placeholder-slate-400"
            />
          </div>
          {activeTab === 'forms' && (
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white cursor-pointer">
              <option value="">All Status</option>
              <option value="submitted">Form Submitted</option>
              <option value="pending">Form Pending</option>
            </select>
          )}
        </div>
      </div>

      {/* ── LOGIN ACTIVITY TAB ── */}
      {activeTab === 'login' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-600">{filteredLogs.length} Login Event{filteredLogs.length !== 1 ? 's' : ''}</p>
            <span className="text-[10px] text-slate-400 font-medium">Most recent first</span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <LogIn className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-500">No login activity yet</p>
              <p className="text-xs text-slate-400">Login events will appear here when teachers sign in.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-12 gap-3 px-5 py-4 hover:bg-slate-50 transition-colors items-center">
                  {/* Avatar + Name */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 border-2 border-emerald-200">
                      <span className="text-emerald-700 font-bold text-sm">{log.userName.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{log.userName}</p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{log.userEmail}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="col-span-2 hidden sm:flex">
                    <RoleBadge role={log.userRole} />
                  </div>

                  {/* Login Time */}
                  <div className="col-span-3 text-xs text-slate-600 hidden md:block">
                    <div className="flex items-center gap-1.5 font-medium">
                      <LogIn className="w-3 h-3 text-blue-500" />
                      <span>{fmtDate(log.loginAt)}</span>
                    </div>
                  </div>

                  {/* Form Status */}
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    {log.formFilledAt ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" /> Form Filled
                        </span>
                        <span className="text-[9px] text-slate-400">{fmtDate(log.formFilledAt)}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full border border-slate-200">
                        <Clock className="w-3 h-3" /> Not Filled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── FORM SUBMISSIONS TAB ── */}
      {activeTab === 'forms' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-600">{filteredTeachers.length} Teacher{filteredTeachers.length !== 1 ? 's' : ''} found</p>
            {(search || filterStatus) && (
              <button onClick={() => { setSearch(''); setFilterStatus(''); }}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer">
                Clear Filters
              </button>
            )}
          </div>

          {filteredTeachers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-500">No teachers found</p>
              <p className="text-xs text-slate-400">Adjust your filters or wait for teachers to submit their form.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTeachers.map((user) => (
                <div key={user.id}>
                  {/* Row */}
                  <div
                    className="grid grid-cols-12 gap-3 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer items-center"
                    onClick={() => toggle(user.id)}
                  >
                    {/* Avatar + Name */}
                    <div className="col-span-4 flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1E7B4E&color=fff`;
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="col-span-2 hidden sm:flex">
                      <RoleBadge role={user.role} />
                    </div>

                    {/* Course Info if submitted */}
                    <div className="col-span-3 hidden md:block text-xs">
                      {user.profileFormData ? (
                        <div className="space-y-0.5">
                          <p className="font-bold text-indigo-700 truncate">{user.profileFormData.courseCode} — {user.profileFormData.courseName}</p>
                          <p className="text-slate-500 font-medium">{user.profileFormData.academicSession} · Batch {user.profileFormData.batch}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px]">—</span>
                      )}
                    </div>

                    {/* Status Badge + Login + Expand */}
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <div className="text-right hidden lg:block mr-2">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium justify-end">
                          <LogIn className="w-3 h-3" />
                          <span>{user.lastLogin === 'Never' ? 'Not yet' : user.lastLogin}</span>
                        </div>
                        <div className="text-[9px] text-slate-400">Logins: {user.loginCount || 0}</div>
                      </div>
                      <StatusBadge submitted={user.profileFormSubmitted} />
                      {expandedId === user.id
                        ? <ChevronUp className="w-4 h-4 text-slate-400" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expandedId === user.id && (
                    <div className="px-5 pb-5 bg-slate-50 border-t border-slate-100">
                      <div className="pt-4 space-y-3">
                        {/* User metadata row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-medium text-slate-500 pb-3 border-b border-slate-200">
                          <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3 shrink-0" />{user.email}</span>
                          {user.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{user.phone}</span>}
                          <span className="flex items-center gap-1"><LogIn className="w-3 h-3 shrink-0" />Login: {user.lastLogin}</span>
                          <span className="flex items-center gap-1"><UserCheck className="w-3 h-3 shrink-0" />Count: {user.loginCount || 0}</span>
                          {user.profileFormData?.submittedAt && (
                            <span className="flex items-center gap-1 text-emerald-600 font-bold col-span-2">
                              <ShieldCheck className="w-3 h-3 shrink-0" />Form: {fmtDate(user.profileFormData.submittedAt)}
                            </span>
                          )}
                        </div>
                        <ExpandedFormRow user={user} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
