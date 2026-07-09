const activities = [
  { icon: 'assignment_return', bg: 'bg-primary-fixed', iconClass: 'text-primary', title: 'Return Request Submitted', desc: 'Dell UltraSharp 32" • 2h ago' },
  { icon: 'verified', bg: 'bg-secondary-fixed', iconClass: 'text-secondary', title: 'Maintenance Completed', desc: 'MacBook Pro 16" • Yesterday' },
  { icon: 'update', bg: 'bg-tertiary-fixed', iconClass: 'text-tertiary', title: 'Warranty Updated', desc: 'iPhone 15 Pro Max • 3 days ago' },
];

export default function RecentActivityPanel() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
      <h3 className="text-title-lg font-bold mb-md">Recent Activity</h3>
      <div className="space-y-lg">
        {activities.map((a) => (
          <div key={a.title} className="flex gap-md">
            <div className={`w-10 h-10 rounded-full ${a.bg} flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined text-[20px] ${a.iconClass}`}>{a.icon}</span>
            </div>
            <div>
              <p className="text-body-sm font-bold">{a.title}</p>
              <p className="text-label-sm text-on-surface-variant">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
