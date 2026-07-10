'use client';

import { useState } from 'react';

interface Notification {
  id: string;
  type: string;
  icon: string;
  title: string;
  time: string;
  body: string;
  unread: boolean;
  actions?: { label: string; primary?: boolean }[];
}

const initial: Notification[] = [
  {
    id: '1', type: 'Assignment', icon: 'inventory_2',
    title: 'New asset assigned: LG Monitor', time: '2 mins ago',
    body: 'A new 27" LG UltraFine Monitor has been assigned to your workspace (ID: MON-2024-089). Please confirm receipt in the My Assets section.',
    unread: true,
    actions: [{ label: 'View Asset', primary: true }, { label: 'Dismiss' }],
  },
  {
    id: '2', type: 'Request', icon: 'task_alt',
    title: 'Your request for iPhone 15 was approved', time: '1 hour ago',
    body: 'Good news! Your equipment request #RQ-9921 for an Apple iPhone 15 (128GB, Blue) has been approved by IT Management. It will be ready for pickup tomorrow at the central IT hub.',
    unread: true,
  },
  {
    id: '3', type: 'Maintenance', icon: 'build',
    title: 'Maintenance completed for MacBook Pro #1042', time: 'Today, 9:15 AM',
    body: 'The scheduled battery service for your workstation has been successfully completed. All hardware diagnostics passed. No further action is required.',
    unread: false,
  },
  {
    id: '4', type: 'System', icon: 'info',
    title: 'Portal maintenance scheduled for Sunday', time: 'Yesterday',
    body: 'The AssetPortal will be undergoing routine database maintenance this Sunday between 02:00 and 04:00 UTC. Expect intermittent downtime during this window.',
    unread: false,
  },
  {
    id: '5', type: 'Request', icon: 'assignment_return',
    title: 'Return processed: iPad Air #082', time: 'Oct 24, 2023',
    body: 'Your return request for iPad Air (Ref: #IP-082) has been fully processed and the asset has been removed from your inventory.',
    unread: false,
  },
];

const typeStyles: Record<string, string> = {
  Assignment: 'status-assigned',
  Request: 'status-available',
  Maintenance: 'status-maintenance',
  System: 'status-retired',
};

export default function NotificationList() {
  const [notifications, setNotifications] = useState(initial);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, unread: false } : n));

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const visible = notifications.filter((n) => {
    if (activeTab === 'unread') return n.unread;
    return true;
  });

  const tabs = [
    { key: 'all', label: 'All Notifications' },
    { key: 'unread', label: `Unread (${unreadCount})` },
    { key: 'archived', label: 'Archived' },
  ] as const;

  return (
    <div className="space-y-lg">
      {/* Header */}
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
          <button
            onClick={markAllRead}
            className="flex items-center gap-sm px-md py-sm bg-surface border border-outline-variant text-on-surface text-label-md rounded-lg hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">done_all</span>
            Mark all as read
          </button>
          <button className="flex items-center gap-sm px-md py-sm bg-primary text-on-primary text-label-md rounded-lg shadow-sm hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filters
          </button>
        </div>
      </div>

      {/* Notification card */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-outline-variant px-md">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-md py-md text-label-md transition-colors ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="divide-y divide-outline-variant">
          {visible.map((n) => {
            const cls = typeStyles[n.type] ?? 'status-retired';
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex gap-md p-lg cursor-pointer transition-colors hover:bg-surface-container-low ${n.unread ? 'bg-surface-container-low/30' : ''}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${cls}`}>
                  <span className="material-symbols-outlined">{n.icon}</span>
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 ${!n.unread ? 'opacity-80' : ''}`}>
                  <div className="flex justify-between items-start mb-xs">
                    <span className={`px-sm py-0.5 rounded-full text-label-sm uppercase tracking-wider font-bold ${cls}`}>
                      {n.type}
                    </span>
                    <span className="text-body-sm text-on-surface-variant whitespace-nowrap ml-md">{n.time}</span>
                  </div>
                  <h3 className="text-title-lg font-bold text-on-surface mb-xs flex items-center gap-sm">
                    {n.title}
                    {n.unread && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </h3>
                  <p className="text-body-md text-on-surface-variant leading-relaxed mb-md">{n.body}</p>
                  {n.actions && (
                    <div className="flex gap-sm">
                      {n.actions.map((a) => (
                        <button
                          key={a.label}
                          onClick={(e) => e.stopPropagation()}
                          className={`px-md py-sm text-label-md rounded font-medium hover:opacity-90 transition-opacity ${
                            a.primary
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-high'
                          }`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-md bg-surface-container-lowest text-center">
          <button className="text-primary text-label-md font-bold hover:underline">
            View all past notifications
          </button>
        </div>
      </div>

      {/* Tips banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div className="p-lg rounded-xl bg-secondary-container text-on-secondary-container flex items-start gap-md border border-outline-variant">
          <span className="material-symbols-outlined text-primary">lightbulb</span>
          <div>
            <h4 className="text-title-lg font-bold mb-xs">Manage Alerts</h4>
            <p className="text-body-sm opacity-90">Customize which system events trigger mobile or desktop notifications in your account settings.</p>
          </div>
        </div>
        <div className="p-lg rounded-xl bg-tertiary-container text-on-tertiary-container flex items-start gap-md border border-outline-variant">
          <span className="material-symbols-outlined">support_agent</span>
          <div>
            <h4 className="text-title-lg font-bold mb-xs">Need Assistance?</h4>
            <p className="text-body-sm opacity-90">If you received an incorrect notification regarding an asset assignment, please contact support immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
