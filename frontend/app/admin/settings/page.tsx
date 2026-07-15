'use client';

import { useState } from 'react';

const tabs = [
  { id: 'general', icon: 'settings', label: 'General' },
  { id: 'notifications', icon: 'hub', label: 'Notifications' },
] as const;

type TabId = (typeof tabs)[number]['id'];

function GeneralSettings() {
  return (
    <>
      <section className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
        <h3 className="text-title-lg font-title-lg text-on-surface mb-md">General Configuration</h3>
        <p className="text-body-sm text-on-surface-variant mb-xl">
          Update your organization details and global preferences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
          <div className="space-y-sm">
            <label className="text-label-sm font-label-sm text-on-surface block">Organization Name</label>
            <input
              type="text"
              defaultValue="AssetFlow Enterprise Solutions"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-sm">
            <label className="text-label-sm font-label-sm text-on-surface block">Primary Timezone</label>
            <select
              defaultValue="eastern"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="eastern">(GMT-05:00) Eastern Time (US & Canada)</option>
              <option value="pacific">(GMT-08:00) Pacific Time (US & Canada)</option>
              <option value="london">(GMT+00:00) London, United Kingdom</option>
            </select>
          </div>
          <div className="space-y-sm">
            <label className="text-label-sm font-label-sm text-on-surface block">Default Language</label>
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
            <label className="text-label-sm font-label-sm text-on-surface block">Currency</label>
            <select
              defaultValue="usd"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              <option value="usd">USD ($)</option>
              <option value="eur">EUR (€)</option>
              <option value="gbp">GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="mt-xl">
          <label className="text-label-sm font-label-sm text-on-surface block mb-md">Company Logo</label>
          <div className="flex items-center gap-xl border-2 border-dashed border-outline-variant rounded-xl p-lg bg-surface-container-low/50 hover:bg-surface-container-low/80 transition-colors">
            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center border border-outline-variant shadow-sm overflow-hidden shrink-0">
              <span className="text-4xl font-bold text-primary/80">AF</span>
            </div>
            <div className="space-y-sm">
              <p className="text-body-sm font-medium text-on-surface">Upload a new logo</p>
              <p className="text-label-sm text-on-surface-variant">SVG, PNG, or JPG (max. 800x400px). Max 2MB.</p>
              <label className="inline-flex items-center gap-sm cursor-pointer text-primary text-label-md font-bold hover:underline">
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                Change File
                <input type="file" accept="image/svg+xml,image/png,image/jpeg" className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
        <h3 className="text-title-lg font-title-lg text-on-surface mb-md">Security</h3>
        <p className="text-body-sm text-on-surface-variant mb-xl">
          Manage authentication, session policies, and access controls.
        </p>

        <div className="space-y-lg">
          <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
            <div>
              <p className="text-body-md font-medium text-on-surface">Two-Factor Authentication</p>
              <p className="text-body-sm text-on-surface-variant">
                Add an extra layer of security to admin accounts.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/30 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

          <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
            <div>
              <p className="text-body-md font-medium text-on-surface">Session Timeout</p>
              <p className="text-body-sm text-on-surface-variant">
                Automatically log out inactive users after a period.
              </p>
            </div>
            <select
              defaultValue="30"
              className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-1.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>
      </section>
    </>
  );
}

function NotificationSettings() {
  const preferences = [
    { title: 'Asset Assignments', desc: 'When assets are assigned or unassigned from employees.', enabled: true },
    { title: 'Maintenance Alerts', desc: 'When scheduled maintenance is due or overdue.', enabled: true },
    { title: 'New User Registrations', desc: 'When a new employee account is created.', enabled: false },
    { title: 'Low Stock Warnings', desc: 'When asset inventory drops below threshold.', enabled: true },
    { title: 'Report Generation', desc: 'When scheduled reports are ready for download.', enabled: false },
  ];

  return (
    <section className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
      <h3 className="text-title-lg font-title-lg text-on-surface mb-md">Notification Preferences</h3>
      <p className="text-body-sm text-on-surface-variant mb-xl">
        Configure which system events trigger alerts for administrators.
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

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general');

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-xs">
            <span>Organization</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">Settings</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">Admin Settings</h2>
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
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
        </div>
      </div>
    </>
  );
}
