import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, FileText, ArrowRight } from 'lucide-react';
import { timeAgo } from '../lib/utils';

export const NotificationsPage: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Grievance & Dispatch Notifications
          </h1>
          <p className="text-xs text-slate-500">Live alerts regarding your reported civic issues and status milestones</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 font-bold hover:bg-blue-50 rounded-lg transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-300" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationAsRead(n.id);
                if (n.issueId) {
                  onNavigate(`issue_detail_${n.issueId}`);
                }
              }}
              className={`p-4 flex items-start gap-4 hover:bg-slate-50 cursor-pointer transition ${
                !n.isRead ? 'bg-blue-50/40' : ''
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                  !n.isRead ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'
                }`}
              />

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                {n.ticketNumber && (
                  <span className="inline-block text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {n.ticketNumber}
                  </span>
                )}
              </div>

              <ArrowRight className="w-4 h-4 text-slate-300 mt-2 shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
