import Link from 'next/link';
import MaintenanceSummaryCards from '@/components/admin/MaintenanceSummaryCards';
import MaintenanceTable from '@/components/admin/MaintenanceTable';

export default function MaintenancePage() {
  return (
    <div className="flex flex-col gap-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
        <div>
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-xs">
            <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Admin</Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface font-medium">Maintenance</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">Maintenance Logs</h2>
        </div>
        <button className="bg-primary text-on-primary px-lg py-md rounded-lg font-bold flex items-center gap-sm shadow-lg hover:opacity-90 active:scale-95 transition-all w-fit">
          <span className="material-symbols-outlined">post_add</span>
          Log Maintenance
        </button>
      </div>

      <MaintenanceSummaryCards />
      <MaintenanceTable />
    </div>
  );
}
