'use client';

import { useEffect, useState } from 'react';

interface AssetRow { category: string; status: string; count: string; total_cost: string; }
interface CostRow { month: string; total_cost: string; job_count: string; }
interface Summary { assets: { status: string; count: string }[]; assignments: { status: string; count: string }[]; requests: { status: string; count: string }[]; active_employees: number; }

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';
}
const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

function StatBox({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex items-center gap-md shadow-sm">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className="text-headline-lg font-bold text-on-surface">{value}</p>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [assetBreakdown, setAssetBreakdown] = useState<AssetRow[]>([]);
  const [costs, setCosts] = useState<CostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = { Authorization: `Bearer ${getToken()}` };
    Promise.all([
      fetch(`${BASE}/reports`, { headers: h }).then(r => r.json()),
      fetch(`${BASE}/reports/assets`, { headers: h }).then(r => r.json()),
      fetch(`${BASE}/reports/maintenance-costs`, { headers: h }).then(r => r.json()),
    ]).then(([s, a, c]) => {
      setSummary(s.data);
      setAssetBreakdown(a.data ?? []);
      setCosts(c.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const countStatus = (rows: { status: string; count: string }[], status: string) =>
    parseInt(rows?.find(r => r.status === status)?.count ?? '0', 10);

  const totalAssets = summary?.assets.reduce((s, r) => s + parseInt(r.count, 10), 0) ?? 0;

  return (
    <>
      <div className="flex items-center justify-between mb-xl">
        <div>
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-xs">
            <span>Admin</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">Reports</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">Reports & Analytics</h2>
        </div>

      </div>

      {loading && <p className="text-on-surface-variant">Loading reports...</p>}

      {!loading && summary && (
        <div className="space-y-xl">
          {/* Summary KPIs */}
          <section>
            <h3 className="text-title-lg font-bold text-on-surface mb-md">Asset Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <StatBox label="Total Assets" value={totalAssets} icon="inventory" color="bg-primary-container text-on-primary-container" />
              <StatBox label="Assigned" value={countStatus(summary.assets, 'assigned')} icon="person_check" color="bg-secondary-container text-on-secondary-container" />
              <StatBox label="Available" value={countStatus(summary.assets, 'available')} icon="check_circle" color="bg-tertiary-container text-on-tertiary-container" />
              <StatBox label="In Repair" value={countStatus(summary.assets, 'in_repair')} icon="build" color="bg-error-container text-on-error-container" />
            </div>
          </section>

          <section>
            <h3 className="text-title-lg font-bold text-on-surface mb-md">Requests & Employees</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              <StatBox label="Pending Requests" value={countStatus(summary.requests, 'pending')} icon="pending_actions" color="bg-primary-container text-on-primary-container" />
              <StatBox label="Approved Requests" value={countStatus(summary.requests, 'approved')} icon="task_alt" color="bg-tertiary-container text-on-tertiary-container" />
              <StatBox label="Rejected Requests" value={countStatus(summary.requests, 'rejected')} icon="cancel" color="bg-error-container text-on-error-container" />
              <StatBox label="Active Employees" value={summary.active_employees} icon="group" color="bg-secondary-container text-on-secondary-container" />
            </div>
          </section>

          {/* Asset breakdown by category */}
          <section>
            <h3 className="text-title-lg font-bold text-on-surface mb-md">Assets by Category & Status</h3>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    {['Category', 'Status', 'Count', 'Total Value'].map(h => (
                      <th key={h} className="px-lg py-md text-label-sm text-on-surface-variant uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {assetBreakdown.length === 0 && (
                    <tr><td colSpan={4} className="px-lg py-lg text-on-surface-variant">No data.</td></tr>
                  )}
                  {assetBreakdown.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md text-body-sm font-medium capitalize">{row.category}</td>
                      <td className="px-lg py-md text-body-sm capitalize">{row.status.replace(/_/g, ' ')}</td>
                      <td className="px-lg py-md text-body-sm font-bold text-primary">{row.count}</td>
                      <td className="px-lg py-md text-body-sm text-on-surface-variant">
                        {row.total_cost ? `$${parseFloat(row.total_cost).toLocaleString()}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Maintenance cost trend */}
          <section>
            <h3 className="text-title-lg font-bold text-on-surface mb-md">Maintenance Costs (Last 12 Months)</h3>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    {['Month', 'Jobs', 'Total Cost'].map(h => (
                      <th key={h} className="px-lg py-md text-label-sm text-on-surface-variant uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {costs.length === 0 && (
                    <tr><td colSpan={3} className="px-lg py-lg text-on-surface-variant">No maintenance records.</td></tr>
                  )}
                  {costs.map((row, i) => (
                    <tr key={i} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-lg py-md text-body-sm">{new Date(row.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                      <td className="px-lg py-md text-body-sm">{row.job_count}</td>
                      <td className="px-lg py-md text-body-sm font-bold text-on-surface">${parseFloat(row.total_cost ?? '0').toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
