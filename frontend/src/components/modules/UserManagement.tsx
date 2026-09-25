import React, { useState } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { User, UserRole } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { DetailDrawer } from '../common/DetailDrawer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ActionButton } from '../common/ActionButton';
import {
  UserPlus,
  Shield,
  GraduationCap,
  UserCheck,
  Briefcase,
  KeyRound,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  BookOpen,
  Lock,
  Unlock,
  FileCheck2,
  Activity,
  AlertCircle
} from 'lucide-react';

interface UserManagementProps {
  activeModule?: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ activeModule }) => {
  const { usersList, createUser, updateUser, toggleUserStatus, deleteUser, resetUserPassword, departments, courses, courseFiles } = useCFMS();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Edit User State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Reset Password Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [resetConfirmPasswordInput, setResetConfirmPasswordInput] = useState('');
  const [resetErrorMsg, setResetErrorMsg] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (activeModule === 'Create User') {
      setIsCreateModalOpen(true);
    }
  }, [activeModule]);

  // Filter user list based on selected sub-item from sidebar
  const filteredUsers = usersList.filter((u) => {
    if (u.deleted) return false;
    if (activeModule === 'Admins') return u.role === 'ADMIN';
    if (activeModule === 'HODs') return u.role === 'HOD';
    if (activeModule === 'Regular Teachers') return u.role === 'REGULAR_TEACHER';
    if (activeModule === 'Visiting Teachers') return u.role === 'VISITING_TEACHER';
    if (activeModule === 'Active Users') return u.status === 'Active';
    if (activeModule === 'Inactive Users') return u.status === 'Inactive' || u.status === 'Locked';
    return true;
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {}
  });

  // Create Form State with full validations
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [role, setRole] = useState<UserRole>('REGULAR_TEACHER');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [designation, setDesignation] = useState('');
  const [academicSession, setAcademicSession] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [avatar, setAvatar] = useState('');
  const [contractStart, setContractStart] = useState('');
  const [contractEnd, setContractEnd] = useState('');

  // Error state for validations
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Required Fields Check
    if (!name.trim()) {
      setValidationError('Full Name is required.');
      return;
    }
    if (!email.trim()) {
      setValidationError('Email Address is required.');
      return;
    }

    // 2. Email Regex Check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address format (e.g. user@ue.edu.pk).');
      return;
    }

    // 3. Duplicate Email Check
    const isDuplicate = usersList.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (isDuplicate) {
      setValidationError(`User with email "${email.trim()}" already exists in the system.`);
      return;
    }

    // 4. Password Validations
    if (!password) {
      setValidationError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match. Please verify your confirm password.');
      return;
    }

    const deptObj = departments.find((d) => d.id === departmentId);
    const finalEmpId = employeeId.trim() || `EMP-2026-${Math.floor(100 + Math.random() * 900)}`;

    createUser({
      name,
      employeeId: finalEmpId,
      email: email.trim().toLowerCase(),
      password,
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role,
      departmentId,
      departmentName: deptObj?.name || 'Department of Computer Science',
      designation,
      phone,
      gender,
      academicSession,
      status,
      loginCount: 0,
      deleted: false,
      ...(role === 'VISITING_TEACHER' && {
        contractStartDate: contractStart,
        contractEndDate: contractEnd,
        contractStatus: 'Active',
        supervisorName: 'Dr. Sarah Ahmad'
      })
    } as any);

    setIsCreateModalOpen(false);
    // Reset Form
    setName('');
    setEmployeeId('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPhone('');
    setDesignation('');
    setAcademicSession('');
    setAvatar('');
    setContractStart('');
    setContractEnd('');
  };

  // Edit Submit Handler
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const deptObj = departments.find((d) => d.id === editingUser.departmentId);

    updateUser(editingUser.id, {
      name: editingUser.name,
      employeeId: editingUser.employeeId,
      email: editingUser.email,
      role: editingUser.role,
      departmentId: editingUser.departmentId,
      departmentName: deptObj?.name || editingUser.departmentName,
      designation: editingUser.designation,
      phone: editingUser.phone,
      gender: editingUser.gender,
      academicSession: editingUser.academicSession,
      status: editingUser.status,
      avatar: editingUser.avatar
    });

    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  // Handle Reset Password Submit
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetErrorMsg(null);
    if (!resetTargetUser || !resetPasswordInput) return;

    if (resetPasswordInput.length < 6) {
      setResetErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (resetPasswordInput !== resetConfirmPasswordInput) {
      setResetErrorMsg('New passwords do not match.');
      return;
    }

    resetUserPassword(resetTargetUser.id, resetPasswordInput);
    setResetSuccessMsg(`Password reset successfully for ${resetTargetUser.name}. Account ready for login.`);
    setTimeout(() => {
      setResetSuccessMsg(null);
      setIsResetModalOpen(false);
      setResetTargetUser(null);
      setResetPasswordInput('');
      setResetConfirmPasswordInput('');
    }, 1800);
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User Name',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <img src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
          <p className="font-bold text-slate-900 text-xs">{u.name}</p>
        </div>
      )
    },
    {
      key: 'designation',
      header: 'Designation',
      sortable: true,
      render: (u) => (
        <div className="whitespace-nowrap">
          <p className="font-semibold text-slate-800 text-xs">{u.designation || 'N/A'}</p>
          {u.employeeId && <p className="text-3xs text-slate-400 font-mono">ID: {u.employeeId}</p>}
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email Address',
      sortable: true,
      render: (u) => (
        <span className="text-slate-900 font-mono text-2xs font-semibold whitespace-nowrap">{u.email}</span>
      )
    },
    {
      key: 'phone',
      header: 'Phone Number',
      sortable: true,
      render: (u) => (
        <span className="text-slate-700 font-medium text-xs whitespace-nowrap">{u.phone || 'N/A'}</span>
      )
    },
    {
      key: 'role',
      header: 'System Role',
      sortable: true,
      render: (u) => {
        const roleBadges: Record<UserRole, { label: string; color: string }> = {
          ADMIN: { label: 'System Admin', color: 'bg-purple-50 text-purple-700 border-purple-200/80' },
          HOD: { label: 'HOD', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/80' },
          REGULAR_TEACHER: { label: 'Regular Faculty', color: 'bg-blue-50 text-blue-700 border-blue-200/80' },
          VISITING_TEACHER: { label: 'Visiting Faculty', color: 'bg-amber-50 text-amber-800 border-amber-200/80' }
        };
        const b = roleBadges[u.role] || { label: u.role, color: 'bg-slate-100 text-slate-700 border-slate-200' };
        return (
          <span className={`whitespace-nowrap inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs ${b.color}`}>
            {b.label}
          </span>
        );
      }
    },
    {
      key: 'departmentName',
      header: 'Department',
      sortable: true,
      render: (u) => (
        <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
          {(u.departmentName || '').replace('Department of ', '')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (u) => (
        <span
          className={`whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-2xs ${
            u.status === 'Active'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : u.status === 'Locked'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              u.status === 'Active'
                ? 'bg-emerald-500'
                : u.status === 'Locked'
                ? 'bg-rose-500'
                : 'bg-slate-400'
            }`}
          />
          {u.status}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              User Directory
            </span>
            <span className="text-3xs text-slate-400 font-mono">Attock Campus</span>
          </div>
          <h2 className="text-xl font-extrabold font-heading text-slate-900 mt-1">
            User Management ({activeModule || 'All Users'})
          </h2>
        </div>

        <ActionButton
          variant="primary"
          label="Add New User"
          onClick={() => {
            setValidationError(null);
            setIsCreateModalOpen(true);
          }}
          size="md"
        />
      </div>

      {/* Users Table */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        searchPlaceholder="Search users by name, email, employee ID, role, department..."
        filters={[
          {
            key: 'role',
            label: 'Role',
            options: [
              { value: 'ADMIN', label: 'Admin' },
              { value: 'HOD', label: 'HOD' },
              { value: 'REGULAR_TEACHER', label: 'Regular Teacher' },
              { value: 'VISITING_TEACHER', label: 'Visiting Teacher' }
            ]
          },
          {
            key: 'status',
            label: 'Status',
            options: [
              { value: 'Active', label: 'Active' },
              { value: 'Locked', label: 'Locked' },
              { value: 'Inactive', label: 'Inactive' }
            ]
          }
        ]}
        onRowClick={(u) => {
          setSelectedUser(u);
          setIsDrawerOpen(true);
        }}
        actions={(u) => (
          <div className="flex items-center justify-end gap-1.5">
            <ActionButton
              variant="view"
              label="View"
              size="xs"
              onClick={() => {
                setSelectedUser(u);
                setIsDrawerOpen(true);
              }}
              tooltip="View Profile Details"
            />

            <ActionButton
              variant="edit"
              label="Edit"
              size="xs"
              onClick={() => {
                setEditingUser({ ...u });
                setIsEditModalOpen(true);
              }}
              tooltip="Edit User Info"
            />

            <ActionButton
              variant={u.status === 'Active' ? 'lock' : 'unlock'}
              label={u.status === 'Active' ? 'Lock' : 'Unlock'}
              size="xs"
              onClick={() => toggleUserStatus(u.id)}
              tooltip={u.status === 'Active' ? 'Lock Account' : 'Unlock Account'}
            />

            <ActionButton
              variant="reset-password"
              label="Reset"
              size="xs"
              onClick={() => {
                setResetTargetUser(u);
                setResetPasswordInput('Teacher@123');
                setResetConfirmPasswordInput('Teacher@123');
                setResetErrorMsg(null);
                setIsResetModalOpen(true);
              }}
              tooltip="Reset Password"
            />

            <ActionButton
              variant="delete"
              iconOnly
              size="xs"
              onClick={() => {
                setConfirmDialog({
                  isOpen: true,
                  title: `Delete User ${u.name}`,
                  message: `Are you sure you want to soft delete account "${u.name}" (${u.email})?`,
                  action: () => deleteUser(u.id)
                });
              }}
              tooltip="Delete Account"
            />
          </div>
        )}
      />

      {/* User Detail Drawer (Issue 4 - Complete Profile, Courses & Files Count) */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedUser?.name || 'User Profile'}
        subtitle={selectedUser?.designation}
      >
        {selectedUser && (
          <div className="space-y-6 text-xs">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <img src={selectedUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={selectedUser.name} className="w-16 h-16 rounded-full object-cover border-2 border-indigo-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedUser.name}</h3>
                <p className="text-3xs text-slate-500 font-mono">{selectedUser.email}</p>
                <p className="text-3xs text-indigo-700 font-semibold mt-0.5">{selectedUser.designation} ({selectedUser.employeeId || 'EMP-2026-101'})</p>
                <p className="text-3xs text-slate-400 font-medium">Gender: {selectedUser.gender || 'Not specified'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1">
                Account & Security Profile
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-3xs text-slate-400 block">Employee ID</span>
                  <span className="font-bold text-slate-800">{selectedUser.employeeId || 'EMP-2026-101'}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">System Role</span>
                  <span className="font-bold text-slate-800">{selectedUser.role}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Department</span>
                  <span className="font-bold text-slate-800">{selectedUser.departmentName}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Account Status</span>
                  <span className={`font-bold ${selectedUser.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Phone Number</span>
                  <span className="font-bold text-slate-800">{selectedUser.phone}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Account Created</span>
                  <span className="font-bold text-slate-800">{selectedUser.createdAt || '2024-01-15'}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Last Active / Login</span>
                  <span className="font-bold text-slate-800">{selectedUser.lastLogin || 'Recent'}</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Total Login Count</span>
                  <span className="font-bold text-indigo-700">{selectedUser.loginCount || 1} logins</span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Uploaded Course Files</span>
                  <span className="font-bold text-emerald-700">
                    {courseFiles.filter((f) => f.submittedById === selectedUser.id || f.teacherName === selectedUser.name).length} files
                  </span>
                </div>
                <div>
                  <span className="text-3xs text-slate-400 block">Academic Session</span>
                  <span className="font-bold text-slate-800">{selectedUser.academicSession || 'Spring 2026'}</span>
                </div>
              </div>
            </div>

            {/* Assigned Courses Section */}
            {(selectedUser.role === 'REGULAR_TEACHER' || selectedUser.role === 'VISITING_TEACHER') && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Assigned Teaching Courses
                </h4>
                {courses.filter((c) => c.assignedTeacherId === selectedUser.id || c.assignedTeacherName === selectedUser.name).length === 0 ? (
                  <p className="text-3xs text-slate-400 italic">No active course assignments recorded for this teacher.</p>
                ) : (
                  <div className="space-y-2">
                    {courses
                      .filter((c) => c.assignedTeacherId === selectedUser.id || c.assignedTeacherName === selectedUser.name)
                      .map((course) => (
                        <div key={course.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 font-mono text-2xs bg-slate-200 px-1.5 py-0.5 rounded">
                              {course.code}
                            </span>
                            <p className="font-semibold text-slate-800 text-2xs mt-0.5">{course.title}</p>
                            <span className="text-3xs text-slate-500">{course.semester} ({course.credits} Credits)</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-emerald-100 text-emerald-800">
                            {course.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {selectedUser.role === 'VISITING_TEACHER' && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-700" />
                  Visiting Faculty Semester Contract Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-2xs">
                  <div>
                    <span className="text-slate-500 block">Start Date:</span>
                    <span className="font-bold text-slate-900">{selectedUser.contractStartDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">End Date:</span>
                    <span className="font-bold text-slate-900">{selectedUser.contractEndDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contract Status:</span>
                    <span className="font-bold text-amber-800">{selectedUser.contractStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Supervisor:</span>
                    <span className="font-bold text-slate-900">{selectedUser.supervisorName}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>

      {/* Create User Modal (With complete validations, Employee ID, Gender, Bcrypt) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">Add New Portal User Account</h3>
                <p className="text-xs text-slate-500">Provision credentials, employee ID, and department role.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">×</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              {validationError && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID (Optional)</label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Enter employee ID"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address * (Login ID)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              {/* Password & Confirm Password Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                <div>
                  <label className="block font-bold text-indigo-950 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-indigo-950 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter confirm password"
                    className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="REGULAR_TEACHER">Regular Faculty</option>
                    <option value="VISITING_TEACHER">Visiting Faculty</option>
                    <option value="HOD">HOD (Head of Department)</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="Enter designation"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academic Session</label>
                  <input
                    type="text"
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    placeholder="Enter academic session"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              {role === 'VISITING_TEACHER' && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                  <p className="font-bold text-amber-900">Visiting Faculty Contract Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700">Contract Start Date</label>
                      <input
                        type="date"
                        value={contractStart}
                        onChange={(e) => setContractStart(e.target.value)}
                        className="w-full p-2 bg-white border border-amber-200 rounded-lg text-slate-800 font-semibold cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">Contract End Date</label>
                      <input
                        type="date"
                        value={contractEnd}
                        onChange={(e) => setContractEnd(e.target.value)}
                        className="w-full p-2 bg-white border border-amber-200 rounded-lg text-slate-800 font-semibold cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold font-heading text-slate-900">Edit User Profile ({editingUser.name})</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">×</button>
            </div>            <form onSubmit={handleEditSubmit} className="p-6 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={editingUser.employeeId || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, employeeId: e.target.value })}
                    placeholder="Enter employee ID"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  placeholder="Enter email address"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="REGULAR_TEACHER">Regular Faculty</option>
                    <option value="VISITING_TEACHER">Visiting Faculty</option>
                    <option value="HOD">HOD (Head of Department)</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={editingUser.departmentId}
                    onChange={(e) => setEditingUser({ ...editingUser, departmentId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingUser.designation}
                    onChange={(e) => setEditingUser({ ...editingUser, designation: e.target.value })}
                    placeholder="Enter designation"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Locked">Locked (Block Login)</option>
                    <option value="Inactive">Inactive (Block Login)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={editingUser.gender || 'Male'}
                    onChange={(e) => setEditingUser({ ...editingUser, gender: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading text-slate-900">Reset User Password</h3>
                <p className="text-xs text-slate-500">Reset password for {resetTargetUser.name} ({resetTargetUser.email}).</p>
              </div>
              <button onClick={() => setIsResetModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer">×</button>
            </div>

            {resetSuccessMsg ? (
              <div className="p-6 text-emerald-800 font-bold text-xs bg-emerald-50">
                {resetSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="p-6 space-y-4 text-xs">
                {resetErrorMsg && (
                  <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl font-bold">
                    {resetErrorMsg}
                  </div>
                )}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">New Password *</label>
                  <input
                    type="password"
                    required
                    value={resetPasswordInput}
                    onChange={(e) => setResetPasswordInput(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    value={resetConfirmPasswordInput}
                    onChange={(e) => setResetConfirmPasswordInput(e.target.value)}
                    placeholder="Enter confirm password to match"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                  >
                    Confirm & Save Reset
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
};
