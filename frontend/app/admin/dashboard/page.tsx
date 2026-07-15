'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/admin/StatCard';
import RecentActivities from '@/components/admin/RecentActivities';
import QuickActions from '@/components/admin/QuickActions';
import AssetDistribution from '@/components/admin/AssetDistribution';
import { getUser } from '@/lib/api';

interface ReportRow { status: string; count: string; }
interface ReportData {
  assets: ReportRow[];
  assignments: ReportRow[];
  requests: ReportRow[];
  maintenance: ReportRow[];
  active_employees: number;
}

function countByStatus(rows: ReportRow[], status: string) {
  return parseInt(rows.find(r => r.status === status)?.count ?? '0', 10);
}

export default function AdminDashboard() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [user, setUser] = useState(getUser());

  // Defer localStorage read to avoid hydration mismatch
  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
      headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : ''}` },
    })
      .then(r => r.json())
      .then(j => setReport(j.data))
      .catch(() => {});
  }, []);

  const totalAssets = report ? report.assets.reduce((s, r) => s + parseInt(r.count, 10), 0) : 0;
  const assigned = report ? countByStatus(report.assets, 'assigned') : 0;
  const available = report ? countByStatus(report.assets, 'available') : 0;
  const pending = report ? countByStatus(report.requests, 'pending') : 0;
  const inRepair = report ? countByStatus(report.assets, 'in_repair') : 0;

  const activeEmployees = report?.active_employees ?? 0;
  
  const stats = [
    { label: 'Total Assets', value: totalAssets.toLocaleString(), note: `${activeEmployees} active employees`, icon: 'inventory', iconColor: 'text-primary', trend: 'trending_up', trendColor: 'text-primary' },
    { label: 'Assigned Assets', value: assigned.toLocaleString(), note: `${totalAssets ? Math.round((assigned / totalAssets) * 100) : 0}% utilization rate`, icon: 'person_check', iconColor: 'text-[#0ea5e9]' },
    { label: 'Available Assets', value: available.toLocaleString(), note: 'Ready for deployment', icon: 'check_circle', iconColor: 'text-[#22c55e]' },
    { label: 'Pending Requests', value: pending.toLocaleString(), note: 'Awaiting your review', icon: 'pending_actions', iconColor: 'text-[#f59e0b]' },
    { label: 'Under Maintenance', value: inRepair.toLocaleString(), note: 'Assets being repaired', icon: 'handyman', iconColor: 'text-error' },
  ];

  return (
    <>
      <section className="flex flex-col md:flex-row justify-between items-end md:items-center gap-md">
        <div>
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant mb-xs">
            <span>Main</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">Dashboard</span>
          </nav>
          <h2 className="text-headline-lg font-bold text-on-surface">
            Welcome back, {user?.first_name ?? 'Admin'}
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Here is an overview of your organization's assets and activities for today.
          </p>
        </div>
        <div className="flex gap-md">
          <button className="flex items-center gap-xs px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            <span className="text-label-md">Filter</span>
          </button>
          <button className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity shadow-sm">
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span className="text-label-md">Export Data</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <RecentActivities />
        <div className="space-y-lg">
          <QuickActions />
          <AssetDistribution />
        </div>
      </div>
    </>
  );
}
