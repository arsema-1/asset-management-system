import MyAssetCard from '@/components/employee/MyAssetCard';
import RecentActivityPanel from '@/components/employee/RecentActivityPanel';

const assets = [
  {
    name: 'MacBook Pro 16"',
    tag: 'AP-LPT-2024-082',
    icon: 'laptop_mac',
    assignedDate: 'Jan 12, 2024',
    condition: 'Excellent',
    conditionClass: 'text-[#065f46] bg-[#d1fae5]',
    status: 'Assigned',
    statusClass: 'bg-secondary-fixed text-on-secondary-fixed',
    statusDotClass: 'bg-primary animate-pulse',
  },
  {
    name: 'iPhone 15 Pro Max',
    tag: 'AP-MOB-2023-441',
    icon: 'smartphone',
    assignedDate: 'Sep 24, 2023',
    condition: 'Pristine',
    conditionClass: 'text-[#065f46] bg-[#d1fae5]',
    status: 'Assigned',
    statusClass: 'bg-secondary-fixed text-on-secondary-fixed',
    statusDotClass: 'bg-primary',
  },
  {
    name: 'Dell UltraSharp 32"',
    tag: 'AP-MON-2022-119',
    icon: 'desktop_windows',
    assignedDate: 'Mar 05, 2022',
    condition: 'Good',
    conditionClass: 'text-secondary bg-secondary-container',
    status: 'Pending Return',
    statusClass: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
    statusDotClass: 'bg-tertiary animate-pulse',
    pendingReturn: true,
  },
];

export default function EmployeeAssetsPage() {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-end mb-xl">
        <div>
          <nav className="flex items-center gap-xs text-on-surface-variant text-label-sm mb-xs">
            <span>Organization</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Inventory</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-bold">My Assets</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">My Assigned Assets</h2>
        </div>
        <div className="flex items-center bg-white border border-outline-variant rounded-xl p-1 shadow-sm gap-1">
          <button className="p-2 bg-surface-container-high rounded-lg text-primary">
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors">
            <span className="material-symbols-outlined">list</span>
          </button>
        </div>
      </div>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {assets.map((asset) => (
          <MyAssetCard key={asset.tag} {...asset} />
        ))}
      </div>

      {/* Bottom Section */}
      <div className="mt-xl grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Browse Catalog CTA */}
        <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-lg border border-dashed border-outline-variant flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-md">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant">add_shopping_cart</span>
          </div>
          <h3 className="text-headline-md font-bold text-on-surface mb-xs">Need more equipment?</h3>
          <p className="text-body-md text-on-surface-variant max-w-md mb-lg">
            Browse our catalog to request new software licenses, hardware upgrades, or ergonomic office furniture.
          </p>
          <button className="bg-primary text-on-primary py-md px-xl rounded-xl font-bold active:scale-95 transition-transform hover:opacity-90">
            Browse Catalog
          </button>
        </div>

        <RecentActivityPanel />
      </div>
    </>
  );
}
