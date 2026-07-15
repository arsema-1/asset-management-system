'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/shared/StatusBadge';
import { assets as assetsApi, type Asset } from '@/lib/api';

const categoryIcons: Record<string, string> = {
  laptop: 'laptop_mac', monitor: 'monitor', mobile: 'smartphone',
  peripheral: 'keyboard', infrastructure: 'dns', furniture: 'desk', other: 'devices',
};

const statusKeyMap: Record<string, string> = {
  available: 'available', assigned: 'assigned', in_repair: 'maintenance',
  disposed: 'retired', pending_return: 'maintenance',
};

export default function AssetTable() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    assetsApi.list()
      .then(setAssets)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        {loading && <p className="p-lg text-on-surface-variant">Loading...</p>}
        {error && <p className="p-lg text-error">{error}</p>}
        {!loading && !error && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant">Asset Name</th>
                <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant">Asset Tag</th>
                <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant">Category</th>
                <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant text-center">Status</th>
                <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {assets.length === 0 && (
                <tr><td colSpan={5} className="px-lg py-lg text-on-surface-variant">No assets found.</td></tr>
              )}
              {assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-background transition-colors group cursor-pointer">
                  <td className="px-lg py-md">
                    <Link href={`/admin/assets/${asset.id}`} className="flex items-center gap-sm">
                      <div className="p-xs bg-secondary-container text-on-secondary-container rounded">
                        <span className="material-symbols-outlined text-[18px]">
                          {categoryIcons[asset.category] ?? 'devices'}
                        </span>
                      </div>
                      <span className="text-body-sm font-medium hover:text-primary transition-colors">{asset.name}</span>
                    </Link>
                  </td>
                  <td className="px-lg py-md text-body-sm text-on-surface-variant">{asset.asset_tag}</td>
                  <td className="px-lg py-md text-body-sm capitalize">{asset.category}</td>
                  <td className="px-lg py-md text-center">
                    <StatusBadge
                      status={statusKeyMap[asset.status] ?? 'retired'}
                      label={asset.status.replace(/_/g, ' ')}
                    />
                  </td>
                  <td className="px-lg py-md text-right">
                    <div className="flex items-center justify-end gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/assets/${asset.id}`}>
                        <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[20px]">visibility</span>
                      </Link>
                      <Link href={`/admin/assets/${asset.id}`}>
                        <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[20px]">edit</span>
                      </Link>
                      <button className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors text-[20px]">
                        delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="px-lg py-md border-t border-outline-variant flex items-center justify-between">
        <p className="text-label-sm text-on-surface-variant">Showing {assets.length} assets</p>
      </div>
    </div>
  );
}
