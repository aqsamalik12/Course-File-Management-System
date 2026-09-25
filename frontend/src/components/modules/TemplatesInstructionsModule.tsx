import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { OFFICIAL_COURSE_FILE_TEMPLATES, REQUIRED_DOCUMENT_CHECKLIST } from '../../data/mockData';
import {
  FileText,
  Download,
  Eye,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  FileCheck2,
  X,
  FileDown,
  Upload,
  Plus,
  Trash2,
  Edit2,
  Search,
  Layers,
  AlertCircle
} from 'lucide-react';

interface InstructionItem {
  id: string;
  directiveNo: string;
  title: string;
  description: string;
}

interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  mandatory?: boolean;
}

interface TemplatesInstructionsModuleProps {
  activeModule?: string;
}

export const TemplatesInstructionsModule: React.FC<TemplatesInstructionsModuleProps> = ({ activeModule }) => {
  const { submissionWindow, uploadAdminTemplate } = useCFMS();
  const { currentUser } = useAuth();
  
  // Navigation Tabs: 'all' | 'templates' | 'guidelines' | 'checklist'
  const [activeTab, setActiveTab] = useState<'all' | 'templates' | 'guidelines' | 'checklist'>('all');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('ALL');

  // Alert/Toast Notification
  const [downloadAlert, setDownloadAlert] = useState<string | null>(null);

  // Modals State
  const [selectedInstructionView, setSelectedInstructionView] = useState<boolean>(false);
  const [showAdminUploadModal, setShowAdminUploadModal] = useState<boolean>(false);

  // Dynamic Templates state (so Admin can upload & delete templates)
  const [templatesList, setTemplatesList] = useState(OFFICIAL_COURSE_FILE_TEMPLATES);

  // Dynamic Guidelines / Instructions state (so Admin can create, edit, & delete guidelines)
  const [instructionsList, setInstructionsList] = useState<InstructionItem[]>([
    {
      id: 'inst-1',
      directiveNo: 'Guideline 01',
      title: 'Single Compiled File Rule',
      description: 'Each assigned course requires exactly ONE complete course file (.ZIP or .PDF) containing all 10 mandatory sections.'
    },
    {
      id: 'inst-2',
      directiveNo: 'Guideline 02',
      title: 'Strict Deadline Compliance',
      description: `Submissions past the cutoff date (${submissionWindow.endDate}) will automatically be flagged as "Late Submission" for QEC audit.`
    },
    {
      id: 'inst-3',
      directiveNo: 'Guideline 03',
      title: 'HOD Signoff & Archiving',
      description: 'Once approved by the Head of Department, course files are automatically archived in the institutional repository.'
    }
  ]);

  // Dynamic Checklist / Mandatory Sections state (so Admin can Add, Edit & Delete sections)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(REQUIRED_DOCUMENT_CHECKLIST);

  // Section Add / Edit Modal State
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState<ChecklistItem | null>(null);
  const [secName, setSecName] = useState('');
  const [secDesc, setSecDesc] = useState('');

  // Modals for Instructions Creation & Editing
  const [showInstructionModal, setShowInstructionModal] = useState(false);
  const [editingInstruction, setEditingInstruction] = useState<InstructionItem | null>(null);
  const [instTitle, setInstTitle] = useState('');
  const [instDirective, setInstDirective] = useState('');
  const [instDesc, setInstDesc] = useState('');

  // Admin Upload Template Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newFormat, setNewFormat] = useState('PDF');
  const [newSize, setNewSize] = useState('2.5 MB');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [targetFaculty, setTargetFaculty] = useState<string>('ALL');

  const isAdmin = currentUser?.role === 'ADMIN';

  // React to activeModule prop passed from Sidebar navigation
  useEffect(() => {
    if (activeModule === 'All Templates') {
      setActiveTab('templates');
    } else if (activeModule === 'Upload Official Template' || activeModule === 'Upload Template') {
      setActiveTab('templates');
      setShowAdminUploadModal(true);
    } else if (activeModule === 'Submission Guidelines' || activeModule === 'Upload Guidelines') {
      setActiveTab('guidelines');
    } else if (activeModule === 'Mandatory Checklist') {
      setActiveTab('checklist');
    } else {
      setActiveTab('all');
    }
  }, [activeModule]);

  // Filtered Templates based on search and format
  const filteredTemplates = templatesList.filter((tmpl) => {
    const matchesSearch = tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = formatFilter === 'ALL' || tmpl.format.toUpperCase() === formatFilter.toUpperCase();
    return matchesSearch && matchesFormat;
  });

  const handleDownload = (title: string, fileName: string) => {
    setDownloadAlert(`Downloading official resource: "${title}" (${fileName})`);
    setTimeout(() => setDownloadAlert(null), 4000);
  };

  const handleAdminUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const sizeStr = templateFile ? `${(templateFile.size / 1024 / 1024).toFixed(1)} MB` : (newSize || '2.5 MB');
    const nameStr = templateFile ? templateFile.name : `${newTitle.toLowerCase().replace(/\s+/g, '_')}.${newFormat.toLowerCase()}`;

    const newTmpl = {
      id: `tmpl-${Date.now()}`,
      title: newTitle,
      format: newFormat,
      version: '2026.1',
      fileSize: sizeStr,
      updatedDate: new Date().toISOString().split('T')[0],
      description: newDesc || 'Official admin published course file template.',
      fileName: nameStr
    };

    setTemplatesList((prev) => [newTmpl, ...prev]);
    uploadAdminTemplate(newTitle, newFormat, newTmpl.fileName);

    const targetText = targetFaculty === 'ALL' ? 'All Faculty Members & HODs' : targetFaculty;
    setDownloadAlert(`Admin published official template: "${newTitle}" (${nameStr}). Broadcasted to ${targetText}.`);
    setShowAdminUploadModal(false);
    setNewTitle('');
    setNewDesc('');
    setTemplateFile(null);
    setTimeout(() => setDownloadAlert(null), 5000);
  };

  const handleDeleteTemplate = (tmplId: string, title: string) => {
    if (window.confirm(`Are you sure you want to remove template "${title}"?`)) {
      setTemplatesList((prev) => prev.filter((t) => t.id !== tmplId));
      setDownloadAlert(`Template "${title}" has been deleted successfully.`);
      setTimeout(() => setDownloadAlert(null), 4000);
    }
  };

  // Instructions Add/Edit Handlers
  const handleOpenAddInstruction = () => {
    setEditingInstruction(null);
    setInstTitle('');
    setInstDirective(`Guideline 0${instructionsList.length + 1}`);
    setInstDesc('');
    setShowInstructionModal(true);
  };

  const handleOpenEditInstruction = (inst: InstructionItem) => {
    setEditingInstruction(inst);
    setInstTitle(inst.title);
    setInstDirective(inst.directiveNo);
    setInstDesc(inst.description);
    setShowInstructionModal(true);
  };

  const handleSaveInstruction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instTitle.trim()) return;

    if (editingInstruction) {
      setInstructionsList((prev) =>
        prev.map((item) =>
          item.id === editingInstruction.id
            ? { ...item, title: instTitle, directiveNo: instDirective, description: instDesc }
            : item
        )
      );
      setDownloadAlert(`Instruction "${instTitle}" updated successfully.`);
    } else {
      const newInst: InstructionItem = {
        id: `inst-${Date.now()}`,
        directiveNo: instDirective || `Guideline 0${instructionsList.length + 1}`,
        title: instTitle,
        description: instDesc
      };
      setInstructionsList((prev) => [...prev, newInst]);
      setDownloadAlert(`New Guideline "${instTitle}" published successfully.`);
    }

    setShowInstructionModal(false);
    setTimeout(() => setDownloadAlert(null), 4000);
  };

  const handleDeleteInstruction = (instId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete guideline "${title}"?`)) {
      setInstructionsList((prev) => prev.filter((i) => i.id !== instId));
      setDownloadAlert(`Instruction "${title}" removed successfully.`);
      setTimeout(() => setDownloadAlert(null), 4000);
    }
  };

  // Mandatory Checklist Sections Handlers (Add, Edit, Delete)
  const handleOpenAddSection = () => {
    setEditingSection(null);
    setSecName('');
    setSecDesc('');
    setShowSectionModal(true);
  };

  const handleOpenEditSection = (sec: ChecklistItem) => {
    setEditingSection(sec);
    setSecName(sec.name);
    setSecDesc(sec.description);
    setShowSectionModal(true);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secName.trim()) return;

    if (editingSection) {
      setChecklistItems((prev) =>
        prev.map((item) =>
          item.id === editingSection.id
            ? { ...item, name: secName, description: secDesc }
            : item
        )
      );
      setDownloadAlert(`Section "${secName}" updated successfully.`);
    } else {
      const newSec: ChecklistItem = {
        id: `chk-${Date.now()}`,
        name: secName,
        description: secDesc,
        mandatory: true
      };
      setChecklistItems((prev) => [...prev, newSec]);
      setDownloadAlert(`New Mandatory Section "${secName}" added successfully.`);
    }

    setShowSectionModal(false);
    setTimeout(() => setDownloadAlert(null), 4000);
  };

  const handleDeleteSection = (secId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete section "${name}"?`)) {
      setChecklistItems((prev) => prev.filter((s) => s.id !== secId));
      setDownloadAlert(`Section "${name}" deleted successfully.`);
      setTimeout(() => setDownloadAlert(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans select-none">
      
      {/* ========================================================================= */}
      {/* 1. TOP HERO HEADER & SUB-NAVIGATION TABS BAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                QEC Institutional Quality Standard
              </span>
              <span className="text-3xs text-slate-400 font-mono">Academic Term: {submissionWindow.sessionName}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading tracking-tight">
              Course File Templates & Guidelines
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Official university templates, submission directives, and mandatory section checklists for faculty members.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <button
                onClick={() => setShowAdminUploadModal(true)}
                className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all border border-indigo-500/30"
              >
                <Upload className="w-4 h-4 text-indigo-200" />
                <span>Upload Admin Template</span>
              </button>
            )}
            <button
              onClick={() => handleDownload('All Admin Templates Package', 'UE_Course_File_Templates_Bundle.zip')}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] active:scale-[0.98] rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all border border-emerald-700/30"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>Download Template Bundle</span>
            </button>
          </div>
        </div>

        {/* Interactive Sub-Navigation Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-white text-[#1E7B4E] shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Resources</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'templates'
                  ? 'bg-white text-[#1E7B4E] shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Official Templates ({templatesList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('guidelines')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'guidelines'
                  ? 'bg-white text-[#1E7B4E] shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Submission Guidelines ({instructionsList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'checklist'
                  ? 'bg-white text-[#1E7B4E] shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mandatory Checklist ({checklistItems.length})</span>
            </button>
          </div>

          {/* Quick Search & Format Filter (Shown when viewing templates) */}
          {(activeTab === 'all' || activeTab === 'templates') && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none"
                />
              </div>

              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none cursor-pointer"
              >
                <option value="ALL">All Formats</option>
                <option value="PDF">PDF Only</option>
                <option value="DOCX">DOCX Only</option>
                <option value="ZIP">ZIP Only</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification Alert */}
      {downloadAlert && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/90 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{downloadAlert}</span>
          </div>
          <button onClick={() => setDownloadAlert(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. OFFICIAL TEMPLATES SECTION (GRID & ADMIN MANAGEMENT) */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'templates') && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 font-heading flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-[#1E7B4E]" />
              <span>Official Admin Course File Templates</span>
            </h2>
            <span className="text-3xs text-slate-400 font-mono">
              Showing {filteredTemplates.length} of {templatesList.length} Templates
            </span>
          </div>

          {filteredTemplates.length === 0 ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No templates found matching your search filter.</p>
              <button
                onClick={() => { setSearchQuery(''); setFormatFilter('ALL'); }}
                className="text-xs text-indigo-600 font-bold hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-3xs font-extrabold text-[#1E7B4E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                        {tmpl.format} • {tmpl.fileSize}
                      </span>
                      <span className="text-3xs text-slate-400 font-mono">Ver {tmpl.version}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 leading-snug group-hover:text-[#1E7B4E] transition-colors">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-normal">
                      {tmpl.description}
                    </p>
                  </div>

                  {/* Action Footer: Delete for Admin / Download for all */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {isAdmin ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDownload(tmpl.title, tmpl.fileName)}
                          className="flex-1 py-2 px-3 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200/80"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(tmpl.id, tmpl.title)}
                          className="py-2 px-3 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-rose-200/80"
                          title="Remove / Delete Template"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Delete</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDownload(tmpl.title, tmpl.fileName)}
                        className="w-full py-2.5 px-3 text-xs font-bold bg-[#1E7B4E] hover:bg-[#165534] active:scale-[0.99] text-white rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Official Template</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. OFFICIAL SUBMISSION GUIDELINES (DYNAMIC CRUD FOR ADMIN) */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'guidelines') && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-md space-y-5 animate-fade-in border border-slate-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Administrator Course File Submission Guidelines</h3>
                <p className="text-xs text-slate-300">
                  Mandatory directives issued by Quality Enhancement Cell (QEC) for all faculty members.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full sm:w-auto">
              {isAdmin && (
                <button
                  onClick={handleOpenAddInstruction}
                  className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-xl shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-indigo-400/40 whitespace-nowrap flex-1 sm:flex-initial"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Instruction</span>
                </button>
              )}
              <button
                onClick={() => setSelectedInstructionView(true)}
                className="px-3.5 py-2 text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 active:scale-[0.98] rounded-xl shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap flex-1 sm:flex-initial"
              >
                <Eye className="w-3.5 h-3.5 text-[#1E7B4E]" />
                <span>View Full Directives</span>
              </button>
              <button
                onClick={() => handleDownload('Official Guidelines Manual', 'QEC_Course_File_Guidelines_2026.pdf')}
                className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white rounded-xl shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-all whitespace-nowrap flex-1 sm:flex-initial border border-emerald-400/30"
              >
                <FileDown className="w-3.5 h-3.5 text-emerald-200" />
                <span>Download Manual PDF</span>
              </button>
            </div>
          </div>

          {/* Dynamic Guidelines List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {instructionsList.map((inst) => (
              <div
                key={inst.id}
                className="p-4.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl space-y-2.5 relative flex flex-col justify-between group transition-all shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-extrabold text-emerald-400 font-mono tracking-wider uppercase px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">
                      {inst.directiveNo}
                    </span>
                    {isAdmin && (
                      <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700/60 shadow-2xs">
                        <button
                          onClick={() => handleOpenEditInstruction(inst)}
                          className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Edit Instruction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-3.5 bg-slate-700 mx-0.5" />
                        <button
                          onClick={() => handleDeleteInstruction(inst.id, inst.title)}
                          className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-900/60 transition-colors cursor-pointer"
                          title="Remove Instruction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <h4 className="font-extrabold text-white text-xs leading-snug">{inst.title}</h4>
                  <p className="text-slate-300 text-3xs leading-relaxed font-normal">{inst.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MANDATORY CHECKLIST GRID (DYNAMIC ADD, EDIT & DELETE FOR ADMIN) */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'checklist') && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#1E7B4E]" />
                <span>{checklistItems.length} Mandatory Sections Inside Course File</span>
              </h3>
              <p className="text-3xs text-slate-500">
                Verify that your course file contains all required sections prior to final submission.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && (
                <button
                  onClick={handleOpenAddSection}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all border border-indigo-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Mandatory Section</span>
                </button>
              )}
              <span className="text-3xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                QEC Standard
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {checklistItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-1.5 hover:border-emerald-400 hover:bg-white transition-all shadow-2xs relative group flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] bg-white px-2 py-0.5 rounded border border-slate-200">
                      Section {idx + 1}
                    </span>

                    {isAdmin ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditSection(item)}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Edit Section"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(item.id, item.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </div>

                  <h4 className="text-2xs font-extrabold text-slate-900 line-clamp-1">{item.name}</h4>
                  <p className="text-3xs text-slate-500 leading-normal line-clamp-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALS (ADMIN UPLOAD TEMPLATE / ADD-EDIT INSTRUCTIONS / SECTION MODAL / VIEW MANUAL) */}
      {/* ========================================================================= */}

      {/* Admin Upload Template Modal */}
      {showAdminUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Upload Official Admin Course File Template</h3>
              <button onClick={() => setShowAdminUploadModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminUploadSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Template Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master BS Course File Template 2026"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Guidelines</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Instructions for faculty members on preparing the course file..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none"
                />
              </div>

              {/* Template File Attachment Zone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Attach Template File (.PDF, .DOCX, .ZIP) *</label>
                <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 hover:bg-indigo-50/40 rounded-xl p-3.5 text-center cursor-pointer relative transition-all">
                  <Upload className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    {templateFile ? templateFile.name : 'Click or Drag & Drop template file here'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                    Supports PDF, Word (DOCX), ZIP files (Max: 50MB)
                  </span>
                  {templateFile && (
                    <span className="mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      Selected: {(templateFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  )}
                  <input
                    type="file"
                    required
                    accept=".pdf,.docx,.doc,.zip,.rar"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setTemplateFile(f);
                      if (f) {
                        const ext = f.name.split('.').pop()?.toUpperCase() || 'PDF';
                        if (['PDF', 'DOCX', 'ZIP'].includes(ext)) setNewFormat(ext);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Format</label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none cursor-pointer"
                  >
                    <option value="PDF">PDF Template</option>
                    <option value="DOCX">Word DOCX</option>
                    <option value="ZIP">ZIP Bundle</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Faculty</label>
                  <select
                    value={targetFaculty}
                    onChange={(e) => setTargetFaculty(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none cursor-pointer"
                  >
                    <option value="ALL">All Faculty Members & HODs (Broadcast All)</option>
                    <option value="HOD">Head of Departments (HOD) Only</option>
                    <option value="REGULAR_TEACHER">Regular Faculty Only</option>
                    <option value="VISITING_TEACHER">Visiting Faculty Only</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminUploadModal(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Publish Template</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Mandatory Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingSection ? 'Edit Mandatory Course File Section' : 'Add New Mandatory Course File Section'}
              </h3>
              <button onClick={() => setShowSectionModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Section Name / Title *</label>
                <input
                  type="text"
                  required
                  value={secName}
                  onChange={(e) => setSecName(e.target.value)}
                  placeholder="e.g. Lab Manual & Industry Projects"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Section Description & Requirements *</label>
                <textarea
                  rows={3}
                  required
                  value={secDesc}
                  onChange={(e) => setSecDesc(e.target.value)}
                  placeholder="Specify required documents and compliance guidelines for this section..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  {editingSection ? 'Update Section' : 'Save Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Instruction Modal */}
      {showInstructionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingInstruction ? 'Edit QEC Instruction / Directive' : 'Create New QEC Instruction / Directive'}
              </h3>
              <button onClick={() => setShowInstructionModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInstruction} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Directive / Guideline Tag *</label>
                <input
                  type="text"
                  required
                  value={instDirective}
                  onChange={(e) => setInstDirective(e.target.value)}
                  placeholder="e.g. Guideline 04"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instruction Title *</label>
                <input
                  type="text"
                  required
                  value={instTitle}
                  onChange={(e) => setInstTitle(e.target.value)}
                  placeholder="e.g. Midterm & Final Answer Key Submission Policy"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instruction Details / Body *</label>
                <textarea
                  rows={4}
                  required
                  value={instDesc}
                  onChange={(e) => setInstDesc(e.target.value)}
                  placeholder="Enter detailed directives issued by Quality Enhancement Cell..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInstructionModal(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  {editingInstruction ? 'Update Instruction' : 'Publish Instruction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Instructions Viewer Modal */}
      {selectedInstructionView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#1E7B4E] text-white rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Official QEC Submission Guidelines</h3>
                  <p className="text-3xs text-slate-500">University of Education, Attock Campus</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInstructionView(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-3xs font-medium flex items-center justify-between">
                <span><strong>Notice:</strong> These guidelines are managed and published directly by System Administrators.</span>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setSelectedInstructionView(false);
                      handleOpenAddInstruction();
                    }}
                    className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg text-3xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {instructionsList.map((inst, i) => (
                <div key={inst.id} className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs">
                      {i + 1}. {inst.title} ({inst.directiveNo})
                    </h4>
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedInstructionView(false);
                            handleOpenEditInstruction(inst);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-bold text-3xs flex items-center gap-0.5 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteInstruction(inst.id, inst.title)}
                          className="text-rose-600 hover:text-rose-800 font-bold text-3xs flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-slate-600 text-3xs font-normal">{inst.description}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-3xs text-slate-500 font-mono">QEC Policy Ver 2026.1</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedInstructionView(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownload('Official Guidelines Manual', 'QEC_Course_File_Guidelines_2026.pdf')}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
