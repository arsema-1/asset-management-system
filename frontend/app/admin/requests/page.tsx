'use client';

import { useEffect, useState } from 'react';
import { assetRequests, type AssetRequest } from '@/lib/api';
import StatusBadge from '@/components/shared/StatusBadge';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<AssetRequest | null>(null);
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequests = () => {
    setLoading(true);
    assetRequests.list()
      .then(setRequests)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchRequests, []);

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!selected) return;
    setUpdating(true);
    try {
      const updated = await assetRequests.update(selected.id, { status, admin_comment: comment });
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      setSelected(null);
      setComment('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  const statusKey = (s: string) => ({
    pending: 'maintenance', approved: 'available', rejected: 'retired',
    completed: 'available', cancelled: 'retired',
  }[s] ?? 'retired');

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Asset Requests</h2>
          <p className="text-body-sm text-on-surface-variant">Review and action employee equipment requests.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        {loading && <p className="p-lg text-on-surface-variant">Loading...</p>}
        {error && <p className="p-lg text-error">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  {['Employee', 'Asset', 'Reason', 'Date', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-lg py-md text-label-sm text-on-surface-variant uppercase ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {requests.length === 0 && (
                  <tr><td colSpan={6} className="px-lg py-lg text-on-surface-variant">No requests found.</td></tr>
                )}
                {requests.map((r) => {
                  const user = (r as never as { requested_by_user?: { first_name: string; last_name: string } }).requested_by_user;
                  return (
                    <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md text-body-sm font-medium">
                        {user ? `${user.first_name} ${user.last_name}` : '—'}
                      </td>
                      <td className="px-lg py-md text-body-sm font-bold text-on-surface">{r.asset_name}</td>
                      <td className="px-lg py-md text-body-sm text-on-surface-variant max-w-xs truncate">{r.reason}</td>
                      <td className="px-lg py-md text-body-sm text-on-surface-variant whitespace-nowrap">{formatDate(r.created_at)}</td>
                      <td className="px-lg py-md"><StatusBadge status={statusKey(r.status)} label={r.status} /></td>
                      <td className="px-lg py-md text-right">
                        {r.status === 'pending' ? (
                          <button onClick={() => { setSelected(r); setComment(r.admin_comment ?? ''); }} className="text-primary font-bold text-label-md hover:underline">
                            Review
                          </button>
                        ) : (
                          <span className="text-label-sm text-on-surface-variant italic">{r.admin_comment ?? '—'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setSelected(null)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-primary text-on-primary">
              <h3 className="text-title-lg font-bold">Review Request</h3>
              <button onClick={() => setSelected(null)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-lg space-y-md">
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase">Asset Requested</p>
                <p className="text-body-lg font-bold mt-1">{selected.asset_name}</p>
              </div>
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase">Reason</p>
                <p className="text-body-md mt-1 text-on-surface">{selected.reason}</p>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Admin Comment (optional)</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Add a comment for the employee..."
                  className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md resize-none"
                />
              </div>
            </div>
            <div className="p-lg border-t border-outline-variant flex gap-md">
              <button onClick={() => handleAction('rejected')} disabled={updating} className="flex-1 py-sm border-2 border-error text-error font-bold rounded-lg hover:bg-error-container disabled:opacity-60">
                {updating ? '...' : 'Reject'}
              </button>
              <button onClick={() => handleAction('approved')} disabled={updating} className="flex-1 py-sm bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-60">
                {updating ? '...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
