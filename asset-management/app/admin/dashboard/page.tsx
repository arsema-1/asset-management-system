import StatCard from '@/components/admin/StatCard';
import RecentActivities from '@/components/admin/RecentActivities';
import QuickActions from '@/components/admin/QuickActions';
import AssetDistribution from '@/components/admin/AssetDistribution';

const stats = [
  { label: 'Total Assets', value: '1,240', note: '+12% vs last month', icon: 'inventory', iconColor: 'text-primary', trend: 'trending_up', trendColor: 'text-primary' },
  { label: 'Assigned', value: '980', note: '79% utilization rate', icon: 'person_check', iconColor: 'text-[#0ea5e9]' },
  { label: 'Available', value: '210', note: 'Ready for deployment', icon: 'check_circle', iconColor: 'text-[#22c55e]' },
  { label: 'Pending', value: '15', note: '5 high priority', icon: 'pending_actions', iconColor: 'text-[#f59e0b]', trendColor: 'text-error' },
  { label: 'Maintenance', value: '35', note: 'Avg 2.4 days repair', icon: 'handyman', iconColor: 'text-error' },
];

export default function AdminDashboard() {
  return (
    <>
      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row justify-between items-end md:items-center gap-md">
        <div>
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-xs">
            <span>Main</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">Dashboard</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">Welcome back, Admin</h2>
          <p className="text-body-md text-on-surface-variant">
            Here is an overview of your organization's assets and activities for today.
          </p>
        </div>
        <div className="flex gap-md">
          <button className="flex items-center gap-xs px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            <span className="text-label-md">Filter</span>
          </button>
          <button className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm">
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span className="text-label-md">Export Data</span>
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <RecentActivities />
        <div className="space-y-lg">
          <QuickActions />
          <AssetDistribution />
        </div>
      </div>
    </>
  );
}
