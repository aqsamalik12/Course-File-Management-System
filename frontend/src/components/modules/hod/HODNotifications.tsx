import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const HODNotifications: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('cfms_token');
      const res = await fetch('/api/hod/notifications', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'x-user-id': currentUser?.id || '',
          'x-user-role': currentUser?.role || 'HOD',
          'x-department-id': currentUser?.departmentId || ''
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.data || []);
      } else {
        setError(data.message || 'Unable to load notifications.');
      }
    } catch {
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Header ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-1.5 border border-emerald-200/70">
            <Bell className="w-3.5 h-3.5" />
            <span>HOD Notifications</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System alerts and registration request alerts strictly routed to your department
          </p>
        </div>

        <button
          onClick={fetchNotifications}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ─── Notifications List ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
            <p className="font-bold text-slate-700">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center text-xs text-rose-700 space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="font-bold">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-slate-500 space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No notifications found.</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are all caught up! New registration alerts for your department will show here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div key={n.id} className="p-5 hover:bg-slate-50/60 transition-colors flex items-start gap-4">
                <div className="mt-0.5 shrink-0">
                  {n.type === 'success' && (
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  {n.type === 'warning' && (
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  )}
                  {n.type === 'error' && (
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                  {(n.type === 'info' || !n.type) && (
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                      <Info className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    <span className="text-2xs font-semibold text-slate-400">
                      {n.timestamp || n.created_at ? new Date(n.timestamp || n.created_at).toLocaleString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
