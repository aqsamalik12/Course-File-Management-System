import React, { useState } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { CourseFileItem } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { ActionButton } from '../common/ActionButton';
import { ApprovalModal } from '../common/ApprovalModal';
import {
  Archive,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  Download,
  Eye,
  History,
  Search,
  Building2,
  GraduationCap,
  BookOpen,
  UserCheck,
  CheckCircle2,
  ListFilter,
  Layers
} from 'lucide-react';

export const ArchiveModule: React.FC = () => {
  const { courseFiles, restoreCourseFile } = useCFMS();
  const [viewMode, setViewMode] = useState<'hierarchy' | 'table'>('hierarchy');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<CourseFileItem | null>(null);
  const [selectedVersionHistoryFile, setSelectedVersionHistoryFile] = useState<CourseFileItem | null>(null);

  // Expanded tree node states
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({ 'Spring 2026': true });
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({ 'Department of Computer Science': true });
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({ 'BS Computer Science': true });
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({ 'Semester 6': true });

  const archivedFiles = courseFiles.filter((f) => f.archived && !f.deleted);

  // Filtered files by search term
  const filteredFiles = archivedFiles.filter((f) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      f.title.toLowerCase().includes(term) ||
      f.courseCode.toLowerCase().includes(term) ||
      f.teacherName.toLowerCase().includes(term) ||
      f.departmentName.toLowerCase().includes(term)
    );
  });

  const toggleSession = (s: string) => setExpandedSessions((p) => ({ ...p, [s]: !p[s] }));
  const toggleDept = (d: string) => setExpandedDepts((p) => ({ ...p, [d]: !p[d] }));
  const toggleProgram = (p: string) => setExpandedPrograms((prev) => ({ ...prev, [p]: !prev[p] }));
  const toggleSemester = (sem: string) => setExpandedSemesters((prev) => ({ ...prev, [sem]: !prev[sem] }));

  const columns: Column<CourseFileItem>[] = [
    {
      key: 'title',
      header: 'Approved Course File',
      render: (f) => (
        <div className="flex items-start gap-2.5">
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-[#1E7B4E]" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xs block">{f.title}</span>
            <span className="text-3xs text-slate-500 font-mono">
              {f.courseCode} • Version {f.currentVersion} • {(f.departmentName || '').replace('Department of ', '')}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'teacherName',
      header: 'Faculty Member',
      render: (f) => (
        <div>
          <p className="font-bold text-slate-800 text-2xs">{f.teacherName}</p>
          <p className="text-3xs text-slate-400">{f.teacherRole}</p>
        </div>
      )
    },
    {
      key: 'uploadDate',
      header: 'Approval & Archive Date',
      render: (f) => <span className="text-3xs font-mono text-slate-600">{f.uploadDate}</span>
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Module Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Institutional Quality Archive
            </span>
            <span className="text-3xs text-slate-400 font-mono">{archivedFiles.length} Course Files Archived</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Academic Course File Repository
          </h1>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('hierarchy')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'hierarchy' ? 'bg-white text-[#1E7B4E] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Strict Hierarchy Tree</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-white text-[#1E7B4E] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Searchable Flat List</span>
          </button>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search repository by Academic Session, Department, Program, Semester, Course, or Teacher..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#1E7B4E] outline-none shadow-xs"
        />
      </div>

      {/* VIEW MODE 1: Strict Hierarchy Tree */}
      {viewMode === 'hierarchy' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Archive className="w-4 h-4 text-[#1E7B4E]" />
              <span>Hierarchical Archive Explorer</span>
            </h3>
            <span className="text-3xs text-slate-400 font-mono">
              Hierarchy: Session → Dept → Program → Semester → Course → Teacher
            </span>
          </div>

          {/* Level 1: Academic Sessions */}
          {['Spring 2026', 'Fall 2025'].map((session) => {
            const isSessionOpen = expandedSessions[session];
            const sessionFiles = filteredFiles.filter((f) => f.title.includes(session) || session === 'Spring 2026');

            return (
              <div key={session} className="border border-slate-200 rounded-xl overflow-hidden font-sans">
                {/* Session Header */}
                <button
                  type="button"
                  onClick={() => toggleSession(session)}
                  className="w-full p-3.5 bg-slate-800 text-white flex items-center justify-between text-xs font-extrabold hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {isSessionOpen ? <ChevronDown className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    <Archive className="w-4 h-4 text-emerald-400" />
                    <span>Academic Session: {session}</span>
                  </div>
                  <span className="text-3xs font-mono font-bold bg-slate-700 text-emerald-300 px-2.5 py-0.5 rounded-full border border-slate-600">
                    {sessionFiles.length} Course Files
                  </span>
                </button>

                {/* Level 2: Department */}
                {isSessionOpen && (
                  <div className="p-3 bg-slate-50/50 space-y-3 pl-6 border-t border-slate-200">
                    {['Department of Computer Science', 'Department of Software Engineering'].map((dept) => {
                      const isDeptOpen = expandedDepts[dept];
                      const deptFiles = sessionFiles.filter((f) => f.departmentName === dept || dept.includes('Computer Science'));

                      return (
                        <div key={dept} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleDept(dept)}
                            className="w-full p-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs font-bold text-slate-900 hover:bg-emerald-100/60 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              {isDeptOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#1E7B4E]" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                              <Building2 className="w-3.5 h-3.5 text-[#1E7B4E]" />
                              <span>{dept}</span>
                            </div>
                            <span className="text-3xs font-mono text-emerald-800 font-semibold">{deptFiles.length} files</span>
                          </button>

                          {/* Level 3: Program */}
                          {isDeptOpen && (
                            <div className="p-3 bg-white space-y-2.5 pl-6 border-t border-slate-100">
                              {['BS Computer Science', 'MS Computer Science'].map((prog) => {
                                const isProgOpen = expandedPrograms[prog];

                                return (
                                  <div key={prog} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/40">
                                    <button
                                      type="button"
                                      onClick={() => toggleProgram(prog)}
                                      className="w-full p-2.5 text-xs font-extrabold text-slate-800 flex items-center justify-between hover:bg-slate-100 transition-all cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2">
                                        {isProgOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                                        <GraduationCap className="w-3.5 h-3.5 text-[#1E7B4E]" />
                                        <span>Program: {prog}</span>
                                      </div>
                                    </button>

                                    {/* Level 4: Semester */}
                                    {isProgOpen && (
                                      <div className="p-2.5 pl-6 space-y-2 border-t border-slate-200 bg-white">
                                        {['Semester 6', 'Semester 4'].map((semester) => {
                                          const isSemOpen = expandedSemesters[semester];

                                          return (
                                            <div key={semester} className="border border-slate-200 rounded-md overflow-hidden">
                                              <button
                                                type="button"
                                                onClick={() => toggleSemester(semester)}
                                                className="w-full p-2 bg-slate-100 text-3xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between hover:bg-slate-200 transition-all cursor-pointer"
                                              >
                                                <div className="flex items-center gap-2">
                                                  {isSemOpen ? <ChevronDown className="w-3 h-3 text-slate-600" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                                                  <BookOpen className="w-3 h-3 text-[#1E7B4E]" />
                                                  <span>{semester}</span>
                                                </div>
                                              </button>

                                              {/* Level 5 & 6: Course -> Teacher -> Approved Course File */}
                                              {isSemOpen && (
                                                <div className="p-2 space-y-2 bg-slate-50/50">
                                                  {deptFiles.map((file) => (
                                                    <div
                                                      key={file.id}
                                                      className="p-3 bg-white border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-emerald-300 transition-all shadow-2xs"
                                                    >
                                                      <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                          <span className="text-3xs font-mono font-bold text-[#1E7B4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                            {file.courseCode}
                                                          </span>
                                                          <span className="text-3xs font-bold bg-[#1E7B4E] text-white px-2 py-0.5 rounded">
                                                            {file.currentVersion}
                                                          </span>
                                                          <span className="text-3xs text-slate-400 font-mono">
                                                            Teacher: <strong className="text-slate-700">{file.teacherName}</strong>
                                                          </span>
                                                        </div>
                                                        <h5 className="text-xs font-bold text-slate-900">{file.title}</h5>
                                                      </div>

                                                      <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                          onClick={() => setSelectedPreviewFile(file)}
                                                          className="px-2.5 py-1 text-3xs font-bold text-[#1E7B4E] bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 cursor-pointer"
                                                        >
                                                          <Eye className="w-3 h-3" />
                                                          <span>Preview File</span>
                                                        </button>

                                                        <button
                                                          onClick={() => setSelectedVersionHistoryFile(file)}
                                                          className="px-2.5 py-1 text-3xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer"
                                                        >
                                                          <History className="w-3 h-3 text-slate-500" />
                                                          <span>Version Log</span>
                                                        </button>

                                                        <button
                                                          onClick={() => alert(`Downloading archived ${file.title} complete course package.`)}
                                                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                                                        >
                                                          <Download className="w-3.5 h-3.5" />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW MODE 2: Searchable Flat List */
        <DataTable
          data={filteredFiles}
          columns={columns}
          searchPlaceholder="Search archived course files..."
          actions={(f) => (
            <div className="flex items-center gap-2">
              <ActionButton
                variant="preview"
                label="Preview PDF"
                size="sm"
                onClick={() => setSelectedPreviewFile(f)}
              />
              <ActionButton
                variant="history"
                label="Version Log"
                size="sm"
                onClick={() => setSelectedVersionHistoryFile(f)}
              />
              <ActionButton
                variant="restore"
                label="Restore"
                size="sm"
                onClick={() => restoreCourseFile(f.id)}
              />
            </div>
          )}
        />
      )}

      {/* Preview Modal */}
      <ApprovalModal
        isOpen={!!selectedPreviewFile}
        onClose={() => setSelectedPreviewFile(null)}
        file={selectedPreviewFile}
      />

      {/* Version History Modal */}
      {selectedVersionHistoryFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Version History Log</h3>
                <p className="text-xs text-slate-500">{selectedVersionHistoryFile.courseCode} - {selectedVersionHistoryFile.title}</p>
              </div>
              <button onClick={() => setSelectedVersionHistoryFile(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedVersionHistoryFile.versionHistory?.map((ver) => (
                <div key={ver.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-extrabold text-xs text-[#1E7B4E]">{ver.versionNumber}</span>
                    <span className="text-3xs text-slate-400 font-mono">{ver.uploadedAt}</span>
                  </div>
                  <p className="text-2xs font-bold text-slate-800">Uploaded by: {ver.uploadedBy} ({ver.uploadedByRole})</p>
                  <p className="text-3xs text-slate-600">Changelog: {ver.changeLog}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
              <button onClick={() => setSelectedVersionHistoryFile(null)} className="px-4 py-2 text-xs font-bold bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-800 cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};