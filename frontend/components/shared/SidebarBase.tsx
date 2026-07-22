'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { logoutUser } from '@/lib/api';
import type { SidebarConfig } from '@/lib/types';

interface Props {
  config: SidebarConfig;
  id: string;
}

export default function SidebarBase({ config, id }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const el = document.getElementById(id);
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, id]);

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
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        id={id}
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
          {config.logoSubtitle && (
            <p className="text-label-md text-on-surface-variant mt-xs">{config.logoSubtitle}</p>
          )}
        </div>

        <nav className="flex-1 space-y-1">
          {config.navItems.map((item) => {
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

        {/* CTA button if specified */}
        {config.cta && (
          <Link
            href={config.cta.href}
            className="w-full bg-primary text-on-primary py-sm rounded-xl font-bold flex items-center justify-center gap-sm hover:opacity-90 transition-opacity mb-lg"
          >
            <span className="material-symbols-outlined">{config.cta.icon}</span>
            <span>{config.cta.label}</span>
          </Link>
        )}

        {/* Bottom items */}
        <div className="mt-auto pt-lg border-t border-outline-variant space-y-1">
          {config.bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-md p-sm rounded-lg text-label-md transition-colors ${
                pathname === item.href
                  ? 'text-primary font-bold bg-surface-container-high'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Sign Out */}
        <button
          onClick={async () => {
            if (loggingOut) return;
            setLoggingOut(true);
            await logoutUser();
            router.push('/login');
          }}
          disabled={loggingOut}
          className="mt-2 flex w-full items-center gap-md p-sm rounded-lg text-label-md text-error hover:bg-error-container transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined">
            {loggingOut ? 'sync' : 'logout'}
          </span>
          <span>{loggingOut ? 'Signing out…' : 'Sign Out'}</span>
        </button>
      </aside>
    </>
  );
}
