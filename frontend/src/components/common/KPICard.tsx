import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: 'up' | 'down';
  trendLabel?: string;
  color?: string;
}

export default function KPICard({ label, value, icon, trend, trendLabel, color = 'var(--nh-primary)' }: KPICardProps) {
  return (
    <div className="kpi-card">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <span className="kpi-label">{label}</span>
        {icon && <span style={{ color, opacity: 0.7 }}>{icon}</span>}
      </div>
      <div className="kpi-value" style={{ color }}>{value}</div>
      {trend && trendLabel && (
        <div className="mt-2 d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
          {trend === 'up' ? (
            <TrendingUp size={14} className="text-success" />
          ) : (
            <TrendingDown size={14} className="text-danger" />
          )}
          <span className={trend === 'up' ? 'text-success' : 'text-danger'}>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
