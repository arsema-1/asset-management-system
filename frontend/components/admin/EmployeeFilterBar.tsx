'use client';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  department: string;
  onDepartment: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
}

export default function EmployeeFilterBar({
  search,
  onSearch,
  department,
  onDepartment,
  status,
  onStatus,
}: Props) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap items-center gap-md shadow-sm">
      {/* Search */}
      <div className="flex-1 min-w-[240px] relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
          search
        </span>
        <input
          className="w-full bg-white border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          placeholder="Search by name, email, or ID..."
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      {/* Department */}
      <div className="flex items-center gap-sm">
        <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Department</label>
        <select
          value={department}
          onChange={e => onDepartment(e.target.value)}
          className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-primary focus:border-primary outline-none bg-surface-container-lowest"
        >
          <option value="">All Departments</option>
          {['Engineering', 'HR', 'Finance', 'Operations', 'Marketing', 'Sales', 'Design', 'IT'].map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="flex items-center gap-sm">
        <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Status</label>
        <select
          value={status}
          onChange={e => onStatus(e.target.value)}
          className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-primary focus:border-primary outline-none bg-surface-container-lowest"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>

      {/* Clear Button */}
      {(search || department || status) && (
        <button
          onClick={() => {
            onSearch('');
            onDepartment('');
            onStatus('');
          }}
          className="border border-outline-variant hover:bg-surface-container text-on-surface-variant px-md py-2 rounded-lg text-body-sm flex items-center gap-xs transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          Clear
        </button>
      )}
    </div>
  );
}
