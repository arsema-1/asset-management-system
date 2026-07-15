'use client';

import { useState, useEffect } from 'react';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { getUser } from '@/lib/api';
import { useAuth } from '@/components/shared/AuthGuard';

export default function TopNav() {
  const { logout } = useAuth();
  const [user, setUser] = useState(getUser());
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : 'AU';

  // Defer localStorage read to avoid hydration mismatch with server render
  useEffect(() => {
    setUser(getUser());
  }, []);

  const fetchNotifications = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';
    if (!token) return;
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    fetch(`${base}/users/me/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => {
        if (j.success && Array.isArray(j.data)) {
          setNotifications(j.data);
          setUnreadCount(j.data.filter((n: any) => !n.is_read).length);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    try {
      await fetch(`${base}/users/me/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    try {
      await fetch(`${base}/users/me/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  };

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center h-16 px-lg bg-surface-container-lowest border-b border-outline-variant shadow-sm">
      <div className="flex items-center flex-1 max-w-2xl pl-10 lg:pl-0">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input className="w-full bg-surface-container-low border-none rounded-lg pl-xl py-xs text-body-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Search assets, users, or tickets..." type="text" />
        </div>
      </div>

      <div className="flex items-center gap-lg">
        <div className="flex items-center gap-md">
          <ThemeToggle />
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
            {showNotifications && (
              <div className="absolute right-0 top-10 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-96">
                <div className="px-md py-sm border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <h4 className="text-label-sm font-bold text-on-surface">Notifications ({unreadCount} unread)</h4>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-[10px] text-primary hover:underline font-bold">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto divide-y divide-outline-variant flex-1 max-h-72">
                  {notifications.length === 0 ? (
                    <p className="p-md text-center text-body-sm text-on-surface-variant">No notifications yet</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => { handleMarkRead(n.id); }}
                        className={`p-sm hover:bg-surface-container-low transition-colors cursor-pointer text-left flex gap-sm ${!n.is_read ? 'bg-primary/5' : ''}`}
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">
                          {n.type === 'maintenance' ? 'build' : n.type === 'request' ? 'task_alt' : 'info'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-body-sm font-semibold truncate text-on-surface ${!n.is_read ? 'font-bold' : ''}`}>{n.title}</p>
                          <p className="text-label-sm text-on-surface-variant mt-0.5 line-clamp-2">{n.body}</p>
                          <span className="text-[9px] text-on-surface-variant block mt-1">{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="h-8 w-px bg-outline-variant" />
        <div className="relative">
          <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-sm cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-label-md font-bold text-on-surface leading-tight">
                {user ? `${user.first_name} ${user.last_name}` : 'Admin'}
              </p>
              <p className="text-label-sm text-on-surface-variant leading-tight" suppressHydrationWarning>{user?.position ?? 'Administrator'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-label-md border border-outline-variant">
              {initials}
            </div>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
              <button onClick={logout} className="w-full flex items-center gap-sm px-md py-sm text-body-sm text-error hover:bg-error-container transition-colors">
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
