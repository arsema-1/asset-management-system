'use client';

import { useRouter } from 'next/navigation';

const actions = [
  { icon: 'add_shopping_cart', label: 'Request Asset', desc: 'Need new equipment?', href: '/employee/requests' },
  { icon: 'visibility', label: 'View My Assets', desc: 'Check current inventory.', href: '/employee/assets' },
  { icon: 'assignment_return', label: 'Return Asset', desc: 'Starting an off-boarding.', href: '/employee/returns' },
];

const tutorials = [
  { title: 'Setting up your VPN', desc: 'Step-by-step for macOS & Windows' },
  { title: 'Asset Care Policy', desc: 'Best practices for device longevity' },
];

export default function QuickActionsPanel() {
  const router = useRouter();
  return (
    <div className="space-y-lg">
      <section>
        <h3 className="text-title-lg font-bold text-on-surface mb-md">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-sm">
          {actions.map((a) => (
            <button key={a.label} onClick={() => router.push(a.href)}
              className="flex items-center gap-md p-md bg-white border border-outline-variant rounded-xl hover:bg-primary hover:text-on-primary transition-all group text-left">
              <span className="material-symbols-outlined bg-surface-container-high group-hover:bg-primary-container p-sm rounded-lg">{a.icon}</span>
              <div className="flex flex-col">
                <span className="font-bold text-body-md">{a.label}</span>
                <span className="text-xs text-on-surface-variant group-hover:text-on-primary">{a.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-primary-container p-lg rounded-2xl text-on-primary-container relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-title-lg font-bold mb-xs">Need Help?</h4>
          <p className="text-body-sm opacity-90 mb-md">Contact the IT Service Desk for any technical issues or repairs.</p>
          <a href="mailto:support@assetpro.com" className="inline-block px-md py-sm bg-white text-primary rounded-lg font-bold text-label-md hover:bg-surface-container-lowest transition-colors">
            Contact IT Support
          </a>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </section>

      <section>
        <h3 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider mb-sm">Popular Tutorials</h3>
        <div className="space-y-sm">
          {tutorials.map((t) => (
            <a key={t.title} href="#" className="block p-md bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors">
              <p className="text-label-md font-bold text-on-surface">{t.title}</p>
              <p className="text-xs text-on-surface-variant">{t.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
