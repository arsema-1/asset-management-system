interface StatCardProps {
  label: string;
  value: string;
  note: string;
  icon: string;
  iconColor: string;
  trend?: string;
  trendColor?: string;
}

export default function StatCard({ label, value, note, icon, iconColor, trend, trendColor }: StatCardProps) {
  return (
    <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-sm">
        <span className="text-label-md text-on-surface-variant">{label}</span>
        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      </div>
      <div className="text-headline-lg font-bold text-on-surface">{value}</div>
      <div className={`mt-sm flex items-center gap-xs text-label-sm ${trendColor ?? 'text-on-surface-variant'}`}>
        {trend && <span className="material-symbols-outlined text-[16px]">{trend}</span>}
        <span>{note}</span>
      </div>
    </div>
  );
}
