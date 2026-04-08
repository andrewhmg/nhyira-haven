import { Brain } from 'lucide-react';

interface MLInsightBadgeProps {
  label: string;
  level: 'success' | 'warning' | 'danger' | 'info';
  probability?: number;
  size?: 'sm' | 'md';
}

const levelStyles: Record<string, { bg: string; color: string; border: string }> = {
  success: { bg: '#e8f5e9', color: '#2D8659', border: '#2D8659' },
  warning: { bg: '#fff3e0', color: '#E8A838', border: '#E8A838' },
  danger: { bg: '#fce4ec', color: '#C0392B', border: '#C0392B' },
  info: { bg: '#e3f2fd', color: '#1B6B6D', border: '#1B6B6D' },
};

export default function MLInsightBadge({ label, level, probability, size = 'sm' }: MLInsightBadgeProps) {
  const style = levelStyles[level] || levelStyles.info;
  const fontSize = size === 'sm' ? '0.68rem' : '0.78rem';

  return (
    <span
      className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
      style={{
        fontSize,
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}30`,
        whiteSpace: 'nowrap',
      }}
      title={probability !== undefined ? `${(probability * 100).toFixed(0)}% confidence` : undefined}
    >
      <Brain size={size === 'sm' ? 10 : 12} />
      {label}
    </span>
  );
}

export function churnLevelColor(tier: string): 'success' | 'warning' | 'danger' {
  if (tier === 'High') return 'danger';
  if (tier === 'Medium') return 'warning';
  return 'success';
}

export function riskLevelColor(level: string): 'success' | 'warning' | 'danger' {
  if (level === 'Red' || level === 'High Risk') return 'danger';
  if (level === 'Yellow' || level === 'Moderate Risk') return 'warning';
  return 'success';
}

export function readinessLevelColor(readiness: string): 'success' | 'warning' | 'danger' {
  if (readiness === 'Ready' || readiness === 'Likely Ready') return 'success';
  if (readiness === 'Progressing') return 'warning';
  return 'danger';
}
