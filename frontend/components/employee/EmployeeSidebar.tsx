'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/employee/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/employee/assets', icon: 'inventory_2', label: 'Assets' },
  { href: '/employee/requests', icon: 'list_alt', label: 'Requests' },
  { href: '/employee/returns', icon: 'assignment_return', label: 'Returns' },
  { href: '/employee/notifications', icon: 'notifications', label: 'Notifications' },
  { href: '/employee/profile', icon: 'badge', label: 'Profile' },
];

export default function EmployeeSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const sidebar = document.getElementById('employee-sidebar');
      if (sidebar && !sidebar.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm"
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        id="employee-sidebar"
        className={`w-sidebar-expanded min-h-screen fixed left-0 top-0 bg-surface-container-low flex flex-col py-lg px-md z-50 border-r border-outline-variant transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Close — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-container-high transition-colors"
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="mb-xl px-sm">
          <Image src="/images/AssetFlow_logo-removebg-preview.png" alt="AssetFlow" width={120} height={36} className="object-contain" />
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-md p-sm rounded-lg text-label-md transition-colors ${
                  active
                    ? 'text-primary font-bold border-r-2 border-primary bg-surface-container-high'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-lg border-t border-outline-variant space-y-1">
          <Link
            href="/employee/settings"
            className={`flex items-center gap-md p-sm rounded-lg transition-colors ${
              pathname === '/employee/settings'
                ? 'text-primary font-bold bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-label-md">Settings</span>
          </Link>
          <Link
            href="/employee/support"
            className={`flex items-center gap-md p-sm rounded-lg transition-colors ${
              pathname === '/employee/support'
                ? 'text-primary font-bold bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined">help</span>
            <span className="text-label-md">Support</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
