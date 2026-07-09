const events = [
  {
    icon: 'build',
    bgClass: 'bg-primary-container',
    iconClass: 'text-primary',
    title: 'Maintenance completed',
    time: 'May 15, 2024 at 10:45 AM',
    note: '"Standard battery optimization completed by IT support."',
    italic: true,
  },
  {
    icon: 'assignment_turned_in',
    bgClass: 'bg-secondary-container',
    iconClass: 'text-secondary',
    title: 'Audit verified',
    time: 'Mar 12, 2024 at 2:30 PM',
    note: 'Confirmed by Sarah Jenkins at Floor 4 desk.',
    italic: false,
  },
  {
    icon: 'login',
    bgClass: 'bg-tertiary-fixed',
    iconClass: 'text-tertiary',
    title: 'Asset Assigned',
    time: 'Jan 15, 2024 at 9:00 AM',
    note: 'Assigned to Sarah Jenkins for "Product Launch" project.',
    italic: false,
  },
];

export default function ActivityTimeline() {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
      <h3 className="text-title-lg font-bold text-on-surface mb-lg">Recent Activity</h3>

      <div className="relative space-y-lg before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
        {events.map((e) => (
          <div key={e.title} className="relative pl-xl">
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${e.bgClass} flex items-center justify-center ring-4 ring-surface-container-lowest`}>
              <span className={`material-symbols-outlined text-[14px] ${e.iconClass}`}>{e.icon}</span>
            </div>
            <p className="text-body-sm font-bold text-on-surface">{e.title}</p>
            <p className="text-[11px] text-on-surface-variant">{e.time}</p>
            <p className={`text-body-sm text-on-surface-variant mt-1 ${e.italic ? 'italic' : ''}`}>
              {e.note}
            </p>
          </div>
        ))}
      </div>

      <button className="w-full mt-lg text-label-md font-semibold text-primary hover:underline flex items-center justify-center gap-1">
        Show all history
        <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
      </button>
    </section>
  );
}
