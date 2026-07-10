import Sidebar from '@/components/admin/Sidebar';
import TopNav from '@/components/admin/TopNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      <Sidebar />
      <main className="lg:ml-sidebar-expanded flex-1 flex flex-col min-w-0">
        <TopNav />
        <div className="p-lg space-y-lg flex-1">{children}</div>
        <footer className="flex justify-between items-center py-md px-lg bg-surface-container-lowest border-t border-outline-variant">
          <div className="flex items-center gap-md">
            <span className="text-label-md font-bold text-on-surface">AssetFlow</span>
            <p className="text-body-sm text-on-surface-variant">© 2024 AssetFlow Systems. All rights reserved.</p>
          </div>
          <div className="flex gap-lg">
            <a href="#" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">API Documentation</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
