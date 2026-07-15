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
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const typeStyles: Record<string, string> = {
  assignment: 'status-assigned',
  request: 'status-available',
  maintenance: 'status-maintenance',
  system: 'status-retired',
  return: 'status-maintenance',
};

const typeIcons: Record<string, string> = {
  assignment: 'inventory_2', request: 'task_alt',
  maintenance: 'build', system: 'info', return: 'assignment_return',
};

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

  const fetchNotifications = () => {
    fetch(`${base}/users/me/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => setNotifications(j.data ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetchNotifications, []);

  const markRead = (id: string) => {
    fetch(`${base}/users/me/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = () => {
    fetch(`${base}/users/me/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
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
          <h2 className="text-headline-lg font-bold text-on-surface">System Notifications</h2>
        </div>
        <div className="flex items-center gap-sm">
          <button onClick={markAllRead} className="flex items-center gap-sm px-md py-sm bg-surface border border-outline-variant text-on-surface text-label-md rounded-lg hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[20px]">done_all</span>
            Mark all as read
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
          {loading && <p className="p-lg text-on-surface-variant">Loading...</p>}
          {!loading && visible.length === 0 && (
            <p className="p-lg text-on-surface-variant text-center">No notifications.</p>
          )}
          {visible.map(n => {
            const cls = typeStyles[n.type] ?? 'status-retired';
            const icon = typeIcons[n.type] ?? 'notifications';
            return (
              <div key={n.id} onClick={() => markRead(n.id)}
                className={`flex gap-md p-lg cursor-pointer transition-colors hover:bg-surface-container-low ${!n.is_read ? 'bg-surface-container-low/30' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${cls}`}>
                  <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className={`flex-1 min-w-0 ${n.is_read ? 'opacity-80' : ''}`}>
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
    </div>
  );
}
