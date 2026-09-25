import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { ActionButton } from '../common/ActionButton';
import { AcademicSession } from '../../types';
import {
  Calendar,
  Lock,
  CheckCircle2,
  Clock,
  Settings2,
  Upload,
  FileText,
  AlertTriangle,
  Check,
  ShieldCheck,
  FolderArchive,
  Plus,
  ArrowRight
} from 'lucide-react';

interface AcademicSessionsProps {
  activeModule?: string;
}

export const AcademicSessions: React.FC<AcademicSessionsProps> = ({ activeModule }) => {
  const { sessions, createSession, submissionWindow, updateSubmissionWindow, uploadAdminTemplate } = useCFMS();

  // Submission Window Control State
  const [startDate, setStartDate] = useState(submissionWindow.startDate);
  const [endDate, setEndDate] = useState(submissionWindow.endDate);
  const [windowStatus, setWindowStatus] = useState(submissionWindow.status);
  const [allowLate, setAllowLate] = useState(submissionWindow.allowLateSubmissions);
  const [isSavedMsg, setIsSavedMsg] = useState(false);

  // Template Upload State
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateFormat, setTemplateFormat] = useState('PDF');
  const [templateSuccess, setTemplateSuccess] = useState<string | null>(null);

  // New Academic Session Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionYear, setSessionYear] = useState('');
  const [sessionStartDate, setSessionStartDate] = useState('');
  const [sessionEndDate, setSessionEndDate] = useState('');
  const [sessionStatus, setSessionStatus] = useState<'Active' | 'Upcoming' | 'Past'>('Active');
  const [isCurrent, setIsCurrent] = useState(false);

  useEffect(() => {
    if (activeModule === 'Create Session') {
      setIsCreateModalOpen(true);
    }
  }, [activeModule]);

  const handleSaveWindow = (e: React.FormEvent) => {
    e.preventDefault();
    updateSubmissionWindow({
      startDate,
      endDate,
      status: windowStatus,
      allowLateSubmissions: allowLate
    });
    setIsSavedMsg(true);
    setTimeout(() => setIsSavedMsg(false), 4000);
  };

  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateTitle.trim()) return;
    uploadAdminTemplate(
      templateTitle,
      templateFormat,
      `${templateTitle.toLowerCase().replace(/\s+/g, '_')}.${templateFormat.toLowerCase()}`
    );
    setTemplateSuccess(`Uploaded official template "${templateTitle}" and notified all faculty members.`);
    setTemplateTitle('');
    setTimeout(() => setTemplateSuccess(null), 5000);
  };

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName.trim()) return;

    createSession({
      name: sessionName,
      year: sessionYear,
      startDate: sessionStartDate,
      endDate: sessionEndDate,
      status: sessionStatus,
      isCurrent,
      fileCount: 0
    });

    setIsCreateModalOpen(false);
    setSessionName('');
  };

  // Filtered Sessions List
  const displayedSessions = sessions.filter((s) => {
    if (activeModule === 'Current Session') return s.isCurrent;
    if (activeModule === 'Previous Sessions') return !s.isCurrent;
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Administrator Portal
            </span>
            <span className="text-3xs text-slate-400 font-mono">Control Center</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Academic Sessions & Submission Windows ({activeModule || 'All Sessions'})
          </h1>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Academic Session
        </button>
      </div>

      {/* 1. Submission Window Control Card */}
      {(activeModule === 'Current Session' || !activeModule || activeModule === 'Academic Sessions') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#1E7B4E] text-white rounded-xl shadow-2xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 font-heading">
                  Course File Submission Period Control
                </h2>
                <p className="text-3xs text-slate-500">
                  Active Session: <strong>{submissionWindow.sessionName}</strong>
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                windowStatus === 'Submission Window Active'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {windowStatus}
            </span>
          </div>

          <form onSubmit={handleSaveWindow} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Submission Open Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Submission Close Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Window Access Status *</label>
                <select
                  value={windowStatus}
                  onChange={(e) => setWindowStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold"
                >
                  <option value="Submission Window Active">Submission Window Active (Open for Teachers)</option>
                  <option value="Submission Closed">Submission Closed (Lock Uploads)</option>
                  <option value="Upcoming">Upcoming Session</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowLate}
                    onChange={(e) => setAllowLate(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-3 font-bold text-slate-800">Allow Late Submissions (With Flag)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSavedMsg ? (
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Submission window settings updated & synced with backend database!
                </span>
              ) : (
                <span className="text-3xs text-slate-400">Updates instantly restrict or enable teacher uploads across campus.</span>
              )}
              <ActionButton variant="primary" label="Save Window Settings" size="md" />
            </div>
          </form>
        </div>
      )}

      {/* 2. Official Admin Template Upload */}
      {(activeModule === 'Current Session' || !activeModule || activeModule === 'Academic Sessions') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 font-heading">
                Upload Official Course File Master Template
              </h2>
              <p className="text-3xs text-slate-500">
                Upload the standard template PDF/DOCX file required by Attock Campus Quality Assurance.
              </p>
            </div>
          </div>

          {templateSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {templateSuccess}
            </div>
          )}

          <form onSubmit={handleTemplateSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Template Document Title *</label>
              <input
                type="text"
                required
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="Enter template title"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <select
                value={templateFormat}
                onChange={(e) => setTemplateFormat(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="PDF">PDF Format</option>
                <option value="DOCX">Word Document (DOCX)</option>
                <option value="ZIP">Archive (ZIP)</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Upload className="w-4 h-4" /> Publish & Notify Faculty
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Academic Sessions History Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 font-heading">
          University Academic Sessions History ({displayedSessions.length} Sessions)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {displayedSessions.map((sess) => (
            <div key={sess.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">{sess.name} ({sess.year})</p>
                  {sess.isCurrent && (
                    <span className="px-2 py-0.5 text-3xs font-extrabold bg-emerald-600 text-white rounded-full">Active</span>
                  )}
                </div>
                <p className="text-3xs text-slate-500 font-mono mt-0.5">{sess.startDate} to {sess.endDate}</p>
                <p className="text-3xs text-indigo-700 font-semibold mt-1">{sess.fileCount || 0} files submitted</p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-3xs font-bold border ${
                  sess.isCurrent ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                {sess.isCurrent ? 'Current Session' : sess.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Session Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">Create Academic Session</h3>
                <p className="text-xs text-slate-500">Configure new semester term and active status.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleCreateSessionSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Name *</label>
                <input
                  type="text"
                  required
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Enter session name"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={sessionYear}
                  onChange={(e) => setSessionYear(e.target.value)}
                  placeholder="Enter academic year"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={sessionStartDate}
                    onChange={(e) => setSessionStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={sessionEndDate}
                    onChange={(e) => setSessionEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={sessionStatus}
                    onChange={(e) => setSessionStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Past">Past / Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCurrent}
                      onChange={(e) => setIsCurrent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-2 font-bold text-slate-800">Set as Current</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Save Academic Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};