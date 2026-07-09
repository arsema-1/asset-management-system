import Link from 'next/link';
import RequestStatCards from '@/components/employee/RequestStatCards';
import RequestsTable from '@/components/employee/RequestsTable';

export default function EmployeeRequestsPage() {
  return (
    <div className="space-y-lg">
      {/* Header */}
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
        <button className="bg-primary text-on-primary px-lg py-md rounded-xl font-bold flex items-center gap-md shadow-lg hover:scale-105 active:scale-95 transition-all">
          <span className="material-symbols-outlined">add</span>
          New Request
        </button>
      </div>

      <RequestStatCards />
      <RequestsTable />

      {/* Help Banner */}
      <div className="bg-surface-container-high/40 rounded-xl p-xl flex flex-col md:flex-row gap-lg items-center border border-dashed border-outline">
        <div className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary flex-shrink-0">
          <span className="material-symbols-outlined text-[32px]">lightbulb</span>
        </div>
        <div className="flex-1">
          <h4 className="text-title-lg font-bold text-on-surface">Need assistance with your equipment?</h4>
          <p className="text-body-md text-on-surface-variant mt-1">
            If your current assets are damaged or malfunctioning, please use the Maintenance tab to file a repair request instead of creating a new asset request.
          </p>
        </div>
        <button className="px-lg py-md border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors whitespace-nowrap">
          Contact IT Support
        </button>
      </div>
    </div>
  );
}
