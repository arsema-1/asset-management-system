'use client';

import { useState } from 'react';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { getUser } from '@/lib/api';
import { useAuth } from '@/components/shared/AuthGuard';

export default function TopNav() {
  const { logout } = useAuth();
  const user = getUser();
  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : 'AU';
  const [menuOpen, setMenuOpen] = useState(false);

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
          <button className="p-xs rounded-full hover:bg-surface-container transition-colors relative">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
          </button>
        </div>
        <div className="h-8 w-px bg-outline-variant" />
        <div className="relative">
          <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-sm cursor-pointer hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <p className="text-label-md font-bold text-on-surface leading-tight">
                {user ? `${user.first_name} ${user.last_name}` : 'Admin'}
              </p>
              <p className="text-label-sm text-on-surface-variant leading-tight">{user?.position ?? 'Administrator'}</p>
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
