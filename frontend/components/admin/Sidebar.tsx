import SidebarBase from '@/components/shared/SidebarBase';
import type { SidebarConfig } from '@/lib/types';

const config: SidebarConfig = {
  logoSubtitle: 'Enterprise Manager',
  navItems: [
    { href: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/admin/assets', icon: 'inventory_2', label: 'Assets' },
    { href: '/admin/assignments', icon: 'swap_horiz', label: 'Assignments' },
    { href: '/admin/maintenance', icon: 'build', label: 'Maintenance' },
    { href: '/admin/requests', icon: 'list_alt', label: 'Requests' },
    { href: '/admin/employees', icon: 'badge', label: 'Employees' },
    { href: '/admin/reports', icon: 'analytics', label: 'Reports' },
  ],
  bottomItems: [
    { href: '/admin/settings', icon: 'settings', label: 'Settings' },
    { href: '/admin/support', icon: 'help', label: 'Support' },
  ],
  cta: { href: '/admin/assets/new', icon: 'add', label: 'New Asset' },
};

export default function Sidebar() {
  return <SidebarBase config={config} id="admin-sidebar" />;
}
