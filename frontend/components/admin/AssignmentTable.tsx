'use client';

import { useEffect, useRef, useState } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { assignments as assignmentsApi, type Assignment } from '@/lib/api';

const statusLabelMap: Record<string, string> = { active: 'Active', overdue: 'Overdue', returned: 'Returned' };
const statusKeyMap: Record<string, string> = { active: 'assigned', overdue: 'maintenance', returned: 'retired' };
const statusOptions = ['active', 'overdue', 'returned'];

function formatDate(d?: string) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function AssignmentTable() {
  const [list, setList] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    assignmentsApi.list()
      .then(setList)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    setMenuOpen(null);
    try {
      const updated = await assignmentsApi.update(id, {
        status: status as never,
        ...(status === 'returned' ? { actual_return_date: new Date().toISOString().split('T')[0] } : {}),
      });
      setList(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        {loading && <p className="p-lg text-on-surface-variant">Loading...</p>}
        {error && <p className="p-lg text-error">{error}</p>}
        {!loading && !error && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-label-sm text-on-surface-variant border-b border-outline-variant">
                {['Asset', 'Employee', 'Assigned Date', 'Expected Return', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-lg py-md font-semibold uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {list.length === 0 && (
                <tr><td colSpan={6} className="px-lg py-lg text-on-surface-variant">No assignments found.</td></tr>
              )}
              {list.map((a) => {
                const userInitials = a.user
                  ? `${a.user.first_name[0]}${a.user.last_name[0]}`.toUpperCase()
                  : '??';
                const isUpdating = updating === a.id;

                return (
                  <tr key={a.id} className="hover:bg-surface-container transition-colors group">
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-md">
                        <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant flex-shrink-0">
                          <span className="material-symbols-outlined">devices</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-body-md font-semibold text-on-surface">{a.asset?.name ?? a.asset_id}</span>
                          <span className="text-label-sm text-on-surface-variant">{a.asset?.asset_tag ?? ''}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                          {userInitials}
                        </div>
                        <span className="text-body-sm font-medium text-on-surface">
                          {a.user ? `${a.user.first_name} ${a.user.last_name}` : a.user_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-lg py-md text-body-sm text-on-surface">{formatDate(a.assigned_date)}</td>
                    <td className="px-lg py-md text-body-sm text-on-surface">{formatDate(a.expected_return_date)}</td>
                    <td className="px-lg py-md">
                      {isUpdating
                        ? <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                        : <StatusBadge status={statusKeyMap[a.status] ?? 'retired'} label={statusLabelMap[a.status] ?? a.status} />
                      }
                    </td>
                    <td className="px-lg py-md text-right relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)}
                        disabled={isUpdating}
                        className="p-base hover:bg-surface-container-highest rounded text-on-surface-variant transition-colors"
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                      {menuOpen === a.id && (
                        <div ref={menuRef} className="absolute right-8 top-0 z-20 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden">
                          <p className="px-md py-sm text-label-sm text-on-surface-variant uppercase font-bold border-b border-outline-variant">Change Status</p>
                          {statusOptions.filter(s => s !== a.status).map(s => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(a.id, s)}
                              className="w-full text-left px-md py-sm text-body-sm hover:bg-surface-container transition-colors capitalize"
                            >
                              {statusLabelMap[s] ?? s}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="px-lg py-md flex items-center justify-between border-t border-outline-variant bg-surface-container-low">
        <span className="text-body-sm text-on-surface-variant">Showing {list.length} assignments</span>
      </div>
    </div>
  );
}
