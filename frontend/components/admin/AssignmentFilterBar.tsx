'use client';

interface Props {
  status: string;
  onStatusChange: (v: string) => void;
}

export default function AssignmentFilterBar({ status, onStatusChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-md mb-lg p-md bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm">
      {/* Status */}
      <div className="flex flex-col gap-xs">
        <label className="text-label-sm text-on-surface-variant font-medium">Filter by Status</label>
        <select 
          value={status}
          onChange={e => onStatusChange(e.target.value)}
          className="bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-md focus:ring-1 focus:ring-primary outline-none"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="overdue">Overdue</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {/* Info Cards */}
      <div className="md:col-span-2 flex items-center gap-md">
        <div className="flex items-center gap-sm bg-surface-container px-md py-sm rounded-lg flex-1">
          <span className="material-symbols-outlined text-[#0ea5e9]">person_check</span>
          <div>
            <p className="text-label-xs text-on-surface-variant">Active</p>
            <p className="text-body-md font-bold text-on-surface">Track ongoing</p>
          </div>
        </div>
        <div className="flex items-center gap-sm bg-surface-container px-md py-sm rounded-lg flex-1">
          <span className="material-symbols-outlined text-[#22c55e]">check_circle</span>
          <div>
            <p className="text-label-xs text-on-surface-variant">Returned</p>
            <p className="text-body-md font-bold text-on-surface">Completed</p>
          </div>
        </div>
      </div>

      {/* Clear */}
      {status && (
        <div className="flex items-end">
          <button 
            onClick={() => onStatusChange('')}
            className="w-full px-lg py-sm border border-outline-variant hover:bg-surface-container text-on-surface-variant font-medium text-label-md rounded-lg transition-colors flex items-center justify-center gap-xs"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
}
