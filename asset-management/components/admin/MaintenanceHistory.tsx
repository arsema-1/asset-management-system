const records = [
  {
    date: 'May 15, 2024',
    type: 'Repair',
    description: 'Battery optimization & diagnostic check',
    cost: '$0.00 (AppleCare)',
    status: 'Completed',
  },
  {
    date: 'Feb 20, 2024',
    type: 'Inspection',
    description: 'Initial setup and software hardening',
    cost: '$45.00',
    status: 'Completed',
  },
];

export default function MaintenanceHistory() {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div className="p-lg flex items-center justify-between">
        <h3 className="text-title-lg font-bold text-on-surface">Maintenance History</h3>
        <button className="flex items-center gap-xs text-primary text-label-md font-bold border border-primary px-3 py-1 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Record
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr>
              {['Date', 'Type', 'Description', 'Cost', 'Status'].map((h) => (
                <th key={h} className="px-lg py-3 text-label-sm text-on-surface-variant uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {records.map((r) => (
              <tr key={r.date} className="hover:bg-surface-container transition-colors">
                <td className="px-lg py-4 text-body-sm font-medium whitespace-nowrap">{r.date}</td>
                <td className="px-lg py-4 text-body-sm">{r.type}</td>
                <td className="px-lg py-4 text-body-sm">{r.description}</td>
                <td className="px-lg py-4 text-body-sm text-right whitespace-nowrap">{r.cost}</td>
                <td className="px-lg py-4">
                  <span className="bg-[#d1fae5] text-[#065f46] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
