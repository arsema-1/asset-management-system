'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/admin/assets', icon: 'inventory_2', label: 'Assets' },
  { href: '/admin/maintenance', icon: 'build', label: 'Maintenance' },
  { href: '/admin/assignments', icon: 'list_alt', label: 'Requests' },
  { href: '/admin/employees', icon: 'badge', label: 'Employees' },
  { href: '/admin/reports', icon: 'analytics', label: 'Reports' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const sidebar = document.getElementById('admin-sidebar');
      if (sidebar && !sidebar.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      {/* Mobile hamburger — shown in TopNav via prop, but also here as fallback */}
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
        id="admin-sidebar"
        className={`w-sidebar-expanded min-h-screen fixed left-0 top-0 bg-surface-container-low flex flex-col h-full py-lg px-md z-50 border-r border-outline-variant transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Close button — mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-container-high transition-colors"
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Logo */}
        <div className="mb-xl px-sm">
          <Image src="/images/AssetFlow_logo-removebg-preview.png" alt="AssetFlow" width={120} height={36} className="object-contain" />
          <p className="text-label-md text-on-surface-variant mt-xs">Enterprise Manager</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-base overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-md px-sm py-md rounded-lg text-label-md transition-colors ${
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

        {/* Bottom */}
        <div className="mt-auto space-y-base pt-lg">
          <Link
            href="/admin/assets/new"
            className="w-full bg-primary text-on-primary py-sm rounded-xl font-bold flex items-center justify-center gap-sm hover:opacity-90 transition-opacity mb-lg"
          >
            <span className="material-symbols-outlined">add</span>
            <span>New Asset</span>
          </Link>
          <Link
            href="/admin/settings"
            className={`flex items-center gap-md px-sm py-md rounded-lg transition-colors ${
              pathname === '/admin/settings'
                ? 'text-primary font-bold bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-label-md">Settings</span>
          </Link>
          <Link
            href="/admin/support"
            className={`flex items-center gap-md px-sm py-md rounded-lg transition-colors ${
              pathname === '/admin/support'
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
