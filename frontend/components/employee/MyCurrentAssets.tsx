'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { assignments as assignmentsApi, type Assignment } from '@/lib/api';

const iconMap: Record<string, string> = {
  laptop: 'laptop_mac', monitor: 'desktop_windows', mobile: 'smartphone',
  peripheral: 'keyboard', infrastructure: 'dns', furniture: 'desk', other: 'devices',
};

export default function MyCurrentAssets() {
  const router = useRouter();
  const [list, setList] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignmentsApi.list({ status: 'active' })
      .then(setList)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      <div className="flex justify-between items-center mb-md">
        <h3 className="text-title-lg font-bold text-on-surface">My Current Assets</h3>
        <button onClick={() => router.push('/employee/assets')} className="text-primary font-bold text-label-md hover:underline">View All</button>
      </div>

      {loading && <p className="text-on-surface-variant text-body-sm">Loading...</p>}

      {!loading && list.length === 0 && (
        <p className="text-on-surface-variant text-body-sm">No assets assigned.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {list.map((a) => {
          const icon = iconMap[a.asset?.category ?? 'other'] ?? 'devices';
          return (
            <div key={a.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-200">
              <div className="h-40 bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[72px] text-outline-variant">{icon}</span>
              </div>
              <div className="p-md">
                <div className="flex justify-between items-start mb-xs">
                  <h4 className="font-bold text-on-surface">{a.asset?.name ?? 'Asset'}</h4>
                  <span className="bg-secondary-container text-on-secondary-container px-xs py-[2px] rounded text-[10px] font-bold uppercase tracking-tighter capitalize">
                    {a.asset?.category ?? ''}
                  </span>
                </div>
                <div className="text-body-sm text-on-surface-variant mb-md">Tag: {a.asset?.asset_tag ?? '—'}</div>
                <div className="flex items-center gap-sm">
                  <button onClick={() => router.push('/employee/assets')} className="flex-1 py-sm border border-outline-variant rounded-lg text-label-sm font-bold hover:bg-surface-container-low transition-colors">
                    Details
                  </button>
                  <button onClick={() => router.push('/employee/returns')} className="flex-1 py-sm border border-outline-variant rounded-lg text-label-sm font-bold text-error hover:bg-error-container transition-colors">
                    Return
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
