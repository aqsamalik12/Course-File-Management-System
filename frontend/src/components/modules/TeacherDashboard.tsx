import React from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { VisitingContractBanner } from '../common/VisitingContractBanner';
import {
  BookOpen,
  Upload,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  User,
  Building2,
  History,
  FileText,
  FileCheck2,
  ChevronRight,
  ShieldCheck,
  Send,
  Lock,
  ClipboardList
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (moduleName: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const { courseFiles, courses, notifications, submissionWindow, markNotificationAsRead } = useCFMS();
  const { currentUser } = useAuth();

  // Teacher Profile Info
  const teacherName = currentUser?.name || 'Faculty Member';
  const departmentName = currentUser?.departmentName || 'Department';
  const campusName = currentUser?.campus || currentUser?.campusName || 'Main Campus';
  const hodName = currentUser?.hodName || currentUser?.profileFormData?.hodName || 'Department HOD';
  const isVisiting = currentUser?.role === 'VISITING_TEACHER';

  // Personal Data Scoping (Real assigned courses only, zero dummy fallback)
  const myCourses = courses.filter(
    (c) => c.assignedTeacherId === currentUser?.id || (currentUser?.email && c.assignedTeacherId === currentUser?.email) || c.assignedTeacherName === teacherName
  );
  const displayCourses = myCourses;

  const myFiles = courseFiles.filter(
    (f) => f.teacherId === currentUser?.id || f.teacherName === teacherName
  );

  const approvedCount = myFiles.filter((f) => f.status === 'Approved').length;
  const pendingCount = myFiles.filter((f) => f.status === 'Submitted' || f.status === 'In Review').length;
  const revisionCount = myFiles.filter(
    (f) => f.status === 'Returned for Revision' || f.status === 'Revision Requested' || f.status === 'Returned'
  ).length;

  // Recent Teacher Notifications
  const teacherNotifs = notifications.slice(0, 4);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">

      {/* Profile Form Alert Banner — show if form not yet submitted */}
      {!currentUser?.profileFormSubmitted && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-amber-900">⚠️ Profile Form Required</p>
              <p className="text-xs text-amber-700 mt-0.5">Fill your Teacher Profile Form to unlock course file submission and all other features.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('My Profile Form')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-2"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Fill Form Now →
          </button>
        </div>
      )}

      {/* 1. Welcome Section — Hello [Name]! */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-3xs font-extrabold uppercase tracking-wider text-[#1E7B4E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {isVisiting ? 'Visiting Faculty Member' : 'Regular Faculty Member'}
            </span>
            <span className="text-3xs text-slate-500 font-mono">Academic Term: {submissionWindow.sessionName}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <span>👋</span>
            Welcome, {teacherName}!
          </h1>
          <p className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">{departmentName}</span>
            <span>•</span>
            <span className="font-semibold text-slate-800">{campusName}</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              HOD: {hodName}
            </span>
          </p>
          {currentUser?.profileFormData && (
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                📅 {currentUser.profileFormData.academicSession}
              </span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                👥 Batch {currentUser.profileFormData.batch}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentUser?.profileFormSubmitted ? (
            <button
              onClick={() => onNavigate('Course File Submission')}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Submit Course File</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('My Profile Form')}
              className="px-4 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-400 rounded-xl shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Fill Profile Form</span>
            </button>
          )}
        </div>
      </div>

      {/* Contract Banner if Visiting Faculty */}
      {isVisiting && (
        <VisitingContractBanner
          teacherName={teacherName}
          departmentName={departmentName}
          contractStatus="ACTIVE"
          assignedSemester="Spring 2026"
          expiryDate="2026-08-31"
          daysRemaining={39}
        />
      )}

      {/* 2. Pending Course File Deadline Banner */}
      <div className="bg-gradient-to-r from-[#165534] to-[#12482c] text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-700/60 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800/80 rounded-xl">
              <Clock className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <span className="text-3xs font-extrabold uppercase tracking-wider text-emerald-300">
                Pending Course File Deadline
              </span>
              <h2 className="text-sm font-extrabold text-white mt-0.5">
                Semester Submission Cutoff: {submissionWindow.endDate}
              </h2>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider border shrink-0 ${
              submissionWindow.status === 'Submission Window Active'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {submissionWindow.status}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-emerald-100/90 gap-2">
          <p className="text-3xs">
            Teachers must submit ONE complete course file for each assigned course before the closing deadline.
          </p>
          <button
            onClick={() => onNavigate('Templates & Instructions')}
            className="text-3xs font-bold text-white underline hover:text-emerald-200 cursor-pointer shrink-0"
          >
            Download Submission Guidelines →
          </button>
        </div>
      </div>

      {/* 3. Course File Submission Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block">Total Assigned</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{displayCourses.length}</span>
            <BookOpen className="w-5 h-5 text-slate-400" />
          </div>
          <span className="text-3xs text-slate-500 font-medium">Active Courses</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-3xs font-bold uppercase tracking-wider text-amber-600 block">Under Review</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-700">{pendingCount}</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-3xs text-slate-500 font-medium">Awaiting HOD Audit</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-3xs font-bold uppercase tracking-wider text-emerald-600 block">Approved</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-700">{approvedCount}</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-3xs text-slate-500 font-medium">Archived to QEC</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-3xs font-bold uppercase tracking-wider text-red-600 block">Returned for Revision</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-red-700">{revisionCount}</span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-3xs text-slate-500 font-medium">Action Required</span>
        </div>
      </div>

      {/* 4. Assigned Courses Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 font-heading">
              Assigned Courses Summary ({submissionWindow.sessionName})
            </h2>
            <p className="text-xs text-slate-500">
              Overview of your teaching load and course file submission state for each course.
            </p>
          </div>
          <button
            onClick={() => onNavigate('My Assigned Courses')}
            className="text-xs font-bold text-[#1E7B4E] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {displayCourses.length === 0 ? (
          <div className="text-center py-8 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No courses assigned yet</p>
            <p className="text-3xs text-slate-400 mt-0.5">Approved courses assigned by your department HOD will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {displayCourses.map((c) => {
              const courseFile = myFiles.find((f) => f.courseCode === c.code);
              const statusPill = courseFile ? courseFile.status : 'Not Uploaded';

              return (
                <div
                  key={c.id}
                  className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 space-y-3 hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-[#1E7B4E] bg-white px-2.5 py-0.5 rounded border border-emerald-200">
                        {c.code}
                      </span>
                      <span
                        className={`text-3xs font-bold px-2 py-0.5 rounded-full border ${
                          statusPill === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : statusPill === 'Submitted' || statusPill === 'In Review'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : statusPill === 'Returned for Revision' || statusPill === 'Revision Requested'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {statusPill}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 line-clamp-1">{c.title}</h3>
                      <p className="text-3xs text-slate-500 mt-0.5">{c.departmentName} • {c.credits} Credits</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-3xs">
                    <span className="text-slate-500 font-mono">
                      {courseFile ? `Version: ${courseFile.currentVersion}` : 'No file uploaded'}
                    </span>
                    <button
                      onClick={() => onNavigate('Course File Submission')}
                      className="font-bold text-[#1E7B4E] hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Recent Notifications */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1E7B4E]" />
            <h2 className="text-sm font-extrabold text-slate-900 font-heading">Recent Notifications</h2>
          </div>
          <button
            onClick={() => onNavigate('Notifications')}
            className="text-xs font-bold text-[#1E7B4E] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {teacherNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-start justify-between gap-3 ${
                !n.isRead ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/50 border-slate-200'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-2xs">{n.title}</span>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#1E7B4E] shrink-0" title="Unread" />
                  )}
                </div>
                <p className="text-3xs text-slate-600 line-clamp-1">{n.message}</p>
              </div>
              <span className="text-3xs text-slate-400 font-mono shrink-0">{n.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('Course File Submission')}
            className="p-4 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-2xl shadow-xs text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div className="p-2.5 bg-emerald-50 group-hover:bg-[#1E7B4E] group-hover:text-white text-[#1E7B4E] rounded-xl w-fit transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 block group-hover:text-[#1E7B4E]">
                Submit Course File
              </span>
              <span className="text-3xs text-slate-400 block mt-0.5">Upload .ZIP or .PDF</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('Templates & Instructions')}
            className="p-4 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-2xl shadow-xs text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div className="p-2.5 bg-emerald-50 group-hover:bg-[#1E7B4E] group-hover:text-white text-[#1E7B4E] rounded-xl w-fit transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 block group-hover:text-[#1E7B4E]">
                Templates & Guidelines
              </span>
              <span className="text-3xs text-slate-400 block mt-0.5">Download Official Files</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('My Assigned Courses')}
            className="p-4 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-2xl shadow-xs text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div className="p-2.5 bg-emerald-50 group-hover:bg-[#1E7B4E] group-hover:text-white text-[#1E7B4E] rounded-xl w-fit transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 block group-hover:text-[#1E7B4E]">
                My Assigned Courses
              </span>
              <span className="text-3xs text-slate-400 block mt-0.5">View Teaching Load</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('Submission History')}
            className="p-4 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-2xl shadow-xs text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div className="p-2.5 bg-emerald-50 group-hover:bg-[#1E7B4E] group-hover:text-white text-[#1E7B4E] rounded-xl w-fit transition-colors">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 block group-hover:text-[#1E7B4E]">
                Submission History
              </span>
              <span className="text-3xs text-slate-400 block mt-0.5">Audit Version Logs</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('Notifications')}
            className="p-4 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-2xl shadow-xs text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div className="p-2.5 bg-emerald-50 group-hover:bg-[#1E7B4E] group-hover:text-white text-[#1E7B4E] rounded-xl w-fit transition-colors">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 block group-hover:text-[#1E7B4E]">
                Notifications
              </span>
              <span className="text-3xs text-slate-400 block mt-0.5">Check Alerts</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('Profile')}
            className="p-4 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-2xl shadow-xs text-left transition-all cursor-pointer group flex flex-col justify-between space-y-3"
          >
            <div className="p-2.5 bg-emerald-50 group-hover:bg-[#1E7B4E] group-hover:text-white text-[#1E7B4E] rounded-xl w-fit transition-colors">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-900 block group-hover:text-[#1E7B4E]">
                My Profile
              </span>
              <span className="text-3xs text-slate-400 block mt-0.5">Personal Details</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
