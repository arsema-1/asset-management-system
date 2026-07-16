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
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [confirmApprove, setConfirmApprove] = useState<AssetRequest | null>(null);
  const [comment, setComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchRequests = () => {
    setLoading(true);
    assetRequests.list()
      .then(setRequests)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchRequests, []);

  const handleApprove = async () => {
    if (!confirmApprove) return;
    const id = confirmApprove.id;
    setUpdating(id);
    setConfirmApprove(null);
    try {
      const updated = await assetRequests.update(id, { status: 'approved' });
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    setUpdating(id);
    try {
      const updated = await assetRequests.update(id, { status: 'rejected', admin_comment: reason || undefined });
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      setShowRejectInput(null);
      setRejectComment('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setUpdating(null);
    }
  };

  const handleActionWithComment = async (status: 'approved' | 'rejected') => {
    if (!selected) return;
    setUpdating(selected.id);
    try {
      const updated = await assetRequests.update(selected.id, { status, admin_comment: comment });
      setRequests(prev => prev.map(r => r.id === updated.id ? updated : r));
      setSelected(null);
      setComment('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(null);
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
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-xs">
            <span>Main</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">Requests</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">Asset Requests</h2>
          <p className="text-body-sm text-on-surface-variant">Review and approve or reject employee equipment requests.</p>
        </div>
      </div>

      <div className="bg-secondary-container p-md rounded-lg border border-outline-variant mb-lg">
        <p className="text-label-sm text-on-surface-variant flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px]">info</span>
          For each request, you can either <span className="font-bold">Approve</span> (the requested asset will be automatically assigned to the employee) or <span className="font-bold">Reject</span> (with optional feedback)
        </p>
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
                  const user = r.requested_by_user;
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
                          <div className="flex items-center justify-end gap-sm">
                            {showRejectInput === r.id ? (
                              <div className="flex items-center gap-xs">
                                <input
                                  autoFocus
                                  value={rejectComment}
                                  onChange={e => setRejectComment(e.target.value)}
                                  placeholder="Reason (optional)..."
                                  className="w-40 px-2 py-1 border border-outline-variant rounded text-body-xs outline-none focus:border-error"
                                  onKeyDown={e => { if (e.key === 'Enter') handleReject(r.id, rejectComment); if (e.key === 'Escape') { setShowRejectInput(null); setRejectComment(''); } }}
                                />
                                <button
                                  onClick={() => handleReject(r.id, rejectComment)}
                                  disabled={updating === r.id}
                                  className="p-1 text-error hover:bg-error/10 rounded transition-colors disabled:opacity-50"
                                  title="Confirm reject"
                                >
                                  <span className="material-symbols-outlined text-[16px]">check</span>
                                </button>
                                <button
                                  onClick={() => { setShowRejectInput(null); setRejectComment(''); }}
                                  className="p-1 text-on-surface-variant hover:bg-surface-container rounded transition-colors"
                                  title="Cancel"
                                >
                                  <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => setConfirmApprove(r)}
                                  disabled={updating === r.id}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 rounded-lg text-label-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                                  title="Approve this request"
                                >
                                  {updating === r.id ? (
                                    <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                                  ) : (
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                  )}
                                  Accept
                                </button>
                                <button
                                  onClick={() => { setShowRejectInput(r.id); setRejectComment(''); }}
                                  disabled={updating === r.id}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-error/10 text-error border border-error/30 rounded-lg text-label-sm font-bold hover:bg-error/20 transition-colors disabled:opacity-50"
                                  title="Reject this request"
                                >
                                  <span className="material-symbols-outlined text-[14px]">close</span>
                                  Reject
                                </button>
                                <button
                                  onClick={() => { setSelected(r); setComment(r.admin_comment ?? ''); }}
                                  className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                                  title="View details"
                                >
                                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-xs">
                            {r.admin_comment && (
                              <span className="text-label-sm text-on-surface-variant italic truncate max-w-[120px]" title={r.admin_comment}>{r.admin_comment}</span>
                            )}
                            <button
                              onClick={() => { setSelected(r); setComment(r.admin_comment ?? ''); }}
                              className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors"
                              title="View details"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                          </div>
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

      {/* Confirm Approval Dialog */}
      {confirmApprove && (
        <div className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setConfirmApprove(null)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-lg flex items-center gap-md bg-primary text-on-primary">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[28px]">assignment_turned_in</span>
              </div>
              <div>
                <h3 className="text-title-lg font-bold">Confirm Approval</h3>
                <p className="text-label-sm opacity-90">This action will approve the asset request</p>
              </div>
            </div>
            <div className="p-lg space-y-md">
              <div className="bg-surface-container-low rounded-lg p-md space-y-sm">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                  <span className="text-body-sm">
                    Employee: <span className="font-bold text-on-surface">{confirmApprove.requested_by_user ? `${confirmApprove.requested_by_user.first_name} ${confirmApprove.requested_by_user.last_name}` : 'Unknown'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
                  <span className="text-body-sm">
                    Asset: <span className="font-bold text-on-surface">{confirmApprove.asset_name}</span>
                  </span>
                </div>
                {confirmApprove.category && (
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-[18px] text-primary">category</span>
                    <span className="text-body-sm">
                      Category: <span className="font-semibold text-on-surface capitalize">{confirmApprove.category}</span>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[18px] text-primary">description</span>
                  <span className="text-body-sm">
                    Reason: <span className="text-on-surface">{confirmApprove.reason}</span>
                  </span>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-md">
                <div className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0 mt-0.5">info</span>
                  <div>
                    <p className="text-label-sm font-bold text-on-surface">What happens next?</p>
                    <ul className="text-body-xs text-on-surface-variant mt-1 space-y-0.5 list-disc list-inside">
                      {confirmApprove.asset_id ? (
                        <li>The requested asset will be <strong>automatically assigned</strong> to the employee</li>
                      ) : (
                        <li>The employee will be notified to <strong>visit IT</strong> for pickup</li>
                      )}
                      <li>The request will be updated to "approved"</li>
                      <li>The employee will be notified</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-lg border-t border-outline-variant flex gap-md">
              <button
                onClick={() => setConfirmApprove(null)}
                disabled={updating === confirmApprove.id}
                className="flex-1 py-sm px-lg border border-outline-variant text-on-surface font-bold rounded-lg hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={updating === confirmApprove.id}
                className="flex-1 py-sm px-lg font-bold rounded-lg transition-all flex items-center justify-center gap-sm disabled:opacity-60 text-white shadow-md hover:shadow-lg active:scale-[0.98] bg-primary"
              >
                {updating === confirmApprove.id ? (
                  <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Approving...</>
                ) : (
                  <><span className="material-symbols-outlined text-[18px]">check_circle</span> Confirm Approve</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setSelected(null)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-primary text-on-primary">
              <div>
                <h3 className="text-title-lg font-bold">Review & Decide</h3>
                <p className="text-label-sm opacity-90 mt-1">Choose to approve or reject this request</p>
              </div>
              <button onClick={() => setSelected(null)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-lg space-y-md">
              <div className="bg-secondary-container p-md rounded-lg border border-outline-variant">
                <p className="text-label-sm text-on-surface-variant flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  <span>Requested by: <span className="font-bold text-on-surface">{selected.requested_by_user ? `${selected.requested_by_user.first_name} ${selected.requested_by_user.last_name}` : 'Unknown'}</span></span>
                </p>
              </div>
              
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase font-bold flex items-center gap-xs mb-xs">
                  <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                  Asset Requested
                </p>
                <p className="text-body-lg font-bold text-on-surface">{selected.asset_name}</p>
                {selected.category && <p className="text-label-sm text-on-surface-variant capitalize mt-xs">Category: {selected.category}</p>}
              </div>
              
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase font-bold flex items-center gap-xs mb-xs">
                  <span className="material-symbols-outlined text-[16px]">description</span>
                  Reason for Request
                </p>
                <p className="text-body-md text-on-surface leading-relaxed">{selected.reason}</p>
              </div>
              
              <div className="space-y-xs border-t border-outline-variant pt-md">
                <label className="text-label-md text-on-surface-variant font-bold">Your Decision Comment (optional)</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Explain your decision to the employee..."
                  className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md resize-none"
                />
              </div>
            </div>
            <div className="p-lg border-t border-outline-variant flex gap-md">
              <button 
                onClick={() => handleActionWithComment('rejected')} 
                disabled={updating === selected.id} 
                className="flex-1 py-sm px-lg border-2 border-error text-error font-bold rounded-lg hover:bg-error/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined">close</span>
                {updating === selected.id ? 'Processing...' : 'Reject with comment'}
              </button>
              <button 
                onClick={() => handleActionWithComment('approved')} 
                disabled={updating === selected.id} 
                className="flex-1 py-sm px-lg bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined">check_circle</span>
                {updating === selected.id ? 'Processing...' : 'Approve with comment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
