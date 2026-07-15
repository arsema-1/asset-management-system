'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MaintenanceSummaryCards from '@/components/admin/MaintenanceSummaryCards';
import MaintenanceTable from '@/components/admin/MaintenanceTable';
import { maintenance as maintenanceApi, assets as assetsApi, employees as employeesApi, type Asset, type User } from '@/lib/api';

export default function MaintenancePage() {
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!showModal) return;
    Promise.all([assetsApi.list(), employeesApi.list()])
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
      await maintenanceApi.create({
        asset_id: get('asset_id'),
        type: get('type') as never,
        description: get('description'),
        technician_id: get('technician_id') || undefined,
        cost: get('cost') ? Number(get('cost')) : 0,
        scheduled_date: get('scheduled_date') || undefined,
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
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-xs">
            <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Admin</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-medium">Maintenance</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">Maintenance Logs</h2>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-on-primary px-lg py-md rounded-lg font-bold flex items-center gap-sm shadow-lg hover:opacity-90 active:scale-95 transition-all w-fit">
          <span className="material-symbols-outlined">post_add</span>
          Log Maintenance
        </button>
      </div>

      <MaintenanceSummaryCards />
      <MaintenanceTable key={refreshKey} />

      {showModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setShowModal(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-title-lg font-bold">Log Maintenance</h3>
              <button onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleCreate} className="p-lg space-y-md">
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Asset</label>
                <select name="asset_id" required className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md">
                  <option value="">Select asset...</option>
                  {assets.map(a => <option key={a.id} value={a.id}>{a.name} — {a.asset_tag}</option>)}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Type</label>
                <select name="type" required className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md">
                  <option value="">Select type...</option>
                  {['hardware_repair','software_update','routine_check','inspection','replacement'].map(t => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Description</label>
                <textarea name="description" required rows={3} className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md resize-none" />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Assign Technician</label>
                <select name="technician_id" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md">
                  <option value="">Unassigned</option>
                  {employees.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant">Cost ($)</label>
                  <input name="cost" type="number" step="0.01" defaultValue="0" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md" />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant">Scheduled Date</label>
                  <input name="scheduled_date" type="date" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md" />
                </div>
              </div>
              {error && <p className="text-error text-body-sm">{error}</p>}
              <div className="flex gap-md pt-sm">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-sm border border-outline-variant font-bold rounded-lg hover:bg-surface-container">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-sm bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Log Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
