'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { removeToken } from '@/lib/api';

const tabs = [
  { id: 'general', icon: 'settings', label: 'General' },
  { id: 'security', icon: 'lock', label: 'Security' },
  { id: 'notifications', icon: 'hub', label: 'Notifications' },
] as const;
type TabId = (typeof tabs)[number]['id'];

const TIMEOUT_KEY = 'session_timeout_minutes';

function useSessionTimeout(minutes: number) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    if (minutes <= 0) return;
    timer.current = setTimeout(() => {
      removeToken();
      router.replace('/login?reason=timeout');
    }, minutes * 60 * 1000);
  }, [minutes, router]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(e => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, [reset]);
}

function GeneralSettings() {
  return (
    <section className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
      <h3 className="text-title-lg font-bold text-on-surface mb-md">General Configuration</h3>
      <p className="text-body-sm text-on-surface-variant mb-xl">Update your organization details and global preferences.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
        {[
          { label: 'Organization Name', type: 'input', defaultValue: 'AssetFlow Enterprise Solutions' },
          { label: 'Support Email', type: 'input', defaultValue: 'support@assetflow.io' },
        ].map(f => (
          <div key={f.label} className="space-y-sm">
            <label className="text-label-sm text-on-surface block">{f.label}</label>
            <input type="text" defaultValue={f.defaultValue}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          </div>
        ))}
        <div className="space-y-sm">
          <label className="text-label-sm text-on-surface block">Primary Timezone</label>
          <select defaultValue="eastern" className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option value="eastern">(GMT-05:00) Eastern Time</option>
            <option value="pacific">(GMT-08:00) Pacific Time</option>
            <option value="utc">(GMT+00:00) UTC</option>
          </select>
        </div>
        <div className="space-y-sm">
          <label className="text-label-sm text-on-surface block">Currency</label>
          <select defaultValue="usd" className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-2 text-body-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
            <option value="usd">USD ($)</option>
            <option value="eur">EUR (€)</option>
            <option value="gbp">GBP (£)</option>
          </select>
        </div>
      </div>
    </section>
  );
}

function SecuritySettings() {
  const [timeout, setTimeoutMinutes] = useState<number>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(TIMEOUT_KEY) : null;
    return saved ? parseInt(saved, 10) : 30;
  });

  const handleTimeoutChange = (val: number) => {
    setTimeoutMinutes(val);
    localStorage.setItem(TIMEOUT_KEY, String(val));
  };

  return (
    <section className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm space-y-lg">
      <div>
        <h3 className="text-title-lg font-bold text-on-surface mb-xs">Security Settings</h3>
        <p className="text-body-sm text-on-surface-variant">Manage session and access controls.</p>
      </div>

      <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
        <div>
          <p className="text-body-md font-medium text-on-surface">Session Timeout</p>
          <p className="text-body-sm text-on-surface-variant">Auto-logout after period of inactivity. Takes effect immediately.</p>
        </div>
        <select value={timeout} onChange={e => handleTimeoutChange(parseInt(e.target.value, 10))}
          className="bg-surface-container-low border border-outline-variant rounded-lg px-md py-1.5 text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value={0}>Disabled</option>
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
          <option value={120}>2 hours</option>
        </select>
      </div>

      <div className="flex items-center gap-sm p-md bg-primary/5 border border-primary/20 rounded-lg">
        <span className="material-symbols-outlined text-primary text-[20px]">info</span>
        <p className="text-body-sm text-on-surface">
          Session timeout resets on any mouse, keyboard, or scroll activity.
          {timeout > 0 ? ` Current setting: ${timeout} minutes.` : ' Currently disabled.'}
        </p>
      </div>

      <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg">
        <div>
          <p className="text-body-md font-medium text-on-surface">Password Policy</p>
          <p className="text-body-sm text-on-surface-variant">Minimum 8 characters required for all accounts.</p>
        </div>
        <span className="px-sm py-xs bg-tertiary-container text-on-tertiary-container text-label-sm font-bold rounded-full">Active</span>
      </div>
    </section>
  );
}

function NotificationSettings() {
  const prefs = [
    { title: 'Asset Assignments', desc: 'When assets are assigned or unassigned.', enabled: true },
    { title: 'Maintenance Alerts', desc: 'When scheduled maintenance is due.', enabled: true },
    { title: 'New User Registrations', desc: 'When a new employee account is created.', enabled: false },
    { title: 'Asset Requests', desc: 'When employees submit new asset requests.', enabled: true },
    { title: 'Report Generation', desc: 'When scheduled reports are ready.', enabled: false },
  ];

  return (
    <section className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm">
      <h3 className="text-title-lg font-bold text-on-surface mb-md">Notification Preferences</h3>
      <p className="text-body-sm text-on-surface-variant mb-xl">Configure which events trigger admin alerts.</p>
      <div className="space-y-lg divide-y divide-outline-variant">
        {prefs.map(pref => (
          <div key={pref.title} className="flex items-center justify-between pt-lg first:pt-0">
            <div>
              <p className="text-body-md font-medium text-on-surface">{pref.title}</p>
              <p className="text-body-sm text-on-surface-variant">{pref.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-lg">
              <input type="checkbox" className="sr-only peer" defaultChecked={pref.enabled} />
              <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [saved, setSaved] = useState(false);

  // Read saved timeout from localStorage and activate it
  const savedTimeout = typeof window !== 'undefined'
    ? parseInt(localStorage.getItem(TIMEOUT_KEY) ?? '30', 10)
    : 30;
  useSessionTimeout(savedTimeout);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-xl">
        <div>
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-xs">
            <span>Organization</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">Settings</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">Admin Settings</h2>
        </div>
        <button onClick={handleSave} className="bg-primary text-on-primary px-lg py-2 rounded-lg font-bold flex items-center gap-sm hover:opacity-90 shadow-sm active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[18px]">{saved ? 'check' : 'save'}</span>
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-lg items-start">
        <nav className="col-span-12 lg:col-span-3 space-y-sm bg-surface-container-low p-md rounded-xl border border-outline-variant">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-md px-md py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'text-primary font-bold bg-surface-container-high border-r-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}>
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span className="text-label-md">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="col-span-12 lg:col-span-9 space-y-lg">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
        </div>
      </div>
    </>
  );
}
