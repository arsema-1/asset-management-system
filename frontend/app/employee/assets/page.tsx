'use client';

import { useEffect, useState } from 'react';
import MyAssetCard from '@/components/employee/MyAssetCard';
import RecentActivityPanel from '@/components/employee/RecentActivityPanel';
import { assets as assetsApi, maintenance as maintenanceApi, type Asset } from '@/lib/api';

const iconMap: Record<string, string> = {
  laptop: 'laptop_mac', monitor: 'desktop_windows', mobile: 'smartphone',
  peripheral: 'keyboard', infrastructure: 'dns', furniture: 'desk', other: 'devices',
};
const conditionMap: Record<string, string> = { excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor' };

function assetCardProps(asset: Asset) {
  return {
    id: asset.id,
    name: asset.name,
    tag: asset.asset_tag,
    icon: iconMap[asset.category] ?? 'devices',
    assignedDate: asset.purchase_date ?? 'N/A',
    condition: conditionMap[asset.condition] ?? asset.condition,
    conditionClass: 'status-available',
    status: asset.status === 'pending_return' ? 'Pending Return' : 'Assigned',
    statusClass: asset.status === 'pending_return'
      ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
      : 'bg-secondary-fixed text-on-secondary-fixed',
    statusDotClass: asset.status === 'pending_return' ? 'bg-tertiary animate-pulse' : 'bg-primary',
    pendingReturn: asset.status === 'pending_return',
  };
}

export default function EmployeeAssetsPage() {
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [catalog, setCatalog] = useState<Asset[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedAssetForReport, setSelectedAssetForReport] = useState<{ id: string; name: string } | null>(null);
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForReport) return;
    if (!issueType) { setReportError('Please select an issue type.'); return; }
    if (!issueDescription.trim()) { setReportError('Please provide a description.'); return; }

    setSubmittingReport(true);
    setReportError('');
    try {
      await maintenanceApi.create({
        asset_id: selectedAssetForReport.id,
        type: issueType as any,
        description: issueDescription,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setSelectedAssetForReport(null);
      }, 2000);
    } catch (err: unknown) {
      setReportError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  useEffect(() => {
    assetsApi.list()
      .then(setMyAssets)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const openCatalog = () => {
    assetsApi.list({ status: 'available' }).then(setCatalog).catch(() => {});
    setShowCatalog(true);
  };

  return (
    <>
      <div className="flex justify-between items-end mb-xl">
        <div>
          <nav className="flex items-center gap-xs text-on-surface-variant text-label-sm mb-xs">
            <span>Organization</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Inventory</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">My Assets</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">My Assigned Assets</h2>
        </div>
      </div>

      {loading && <p className="text-on-surface-variant text-body-md">Loading assets...</p>}
      {error && <p className="text-error text-body-md">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {myAssets.length === 0
            ? <p className="text-on-surface-variant col-span-3">No assets assigned.</p>
            : myAssets.map(asset => (
                <MyAssetCard
                  key={asset.asset_tag}
                  {...assetCardProps(asset)}
                  onReportIssue={(id, name) => {
                    setSelectedAssetForReport({ id, name });
                    setIssueType('');
                    setIssueDescription('');
                    setReportError('');
                    setReportSuccess(false);
                    setShowReportModal(true);
                  }}
                />
              ))
          }
        </div>
      )}

      <div className="mt-xl grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-lg border border-dashed border-outline-variant flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant">add_shopping_cart</span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface mb-xs">Need more equipment?</h3>
          <p className="text-body-md text-on-surface-variant max-w-md mb-lg">
            Browse available assets you can request from the IT inventory.
          </p>
          <button onClick={openCatalog} className="bg-primary text-on-primary py-md px-xl rounded-xl font-bold active:scale-95 transition-transform hover:opacity-90">
            Browse Catalog
          </button>
        </div>
        <RecentActivityPanel />
      </div>

      {/* Catalog Modal */}
      {showCatalog && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setShowCatalog(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-primary text-on-primary">
              <div>
                <h3 className="text-title-lg font-bold">Available Asset Catalog</h3>
                <p className="text-body-sm opacity-90 mt-1">
                  {catalog.length} active {catalog.length === 1 ? 'asset' : 'assets'} available for request
                </p>
              </div>
              <button onClick={() => setShowCatalog(false)} className="hover:opacity-70 transition-opacity">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="overflow-y-auto p-lg">
              {catalog.length === 0 ? (
                <div className="text-center py-xl">
                  <span className="material-symbols-outlined text-[64px] text-on-surface-variant mb-md">inventory_2</span>
                  <p className="text-body-lg font-bold text-on-surface mb-xs">No Available Assets</p>
                  <p className="text-body-md text-on-surface-variant">All assets are currently assigned. Check back later.</p>
                </div>
              ) : (
                <>
                  <div className="bg-secondary-container p-md rounded-lg border border-outline-variant mb-lg">
                    <p className="text-label-sm text-on-surface-variant flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[18px]">info</span>
                      These assets are currently available and can be requested
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md">
                    {catalog.map(a => (
                      <div key={a.id} className="border border-outline-variant rounded-xl p-md flex flex-col gap-sm hover:shadow-md hover:border-primary transition-all">
                        <div className="h-24 bg-surface-container rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-[48px] text-primary">
                            {iconMap[a.category] ?? 'devices'}
                          </span>
                        </div>
                        <div className="flex items-center gap-xs mb-xs">
                          <span className="px-xs py-0.5 bg-primary/10 text-primary text-label-xs font-bold rounded uppercase">Available</span>
                          <span className="px-xs py-0.5 bg-surface-container text-on-surface-variant text-label-xs font-bold rounded uppercase">{a.condition}</span>
                        </div>
                        <div>
                          <p className="text-body-sm font-bold text-on-surface">{a.name}</p>
                          <p className="text-label-sm text-on-surface-variant">{a.asset_tag}</p>
                          <p className="text-label-sm text-on-surface-variant capitalize">{a.category}</p>
                        </div>
                        <a 
                          href="/employee/requests" 
                          className="mt-auto text-center py-sm bg-primary text-on-primary text-label-md font-bold rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Request This Asset
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {showReportModal && selectedAssetForReport && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setShowReportModal(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-primary text-on-primary">
              <h3 className="text-title-lg font-bold">Report Asset Issue</h3>
              <button onClick={() => setShowReportModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            {reportSuccess ? (
              <div className="p-xl text-center space-y-md">
                <span className="material-symbols-outlined text-[48px] text-primary animate-bounce">check_circle</span>
                <h4 className="text-title-lg font-bold">Report Submitted!</h4>
                <p className="text-body-md text-on-surface-variant">The IT support team has been notified of the issue.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="p-lg space-y-md">
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase">Asset</p>
                  <p className="text-body-lg font-bold mt-1">{selectedAssetForReport.name}</p>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant">Issue Type *</label>
                  <select
                    value={issueType}
                    onChange={e => setIssueType(e.target.value)}
                    required
                    className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md bg-white"
                  >
                    <option value="">Select type...</option>
                    <option value="hardware_repair">Hardware Repair</option>
                    <option value="software_update">Software Issue</option>
                    <option value="routine_check">Routine Check</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant">Description of Problem *</label>
                  <textarea
                    value={issueDescription}
                    onChange={e => setIssueDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Describe what's wrong with the device..."
                    className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md resize-none"
                  />
                </div>
                {reportError && <p className="text-error text-body-sm">{reportError}</p>}
                <div className="flex gap-md pt-sm">
                  <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-sm border border-outline-variant font-bold rounded-lg hover:bg-surface-container">Cancel</button>
                  <button type="submit" disabled={submittingReport} className="flex-1 py-sm bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-60">
                    {submittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
