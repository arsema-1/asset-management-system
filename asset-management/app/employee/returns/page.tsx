'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReturnAssetSelector from '@/components/employee/ReturnAssetSelector';
import ReturnForm from '@/components/employee/ReturnForm';

const assets = [
  { id: 'AST-2024-0892', name: 'MacBook Pro 16"', icon: 'laptop_mac', assignedDate: 'Jan 12, 2024' },
  { id: 'AST-2024-1140', name: 'iPhone 15 Pro Max', icon: 'smartphone', assignedDate: 'Feb 05, 2024' },
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
    </div>
  );
}
