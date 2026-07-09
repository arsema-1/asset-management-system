import AssetFilterBar from '@/components/admin/AssetFilterBar';
import AssetTable from '@/components/admin/AssetTable';
import Link from 'next/link';

export default function AssetsPage() {
  return (
    <>
      {/* Header */}
      <div className="mb-lg flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-base">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-medium">Assets</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">Assets</h2>
        </div>
        <Link
          href="/admin/assets/new"
          className="bg-primary hover:opacity-90 text-on-primary px-lg py-md rounded-xl font-medium flex items-center gap-sm transition-all shadow-md active:scale-95 w-fit"
        >
          <span className="material-symbols-outlined">add</span>
          Add Asset
        </Link>
      </div>

      <AssetFilterBar />
      <AssetTable />
    </>
  );
}
