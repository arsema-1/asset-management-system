'use client';

export default function AssignmentFilterBar() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg p-md bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
      {/* Status */}
      <div className="flex flex-col gap-xs">
        <label className="text-label-sm text-on-surface-variant">Status</label>
        <select className="bg-surface-container border border-outline-variant rounded px-sm py-xs text-body-sm focus:ring-primary outline-none">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Overdue</option>
          <option>Returned</option>
        </select>
      </div>

      {/* Date Range */}
      <div className="flex flex-col gap-xs">
        <label className="text-label-sm text-on-surface-variant">Date Range</label>
        <div className="flex items-center gap-xs">
          <input className="bg-surface-container border border-outline-variant rounded px-sm py-xs text-body-sm flex-1 outline-none" type="date" />
          <span className="text-on-surface-variant text-body-sm">to</span>
          <input className="bg-surface-container border border-outline-variant rounded px-sm py-xs text-body-sm flex-1 outline-none" type="date" />
        </div>
      </div>

      {/* Asset Category */}
      <div className="flex flex-col gap-xs">
        <label className="text-label-sm text-on-surface-variant">Asset Category</label>
        <select className="bg-surface-container border border-outline-variant rounded px-sm py-xs text-body-sm outline-none">
          <option>All Categories</option>
          <option>Laptops</option>
          <option>Mobile Devices</option>
          <option>Equipment</option>
        </select>
      </div>

      {/* Clear */}
      <div className="flex items-end">
        <button className="w-full px-lg py-xs border border-primary text-primary font-bold text-label-md rounded hover:bg-primary-container transition-colors">
          Clear Filters
        </button>
      </div>
    </div>
  );
}
