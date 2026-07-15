'use client';

export default function EmployeeFilterBar() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md mb-lg flex flex-wrap items-center gap-md shadow-sm">
      {/* Search */}
      <div className="flex-1 min-w-[240px] relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
          search
        </span>
        <input
          className="w-full bg-white border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          placeholder="Search by name or email..."
          type="text"
        />
      </div>

      {/* Department */}
      <div className="flex items-center gap-sm">
        <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Department</label>
        <select className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-primary focus:border-primary outline-none">
          <option>All Departments</option>
          <option>Engineering</option>
          <option>HR</option>
          <option>Sales</option>
          <option>Design</option>
          <option>Marketing</option>
        </select>
      </div>

      {/* Status */}
      <div className="flex items-center gap-sm">
        <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Status</label>
        <select className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-primary focus:border-primary outline-none">
          <option>All Statuses</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>On Leave</option>
        </select>
      </div>

      {/* Advanced Filters */}
      <button className="flex items-center gap-sm px-4 py-2 border border-outline-variant rounded-lg text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors">
        <span className="material-symbols-outlined text-[20px]">filter_list</span>
        Advanced Filters
      </button>
    </div>
  );
}
