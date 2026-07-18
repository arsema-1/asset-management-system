'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useAuth } from '@/components/shared/AuthGuard';
import { useUser, useNotifications } from '@/lib/hooks';
import { timeAgo } from '@/lib/utils';

interface Props {
  searchPlaceholder?: string;
  notificationLink?: string;
  showInlineNotifications?: boolean;
}

export default function TopNavBase({
  searchPlaceholder = 'Search...',
  notificationLink,
  showInlineNotifications = false,
}: Props) {
  const { logout } = useAuth();
  const user = useUser();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : 'AU';

  return (
    <header className="sticky top-0 z-40 h-16 bg-surface-container-lowest border-b border-outline-variant px-lg flex justify-between items-center shadow-sm">
      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-lg">
        <ThemeToggle />

        {/* Notifications */}
        {notificationLink ? (
          <Link
            href={notificationLink}
            className="text-on-surface-variant opacity-80 hover:opacity-100 transition-opacity relative"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center border-2 border-surface-container-lowest animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(s => !s)}
              className="p-xs rounded-full hover:bg-surface-container transition-colors relative"
            >
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center border-2 border-surface-container-lowest animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && showInlineNotifications && (
              <div className="absolute right-0 top-10 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-96">
                <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <h4 className="text-label-sm font-bold text-on-surface">
                    Notifications ({unreadCount} unread)
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-[10px] text-primary hover:underline font-bold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto divide-y divide-outline-variant flex-1 max-h-72">
                  {notifications.length === 0 ? (
                    <p className="p-md text-center text-body-sm text-on-surface-variant">
                      No notifications yet
                    </p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => { markRead(n.id); }}
                        className={`p-sm hover:bg-surface-container-low transition-colors cursor-pointer text-left flex gap-sm ${!n.is_read ? 'bg-primary/5' : ''}`}
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">
                          {n.type === 'maintenance' ? 'build' : n.type === 'request' ? 'task_alt' : 'info'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-body-sm font-semibold truncate text-on-surface ${!n.is_read ? 'font-bold' : ''}`}>
                            {n.title}
                          </p>
                          <p className="text-label-sm text-on-surface-variant mt-0.5 line-clamp-2">
                            {n.body}
                          </p>
                          <span className="text-[9px] text-on-surface-variant block mt-1">
                            {timeAgo(n.created_at)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {showInlineNotifications && <div className="h-8 w-px bg-outline-variant" />}

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-label-sm font-bold text-on-primary-container ring-2 ring-outline-variant hover:opacity-80 transition-opacity"
          >
            {initials}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-md py-sm border-b border-outline-variant">
                <p className="text-label-md font-bold text-on-surface">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-label-sm text-on-surface-variant">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-sm px-md py-sm text-body-sm text-error hover:bg-error-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
