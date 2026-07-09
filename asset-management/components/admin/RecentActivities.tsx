const activities = [
  {
    initials: 'JS',
    avatarClass: 'bg-primary-container text-on-primary-container',
    name: 'Jane Smith',
    dept: 'Engineering Dept.',
    action: 'Assigned',
    asset: 'Macbook Pro M3',
    id: 'AST-8842',
    date: 'Oct 24, 2024',
    time: '10:45 AM',
    status: 'Completed',
    statusClass: 'bg-[#d1fae5] text-[#065f46]',
  },
  {
    initials: 'MR',
    avatarClass: 'bg-secondary-container text-on-secondary-container',
    name: 'Mike Ross',
    dept: 'Legal Team',
    action: 'Reported',
    asset: 'Dell Monitor Flickering',
    id: 'AST-2219',
    date: 'Oct 24, 2024',
    time: '09:12 AM',
    status: 'In Review',
    statusClass: 'bg-[#fef3c7] text-[#92400e]',
  },
  {
    initials: 'AH',
    avatarClass: 'bg-error-container text-on-error-container',
    name: 'Alex Hunter',
    dept: 'Design Dept.',
    action: 'Returned',
    asset: 'iPad Pro 12.9"',
    id: 'AST-5541',
    date: 'Oct 23, 2024',
    time: '04:30 PM',
    status: 'Verified',
    statusClass: 'bg-[#d1fae5] text-[#065f46]',
  },
  {
    initials: 'BW',
    avatarClass: 'bg-surface-variant text-on-surface',
    name: 'Beth White',
    dept: 'Operations',
    action: 'Maintenance',
    asset: 'Server Rack 4A',
    id: 'SRV-001',
    date: 'Oct 23, 2024',
    time: '02:15 PM',
    status: 'Delayed',
    statusClass: 'bg-[#fee2e2] text-[#991b1b]',
  },
];

export default function RecentActivities() {
  return (
    <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
      <div className="p-md border-b border-outline-variant flex justify-between items-center">
        <h3 className="text-title-lg font-bold">Recent Activities</h3>
        <button className="text-label-md text-primary font-bold hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container text-label-sm uppercase text-on-surface-variant">
            <tr>
              <th className="px-md py-sm">User</th>
              <th className="px-md py-sm">Action</th>
              <th className="px-md py-sm">Date</th>
              <th className="px-md py-sm">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {activities.map((a) => (
              <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                <td className="px-md py-md">
                  <div className="flex items-center gap-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold ${a.avatarClass}`}>
                      {a.initials}
                    </div>
                    <div>
                      <p className="text-body-sm font-bold">{a.name}</p>
                      <p className="text-[11px] text-on-surface-variant">{a.dept}</p>
                    </div>
                  </div>
                </td>
                <td className="px-md py-md">
                  <p className="text-body-sm">
                    {a.action} <span className="font-bold">{a.asset}</span>
                  </p>
                  <p className="text-[11px] text-on-surface-variant">ID: {a.id}</p>
                </td>
                <td className="px-md py-md">
                  <p className="text-body-sm">{a.date}</p>
                  <p className="text-[11px] text-on-surface-variant">{a.time}</p>
                </td>
                <td className="px-md py-md">
                  <span className={`px-sm py-[2px] rounded-full text-label-sm font-bold ${a.statusClass}`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
