// ── Time formatting ────────────────────────────────────
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Date formatting ────────────────────────────────────
export function formatDate(d?: string): string {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Cost formatting ────────────────────────────────────
export function formatCost(n?: number | string): string {
  if (n == null || n === '') return '—';
  const num = Number(n);
  return isNaN(num) ? '—' : `$${num.toFixed(2)}`;
}

// ── User initials ──────────────────────────────────────
export function getInitials(first?: string, last?: string): string {
  if (!first && !last) return '??';
  return `${(first?.[0] ?? '')}${(last?.[0] ?? '')}`.toUpperCase() || '?';
}

// ── Classname helper for conditional classes ───────────
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
