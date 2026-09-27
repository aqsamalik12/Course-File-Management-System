import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { Department, Campus, User, HODAssignment } from '../../types';
import { ActionButton } from '../common/ActionButton';
import {
  Building2, Plus, Users, BookOpen, BarChart2, Edit2,
  CheckCircle2, TrendingUp, UserCheck, AlertTriangle,
  Mail, ShieldCheck, X, MapPin, Compass, Trash2, Landmark,
  Shield, ToggleLeft, ToggleRight, Calendar, Key, Eye, EyeOff,
  Lock, RefreshCw, Sparkles
} from 'lucide-react';

interface HODManagementProps {
  activeModule?: string;
}

export const HODManagementModule: React.FC<HODManagementProps> = ({ activeModule }) => {
  const {
    departments,
    createDepartment,
    assignDepartmentHOD,
    usersList,
    campuses,
    createCampus,
    deleteCampus,
    hodAssignments,
    createHODAssignment,
    updateHODAssignment,
    deleteHODAssignment,
    resetHODPassword
  } = useCFMS();

  const [activeTab, setActiveTab] = useState<'DEPARTMENTS' | 'CAMPUSES' | 'HOD_ASSIGNMENTS'>('DEPARTMENTS');
  const [campusSubTab, setCampusSubTab] = useState<'ALL' | 'ADD'>('ALL');
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [showAssignScopeModal, setShowAssignScopeModal] = useState(false);
  const [assignModalDept, setAssignModalDept] = useState<Department | null>(null);
  const [selectedHodId, setSelectedHodId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 5-Step HOD Assignment Form State
  const [scopeCampusId, setScopeCampusId] = useState('');
  const [scopeDeptId, setScopeDeptId] = useState('');
  const [scopeHodMode, setScopeHodMode] = useState<'SELECT' | 'CREATE'>('SELECT');
  const [scopeHodId, setScopeHodId] = useState('');
  const [scopeHodName, setScopeHodName] = useState('');
  const [scopeEmail, setScopeEmail] = useState('');
  const [scopePassword, setScopePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [scopeSession, setScopeSession] = useState('Fall 2026');
  const [scopeStatus, setScopeStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isSubmittingScope, setIsSubmittingScope] = useState(false);

  // Reset Password Modal State
  const [resetModalAssignment, setResetModalAssignment] = useState<HODAssignment | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);

  // Department Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [hodName, setHodName] = useState('');
  const [building, setBuilding] = useState('');
  const [selectedCampusForDept, setSelectedCampusForDept] = useState('Attock Campus');

  // Campus Form Fields
  const [newCampusName, setNewCampusName] = useState('');
  const [newCampusCode, setNewCampusCode] = useState('');
  const [newCampusCity, setNewCampusCity] = useState('');
  const [newCampusAddress, setNewCampusAddress] = useState('');
  const [newCampusDirector, setNewCampusDirector] = useState('');

  const isStatsView = activeModule === 'Department Statistics';

  useEffect(() => {
    if (activeModule === 'Create Department') {
      setActiveTab('DEPARTMENTS');
      setShowDeptModal(true);
    } else if (activeModule === 'Campus Management' || activeModule === 'All Campuses' || activeModule === 'Campuses') {
      setActiveTab('CAMPUSES');
      setCampusSubTab('ALL');
      setShowCampusModal(false);
    } else if (activeModule === 'Add Campus') {
      setActiveTab('CAMPUSES');
      setCampusSubTab('ADD');
      setShowCampusModal(false);
    } else if (activeModule === 'HOD Management' || activeModule === 'HOD Assignments' || activeModule === 'HOD Access & Permissions' || activeModule === 'HOD Access Control') {
      setActiveTab('HOD_ASSIGNMENTS');
    } else if (activeModule === 'Assign HOD' || activeModule === 'Reassign HOD') {
      setActiveTab('HOD_ASSIGNMENTS');
      setShowAssignScopeModal(true);
    } else if (activeModule === 'Reset HOD Password') {
      setActiveTab('HOD_ASSIGNMENTS');
    } else if (activeModule === 'Department Management' || activeModule === 'All Departments') {
      setActiveTab('DEPARTMENTS');
    }
  }, [activeModule]);

  // Eligible users who can be assigned as HOD
  const eligibleFaculty = usersList.filter(
    (u) => u.role === 'HOD' || u.role === 'REGULAR_TEACHER' || u.role === 'VISITING_TEACHER'
  );

  const deptsWithHOD = departments.filter((d) => !!d.hodName && !!d.hodId).length;
  const deptsWithoutHOD = departments.length - deptsWithHOD;

  const handleCreateDepartment = (e: React.FormEvent) => {
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
      building,
      campusName: selectedCampusForDept
    });
    setShowDeptModal(false);
    setName('');
    setCode('');
    setHodName('');
    setBuilding('');
    setToastMessage(`Department "${name}" created successfully for ${selectedCampusForDept}.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampusName.trim()) return;
    await createCampus({
      name: newCampusName.trim(),
      code: newCampusCode.trim() || `UE-${newCampusName.slice(0, 3).toUpperCase()}`,
      city: newCampusCity.trim() || 'Punjab',
      address: newCampusAddress.trim() || 'University Campus, Punjab, Pakistan',
      directorName: newCampusDirector.trim() || 'Campus Director',
      status: 'Active'
    });
    setShowCampusModal(false);
    setNewCampusName('');
    setNewCampusCode('');
    setNewCampusCity('');
    setNewCampusAddress('');
    setNewCampusDirector('');
    setCampusSubTab('ALL');
    setToastMessage(`Campus "${newCampusName}" added successfully.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDeleteCampus = async (campusId: string, campusName: string) => {
    if (window.confirm(`Are you sure you want to remove ${campusName}?`)) {
      await deleteCampus(campusId);
      setToastMessage(`Campus "${campusName}" removed.`);
      setTimeout(() => setToastMessage(null), 4000);
    }
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

  const handleCreateScopeAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scopeCampusId) {
      alert('Step 1 Required: Please select a Campus.');
      return;
    }
    if (!scopeDeptId) {
      alert('Step 2 Required: Please select a Department.');
      return;
    }
    const finalHodName = scopeHodMode === 'SELECT'
      ? (usersList.find((u) => u.id === scopeHodId)?.name || scopeHodName)
      : scopeHodName;

    if (!finalHodName || !finalHodName.trim()) {
      alert('Step 3 Required: Please select or enter the HOD full name.');
      return;
    }

    if (!scopeEmail || !scopeEmail.trim()) {
      alert('Step 4 Required: Please provide an HOD Email for login credentials.');
      return;
    }

    if (scopeHodMode === 'CREATE' && (!scopePassword || scopePassword.length < 6)) {
      alert('Step 4 Required: Password must be at least 6 characters long.');
      return;
    }

    const campObj = campuses.find((c) => c.id === scopeCampusId || c.name === scopeCampusId);
    const deptObj = departments.find((d) => d.id === scopeDeptId || d.name === scopeDeptId);

    if (!campObj || !deptObj) {
      alert('Invalid Campus or Department selected.');
      return;
    }

    setIsSubmittingScope(true);
    try {
      const finalHodId = scopeHodMode === 'SELECT' && scopeHodId ? scopeHodId : `usr-hod-${Date.now()}`;
      const result = await createHODAssignment({
        hodId: finalHodId,
        hodName: finalHodName.trim(),
        email: scopeEmail.trim(),
        password: scopePassword.trim() || undefined,
        campusId: campObj.id,
        campusName: campObj.name,
        departmentId: deptObj.id,
        departmentName: deptObj.name,
        academicSession: scopeSession,
        status: scopeStatus,
        assignedDate: new Date().toISOString()
      });

      if (result.success) {
        setToastMessage(`Assigned ${finalHodName} as HOD for ${deptObj.name} at ${campObj.name}. Login credentials created.`);
        setShowAssignScopeModal(false);
        setScopeHodId('');
        setScopeHodName('');
        setScopeEmail('');
        setScopePassword('');
        setScopeCampusId('');
        setScopeDeptId('');
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        alert(result.message || 'Failed to save HOD assignment. Please verify the email and details.');
      }
    } finally {
      setIsSubmittingScope(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalAssignment) return;
    if (!resetNewPassword || resetNewPassword.length < 6) {
      alert('New password must be at least 6 characters long.');
      return;
    }
    setIsSubmittingReset(true);
    try {
      const success = await resetHODPassword(resetModalAssignment.id, resetNewPassword);
      if (success) {
        setToastMessage(`Password reset successfully for ${resetModalAssignment.hodName}.`);
        setResetModalAssignment(null);
        setResetNewPassword('');
        setTimeout(() => setToastMessage(null), 4000);
      } else {
        alert('Failed to reset HOD password.');
      }
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleToggleScopeStatus = async (assignId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    await updateHODAssignment(assignId, { status: nextStatus as any });
    setToastMessage(`Scope assignment status updated to ${nextStatus}.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteScopeAssignment = async (assignId: string, hodName: string, deptName: string) => {
    if (window.confirm(`Are you sure you want to remove HOD assignment for ${hodName} (${deptName})?`)) {
      await deleteHODAssignment(assignId);
      setToastMessage(`HOD scope assignment removed.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-heading text-slate-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-700" />
            {activeTab === 'DEPARTMENTS'
              ? 'Campus Department & HOD Management'
              : activeTab === 'CAMPUSES'
              ? (campusSubTab === 'ALL' ? 'University of Education Campuses' : 'Add New University Campus')
              : 'HOD Scope Assignments (Campus + Department)'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTab === 'DEPARTMENTS'
              ? 'Administer academic departments and assign designated Department Heads (HODs) for teacher approval routing.'
              : activeTab === 'CAMPUSES'
              ? (campusSubTab === 'ALL' ? 'Viewing all registered University of Education campuses across Punjab.' : 'Register a new campus location for teacher enrollment and departmental assignments.')
              : 'Define strict Campus + Department isolation scopes for HODs. Teachers are automatically routed to these assigned HODs.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'DEPARTMENTS' && (
            <ActionButton
              variant="primary"
              label="+ Add Department"
              onClick={() => setShowDeptModal(true)}
              size="md"
            />
          )}
          {activeTab === 'CAMPUSES' && campusSubTab === 'ADD' && (
            <button
              onClick={() => setCampusSubTab('ALL')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>← View All Campuses</span>
            </button>
          )}
          {activeTab === 'HOD_ASSIGNMENTS' && (
            <button
              onClick={() => setShowAssignScopeModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Assign HOD to Scope</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('DEPARTMENTS')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'DEPARTMENTS'
              ? 'bg-[#165534] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Academic Departments ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CAMPUSES')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'CAMPUSES'
              ? 'bg-[#165534] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>UE Campuses ({campuses.length})</span>
          <span className="px-1.5 py-0.5 text-3xs font-extrabold bg-amber-400 text-amber-950 rounded-full">
            Admin Controlled
          </span>
        </button>

        <button
          onClick={() => setActiveTab('HOD_ASSIGNMENTS')}
          className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'HOD_ASSIGNMENTS'
              ? 'bg-[#165534] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>HOD Scope Assignments ({hodAssignments.length})</span>
          <span className="px-1.5 py-0.5 text-3xs font-extrabold bg-emerald-400 text-emerald-950 rounded-full">
            Security Isolation
          </span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1: DEPARTMENTS & HOD MANAGEMENT
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="space-y-6 animate-fade-in">
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
              const campusTag = dept.campusName || 'Attock Campus';

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
                          <p className="text-3xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span className="font-semibold text-slate-600">{campusTag}</span> • {dept.building || 'Academic Block'}
                          </p>
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
                          {hasHOD ? (
                            <span className="text-emerald-800 font-black">{dept.hodName}</span>
                          ) : (
                            <span className="text-rose-600 font-bold">Unassigned</span>
                          )}
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
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-3xs text-slate-400 font-medium">
                      Routing Target for New Teachers
                    </span>
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
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2: UNIVERSITY OF EDUCATION CAMPUSES MANAGEMENT
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'CAMPUSES' && (
        <div className="space-y-6 animate-fade-in">
          {/* Sub-Tabs for Campuses */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl w-fit border border-slate-200">
            <button
              onClick={() => setCampusSubTab('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                campusSubTab === 'ALL'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>All Campuses ({campuses.length})</span>
            </button>
            <button
              onClick={() => setCampusSubTab('ADD')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                campusSubTab === 'ADD'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Campus</span>
            </button>
          </div>

          {/* VIEW 1: ALL CAMPUSES (Only Campuses Listed - NO Add Button) */}
          {campusSubTab === 'ALL' && (
            <div className="space-y-6 animate-fade-in">
              {/* Campuses Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
                  <span className="text-3xs font-mono font-extrabold uppercase tracking-wider text-slate-400">Total Campuses</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-900">{campuses.length}</span>
                    <Landmark className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-3xs text-slate-500">University of Education provincial branches</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
                  <span className="text-3xs font-mono font-extrabold uppercase tracking-wider text-emerald-600">Primary Campus</span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-700">Attock Campus</span>
                    <span className="px-2 py-0.5 rounded text-3xs font-bold bg-emerald-100 text-emerald-800">Default</span>
                  </div>
                  <p className="text-3xs text-slate-500">Includes CS HOD: Dr. Muhammad Asif</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
                  <span className="text-3xs font-mono font-extrabold uppercase tracking-wider text-blue-600">Status</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-blue-700">100% Active</span>
                    <CheckCircle2 className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-3xs text-slate-500">All campuses available in teacher profile dropdown</p>
                </div>
              </div>

              {/* Campuses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campuses.map((c) => {
                  const deptsCount = departments.filter((d) => d.campusName === c.name).length;

                  return (
                    <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between hover:border-emerald-400 transition-all">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded text-3xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {c.code}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 mt-1">{c.name}</h4>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {c.status || 'Active'}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-slate-600 pt-1">
                          <p className="flex items-center gap-1.5 text-2xs">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span><strong>City:</strong> {c.city}</span>
                          </p>
                          <p className="text-2xs text-slate-500 leading-snug">
                            {c.address}
                          </p>
                          {c.directorName && (
                            <p className="text-2xs text-slate-700 pt-1 border-t border-slate-100">
                              <strong>Director:</strong> {c.directorName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-3xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {deptsCount > 0 ? `${deptsCount} Departments` : 'General Campus'}
                        </span>

                        {c.name !== 'Attock Campus' && (
                          <button
                            onClick={() => handleDeleteCampus(c.id, c.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Campus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: ADD CAMPUS (Dedicated Add Form!) */}
          {campusSubTab === 'ADD' && (
            <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-600" />
                    Add New University Campus
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Register a new campus location for teacher enrollment and HOD assignment.</p>
                </div>
                <span className="text-3xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200">
                  New Campus Form
                </span>
              </div>

              <form onSubmit={handleCreateCampus} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Campus Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Multan Campus"
                      value={newCampusName}
                      onChange={(e) => setNewCampusName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Campus Code</label>
                    <input
                      type="text"
                      placeholder="e.g. UE-MUL"
                      value={newCampusCode}
                      onChange={(e) => setNewCampusCode(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">City / District *</label>
                    <input
                      type="text"
                      placeholder="e.g. Multan"
                      value={newCampusCity}
                      onChange={(e) => setNewCampusCity(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Campus Director / Head</label>
                    <input
                      type="text"
                      placeholder="e.g. Prof. Dr. Tariq Bashir"
                      value={newCampusDirector}
                      onChange={(e) => setNewCampusDirector(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Complete Address</label>
                  <textarea
                    placeholder="e.g. Bosan Road, Multan, Punjab, Pakistan"
                    value={newCampusAddress}
                    onChange={(e) => setNewCampusAddress(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCampusSubTab('ALL')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create & Register Campus</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 3: HOD SCOPE ASSIGNMENTS (CAMPUS + DEPARTMENT)
         ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'HOD_ASSIGNMENTS' && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
              <span className="text-3xs font-mono font-extrabold uppercase tracking-wider text-slate-400">Total Scope Mappings</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-slate-900">{hodAssignments.length}</span>
                <Shield className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-3xs text-slate-500">Configured HOD campus-department assignments</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
              <span className="text-3xs font-mono font-extrabold uppercase tracking-wider text-emerald-600">Active HOD Scopes</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-emerald-700">
                  {hodAssignments.filter((a) => a.status === 'Active').length}
                </span>
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-3xs text-slate-500">Actively receiving scoped teacher registrations</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
              <span className="text-3xs font-mono font-extrabold uppercase tracking-wider text-blue-600">Configured Campuses</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-blue-700">
                  {new Set(hodAssignments.map((a) => a.campusName)).size}
                </span>
                <Landmark className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-3xs text-slate-500">Campuses with active department heads</p>
            </div>
          </div>

          {/* Security Notice Callout */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1 text-emerald-950">
              <p className="font-extrabold">Multi-Campus Scope Isolation & Auto-Routing Engine</p>
              <p className="text-slate-600 leading-relaxed text-2xs">
                This table is the <strong>single source of truth</strong> for HOD authorization. When a teacher selects their Campus and Department during enrollment, the system automatically resolves the assigned HOD here. The HOD’s dashboard is strictly locked to this Campus + Department scope (Attock CS HOD cannot see Attock Math or Lahore CS teachers).
              </p>
            </div>
          </div>

          {/* Assignments Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-heading">
                  Authorized HOD Scope Mappings
                </h3>
                <p className="text-3xs text-slate-500">
                  Admin-managed assignments controlling teacher approval and dashboard access.
                </p>
              </div>
              <button
                onClick={() => setShowAssignScopeModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Assign HOD to Scope</span>
              </button>
            </div>

            {hodAssignments.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <Shield className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                <p className="text-xs font-semibold">No HOD scope assignments found.</p>
                <button
                  onClick={() => setShowAssignScopeModal(true)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700"
                >
                  Create First Scope Assignment
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-3xs font-mono uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold">HOD User</th>
                      <th className="py-3 px-4 font-bold">Campus Scope</th>
                      <th className="py-3 px-4 font-bold">Department Scope</th>
                      <th className="py-3 px-4 font-bold">Session</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold">Assigned Date</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hodAssignments.map((a) => {
                      const hodUser = usersList.find((u) => u.id === a.hodId);
                      const isActive = a.status === 'Active';

                      return (
                        <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-black text-emerald-800 text-2xs">
                                {a.hodName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{a.hodName}</div>
                                <div className="text-3xs text-slate-500 font-mono">
                                  {hodUser?.email || a.hodId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{a.campusName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>{a.departmentName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-3xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {a.academicSession || 'All Sessions'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-3xs font-bold inline-flex items-center gap-1 border ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {a.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-3xs font-mono">
                            {new Date(a.assignedDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setResetModalAssignment(a);
                                  setResetNewPassword('');
                                  setShowResetPassword(false);
                                }}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                                title="Reset HOD Login Password"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleToggleScopeStatus(a.id, a.status)}
                                className={`px-2 py-1 text-3xs font-bold rounded-lg transition-colors cursor-pointer border ${
                                  isActive
                                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                }`}
                                title={isActive ? 'Deactivate Scope' : 'Activate Scope'}
                              >
                                {isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeleteScopeAssignment(a.id, a.hodName, a.departmentName)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove Assignment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADD HOD SCOPE ASSIGNMENT MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {showAssignScopeModal && (() => {
        const selectedScopeCampus = campuses.find((c) => c.id === scopeCampusId || c.name === scopeCampusId);
        const selectedScopeDept = departments.find((d) => d.id === scopeDeptId || d.name === scopeDeptId);
        const filteredDeptsForScope = departments.filter((d) => {
          if (!selectedScopeCampus) return true;
          if (d.campusName && d.campusName.toLowerCase() === selectedScopeCampus.name.toLowerCase()) return true;
          if (d.campusId && d.campusId === selectedScopeCampus.id) return true;
          return !d.campusName && !d.campusId;
        });
        const displayedScopeDepts = filteredDeptsForScope.length > 0 ? filteredDeptsForScope : departments;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 space-y-4 text-xs my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    HOD Management / Assign HOD
                  </h3>
                  <p className="text-2xs text-slate-500 mt-0.5">
                    Follow the exact 5-step sequence to assign HOD with isolated scope and login credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssignScopeModal(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step Flow Tracker */}
              <div className="grid grid-cols-5 gap-1.5 text-center text-3xs font-bold border-b border-slate-100 pb-3">
                <div className={`p-1.5 rounded-lg ${scopeCampusId ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                  1. Campus
                </div>
                <div className={`p-1.5 rounded-lg ${scopeDeptId ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                  2. Department
                </div>
                <div className={`p-1.5 rounded-lg ${scopeHodName ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                  3. HOD
                </div>
                <div className={`p-1.5 rounded-lg ${scopeEmail ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                  4. Credentials
                </div>
                <div className={`p-1.5 rounded-lg ${scopeCampusId && scopeDeptId && scopeHodName && scopeEmail ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  5. Assign
                </div>
              </div>

              <form onSubmit={handleCreateScopeAssignment} className="space-y-4">
                {/* STEP 1: Select CAMPUS */}
                <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#165534] text-white flex items-center justify-center text-3xs font-black">1</span>
                      STEP 1: Select Campus <span className="text-rose-500">*</span>
                    </label>
                    {scopeCampusId && <span className="text-3xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">✓ Selected</span>}
                  </div>
                  <select
                    required
                    value={scopeCampusId}
                    onChange={(e) => {
                      setScopeCampusId(e.target.value);
                      setScopeDeptId(''); // reset department when campus changes
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer"
                  >
                    <option value="">-- Choose Campus (e.g. Attock Campus) --</option>
                    {campuses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city}) • {c.code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* STEP 2: Select DEPARTMENT */}
                <div className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                  !scopeCampusId ? 'bg-slate-50/40 border-slate-200 opacity-60' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#165534] text-white flex items-center justify-center text-3xs font-black">2</span>
                      STEP 2: Select Department <span className="text-rose-500">*</span>
                    </label>
                    {scopeDeptId && <span className="text-3xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">✓ Selected</span>}
                  </div>
                  <select
                    required
                    disabled={!scopeCampusId}
                    value={scopeDeptId}
                    onChange={(e) => setScopeDeptId(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!scopeCampusId ? '-- Complete Step 1 First: Select Campus --' : '-- Choose Department (e.g. Mathematics, CS) --'}
                    </option>
                    {displayedScopeDepts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* STEP 3: Select / Assign HOD */}
                <div className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                  !scopeDeptId ? 'bg-slate-50/40 border-slate-200 opacity-60' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#165534] text-white flex items-center justify-center text-3xs font-black">3</span>
                      STEP 3: Select or Appoint HOD <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1 bg-slate-200 p-0.5 rounded-lg text-3xs">
                      <button
                        type="button"
                        onClick={() => {
                          setScopeHodMode('SELECT');
                          setScopeHodId('');
                          setScopeHodName('');
                        }}
                        className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                          scopeHodMode === 'SELECT' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        Choose Faculty
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setScopeHodMode('CREATE');
                          setScopeHodId('');
                          setScopeHodName('');
                        }}
                        className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                          scopeHodMode === 'CREATE' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                        }`}
                      >
                        + New HOD
                      </button>
                    </div>
                  </div>

                  {scopeHodMode === 'SELECT' ? (
                    <div>
                      <select
                        disabled={!scopeDeptId}
                        value={scopeHodId}
                        onChange={(e) => {
                          const chosenId = e.target.value;
                          setScopeHodId(chosenId);
                          const user = usersList.find((u) => u.id === chosenId);
                          if (user) {
                            setScopeHodName(user.name);
                            if (user.email) setScopeEmail(user.email);
                          } else {
                            setScopeHodName('');
                          }
                        }}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Choose Existing Faculty Member --</option>
                        {eligibleFaculty.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.role}) — {f.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        required
                        disabled={!scopeDeptId}
                        value={scopeHodName}
                        onChange={(e) => setScopeHodName(e.target.value)}
                        placeholder="e.g. Dr. Abu Zarr, Dr. Muhammad Asif"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>

                {/* STEP 4: Login Credentials */}
                <div className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                  !scopeHodName ? 'bg-slate-50/40 border-slate-200 opacity-60' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#165534] text-white flex items-center justify-center text-3xs font-black">4</span>
                    STEP 4: Provide HOD Login Credentials <span className="text-rose-500">*</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        HOD Email (Login Username) *
                      </span>
                      <input
                        type="email"
                        required
                        disabled={!scopeHodName}
                        value={scopeEmail}
                        onChange={(e) => setScopeEmail(e.target.value)}
                        placeholder="e.g. hod.math@example.com"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider block">
                          HOD Password {scopeHodMode === 'CREATE' ? '*' : '(Optional Reset)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setScopePassword(`Hod@${Math.floor(1000 + Math.random() * 9000)}!`)}
                          className="text-3xs text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                        >
                          Generate
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required={scopeHodMode === 'CREATE'}
                          minLength={6}
                          disabled={!scopeHodName}
                          value={scopePassword}
                          onChange={(e) => setScopePassword(e.target.value)}
                          placeholder={scopeHodMode === 'SELECT' ? 'Leave blank or set new password' : 'Min 6 characters'}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-800 pr-10 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Academic Session</span>
                      <input
                        type="text"
                        value={scopeSession}
                        onChange={(e) => setScopeSession(e.target.value)}
                        placeholder="Fall 2026"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Scope Status</span>
                      <select
                        value={scopeStatus}
                        onChange={(e) => setScopeStatus(e.target.value as any)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs cursor-pointer"
                      >
                        <option value="Active">Active (Live Authority)</option>
                        <option value="Inactive">Inactive (Disabled)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* STEP 5: Clear Summary Card & Assign HOD Button */}
                <div className="p-4 bg-emerald-50/90 border border-emerald-300 rounded-2xl space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200 text-xs">
                    <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#165534] text-white flex items-center justify-center text-3xs font-black">5</span>
                      STEP 5: Assignment Summary & Review
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-600 text-white">
                      Status: Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-2xs">
                    <div className="p-2 bg-white rounded-xl border border-emerald-200">
                      <span className="text-slate-400 block text-3xs font-bold uppercase">Campus</span>
                      <span className="font-bold text-slate-900">{selectedScopeCampus?.name || '—'}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-emerald-200">
                      <span className="text-slate-400 block text-3xs font-bold uppercase">Department</span>
                      <span className="font-bold text-slate-900">{selectedScopeDept?.name || '—'}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-emerald-200">
                      <span className="text-slate-400 block text-3xs font-bold uppercase">HOD Name</span>
                      <span className="font-bold text-emerald-800">{scopeHodName || '—'}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-emerald-200">
                      <span className="text-slate-400 block text-3xs font-bold uppercase">HOD Email</span>
                      <span className="font-mono font-bold text-slate-800 truncate block">{scopeEmail || '—'}</span>
                    </div>
                  </div>

                  <p className="text-3xs text-emerald-900 leading-snug">
                    🔒 After saving, this HOD will have login access strictly scoped to <strong>{selectedScopeDept?.name || 'the department'}</strong> at <strong>{selectedScopeCampus?.name || 'the campus'}</strong>. Teachers enrolling in this department will route exclusively to this HOD.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAssignScopeModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-bold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingScope || !scopeCampusId || !scopeDeptId || !scopeHodName || !scopeEmail}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    <span>{isSubmittingScope ? 'Assigning Scope...' : 'Assign HOD'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ══════════════════════════════════════════════════════════════════════
          RESET HOD PASSWORD MODAL (ADMIN CONTROLLED)
         ══════════════════════════════════════════════════════════════════════ */}
      {resetModalAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-600" />
                  Reset HOD Login Password
                </h3>
                <p className="text-2xs text-slate-500 mt-0.5">
                  Update credentials for {resetModalAssignment.hodName}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setResetModalAssignment(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between text-2xs">
                  <span className="text-slate-500 font-semibold">HOD User:</span>
                  <span className="font-bold text-slate-900">{resetModalAssignment.hodName}</span>
                </div>
                <div className="flex justify-between text-2xs">
                  <span className="text-slate-500 font-semibold">Scope:</span>
                  <span className="font-bold text-slate-700">{resetModalAssignment.campusName} • {resetModalAssignment.departmentName}</span>
                </div>
                <div className="flex justify-between text-2xs">
                  <span className="text-slate-500 font-semibold">Login Email:</span>
                  <span className="font-mono text-emerald-700 font-bold">{resetModalAssignment.hodEmail || 'Admin Managed'}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password * (min 6 characters)</label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 pr-10 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setResetNewPassword(`Reset@${Math.floor(1000 + Math.random() * 9000)}!`)}
                  className="text-3xs text-amber-700 hover:text-amber-800 font-bold underline cursor-pointer"
                >
                  Generate Random Password
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalAssignment(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReset || resetNewPassword.length < 6}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold cursor-pointer shadow-xs transition-all"
                >
                  {isSubmittingReset ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADD CAMPUS MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {showCampusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-700" />
                  Add University of Education Campus
                </h3>
                <p className="text-2xs text-slate-500 mt-0.5">
                  Teachers will be able to select this campus during profile completion.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCampusModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampus} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Name *</label>
                <input
                  type="text"
                  required
                  value={newCampusName}
                  onChange={(e) => setNewCampusName(e.target.value)}
                  placeholder="e.g. Rawalpindi Campus, Sialkot Campus"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Campus Code *</label>
                  <input
                    type="text"
                    required
                    value={newCampusCode}
                    onChange={(e) => setNewCampusCode(e.target.value)}
                    placeholder="e.g. UE-RWP"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newCampusCity}
                    onChange={(e) => setNewCampusCity(e.target.value)}
                    placeholder="e.g. Rawalpindi"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Address</label>
                <input
                  type="text"
                  value={newCampusAddress}
                  onChange={(e) => setNewCampusAddress(e.target.value)}
                  placeholder="e.g. Mall Road, Rawalpindi, Punjab"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Director / Principal Name</label>
                <input
                  type="text"
                  value={newCampusDirector}
                  onChange={(e) => setNewCampusDirector(e.target.value)}
                  placeholder="e.g. Prof. Dr. Shahid Munir"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCampusModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  Save Campus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">
                  Select Faculty Member to appoint as HOD <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedHodId}
                  onChange={(e) => setSelectedHodId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer"
                >
                  <option value="">-- Choose Faculty Member --</option>
                  {eligibleFaculty.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email}) • {user.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-2xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Routing & Approval Permissions
                </p>
                <p>
                  Any teacher submitting registration or course selections for <strong>{assignModalDept.name}</strong> will have their request routed directly to this HOD.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssignModalDept(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedHodId}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Confirm HOD Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CREATE DEPARTMENT MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  Add Academic Department
                </h3>
                <p className="text-2xs text-slate-500 mt-0.5">
                  Create a new department and link to a University of Education Campus.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeptModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Association *</label>
                <select
                  value={selectedCampusForDept}
                  onChange={(e) => setSelectedCampusForDept(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. CS, MATH, BBA, EDU"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
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
                  placeholder="e.g. Dr. Muhammad Asif"
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
                  onClick={() => setShowDeptModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 cursor-pointer shadow-xs"
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
