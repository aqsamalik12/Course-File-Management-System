import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { Megaphone, Plus, Pin, AlertCircle, Calendar, Clock, Archive, Send, CheckCircle2 } from 'lucide-react';

interface AnnouncementsModuleProps {
  activeModule?: string;
}

export const AnnouncementsModule: React.FC<AnnouncementsModuleProps> = ({ activeModule }) => {
  const { announcements, createAnnouncement } = useCFMS();
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  useEffect(() => {
    if (activeModule === 'Create Announcement') {
      setShowModal(true);
    }
  }, [activeModule]);

  const filteredAnnouncements = announcements.filter((a) => {
    if (activeModule === 'Scheduled') {
      return a.status === 'Scheduled' || (a.scheduledDate && a.status !== 'Archived');
    }
    if (activeModule === 'Archived Announcements' || activeModule === 'Archived') {
      return a.status === 'Archived' || a.priority === 'Low';
    }
    return a.status !== 'Archived';
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    createAnnouncement({
      title,
      content,
      authorName: currentUser?.name || 'Prof. Dr. Muhammad Aslam',
      authorRole: currentUser?.role || 'ADMIN',
      targetDepartmentId: 'ALL',
      targetRole: 'ALL',
      priority,
      status: isScheduled ? 'Scheduled' : 'Published',
      scheduledDate: isScheduled ? scheduledDate : undefined,
      isPinned: priority === 'High' || priority === 'Urgent'
    });

    setShowModal(false);
    setTitle('');
    setContent('');
    setIsScheduled(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Campus Broadcast Center
            </span>
            <span className="text-3xs text-slate-400 font-mono">Official Notices</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Announcements & Broadcasts ({activeModule || 'All Announcements'})
          </h1>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 space-y-2">
            <Megaphone className="w-8 h-8 text-indigo-600/30 mx-auto" />
            <p className="font-bold text-slate-800">No announcements found matching ({activeModule || 'Scheduled'}).</p>
            <p className="text-3xs text-slate-400">Scheduled broadcasts and notices will be listed here.</p>
          </div>
        ) : (
          filteredAnnouncements.map((anc) => (
            <div key={anc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {anc.isPinned && <Pin className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />}
                  <h3 className="text-sm font-extrabold text-slate-900">{anc.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {anc.status === 'Scheduled' && (
                    <span className="px-2.5 py-0.5 text-3xs font-extrabold bg-purple-100 text-purple-900 border border-purple-300 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Scheduled: {anc.scheduledDate}
                    </span>
                  )}

                  <span
                    className={`px-2.5 py-0.5 text-3xs font-extrabold rounded-full border ${
                      anc.priority === 'Urgent'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : anc.priority === 'High'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : anc.priority === 'Medium'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {anc.priority} Priority
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{anc.content}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-3xs text-slate-400 font-medium">
                <span>Author: <strong>{anc.authorName}</strong> ({anc.authorRole})</span>
                <div className="flex items-center gap-3">
                  <span>Created: <strong>{anc.createdDate}</strong></span>
                  {anc.status === 'Scheduled' && (
                    <button
                      onClick={() => alert(`Announcement "${anc.title}" published immediately!`)}
                      className="px-2.5 py-1 text-3xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" /> Publish Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Publish Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">Create Campus Announcement</h3>
                <p className="text-xs text-slate-500">Publish immediately or schedule for a future release date.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter announcement title"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent Priority (Broadcast Alert)</option>
                </select>
              </div>

              {/* Scheduling Options */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span>Schedule for Future Release Date</span>
                </label>

                {isScheduled && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Release Date *</label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-slate-800 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Announcement Message *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter announcement message"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  {isScheduled ? 'Schedule Announcement' : 'Publish Notice Immediately'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
