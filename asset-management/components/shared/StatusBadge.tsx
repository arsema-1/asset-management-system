type Status = 'available' | 'assigned' | 'maintenance' | 'retired' | 'rejected' | 'delayed' | 'overdue' | 'error' | string;

const statusMap: Record<string, string> = {
  available:   'status-available',
  assigned:    'status-assigned',
  maintenance: 'status-maintenance',
  'in_repair': 'status-maintenance',
  'in repair': 'status-maintenance',
  retired:     'status-retired',
  disposed:    'status-retired',
  rejected:    'status-error',
  delayed:     'status-error',
  overdue:     'status-error',
  error:       'status-error',
  pending:     'status-maintenance',
  approved:    'status-assigned',
  completed:   'status-available',
  verified:    'status-available',
  'in_review': 'status-maintenance',
  'in review': 'status-maintenance',
};

const iconMap: Record<string, string> = {
  available:   'check_circle',
  assigned:    'person',
  maintenance: 'construction',
  in_repair:   'construction',
  'in repair': 'construction',
  retired:     'cancel',
  disposed:    'cancel',
  rejected:    'error',
  delayed:     'error',
  overdue:     'error',
  error:       'error',
  pending:     'hourglass_empty',
  approved:    'verified',
  completed:   'check_circle',
  verified:    'verified',
  'in_review': 'rate_review',
  'in review': 'rate_review',
};

interface Props {
  status: Status;
  label?: string;
  dot?: boolean; // Keep for compatibility but render icon for double-encoding
}

export default function StatusBadge({ status, label, dot = false }: Props) {
  const key = status.toLowerCase().replace(/\s+/g, '_');
  const cls = statusMap[key] ?? 'status-retired';
  const icon = iconMap[key] ?? 'info';
  const display = label ?? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center gap-xs px-sm py-[2px] rounded-full text-label-sm font-bold ${cls}`}>
      <span className="material-symbols-outlined text-[14px] flex-shrink-0">{icon}</span>
      {display}
    </span>
  );
}
