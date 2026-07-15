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
  const [statusFilter, setStatusFilter] = useState('');

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
      form.reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment');
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
            <span className="material-symbols-oriented text-[16px]">chevron_right</span>
            <span className="text-primary font-medium">Asset Assignments</span>
          </nav>
          <h1 className="text-headline-lg font-bold text-on-surface">Asset Assignments</h1>
          <p className="text-body-sm text-on-surface-variant">Assign available assets to employees and track active assignments.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-primary text-on-primary px-lg py-sm rounded-lg flex items-center gap-sm font-bold text-label-md hover:opacity-90 transition-all active:scale-95 w-fit shadow-sm">
          <span className="material-symbols-outlined">add</span>
          Assign Asset
        </button>
      </div>

      <AssignmentFilterBar status={statusFilter} onStatusChange={setStatusFilter} />
      <AssignmentTable key={refreshKey} statusFilter={statusFilter} />

      {showModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setShowModal(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-primary text-on-primary">
              <div>
                <h3 className="text-title-lg font-bold">Assign Asset to Employee</h3>
                <p className="text-label-sm opacity-90 mt-1">Select an available asset and employee to create an assignment</p>
              </div>
              <button onClick={() => setShowModal(false)} className="hover:opacity-70 transition-opacity">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-lg space-y-md">
              <div className="bg-secondary-container p-md rounded-lg border border-outline-variant mb-md">
                <p className="text-label-sm text-on-surface-variant flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  Only assets with "Available" status can be assigned
                </p>
              </div>
              
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface font-medium flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">devices</span>
                  Select Asset <span className="text-error">*</span>
                </label>
                <select name="asset_id" required className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md">
                  <option value="">Choose an available asset...</option>
                  {assets.length === 0 && <option disabled>No available assets</option>}
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} • {a.asset_tag} • {a.category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface font-medium flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Assign To Employee <span className="text-error">*</span>
                </label>
                <select name="user_id" required className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md">
                  <option value="">Choose an employee...</option>
                  {employees.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} {u.position ? `• ${u.position}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface font-medium flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">event</span>
                  Expected Return Date (Optional)
                </label>
                <input 
                  name="expected_return_date" 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md" 
                />
              </div>
              
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface font-medium flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]">notes</span>
                  Additional Notes (Optional)
                </label>
                <textarea 
                  name="notes" 
                  rows={3}
                  placeholder="Add any relevant information about this assignment..."
                  className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary text-body-md resize-none" 
                />
              </div>
              
              {error && (
                <div className="bg-error-container border border-error p-md rounded-lg">
                  <p className="text-error text-body-sm font-medium">{error}</p>
                </div>
              )}
              
              <div className="flex gap-md pt-md border-t border-outline-variant">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-sm border border-outline-variant font-bold rounded-lg hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving || assets.length === 0} 
                  className="flex-1 py-sm bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Creating Assignment...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
