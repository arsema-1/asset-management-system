import EmployeeStatCards from '@/components/employee/EmployeeStatCards';
import MyCurrentAssets from '@/components/employee/MyCurrentAssets';
import ActivityFeed from '@/components/employee/ActivityFeed';

export default function EmployeeDashboard() {
  return (
    <div className="pt-2">
      {/* Welcome */}
      <header className="mb-xl flex flex-col md:flex-row justify-between items-end md:items-center gap-md">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Welcome back, Alex Rivera</h2>
          <p className="text-body-md text-on-surface-variant">Here is an overview of your equipment and recent requests.</p>
        </div>
        <button className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg font-bold text-label-md hover:-translate-y-0.5 hover:shadow-md transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Request Asset
        </button>
      </header>

      <EmployeeStatCards />

      <div className="grid grid-cols-1 gap-lg">
        <MyCurrentAssets />
        <ActivityFeed />
      </div>
    </div>
  );
}
