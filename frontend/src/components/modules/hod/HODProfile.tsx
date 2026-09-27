import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  User,
  Mail,
  Building2,
  Landmark,
  ShieldCheck,
  KeyRound,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Lock
} from 'lucide-react';

export const HODProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdStatus, setPwdStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('cfms_token');
      const res = await fetch('/api/hod/profile', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.data);
      } else {
        setError(data.message || 'Unable to load profile.');
      }
    } catch {
      setError('Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus(null);

    if (newPassword.length < 6) {
      setPwdStatus({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdStatus({ text: 'New password and confirm password do not match.', type: 'error' });
      return;
    }

    setPwdLoading(true);
    try {
      const token = localStorage.getItem('cfms_token');
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwdStatus({ text: 'Password updated successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwdStatus({ text: data.message || 'Failed to update password.', type: 'error' });
      }
    } catch {
      setPwdStatus({ text: 'Unable to update password. Please try again.', type: 'error' });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* ─── Header ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5 border border-emerald-200/70">
            <User className="w-3.5 h-3.5" />
            <span>HOD Account Overview</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            HOD Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your authenticated identity and assigned departmental scope
          </p>
        </div>

        <button
          onClick={fetchProfile}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-xs text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
          <p className="font-bold text-slate-700">Loading profile details...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-16 text-center text-xs text-rose-700 space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="font-bold">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity & Scope Card */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
            <h2 className="text-base font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              Official Profile & Scope
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">HOD Full Name</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{profile?.name}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Official Email</span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{profile?.email}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Portal Role</span>
                <p className="text-sm font-bold text-emerald-800 mt-0.5">Head of Department (HOD)</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-2xs font-bold text-slate-400 uppercase">Account Status</span>
                <div className="mt-0.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Strict Admin Assignment Scope Notice */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Assigned Scope (Admin Controlled)</span>
              </div>
              <p className="text-2xs text-emerald-800 leading-relaxed">
                Your departmental access scope is established and maintained directly by the University System Administrator. It cannot be altered manually.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white rounded-xl border border-emerald-200/60 text-xs">
                  <span className="text-2xs text-slate-400 font-bold uppercase">Assigned Campus</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{profile?.assignedCampus}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200/60 text-xs">
                  <span className="text-2xs text-slate-400 font-bold uppercase">Assigned Department</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{profile?.assignedDepartment}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <KeyRound className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-extrabold text-slate-900 font-heading">
                Change Password
              </h2>
            </div>

            {pwdStatus && (
              <div
                className={`p-3 rounded-xl text-2xs font-bold border ${
                  pwdStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {pwdStatus.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-600 uppercase">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-600 uppercase">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-slate-600 uppercase">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-emerald-950/20 flex items-center justify-center gap-1.5 mt-2"
              >
                {pwdLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                <span>Update Password</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
