'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { activities } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { activityStyleMap, type Activity } from '@/lib/types';

export default function ActivityFeed() {
  const router = useRouter();
  const [logs, setLogs] = useState<Activity[]>([]);

  useEffect(() => {
    activities.list({ limit: '5' })
      .then(data => setLogs(data as Activity[]))
      .catch(() => {});
  }, []);

  return (
    <section>
      <h3 className="text-title-lg font-bold text-on-surface mb-md">Recent Activities</h3>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="divide-y divide-outline-variant">
          {logs.length === 0 && (
            <p className="p-lg text-body-sm text-on-surface-variant">No recent activity.</p>
          )}
          {logs.map((a) => {
            const s = activityStyleMap[a.action] ?? { icon: 'update', bg: 'bg-surface-container-high', cls: 'text-on-surface-variant' };
            return (
              <div key={a.id} className="p-md flex items-start gap-md hover:bg-surface-container-low transition-colors">
                <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined ${s.cls}`}>{s.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-md">
                    <p className="font-bold text-body-md text-on-surface capitalize">{a.action.replace(/_/g, ' ')}</p>
                    <span className="text-label-sm text-on-surface-variant whitespace-nowrap">{timeAgo(a.created_at)}</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    {a.asset?.name ?? a.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={() => router.push('/employee/notifications')} className="w-full py-md text-center text-label-md font-bold text-primary hover:bg-surface-container-high transition-colors">
          View All Activity
        </button>
      </div>
    </section>
  );
}
