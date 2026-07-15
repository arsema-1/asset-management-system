'use client';

import { useState } from 'react';
import Link from 'next/link';
import RequestStatCards from '@/components/employee/RequestStatCards';
import RequestsTable from '@/components/employee/RequestsTable';
import { assetRequests } from '@/lib/api';

export default function EmployeeRequestsPage() {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement)?.value;
    setSaving(true);
    setError('');
    try {
      await assetRequests.create({
        asset_name: get('asset_name'),
        reason: get('reason'),
        category: (get('category') || undefined) as never,
      });
      setShowModal(false);
      setRefreshKey(k => k + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-xs text-on-surface-variant text-body-sm">
            <Link href="/employee/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">My Requests</span>
          </div>
          <h2 className="text-headline-lg font-bold text-on-surface">Request History</h2>
          <p className="text-body-md text-on-surface-variant">Manage and track your equipment and service requests.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-on-primary px-lg py-md rounded-xl font-bold flex items-center gap-md shadow-lg hover:scale-105 active:scale-95 transition-all">
          <span className="material-symbols-outlined">add</span>
          New Request
        </button>
      </div>

      <RequestStatCards key={refreshKey} />
      <RequestsTable key={refreshKey} />

      <div className="bg-surface-container-high/40 rounded-xl p-xl flex flex-col md:flex-row gap-lg items-center border border-dashed border-outline dark:bg-slate-800/60 dark:border-white/10">
        <div className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-[32px]">lightbulb</span>
        </div>
        <div className="flex-1">
          <h4 className="text-title-lg font-bold text-on-surface">Need assistance with your equipment?</h4>
          <p className="text-body-md text-on-surface-variant mt-1">
            If your current assets are damaged or malfunctioning, please use the Maintenance tab to file a repair request instead of creating a new asset request.
          </p>
        </div>
        <button className="px-lg py-md border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors whitespace-nowrap">
          Contact IT Support
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setShowModal(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-primary text-on-primary">
              <h3 className="text-title-lg font-bold">New Asset Request</h3>
              <button onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleCreate} className="p-lg space-y-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Asset / Item Name</label>
                <input name="asset_name" required placeholder="MacBook Pro 16&quot;" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md" />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Category</label>
                <select name="category" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md">
                  <option value="">Select...</option>
                  {['laptop','monitor','mobile','peripheral','infrastructure','furniture','other'].map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Reason for Request</label>
                <textarea name="reason" required rows={4} placeholder="Explain why you need this asset..." className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md resize-none" />
              </div>
              {error && <p className="text-error text-body-sm">{error}</p>}
              <div className="flex gap-md pt-sm">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-sm border border-outline-variant font-bold rounded-lg hover:bg-surface-container">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-sm bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-60">
                  {saving ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
