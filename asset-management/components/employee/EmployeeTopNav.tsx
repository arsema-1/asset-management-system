'use client';

import { useState } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { getUser } from '@/lib/api';
import { useAuth } from '@/components/shared/AuthGuard';

export default function EmployeeTopNav() {
  const { logout } = useAuth();
  const user = getUser();
  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : 'AU';
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 h-16 bg-surface-container-lowest border-b border-outline-variant px-lg flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-xl flex-1 pl-10 lg:pl-0">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input className="w-full bg-surface-container border-none rounded-full pl-10 pr-4 py-2 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" placeholder="Search my assets..." type="text" />
        </div>
      </div>

      <div className="flex items-center gap-lg">
        <ThemeToggle />
        <Link href="/employee/notifications" className="text-on-surface-variant opacity-80 hover:opacity-100 transition-opacity relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest" />
        </Link>
        <div className="relative">
          <button onClick={() => setMenuOpen(o => !o)} className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-label-sm font-bold text-on-primary-container ring-2 ring-outline-variant hover:opacity-80 transition-opacity">
            {initials}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
              <div className="px-md py-sm border-b border-outline-variant">
                <p className="text-label-md font-bold text-on-surface">{user?.first_name} {user?.last_name}</p>
                <p className="text-label-sm text-on-surface-variant">{user?.email}</p>
              </div>
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
