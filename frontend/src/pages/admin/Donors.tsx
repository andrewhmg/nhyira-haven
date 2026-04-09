import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSupporters, getAtRiskSupporters, getDonationStats, createSupporter, deleteSupporter } from '../../services/api';
import type { Supporter } from '../../types/api';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge from '../../components/common/StatusBadge';
import KPICard from '../../components/common/KPICard';
import MLInsightBadge, { churnLevelColor } from '../../components/ml/MLInsightBadge';
import { buildDonorFeatures, predictChurnRisk, predictDonorTier, type ChurnRiskResult, type DonorTierResult } from '../../services/mlApi';
import { Search, AlertTriangle, DollarSign, Users, RefreshCw, ChevronLeft, ChevronRight, Brain } from 'lucide-react';

const PAGE_SIZE = 15;

export default function Donors() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showAtRisk, setShowAtRisk] = useState(false);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<{ totalAmount: number; recurringDonations: number; averageDonation: number; totalDonations: number } | null>(null);
  const [mlPredictions, setMlPredictions] = useState<Record<number, { churn?: ChurnRiskResult; tier?: DonorTierResult }>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Supporter | null>(null);
  const [createForm, setCreateForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', supporterType: 'Individual', country: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [s, st] = await Promise.all([
      showAtRisk ? getAtRiskSupporters().catch(() => []) : getSupporters(filterType ? { type: filterType } : undefined).catch(() => []),
      getDonationStats().catch(() => null),
    ]);
    setSupporters(s);
    setStats(st);
    setLoading(false);
    setPage(1);

    // Fire ML predictions for all supporters in batch (non-blocking)
    const predictions: Record<number, { churn?: ChurnRiskResult; tier?: DonorTierResult }> = {};
    const batch = s.slice(0, 50).map(async (sup: Supporter) => {
      const features = buildDonorFeatures(sup);
      const [churn, tier] = await Promise.allSettled([
        predictChurnRisk(features),
        predictDonorTier(features),
      ]);
      predictions[sup.id] = {
        churn: churn.status === 'fulfilled' ? churn.value : undefined,
        tier: tier.status === 'fulfilled' ? tier.value : undefined,
      };
    });
    Promise.allSettled(batch).then(() => setMlPredictions({ ...predictions }));
  };

  useEffect(() => { loadData(); }, [filterType, showAtRisk]);

  const filtered = supporters.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const types = [...new Set(supporters.map((s) => s.supporterType))].sort();
  const atRiskCount = supporters.filter((s) => s.isAtRisk).length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Donors & Supporters</h2>
          <p className="text-muted mb-0 small">{filtered.length} supporters found</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-1" onClick={() => setShowCreateForm(true)}>
          <Users size={16} /> Add Supporter
        </button>
      </div>

      {/* KPI Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <KPICard label="Total Donors" value={supporters.length} icon={<Users size={20} />} color="var(--nh-primary)" />
        </div>
        <div className="col-6 col-lg-3">
          <KPICard
            label="At-Risk Donors"
            value={atRiskCount}
            icon={<AlertTriangle size={20} />}
            color={atRiskCount > 0 ? 'var(--nh-danger)' : 'var(--nh-success)'}
          />
        </div>
        <div className="col-6 col-lg-3">
          <KPICard
            label="Total Donated"
            value={`$${(stats?.totalAmount ?? 0).toLocaleString()}`}
            icon={<DollarSign size={20} />}
            color="var(--nh-success)"
          />
        </div>
        <div className="col-6 col-lg-3">
          <KPICard
            label="Recurring"
            value={stats?.recurringDonations ?? 0}
            icon={<RefreshCw size={20} />}
            color="var(--nh-secondary)"
          />
        </div>
      </div>

      {/* At-risk alert */}
      {atRiskCount > 0 && !showAtRisk && (
        <div className="nh-card p-3 mb-3" style={{ borderLeft: '4px solid var(--nh-danger)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <AlertTriangle size={16} className="text-danger" />
              <span className="small fw-semibold">{atRiskCount} donors are at risk of lapsing</span>
            </div>
            <button className="btn btn-sm btn-outline-danger" onClick={() => setShowAtRisk(true)}>
              View At-Risk
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar d-flex flex-wrap gap-3 align-items-center">
        <div className="position-relative flex-grow-1" style={{ minWidth: 200 }}>
          <Search size={16} className="position-absolute" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--nh-text-muted)' }} />
          <input
            type="text"
            className="form-control form-control-sm ps-4"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          className={`btn btn-sm ${showAtRisk ? 'btn-danger' : 'btn-outline-secondary'}`}
          onClick={() => setShowAtRisk(!showAtRisk)}
        >
          {showAtRisk ? 'Show All' : 'At-Risk Only'}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--nh-primary)' }} /></div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-5 text-muted">No supporters found.</div>
      ) : (
        <div className="data-table">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Total Donated</th>
                  <th>Donations</th>
                  <th>Last Donation</th>
                  <th>Risk</th>
                  <th><span className="d-flex align-items-center gap-1"><Brain size={12} /> ML Tier</span></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/admin/donors/${s.id}`} className="text-decoration-none fw-semibold" style={{ color: 'var(--nh-primary)' }}>
                        {s.firstName} {s.lastName}
                      </Link>
                    </td>
                    <td className="small">{s.email}</td>
                    <td className="small">{s.supporterType}</td>
                    <td><StatusBadge status={s.isActive ? 'Active' : 'Inactive'} size="sm" /></td>
                    <td className="small fw-semibold">${s.totalDonated.toLocaleString()}</td>
                    <td className="small">{s.donationCount}</td>
                    <td className="small">{s.lastDonationDate ? new Date(s.lastDonationDate).toLocaleDateString() : '—'}</td>
                    <td>
                      {s.isAtRisk ? (
                        <span className="badge badge-at-risk d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <AlertTriangle size={10} /> At Risk
                        </span>
                      ) : (
                        <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>Safe</span>
                      )}
                    </td>
                    <td>
                      {mlPredictions[s.id]?.tier ? (
                        <MLInsightBadge
                          label={mlPredictions[s.id].tier!.tier}
                          level={mlPredictions[s.id].tier!.tier === 'High' ? 'success' : mlPredictions[s.id].tier!.tier === 'Medium' ? 'info' : 'warning'}
                        />
                      ) : mlPredictions[s.id]?.churn ? (
                        <MLInsightBadge
                          label={`Churn: ${mlPredictions[s.id].churn!.risk_tier}`}
                          level={churnLevelColor(mlPredictions[s.id].churn!.risk_tier)}
                          probability={mlPredictions[s.id].churn!.churn_probability}
                        />
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Link to={`/admin/donors/${s.id}`} className="btn btn-sm btn-outline-secondary" style={{ fontSize: '0.75rem' }}>View</Link>
                        <button className="btn btn-sm btn-outline-danger" style={{ fontSize: '0.75rem' }}
                          onClick={() => setDeleteTarget(s)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span className="text-muted small">Page {page} of {totalPages}</span>
          <div className="d-flex gap-1">
            <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={14} /></button>
            <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Add New Supporter</h5>
                <button className="btn-close" onClick={() => setShowCreateForm(false)} />
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setFormSubmitting(true);
                try {
                  await createSupporter({
                    firstName: createForm.firstName,
                    lastName: createForm.lastName,
                    email: createForm.email,
                    phone: createForm.phone || undefined,
                    supporterType: createForm.supporterType,
                    country: createForm.country || undefined,
                    joinedDate: new Date().toISOString(),
                    totalDonated: 0,
                    donationCount: 0,
                    isActive: true,
                    isAtRisk: false,
                  });
                  setShowCreateForm(false);
                  setCreateForm({ firstName: '', lastName: '', email: '', phone: '', supporterType: 'Individual', country: '' });
                  loadData();
                } catch {
                  alert('Failed to create supporter. Ensure you have admin permissions.');
                } finally {
                  setFormSubmitting(false);
                }
              }}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">First Name *</label>
                      <input type="text" className="form-control form-control-sm" required
                        value={createForm.firstName} onChange={e => setCreateForm({ ...createForm, firstName: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Last Name *</label>
                      <input type="text" className="form-control form-control-sm" required
                        value={createForm.lastName} onChange={e => setCreateForm({ ...createForm, lastName: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email *</label>
                      <input type="email" className="form-control form-control-sm" required
                        value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone</label>
                      <input type="text" className="form-control form-control-sm"
                        value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Supporter Type *</label>
                      <select className="form-select form-select-sm" required value={createForm.supporterType}
                        onChange={e => setCreateForm({ ...createForm, supporterType: e.target.value })}>
                        <option>Individual</option>
                        <option>Corporate</option>
                        <option>Foundation</option>
                        <option>Volunteer</option>
                        <option>Skills Contributor</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Country</label>
                      <input type="text" className="form-control form-control-sm"
                        value={createForm.country} onChange={e => setCreateForm({ ...createForm, country: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowCreateForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={formSubmitting}>
                    {formSubmitting ? 'Creating...' : 'Create Supporter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Supporter"
          message={`Are you sure you want to delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={async () => {
            try {
              await deleteSupporter(deleteTarget.id);
              setDeleteTarget(null);
              loadData();
            } catch {
              alert('Failed to delete supporter.');
            }
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
