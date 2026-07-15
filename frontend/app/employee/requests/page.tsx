'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import RequestStatCards from '@/components/employee/RequestStatCards';
import RequestsTable from '@/components/employee/RequestsTable';
import { assetRequests, assets as assetsApi, type Asset } from '@/lib/api';

const iconMap: Record<string, string> = {
  laptop: 'laptop_mac', monitor: 'desktop_windows', mobile: 'smartphone',
  peripheral: 'keyboard', infrastructure: 'dns', furniture: 'desk', other: 'devices',
};

export default function EmployeeRequestsPage() {
  const [showModal, setShowModal] = useState(false);
  const [catalog, setCatalog] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Load available assets when modal opens
  useEffect(() => {
    if (!showModal) return;
    assetsApi.list({ status: 'available' }).then(setCatalog).catch(() => {});
  }, [showModal]);

  const openModal = () => {
    setSelectedAsset(null);
    setReason('');
    setError('');
    setShowModal(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) { setError('Please select an asset.'); return; }
    if (!reason.trim()) { setError('Please provide a reason.'); return; }
    setSaving(true);
    setError('');
    try {
      await assetRequests.create({
        asset_name: selectedAsset.name,
        category: selectedAsset.category as never,
        reason,
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
        <button onClick={openModal} className="bg-primary text-on-primary px-lg py-md rounded-xl font-bold flex items-center gap-md shadow-lg hover:scale-105 active:scale-95 transition-all">
          <span className="material-symbols-outlined">add</span>
          New Request
        </button>
      </div>

      <RequestStatCards key={refreshKey} />
      <RequestsTable key={refreshKey} />

      <div className="bg-surface-container-high/40 rounded-xl p-xl flex flex-col md:flex-row gap-lg items-center border border-dashed border-outline">
        <div className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-[32px]">lightbulb</span>
        </div>
        <div className="flex-1">
          <h4 className="text-title-lg font-bold text-on-surface">Need assistance with your equipment?</h4>
          <p className="text-body-md text-on-surface-variant mt-1">
            If your current assets are damaged or malfunctioning, please contact IT support instead.
          </p>
        </div>
        <Link href="/employee/support" className="px-lg py-md border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors whitespace-nowrap">
          Contact IT Support
        </Link>
      </div>

      {/* New Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setShowModal(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-primary text-on-primary flex-shrink-0">
              <h3 className="text-title-lg font-bold">Request an Asset</h3>
              <button onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
              {/* Asset Catalog Grid */}
              <div className="p-lg flex-1 overflow-y-auto space-y-md">
                <p className="text-label-md text-on-surface-variant">Select from available assets</p>
                {catalog.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant py-lg text-center">No available assets at this time.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-sm">
                    {catalog.map(a => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedAsset(a)}
                        className={`p-md rounded-xl border-2 text-left transition-all ${
                          selectedAsset?.id === a.id
                            ? 'border-primary bg-primary/5'
                            : 'border-outline-variant hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-sm mb-xs">
                          <span className="material-symbols-outlined text-primary text-[20px]">
                            {iconMap[a.category] ?? 'devices'}
                          </span>
                          {selectedAsset?.id === a.id && (
                            <span className="material-symbols-outlined text-primary text-[18px] ml-auto" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          )}
                        </div>
                        <p className="text-body-sm font-bold text-on-surface truncate">{a.name}</p>
                        <p className="text-label-sm text-on-surface-variant">{a.asset_tag}</p>
                        <p className="text-label-sm text-on-surface-variant capitalize">{a.category} · {a.condition}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-xs pt-sm">
                  <label className="text-label-md text-on-surface-variant">Reason for Request *</label>
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    required
                    rows={3}
                    placeholder="Explain why you need this asset..."
                    className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md resize-none"
                  />
                </div>

                {selectedAsset && (
                  <div className="flex items-center gap-sm p-sm bg-primary/5 border border-primary/20 rounded-lg">
                    <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                    <p className="text-body-sm text-on-surface">Selected: <span className="font-bold">{selectedAsset.name}</span></p>
                  </div>
                )}

                {error && <p className="text-error text-body-sm">{error}</p>}
              </div>

              <div className="flex gap-md p-lg border-t border-outline-variant flex-shrink-0">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-sm border border-outline-variant font-bold rounded-lg hover:bg-surface-container">Cancel</button>
                <button type="submit" disabled={saving || !selectedAsset} className="flex-1 py-sm bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-60">
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
