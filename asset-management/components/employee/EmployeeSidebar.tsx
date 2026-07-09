'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <aside className="w-sidebar-expanded min-h-screen fixed left-0 top-0 bg-surface-container-low flex flex-col py-lg px-md z-50">
      <div className="mb-xl px-sm">
        <h1 className="text-headline-md font-bold text-primary">AssetPro</h1>
        <p className="text-label-sm text-on-surface-variant">Enterprise Manager</p>
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
        <Link href="#" className="flex items-center gap-md p-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-label-md">Settings</span>
        </Link>
        <Link href="#" className="flex items-center gap-md p-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined">help</span>
          <span className="text-label-md">Support</span>
        </Link>
      </div>
    </aside>
  );
}
