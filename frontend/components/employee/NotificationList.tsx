'use client';

import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const typeStyles: Record<string, string> = {
  assignment: 'status-assigned', request: 'status-available',
  maintenance: 'status-maintenance', system: 'status-retired', return: 'status-maintenance',
};
const typeIcons: Record<string, string> = {
  assignment: 'inventory_2', request: 'task_alt',
  maintenance: 'build', system: 'info', return: 'assignment_return',
};

function getApiBase() {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
}
function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () => {
    fetch(`${getApiBase()}/users/me/notifications`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(j => setNotifications(Array.isArray(j.data) ? j.data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchNotifications, []);

  const markRead = (id: string) => {
    fetch(`${getApiBase()}/users/me/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${getToken()}` },
    }).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = () => {
    fetch(`${getApiBase()}/users/me/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${getToken()}` },
    }).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const visible = activeTab === 'unread' ? notifications.filter(n => !n.is_read) : notifications;

  const tabs = [
    { key: 'all' as const, label: 'All Notifications' },
    { key: 'unread' as const, label: `Unread (${unreadCount})` },
  ];

  return (
    <div className="space-y-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-base">
            <span>Portal</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-medium">Notifications</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">System Notifications</h2>
        </div>
        <div className="flex items-center gap-sm">
          <button onClick={markAllRead} className="flex items-center gap-sm px-md py-sm bg-surface border border-outline-variant text-on-surface text-label-md rounded-lg hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px]">done_all</span>
            Mark all as read
          </button>
          <button onClick={fetchNotifications} className="flex items-center gap-sm px-md py-sm bg-primary text-on-primary text-label-md rounded-lg hover:opacity-90">
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="flex border-b border-outline-variant px-md">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-md py-md text-label-md transition-colors ${activeTab === tab.key ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="divide-y divide-outline-variant">
          {loading && <p className="p-lg text-on-surface-variant">Loading notifications...</p>}
          {!loading && visible.length === 0 && (
            <div className="p-xl text-center">
              <span className="material-symbols-outlined text-[48px] text-outline-variant block mb-md">notifications_none</span>
              <p className="text-body-md text-on-surface-variant">No notifications yet.</p>
            </div>
          )}
          {visible.map(n => {
            const cls = typeStyles[n.type] ?? 'status-retired';
            const icon = typeIcons[n.type] ?? 'notifications';
            return (
              <div key={n.id} onClick={() => markRead(n.id)}
                className={`flex gap-md p-lg cursor-pointer transition-colors hover:bg-surface-container-low ${!n.is_read ? 'bg-primary/5' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${cls}`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className={`flex-1 min-w-0 ${n.is_read ? 'opacity-70' : ''}`}>
                  <div className="flex justify-between items-start mb-xs">
                    <span className={`px-sm py-0.5 rounded-full text-label-sm uppercase tracking-wider font-bold ${cls}`}>{n.type}</span>
                    <span className="text-body-sm text-on-surface-variant whitespace-nowrap ml-md">{timeAgo(n.created_at)}</span>
                  </div>
                  <h3 className="text-title-lg font-bold text-on-surface mb-xs flex items-center gap-sm">
                    {n.title}
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed">{n.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="p-lg rounded-xl bg-secondary-container text-on-secondary-container flex items-start gap-md border border-outline-variant">
          <span className="material-symbols-outlined text-primary">notifications_active</span>
          <div>
            <h4 className="text-title-lg font-bold mb-xs">Real-time Alerts</h4>
            <p className="text-body-sm opacity-90">You'll be notified immediately when admin approves or rejects your asset requests. Check this page regularly for updates.</p>
          </div>
        </div>
        <div className="p-lg rounded-xl bg-tertiary-container text-on-tertiary-container flex items-start gap-md border border-outline-variant">
          <span className="material-symbols-outlined">support_agent</span>
          <div>
            <h4 className="text-title-lg font-bold mb-xs">Need Assistance?</h4>
            <p className="text-body-sm opacity-90">If you received an incorrect notification, contact IT support immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
