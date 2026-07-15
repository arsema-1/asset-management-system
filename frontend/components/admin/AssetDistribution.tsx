'use client';

import { useEffect, useState } from 'react';

interface Row { category: string; count: string; }

const colors: Record<string, string> = {
  laptop: 'bg-primary', monitor: 'bg-[#0ea5e9]', mobile: 'bg-[#8b5cf6]',
  peripheral: 'bg-[#10b981]', infrastructure: 'bg-[#f59e0b]',
  furniture: 'bg-[#ec4899]', other: 'bg-surface-container-highest',
};

export default function AssetDistribution() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : '';
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/assets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(j => {
        // Aggregate by category
        const map: Record<string, number> = {};
        (j.data as Row[]).forEach(r => {
          map[r.category] = (map[r.category] ?? 0) + parseInt(r.count, 10);
        });
        const total = Object.values(map).reduce((s, v) => s + v, 0);
        setRows(Object.entries(map).map(([category, count]) => ({
          category,
          count: total > 0 ? String(Math.round((count / total) * 100)) : '0',
        })));
      })
      .catch(() => {});
  }, []);

  if (rows.length === 0) return null;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-md">
      <h3 className="text-title-lg font-bold mb-md">Asset Type Distribution</h3>
      <div className="flex flex-col gap-sm">
        {rows.map(r => (
          <div key={r.category}>
            <div className="flex justify-between text-label-md mb-xs">
              <span className="text-on-surface capitalize">{r.category}</span>
              <span className="font-bold">{r.count}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div className={`h-full ${colors[r.category] ?? 'bg-primary'}`} style={{ width: `${r.count}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
