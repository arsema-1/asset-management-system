'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Notification } from './types';
import { getToken, getUser, type User } from './api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

// ── Fetch notifications ────────────────────────────────
export function useNotifications(pollInterval = 15000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/users/me/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => {
        if (j.success && Array.isArray(j.data)) {
          setNotifications(j.data);
          setUnreadCount(j.data.filter((n: Notification) => !n.is_read).length);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchNotifications();
    if (pollInterval > 0) {
      const interval = setInterval(fetchNotifications, pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, pollInterval]);

  const markRead = useCallback((id: string) => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/users/me/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/users/me/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  return { notifications, unreadCount, fetchNotifications, markRead, markAllRead };
}

// ── Hydration-safe user ────────────────────────────────
export function useUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return user;
}
