import EmployeeFilterBar from '@/components/admin/EmployeeFilterBar';
import EmployeeTable from '@/components/admin/EmployeeTable';

export default function EmployeesPage() {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-sm text-body-sm text-on-surface-variant mb-md">
        <a href="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</a>
        <span>/</span>
        <span className="text-on-surface font-medium">Employees</span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Employees</h2>
          <p className="text-body-sm text-on-surface-variant">Manage organization personnel and asset assignments.</p>
        </div>
        <button className="flex items-center gap-sm px-lg py-2.5 bg-primary text-on-primary rounded-lg font-medium text-body-sm hover:opacity-90 transition-all shadow-sm">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Employee
        </button>
      </div>

      <EmployeeFilterBar />
      <EmployeeTable />
    </>
  );
}
