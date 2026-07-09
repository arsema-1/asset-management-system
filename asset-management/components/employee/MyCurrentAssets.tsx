const assets = [
  { name: 'MacBook Pro 14"', serial: 'LAP-M1-2023-AR01', badge: 'Primary', icon: 'laptop_mac' },
  { name: 'iPhone 15', serial: 'PHN-15-2023-AR92', badge: 'Mobile', icon: 'smartphone' },
];

export default function MyCurrentAssets() {
  return (
    <section>
      <div className="flex justify-between items-center mb-md">
        <h3 className="text-title-lg font-bold text-on-surface">My Current Assets</h3>
        <button className="text-primary font-bold text-label-md hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {assets.map((a) => (
          <div key={a.serial} className="bg-white border border-outline-variant rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-md transition-all duration-200">
            {/* Image placeholder */}
            <div className="h-40 bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[72px] text-outline-variant">{a.icon}</span>
            </div>
            <div className="p-md">
              <div className="flex justify-between items-start mb-xs">
                <h4 className="font-bold text-on-surface">{a.name}</h4>
                <span className="bg-secondary-container text-on-secondary-container px-xs py-[2px] rounded text-[10px] font-bold uppercase tracking-tighter">
                  {a.badge}
                </span>
              </div>
              <div className="text-body-sm text-on-surface-variant mb-md">Serial: {a.serial}</div>
              <div className="flex items-center gap-sm">
                <button className="flex-1 py-sm border border-outline-variant rounded-lg text-label-sm font-bold hover:bg-surface-container-low transition-colors">
                  Details
                </button>
                <button className="flex-1 py-sm border border-outline-variant rounded-lg text-label-sm font-bold text-error hover:bg-error-container transition-colors">
                  Return
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
