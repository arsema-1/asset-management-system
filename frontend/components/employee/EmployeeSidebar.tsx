import SidebarBase from '@/components/shared/SidebarBase';
import type { SidebarConfig } from '@/lib/types';

const config: SidebarConfig = {
  navItems: [
    { href: '/employee/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { href: '/employee/assets', icon: 'inventory_2', label: 'Assets' },
    { href: '/employee/requests', icon: 'list_alt', label: 'Requests' },
    { href: '/employee/returns', icon: 'assignment_return', label: 'Returns' },
    { href: '/employee/notifications', icon: 'notifications', label: 'Notifications' },
    { href: '/employee/profile', icon: 'badge', label: 'Profile' },
  ],
  bottomItems: [
    { href: '/employee/settings', icon: 'settings', label: 'Settings' },
    { href: '/employee/support', icon: 'help', label: 'Support' },
  ],
};

export default function EmployeeSidebar() {
  return <SidebarBase config={config} id="employee-sidebar" />;
}
