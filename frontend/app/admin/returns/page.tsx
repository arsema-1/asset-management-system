'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { returns as returnsApi, type ReturnRequest } from '@/lib/api';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';

const statusLabelMap: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  received: 'Received',
  rejected: 'Rejected',
  completed: 'Completed',
};

function ReturnStatusBadge({ status }: { status: string }) {
  const keyMap: Record<string, string> = {
    pending: 'maintenance',
    approved: 'available',
    received: 'available',
    rejected: 'retired',
    completed: 'available',
  };
  return <StatusBadge status={keyMap[status] ?? 'retired'} label={statusLabelMap[status] ?? status} />;
}

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [showRejectInput, setShowRejectInput] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const fetchReturns = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    returnsApi.list(params)
      .then(setReturns)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReturns(); }, [statusFilter]);

  const handleApprove = async (returnId: string) => {
    setUpdating(returnId);
    setSelectedReturn(null);
    try {
      await returnsApi.update(returnId, {
        status: 'approved',
        admin_comment: adminComment || undefined,
      });
      setAdminComment('');
      fetchReturns();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to approve return');
    } finally {
      setUpdating(null);
    }
  };

  const handleReject = async (returnId: string, comment: string) => {
    setUpdating(returnId);
    setShowRejectInput(null);
    setRejectComment('');
    try {
      await returnsApi.update(returnId, {
        status: 'rejected',
        admin_comment: comment || undefined,
      });
      fetchReturns();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reject return');
    } finally {
      setUpdating(null);
    }
  };

  const pendingCount = returns.filter(r => r.status === 'pending').length;
  const approvedCount = returns.filter(r => r.status === 'received' || r.status === 'approved').length;
  const rejectedCount = returns.filter(r => r.status === 'rejected').length;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
        <div className="space-y-xs">
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant">
            <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-medium">Return Requests</span>
          </nav>
          <h1 className="text-headline-lg font-bold text-on-surface">Return Requests</h1>
          <p className="text-body-sm text-on-surface-variant">Review and approve or reject asset return requests from employees.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-lg">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary">pending_actions</span>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">Pending</p>
            <p className="text-headline-md font-bold text-on-surface">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-secondary-container">check_circle</span>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">Completed</p>
            <p className="text-headline-md font-bold text-on-surface">{approvedCount}</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-md shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center">
            <span className="material-symbols-outlined text-error">cancel</span>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">Rejected</p>
            <p className="text-headline-md font-bold text-on-surface">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-secondary-container p-md rounded-lg border border-outline-variant mb-lg">
        <p className="text-label-sm text-on-surface-variant flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span>
            <strong className="text-on-surface font-bold">Approving</strong> a return will close the active assignment and mark the asset as <strong className="text-on-surface font-bold">Available</strong>.
            <br />
            <strong className="text-on-surface font-bold">Rejecting</strong> a return will keep the asset assigned to the employee.
          </span>
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-xs mb-lg bg-surface-container-lowest border border-outline-variant rounded-xl p-xs w-fit">
        {[
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'received', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-lg py-sm rounded-lg text-label-md font-bold transition-all ${
              statusFilter === tab.value
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        {loading && <p className="p-lg text-on-surface-variant">Loading...</p>}
        {error && <p className="p-lg text-error">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  {['Employee', 'Asset', 'Assigned Date', 'Submitted', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-lg py-md text-label-sm text-on-surface-variant uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {returns.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-lg py-xl text-center text-on-surface-variant">
                      <div className="flex flex-col items-center gap-sm">
                        <span className="material-symbols-outlined text-[40px] text-outline">assignment_return</span>
                        <p className="text-body-md">No return requests found.</p>
                        {statusFilter && (
                          <button onClick={() => setStatusFilter('')} className="text-primary font-bold underline">
                            Clear filter to see all requests
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                {returns.map((r) => {
                  const user = r.requested_by_user;
                  const empName = user ? `${user.first_name} ${user.last_name}` : 'Unknown';
                  const assetName = r.asset?.name ?? 'Unknown';
                  const assetTag = r.asset?.asset_tag ?? '';
                  const isUpdating = updating === r.id;
                  const isPending = r.status === 'pending';

                  return (
                    <tr key={r.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-lg py-md">
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                            {user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}` : '??'}
                          </div>
                          <span className="text-body-sm font-medium text-on-surface">{empName}</span>
                        </div>
                      </td>
                      <td className="px-lg py-md">
                        <div className="flex flex-col">
                          <span className="text-body-sm font-semibold text-on-surface">{assetName}</span>
                          <span className="text-label-xs text-on-surface-variant">{assetTag}</span>
                        </div>
                      </td>
                      <td className="px-lg py-md text-body-sm text-on-surface">
                        {r.assignment?.assigned_date ? formatDate(r.assignment.assigned_date) : '—'}
                      </td>
                      <td className="px-lg py-md text-body-sm text-on-surface">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-lg py-md">
                        {isUpdating ? (
                          <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                        ) : (
                          <ReturnStatusBadge status={r.status} />
                        )}
                      </td>
                      <td className="px-lg py-md text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-sm">
                            {showRejectInput === r.id ? (
                              <div className="flex items-center gap-xs">
                                <input
                                  autoFocus
                                  value={rejectComment}
                                  onChange={e => setRejectComment(e.target.value)}
                                  placeholder="Reason (optional)..."
                                  className="w-40 px-2 py-1 border border-outline-variant rounded text-body-xs outline-none focus:border-error"
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleReject(r.id, rejectComment);
                                    if (e.key === 'Escape') { setShowRejectInput(null); setRejectComment(''); }
                                  }}
                                />
                                <button
                                  onClick={() => handleReject(r.id, rejectComment)}
                                  disabled={isUpdating}
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
                                  onClick={() => { setSelectedReturn(r); setAdminComment(r.return_notes ?? ''); }}
                                  disabled={isUpdating}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 rounded-lg text-label-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
                                  title="Approve this return"
                                >
                                  {isUpdating ? (
                                    <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                                  ) : (
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                  )}
                                  Approve
                                </button>
                                <button
                                  onClick={() => { setShowRejectInput(r.id); setRejectComment(''); }}
                                  disabled={isUpdating}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-error/10 text-error border border-error/30 rounded-lg text-label-sm font-bold hover:bg-error/20 transition-colors disabled:opacity-50"
                                  title="Reject this return"
                                >
                                  <span className="material-symbols-outlined text-[14px]">close</span>
                                  Reject
                                </button>
                                <button
                                  onClick={() => { setSelectedReturn(r); setAdminComment(r.return_notes ?? ''); }}
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
                            {r.return_notes && (
                              <span className="text-label-sm text-on-surface-variant italic truncate max-w-[140px]" title={r.return_notes}>
                                {r.status === 'rejected' ? 'Rejected: ' : ''}{r.return_notes}
                              </span>
                            )}
                            <button
                              onClick={() => { setSelectedReturn(r); setAdminComment(r.return_notes ?? ''); }}
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
        {/* Footer */}
        <div className="px-lg py-md flex items-center justify-between border-t border-outline-variant bg-surface-container-low">
          <span className="text-body-sm text-on-surface-variant">
            Showing {returns.length} return request{returns.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Approval Confirmation Dialog */}
      {selectedReturn && (
        <div className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setSelectedReturn(null)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-lg flex items-center gap-md bg-primary text-on-primary">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[28px]">assignment_return</span>
              </div>
              <div>
                <h3 className="text-title-lg font-bold">Review Return Request</h3>
                <p className="text-label-sm opacity-90">Approve or reject this asset return</p>
              </div>
            </div>
            <div className="p-lg space-y-md">
              {/* Details */}
              <div className="bg-surface-container-low rounded-lg p-md space-y-sm">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[18px] text-primary">person</span>
                  <span className="text-body-sm">
                    Employee: <span className="font-bold text-on-surface">
                      {selectedReturn.requested_by_user
                        ? `${selectedReturn.requested_by_user.first_name} ${selectedReturn.requested_by_user.last_name}`
                        : 'Unknown'}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[18px] text-primary">inventory_2</span>
                  <span className="text-body-sm">
                    Asset: <span className="font-bold text-on-surface">{selectedReturn.asset?.name} ({selectedReturn.asset?.asset_tag})</span>
                  </span>
                </div>
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
                  <span className="text-body-sm">
                    Assigned: <span className="font-semibold text-on-surface">
                      {selectedReturn.assignment?.assigned_date ? formatDate(selectedReturn.assignment.assigned_date) : '—'}
                    </span>
                  </span>
                </div>
                {selectedReturn.condition_on_return && (
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-[18px] text-primary">checklist</span>
                    <span className="text-body-sm">
                      Condition: <span className="font-semibold text-on-surface capitalize">{selectedReturn.condition_on_return}</span>
                    </span>
                  </div>
                )}
                {selectedReturn.return_notes && (
                  <div className="flex items-start gap-sm pt-sm border-t border-outline-variant">
                    <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0 mt-0.5">description</span>
                    <span className="text-body-sm text-on-surface-variant">
                      Employee notes: <span className="italic text-on-surface">{selectedReturn.return_notes}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* What happens */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-md">
                <div className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0 mt-0.5">info</span>
                  <div>
                    <p className="text-label-sm font-bold text-on-surface">What happens next?</p>
                    <ul className="text-body-xs text-on-surface-variant mt-1 space-y-0.5 list-disc list-inside">
                      <li><strong className="text-on-surface">Approve</strong> — Assignment closed, asset marked Available, employee notified</li>
                      <li><strong className="text-on-surface">Reject</strong> — Asset stays assigned to employee, return request closed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Admin comment */}
              <div className="space-y-xs border-t border-outline-variant pt-md">
                <label className="text-label-md text-on-surface-variant font-bold">Admin Comment (optional)</label>
                <textarea
                  rows={3}
                  value={adminComment}
                  onChange={e => setAdminComment(e.target.value)}
                  placeholder="Add a note about your decision..."
                  className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md resize-none"
                />
              </div>
            </div>
            <div className="p-lg border-t border-outline-variant flex gap-md">
              <button
                onClick={() => handleReject(selectedReturn.id, adminComment)}
                disabled={updating === selectedReturn.id}
                className="flex-1 py-sm px-lg border-2 border-error text-error font-bold rounded-lg hover:bg-error/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined">close</span>
                {updating === selectedReturn.id ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleApprove(selectedReturn.id)}
                disabled={updating === selectedReturn.id}
                className="flex-1 py-sm px-lg bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-xs"
              >
                <span className="material-symbols-outlined">check_circle</span>
                {updating === selectedReturn.id ? 'Processing...' : 'Approve Return'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
