const stats = [
  { label: 'Total Requests', value: '12', valueClass: 'text-on-surface', icon: 'history', iconBg: 'bg-primary/10 text-primary' },
  { label: 'Pending Approval', value: '3', valueClass: 'text-primary', icon: 'pending_actions', iconBg: 'bg-secondary-container text-secondary' },
  { label: 'Approved', value: '7', valueClass: 'text-tertiary', icon: 'check_circle', iconBg: 'bg-tertiary-fixed text-tertiary' },
];

export default function RequestStatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
      {stats.map((s) => (
        <div key={s.label} className="bg-white/80 backdrop-blur-sm border border-outline-variant p-lg rounded-xl flex flex-col justify-between">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">{s.label}</span>
          <div className="flex items-end justify-between mt-md">
            <span className={`text-display font-bold ${s.valueClass}`}>{s.value}</span>
            <div className={`p-2 rounded-lg ${s.iconBg}`}>
              <span className="material-symbols-outlined">{s.icon}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Avg Processing — special card */}
      <div className="bg-primary text-on-primary p-lg rounded-xl relative overflow-hidden flex flex-col justify-between">
        <div className="relative z-10">
          <span className="text-label-sm opacity-80 uppercase tracking-wider">Average Processing</span>
          <div className="mt-md">
            <span className="text-display font-bold">2.4<span className="text-title-lg ml-1">days</span></span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10 scale-150 rotate-12">
          <span className="material-symbols-outlined text-[120px]">bolt</span>
        </div>
      </div>
    </div>
  );
}
