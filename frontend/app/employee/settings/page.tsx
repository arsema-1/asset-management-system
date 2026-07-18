'use client';

import { useTheme, Theme } from '@/contexts/ThemeContext';

const themes: { value: Theme; label: string; icon: string }[] = [
  { value: 'default', label: 'Default', icon: 'palette' },
  { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  { value: 'protanopia', label: 'Protanopia', icon: 'visibility' },
  { value: 'deuteranopia', label: 'Deuteranopia', icon: 'visibility' },
  { value: 'tritanopia', label: 'Tritanopia', icon: 'visibility' },
];

function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <section className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
      <h3 className="text-title-lg font-bold text-on-surface mb-md">Appearance</h3>
      <p className="text-body-sm text-on-surface-variant mb-xl">
        Customize how AssetFlow looks on your device.
      </p>

      <div className="space-y-sm">
        <label className="text-label-sm font-label-sm text-on-surface block mb-md">Color Theme</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-sm">
          {themes.map((t) => {
            const active = theme === t.value;
            return (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex items-center gap-md p-md rounded-xl border transition-all text-left ${
                  active
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-outline-variant hover:bg-surface-container-low text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined">{t.icon}</span>
                <span className="text-label-md font-medium">{t.label}</span>
                {active && (
                  <span className="material-symbols-outlined text-[18px] ml-auto">check_circle</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function EmployeeSettingsPage() {
  return (
    <>
      <div className="flex items-center justify-between mb-lg">
        <div>
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-xs">
            <span>Account</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">Settings</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">Settings</h2>
        </div>
      </div>

      <div className="max-w-4xl">
        <AppearanceSettings />
      </div>
    </>
  );
}
