import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle, Plus, Users, BookOpen } from 'lucide-react';

interface CalendarViewProps {
  activeModule?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ activeModule }) => {
  const { deadlines, sessions } = useCFMS();
  const [currentMonth, setCurrentMonth] = useState('August 2026');
  const [activeTab, setActiveTab] = useState<'academic' | 'meetings' | 'deadlines'>('academic');

  // Schedule Modal State
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventCategory, setEventCategory] = useState<'academic' | 'meetings' | 'deadlines'>('meetings');
  const [eventDate, setEventDate] = useState('2026-08-15');
  const [eventTime, setEventTime] = useState('10:00');
  const [attendees, setAttendees] = useState('');

  useEffect(() => {
    if (activeModule === 'Meetings') {
      setActiveTab('meetings');
    } else if (activeModule === 'Deadlines' || activeModule === 'Course File Deadlines') {
      setActiveTab('deadlines');
    } else if (activeModule === 'Academic Calendar' || activeModule === 'Calendar') {
      setActiveTab('academic');
    }
  }, [activeModule]);

  const dl0 = deadlines && deadlines[0] ? deadlines[0] : null;
  const dl1 = deadlines && deadlines[1] ? deadlines[1] : null;
  const dl2 = deadlines && deadlines[2] ? deadlines[2] : null;

  const daysInMonth = [
    { day: 1, date: '2026-08-01', events: [{ title: 'Fall 2026 Course Catalog Release', category: 'academic' }] },
    { day: 2, date: '2026-08-02', events: [] },
    { day: 3, date: '2026-08-03', events: [{ title: 'HOD Departmental Sync Meeting', category: 'meetings' }] },
    { day: 4, date: '2026-08-04', events: [] },
    { day: 5, date: '2026-08-05', events: dl0 ? [{ title: dl0.title, category: 'deadlines' }] : [] },
    { day: 6, date: '2026-08-06', events: [] },
    { day: 7, date: '2026-08-07', events: [] },
    { day: 8, date: '2026-08-08', events: [] },
    { day: 9, date: '2026-08-09', events: [] },
    { day: 10, date: '2026-08-10', events: [{ title: 'QEC Formal Audit Review', category: 'academic' }] },
    { day: 11, date: '2026-08-11', events: [] },
    { day: 12, date: '2026-08-12', events: [{ title: 'Faculty Syllabus Committee Meeting', category: 'meetings' }] },
    { day: 13, date: '2026-08-13', events: [] },
    { day: 14, date: '2026-08-14', events: [] },
    { day: 15, date: '2026-08-15', events: dl1 ? [{ title: dl1.title, category: 'deadlines' }] : [] },
    { day: 16, date: '2026-08-16', events: [] },
    { day: 17, date: '2026-08-17', events: [] },
    { day: 18, date: '2026-08-18', events: [{ title: 'Visiting Faculty Review Board', category: 'meetings' }] },
    { day: 19, date: '2026-08-19', events: [] },
    { day: 20, date: '2026-08-20', events: [] },
    { day: 21, date: '2026-08-21', events: [] },
    { day: 22, date: '2026-08-22', events: [] },
    { day: 23, date: '2026-08-23', events: [] },
    { day: 24, date: '2026-08-24', events: [] },
    { day: 25, date: '2026-08-25', events: [] },
    { day: 26, date: '2026-08-26', events: [] },
    { day: 27, date: '2026-08-27', events: [] },
    { day: 28, date: '2026-08-28', events: dl2 ? [{ title: dl2.title, category: 'deadlines' }] : [] },
    { day: 29, date: '2026-08-29', events: [] },
    { day: 30, date: '2026-08-30', events: [] },
    { day: 31, date: '2026-08-31', events: [{ title: 'Visiting Faculty Contract Milestone', category: 'academic' }] }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Campus Academic Schedule
            </span>
            <span className="text-3xs text-slate-400 font-mono">Attock Campus</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Academic Calendar & Schedule ({activeModule || 'Academic Calendar'})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScheduleOpen(true)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting / Event</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          { id: 'academic', label: 'Academic Calendar', icon: BookOpen },
          { id: 'meetings', label: 'Meetings', icon: Users },
          { id: 'deadlines', label: 'Deadlines', icon: Clock }
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

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Calendar Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-[#1E7B4E]" />
            <h2 className="text-base font-extrabold font-heading text-slate-900">{currentMonth}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
              Today
            </button>
            <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-3xs font-bold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Academic Milestones</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Departmental Meetings</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>Submission Cutoffs</span>
          </span>
        </div>

        {/* Grid Days Header */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden text-center text-3xs font-extrabold text-slate-700 uppercase py-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden">
          {daysInMonth.map((item) => {
            const visibleEvents = item.events.filter(
              (ev) => activeTab === 'academic' || ev.category === activeTab
            );

            return (
              <div
                key={item.day}
                className={`bg-white min-h-[90px] p-2 flex flex-col justify-between hover:bg-slate-50/80 transition-colors ${
                  item.day === 24 ? 'ring-2 ring-emerald-600 bg-emerald-50/20' : ''
                }`}
              >
                <span
                  className={`text-2xs font-extrabold ${
                    item.day === 24
                      ? 'w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center'
                      : 'text-slate-700'
                  }`}
                >
                  {item.day}
                </span>

                <div className="space-y-1">
                  {visibleEvents.map((ev: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-1 rounded text-3xs font-bold truncate ${
                        ev.category === 'academic'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : ev.category === 'meetings'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                      }`}
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Meeting / Event Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">Schedule Meeting or Event</h3>
                <p className="text-xs text-slate-500">Create an entry in the university academic calendar.</p>
              </div>
              <button onClick={() => setIsScheduleOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">×</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Event "${eventTitle || 'New Event'}" scheduled successfully for ${eventDate}!`);
                setIsScheduleOpen(false);
                setEventTitle('');
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event / Meeting Title *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. HOD Departmental Sync Meeting"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                >
                  <option value="academic">Academic Calendar / Term Event</option>
                  <option value="meetings">Departmental / HOD Meeting</option>
                  <option value="deadlines">Course File Submission Deadline</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Attendees / Department</label>
                <input
                  type="text"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  placeholder="e.g. All HODs & Faculty Members"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" /> Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
