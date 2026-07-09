const actions = [
  {
    icon: 'add_box',
    bgColor: 'bg-primary',
    title: 'Add New Asset',
    desc: 'Register a new device to inventory',
  },
  {
    icon: 'assignment_ind',
    bgColor: 'bg-[#0ea5e9]',
    title: 'Assign Asset',
    desc: 'Allocate asset to a specific user',
  },
  {
    icon: 'description',
    bgColor: 'bg-[#8b5cf6]',
    title: 'Generate Report',
    desc: 'Export customized audit logs',
  },
];

export default function QuickActions() {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-md">
      <h3 className="text-title-lg font-bold mb-md">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-sm">
        {actions.map((action) => (
          <button
            key={action.title}
            className="w-full flex items-center gap-md p-md rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-outline-variant transition-all group active:scale-[0.98]"
          >
            <div className={`w-10 h-10 rounded-full ${action.bgColor} flex items-center justify-center text-white`}>
              <span className="material-symbols-outlined">{action.icon}</span>
            </div>
            <div className="text-left">
              <p className="text-body-md font-bold text-on-surface">{action.title}</p>
              <p className="text-label-sm text-on-surface-variant">{action.desc}</p>
            </div>
            <span className="material-symbols-outlined ml-auto text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
              chevron_right
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
