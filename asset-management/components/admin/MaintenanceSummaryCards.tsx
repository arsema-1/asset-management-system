'use client';

import { useEffect, useState } from 'react';
import { maintenance as maintenanceApi, type MaintenanceLog } from '@/lib/api';

export default function MaintenanceSummaryCards() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);

  useEffect(() => {
    maintenanceApi.list().then(setLogs).catch(() => {});
  }, []);

  const inRepair = logs.filter(l => l.status === 'pending' || l.status === 'in_progress').length;
  const scheduled = logs.filter(l => l.status === 'pending').length;
  const completed = logs.filter(l => l.status === 'completed').length;

  const cards = [
    { icon: 'engineering', iconBg: 'bg-error-container text-on-error-container', label: 'Assets in Repair', value: String(inRepair), noteClass: 'text-error', noteIcon: 'build' },
    { icon: 'calendar_month', iconBg: 'bg-secondary-container text-on-secondary-container', label: 'Scheduled Maintenance', value: String(scheduled), noteClass: 'text-on-surface-variant', noteIcon: 'pending' },
    { icon: 'check_circle', iconBg: 'bg-primary-fixed text-on-primary-fixed', label: 'Completed', value: String(completed), noteClass: 'text-primary', noteIcon: 'task_alt' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
      {cards.map((c) => (
        <div key={c.label} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-lg shadow-sm">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
            <span className="material-symbols-outlined text-[32px]">{c.icon}</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider">{c.label}</p>
            <h3 className="text-display font-bold text-on-surface">{c.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
