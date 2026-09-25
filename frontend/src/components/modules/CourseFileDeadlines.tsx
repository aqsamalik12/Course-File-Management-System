import React, { useState } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { Clock, Plus, AlertCircle, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarView } from '../common/CalendarView';

interface CourseFileDeadlinesProps {
  activeModule?: string;
}

export const CourseFileDeadlines: React.FC<CourseFileDeadlinesProps> = ({ activeModule }) => {
  const { deadlines, createDeadline, categories, departments } = useCFMS();
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [gracePeriodDays, setGracePeriodDays] = useState(0);
  const [description, setDescription] = useState('');

  if (activeModule === 'Calendar View') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-heading text-slate-900">Academic & Deadline Calendar View</h2>
            <p className="text-xs text-slate-500">
              Interactive monthly view for submission cutoffs, academic milestones, and term dates.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Set New Deadline</span>
          </button>
        </div>
        <CalendarView />
      </div>
    );
  }

  const filteredDeadlines = deadlines.filter((dl) => {
    if (activeModule === 'Upcoming Deadlines') return dl.status === 'Upcoming';
    if (activeModule === 'Missed Deadlines') return dl.status === 'Missed' || dl.status === 'Overdue';
    if (activeModule === 'Completed Deadlines') return dl.status === 'Completed';
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    createDeadline({
      title,
      courseCode: 'ALL',
      category: 'Syllabus & Course Outline',
      departmentId: departments[0]?.id || 'dept-1',
      departmentName: departments[0]?.name || 'Department of Computer Science',
      dueDate,
      gracePeriodDays,
      status: 'Upcoming',
      description,
      targetRole: 'ALL'
    });

    setShowModal(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-heading text-slate-900">
            Course File Submission Deadlines ({activeModule || 'All Deadlines'})
          </h2>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Set New Deadline</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDeadlines.length === 0 ? (
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            <Clock className="w-8 h-8 text-indigo-600/40 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-xs">No deadlines found matching criteria ({activeModule})</p>
          </div>
        ) : (
          filteredDeadlines.map((dl) => (
            <div key={dl.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-700 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {dl.courseCode}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{dl.title}</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-3xs font-bold rounded-full ${
                    dl.status === 'Upcoming'
                      ? 'bg-amber-100 text-amber-800'
                      : dl.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {dl.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{dl.description}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-3xs font-semibold text-slate-500">
                <span className="flex items-center gap-1 text-slate-900 font-bold">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Due Date: {dl.dueDate}
                </span>
                <span>Grace Period: +{dl.gracePeriodDays} Days</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Set Submission Deadline</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Deadline Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter deadline title"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 font-semibold cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grace Days</label>
                  <input
                    type="number"
                    value={gracePeriodDays}
                    onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                    placeholder="Enter grace days"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Guidelines</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description and guidelines"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
