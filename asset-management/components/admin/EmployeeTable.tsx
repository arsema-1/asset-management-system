const departmentStyles: Record<string, string> = {
  Engineering: 'bg-[#d0e1fb] text-[#0b1c30]',
  HR: 'bg-[#ffdbcd] text-[#360f00]',
  Sales: 'bg-surface-container-highest text-on-surface-variant',
  Design: 'bg-[#d1fae5] text-[#065f46]',
  Marketing: 'bg-[#ede9fe] text-[#4c1d95]',
};

const statusStyles: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  'On Leave': 'bg-amber-100 text-amber-800',
  Inactive: 'bg-red-100 text-red-800',
};

const statusDotStyles: Record<string, string> = {
  Active: 'bg-green-600',
  'On Leave': 'bg-amber-600',
  Inactive: 'bg-red-600',
};

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  activeAssets: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  initials: string;
}

const employees: Employee[] = [
  { id: 'EMP-8821', name: 'Jordan Henderson', email: 'j.henderson@assetpro.io', department: 'Engineering', position: 'Senior DevOps', activeAssets: 4, status: 'Active', initials: 'JH' },
  { id: 'EMP-4456', name: 'Elena Rodriguez', email: 'e.rodriguez@assetpro.io', department: 'HR', position: 'Talent Acquisition', activeAssets: 2, status: 'Active', initials: 'ER' },
  { id: 'EMP-1290', name: 'Marcus Thorne', email: 'm.thorne@assetpro.io', department: 'Sales', position: 'Account Director', activeAssets: 3, status: 'On Leave', initials: 'MT' },
  { id: 'EMP-9902', name: 'Sarah Jenkins', email: 's.jenkins@assetpro.io', department: 'Engineering', position: 'Lead Frontend', activeAssets: 5, status: 'Active', initials: 'SJ' },
];

export default function EmployeeTable() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#f1f5f9]">
            <tr>
              {['Employee Name', 'Email', 'Department', 'Position', 'Active Assets', 'Status', 'Actions'].map((h, i) => (
                <th
                  key={h}
                  className={`px-lg py-3 text-label-sm text-on-surface-variant uppercase ${i === 4 ? 'text-center' : i === 6 ? 'text-right' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-surface transition-colors">
                {/* Name */}
                <td className="px-lg py-4">
                  <div className="flex items-center gap-md">
                    <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-label-sm font-bold flex-shrink-0">
                      {emp.initials}
                    </div>
                    <div>
                      <p className="text-body-sm font-semibold text-on-surface">{emp.name}</p>
                      <p className="text-[11px] text-on-surface-variant">ID: {emp.id}</p>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="px-lg py-4 text-body-sm text-on-surface-variant">{emp.email}</td>

                {/* Department */}
                <td className="px-lg py-4">
                  <span className={`px-2 py-1 rounded text-label-sm font-bold ${departmentStyles[emp.department] ?? 'bg-surface-container text-on-surface'}`}>
                    {emp.department}
                  </span>
                </td>

                {/* Position */}
                <td className="px-lg py-4 text-body-sm text-on-surface-variant">{emp.position}</td>

                {/* Active Assets */}
                <td className="px-lg py-4 text-center">
                  <span className="text-body-sm font-medium text-primary">{emp.activeAssets}</span>
                </td>

                {/* Status */}
                <td className="px-lg py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusStyles[emp.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotStyles[emp.status]}`} />
                    {emp.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-lg py-4 text-right">
                  <button className="p-1 hover:bg-surface-container rounded-md text-on-surface-variant transition-colors">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-lg py-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
        <p className="text-body-sm text-on-surface-variant">
          Showing <span className="font-semibold text-on-surface">1</span> to{' '}
          <span className="font-semibold text-on-surface">4</span> of{' '}
          <span className="font-semibold text-on-surface">42</span> employees
        </p>
        <div className="flex items-center gap-2">
          <button disabled className="p-2 border border-outline-variant rounded-lg text-on-surface-variant disabled:opacity-40">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-body-sm font-medium ${
                  p === 1 ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface-variant'
                }`}
              >
                {p}
              </button>
            ))}
            <span className="px-2 text-outline">...</span>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant text-body-sm font-medium">
              11
            </button>
          </div>
          <button className="p-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
