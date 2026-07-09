const statusStyles: Record<string, string> = {
  Completed: 'bg-[#d1fae5] text-[#065f46]',
  'In Progress': 'bg-[#fef3c7] text-[#92400e]',
  Pending: 'bg-[#fee2e2] text-[#991b1b]',
};

interface MaintenanceLog {
  assetName: string;
  assetId: string;
  assetIcon: string;
  iconColor: string;
  issueType: string;
  technician: string;
  technicianInitials: string;
  cost: string;
  date: string;
  status: 'Completed' | 'In Progress' | 'Pending';
}

const logs: MaintenanceLog[] = [
  { assetName: 'MacBook Pro #1042', assetId: 'AST-MB-990', assetIcon: 'laptop_mac', iconColor: 'text-primary', issueType: 'Hardware Repair', technician: 'James Wilson', technicianInitials: 'JW', cost: '$245.00', date: 'Oct 24, 2024', status: 'Completed' },
  { assetName: 'Production Server S1', assetId: 'AST-SRV-001', assetIcon: 'dns', iconColor: 'text-tertiary', issueType: 'Software Update', technician: 'Elena Rodriguez', technicianInitials: 'ER', cost: '$0.00', date: 'Oct 26, 2024', status: 'In Progress' },
  { assetName: 'Office Printer HP-X', assetId: 'AST-PRN-542', assetIcon: 'print', iconColor: 'text-secondary', issueType: 'Hardware Repair', technician: 'Marcus Chen', technicianInitials: 'MC', cost: '$112.50', date: 'Oct 27, 2024', status: 'Pending' },
  { assetName: 'Network Switch L3', assetId: 'AST-NET-882', assetIcon: 'router', iconColor: 'text-primary', issueType: 'Routine Check', technician: 'David Miller', technicianInitials: 'DM', cost: '$55.00', date: 'Oct 28, 2024', status: 'Completed' },
  { assetName: 'Display Panel 4K-02', assetId: 'AST-DSP-311', assetIcon: 'monitor', iconColor: 'text-tertiary', issueType: 'Hardware Repair', technician: 'Sarah Jenkins', technicianInitials: 'SJ', cost: '$180.00', date: 'Oct 29, 2024', status: 'Pending' },
];

export default function MaintenanceTable() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
      {/* Table Controls */}
      <div className="px-lg py-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
        <div className="flex items-center gap-md">
          <button className="flex items-center gap-sm px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filters
          </button>
          <button className="flex items-center gap-sm px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export
          </button>
        </div>
        <span className="text-label-sm text-on-surface-variant">Showing 1–10 of 124 records</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant tracking-wider">Asset</th>
              <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant tracking-wider">Issue Type</th>
              <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant tracking-wider">Technician</th>
              <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant tracking-wider">Cost</th>
              <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant tracking-wider text-right">Date</th>
              <th className="px-lg py-md text-label-sm uppercase text-on-surface-variant tracking-wider text-center">Status</th>
              <th className="px-lg py-md w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {logs.map((log) => (
              <tr key={log.assetId} className="hover:bg-surface-container-low transition-colors group">
                {/* Asset */}
                <td className="px-lg py-md">
                  <div className="flex items-center gap-md">
                    <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center flex-shrink-0">
                      <span className={`material-symbols-outlined text-[20px] ${log.iconColor}`}>{log.assetIcon}</span>
                    </div>
                    <div>
                      <p className="text-body-sm font-bold text-on-surface">{log.assetName}</p>
                      <p className="text-label-sm text-on-surface-variant">ID: {log.assetId}</p>
                    </div>
                  </div>
                </td>

                {/* Issue Type */}
                <td className="px-lg py-md">
                  <span className="text-body-sm text-on-surface-variant bg-surface-container px-sm py-xs rounded">
                    {log.issueType}
                  </span>
                </td>

                {/* Technician */}
                <td className="px-lg py-md">
                  <div className="flex items-center gap-sm">
                    <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {log.technicianInitials}
                    </div>
                    <span className="text-body-sm">{log.technician}</span>
                  </div>
                </td>

                {/* Cost */}
                <td className="px-lg py-md text-body-sm font-bold text-on-surface">{log.cost}</td>

                {/* Date */}
                <td className="px-lg py-md text-body-sm text-on-surface-variant text-right whitespace-nowrap">{log.date}</td>

                {/* Status */}
                <td className="px-lg py-md">
                  <div className="flex justify-center">
                    <span className={`text-label-sm px-md py-xs rounded-full font-bold ${statusStyles[log.status]}`}>
                      {log.status}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-lg py-md text-right">
                  <button className="text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t border-outline-variant px-lg py-md flex items-center justify-between bg-surface-container-low">
        <button disabled className="px-md py-sm border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-colors disabled:opacity-50">
          Previous
        </button>
        <div className="flex items-center gap-sm">
          {[1, 2, 3].map((p) => (
            <span key={p} className={`w-8 h-8 flex items-center justify-center rounded text-label-md cursor-pointer ${p === 1 ? 'bg-primary text-on-primary' : 'hover:bg-surface-container'}`}>
              {p}
            </span>
          ))}
          <span className="text-on-surface-variant">...</span>
          <span className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container text-label-md cursor-pointer">13</span>
        </div>
        <button className="px-md py-sm border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-colors">
          Next
        </button>
      </div>
    </div>
  );
}
