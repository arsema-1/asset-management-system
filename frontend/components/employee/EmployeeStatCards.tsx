'use client';

import { useEffect, useState } from 'react';
import { assignments as assignmentsApi, assetRequests, type Assignment, type AssetRequest } from '@/lib/api';

export default function EmployeeStatCards() {
  const [assigned, setAssigned] = useState(0);
  const [pending, setPending] = useState(0);
  const [approved, setApproved] = useState(0);
  const [returned, setReturned] = useState(0);

  useEffect(() => {
    Promise.all([
      assignmentsApi.list(),
      assetRequests.list(),
    ]).then(([asgns, reqs]) => {
      setAssigned((asgns as Assignment[]).filter(a => a.status === 'active').length);
      setReturned((asgns as Assignment[]).filter(a => a.status === 'returned').length);
      setPending((reqs as AssetRequest[]).filter(r => r.status === 'pending').length);
      setApproved((reqs as AssetRequest[]).filter(r => r.status === 'approved' || r.status === 'completed').length);
    }).catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Assigned', value: String(assigned), note: 'Active devices in use', icon: 'devices', valueClass: 'text-primary' },
    { label: 'Pending Requests', value: String(pending), note: 'Waiting for approval', icon: 'hourglass_empty', valueClass: 'text-tertiary' },
    { label: 'Approved', value: String(approved), note: 'Total lifetime approvals', icon: 'verified', valueClass: 'text-secondary' },
    { label: 'Returned', value: String(returned), note: 'Successfully deprovisioned', icon: 'keyboard_return', valueClass: 'text-on-surface-variant' },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
      {stats.map((s) => (
        <div key={s.label} className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:-translate-y-1 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-sm">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">{s.label}</span>
            <span className="material-symbols-outlined text-on-surface-variant">{s.icon}</span>
          </div>
          <div className={`text-display font-bold ${s.valueClass}`}>{s.value}</div>
          <div className="mt-xs text-label-sm text-on-surface-variant">{s.note}</div>
        </div>
      ))}
    </section>
  );
}
