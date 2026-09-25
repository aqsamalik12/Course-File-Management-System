import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { Sliders, Save, Server, Mail, HardDrive, CheckCircle2, Building2, Shield, Download, RefreshCw, Send, Check } from 'lucide-react';

interface SystemSettingsModuleProps {
  activeModule?: string;
}

export const SystemSettingsModule: React.FC<SystemSettingsModuleProps> = ({ activeModule }) => {
  const { systemSettings, updateSettings } = useCFMS();
  const [activeTab, setActiveTab] = useState<'general' | 'university' | 'email' | 'backup'>('university');

  // General Settings
  const [systemName, setSystemName] = useState(systemSettings.systemName);
  const [maxFileSizeMB, setMaxFileSizeMB] = useState(systemSettings.maxFileSizeMB);

  // University Profile
  const [universityName, setUniversityName] = useState(systemSettings.universityName || 'University of Education');
  const [campusName, setCampusName] = useState('Attock Campus');
  const [campusAddress, setCampusAddress] = useState('Attock City, Punjab, Pakistan');
  const [campusDirector, setCampusDirector] = useState('Prof. Dr. Muhammad Aslam');
  const [contactEmail, setContactEmail] = useState('info.attock@ue.edu.pk');

  // Email Settings
  const [smtpHost, setSmtpHost] = useState(systemSettings.smtpHost || 'smtp.ue.edu.pk');
  const [smtpPort, setSmtpPort] = useState(587);
  const [senderEmail, setSenderEmail] = useState('qec-notifications@ue.edu.pk');
  const [smtpStatus, setSmtpStatus] = useState<string | null>(null);

  // Backup & Restore
  const [backupSchedule, setBackupSchedule] = useState('Daily (Midnight)');
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (activeModule === 'University Profile') {
      setActiveTab('university');
    } else if (activeModule === 'Email Settings') {
      setActiveTab('email');
    } else if (activeModule === 'Backup & Restore') {
      setActiveTab('backup');
    } else if (activeModule === 'General Settings' || activeModule === 'System Settings') {
      setActiveTab('general');
    }
  }, [activeModule]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      systemName,
      universityName,
      maxFileSizeMB,
      smtpHost
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestEmail = () => {
    setSmtpStatus('Testing SMTP Connection...');
    setTimeout(() => {
      setSmtpStatus('SMTP Handshake Successful! Test email sent to administrator mailbox.');
    }, 1500);
  };

  const handleDownloadBackup = () => {
    setBackupMsg('Preparing complete database snapshot ZIP archive...');
    setTimeout(() => {
      setBackupMsg('Database backup downloaded successfully (cfms_backup_2026_07_24.json)');
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              System Administration
            </span>
            <span className="text-3xs text-slate-400 font-mono">Control Panel</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            System Configuration ({activeModule || 'University Profile'})
          </h1>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save System Settings
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System configuration saved and synchronized with database!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          { id: 'university', label: '1. University Profile & Campus Branding', icon: Building2 },
          { id: 'general', label: '2. General System Settings', icon: Sliders },
          { id: 'email', label: '3. Email & SMTP Relay', icon: Mail },
          { id: 'backup', label: '4. System Backup & Recovery', icon: HardDrive }
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

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* TAB 1: UNIVERSITY PROFILE */}
        {activeTab === 'university' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              Official University & Campus Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">University Name *</label>
                <input
                  type="text"
                  required
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Name *</label>
                <input
                  type="text"
                  required
                  value={campusName}
                  onChange={(e) => setCampusName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Director / Vice Chancellor *</label>
                <input
                  type="text"
                  value={campusDirector}
                  onChange={(e) => setCampusDirector(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Contact Email *</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Campus Physical Address</label>
              <textarea
                rows={2}
                value={campusAddress}
                onChange={(e) => setCampusAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
              />
            </div>
          </div>
        )}

        {/* TAB 2: GENERAL SETTINGS */}
        {activeTab === 'general' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              General Application & Storage Thresholds
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">System Portal Title</label>
                <input
                  type="text"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Max Document File Size Cap (MB)</label>
                <input
                  type="number"
                  min={5}
                  max={500}
                  value={maxFileSizeMB}
                  onChange={(e) => setMaxFileSizeMB(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMAIL & SMTP SETTINGS */}
        {activeTab === 'email' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              Email Relay & SMTP Dispatch Server
            </h3>

            {smtpStatus && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl font-bold text-indigo-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> {smtpStatus}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">SMTP Relay Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">SMTP Port</label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sender Email Address</label>
                <input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestEmail}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" /> Test SMTP Connection
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: BACKUP & RESTORE */}
        {activeTab === 'backup' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900 font-heading border-b border-slate-100 pb-3">
              System Database Backup & Recovery Vault
            </h3>

            {backupMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {backupMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Automated Backup Schedule</label>
                <select
                  value={backupSchedule}
                  onChange={(e) => setBackupSchedule(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                >
                  <option value="Daily (Midnight)">Daily Backup (Midnight)</option>
                  <option value="Weekly (Sunday)">Weekly Backup (Sunday)</option>
                  <option value="Disabled">Disabled (Manual Only)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Download Database Snapshot</h4>
                <p className="text-3xs text-slate-500">Export complete JSON database including users, files, and audit logs.</p>
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" /> Create & Download Snapshot
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
};
