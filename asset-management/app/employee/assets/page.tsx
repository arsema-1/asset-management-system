'use client';

import { useEffect, useState } from 'react';
import MyAssetCard from '@/components/employee/MyAssetCard';
import RecentActivityPanel from '@/components/employee/RecentActivityPanel';
import { assets as assetsApi, type Asset } from '@/lib/api';

function assetCardProps(asset: Asset) {
  const iconMap: Record<string, string> = {
    laptop: 'laptop_mac', monitor: 'desktop_windows', mobile: 'smartphone',
    peripheral: 'keyboard', infrastructure: 'dns', furniture: 'desk', other: 'devices',
  };
  const conditionMap: Record<string, string> = {
    excellent: 'Excellent', good: 'Good', fair: 'Fair', poor: 'Poor',
  };
  return {
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
    statusDotClass: asset.status === 'pending_return'
      ? 'bg-tertiary animate-pulse'
      : 'bg-primary',
    pendingReturn: asset.status === 'pending_return',
  };
}

export default function EmployeeAssetsPage() {
  const [assetList, setAssetList] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    assetsApi.list({ mine: 'true' })
      .then(setAssetList)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Header */}
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
        <div className="flex items-center bg-white border border-outline-variant rounded-xl p-1 shadow-sm gap-1">
          <button className="p-2 bg-surface-container-high rounded-lg text-primary">
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined">list</span>
          </button>
        </div>
      </div>

      {loading && <p className="text-on-surface-variant text-body-md">Loading assets...</p>}
      {error && <p className="text-error text-body-md">{error}</p>}

      {/* Asset Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {assetList.length === 0
            ? <p className="text-on-surface-variant col-span-3">No assets assigned.</p>
            : assetList.map((asset) => (
                <MyAssetCard key={asset.asset_tag} {...assetCardProps(asset)} />
              ))
          }
        </div>
      )}

      {/* Bottom Section */}
      <div className="mt-xl grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-lg border border-dashed border-outline-variant flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant">add_shopping_cart</span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface mb-xs">Need more equipment?</h3>
          <p className="text-body-md text-on-surface-variant max-w-md mb-lg">
            Browse our catalog to request new software licenses, hardware upgrades, or ergonomic office furniture.
          </p>
          <button className="bg-primary text-on-primary py-md px-xl rounded-xl font-bold active:scale-95 transition-transform hover:opacity-90">
            Browse Catalog
          </button>
        </div>
        <RecentActivityPanel />
      </div>
    </>
  );
}
