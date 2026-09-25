import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { FeedbackItem } from '../../types';
import { MessageSquare, Plus, CheckCircle, X } from 'lucide-react';

interface FeedbackModuleProps {
  activeModule?: string;
}

export const FeedbackModule: React.FC<FeedbackModuleProps> = ({ activeModule }) => {
  const { feedbackList, submitFeedback, respondToFeedback } = useCFMS();
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (activeModule === 'Suggestions') {
      setSubject('System Enhancement Suggestion');
      setShowModal(true);
    } else if (activeModule === 'Bug Reports') {
      setSubject('System Technical Issue / Bug Report');
      setShowModal(true);
    }
  }, [activeModule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    submitFeedback({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      departmentName: currentUser.departmentName,
      subject,
      message
    });

    setShowModal(false);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-heading text-slate-900">Faculty & System Feedback</h2>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Feedback</span>
        </button>
      </div>

      <div className="space-y-4">
        {feedbackList.map((fb) => (
          <div key={fb.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900">{fb.subject}</span>
                <p className="text-3xs text-slate-400">By {fb.senderName} ({fb.senderRole}) • {fb.createdAt}</p>
              </div>
              <span
                className={`px-2.5 py-0.5 text-3xs font-bold rounded-full ${
                  fb.status === 'Resolved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : fb.status === 'In Progress'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-indigo-100 text-indigo-800'
                }`}
              >
                {fb.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{fb.message}</p>

            {fb.response && (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                <span className="text-3xs font-bold text-indigo-900">Admin Response:</span>
                <p className="text-xs text-indigo-800">{fb.response}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Submit System Feedback / Issue</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Details *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter message details"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                >
                  Submit Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
