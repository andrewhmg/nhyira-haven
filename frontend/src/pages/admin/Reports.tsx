import { useEffect, useState } from 'react';
import { getDashboardMetrics, getDonationStats, getSafehouses, getResidents } from '../../services/api';
import type { DashboardMetrics, Safehouse, Resident } from '../../types/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#B85C38', '#1B6B6D', '#E8A838', '#2D8659', '#8B5CF6', '#C0392B', '#6c757d'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Tab = 'donations' | 'residents' | 'safehouses' | 'overview';

export default function Reports() {
  const [tab, setTab] = useState<Tab>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [donationStats, setDonationStats] = useState<{ totalAmount: number; totalByType: Array<{ type: string; count: number; total: number }>; recurringDonations: number; averageDonation: number; totalDonations: number } | null>(null);
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardMetrics().catch(() => null),
      getDonationStats().catch(() => null),
      getSafehouses().catch(() => []),
      getResidents().catch(() => []),
    ]).then(([m, ds, sh, r]) => {
      setMetrics(m);
      setDonationStats(ds);
      setSafehouses(sh);
      setResidents(r);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--nh-primary)' }} /></div>;
  }

  const donationByMonth = metrics?.donationsByMonth.map((d) => ({
    name: `${MONTH_LABELS[d.month - 1]} ${d.year}`,
    amount: d.total,
    count: d.count,
  })) ?? [];

  const donationByType = donationStats?.totalByType.map((t) => ({
    name: t.type,
    value: t.total,
    count: t.count,
  })) ?? [];

  const statusCounts: Record<string, number> = {};
  residents.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
  const statusChart = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const categoryCounts: Record<string, number> = {};
  residents.forEach((r) => { categoryCounts[r.caseCategory] = (categoryCounts[r.caseCategory] || 0) + 1; });
  const categoryChart = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'donations', label: 'Donation Trends' },
    { key: 'residents', label: 'Resident Outcomes' },
    { key: 'safehouses', label: 'Safehouse Comparison' },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Reports & Analytics</h2>
        <p className="text-muted mb-0 small">Data-driven insights across all operations</p>
      </div>

      <ul className="nav nav-tabs mb-4">
        {tabs.map((t) => (
          <li key={t.key} className="nav-item">
            <button
              className={`nav-link${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
              style={tab === t.key ? { color: 'var(--nh-primary)', borderBottomColor: 'var(--nh-primary)' } : {}}
            >
              {t.label}
            </button>
          </li>
        ))}
      </ul>

      {tab === 'overview' && (
        <div className="row g-4">
          <div className="col-md-3">
            <div className="kpi-card text-center">
              <div className="kpi-label">Total Donations</div>
              <div className="kpi-value" style={{ color: 'var(--nh-primary)' }}>${(donationStats?.totalAmount ?? 0).toLocaleString()}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="kpi-card text-center">
              <div className="kpi-label">Avg. Donation</div>
              <div className="kpi-value" style={{ color: 'var(--nh-secondary)' }}>${Math.round(donationStats?.averageDonation ?? 0).toLocaleString()}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="kpi-card text-center">
              <div className="kpi-label">Total Residents</div>
              <div className="kpi-value" style={{ color: 'var(--nh-accent)' }}>{residents.length}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="kpi-card text-center">
              <div className="kpi-label">Safehouses</div>
              <div className="kpi-value" style={{ color: 'var(--nh-success)' }}>{safehouses.length}</div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">Donations Over Time</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={donationByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                  <Line type="monotone" dataKey="amount" stroke="#B85C38" strokeWidth={2} dot={{ fill: '#B85C38' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-md-4">
            <div className="nh-card p-4 h-100">
              <h5 className="fw-bold mb-3">Resident Status</h5>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'donations' && (
        <div className="row g-4">
          <div className="col-md-8">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">Monthly Donation Volume</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={donationByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#B85C38" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-md-4">
            <div className="nh-card p-4 h-100">
              <h5 className="fw-bold mb-3">By Donation Type</h5>
              {donationByType.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={donationByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                      {donationByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                    <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-muted text-center py-4">No data</p>}
            </div>
          </div>
          <div className="col-12">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">Donation Count by Month</h5>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={donationByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1B6B6D" strokeWidth={2} dot={{ fill: '#1B6B6D' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {tab === 'residents' && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">By Case Status</h5>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {statusChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-md-6">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">By Case Category</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1B6B6D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-12">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">Status Breakdown</h5>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th style={{ fontSize: '0.8rem' }}>Status</th>
                      <th style={{ fontSize: '0.8rem' }}>Count</th>
                      <th style={{ fontSize: '0.8rem' }}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statusChart.map((s) => (
                      <tr key={s.name}>
                        <td className="small">{s.name}</td>
                        <td className="small fw-semibold">{s.value}</td>
                        <td className="small">{residents.length > 0 ? Math.round((s.value / residents.length) * 100) : 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'safehouses' && (
        <div className="row g-4">
          <div className="col-12">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">Safehouse Capacity Comparison</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={safehouses.map((s) => ({ name: s.name.length > 20 ? s.name.slice(0, 20) + '...' : s.name, Current: s.currentResidents, Capacity: s.capacity }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Current" fill="#B85C38" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Capacity" fill="#E8E0D8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="col-12">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">Safehouse Details</h5>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th style={{ fontSize: '0.8rem' }}>Name</th>
                      <th style={{ fontSize: '0.8rem' }}>Location</th>
                      <th style={{ fontSize: '0.8rem' }}>Residents</th>
                      <th style={{ fontSize: '0.8rem' }}>Capacity</th>
                      <th style={{ fontSize: '0.8rem' }}>Utilization</th>
                      <th style={{ fontSize: '0.8rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safehouses.map((s) => {
                      const pct = s.capacity > 0 ? Math.round((s.currentResidents / s.capacity) * 100) : 0;
                      return (
                        <tr key={s.id}>
                          <td className="small fw-semibold">{s.name}</td>
                          <td className="small">{s.location}</td>
                          <td className="small">{s.currentResidents}</td>
                          <td className="small">{s.capacity}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: 6 }}>
                                <div className="progress-bar" style={{ width: `${pct}%`, backgroundColor: pct > 85 ? 'var(--nh-danger)' : 'var(--nh-success)' }} />
                              </div>
                              <span className="small">{pct}%</span>
                            </div>
                          </td>
                          <td><span className={`badge ${s.isActive ? 'badge-active' : 'badge-completed'}`} style={{ fontSize: '0.7rem' }}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
