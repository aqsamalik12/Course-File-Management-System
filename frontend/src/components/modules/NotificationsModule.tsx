import React, { useState, useEffect } from 'react';
import { useCFMS } from '../../context/CFMSContext';
import { Bell, CheckCircle2, AlertTriangle, Trash2, Mail, ShieldAlert, CheckCheck } from 'lucide-react';

interface NotificationsModuleProps {
  activeModule?: string;
}

export const NotificationsModule: React.FC<NotificationsModuleProps> = ({ activeModule }) => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useCFMS();
  const [activeTab, setActiveTab] = useState<'all' | 'email' | 'system'>('all');

  useEffect(() => {
    if (activeModule === 'Email Notifications') {
      setActiveTab('email');
    } else if (activeModule === 'System Notifications') {
      setActiveTab('system');
    } else if (activeModule === 'All Notifications' || activeModule === 'Notifications') {
      setActiveTab('all');
    }
  }, [activeModule]);

  const filteredNotifications = notifications.filter((n: any) => {
    if (activeTab === 'email') {
      return n.type === 'email' || (n.title && n.title.toLowerCase().includes('email'));
    }
    if (activeTab === 'system') {
      return (
        n.type === 'system' ||
        n.type === 'warning' ||
        n.type === 'error' ||
        (n.title &&
          (n.title.toLowerCase().includes('system') ||
            n.title.toLowerCase().includes('security') ||
            n.title.toLowerCase().includes('alert') ||
            n.title.toLowerCase().includes('revision') ||
            n.title.toLowerCase().includes('approval')))
      );
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xs font-mono font-extrabold text-[#1E7B4E] uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Communication Hub
            </span>
            {unreadCount > 0 && (
              <span className="text-3xs font-bold text-white bg-indigo-600 px-2 py-0.5 rounded-full">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 font-heading mt-1">
            Notifications Center ({activeModule || 'System Notifications'})
          </h1>
          <p className="text-xs text-slate-500">
            Real-time system alerts, email notifications, approval updates, and contract milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearAllNotifications}
            className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Inbox</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center gap-1.5">
        {[
          { id: 'all', label: `All Notifications (${notifications.length})`, icon: Bell },
          { id: 'email', label: 'Email Alerts & Dispatches', icon: Mail },
          { id: 'system', label: 'System & Security Alerts', icon: ShieldAlert }
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

      {/* Notification List Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-xs overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Bell className="w-8 h-8 text-indigo-600/30 mx-auto" />
            <p className="font-bold text-slate-800">No notifications found in {activeTab} folder.</p>
            <p className="text-3xs text-slate-400">All alerts and activity notifications will appear here in real-time.</p>
          </div>
        ) : (
          filteredNotifications.map((n: any) => (
            <div
              key={n.id}
              onClick={() => markNotificationAsRead(n.id)}
              className={`p-4 flex items-start justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                !n.isRead ? 'bg-indigo-50/40' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    n.type === 'email'
                      ? 'bg-purple-100 text-purple-700'
                      : n.type === 'system' || n.type === 'warning' || n.type === 'error'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {n.type === 'email' ? (
                    <Mail className="w-4 h-4" />
                  ) : n.type === 'system' || n.type === 'warning' ? (
                    <ShieldAlert className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900">{n.title}</h4>
                    {n.type && (
                      <span className="px-2 py-0.2 rounded-full text-3xs font-mono font-bold bg-slate-100 text-slate-600 uppercase border border-slate-200">
                        {n.type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-3xs text-slate-400 mt-1.5 font-medium">{n.timestamp || 'Recently'}</p>
                </div>
              </div>

              {!n.isRead && (
                <span className="px-2 py-0.5 rounded-full text-3xs font-bold bg-indigo-600 text-white shrink-0 mt-1">
                  New
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
