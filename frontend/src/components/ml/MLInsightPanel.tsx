import { Brain } from 'lucide-react';
import type { ReactNode } from 'react';

interface MLInsightPanelProps {
  title: string;
  loading?: boolean;
  error?: boolean;
  children: ReactNode;
}

export default function MLInsightPanel({ title, loading, error, children }: MLInsightPanelProps) {
  return (
    <div className="nh-card p-4 mb-4" style={{ borderLeft: '4px solid #8B5CF6' }}>
      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
        <Brain size={16} style={{ color: '#8B5CF6' }} />
        {title}
        <span className="badge rounded-pill" style={{ fontSize: '0.6rem', backgroundColor: '#8B5CF620', color: '#8B5CF6', fontWeight: 500 }}>
          ML-Powered
        </span>
      </h6>
      {loading ? (
        <div className="d-flex align-items-center gap-2 text-muted small">
          <div className="spinner-border spinner-border-sm" style={{ color: '#8B5CF6' }} />
          Running predictions...
        </div>
      ) : error ? (
        <p className="text-muted small mb-0">ML predictions unavailable — ensure the ML service is running.</p>
      ) : (
        children
      )}
    </div>
  );
}

interface MLMetricProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}

export function MLMetric({ label, value, sublabel, color = '#8B5CF6' }: MLMetricProps) {
  return (
    <div>
      <div className="text-muted small">{label}</div>
      <div className="fw-bold fs-5" style={{ color }}>{value}</div>
      {sublabel && <div className="text-muted" style={{ fontSize: '0.7rem' }}>{sublabel}</div>}
    </div>
  );
}

interface MLFactorBarProps {
  factors: Array<{ feature: string; importance: number }>;
}

export function MLFactorBar({ factors }: MLFactorBarProps) {
  if (!factors || factors.length === 0) return null;
  const maxImportance = Math.max(...factors.map((f) => f.importance));

  return (
    <div className="mt-2">
      <div className="text-muted small fw-semibold mb-2">Top Contributing Factors</div>
      {factors.slice(0, 5).map((f) => (
        <div key={f.feature} className="d-flex align-items-center gap-2 mb-1">
          <span className="small text-truncate" style={{ width: 140, fontSize: '0.72rem' }}>
            {f.feature.replace(/_/g, ' ')}
          </span>
          <div className="flex-grow-1">
            <div className="progress" style={{ height: 6 }}>
              <div
                className="progress-bar"
                style={{
                  width: `${(f.importance / maxImportance) * 100}%`,
                  backgroundColor: '#8B5CF6',
                }}
              />
            </div>
          </div>
          <span style={{ fontSize: '0.65rem', minWidth: 30 }} className="text-muted">
            {(f.importance * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}
