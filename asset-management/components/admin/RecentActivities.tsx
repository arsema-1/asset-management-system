'use client';

import { useEffect, useState } from 'react';
import { activities } from '@/lib/api';

interface Activity {
  id: string;
  action: string;
  description: string;
  created_at: string;
  actor?: { first_name: string; last_name: string };
  asset?: { name: string; asset_tag: string };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function initials(actor?: { first_name: string; last_name: string }) {
  if (!actor) return '??';
  return `${actor.first_name[0]}${actor.last_name[0]}`.toUpperCase();
}

const avatarColors = ['bg-primary-container text-on-primary-container', 'bg-secondary-container text-on-secondary-container', 'bg-error-container text-on-error-container', 'bg-surface-variant text-on-surface'];

export default function RecentActivities() {
  const [logs, setLogs] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    activities.list({ limit: '8' })
      .then(data => setLogs(data as Activity[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
      <div className="p-md border-b border-outline-variant flex justify-between items-center">
        <h3 className="text-title-lg font-bold">Recent Activities</h3>
      </div>
      <div className="overflow-x-auto">
        {loading && <p className="p-md text-on-surface-variant text-body-sm">Loading...</p>}
        {!loading && logs.length === 0 && (
          <p className="p-lg text-on-surface-variant text-body-sm text-center">No activities yet.</p>
        )}
        {!loading && logs.length > 0 && (
          <table className="w-full text-left">
            <thead className="bg-surface-container text-label-sm uppercase text-on-surface-variant">
              <tr>
                <th className="px-md py-sm">User</th>
                <th className="px-md py-sm">Action</th>
                <th className="px-md py-sm">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {logs.map((a, i) => (
                <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-md py-md">
                    <div className="flex items-center gap-sm">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold ${avatarColors[i % avatarColors.length]}`}>
                        {initials(a.actor)}
                      </div>
                      <p className="text-body-sm font-bold">
                        {a.actor ? `${a.actor.first_name} ${a.actor.last_name}` : 'System'}
                      </p>
                    </div>
                  </td>
                  <td className="px-md py-md">
                    <p className="text-body-sm">
                      {a.action.replace(/_/g, ' ')}{' '}
                      {a.asset && <span className="font-bold">{a.asset.name}</span>}
                    </p>
                    {a.description && <p className="text-[11px] text-on-surface-variant truncate max-w-[180px]">{a.description}</p>}
                  </td>
                  <td className="px-md py-md text-body-sm text-on-surface-variant whitespace-nowrap">
                    {timeAgo(a.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
