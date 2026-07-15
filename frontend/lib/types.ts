// ── Activity ───────────────────────────────────────────
export interface Activity {
  id: string;
  action: string;
  description: string;
  created_at: string;
  actor?: { first_name: string; last_name: string };
  asset?: { name: string; asset_tag?: string };
}

// ── Notification ───────────────────────────────────────
export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

// ── Stat Card ──────────────────────────────────────────
export interface StatCardData {
  label: string;
  value: string;
  note: string;
  icon: string;
  iconColor?: string;
  valueClass?: string;
  trend?: string;
  trendColor?: string;
}

// ── Nav Item ───────────────────────────────────────────
export interface NavItem {
  href: string;
  icon: string;
  label: string;
}

// ── Sidebar Config ─────────────────────────────────────
export interface SidebarConfig {
  navItems: NavItem[];
  bottomItems: NavItem[];
  logoSubtitle?: string;
  cta?: { href: string; label: string; icon: string };
}

// ── Status helpers ─────────────────────────────────────
export const activityStyleMap: Record<string, { icon: string; bg: string; cls: string }> = {
  asset_assigned:   { icon: 'assignment_ind',    bg: 'bg-primary-container',       cls: 'text-on-primary-container' },
  asset_returned:   { icon: 'history',           bg: 'bg-surface-container-high',  cls: 'text-on-surface-variant' },
  request_approved: { icon: 'check_circle',      bg: 'bg-secondary-container',     cls: 'text-on-secondary-container' },
  maintenance:      { icon: 'build',             bg: 'bg-tertiary-fixed',          cls: 'text-tertiary' },
};

export const notificationTypeStyles: Record<string, string> = {
  assignment: 'status-assigned',
  request: 'status-available',
  maintenance: 'status-maintenance',
  system: 'status-retired',
  return: 'status-maintenance',
};

export const notificationTypeIcons: Record<string, string> = {
  assignment: 'inventory_2',
  request: 'task_alt',
  maintenance: 'build',
  system: 'info',
  return: 'assignment_return',
};
