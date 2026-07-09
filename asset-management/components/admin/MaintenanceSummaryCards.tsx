const cards = [
  {
    icon: 'engineering',
    iconBg: 'bg-error-container text-on-error-container',
    label: 'Assets in Repair',
    value: '08',
    note: '2 added today',
    noteClass: 'text-error',
    noteIcon: 'trending_up',
  },
  {
    icon: 'calendar_month',
    iconBg: 'bg-secondary-container text-on-secondary-container',
    label: 'Scheduled Maintenance',
    value: '12',
    note: 'Next: Server Rack #4 (2h)',
    noteClass: 'text-on-surface-variant',
    noteIcon: '',
  },
  {
    icon: 'check_circle',
    iconBg: 'bg-primary-fixed text-on-primary-fixed',
    label: 'Completed This Month',
    value: '45',
    note: '15% vs last month',
    noteClass: 'text-primary',
    noteIcon: 'keyboard_double_arrow_up',
  },
];

export default function MaintenanceSummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
      {cards.map((c) => (
        <div key={c.label} className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl flex items-center gap-lg shadow-sm">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
            <span className="material-symbols-outlined text-[32px]">{c.icon}</span>
          </div>
          <div>
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider">{c.label}</p>
            <h3 className="text-display font-bold text-on-surface">{c.value}</h3>
            <p className={`text-body-sm font-medium flex items-center gap-xs ${c.noteClass}`}>
              {c.noteIcon && <span className="material-symbols-outlined text-[16px]">{c.noteIcon}</span>}
              {c.note}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
