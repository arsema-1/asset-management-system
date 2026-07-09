import Link from 'next/link';

const statusStyles: Record<string, string> = {
  Available: 'bg-[#d1fae5] text-[#065f46]',
  Assigned: 'bg-[#d3e4fe] text-[#0b1c30]',
  'In Repair': 'bg-[#ffdad6] text-[#93000a]',
};

const categoryIcons: Record<string, string> = {
  Laptop: 'laptop_mac',
  Monitor: 'monitor',
  Mobile: 'smartphone',
};

interface Asset {
  name: string;
  tag: string;
  category: string;
  status: 'Available' | 'Assigned' | 'In Repair';
  assignedTo?: { name: string; initials: string };
}

const assets: Asset[] = [
  { name: 'MacBook Pro 16" M3', tag: 'AST-2024-001', category: 'Laptop', status: 'Available' },
  { name: 'Dell UltraSharp 32" 4K', tag: 'AST-2024-045', category: 'Monitor', status: 'Assigned', assignedTo: { name: 'Sarah Jenkins', initials: 'SJ' } },
  { name: 'iPhone 15 Pro Max 256GB', tag: 'AST-2024-112', category: 'Mobile', status: 'In Repair' },
  { name: 'ThinkPad X1 Carbon Gen 11', tag: 'AST-2024-009', category: 'Laptop', status: 'Assigned', assignedTo: { name: 'Michael Chen', initials: 'MC' } },
  { name: 'Samsung Odyssey G9', tag: 'AST-2024-077', category: 'Monitor', status: 'Available' },
  { name: 'Google Pixel 8 Pro', tag: 'AST-2024-156', category: 'Mobile', status: 'Assigned', assignedTo: { name: 'David Miller', initials: 'DM' } },
  { name: 'Dell Latitude 7440', tag: 'AST-2024-032', category: 'Laptop', status: 'Available' },
  { name: 'iPad Air M2 11"', tag: 'AST-2024-210', category: 'Mobile', status: 'Assigned', assignedTo: { name: 'Emily Wong', initials: 'EW' } },
];

export default function AssetTable() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant">Asset Name</th>
              <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant">Asset Tag</th>
              <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant">Category</th>
              <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant text-center">Status</th>
              <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant">Assigned To</th>
              <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {assets.map((asset) => (
              <tr key={asset.tag} className="hover:bg-background transition-colors group cursor-pointer">
                {/* Name */}
                <td className="px-lg py-md">
                  <Link href={`/admin/assets/${asset.tag}`} className="flex items-center gap-sm">
                    <div className="p-xs bg-secondary-container text-on-secondary-container rounded">
                      <span className="material-symbols-outlined text-[18px]">
                        {categoryIcons[asset.category] ?? 'devices'}
                      </span>
                    </div>
                    <span className="text-body-sm font-medium hover:text-primary transition-colors">{asset.name}</span>
                  </Link>
                </td>

                {/* Tag */}
                <td className="px-lg py-md text-body-sm text-on-surface-variant">{asset.tag}</td>

                {/* Category */}
                <td className="px-lg py-md text-body-sm">{asset.category}</td>

                {/* Status */}
                <td className="px-lg py-md text-center">
                  <span className={`px-sm py-[2px] text-label-sm rounded-full font-bold ${statusStyles[asset.status]}`}>
                    {asset.status}
                  </span>
                </td>

                {/* Assigned To */}
                <td className="px-lg py-md">
                  {asset.assignedTo ? (
                    <div className="flex items-center gap-sm">
                      <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold">
                        {asset.assignedTo.initials}
                      </div>
                      <span className="text-body-sm">{asset.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span className="text-body-sm text-on-surface-variant">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-lg py-md text-right">
                  <div className="flex items-center justify-end gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/assets/${asset.tag}`}>
                      <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[20px]">
                        visibility
                      </span>
                    </Link>
                    <Link href={`/admin/assets/${asset.tag}`}>
                      <span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-[20px]">
                        edit
                      </span>
                    </Link>
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors text-[20px]">
                      delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-lg py-md border-t border-outline-variant flex items-center justify-between">
        <p className="text-label-sm text-on-surface-variant">Showing 1–8 of 124 assets</p>
        <div className="flex items-center gap-xs">
          <button
            disabled
            className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              className={`w-8 h-8 flex items-center justify-center rounded text-label-sm border ${
                p === 1
                  ? 'bg-primary text-on-primary border-primary'
                  : 'border-outline-variant hover:bg-surface-container'
              }`}
            >
              {p}
            </button>
          ))}
          <span className="text-label-sm px-xs text-on-surface-variant">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-container text-label-sm">
            16
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
