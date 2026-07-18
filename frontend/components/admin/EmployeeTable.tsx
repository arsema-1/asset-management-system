'use client';

import { useEffect, useState } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { employees as employeesApi, assignments as assignmentsApi, type User, type Assignment } from '@/lib/api';

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

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

interface Props {
  search?: string;
  department?: string;
  status?: string;
}

export default function EmployeeTable({ search = '', department = '', status = '' }: Props) {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [employeeAssignments, setEmployeeAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  useEffect(() => {
    employeesApi.list()
      .then(setEmployees)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      setLoadingAssignments(true);
      assignmentsApi.list({ user_id: selectedEmployee.id } as never)
        .then(setEmployeeAssignments)
        .catch(err => console.error(err))
        .finally(() => setLoadingAssignments(false));
    } else {
      setEmployeeAssignments([]);
    }
  }, [selectedEmployee]);

  // Client-side filtering
  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      emp.first_name.toLowerCase().includes(q) ||
      emp.last_name.toLowerCase().includes(q) ||
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      (emp.employee_id && emp.employee_id.toLowerCase().includes(q)) ||
      emp.id.toLowerCase().includes(q);

    const matchDept = !department || emp.department === department;
    const matchStatus = !status || emp.status?.toLowerCase() === status.toLowerCase();

    return matchSearch && matchDept && matchStatus;
  });

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
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-lg py-lg text-on-surface-variant">No employees found.</td></tr>
              )}
              {filtered.map((emp) => (
                <tr key={emp.id} onClick={() => setSelectedEmployee(emp)} className="hover:bg-surface transition-colors cursor-pointer">
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
                  <td className="px-lg py-4 text-right" onClick={e => e.stopPropagation()}>
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
          Showing <span className="font-semibold text-on-surface">{filtered.length}</span> employees
        </p>
      </div>

      {/* Slide-Drawer Details Panel */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex justify-end" onClick={() => setSelectedEmployee(null)}>
          <div className="bg-surface-container-lowest h-full w-full max-w-lg shadow-2xl overflow-y-auto p-xl flex flex-col gap-lg relative" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-outline-variant pb-md">
              <div className="flex items-center gap-md">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-title-md font-bold">
                  {initials(selectedEmployee)}
                </div>
                <div>
                  <h3 className="text-title-lg font-bold text-on-surface">
                    {selectedEmployee.first_name} {selectedEmployee.last_name}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant capitalize">{selectedEmployee.position ?? 'No Position Set'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="p-1 hover:bg-surface-container rounded-md text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Profile Information Grid */}
            <div className="space-y-md">
              <h4 className="text-label-md uppercase tracking-wider text-on-surface-variant font-bold">Employee Information</h4>
              <div className="grid grid-cols-2 gap-md bg-surface-container-low p-md rounded-xl border border-outline-variant">
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase font-medium">Employee ID</p>
                  <p className="text-body-sm font-semibold text-on-surface">{selectedEmployee.employee_id ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase font-medium">Status</p>
                  <div className="mt-0.5">
                    <StatusBadge status={selectedEmployee.status === 'active' ? 'available' : 'retired'} label={selectedEmployee.status ?? 'inactive'} dot />
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] text-on-surface-variant uppercase font-medium">Email Address</p>
                  <p className="text-body-sm font-semibold text-on-surface break-all">{selectedEmployee.email}</p>
                </div>
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase font-medium">Phone Number</p>
                  <p className="text-body-sm font-semibold text-on-surface">{selectedEmployee.phone ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase font-medium">Work Location</p>
                  <p className="text-body-sm font-semibold text-on-surface">{selectedEmployee.work_location ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase font-medium">Department</p>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${departmentStyles[selectedEmployee.department ?? ''] ?? 'bg-surface-container text-on-surface'}`}>
                      {selectedEmployee.department ?? '—'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] text-on-surface-variant uppercase font-medium">Joined Date</p>
                  <p className="text-body-sm font-semibold text-on-surface">{formatDate(selectedEmployee.joined_date)}</p>
                </div>
              </div>
            </div>

            {/* Assigned Assets Section */}
            <div className="space-y-md flex-1">
              <h4 className="text-label-md uppercase tracking-wider text-on-surface-variant font-bold">Assigned Assets</h4>
              {loadingAssignments ? (
                <p className="text-body-sm text-on-surface-variant">Loading assignments...</p>
              ) : employeeAssignments.length === 0 ? (
                <div className="p-lg border border-dashed border-outline-variant rounded-xl text-center">
                  <p className="text-body-sm text-on-surface-variant">No active assignments.</p>
                </div>
              ) : (
                <div className="space-y-sm">
                  {employeeAssignments.map(asg => (
                    <div key={asg.id} className="flex justify-between items-center p-md bg-surface-container-low border border-outline-variant rounded-xl">
                      <div>
                        <p className="text-body-sm font-bold text-on-surface">{asg.asset?.name ?? 'Unknown Asset'}</p>
                        <p className="text-[11px] text-on-surface-variant font-mono">Tag: {asg.asset?.asset_tag ?? '—'}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-sm py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold capitalize">
                          {asg.asset?.category ?? 'other'}
                        </span>
                        <p className="text-[9px] text-on-surface-variant mt-1">Assigned: {formatDate(asg.assigned_date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
