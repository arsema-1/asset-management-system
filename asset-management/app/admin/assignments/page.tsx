'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AssignmentFilterBar from '@/components/admin/AssignmentFilterBar';
import AssignmentTable from '@/components/admin/AssignmentTable';
import { assignments as assignmentsApi, assets as assetsApi, employees as employeesApi, type Asset, type User } from '@/lib/api';

export default function AssignmentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!showModal) return;
    Promise.all([assetsApi.list({ status: 'available' }), employeesApi.list()])
      .then(([a, e]) => { setAssets(a); setEmployees(e); })
      .catch(err => setError(err.message));
  }, [showModal]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement)?.value;
    setSaving(true);
    setError('');
    try {
      await assignmentsApi.create({
        asset_id: get('asset_id'),
        user_id: get('user_id'),
        expected_return_date: get('expected_return_date') || undefined,
        notes: get('notes') || undefined,
      });
      setShowModal(false);
      setRefreshKey(k => k + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="px-lg py-lg bg-surface flex-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
        <div className="space-y-xs">
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant">
            <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-medium">Asset Assignments</span>
          </nav>
          <h1 className="text-headline-lg font-bold text-on-surface">Asset Assignments</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-on-primary px-lg py-sm rounded-lg flex items-center gap-sm font-bold text-label-md hover:opacity-90 transition-all active:scale-95 w-fit">
          <span className="material-symbols-outlined">add</span>
          New Assignment
        </button>
      </div>

      <AssignmentFilterBar />
      <AssignmentTable key={refreshKey} />

      {showModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setShowModal(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-title-lg font-bold">New Assignment</h3>
              <button onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleCreate} className="p-lg space-y-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Asset (Available only)</label>
                <select name="asset_id" required className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md">
                  <option value="">Select asset...</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name} — {a.asset_tag}</option>)}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Assign To</label>
                <select name="user_id" required className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md">
                  <option value="">Select employee...</option>
                  {employees.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Expected Return Date</label>
                <input name="expected_return_date" type="date" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md" />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Notes</label>
                <textarea name="notes" rows={2} className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md resize-none" />
              </div>
              {error && <p className="text-error text-body-sm">{error}</p>}
              <div className="flex gap-md pt-sm">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-sm border border-outline-variant font-bold rounded-lg hover:bg-surface-container">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-sm bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-60">
                  {saving ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
