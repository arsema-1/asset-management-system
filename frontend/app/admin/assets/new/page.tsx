'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { assets as assetsApi } from '@/lib/api';

export default function NewAssetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const get = (name: string) => (form.elements.namedItem(name) as HTMLInputElement)?.value || undefined;

    setLoading(true);
    setError('');
    try {
      await assetsApi.create({
        name: get('name')!,
        serial_number: get('serial_number'),
        category: get('category')!,
        status: (get('status') ?? 'available') as never,
        condition: (get('condition') ?? 'good') as never,
        purchase_date: get('purchase_date'),
        purchase_cost: get('purchase_cost') ? Number(get('purchase_cost')) : undefined,
        warranty_expiry: get('warranty_expiry'),
        vendor: get('vendor'),
        location: get('location'),
        description: get('description'),
      });
      router.push('/admin/assets');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-md">
        <Link href="/admin/dashboard" className="hover:text-primary">Dashboard</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href="/admin/assets" className="hover:text-primary">Assets</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-on-surface font-medium">New Asset</span>
      </nav>

      <div className="max-w-2xl">
        <h2 className="text-headline-lg font-bold text-on-surface mb-xl">Add New Asset</h2>

        <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl space-y-md shadow-sm">
          {/* Auto-generated tag notice */}
          <div className="flex items-center gap-sm px-md py-sm bg-primary-container/40 text-on-primary-container rounded-lg text-body-sm">
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>Asset tag (<strong>AST-XXXXXX</strong>) is auto-generated. No need to enter one.</span>
          </div>

          {/* Name (full width — tag is auto-generated) */}
          <div className="space-y-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="name">Asset Name *</label>
            <input id="name" name="name" required placeholder="MacBook Pro 16&quot;" className="input-field" />
          </div>

          {/* Serial + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="serial_number">Serial Number</label>
              <input id="serial_number" name="serial_number" placeholder="XN-4492-L990" className="input-field" />
            </div>
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="category">Category *</label>
              <select id="category" name="category" required className="input-field">
                <option value="">Select...</option>
                {['laptop','monitor','mobile','peripheral','infrastructure','furniture','other'].map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status + Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue="available" className="input-field">
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="in_repair">In Repair</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="condition">Condition</label>
              <select id="condition" name="condition" defaultValue="good" className="input-field">
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          {/* Purchase Date + Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="purchase_date">Purchase Date</label>
              <input id="purchase_date" name="purchase_date" type="date" className="input-field" />
            </div>
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="purchase_cost">Purchase Cost ($)</label>
              <input id="purchase_cost" name="purchase_cost" type="number" step="0.01" placeholder="0.00" className="input-field" />
            </div>
          </div>

          {/* Warranty + Vendor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="warranty_expiry">Warranty Expiry</label>
              <input id="warranty_expiry" name="warranty_expiry" type="date" className="input-field" />
            </div>
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant" htmlFor="vendor">Vendor</label>
              <input id="vendor" name="vendor" placeholder="Apple Enterprise" className="input-field" />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="location">Location</label>
            <input id="location" name="location" placeholder="HQ - Floor 4" className="input-field" />
          </div>

          {/* Description */}
          <div className="space-y-xs">
            <label className="text-label-md text-on-surface-variant" htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={3} placeholder="Optional notes..." className="input-field resize-none" />
          </div>

          {error && <p className="text-error text-body-sm">{error}</p>}

          <div className="flex gap-md pt-sm">
            <Link href="/admin/assets" className="flex-1 py-md border border-outline-variant text-on-surface font-bold rounded-lg text-center hover:bg-surface-container transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="flex-1 py-md bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-sm">
              {loading ? <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span>Saving...</> : 'Save Asset'}
            </button>
          </div>
        </form>
      </div>

      <style>{`.input-field { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid var(--color-outline-variant); border-radius: 0.5rem; background: transparent; font-size: 0.875rem; outline: none; transition: border-color 0.15s; } .input-field:focus { border-color: var(--color-primary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent); }`}</style>
    </>
  );
}
