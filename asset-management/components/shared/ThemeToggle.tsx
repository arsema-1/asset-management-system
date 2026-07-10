'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme, Theme } from '@/contexts/ThemeContext';

const themes: { value: Theme; label: string; icon: string }[] = [
  { value: 'default',      label: 'Default',      icon: 'palette' },
  { value: 'dark',         label: 'Dark',          icon: 'dark_mode' },
  { value: 'protanopia',   label: 'Protanopia',    icon: 'visibility' },
  { value: 'deuteranopia', label: 'Deuteranopia',  icon: 'visibility' },
  { value: 'tritanopia',   label: 'Tritanopia',    icon: 'visibility' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = themes.find((t) => t.value === theme)!;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-xs rounded-full hover:bg-surface-container transition-colors flex items-center gap-xs"
        title="Change theme"
        aria-label="Change theme"
      >
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
          {current.icon}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-sm w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden">
          <p className="px-md py-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
            Theme
          </p>
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => { setTheme(t.value); setOpen(false); }}
              className={`w-full flex items-center gap-md px-md py-sm text-body-sm hover:bg-surface-container-high transition-colors ${
                theme === t.value ? 'text-primary font-bold' : 'text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
              {t.label}
              {theme === t.value && (
                <span className="material-symbols-outlined text-[16px] ml-auto">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
