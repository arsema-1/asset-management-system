'use client';

import { useState } from 'react';
import EmployeeFilterBar from '@/components/admin/EmployeeFilterBar';
import EmployeeTable from '@/components/admin/EmployeeTable';
import { users } from '@/lib/api';

export default function EmployeesPage() {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement)?.value;
    setSaving(true);
    setError('');
    try {
      await users.create({
        first_name: get('first_name'),
        last_name: get('last_name'),
        email: get('email'),
        password: get('password'),
        employee_id: get('employee_id') || undefined,
        department: get('department') || undefined,
        position: get('position') || undefined,
        role: 'employee',
      } as never);
      setShowModal(false);
      setRefreshKey(k => k + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <nav className="flex items-center gap-sm text-body-sm text-on-surface-variant mb-md">
        <a href="/admin/dashboard" className="hover:text-primary transition-colors">Dashboard</a>
        <span>/</span>
        <span className="text-on-surface font-medium">Employees</span>
      </nav>

      <div className="flex justify-between items-center mb-xl">
        <div>
          <h2 className="text-headline-lg font-bold text-on-surface">Employees</h2>
          <p className="text-body-sm text-on-surface-variant">Manage organization personnel and asset assignments.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-sm px-lg py-2.5 bg-primary text-on-primary rounded-lg font-medium text-body-sm hover:opacity-90 transition-all shadow-sm">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add Employee
        </button>
      </div>

      <EmployeeFilterBar
        search={search}
        onSearch={setSearch}
        department={department}
        onDepartment={setDepartment}
        status={status}
        onStatus={setStatus}
      />
      <EmployeeTable
        key={refreshKey}
        search={search}
        department={department}
        status={status}
      />

      {showModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-md" onClick={() => setShowModal(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-title-lg font-bold">Add Employee</h3>
              <button onClick={() => setShowModal(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleCreate} className="p-lg space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant">First Name</label>
                  <input name="first_name" required className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md" />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant">Last Name</label>
                  <input name="last_name" required className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md" />
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Work Email</label>
                <input name="email" type="email" required className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md" />
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Password</label>
                <input name="password" type="password" required minLength={8} className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md" />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant">Employee ID</label>
                  <input name="employee_id" placeholder="EMP-001" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md" />
                </div>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant">Department</label>
                  <select name="department" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md">
                    <option value="">Select...</option>
                    {['Engineering','HR','Finance','Operations','Marketing','Sales','Design','IT'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="text-label-md text-on-surface-variant">Position</label>
                <input name="position" placeholder="Software Engineer" className="w-full px-md py-sm border border-outline-variant rounded-lg outline-none focus:border-primary text-body-md" />
              </div>
              {error && <p className="text-error text-body-sm">{error}</p>}
              <div className="flex gap-md pt-sm">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-sm border border-outline-variant font-bold rounded-lg hover:bg-surface-container">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-sm bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 disabled:opacity-60">
                  {saving ? 'Creating...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
