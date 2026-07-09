'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReturnAssetSelector from '@/components/employee/ReturnAssetSelector';
import ReturnForm from '@/components/employee/ReturnForm';

const assets = [
  { id: 'AST-2024-0892', name: 'MacBook Pro 16"', icon: 'laptop_mac', assignedDate: 'Jan 12, 2024' },
  { id: 'AST-2024-1140', name: 'iPhone 15 Pro Max', icon: 'smartphone', assignedDate: 'Feb 05, 2024' },
];

const infoItems = [
  { icon: 'local_shipping', title: 'Courier Pickup', desc: 'Schedule a home pickup for your devices after approval.' },
  { icon: 'verified', title: 'Inspection Policy', desc: 'Hardware will be inspected within 48 hours of receipt.' },
  { icon: 'support_agent', title: 'Need Help?', desc: 'Contact IT support for questions regarding returns.' },
];

export default function ReturnsPage() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="max-w-6xl mx-auto space-y-lg">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant">
        <Link href="/employee/dashboard" className="hover:text-primary transition-colors">Asset Management</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface font-medium">Return Asset</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <ReturnAssetSelector assets={assets} selected={selected} onToggle={toggle} />
        <ReturnForm />
      </div>

      {/* Info Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md pt-xl border-t border-outline-variant">
        {infoItems.map((item) => (
          <div key={item.title} className="flex gap-md">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container flex-shrink-0">
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div>
              <h4 className="text-label-md font-bold text-on-surface">{item.title}</h4>
              <p className="text-body-sm text-on-surface-variant">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
