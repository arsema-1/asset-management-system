'use client';

import { useState } from 'react';

export default function SecuritySection() {
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div className="px-lg py-md bg-surface-container-low border-b border-outline-variant">
        <h3 className="text-headline-md font-bold text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-error">security</span>
          Security & Authentication
        </h3>
      </div>

      <div className="p-lg space-y-xl">
        {/* Change Password */}
        <div>
          <h4 className="text-title-lg font-bold mb-md">Change Password</h4>
          <div className="grid grid-cols-1 gap-lg">
            <div className="space-y-sm">
              <label className="text-label-md text-on-surface-variant">Current Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full max-w-md bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg max-w-2xl">
              {[
                { label: 'New Password', placeholder: 'Min. 8 characters' },
                { label: 'Confirm New Password', placeholder: 'Must match new password' },
              ].map((f) => (
                <div key={f.label} className="space-y-sm">
                  <label className="text-label-md text-on-surface-variant">{f.label}</label>
                  <input
                    type="password"
                    placeholder={f.placeholder}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              ))}
            </div>
            <div>
              <button className="px-md py-sm border border-outline-variant text-on-surface font-medium rounded-lg hover:bg-surface-container-high transition-colors">
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* 2FA */}
        <div className="pt-lg border-t border-outline-variant">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md">
              <div className="bg-primary/10 p-sm rounded-lg text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  vibration
                </span>
              </div>
              <div>
                <p className="text-body-md font-bold text-on-surface">Two-Factor Authentication</p>
                <p className="text-body-sm text-on-surface-variant">
                  Keep your account secure with an extra layer of verification.
                </p>
              </div>
            </div>

            {/* Toggle */}
            <button
              onClick={() => setTwoFactor(!twoFactor)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFactor ? 'bg-primary' : 'bg-surface-container-highest'}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-surface-container-lowest border border-gray-200 shadow transition-transform ${twoFactor ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
