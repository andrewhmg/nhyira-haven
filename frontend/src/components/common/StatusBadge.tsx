interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusMap: Record<string, { className: string; label: string }> = {
  Active: { className: 'badge-active', label: 'Active' },
  Inactive: { className: 'badge-completed', label: 'Inactive' },
  'On Hold': { className: 'badge-on-hold', label: 'On Hold' },
  Transferred: { className: 'badge-at-risk', label: 'Transferred' },
  Completed: { className: 'badge-completed', label: 'Completed' },
  Reintegrated: { className: 'badge-teal', label: 'Reintegrated' },
  'In Progress': { className: 'badge-active', label: 'In Progress' },
  Pending: { className: 'badge-on-hold', label: 'Pending' },
  Resolved: { className: 'badge-completed', label: 'Resolved' },
  Critical: { className: 'badge-at-risk', label: 'Critical' },
  High: { className: 'badge-on-hold', label: 'High' },
  Medium: { className: 'badge-accent', label: 'Medium' },
  Low: { className: 'badge-teal', label: 'Low' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const mapped = statusMap[status] || { className: 'bg-secondary', label: status };
  const sizeClass = size === 'sm' ? 'px-2 py-1' : 'px-2 py-1';

  return (
    <span className={`badge ${mapped.className} ${sizeClass}`} style={{ fontSize: size === 'sm' ? '0.7rem' : '0.78rem' }}>
      {mapped.label}
    </span>
  );
}
