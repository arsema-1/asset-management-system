'use client';

import { useEffect, useRef, useState } from 'react';
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
const statusOptions = ['available', 'in_repair', 'pending_return'];

interface Props {
  search?: string;
  category?: string;
  status?: string;
}

export default function AssetTable({ search = '', category = '', status = '' }: Props) {
  const [all, setAll] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchAssets = () => {
    setLoading(true);
    assetsApi.list()
      .then(setAll)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchAssets, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Client-side filtering
  const filtered = all.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.asset_tag.toLowerCase().includes(q);
    const matchCat = !category || a.category === category;
    const matchStatus = !status || a.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    setMenuOpen(null);
    try {
      const updated = await assetsApi.update(id, { status: newStatus } as Partial<Asset>);
      setAll(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string, name: string, assetStatus: string) => {
    if (assetStatus === 'assigned') {
      setError('Cannot delete an assigned asset. Please return it first.');
      return;
    }
    if (!window.confirm(`Permanently delete "${name}"?\n\nThis action cannot be undone and will remove all associated history.`)) return;
    try {
      await assetsApi.delete(id);
      setAll(prev => prev.filter(a => a.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
    }
  };

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
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-lg py-lg text-on-surface-variant">No assets found.</td></tr>
              )}
              {filtered.map(asset => {
                const isUpdating = updating === asset.id;
                return (
                  <tr key={asset.id} className="hover:bg-background transition-colors group">
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
                    <td className="px-lg py-md text-body-sm text-on-surface-variant font-mono">{asset.asset_tag}</td>
                    <td className="px-lg py-md text-body-sm capitalize">{asset.category}</td>
                    <td className="px-lg py-md text-center">
                      {isUpdating
                        ? <span className="material-symbols-outlined animate-spin text-primary text-[20px]">sync</span>
                        : <StatusBadge status={statusKeyMap[asset.status] ?? 'retired'} label={asset.status.replace(/_/g, ' ')} />
                      }
                    </td>
                    <td className="px-lg py-md text-right relative">
                      <div className="flex items-center justify-end gap-sm">
                        <Link href={`/admin/assets/${asset.id}`}>
                          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[20px]">visibility</span>
                        </Link>
                        <Link href={`/admin/assets/${asset.id}`} title="Edit asset">
                          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[20px]">edit</span>
                        </Link>
                        <button 
                          onClick={() => handleDelete(asset.id, asset.name, asset.status)}
                          title={asset.status === 'assigned' ? 'Cannot delete assigned asset' : 'Delete asset'}
                          disabled={asset.status === 'assigned'}
                          className={`material-symbols-outlined text-[20px] transition-colors ${
                            asset.status === 'assigned' 
                              ? 'text-on-surface-variant/30 cursor-not-allowed' 
                              : 'text-on-surface-variant hover:text-error'
                          }`}>
                          delete
                        </button>
                        <button onClick={() => setMenuOpen(menuOpen === asset.id ? null : asset.id)} disabled={isUpdating}
                          className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[20px]">
                          more_vert
                        </button>
                      </div>
                      {menuOpen === asset.id && (
                        <div ref={menuRef} className="absolute right-8 top-0 z-20 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden">
                          <p className="px-md py-sm text-label-sm text-on-surface-variant uppercase font-bold border-b border-outline-variant">Change Status</p>
                          {statusOptions.filter(s => s !== asset.status).map(s => (
                            <button key={s} onClick={() => handleStatusChange(asset.id, s)}
                              className="w-full text-left px-md py-sm text-body-sm hover:bg-surface-container transition-colors capitalize">
                              {s.replace(/_/g, ' ')}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="px-lg py-md border-t border-outline-variant flex items-center justify-between">
        <p className="text-label-sm text-on-surface-variant">
          {filtered.length} of {all.length} assets
        </p>
      </div>
    </div>
  );
}
