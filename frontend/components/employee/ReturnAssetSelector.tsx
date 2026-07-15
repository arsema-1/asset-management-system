'use client';

interface Asset {
  id: string;
  name: string;
  icon: string;
  assignedDate: string;
}

interface Props {
  assets: Asset[];
  selected: string[];
  onToggle: (id: string) => void;
}

export default function ReturnAssetSelector({ assets, selected, onToggle }: Props) {
  return (
    <div className="lg:col-span-7 space-y-md">
      <div className="flex items-center justify-between">
        <h2 className="text-headline-lg font-bold text-on-surface">Select Assets to Return</h2>
        <span className="text-label-md text-on-surface-variant">{assets.length} Assets Currently Assigned</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
        {assets.map((asset) => {
          const isSelected = selected.includes(asset.id);
          return (
            <div
              key={asset.id}
              onClick={() => onToggle(asset.id)}
              className={`cursor-pointer relative p-md bg-white border rounded-xl shadow-sm transition-all flex flex-col gap-sm ${
                isSelected
                  ? 'border-primary bg-surface-container-low ring-1 ring-primary'
                  : 'border-outline-variant hover:border-primary'
              }`}
            >
              {/* Check icon */}
              <div className={`absolute top-2 right-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>

              <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[28px]">{asset.icon}</span>
              </div>

              <div>
                <h3 className="text-title-lg font-bold text-on-surface">{asset.name}</h3>
                <p className="text-body-sm text-on-surface-variant">ID: {asset.id}</p>
              </div>

              <div className="mt-auto pt-sm flex items-center justify-between">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm status-assigned">
                  Assigned
                </span>
                <span className="text-label-sm text-on-surface-variant">{asset.assignedDate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty placeholder */}
      <div className="p-xl border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center text-center gap-sm bg-surface-container-low/50 opacity-60">
        <span className="material-symbols-outlined text-[40px] text-outline">devices_other</span>
        <p className="text-body-md text-on-surface-variant">
          No other peripherals detected.<br />Contact support if items are missing.
        </p>
      </div>
    </div>
  );
}
