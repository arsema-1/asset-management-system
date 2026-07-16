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
    if (!selectedAsset) { setError('Please select an asset from the catalog.'); return; }
    if (!reason.trim()) { setError('Please provide a reason for this request.'); return; }
    setSaving(true);
    setError('');
    try {
      await assetRequests.create({
        asset_name: selectedAsset.name,
        category: selectedAsset.category as never,
        reason,
        asset_id: selectedAsset.id, // Include asset_id for reference
      });
      setShowModal(false);
      setRefreshKey(k => k + 1);
      // Show success feedback
      alert(`Request submitted successfully!\n\nAsset: ${selectedAsset.name}\n\nYou will be notified when an admin reviews your request.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit request. Please try again.');
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

      <RequestStatCards refreshKey={refreshKey} />
      <RequestsTable refreshKey={refreshKey} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="bg-gradient-to-br from-primary to-primary/80 text-on-primary rounded-xl p-lg flex flex-col gap-md shadow-md">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-[28px]">notifications</span>
            <span className="text-title-lg font-bold">Stay Updated</span>
          </div>
          <p className="text-body-sm opacity-90 leading-relaxed">
            You'll receive notifications when an admin reviews your request.
          </p>
          <Link href="/employee/notifications" className="mt-auto inline-flex items-center gap-xs text-label-sm font-bold text-on-primary/90 hover:text-on-primary transition-colors">
            <span>View Notifications</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-secondary-container to-secondary-container/60 text-on-secondary-container rounded-xl p-lg flex flex-col gap-md shadow-sm border border-outline-variant">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-[28px]">support_agent</span>
            <span className="text-title-lg font-bold">Need IT Help?</span>
          </div>
          <p className="text-body-sm text-on-surface leading-relaxed">
            For damaged or malfunctioning equipment, contact IT support directly.
          </p>
          <Link href="/employee/support" className="mt-auto inline-flex items-center gap-xs text-label-sm font-bold text-primary hover:text-primary/80 transition-colors">
            <span>Contact IT Support</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-surface-container-high to-surface-container text-on-surface rounded-xl p-lg flex flex-col gap-md shadow-sm border border-dashed border-outline-variant">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-[28px] text-primary">history</span>
            <span className="text-title-lg font-bold">Track Progress</span>
          </div>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            Monitor your request status in the table below. Approved requests are processed by IT.
          </p>
          <span className="mt-auto inline-flex items-center gap-xs text-label-sm font-bold text-on-surface-variant">
            <span>Scroll down to view</span>
            <span className="material-symbols-outlined text-[16px]">expand_more</span>
          </span>
        </div>
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
                <div className="bg-secondary-container p-md rounded-lg border border-outline-variant">
                  <p className="text-label-sm text-on-surface-variant flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    Select an asset from the catalog below. Admin will review your request and notify you.
                  </p>
                </div>
                
                <p className="text-label-md text-on-surface font-medium">Available Assets ({catalog.length})</p>
                {catalog.length === 0 ? (
                  <div className="text-center py-xl">
                    <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-md">inventory_2</span>
                    <p className="text-body-md text-on-surface-variant">No available assets at this time.</p>
                    <p className="text-body-sm text-on-surface-variant mt-xs">Check back later or contact IT support.</p>
                  </div>
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
                        <p className="text-label-sm text-on-surface-variant capitalize">{a.category}</p>
                        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">{a.condition}</span>
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
                  <div className="flex items-center gap-sm p-md bg-primary text-on-primary rounded-lg">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <div className="flex-1">
                      <p className="text-label-sm opacity-90">Selected Asset</p>
                      <p className="text-body-md font-bold">{selectedAsset.name} • {selectedAsset.asset_tag}</p>
                    </div>
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
