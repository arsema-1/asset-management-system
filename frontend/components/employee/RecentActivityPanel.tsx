'use client';

import { useEffect, useState } from 'react';
import { activities } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { activityStyleMap, type Activity } from '@/lib/types';

export default function RecentActivityPanel() {
  const [logs, setLogs] = useState<Activity[]>([]);

  useEffect(() => {
    activities.list({ limit: '5' })
      .then(data => setLogs(data as Activity[]))
      .catch(() => {});
  }, []);

  if (logs.length === 0) return (
    <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
      <h3 className="text-title-lg font-bold mb-md">Recent Activity</h3>
      <p className="text-body-sm text-on-surface-variant">No recent activity.</p>
    </div>
  );

  return (
    <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
      <h3 className="text-title-lg font-bold mb-md">Recent Activity</h3>
      <div className="space-y-lg">
        {logs.map((a) => {
          const style = activityStyleMap[a.action] ?? { icon: 'update', bg: 'bg-tertiary-fixed', cls: 'text-tertiary' };
          return (
            <div key={a.id} className="flex gap-md">
              <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                <span className={`material-symbols-outlined text-[20px] ${style.cls}`}>{style.icon}</span>
              </div>
              <div>
                <p className="text-body-sm font-bold capitalize">{a.action.replace(/_/g, ' ')}</p>
                <p className="text-label-sm text-on-surface-variant">
                  {a.asset?.name ?? a.description} • {timeAgo(a.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
