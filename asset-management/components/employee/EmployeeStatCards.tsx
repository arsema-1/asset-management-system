const stats = [
  { label: 'Total Assigned', value: '4', note: 'Active devices in use', icon: 'devices', valueClass: 'text-primary' },
  { label: 'Pending Requests', value: '1', note: 'Waiting for approval', icon: 'hourglass_empty', valueClass: 'text-tertiary' },
  { label: 'Approved', value: '12', note: 'Total lifetime approvals', icon: 'verified', valueClass: 'text-secondary' },
  { label: 'Returned', value: '2', note: 'Successfully deprovisioned', icon: 'keyboard_return', valueClass: 'text-on-surface-variant' },
];

export default function EmployeeStatCards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
      {stats.map((s) => (
        <div key={s.label} className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:-translate-y-1 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-sm">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">{s.label}</span>
            <span className="material-symbols-outlined text-on-surface-variant">{s.icon}</span>
          </div>
          <div className={`text-display font-bold ${s.valueClass}`}>{s.value}</div>
          <div className="mt-xs text-label-sm text-on-surface-variant">{s.note}</div>
        </div>
      ))}
    </section>
  );
}
