import { useEffect, useState } from 'react';
import { getSafehouses, getSafehouse } from '../../services/api';
import type { Safehouse } from '../../types/api';
import StatusBadge from '../../components/common/StatusBadge';
import { Building2, MapPin, Phone, Mail, Calendar, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function SafehouseManagement() {
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [detail, setDetail] = useState<Safehouse | null>(null);

  useEffect(() => {
    getSafehouses().then(setSafehouses).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleExpand = async (id: number) => {
    if (expanded === id) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(id);
    try {
      const d = await getSafehouse(id);
      setDetail(d);
    } catch {
      setDetail(null);
    }
  };

  const formatDate = (d: string) => { try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; } };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--nh-primary)' }} /></div>;
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Safehouses</h2>
        <p className="text-muted mb-0 small">{safehouses.length} locations</p>
      </div>

      <div className="row g-3">
        {safehouses.map((sh) => {
          const pct = sh.capacity > 0 ? Math.round((sh.currentResidents / sh.capacity) * 100) : 0;
          const isExpanded = expanded === sh.id;

          return (
            <div key={sh.id} className="col-md-6 col-lg-4">
              <div className="nh-card p-3 h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <Building2 size={18} style={{ color: 'var(--nh-primary)' }} />
                    <h6 className="fw-bold mb-0">{sh.name}</h6>
                  </div>
                  <StatusBadge status={sh.isActive ? 'Active' : 'Inactive'} size="sm" />
                </div>

                <div className="text-muted small mb-2 d-flex align-items-center gap-1">
                  <MapPin size={12} /> {sh.location}
                </div>

                <div className="d-flex justify-content-between small mb-1">
                  <span>Capacity</span>
                  <span className="fw-semibold">{sh.currentResidents} / {sh.capacity}</span>
                </div>
                <div className="progress mb-3" style={{ height: 6 }}>
                  <div
                    className="progress-bar"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct > 85 ? 'var(--nh-danger)' : pct > 60 ? 'var(--nh-accent)' : 'var(--nh-success)',
                    }}
                  />
                </div>

                <div className="d-flex flex-wrap gap-2 small text-muted mb-2">
                  {sh.contactPhone && <span className="d-flex align-items-center gap-1"><Phone size={11} /> {sh.contactPhone}</span>}
                  {sh.contactEmail && <span className="d-flex align-items-center gap-1"><Mail size={11} /> {sh.contactEmail}</span>}
                  <span className="d-flex align-items-center gap-1"><Calendar size={11} /> Est. {formatDate(sh.establishedDate)}</span>
                </div>

                <button
                  className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-center gap-1"
                  onClick={() => handleExpand(sh.id)}
                >
                  {isExpanded ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> View Details</>}
                </button>

                {isExpanded && detail && detail.id === sh.id && (
                  <div className="mt-3 pt-3 border-top">
                    <h6 className="fw-bold small mb-2 d-flex align-items-center gap-1">
                      <Users size={14} /> Residents ({detail.residents?.length ?? 0})
                    </h6>
                    {detail.residents && detail.residents.length > 0 ? (
                      <div className="d-flex flex-column gap-1">
                        {detail.residents.slice(0, 10).map((r) => (
                          <div key={r.id} className="d-flex justify-content-between align-items-center small">
                            <span>{r.firstName} {r.lastName}</span>
                            <StatusBadge status={r.status} size="sm" />
                          </div>
                        ))}
                        {detail.residents.length > 10 && (
                          <span className="text-muted small">+{detail.residents.length - 10} more</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted small">No residents</p>
                    )}

                    {detail.monthlyMetrics && detail.monthlyMetrics.length > 0 && (
                      <div className="mt-3">
                        <h6 className="fw-bold small mb-2">Latest Monthly Metrics</h6>
                        {(() => {
                          const latest = detail.monthlyMetrics[detail.monthlyMetrics.length - 1];
                          return (
                            <div className="row g-2">
                              <div className="col-6"><div className="small"><strong>New Intakes:</strong> {latest.newIntakes}</div></div>
                              <div className="col-6"><div className="small"><strong>Reintegrations:</strong> {latest.reintegrations}</div></div>
                              <div className="col-6"><div className="small"><strong>Staff:</strong> {latest.staffCount}</div></div>
                              <div className="col-6"><div className="small"><strong>Vol. Hours:</strong> {latest.volunteerHours}</div></div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
