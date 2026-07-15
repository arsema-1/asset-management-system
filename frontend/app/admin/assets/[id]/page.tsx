'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { assets as assetsApi, maintenance as maintenanceApi, assignments as assignmentsApi, type Asset, type MaintenanceLog, type Assignment } from '@/lib/api';
import StatusBadge from '@/components/shared/StatusBadge';

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AssetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editData, setEditData] = useState<Partial<Asset>>({});

  useEffect(() => {
    Promise.all([
      assetsApi.get(id),
      maintenanceApi.list({ asset_id: id }),
      assignmentsApi.list({ asset_id: id } as never),
    ]).then(([a, m, asgns]) => {
      setAsset(a);
      setEditData(a);
      setLogs(m);
      const active = (asgns as Assignment[]).find(x => x.status === 'active') ?? null;
      setAssignment(active);
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await assetsApi.update(id, editData);
      setAsset(updated);
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDispose = async () => {
    if (!confirm('Mark this asset as disposed? This cannot be undone.')) return;
    try {
      await assetsApi.update(id, { status: 'disposed' });
      router.push('/admin/assets');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to dispose');
    }
  };

  if (loading) return <p className="p-xl text-on-surface-variant">Loading...</p>;
  if (error) return <p className="p-xl text-error">{error}</p>;
  if (!asset) return <p className="p-xl text-on-surface-variant">Asset not found.</p>;

  const statusKeyMap: Record<string, string> = {
    available: 'available', assigned: 'assigned', in_repair: 'maintenance',
    disposed: 'retired', pending_return: 'maintenance',
  };

  const infoFields = [
    { label: 'Serial Number', value: asset.serial_number },
    { label: 'Asset Tag', value: asset.asset_tag },
    { label: 'Purchase Date', value: formatDate(asset.purchase_date) },
    { label: 'Purchase Cost', value: asset.purchase_cost ? `$${Number(asset.purchase_cost).toLocaleString()}` : '—' },
    { label: 'Warranty Exp.', value: formatDate(asset.warranty_expiry) },
    { label: 'Vendor', value: asset.vendor },
  ];

  return (
    <>
      <nav className="flex items-center gap-xs mb-md text-body-sm text-on-surface-variant">
        <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href="/admin/assets" className="hover:text-primary transition-colors">Assets</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-semibold text-on-surface">{asset.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md mb-xl">
        <div className="space-y-sm">
          <div className="flex flex-wrap items-center gap-md">
            <h2 className="text-headline-lg font-bold text-on-surface">{asset.name}</h2>
            <StatusBadge status={statusKeyMap[asset.status] ?? 'retired'} label={asset.status.replace(/_/g, ' ')} />
          </div>
          <div className="flex flex-wrap items-center gap-lg text-body-sm text-on-surface-variant">
            <span className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">tag</span>
              {asset.asset_tag}
            </span>
            {asset.location && (
              <span className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {asset.location}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button onClick={handleDispose} className="px-lg py-2 border border-outline text-on-surface text-label-md font-bold rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">delete_outline</span>
            Dispose
          </button>
          <button onClick={() => setEditing(true)} className="px-lg py-2 bg-primary text-on-primary text-label-md font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-xs shadow-md">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Asset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-lg items-start">
        {/* Left */}
        <div className="col-span-12 lg:col-span-8 space-y-lg">
          {/* Asset Info */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h3 className="text-title-lg font-bold text-on-surface mb-lg">Asset Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-xl gap-x-md">
              {infoFields.map((f) => (
                <div key={f.label}>
                  <p className="text-label-sm text-on-surface-variant uppercase mb-1">{f.label}</p>
                  <p className="text-body-md font-semibold text-on-surface">{f.value ?? '—'}</p>
                </div>
              ))}
            </div>
            <div className="mt-lg">
              <p className="text-label-sm text-on-surface-variant uppercase mb-1">Description</p>
              <p className="text-body-md text-on-surface">{asset.description ?? '—'}</p>
            </div>
          </section>

          {/* Maintenance History */}
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-lg flex items-center justify-between">
              <h3 className="text-title-lg font-bold text-on-surface">Maintenance History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    {['Date', 'Type', 'Description', 'Cost', 'Status'].map((h) => (
                      <th key={h} className="px-lg py-3 text-label-sm text-on-surface-variant uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {logs.length === 0 && (
                    <tr><td colSpan={5} className="px-lg py-lg text-on-surface-variant">No maintenance records.</td></tr>
                  )}
                  {logs.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-container transition-colors">
                      <td className="px-lg py-4 text-body-sm font-medium whitespace-nowrap">{formatDate(r.scheduled_date)}</td>
                      <td className="px-lg py-4 text-body-sm capitalize">{r.type.replace(/_/g, ' ')}</td>
                      <td className="px-lg py-4 text-body-sm">{r.description}</td>
                      <td className="px-lg py-4 text-body-sm text-right whitespace-nowrap">{r.cost ? `$${Number(r.cost).toFixed(2)}` : '—'}</td>
                      <td className="px-lg py-4">
                        <StatusBadge status={r.status === 'completed' ? 'available' : 'maintenance'} label={r.status.replace(/_/g, ' ')} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="col-span-12 lg:col-span-4 space-y-lg">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h3 className="text-title-lg font-bold text-on-surface mb-lg">Current Assignment</h3>
            {assignment?.user ? (
              <div className="space-y-md">
                <div className="flex items-center gap-md p-md bg-surface-container rounded-lg">
                  <div className="w-14 h-14 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center text-title-lg font-bold flex-shrink-0">
                    {assignment.user.first_name[0]}{assignment.user.last_name[0]}
                  </div>
                  <div>
                    <p className="text-body-md font-bold text-on-surface">{assignment.user.first_name} {assignment.user.last_name}</p>
                    <p className="text-body-sm text-on-surface-variant">{assignment.user.email}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                  <span className="text-label-md text-on-surface-variant">Assigned Date</span>
                  <span className="text-body-sm font-medium">{formatDate(assignment.assigned_date)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-outline-variant">
                  <span className="text-label-md text-on-surface-variant">Expected Return</span>
                  <span className="text-body-sm font-medium">{formatDate(assignment.expected_return_date)}</span>
                </div>
              </div>
            ) : (
              <p className="text-on-surface-variant text-body-sm">No active assignment.</p>
            )}
          </section>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setEditing(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-title-lg font-bold">Edit Asset</h3>
              <button onClick={() => setEditing(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-lg space-y-md max-h-[70vh] overflow-y-auto">
              {(['name','asset_tag','serial_number','vendor','location'] as const).map(field => (
                <div key={field} className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant capitalize">{field.replace(/_/g, ' ')}</label>
                  <input
                    value={(editData[field] as string) ?? ''}
                    onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))}
                    className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant">Status</label>
                  <select value={editData.status ?? ''} onChange={e => setEditData(d => ({ ...d, status: e.target.value as never }))} className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md">
                    {['available','assigned','in_repair','disposed','pending_return'].map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant">Condition</label>
                  <select value={editData.condition ?? ''} onChange={e => setEditData(d => ({ ...d, condition: e.target.value as never }))} className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md">
                    {['excellent','good','fair','poor'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Description</label>
                <textarea value={editData.description ?? ''} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} rows={3} className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md resize-none" />
              </div>
            </div>
            <div className="p-lg border-t border-outline-variant flex gap-md">
              <button onClick={() => setEditing(false)} className="flex-1 py-sm border border-outline-variant font-bold rounded-lg hover:bg-surface-container">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-sm bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
