'use client';

import { useEffect, useState } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { employees as employeesApi, type User } from '@/lib/api';

const departmentStyles: Record<string, string> = {
  Engineering: 'bg-[#d0e1fb] text-[#0b1c30]',
  HR: 'bg-[#ffdbcd] text-[#360f00]',
  Sales: 'bg-surface-container-highest text-on-surface-variant',
  Design: 'bg-[#d1fae5] text-[#065f46]',
  Marketing: 'bg-[#ede9fe] text-[#4c1d95]',
};

function initials(user: User) {
  return `${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`.toUpperCase();
}

export default function EmployeeTable() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    employeesApi.list()
      .then(setEmployees)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        {loading && <p className="p-lg text-on-surface-variant">Loading...</p>}
        {error && <p className="p-lg text-error">{error}</p>}
        {!loading && !error && (
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f1f5f9]">
              <tr>
                {['Employee Name', 'Email', 'Department', 'Position', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-lg py-3 text-label-sm text-on-surface-variant uppercase ${i === 5 ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {employees.length === 0 && (
                <tr><td colSpan={6} className="px-lg py-lg text-on-surface-variant">No employees found.</td></tr>
              )}
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-surface transition-colors">
                  <td className="px-lg py-4">
                    <div className="flex items-center gap-md">
                      <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-label-sm font-bold flex-shrink-0">
                        {initials(emp)}
                      </div>
                      <div>
                        <p className="text-body-sm font-semibold text-on-surface">{emp.first_name} {emp.last_name}</p>
                        <p className="text-[11px] text-on-surface-variant">ID: {emp.employee_id ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-4 text-body-sm text-on-surface-variant">{emp.email}</td>
                  <td className="px-lg py-4">
                    <span className={`px-2 py-1 rounded text-label-sm font-bold ${departmentStyles[emp.department ?? ''] ?? 'bg-surface-container text-on-surface'}`}>
                      {emp.department ?? '—'}
                    </span>
                  </td>
                  <td className="px-lg py-4 text-body-sm text-on-surface-variant">{emp.position ?? '—'}</td>
                  <td className="px-lg py-4">
                    <StatusBadge status={emp.status === 'active' ? 'available' : 'retired'} label={emp.status ?? 'inactive'} dot />
                  </td>
                  <td className="px-lg py-4 text-right">
                    <button className="p-1 hover:bg-surface-container rounded-md text-on-surface-variant transition-colors">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="px-lg py-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
        <p className="text-body-sm text-on-surface-variant">
          Showing <span className="font-semibold text-on-surface">{employees.length}</span> employees
        </p>
      </div>
    </div>
  );
}
