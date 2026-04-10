import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDonorProfile, getDonorDonations, getDonorImpact, submitDonorDonation } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Heart, DollarSign, Calendar, TrendingUp, Gift, RefreshCw } from 'lucide-react';
import type { Supporter, Donation } from '../../types/api';

const COLORS = ['#6B5B95', '#88B04B', '#F7CAC9', '#92A8D1', '#955251', '#009B77'];

export default function DonorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Supporter | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [impact, setImpact] = useState<{
    totalDonated: number;
    donationCount: number;
    firstDonation?: string;
    lastDonation?: string;
    allocations: Array<{ category: string; amount: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDonateForm, setShowDonateForm] = useState(false);
  const [donateForm, setDonateForm] = useState({
    amount: '',
    donationType: 'Monetary',
    campaignSource: '',
    notes: '',
    isRecurring: false,
    recurringFrequency: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [p, d, i] = await Promise.all([
        getDonorProfile().catch(() => null),
        getDonorDonations().catch(() => []),
        getDonorImpact().catch(() => null),
      ]);
      setProfile(p);
      setDonations(d);
      setImpact(i);
    } catch {
      setError('Unable to load donor data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    if (!donateForm.amount || Number(donateForm.amount) <= 0) return;
    setSubmitting(true);
    try {
      await submitDonorDonation({
        amount: Number(donateForm.amount),
        donationType: donateForm.donationType,
        campaignSource: donateForm.campaignSource || undefined,
        notes: donateForm.notes || undefined,
        isRecurring: donateForm.isRecurring,
        recurringFrequency: donateForm.isRecurring ? donateForm.recurringFrequency : undefined,
      });
      setSuccessMsg(`Thank you for your $${Number(donateForm.amount).toFixed(2)} donation!`);
      setShowDonateForm(false);
      setDonateForm({ amount: '', donationType: 'Monetary', campaignSource: '', notes: '', isRecurring: false, recurringFrequency: '' });
      await loadData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch {
      setError('Failed to submit donation.');
    } finally {
      setSubmitting(false);
    }
  }

  const donationsByMonth = donations.reduce<Record<string, number>>((acc, d) => {
    const key = new Date(d.donationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    acc[key] = (acc[key] || 0) + d.amount;
    return acc;
  }, {});
  const chartData = Object.entries(donationsByMonth).map(([month, total]) => ({ month, total })).reverse();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" style={{ color: 'var(--nh-primary)' }} />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1" style={{ color: 'var(--nh-heading)' }}>
            Welcome back, {user?.firstName || 'Donor'}
          </h2>
          <p className="text-muted mb-0">Your giving makes a difference in every girl's journey to healing.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowDonateForm(true)}>
          <Heart size={18} /> Make a Donation
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2">
          <Heart size={18} /> {successMsg}
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-circle p-2" style={{ background: 'rgba(107,91,149,0.1)' }}>
                <DollarSign size={24} style={{ color: 'var(--nh-primary)' }} />
              </div>
              <div>
                <div className="text-muted small">Total Donated</div>
                <div className="fw-bold fs-5">${(impact?.totalDonated ?? profile?.totalDonated ?? 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-circle p-2" style={{ background: 'rgba(136,176,75,0.1)' }}>
                <Gift size={24} style={{ color: '#88B04B' }} />
              </div>
              <div>
                <div className="text-muted small">Total Donations</div>
                <div className="fw-bold fs-5">{impact?.donationCount ?? donations.length}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-circle p-2" style={{ background: 'rgba(146,168,209,0.1)' }}>
                <Calendar size={24} style={{ color: '#92A8D1' }} />
              </div>
              <div>
                <div className="text-muted small">Member Since</div>
                <div className="fw-bold fs-5">
                  {profile?.joinedDate ? new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body d-flex align-items-center gap-3">
              <div className="rounded-circle p-2" style={{ background: 'rgba(0,155,119,0.1)' }}>
                <TrendingUp size={24} style={{ color: '#009B77' }} />
              </div>
              <div>
                <div className="text-muted small">Last Donation</div>
                <div className="fw-bold fs-5">
                  {impact?.lastDonation ? new Date(impact.lastDonation).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Donation History Chart */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0" style={{ color: 'var(--nh-heading)' }}>Your Giving Over Time</h5>
            </div>
            <div className="card-body">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v: number) => `$${v}`} />
                    <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Amount']} />
                    <Bar dataKey="total" fill="var(--nh-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-5">No donation data yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Impact Allocation Pie */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 pt-3">
              <h5 className="mb-0" style={{ color: 'var(--nh-heading)' }}>Where Your Gifts Go</h5>
            </div>
            <div className="card-body d-flex flex-column align-items-center">
              {impact?.allocations && impact.allocations.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={impact.allocations} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                        {impact.allocations.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 w-100">
                    {impact.allocations.map((a, i) => (
                      <div key={a.category} className="d-flex justify-content-between small mb-1">
                        <span><span className="me-2" style={{ color: COLORS[i % COLORS.length] }}>●</span>{a.category}</span>
                        <span className="fw-bold">${a.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-muted text-center py-5">Allocation data not available yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donation History Table */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-header bg-white border-0 pt-3">
          <h5 className="mb-0" style={{ color: 'var(--nh-heading)' }}>Donation History</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Campaign</th>
                  <th>Recurring</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted py-4">No donations yet. Make your first contribution!</td></tr>
                ) : (
                  donations.map(d => (
                    <tr key={d.id}>
                      <td>{new Date(d.donationDate).toLocaleDateString()}</td>
                      <td className="fw-bold">${d.amount.toLocaleString()}</td>
                      <td><span className="badge bg-light text-dark">{d.donationType}</span></td>
                      <td>{d.campaignSource || '—'}</td>
                      <td>
                        {d.isRecurring ? (
                          <span className="badge bg-success"><RefreshCw size={12} className="me-1" />{d.recurringFrequency}</span>
                        ) : '—'}
                      </td>
                      <td className="text-muted small">{d.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Donate Modal */}
      {showDonateForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h5 className="modal-title" style={{ color: 'var(--nh-heading)' }}>Make a Donation</h5>
                <button className="btn-close" onClick={() => setShowDonateForm(false)} />
              </div>
              <form onSubmit={handleDonate}>
                <div className="modal-body">
                  <p className="text-muted small mb-3">This is a simulated donation for demonstration purposes.</p>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Amount (USD) *</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input type="number" className="form-control" min="1" step="0.01" required
                        value={donateForm.amount} onChange={e => setDonateForm({ ...donateForm, amount: e.target.value })} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Donation Type</label>
                    <select className="form-select" value={donateForm.donationType}
                      onChange={e => setDonateForm({ ...donateForm, donationType: e.target.value })}>
                      <option value="Monetary">Monetary</option>
                      <option value="InKind">In-Kind</option>
                      <option value="Time">Time / Volunteer</option>
                      <option value="Skills">Skills</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Campaign</label>
                    <input type="text" className="form-control" placeholder="e.g., Spring Gala 2026"
                      value={donateForm.campaignSource} onChange={e => setDonateForm({ ...donateForm, campaignSource: e.target.value })} />
                  </div>
                  <div className="form-check mb-3">
                    <input type="checkbox" className="form-check-input" id="recurring"
                      checked={donateForm.isRecurring} onChange={e => setDonateForm({ ...donateForm, isRecurring: e.target.checked })} />
                    <label className="form-check-label" htmlFor="recurring">Make this recurring</label>
                  </div>
                  {donateForm.isRecurring && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Frequency</label>
                      <select className="form-select" value={donateForm.recurringFrequency}
                        onChange={e => setDonateForm({ ...donateForm, recurringFrequency: e.target.value })}>
                        <option value="">Select...</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Notes</label>
                    <textarea className="form-control" rows={2} placeholder="Optional message..."
                      value={donateForm.notes} onChange={e => setDonateForm({ ...donateForm, notes: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowDonateForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Processing...' : 'Submit Donation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}