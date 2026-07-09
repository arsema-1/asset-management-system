const categories = [
  { label: 'Laptops', percent: 45, color: 'bg-primary' },
  { label: 'Mobile Devices', percent: 25, color: 'bg-[#0ea5e9]' },
  { label: 'Peripherals', percent: 15, color: 'bg-[#8b5cf6]' },
  { label: 'Infrastructure', percent: 15, color: 'bg-[#10b981]' },
];

export default function AssetDistribution() {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-md">
      <div className="flex justify-between items-center mb-md">
        <h3 className="text-title-lg font-bold">Asset Type Distribution</h3>
        <button className="material-symbols-outlined text-on-surface-variant">more_horiz</button>
      </div>
      <div className="flex flex-col gap-sm">
        {categories.map((cat) => (
          <div key={cat.label}>
            <div className="flex justify-between text-label-md mb-xs">
              <span className="text-on-surface">{cat.label}</span>
              <span className="font-bold">{cat.percent}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className={`h-full ${cat.color}`} style={{ width: `${cat.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
