'use client';

import { useState } from 'react';
import { useTheme, Theme } from '@/contexts/ThemeContext';

const tabs = [
  { id: 'appearance', icon: 'palette', label: 'Appearance' },
  { id: 'notifications', icon: 'notifications', label: 'Notifications' },
  { id: 'preferences', icon: 'tune', label: 'Preferences' },
] as const;

type TabId = (typeof tabs)[number]['id'];

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

function NotificationSettings() {
  const preferences = [
    { title: 'Asset Assignments', desc: 'When a new asset is assigned to you.', enabled: true },
    { title: 'Request Updates', desc: 'When your asset requests are approved or denied.', enabled: true },
    { title: 'Maintenance Notices', desc: 'When scheduled maintenance affects your devices.', enabled: true },
    { title: 'Return Confirmations', desc: 'When your asset returns are processed.', enabled: true },
    { title: 'System Announcements', desc: 'Portal maintenance and company-wide updates.', enabled: false },
    { title: 'Email Digest', desc: 'Weekly summary of your asset activity.', enabled: false },
  ];

  return (
    <section className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
      <h3 className="text-title-lg font-bold text-on-surface mb-md">Notification Preferences</h3>
      <p className="text-body-sm text-on-surface-variant mb-xl">
        Choose which notifications you receive in the portal and by email.
      </p>

      <div className="space-y-lg divide-y divide-outline-variant">
        {preferences.map((pref) => (
          <div key={pref.title} className="flex items-center justify-between pt-lg first:pt-0">
            <div>
              <p className="text-body-md font-medium text-on-surface">{pref.title}</p>
              <p className="text-body-sm text-on-surface-variant">{pref.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-lg">
              <input type="checkbox" className="sr-only peer" defaultChecked={pref.enabled} />
              <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}

function PreferenceSettings() {
  return (
    <section className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
      <h3 className="text-title-lg font-bold text-on-surface mb-md">Regional Preferences</h3>
      <p className="text-body-sm text-on-surface-variant mb-xl">
        Set your language, timezone, and date format preferences.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
        <div className="space-y-sm">
          <label className="text-label-sm text-on-surface block">Language</label>
          <select
            defaultValue="en-us"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="en-us">English (United States)</option>
            <option value="es">Spanish (ES)</option>
            <option value="de">German (DE)</option>
          </select>
        </div>
        <div className="space-y-sm">
          <label className="text-label-sm text-on-surface block">Timezone</label>
          <select
            defaultValue="eastern"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="eastern">(GMT-05:00) Eastern Time</option>
            <option value="pacific">(GMT-08:00) Pacific Time</option>
            <option value="london">(GMT+00:00) London</option>
          </select>
        </div>
        <div className="space-y-sm">
          <label className="text-label-sm text-on-surface block">Date Format</label>
          <select
            defaultValue="mdy"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="mdy">MM/DD/YYYY</option>
            <option value="dmy">DD/MM/YYYY</option>
            <option value="ymd">YYYY-MM-DD</option>
          </select>
        </div>
        <div className="space-y-sm">
          <label className="text-label-sm text-on-surface block">Default Dashboard View</label>
          <select
            defaultValue="overview"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="overview">Overview</option>
            <option value="assets">My Assets</option>
            <option value="requests">My Requests</option>
          </select>
        </div>
      </div>
    </section>
  );
}

export default function EmployeeSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('appearance');

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
        <button className="bg-primary text-on-primary px-lg py-2 rounded-lg font-label-md flex items-center gap-sm hover:opacity-90 transition-all shadow-sm active:scale-95">
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-12 gap-gutter items-start">
        <nav className="col-span-12 lg:col-span-3 space-y-sm bg-surface-container-low p-md rounded-xl border border-outline-variant">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-md px-md py-3 rounded-lg transition-all ${
                  active
                    ? 'text-primary font-bold bg-surface-container-high border-r-2 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined">{tab.icon}</span>
                <span className="text-label-md">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="col-span-12 lg:col-span-9 space-y-lg">
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'preferences' && <PreferenceSettings />}
        </div>
      </div>
    </>
  );
}
