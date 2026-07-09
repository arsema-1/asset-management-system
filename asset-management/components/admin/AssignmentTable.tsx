const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-[#d1fae5] text-[#065f46]',
  OVERDUE: 'bg-[#fee2e2] text-[#991b1b]',
  RETURNED: 'bg-[#f1f5f9] text-[#475569]',
};

interface Assignment {
  assetName: string;
  assetTag: string;
  assetIcon: string;
  employee: string;
  employeeInitials: string;
  assignedDate: string;
  expectedReturn: string;
  status: 'ACTIVE' | 'OVERDUE' | 'RETURNED';
}

const assignments: Assignment[] = [
  { assetName: 'MacBook Pro 16" M3', assetTag: 'TAG-2024-001', assetIcon: 'laptop_mac', employee: 'Alex Rivera', employeeInitials: 'AR', assignedDate: 'Oct 12, 2023', expectedReturn: 'Oct 12, 2025', status: 'ACTIVE' },
  { assetName: 'iPhone 15 Pro Max', assetTag: 'TAG-2024-042', assetIcon: 'smartphone', employee: 'Sarah Jenkins', employeeInitials: 'SJ', assignedDate: 'Jan 05, 2024', expectedReturn: 'Jan 05, 2024', status: 'OVERDUE' },
  { assetName: 'Sony Alpha A7 IV', assetTag: 'TAG-2023-118', assetIcon: 'camera', employee: 'Marcus Low', employeeInitials: 'ML', assignedDate: 'Feb 20, 2024', expectedReturn: 'Feb 27, 2024', status: 'RETURNED' },
  { assetName: 'Herman Miller Aeron', assetTag: 'TAG-2022-890', assetIcon: 'desk', employee: 'Robert Dawson', employeeInitials: 'RD', assignedDate: 'Mar 15, 2024', expectedReturn: 'N/A', status: 'ACTIVE' },
];

export default function AssignmentTable() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-label-sm text-on-surface-variant border-b border-outline-variant">
              {['Asset', 'Employee', 'Assigned Date', 'Expected Return', 'Status', 'Actions'].map((h, i) => (
                <th key={h} className={`px-lg py-md font-semibold uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {assignments.map((a) => (
              <tr key={a.assetTag} className="hover:bg-surface-container transition-colors group">
                {/* Asset */}
                <td className="px-lg py-md">
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant flex-shrink-0">
                      <span className="material-symbols-outlined">{a.assetIcon}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-body-md font-semibold text-on-surface">{a.assetName}</span>
                      <span className="text-label-sm text-on-surface-variant">{a.assetTag}</span>
                    </div>
                  </div>
                </td>

                {/* Employee */}
                <td className="px-lg py-md">
                  <div className="flex items-center gap-sm">
                    <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                      {a.employeeInitials}
                    </div>
                    <span className="text-body-sm font-medium text-on-surface">{a.employee}</span>
                  </div>
                </td>

                {/* Assigned Date */}
                <td className="px-lg py-md text-body-sm text-on-surface">{a.assignedDate}</td>

                {/* Expected Return */}
                <td className="px-lg py-md text-body-sm text-on-surface">{a.expectedReturn}</td>

                {/* Status */}
                <td className="px-lg py-md">
                  <span className={`px-sm py-xs rounded-full text-[11px] font-bold ${statusStyles[a.status]}`}>
                    {a.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-lg py-md text-right">
                  <button className="p-base hover:bg-surface-container-highest rounded text-on-surface-variant transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-lg py-md flex items-center justify-between border-t border-outline-variant bg-surface-container-low">
        <span className="text-body-sm text-on-surface-variant">Showing 1 to 4 of 124 assignments</span>
        <div className="flex gap-xs">
          <button disabled className="p-xs rounded border border-outline-variant text-on-surface-variant disabled:opacity-40">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {[1, 2, 3].map((p) => (
            <button key={p} className={`px-sm py-xs rounded text-label-sm ${p === 1 ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>
              {p}
            </button>
          ))}
          <button className="p-xs rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
