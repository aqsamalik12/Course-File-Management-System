import React from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { useAuth } from '../../context/AuthContext';
import { DataTable, Column } from '../common/DataTable';
import { User } from '../../types';
import { Users, Clock, Briefcase } from 'lucide-react';

interface HODTeachersProps {
  activeModule?: string;
}

export const HODTeachers: React.FC<HODTeachersProps> = ({ activeModule }) => {
  const { usersList, courseFiles, courses } = useCFMS();
  const { currentUser } = useAuth();

  const [reminderToast, setReminderToast] = React.useState<string | null>(null);
  const [assignModalTeacher, setAssignModalTeacher] = React.useState<User | null>(null);
  const [selectedCourse, setSelectedCourse] = React.useState('');

  const deptTeachers = usersList.filter((u) => {
    const isDeptMatch = u.departmentId === currentUser?.departmentId || u.departmentName === currentUser?.departmentName || !currentUser?.departmentId;
    const isRoleMatch = u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER';
    const isApproved = u.enrollmentStatus === 'Approved' || (u.enrollmentStatus === undefined && u.profileFormSubmitted);
    
    if (!isRoleMatch || !isApproved) return false;

    if (activeModule === 'Regular Teachers') return u.role === 'REGULAR_TEACHER' && isDeptMatch;
    if (activeModule === 'Visiting Teachers') return u.role === 'VISITING_TEACHER' && isDeptMatch;
    return isDeptMatch;
  });

  const handleSendReminder = (teacherName: string) => {
    setReminderToast(`Reminder notification sent to ${teacherName} regarding course file submission deadlines.`);
    setTimeout(() => setReminderToast(null), 4000);
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Faculty Name',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
          <span className="font-bold text-slate-900">{u.name}</span>
        </div>
      )
    },
    {
      key: 'designation',
      header: 'Designation',
      sortable: true,
      render: (u) => <span className="text-xs font-semibold text-slate-700">{u.designation || 'Lecturer'}</span>
    },
    {
      key: 'role',
      header: 'Faculty Type',
      sortable: true,
      render: (u) => (
        <span
          className={`whitespace-nowrap inline-flex items-center px-2.5 py-0.5 rounded-full text-3xs font-bold border shadow-2xs ${
            u.role === 'VISITING_TEACHER'
              ? 'bg-amber-50 text-amber-800 border-amber-200/80'
              : 'bg-blue-50 text-blue-700 border-blue-200/80'
          }`}
        >
          {u.role === 'VISITING_TEACHER' ? 'Visiting Faculty' : 'Regular Faculty'}
        </span>
      )
    },
    {
      key: 'email',
      header: 'Email / Contact',
      sortable: true,
      render: (u) => <span className="text-2xs font-mono text-slate-700">{u.email}</span>
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (u) => (
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-3xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {u.status}
          </span>
          {u.role === 'VISITING_TEACHER' && u.contractEndDate && (
            <p className="text-3xs text-amber-700 font-semibold mt-0.5 font-mono">
              Contract End: {u.contractEndDate}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (u) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => setAssignModalTeacher(u)}
            className="px-2.5 py-1 text-3xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-all cursor-pointer"
          >
            Assign Course
          </button>
          <button
            onClick={() => handleSendReminder(u.name)}
            className="px-2.5 py-1 text-3xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200 transition-all cursor-pointer"
          >
            Send Reminder
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Department Faculty Roster
            </span>
            <span className="text-3xs text-slate-400 font-mono">{currentUser?.departmentName}</span>
          </div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 mt-1">
            Department Faculty Members ({activeModule || 'All Teachers'})
          </h2>
        </div>
      </div>

      {reminderToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-xs animate-fade-in">
          <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{reminderToast}</span>
        </div>
      )}

      <DataTable
        data={deptTeachers.length > 0 ? deptTeachers : usersList.filter(u => u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER')}
        columns={columns}
        searchPlaceholder="Search department teachers by name, email, designation..."
      />

      {/* Assign Course Modal */}
      {assignModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">Assign Course to {assignModalTeacher.name}</h3>
                <p className="text-xs text-slate-500">{assignModalTeacher.designation} • {currentUser?.departmentName}</p>
              </div>
              <button onClick={() => setAssignModalTeacher(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">×</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setReminderToast(`Assigned course to ${assignModalTeacher.name} successfully.`);
                setAssignModalTeacher(null);
                setTimeout(() => setReminderToast(null), 4000);
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Department Course *</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} - {c.title} ({c.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalTeacher(null)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#1E7B4E] hover:bg-[#165534] rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  Confirm Course Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
