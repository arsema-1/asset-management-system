'use client';

import { useState } from 'react';

const statusStyles: Record<string, string> = {
  Pending: 'bg-secondary-container text-on-secondary-container',
  Approved: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Completed: 'bg-primary-fixed text-on-primary-fixed-variant',
  Rejected: 'bg-error-container text-on-error-container',
};

const statusDots: Record<string, string> = {
  Pending: 'bg-secondary',
  Approved: 'bg-tertiary',
  Rejected: 'bg-error',
};

interface Request {
  id: string;
  asset: string;
  icon: string;
  date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
  adminComment: string;
}

const requests: Request[] = [
  { id: 'REQ-001', asset: 'Ergonomic Chair', icon: 'chair', date: 'Oct 24, 2024', reason: 'Lumbar support upgrade for remote workstation setup.', status: 'Pending', adminComment: 'Awaiting manager review' },
  { id: 'REQ-002', asset: 'MacBook Pro M3', icon: 'laptop_mac', date: 'Oct 12, 2024', reason: 'Standard tech refresh for 3-year cycle.', status: 'Approved', adminComment: 'Ready for pickup at IT desk.' },
  { id: 'REQ-003', asset: 'Thunderbolt Dock', icon: 'dock', date: 'Sep 28, 2024', reason: 'Required for multi-monitor desktop setup.', status: 'Completed', adminComment: 'Item delivered on Oct 1.' },
  { id: 'REQ-004', asset: 'Noise Cancelling Pods', icon: 'headphones', date: 'Sep 15, 2024', reason: 'Requested for deep focus work in open office.', status: 'Rejected', adminComment: 'Standard issue only. High-end model denied.' },
];

export default function RequestsTable() {
  const [selected, setSelected] = useState<Request | null>(null);

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm border border-outline-variant rounded-xl overflow-hidden">
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low">
                {['Asset Name', 'Request Date', 'Reason', 'Status', 'Admin Comment', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-lg py-md text-label-sm text-on-surface-variant font-bold uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                  {/* Asset */}
                  <td className="px-lg py-lg">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined">{r.icon}</span>
                      </div>
                      <span className="text-body-md font-bold text-on-surface whitespace-nowrap">{r.asset}</span>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-lg py-lg text-body-sm text-on-surface-variant whitespace-nowrap">{r.date}</td>

                  {/* Reason */}
                  <td className="px-lg py-lg text-body-sm text-on-surface-variant max-w-xs truncate">{r.reason}</td>

                  {/* Status */}
                  <td className="px-lg py-lg">
                    <span className={`px-md py-1 rounded-full text-label-sm font-bold inline-flex items-center gap-xs ${statusStyles[r.status]}`}>
                      {statusDots[r.status]
                        ? <span className={`w-1.5 h-1.5 rounded-full ${statusDots[r.status]}`} />
                        : <span className="material-symbols-outlined text-[14px]">task_alt</span>
                      }
                      {r.status}
                    </span>
                  </td>

                  {/* Admin Comment */}
                  <td className="px-lg py-lg text-body-sm text-on-surface-variant italic">{r.adminComment}</td>

                  {/* Action */}
                  <td className="px-lg py-lg text-right">
                    <button
                      onClick={() => setSelected(r)}
                      className="text-primary font-bold text-label-md hover:underline decoration-2 underline-offset-4"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-lg bg-surface-container-lowest flex items-center justify-between">
          <span className="text-body-sm text-on-surface-variant">Showing 1–4 of 12 requests</span>
          <div className="flex gap-sm">
            <button disabled className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant disabled:opacity-40">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {[1, 2, 3].map((p) => (
              <button key={p} className={`w-8 h-8 flex items-center justify-center rounded text-label-md font-bold ${p === 1 ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
                {p}
              </button>
            ))}
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-60 flex items-center justify-center p-md" onClick={() => setSelected(null)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-primary text-on-primary">
              <h3 className="text-headline-md font-bold">Request Details — {selected.id}</h3>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-lg">
              <div className="grid grid-cols-2 gap-lg">
                <div>
                  <p className="text-label-sm font-bold text-on-surface-variant uppercase">Asset Requested</p>
                  <p className="text-body-lg font-bold mt-1">{selected.asset}</p>
                </div>
                <div>
                  <p className="text-label-sm font-bold text-on-surface-variant uppercase">Status</p>
                  <span className={`px-md py-1 rounded-full text-label-sm font-bold inline-flex items-center mt-1 gap-xs ${statusStyles[selected.status]}`}>
                    {selected.status}
                  </span>
                </div>
              </div>
              <hr className="border-outline-variant" />
              <div>
                <p className="text-label-sm font-bold text-on-surface-variant uppercase">Reason for Request</p>
                <p className="text-body-md mt-2 text-on-surface leading-relaxed">{selected.reason}</p>
              </div>
              <div className="bg-surface-container-low p-md rounded-lg">
                <p className="text-label-sm font-bold text-on-surface-variant uppercase flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">comment</span>Admin Feedback
                </p>
                <p className="text-body-md mt-1 text-on-surface italic">{selected.adminComment}</p>
              </div>
            </div>
            <div className="p-lg bg-surface-container-low flex justify-end gap-md">
              <button onClick={() => setSelected(null)} className="px-lg py-md text-on-surface font-bold hover:bg-surface-container-high rounded-lg transition-colors">
                Close
              </button>
              <button className="px-lg py-md bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-all">
                Edit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
