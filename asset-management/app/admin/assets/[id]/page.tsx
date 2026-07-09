import Link from 'next/link';
import AssetInfo from '@/components/admin/AssetInfo';
import MaintenanceHistory from '@/components/admin/MaintenanceHistory';
import CurrentAssignment from '@/components/admin/CurrentAssignment';
import ActivityTimeline from '@/components/admin/ActivityTimeline';

export default function AssetDetailPage() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-xs mb-md text-body-sm text-on-surface-variant">
        <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <Link href="/admin/assets" className="hover:text-primary transition-colors">Assets</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="font-semibold text-on-surface">MacBook Pro 16"</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md mb-xl">
        <div className="space-y-sm">
          <div className="flex flex-wrap items-center gap-md">
            <h2 className="text-headline-lg font-bold text-on-surface">
              MacBook Pro 16" (M3 Max, 64GB)
            </h2>
            <span className="bg-[#d1fae5] text-[#065f46] text-label-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#065f46]" />
              Assigned
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-lg text-body-sm text-on-surface-variant">
            <span className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">tag</span>
              ASSET-MBP-2024-089
            </span>
            <span className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              HQ - Floor 4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-md">
          <button className="px-lg py-2 border border-outline text-on-surface text-label-md font-bold rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">delete_outline</span>
            Dispose
          </button>
          <button className="px-lg py-2 bg-primary text-on-primary text-label-md font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-xs shadow-md">
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Asset
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-lg items-start">
        {/* Left — 8 cols */}
        <div className="col-span-12 lg:col-span-8 space-y-lg">
          <AssetInfo />
          <MaintenanceHistory />
        </div>

        {/* Right — 4 cols */}
        <div className="col-span-12 lg:col-span-4 space-y-lg">
          <CurrentAssignment />
          <ActivityTimeline />
        </div>
      </div>
    </>
  );
}
