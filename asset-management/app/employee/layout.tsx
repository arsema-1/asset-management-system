import EmployeeSidebar from '@/components/employee/EmployeeSidebar';
import EmployeeTopNav from '@/components/employee/EmployeeTopNav';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background text-on-background min-h-screen">
      <EmployeeSidebar />
      <main className="ml-sidebar-expanded min-h-screen flex flex-col">
        <EmployeeTopNav />
        <div className="p-lg flex-1 flex flex-col">{children}</div>
        <footer className="flex justify-between items-center py-md px-lg border-t border-outline-variant bg-surface-container-lowest">
          <div className="flex flex-col">
            <span className="text-label-md font-bold text-on-surface">AssetPro Enterprise</span>
            <span className="text-body-sm text-on-surface-variant">© 2024 AssetPro Systems. All rights reserved.</span>
          </div>
          <div className="flex gap-xl">
            <a href="#" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-label-sm text-on-surface-variant hover:text-primary transition-colors">API Documentation</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
