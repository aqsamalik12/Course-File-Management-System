import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { Lock, Shield, Key, Smartphone, ShieldCheck, CheckCircle2, ShieldAlert, Monitor, LogOut, AlertTriangle, RefreshCw } from 'lucide-react';

interface SecurityCenterModuleProps {
  activeModule?: string;
}

interface LoginAttempt {
  id: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED_PASSWORD' | 'ACCOUNT_LOCKED';
  timestamp: string;
  browser: string;
}

interface ActiveSessionItem {
  id: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  loginTime: string;
  device: string;
  isCurrent: boolean;
}

export const SecurityCenterModule: React.FC<SecurityCenterModuleProps> = ({ activeModule }) => {
  const { systemSettings, updateSettings, usersList } = useCFMS();
  const [activeTab, setActiveTab] = useState<'attempts' | 'sessions' | 'policy'>('attempts');
  const [mfa, setMfa] = useState(systemSettings.mfaRequired);
  const [minPassLength, setMinPassLength] = useState(8);
  const [lockoutThreshold, setLockoutThreshold] = useState(5);
  const [passExpiryDays, setPassExpiryDays] = useState(90);

  // Mock Login Attempts
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([
    { id: 'att-1', userName: 'Prof. Ahmad Raza', userRole: 'REGULAR_TEACHER', ipAddress: '192.168.1.104', status: 'SUCCESS', timestamp: '2026-07-24 08:00:12', browser: 'Chrome 126 / Windows' },
    { id: 'att-2', userName: 'Elena Rostova', userRole: 'VISITING_TEACHER', ipAddress: '192.168.1.199', status: 'FAILED_PASSWORD', timestamp: '2026-07-24 07:45:30', browser: 'Firefox 125 / macOS' },
    { id: 'att-3', userName: 'Elena Rostova', userRole: 'VISITING_TEACHER', ipAddress: '192.168.1.199', status: 'ACCOUNT_LOCKED', timestamp: '2026-07-24 07:46:01', browser: 'Firefox 125 / macOS' },
    { id: 'att-4', userName: 'Dr. Sarah Khan', userRole: 'HOD', ipAddress: '192.168.1.102', status: 'SUCCESS', timestamp: '2026-07-24 06:30:15', browser: 'Safari 17 / macOS' },
    { id: 'att-5', userName: 'Dr. Robert Sterling', userRole: 'ADMIN', ipAddress: '192.168.1.1', status: 'SUCCESS', timestamp: '2026-07-24 06:00:00', browser: 'Edge 126 / Windows' }
  ]);

  // Mock Active Sessions
  const [activeSessions, setActiveSessions] = useState<ActiveSessionItem[]>([
    { id: 'sess-act-1', userName: 'Dr. Robert Sterling (Admin)', userRole: 'ADMIN', ipAddress: '192.168.1.1', loginTime: '2026-07-24 06:00 AM', device: 'Chrome / Windows 11', isCurrent: true },
    { id: 'sess-act-2', userName: 'Dr. Sarah Khan', userRole: 'HOD', ipAddress: '192.168.1.102', loginTime: '2026-07-24 06:30 AM', device: 'Safari / macOS Sonoma', isCurrent: false },
    { id: 'sess-act-3', userName: 'Prof. Ahmad Raza', userRole: 'REGULAR_TEACHER', ipAddress: '192.168.1.104', loginTime: '2026-07-24 08:00 AM', device: 'Edge / Windows 10', isCurrent: false }
  ]);

  useEffect(() => {
    if (activeModule === 'Active Sessions') {
      setActiveTab('sessions');
    } else if (activeModule === 'Password Policy') {
      setActiveTab('policy');
    } else if (activeModule === 'Login Attempts' || activeModule === 'Security Center') {
      setActiveTab('attempts');
    }
  }, [activeModule]);

  const toggleMfa = () => {
    setMfa(!mfa);
    updateSettings({ mfaRequired: !mfa });
  };

  const handleTerminateSession = (id: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClearFailedAttempts = () => {
    setLoginAttempts((prev) => prev.filter((a) => a.status === 'SUCCESS'));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Campus Cyber Security Shield
            </span>
            <span className="text-3xs text-slate-400 font-mono">QEC Policy Control</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Security Center & Policy Enforcement ({activeModule || 'Login Attempts'})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'attempts' && (
            <button
              onClick={handleClearFailedAttempts}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear Failed Attempts Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          { id: 'attempts', label: `1. Login Attempts Audit (${loginAttempts.length})`, icon: ShieldAlert },
          { id: 'sessions', label: `2. Active User Sessions (${activeSessions.length})`, icon: Monitor },
          { id: 'policy', label: '3. Password & Security Policy', icon: Key }
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

      {/* TAB 1: LOGIN ATTEMPTS */}
      {activeTab === 'attempts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Authentication & Login Attempts Audit</h3>
              <p className="text-3xs text-slate-500">Track successful logins, password failures, and security lockouts.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b font-extrabold text-3xs uppercase tracking-wider">
                  <th className="p-3">User & Role</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">User Agent / Device</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Authentication Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loginAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80">
                    <td className="p-3">
                      <span className="font-extrabold text-slate-900 block">{att.userName}</span>
                      <span className="text-3xs text-indigo-700 font-mono font-bold">{att.userRole}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{att.ipAddress}</td>
                    <td className="p-3 text-slate-500">{att.browser}</td>
                    <td className="p-3 font-mono text-slate-500 text-3xs">{att.timestamp}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 text-3xs font-extrabold rounded-full border ${
                          att.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : att.status === 'FAILED_PASSWORD'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">Active Portal Sessions Monitor</h3>
              <p className="text-3xs text-slate-500">Currently authenticated faculty members and administrator sessions.</p>
            </div>
          </div>

          <div className="space-y-3">
            {activeSessions.map((sess) => (
              <div key={sess.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-xs">{sess.userName}</h4>
                      {sess.isCurrent && (
                        <span className="px-2 py-0.2 text-3xs font-extrabold bg-emerald-600 text-white rounded-full">Your Session</span>
                      )}
                    </div>
                    <p className="text-3xs text-slate-500 mt-0.5">{sess.device} • IP: <strong className="font-mono text-slate-700">{sess.ipAddress}</strong></p>
                    <p className="text-3xs text-slate-400 font-mono mt-0.5">Logged in: {sess.loginTime}</p>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    onClick={() => handleTerminateSession(sess.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Terminate Session
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PASSWORD & SECURITY POLICY */}
      {activeTab === 'policy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* MFA Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Multi-Factor Authentication (MFA)</h3>
                  <p className="text-3xs text-slate-500">Require TOTP authenticator app for HOD & Admin logins</p>
                </div>
              </div>
              <button
                onClick={toggleMfa}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                  mfa ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    mfa ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-3xs text-slate-400 border-t pt-3">
              MFA status: <strong>{mfa ? 'ENFORCED (High Security)' : 'OPTIONAL'}</strong>
            </p>
          </div>

          {/* IP Whitelist Policy */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Attock Campus Subnet Whitelist</h3>
                <p className="text-3xs text-emerald-700 font-semibold">Active Range: 192.168.1.0/24</p>
              </div>
            </div>
            <p className="text-3xs text-slate-500 border-t pt-3">
              Restricts administrative HOD approvals to official university campus subnet addresses.
            </p>
          </div>

          {/* Password Complexity Policy */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-700 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Password Complexity Policy</h3>
                <p className="text-3xs text-purple-700 font-semibold">Min Length: {minPassLength} characters</p>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t text-xs">
              <label className="block font-bold text-slate-700">Minimum Password Character Length</label>
              <input
                type="number"
                min={6}
                max={20}
                value={minPassLength}
                onChange={(e) => setMinPassLength(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border rounded-lg font-mono font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Account Lockout Threshold Policy */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Failed Login Account Lockout</h3>
                <p className="text-3xs text-amber-700 font-semibold">Threshold: {lockoutThreshold} failed attempts</p>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t text-xs">
              <label className="block font-bold text-slate-700">Lock Account After Failed Attempts</label>
              <select
                value={lockoutThreshold}
                onChange={(e) => setLockoutThreshold(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border rounded-lg font-bold text-slate-800"
              >
                <option value={3}>3 Failed Attempts (Strict)</option>
                <option value={5}>5 Failed Attempts (Standard)</option>
                <option value={10}>10 Failed Attempts (Relaxed)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
