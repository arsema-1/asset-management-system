const activities = [
  {
    icon: 'check_circle',
    iconBg: 'bg-secondary-container',
    iconColor: 'text-on-secondary-container',
    title: 'Request for Monitor approved',
    time: '2h ago',
    desc: 'Your request for a 27" Dell UltraSharp has been approved by IT.',
  },
  {
    icon: 'assignment_ind',
    iconBg: 'bg-primary-container',
    iconColor: 'text-on-primary-container',
    title: 'Laptop assigned',
    time: '3 days ago',
    desc: 'MacBook Pro 14" (LAP-M1-2023-AR01) was officially assigned to you.',
  },
  {
    icon: 'history',
    iconBg: 'bg-surface-container-high',
    iconColor: 'text-on-surface-variant',
    title: 'Returned Magic Mouse',
    time: '1 week ago',
    desc: 'Item was successfully received and inspected by the warehouse team.',
  },
];

export default function ActivityFeed() {
  return (
    <section>
      <h3 className="text-title-lg font-bold text-on-surface mb-md">Recent Activities</h3>
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="divide-y divide-outline-variant">
          {activities.map((a) => (
            <div key={a.title} className="p-md flex items-start gap-md hover:bg-surface-container-low transition-colors">
              <div className={`w-10 h-10 rounded-full ${a.iconBg} flex items-center justify-center flex-shrink-0`}>
                <span className={`material-symbols-outlined ${a.iconColor}`}>{a.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-md">
                  <p className="font-bold text-body-md text-on-surface">{a.title}</p>
                  <span className="text-label-sm text-on-surface-variant whitespace-nowrap">{a.time}</span>
                </div>
                <p className="text-body-sm text-on-surface-variant">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full py-md text-center text-label-md font-bold text-primary hover:bg-surface-container-high transition-colors">
          View All Activity
        </button>
      </div>
    </section>
  );
}
