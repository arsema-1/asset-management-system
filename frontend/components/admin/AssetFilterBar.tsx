'use client';

interface Props {
  search: string;
  category: string;
  status: string;
  onSearch: (v: string) => void;
  onCategory: (v: string) => void;
  onStatus: (v: string) => void;
}

export default function AssetFilterBar({ search, category, status, onSearch, onCategory, onStatus }: Props) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap items-end gap-md">
      <div className="flex-grow min-w-[240px]">
        <label className="text-label-sm text-on-surface-variant mb-1 block">Quick Search</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="w-full border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Filter by asset name or tag..."
            type="text"
          />
        </div>
      </div>

      <div className="w-44">
        <label className="text-label-sm text-on-surface-variant mb-1 block">Category</label>
        <select value={category} onChange={e => onCategory(e.target.value)}
          className="w-full border border-outline-variant rounded-lg py-2 px-3 text-body-sm focus:border-primary outline-none bg-surface-container-lowest">
          <option value="">All Categories</option>
          {['laptop','monitor','mobile','peripheral','infrastructure','furniture','other'].map(c => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="w-44">
        <label className="text-label-sm text-on-surface-variant mb-1 block">Status</label>
        <select value={status} onChange={e => onStatus(e.target.value)}
          className="w-full border border-outline-variant rounded-lg py-2 px-3 text-body-sm focus:border-primary outline-none bg-surface-container-lowest">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="in_repair">In Repair</option>
          <option value="disposed">Disposed</option>
          <option value="pending_return">Pending Return</option>
        </select>
      </div>

      {(search || category || status) && (
        <button onClick={() => { onSearch(''); onCategory(''); onStatus(''); }}
          className="border border-outline-variant hover:bg-surface-container text-on-surface-variant px-md py-2 rounded-lg text-body-sm flex items-center gap-xs transition-colors">
          <span className="material-symbols-outlined text-[18px]">close</span>
          Clear
        </button>
      )}
    </section>
  );
}
