'use client';

import { useEffect, useRef, useState } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { maintenance as maintenanceApi, type MaintenanceLog } from '@/lib/api';
import { formatDate, formatCost, getInitials } from '@/lib/utils';

const maintenanceStatusMap: Record<string, string> = {
  completed: 'available',
  in_progress: 'maintenance',
  pending: 'retired',
  cancelled: 'retired',
};

const statusOptions = ['pending', 'in_progress', 'completed', 'cancelled'];

export default function MaintenanceTable() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    maintenanceApi.list()
      .then(setLogs)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdating(id);
    setMenuOpen(null);
    try {
      const updated = await maintenanceApi.update(id, {
        status,
        ...(status === 'completed' ? { completed_date: new Date().toISOString().split('T')[0] } : {}),
      } as Partial<MaintenanceLog>);
      setLogs(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
      <div className="px-lg py-md border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
        <div className="flex items-center gap-md">
          <button className="flex items-center gap-sm px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>Filters
          </button>
          <button className="flex items-center gap-sm px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>Export
          </button>
        </div>
        <span className="text-label-sm text-on-surface-variant">Showing {logs.length} records</span>
      </div>

      <div className="overflow-x-auto">
        {loading && <p className="p-lg text-on-surface-variant">Loading...</p>}
        {error && <p className="p-lg text-error">{error}</p>}
        {!loading && !error && (
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
              {logs.length === 0 && (
                <tr><td colSpan={7} className="px-lg py-lg text-on-surface-variant">No maintenance records.</td></tr>
              )}
              {logs.map((log) => {
                const techInitials = getInitials(log.technician?.first_name, log.technician?.last_name);
                const techName = log.technician
                  ? `${log.technician.first_name} ${log.technician.last_name}`
                  : '—';
                const isUpdating = updating === log.id;

                return (
                  <tr key={log.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-md">
                        <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[20px] text-primary">build</span>
                        </div>
                        <div>
                          <p className="text-body-sm font-bold text-on-surface">{log.asset?.name ?? log.asset_id}</p>
                          <p className="text-label-sm text-on-surface-variant">{log.asset?.asset_tag ?? ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-md">
                      <span className="text-body-sm text-on-surface-variant bg-surface-container px-sm py-xs rounded capitalize">
                        {log.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-lg py-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {techInitials}
                        </div>
                        <span className="text-body-sm">{techName}</span>
                      </div>
                    </td>
                    <td className="px-lg py-md text-body-sm font-bold text-on-surface">{formatCost(log.cost)}</td>
                    <td className="px-lg py-md text-body-sm text-on-surface-variant text-right whitespace-nowrap">
                      {formatDate(log.scheduled_date)}
                    </td>
                    <td className="px-lg py-md">
                      <div className="flex justify-center">
                        {isUpdating
                          ? <span className="material-symbols-outlined animate-spin text-primary">sync</span>
                          : <StatusBadge status={maintenanceStatusMap[log.status] ?? 'retired'} label={log.status.replace(/_/g, ' ')} />
                        }
                      </div>
                    </td>
                    <td className="px-lg py-md text-right relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === log.id ? null : log.id)}
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        disabled={isUpdating}
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                      {menuOpen === log.id && (
                        <div ref={menuRef} className="absolute right-8 top-0 z-20 w-44 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden">
                          <p className="px-md py-sm text-label-sm text-on-surface-variant uppercase font-bold border-b border-outline-variant">Change Status</p>
                          {statusOptions.filter(s => s !== log.status).map(s => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(log.id, s)}
                              className="w-full text-left px-md py-sm text-body-sm hover:bg-surface-container transition-colors capitalize"
                            >
                              {s.replace(/_/g, ' ')}
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

      <div className="border-t border-outline-variant px-lg py-md flex items-center justify-between bg-surface-container-low">
        <span className="text-body-sm text-on-surface-variant">{logs.length} records total</span>
      </div>
    </div>
  );
}
