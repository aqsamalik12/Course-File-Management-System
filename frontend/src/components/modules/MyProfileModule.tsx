import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ActionButton } from '../common/ActionButton';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Calendar,
  ShieldCheck,
  Lock,
  KeyRound,
  Briefcase,
  MapPin,
  CheckCircle2,
  Edit3,
  Clock,
  Printer,
  Download,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Check,
  Sparkles,
  ShieldAlert,
  Globe,
  FileText,
  History,
  Monitor,
  Award,
  BookOpen
} from 'lucide-react';

interface MyProfileModuleProps {
  activeModule?: string;
}

interface PersonalLoginLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  event: string;
  status: 'SUCCESS' | 'WARNING';
}

export const MyProfileModule: React.FC<MyProfileModuleProps> = ({ activeModule }) => {
  const { currentUser, updateCurrentUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'contact' | 'academic' | 'security' | 'history'>('personal');

  useEffect(() => {
    if (activeModule === 'Overview' || activeModule === 'Profile Overview') {
      setActiveTab('overview');
    } else if (activeModule === 'Personal Information' || activeModule === 'My Profile' || activeModule === 'Profile') {
      setActiveTab('personal');
    } else if (activeModule === 'Contact & Address' || activeModule === 'Address & Contact') {
      setActiveTab('contact');
    } else if (activeModule === 'Professional & Academic' || activeModule === 'Academic & Professional') {
      setActiveTab('academic');
    } else if (activeModule === 'Security' || activeModule === 'Settings & Security' || activeModule === 'Change Password') {
      setActiveTab('security');
    } else if (activeModule === 'Login History' || activeModule === 'Activity History') {
      setActiveTab('history');
    }
  }, [activeModule]);

  // Controlled Form State
  const [formData, setFormData] = useState({
    firstName: 'Dr. Muhammad',
    lastName: 'Aslam',
    name: currentUser?.name || 'Prof. Dr. Muhammad Aslam',
    personalEmail: 'm.aslam.academics@ue.edu.pk',
    phone: currentUser?.phone || '+92 300 1234567',
    altPhone: '+92 321 9876543',
    officeExtension: 'Ext. 104',
    emergencyContact: 'Mrs. Aslam (+92 300 9998877) - Spouse',
    gender: 'Male',
    dob: '1975-04-12',
    cnic: '37101-1234567-1',
    maritalStatus: 'Married',
    bloodGroup: 'B+',
    nationality: 'Pakistani',
    country: 'Pakistan',
    state: 'Punjab',
    city: 'Attock',
    postalCode: '43600',
    officeAddress: 'Director Office, Main Admin Building, Attock Campus',
    residentialAddress: 'Faculty Quarter A-2, UE Attock Campus, Attock',
    employeeId: 'EMP-2026-001',
    joiningDate: '2015-09-01',
    department: 'Department of Computer Science',
    designation: 'Professor & Campus Administrator',
    employmentType: 'Permanent / Tenured',
    highestQualification: 'Ph.D. in Computer Science & Information Security',
    specialization: 'Information Security, Quality Assurance & Educational Management',
    username: 'maslam_admin',
    role: currentUser?.role || 'ADMIN',
    campus: 'University of Education - Attock Campus',
    sessionTimeout: '30 Minutes (Campus Security Policy)'
  });

  // Password Fields State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Personal Login History Logs
  const [userLoginHistory] = useState<PersonalLoginLog[]>([
    { id: 'log-1', timestamp: '2026-07-24 08:30:15', ipAddress: '192.168.1.1', device: 'Chrome 126 / Windows 11', event: 'PORTAL_LOGIN_SUCCESS', status: 'SUCCESS' },
    { id: 'log-2', timestamp: '2026-07-23 14:10:00', ipAddress: '192.168.1.1', device: 'Chrome 126 / Windows 11', event: 'USER_PROFILE_UPDATED', status: 'SUCCESS' },
    { id: 'log-3', timestamp: '2026-07-23 09:00:22', ipAddress: '192.168.1.1', device: 'Safari 17 / macOS', event: 'PORTAL_LOGIN_SUCCESS', status: 'SUCCESS' },
    { id: 'log-4', timestamp: '2026-07-22 17:45:10', ipAddress: '192.168.1.1', device: 'Chrome 126 / Windows 11', event: 'MFA_VERIFIED', status: 'SUCCESS' },
    { id: 'log-5', timestamp: '2026-07-21 08:15:30', ipAddress: '192.168.1.1', device: 'Edge 126 / Windows 11', event: 'PORTAL_LOGIN_SUCCESS', status: 'SUCCESS' }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const handleResetForm = () => {
    setFormData({
      firstName: 'Dr. Muhammad',
      lastName: 'Aslam',
      name: currentUser?.name || 'Prof. Dr. Muhammad Aslam',
      personalEmail: 'm.aslam.academics@ue.edu.pk',
      phone: currentUser?.phone || '+92 300 1234567',
      altPhone: '+92 321 9876543',
      officeExtension: 'Ext. 104',
      emergencyContact: 'Mrs. Aslam (+92 300 9998877) - Spouse',
      gender: 'Male',
      dob: '1975-04-12',
      cnic: '37101-1234567-1',
      maritalStatus: 'Married',
      bloodGroup: 'B+',
      nationality: 'Pakistani',
      country: 'Pakistan',
      state: 'Punjab',
      city: 'Attock',
      postalCode: '43600',
      officeAddress: 'Director Office, Main Admin Building, Attock Campus',
      residentialAddress: 'Faculty Quarter A-2, UE Attock Campus, Attock',
      employeeId: 'EMP-2026-001',
      joiningDate: '2015-09-01',
      department: 'Department of Computer Science',
      designation: 'Professor & Campus Administrator',
      employmentType: 'Permanent / Tenured',
      highestQualification: 'Ph.D. in Computer Science & Information Security',
      specialization: 'Information Security, Quality Assurance & Educational Management',
      username: 'maslam_admin',
      role: currentUser?.role || 'ADMIN',
      campus: 'University of Education - Attock Campus',
      sessionTimeout: '30 Minutes (Campus Security Policy)'
    });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword || passwordData.confirmPassword) {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('New passwords do not match.');
        return;
      }
      if (passwordData.newPassword.length < 8) {
        setPasswordError('Password must be at least 8 characters long.');
        return;
      }
    }

    setIsSaving(true);
    setTimeout(() => {
      updateCurrentUserProfile({
        name: `${formData.firstName} ${formData.lastName}`.trim() || formData.name,
        phone: formData.phone,
        designation: formData.designation,
        departmentName: formData.department,
        ...formData
      });
      setIsSaving(false);
      setSaveSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaveSuccess(false), 4000);
    }, 800);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 font-sans">
      {/* SUCCESS NOTIFICATION BANNER */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-800 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold">Profile Updated Successfully</p>
            <p className="text-3xs text-emerald-700">All HR parameters, contact credentials, and security preferences have been synced with database.</p>
          </div>
        </div>
      )}

      {/* EXECUTIVE PROFILE BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-950 via-[#1E7B4E] to-slate-900 relative">
          <div className="absolute right-6 top-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-3xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Verified Administrator
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 -mt-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              <div className="relative group shrink-0">
                <img
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                  alt={formData.name}
                  className="w-28 h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-slate-100"
                />
                <label
                  htmlFor="avatar-upload-input"
                  className="absolute bottom-1 right-1 p-2 bg-[#1E7B4E] hover:bg-[#165534] text-white rounded-lg shadow-md cursor-pointer transition-transform active:scale-95"
                  title="Update Photo"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <input id="avatar-upload-input" type="file" className="hidden" accept="image/*" />
                </label>
              </div>

              <div className="space-y-1.5 pt-2 sm:pt-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight">
                    {formData.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md text-3xs font-extrabold bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                    {formData.employeeId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-3xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono uppercase">
                    {formData.role}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-600 flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900">{formData.designation}</span>
                  <span className="text-slate-300">&bull;</span>
                  <span>{formData.department}</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-[#1E7B4E] font-bold">{formData.campus}</span>
                </p>

                <div className="flex items-center gap-4 text-3xs text-slate-500 font-medium flex-wrap pt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {currentUser?.email || formData.personalEmail}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {formData.phone}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Account
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert('Executive Dossier Exported as PDF.')}
                className="px-3.5 py-2 text-xs font-bold text-[#1E7B4E] bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" /> Export Dossier
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          { id: 'overview', label: '1. Profile Overview', icon: UserIcon },
          { id: 'personal', label: '2. Personal & HR Information', icon: Briefcase },
          { id: 'contact', label: '3. Contact & Address', icon: MapPin },
          { id: 'academic', label: '4. Professional & Academic', icon: Award },
          ...(currentUser?.role !== 'REGULAR_TEACHER' && currentUser?.role !== 'VISITING_TEACHER'
            ? [{ id: 'security', label: '5. Password & Security', icon: Lock }]
            : []),
          { id: 'history', label: `Login History (${userLoginHistory.length})`, icon: History }
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

      {/* FORM & SECTIONS CONTAINER */}
      <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 md:p-8 space-y-8">
        
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              Executive Profile Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-3xs font-extrabold text-slate-400 uppercase font-mono">Employee ID</span>
                <p className="font-extrabold text-slate-900 font-mono text-sm">{formData.employeeId}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-3xs font-extrabold text-slate-400 uppercase font-mono">Assigned Role</span>
                <p className="font-extrabold text-indigo-700 font-mono text-sm">{formData.role}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-3xs font-extrabold text-slate-400 uppercase font-mono">Joining Date</span>
                <p className="font-extrabold text-slate-800 font-mono text-sm">{formData.joiningDate}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-3xs font-extrabold text-slate-400 uppercase font-mono">Employment Type</span>
                <p className="font-extrabold text-emerald-800 text-xs">{formData.employmentType}</p>
              </div>
            </div>

            <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <h4 className="font-extrabold text-emerald-950 font-heading">Verified Campus Administrator</h4>
              </div>
              <p className="text-slate-700 leading-relaxed">
                Prof. Dr. Muhammad Aslam holds full system administrative privileges over the University Course File Management System (CFMS) for Attock Campus.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PERSONAL & HR INFORMATION */}
        {/* ========================================================= */}
        {activeTab === 'personal' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                <UserIcon className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-base font-bold font-heading text-slate-900">Personal & National HR Information</h2>
                <p className="text-3xs text-slate-500">Official HR verified national identity parameters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">CNIC / National Identity Number</label>
                <input
                  type="text"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Marital Status</label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CONTACT & ADDRESS */}
        {/* ========================================================= */}
        {activeTab === 'contact' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                <MapPin className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-base font-bold font-heading text-slate-900">Contact Channels & Physical Address</h2>
                <p className="text-3xs text-slate-500">Official contact extensions and campus location</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Official University Email</span>
                  <span className="text-3xs text-slate-400 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" /> System Locked
                  </span>
                </label>
                <input
                  type="email"
                  value={currentUser?.email || formData.personalEmail}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Personal Email Address</label>
                <input
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Mobile Phone *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alternate Phone Number</label>
                <input
                  type="text"
                  name="altPhone"
                  value={formData.altPhone}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Office Extension</label>
                <input
                  type="text"
                  name="officeExtension"
                  value={formData.officeExtension}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Emergency Contact Person & Phone</label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Campus Office Address</label>
                <input
                  type="text"
                  name="officeAddress"
                  value={formData.officeAddress}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Permanent Residential Address</label>
                <input
                  type="text"
                  name="residentialAddress"
                  value={formData.residentialAddress}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: PROFESSIONAL & ACADEMIC */}
        {/* ========================================================= */}
        {activeTab === 'academic' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                <Award className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-base font-bold font-heading text-slate-900">Professional & Academic Information</h2>
                <p className="text-3xs text-slate-500">Employment record, academic designation, and research specialization</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Employee Identification Number</span>
                  <span className="text-3xs text-slate-400 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" /> HR Verified
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Date of Joining Campus</span>
                  <span className="text-3xs text-slate-400 font-mono flex items-center gap-1">
                    <Lock className="w-3 h-3" /> HR Verified
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.joiningDate}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Highest Qualification</label>
                <input
                  type="text"
                  name="highestQualification"
                  value={formData.highestQualification}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Employment Status</label>
                <input
                  type="text"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Specialization & Research Focus</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PASSWORD & SECURITY */}
        {/* ========================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
                <Lock className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-base font-bold font-heading text-slate-900">Security Settings & Change Password</h2>
                <p className="text-3xs text-slate-500">Update account password and manage authentication parameters</p>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Leave blank to keep current password"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="hidden md:block" />

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Min 8 chars, numbers & special symbols"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: LOGIN HISTORY */}
        {/* ========================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 font-heading">Personal Authentication Audit History</h3>
                <p className="text-3xs text-slate-500">Security log of your authentication events, device agents, and IP addresses.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b font-extrabold text-3xs uppercase tracking-wider">
                    <th className="p-3">Login Timestamp</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Device / Web Browser</th>
                    <th className="p-3">Security Event</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userLoginHistory.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-800">{log.timestamp}</td>
                      <td className="p-3 font-mono font-bold text-indigo-700">{log.ipAddress}</td>
                      <td className="p-3 text-slate-600">{log.device}</td>
                      <td className="p-3">
                        <span className="font-mono text-3xs font-bold px-2 py-0.5 bg-slate-100 rounded border">
                          {log.event}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 text-3xs font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BAR */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-3xs text-slate-500 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Profile edits automatically update HR Records & QEC Audit Ledger.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetForm}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#1E7B4E] hover:bg-[#165534] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
