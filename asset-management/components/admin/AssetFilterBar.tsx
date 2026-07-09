'use client';

export default function AssetFilterBar() {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap items-end gap-md">
      {/* Quick Search */}
      <div className="flex-grow min-w-[240px]">
        <label className="text-label-sm text-on-surface-variant mb-1 block">Quick Search</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            className="w-full border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Filter by asset name or tag..."
            type="text"
          />
        </div>
      </div>

      {/* Category */}
      <div className="w-48">
        <label className="text-label-sm text-on-surface-variant mb-1 block">Category</label>
        <select className="w-full border border-outline-variant rounded-lg py-2 px-3 text-body-sm focus:border-primary outline-none bg-surface-container-lowest">
          <option>All Categories</option>
          <option>Laptop</option>
          <option>Monitor</option>
          <option>Mobile</option>
        </select>
      </div>

      {/* Status */}
      <div className="w-48">
        <label className="text-label-sm text-on-surface-variant mb-1 block">Status</label>
        <select className="w-full border border-outline-variant rounded-lg py-2 px-3 text-body-sm focus:border-primary outline-none bg-surface-container-lowest">
          <option>All Status</option>
          <option>Available</option>
          <option>Assigned</option>
          <option>In Repair</option>
        </select>
      </div>

      {/* More Filters */}
      <button className="border border-outline-variant hover:bg-surface-container text-on-surface-variant px-md py-2 rounded-lg text-body-sm flex items-center gap-xs transition-colors">
        <span className="material-symbols-outlined text-[18px]">filter_list</span>
        More Filters
      </button>
    </section>
  );
}
