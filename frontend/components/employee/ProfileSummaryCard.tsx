'use client';

import { useEffect, useState } from 'react';
import { getUser, assignments as assignmentsApi, assetRequests, type Assignment, type AssetRequest } from '@/lib/api';

export default function ProfileSummaryCard() {
  const [user, setUser] = useState(getUser());
  const [activeAssets, setActiveAssets] = useState(0);
  const [pendingReqs, setPendingReqs] = useState(0);

  // Defer localStorage read to avoid hydration mismatch
  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    Promise.all([assignmentsApi.list(), assetRequests.list()])
      .then(([asgns, reqs]) => {
        setActiveAssets((asgns as Assignment[]).filter(a => a.status === 'active').length);
        setPendingReqs((reqs as AssetRequest[]).filter(r => r.status === 'pending').length);
      }).catch(() => {});
  }, []);

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : 'AU';

  const stats = [
    { icon: 'laptop_mac', value: String(activeAssets), label: 'Active Assets', valueClass: 'text-primary', iconClass: 'text-primary' },
    { icon: 'pending_actions', value: String(pendingReqs), label: 'Pending Requests', valueClass: 'text-tertiary', iconClass: 'text-tertiary' },
  ];

  return (
    <div className="w-full lg:w-1/3 flex flex-col gap-lg">
      <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="relative group mb-md">
            <div className="w-32 h-32 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-display font-bold border-4 border-surface-container-highest">
              {initials}
            </div>
          </div>

          <h2 className="text-headline-lg font-bold text-on-surface">
            {user ? `${user.first_name} ${user.last_name}` : '—'}
          </h2>
          <p className="text-title-lg text-primary">{user?.position ?? 'Employee'}</p>
          {user?.employee_id && (
            <div className="mt-md px-md py-xs bg-secondary-container/30 rounded-full">
              <span className="text-label-md text-on-secondary-container">Employee ID: {user.employee_id}</span>
            </div>
          )}

          <div className="w-full mt-xl space-y-md text-left">
            {[
              { icon: 'mail', label: 'Email Address', value: user?.email ?? '—' },
              { icon: 'corporate_fare', label: 'Department', value: user?.department ?? '—' },
              { icon: 'work', label: 'Position', value: user?.position ?? '—' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-md">
                <span className="material-symbols-outlined text-on-surface-variant">{item.icon}</span>
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase">{item.label}</p>
                  <p className="text-body-md text-on-surface font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-md">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-outline-variant rounded-xl p-md shadow-sm">
            <span className={`material-symbols-outlined mb-xs ${s.iconClass}`}>{s.icon}</span>
            <p className={`text-display font-bold leading-tight ${s.valueClass}`}>{s.value}</p>
            <p className="text-label-md text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
