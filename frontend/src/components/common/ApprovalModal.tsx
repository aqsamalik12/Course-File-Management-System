import React, { useState } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { CourseFileItem, FileStatus } from '../../types';
import { REQUIRED_DOCUMENT_CHECKLIST } from '../../data/mockData';
import {
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  FileText,
  Download,
  History,
  FileCheck2,
  Check,
  ChevronRight,
  ShieldCheck,
  FolderArchive
} from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: CourseFileItem | null;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  file
}) => {
  const { updateFileStatus } = useCFMS();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'preview' | 'decision'>('preview');
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<FileStatus>('Approved');
  const [remarks, setRemarks] = useState('');

  if (!isOpen || !file) return null;

  const handleAction = () => {
    // Map status properly
    const finalStatus =
      selectedStatus === 'Revision Requested' ? 'Returned for Revision' : selectedStatus;
    updateFileStatus(file.id, finalStatus, remarks, currentUser?.name || 'HOD');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#1E7B4E] text-white rounded-xl shadow-2xs">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold text-[#1E7B4E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {file.courseCode}
                </span>
                <span className="text-3xs font-bold bg-white text-slate-700 px-2 py-0.5 rounded border">
                  Version {file.currentVersion}
                </span>
                <span className="text-3xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                  {file.status}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">{file.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Toggle */}
            <div className="bg-slate-200/70 p-1 rounded-xl flex gap-1 text-3xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'preview' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-[#1E7B4E]" />
                <span>Document Package Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('decision')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'decision' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>HOD Review & Signoff</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'preview' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: 10 Mandatory Document Sections */}
              <div className="md:col-span-5 space-y-2 border-r pr-4 border-slate-200">
                <h4 className="text-2xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                  <span>Compiled Package Sections (10/10)</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    100% Complete
                  </span>
                </h4>

                <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                  {REQUIRED_DOCUMENT_CHECKLIST.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedSectionIdx(idx)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                        selectedSectionIdx === idx
                          ? 'bg-[#1E7B4E] text-white border-[#165534] shadow-xs'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full text-3xs font-mono font-bold flex items-center justify-center shrink-0 ${
                            selectedSectionIdx === idx ? 'bg-white text-[#165534]' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="line-clamp-1">
                          <p className="font-bold text-2xs leading-snug">{item.name}</p>
                          <p
                            className={`text-3xs line-clamp-1 ${
                              selectedSectionIdx === idx ? 'text-emerald-100' : 'text-slate-400'
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${selectedSectionIdx === idx ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: PDF Section Document Viewer Simulation */}
              <div className="md:col-span-7 space-y-4">
                <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-3xs font-mono font-extrabold text-emerald-400 uppercase tracking-wider">
                      Previewing Section {selectedSectionIdx + 1} of 10
                    </span>
                    <h5 className="text-xs font-bold text-white mt-0.5">
                      {REQUIRED_DOCUMENT_CHECKLIST[selectedSectionIdx].name}
                    </h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Downloading Section ${selectedSectionIdx + 1} PDF file excerpt`)}
                    className="px-3 py-1.5 text-3xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Excerpt</span>
                  </button>
                </div>

                {/* Simulated High-Res Document Preview Box */}
                <div className="bg-slate-100 border border-slate-300 rounded-xl p-6 min-h-[320px] flex flex-col items-center justify-center text-center space-y-3 font-sans relative">
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-md w-full max-w-md p-6 text-left space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-3xs font-extrabold text-[#165534] uppercase font-mono">
                        UNIVERSITY OF EDUCATION, LAHORE
                      </span>
                      <span className="text-3xs text-slate-400 font-mono">Spring 2026 Session</span>
                    </div>

                    <div className="space-y-1">
                      <h6 className="text-xs font-extrabold text-slate-900">
                        {REQUIRED_DOCUMENT_CHECKLIST[selectedSectionIdx].name}
                      </h6>
                      <p className="text-3xs text-slate-500">
                        Course Code: <strong className="text-slate-800">{file.courseCode}</strong> | Instructor:{' '}
                        <strong className="text-slate-800">{file.teacherName}</strong>
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-3xs text-slate-600 leading-relaxed space-y-1.5 font-mono">
                      <p className="font-bold text-slate-800">Verified Section Metadata:</p>
                      <p>✓ Description: {REQUIRED_DOCUMENT_CHECKLIST[selectedSectionIdx].description}</p>
                      <p>✓ Quality Verification Status: Compliant with QEC Standards</p>
                      <p>✓ Digital Timestamp: {file.uploadDate} 10:00:00 EST</p>
                      <p>✓ Version SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
                    </div>

                    <div className="pt-2 text-3xs text-slate-400 flex items-center justify-between border-t border-slate-100">
                      <span>Official CFMS Audit Stamp</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-2xs text-slate-500">
                  <span>File Package Size: <strong>{file.fileSize}</strong></span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('decision')}
                    className="text-xs font-bold text-[#1E7B4E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Proceed to Review Decision</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 max-w-xl mx-auto">
              {/* File Brief */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-slate-900">{file.teacherName}</p>
                  <p className="text-3xs text-slate-500">{file.departmentName}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 font-bold rounded-md bg-white border border-emerald-300 text-emerald-800">
                    {file.courseCode}
                  </span>
                  <p className="text-3xs text-slate-500 mt-1">Current Version: {file.currentVersion}</p>
                </div>
              </div>

              {/* Select Decision */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-900">Select HOD Review Decision *</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('Approved')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selectedStatus === 'Approved'
                        ? 'bg-emerald-50 border-[#1E7B4E] text-[#165534] ring-2 ring-[#1E7B4E]/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5 text-[#165534]" />
                    <span>Approve & Archive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('Revision Requested')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selectedStatus === 'Revision Requested'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span>Return for Revision</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('Rejected')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selectedStatus === 'Rejected'
                        ? 'bg-red-50 border-red-500 text-red-900 ring-2 ring-red-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span>Reject Submission</span>
                  </button>
                </div>
              </div>

              {/* HOD Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>HOD Review Feedback & Changelog Comments</span>
                  <span className="text-3xs text-slate-400 font-normal">Sent via Auto Notification</span>
                </label>
                <textarea
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Approved. Complete course file conforms to QEC guidelines. OR Please update Quiz #3 solution key and re-upload."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E7B4E] outline-none text-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-3xs text-slate-500">
            {activeTab === 'preview' ? 'Click "Proceed to Review Decision" to approve or request revision.' : 'Notification will be dispatched immediately.'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Cancel
            </button>

            {activeTab === 'preview' ? (
              <button
                onClick={() => setActiveTab('decision')}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Proceed to Decision</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleAction}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-2xs cursor-pointer ${
                  selectedStatus === 'Approved'
                    ? 'bg-[#1E7B4E] hover:bg-[#165534]'
                    : selectedStatus === 'Revision Requested'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm Review Decision
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
