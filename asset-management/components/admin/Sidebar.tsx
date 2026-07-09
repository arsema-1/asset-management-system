'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <aside className="w-sidebar-expanded min-h-screen fixed left-0 top-0 bg-surface-container-low flex flex-col h-full py-lg px-md z-50 border-r border-outline-variant">
      {/* Logo */}
      <div className="mb-xl px-sm">
        <h1 className="text-headline-md font-bold text-primary">AssetPro</h1>
        <p className="text-label-md text-on-surface-variant">Enterprise Manager</p>
      </div>

      {/* Nav Links */}
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

      {/* Bottom Actions */}
      <div className="mt-auto space-y-base pt-lg">
        <Link
          href="/admin/assets/new"
          className="w-full bg-primary text-on-primary py-sm rounded-xl font-bold flex items-center justify-center gap-sm hover:opacity-90 transition-opacity mb-lg"
        >
          <span className="material-symbols-outlined">add</span>
          <span>New Asset</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-md px-sm py-md rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-label-md">Settings</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-md px-sm py-md rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined">help</span>
          <span className="text-label-md">Support</span>
        </Link>
      </div>
    </aside>
  );
}
