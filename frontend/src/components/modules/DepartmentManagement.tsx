import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { Department, User } from '../../types';
import { ActionButton } from '../common/ActionButton';
import {
  Building2, Plus, Users, BookOpen, BarChart2, Edit2,
  CheckCircle2, TrendingUp, UserCheck, AlertTriangle,
  Mail, ShieldCheck, X
} from 'lucide-react';

interface DepartmentManagementProps {
  activeModule?: string;
}

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({ activeModule }) => {
  const { departments, createDepartment, assignDepartmentHOD, usersList } = useCFMS();
  const [showModal, setShowModal] = useState(false);
  const [assignModalDept, setAssignModalDept] = useState<Department | null>(null);
  const [selectedHodId, setSelectedHodId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Department fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hodName, setHodName] = useState('');
  const [building, setBuilding] = useState('');

  const isStatsView = activeModule === 'Department Statistics';

  useEffect(() => {
    if (activeModule === 'Create Department') {
      setShowModal(true);
    }
  }, [activeModule]);

  // Eligible users who can be assigned as HOD (teachers, faculty, current HODs)
  const eligibleFaculty = usersList.filter(
    (u) => u.role === 'HOD' || u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER'
  );

  const deptsWithHOD = departments.filter((d) => !!d.hodName && !!d.hodId).length;
  const deptsWithoutHOD = departments.length - deptsWithHOD;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    createDepartment({
      code,
      name,
      hodId: `user-${Date.now()}`,
      hodName,
      facultyCount: 10,
      courseCount: 15,
      submissionRate: 90.0,
      building
    });
    setShowModal(false);
    setName('');
    setCode('');
    setHodName('');
    setBuilding('');
    setToastMessage(`Department ${name} created successfully.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenAssignModal = (dept: Department) => {
    setAssignModalDept(dept);
    setSelectedHodId(dept.hodId || '');
  };

  const handleAssignHOD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalDept || !selectedHodId) return;

    const selectedUser = usersList.find((u) => u.id === selectedHodId);
    if (!selectedUser) return;

    const success = await assignDepartmentHOD(assignModalDept.id, selectedUser.id, selectedUser.name);
    if (success) {
      setToastMessage(`Assigned ${selectedUser.name} as HOD of ${assignModalDept.name}.`);
      setAssignModalDept(null);
      setSelectedHodId('');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold font-heading text-slate-900">
            {isStatsView ? 'Department Statistics & Compliance Analytics' : 'Campus Department & HOD Management'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer academic departments and assign designated Department Heads (HODs) for teacher approval routing.
          </p>
        </div>
        <ActionButton
          variant="primary"
          label="Add Department"
          onClick={() => setShowModal(true)}
          size="md"
        />
      </div>

      {/* KPI Cards: Total, With HOD, Without HOD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-3xs font-mono font-extrabold uppercase tracking-wider text-slate-400">Total Departments</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{departments.length}</span>
            <Building2 className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-3xs text-slate-500">Active university academic departments</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-3xs font-mono font-extrabold uppercase tracking-wider text-emerald-600">Departments with HOD</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-700">{deptsWithHOD}</span>
            <ShieldCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <p className="text-3xs text-slate-500">HOD assigned & active for approval routing</p>
        </div>

        <div className={`rounded-2xl border p-5 shadow-2xs space-y-1 ${
          deptsWithoutHOD > 0 ? 'bg-amber-50/60 border-amber-300' : 'bg-white border-slate-200'
        }`}>
          <span className="text-3xs font-mono font-extrabold uppercase tracking-wider text-amber-700">Departments Without HOD</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-amber-900">{deptsWithoutHOD}</span>
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-3xs text-amber-800">
            {deptsWithoutHOD > 0 ? 'Requires HOD assignment for teacher requests' : 'All departments have assigned HODs'}
          </p>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => {
          const hasHOD = !!(dept.hodId && dept.hodName);
          const hodUser = usersList.find(
            (u) => u.id === dept.hodId || (dept.hodName && u.name.toLowerCase() === dept.hodName.toLowerCase())
          );
          const hodEmail = hodUser?.email || (hasHOD ? `${dept.code.toLowerCase()}.hod@ue.edu.pk` : 'No Email');

          return (
            <div key={dept.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                      {dept.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{dept.name}</h3>
                      <p className="text-3xs text-slate-400">{dept.building || 'Campus Academic Block'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-3xs font-bold rounded-full border ${
                    hasHOD
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {hasHOD ? '✓ HOD Assigned' : '⚠️ No HOD Assigned'}
                  </span>
                </div>

                {/* HOD Details Box */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider">Current HOD:</span>
                    <span className="font-extrabold text-slate-900">
                      {hasHOD ? `Prof. ${dept.hodName}` : <span className="text-rose-600 font-bold">Unassigned</span>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-2xs">
                    <span className="text-slate-500 flex items-center gap-1 font-medium">
                      <Mail className="w-3 h-3 text-slate-400" /> HOD Email:
                    </span>
                    <span className="font-mono text-slate-700 font-semibold">{hasHOD ? hodEmail : '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-3xs text-slate-400 block">Faculty Members</span>
                    <span className="font-bold text-slate-800">{dept.facultyCount} Members</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-3xs text-slate-400 block">Active Courses</span>
                    <span className="font-bold text-slate-800">{dept.courseCount} Courses</span>
                  </div>
                </div>
              </div>

              {/* Assign / Change HOD Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenAssignModal(dept)}
                  className="px-3 py-1.5 bg-[#165534] hover:bg-[#1E7B4E] text-white font-bold text-xs rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{hasHOD ? 'Change Department HOD' : 'Assign Department HOD'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ASSIGN / CHANGE HOD MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {assignModalDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  Assign Head of Department (HOD)
                </h3>
                <p className="text-2xs text-slate-500 mt-0.5">
                  {assignModalDept.name} ({assignModalDept.code})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalDept(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignHOD} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium block text-2xs">Department Name:</span>
                <p className="font-bold text-slate-900">{assignModalDept.name}</p>
                <span className="text-slate-500 font-medium block text-2xs pt-1">Current Assigned HOD:</span>
                <p className="font-bold text-emerald-800">{assignModalDept.hodName || 'None (Unassigned)'}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Select New HOD from Faculty Roster <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedHodId}
                  onChange={(e) => setSelectedHodId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-xs"
                >
                  <option value="">-- Choose Faculty Member --</option>
                  {eligibleFaculty.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) • {u.role === 'HOD' ? 'HOD' : 'Faculty'}
                    </option>
                  ))}
                </select>
                <p className="text-3xs text-slate-400">
                  Only the assigned HOD will receive and review teacher registration requests for this department.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalDept(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedHodId}
                  className="px-5 py-2 bg-[#165534] hover:bg-[#1E7B4E] disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer"
                >
                  Confirm HOD Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CREATE DEPARTMENT MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Add Academic Department</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CS, IT, PHY, MATH"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Department of Computer Science"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Head of Department (HOD) Name</label>
                <input
                  type="text"
                  value={hodName}
                  onChange={(e) => setHodName(e.target.value)}
                  placeholder="Enter HOD name (or assign later)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Building Location</label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g. Academic Block B, 2nd Floor"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
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
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
