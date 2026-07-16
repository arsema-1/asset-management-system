'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { assetRequests, type AssetRequest } from '@/lib/api';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const iconMap: Record<string, string> = {
  laptop: 'laptop_mac', monitor: 'desktop_windows', mobile: 'smartphone',
  chair: 'chair', dock: 'dock', headphones: 'headphones',
};

export default function RequestsTable({ refreshKey = 0 }: { refreshKey?: number }) {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [selected, setSelected] = useState<AssetRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    assetRequests.list()
      .then(setRequests)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const statusLabel = (s: string) =>
    s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() as 'Pending' | 'Approved' | 'Completed' | 'Rejected';

  return (
    <>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-lg border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-title-lg font-bold text-on-surface">Recent Requests</h3>
          <div className="flex gap-md">
            <button className="flex items-center gap-xs px-md py-2 border border-outline-variant rounded-lg text-body-sm hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>Filter
            </button>
            <button className="flex items-center gap-xs px-md py-2 border border-outline-variant rounded-lg text-body-sm hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[20px]">download</span>Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading && <p className="p-lg text-on-surface-variant">Loading...</p>}
          {error && <p className="p-lg text-error">{error}</p>}
          {!loading && !error && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low dark:bg-slate-800/60">
                  {['Asset Name', 'Request Date', 'Reason', 'Status', 'Admin Comment', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-lg py-md text-label-sm text-on-surface-variant font-bold uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {requests.length === 0 && (
                  <tr><td colSpan={6} className="px-lg py-lg text-on-surface-variant">No requests found.</td></tr>
                )}
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-lg py-lg">
                      <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                          <span className="material-symbols-outlined">{iconMap[r.asset_name?.toLowerCase()] ?? 'devices'}</span>
                        </div>
                        <span className="text-body-md font-bold text-on-surface whitespace-nowrap">{r.asset_name}</span>
                      </div>
                    </td>
                    <td className="px-lg py-lg text-body-sm text-on-surface-variant whitespace-nowrap">{formatDate(r.created_at)}</td>
                    <td className="px-lg py-lg text-body-sm text-on-surface-variant max-w-xs truncate">{r.reason ?? '—'}</td>
                    <td className="px-lg py-lg"><StatusBadge status={statusLabel(r.status)} /></td>
                    <td className="px-lg py-lg text-body-sm text-on-surface-variant italic">{r.admin_comment ?? '—'}</td>
                    <td className="px-lg py-lg text-right">
                      <button onClick={() => setSelected(r)} className="text-primary font-bold text-label-md hover:underline decoration-2 underline-offset-4">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-lg bg-surface-container-lowest flex items-center justify-between dark:bg-slate-800/60 dark:border-t dark:border-white/10">
          <span className="text-body-sm text-on-surface-variant">Showing {requests.length} requests</span>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-60 flex items-center justify-center p-md" onClick={() => setSelected(null)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-primary text-on-primary">
              <h3 className="text-headline-md font-bold">Request Details</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-lg">
              <div className="grid grid-cols-2 gap-lg">
                <div>
                  <p className="text-label-sm font-bold text-on-surface-variant uppercase">Asset Requested</p>
                  <p className="text-body-lg font-bold mt-1">{selected.asset_name}</p>
                </div>
                <div>
                  <p className="text-label-sm font-bold text-on-surface-variant uppercase">Status</p>
                  <div className="mt-1"><StatusBadge status={statusLabel(selected.status)} /></div>
                </div>
              </div>
              <hr className="border-outline-variant" />
              <div>
                <p className="text-label-sm font-bold text-on-surface-variant uppercase">Reason for Request</p>
                <p className="text-body-md mt-2 text-on-surface leading-relaxed">{selected.reason ?? '—'}</p>
              </div>
              <div className="bg-surface-container-low p-md rounded-lg dark:bg-slate-800/80">
                <p className="text-label-sm font-bold text-on-surface-variant uppercase flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">comment</span>Admin Feedback
                </p>
                <p className="text-body-md mt-1 text-on-surface italic">{selected.admin_comment ?? '—'}</p>
              </div>
            </div>
            <div className="p-lg bg-surface-container-low flex justify-end gap-md dark:bg-slate-800/80 dark:border-t dark:border-white/10">
              <button onClick={() => setSelected(null)} className="px-lg py-md text-on-surface font-bold hover:bg-surface-container-high rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
  
