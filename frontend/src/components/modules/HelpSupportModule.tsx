import React, { useState, useEffect } from 'react';
import { HelpCircle, BookOpen, MessageSquare, PhoneCall, FileText, CheckCircle2, Send, Download, Search, ChevronDown, Clock, ShieldAlert, Sparkles, Mail } from 'lucide-react';

interface HelpSupportModuleProps {
  activeModule?: string;
}

export const HelpSupportModule: React.FC<HelpSupportModuleProps> = ({ activeModule }) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'faqs' | 'contact'>('docs');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Course File Upload Issue');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [ticketDescription, setTicketDescription] = useState('');

  // Accordion open/close state for FAQs
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    if (activeModule === 'FAQs') {
      setActiveTab('faqs');
    } else if (activeModule === 'Contact Support') {
      setActiveTab('contact');
    } else if (activeModule === 'Documentation' || activeModule === 'Help & Support') {
      setActiveTab('docs');
    }
  }, [activeModule]);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTicketSubject('');
    setTicketDescription('');
    setTimeout(() => setTicketSubmitted(false), 5000);
  };

  const faqList = [
    {
      q: 'How do I upload and resubmit a course file after an HOD revision request?',
      a: 'Navigate to Course File Management -> Upload Files or Revision Requests tab. Select the relevant course, attach your updated file, and submit. The system will automatically label it as Version 2.0 (v2.0) for HOD re-evaluation.'
    },
    {
      q: 'What happens when the semester submission window deadline closes?',
      a: 'Upload forms are automatically locked for regular faculty. If late submission windows are authorized by the Campus Administrator, files can still be submitted but will carry a "Late Submission" audit badge.'
    },
    {
      q: 'How are visiting faculty accounts managed upon contract completion?',
      a: 'Visiting faculty accounts feature automated contract-end expiration. Their submitted course files remain permanently archived in the department vault while user login permissions are revoked.'
    },
    {
      q: 'What file formats and size limits are supported for course files?',
      a: 'The system accepts PDF, DOCX, XLSX, PPTX, and ZIP archives up to 50 MB per file. High-resolution scanned documents should be compressed prior to upload.'
    },
    {
      q: 'How can an HOD digitally approve and stamp course file dossiers?',
      a: 'HODs navigate to Approval Management -> Pending Approvals. Review each item (Syllabus, Midterm, Quizzes, Final Papers), add optional review remarks, and click "Approve File". The system applies a cryptographic SHA-256 digital stamp.'
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Campus Helpdesk & QEC Knowledgebase
            </span>
            <span className="text-3xs text-slate-400 font-mono">Attock Campus</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Help & Support Documentation ({activeModule || 'Documentation'})
          </h1>
          <p className="text-xs text-slate-500">
            User workflow manuals, accreditation standards, FAQs, and IT support ticketing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Official CFMS User Guide PDF Downloaded.')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" /> Download User Manual PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'docs', label: '1. Workflow Manuals & Guidelines', icon: BookOpen },
            { id: 'faqs', label: '2. Frequently Asked Questions (FAQs)', icon: HelpCircle },
            { id: 'contact', label: '3. Contact IT Support Desk', icon: PhoneCall }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1E7B4E] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'docs' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>
        )}
      </div>

      {/* TAB 1: WORKFLOW MANUALS & DOCUMENTATION */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl w-fit">
                <BookOpen className="w-6 h-6 text-[#1E7B4E]" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">Faculty Upload Manual</h3>
              <p className="text-slate-600 leading-relaxed">
                Step-by-step walkthrough for faculty members to submit course outlines, lecture plans, midterm papers, and grading rubrics before term deadlines.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="p-3 bg-purple-50 text-purple-800 rounded-xl w-fit">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">HOD Approval Guidelines</h3>
              <p className="text-slate-600 leading-relaxed">
                Comprehensive guide for Head of Departments to evaluate file completeness, request revisions with remarks, and issue digital approval stamps.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="p-3 bg-indigo-50 text-indigo-800 rounded-xl w-fit">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">QEC Quality Standards</h3>
              <p className="text-slate-600 leading-relaxed">
                HEC Quality Enhancement Cell accreditation requirements, CLO-PLO mapping matrices, and end-of-semester course file audit criteria.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              Mandatory Course File Documents List (HEC Standard)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Course Outline & Syllabus',
                'Weekly Lecture Plan',
                'Midterm Question Paper & Key',
                'Final Examination Paper & Key',
                'Quizzes & Assignments Samples',
                'CLO-PLO Attainment Report',
                'Attendance & Result Sheets',
                'Lab Manual (Practical Courses)',
                'Student Feedback Summary'
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FREQUENTLY ASKED QUESTIONS */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">Frequently Asked Questions (FAQs)</h3>
            <p className="text-3xs text-slate-500">Quick answers to common questions about course files, approvals, and system access.</p>
          </div>

          <div className="space-y-3 text-xs">
            {faqList.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between font-extrabold text-slate-900 text-left cursor-pointer transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white border-t border-slate-100 text-slate-700 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT IT SUPPORT DESK */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Submit IT Support Ticket</h3>
              <p className="text-3xs text-slate-500">Need assistance? Send a message directly to the Attock Campus IT Helpdesk.</p>
            </div>

            {ticketSubmitted && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Support ticket submitted successfully! Ticket ID #TKT-8840 assigned to campus IT desk.</span>
              </div>
            )}

            <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Issue Category *</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Course File Upload Issue">Course File Upload Issue</option>
                    <option value="HOD Approval Workflow">HOD Approval Workflow</option>
                    <option value="Password & Login Problems">Password & Login Problems</option>
                    <option value="Account Permissions Request">Account Permissions Request</option>
                    <option value="Other Technical Glitch">Other Technical Glitch</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority Level *</label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Low">Low (General Query)</option>
                    <option value="Medium">Medium (Normal Urgency)</option>
                    <option value="High">High (Urgent Deadline Pending)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ticket Subject *</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Cannot upload PDF syllabus for CS-301"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Detailed Issue Description *</label>
                <textarea
                  rows={4}
                  required
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Describe what happened, any error messages, and course details..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" /> Submit Support Ticket
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <h3 className="font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-2">
                Attock Campus IT Helpdesk
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono font-bold">support.attock@ue.edu.pk</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <PhoneCall className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Ext. 4410 / IT Main Admin Office</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Mon - Fri (08:00 AM - 04:00 PM)</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-2 text-xs text-indigo-900">
              <div className="flex items-center gap-2 font-extrabold">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>QEC Quality Desk</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                For curriculum outcome queries or HEC accreditation policy questions, email <span className="font-mono font-bold text-indigo-800">qec.attock@ue.edu.pk</span>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
