import AssignmentFilterBar from '@/components/admin/AssignmentFilterBar';
import AssignmentTable from '@/components/admin/AssignmentTable';
import Link from 'next/link';

export default function AssignmentsPage() {
  return (
    <section className="px-lg py-lg bg-surface flex-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
        <div className="space-y-xs">
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant">
            <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-medium">Asset Assignments</span>
          </nav>
          <h1 className="text-headline-lg font-bold text-on-surface">Asset Assignments</h1>
        </div>
        <button className="bg-primary text-on-primary px-lg py-sm rounded-lg flex items-center gap-sm font-bold text-label-md hover:opacity-90 transition-all active:scale-95 w-fit">
          <span className="material-symbols-outlined">add</span>
          New Assignment
        </button>
      </div>

      <AssignmentFilterBar />
      <AssignmentTable />
    </section>
  );
}
