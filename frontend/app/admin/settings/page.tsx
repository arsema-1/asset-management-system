'use client';

import { useState, useEffect } from 'react';

const TIMEOUT_KEY = 'session_timeout_minutes';

function SecuritySettings() {
  const [timeout, setTimeoutMinutes] = useState<number>(30);

  // Read saved preference client-side to avoid hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem(TIMEOUT_KEY);
    if (saved) {
      setTimeoutMinutes(parseInt(saved, 10));
    }
  }, []);

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

export default function AdminSettingsPage() {
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
      </div>

      <div className="max-w-4xl">
        <SecuritySettings />
      </div>
    </>
  );
}
