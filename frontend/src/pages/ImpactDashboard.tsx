import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardOverview, getDashboardMetrics, getSafehouses } from '../services/api';
import type { DashboardOverview, DashboardMetrics, Safehouse } from '../types/api';
import { Users, Building2, Heart, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function ImpactDashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardOverview().catch(() => null),
      getDashboardMetrics().catch(() => null),
      getSafehouses().catch(() => []),
    ]).then(([o, m, s]) => {
      setOverview(o);
      setMetrics(m);
      setSafehouses(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" style={{ color: 'var(--nh-primary)' }} />
        <p className="mt-3 text-muted">Loading impact data...</p>
      </div>
    );
  }

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const donationChartData = metrics?.donationsByMonth.map((d) => ({
    name: `${monthLabels[d.month - 1]} ${d.year}`,
    amount: d.total,
    count: d.count,
  })) ?? [];

  const safehouseChartData = safehouses.map((s) => ({
    name: s.name.length > 15 ? s.name.slice(0, 15) + '...' : s.name,
    residents: s.currentResidents,
  }));

  return (
    <div className="public-page">
      <section className="hero-section" style={{ padding: '3rem 0' }}>
        <div className="container">
          <p className="section-kicker">Impact Report</p>
          <h1 className="section-title">Our Impact</h1>
          <p className="section-subtitle type-body-md">Transparency and accountability. See how your support transforms lives.</p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row g-4 mb-5">
            {[
              { label: 'Girls Served', value: overview?.residents.total ?? 0, icon: <Users size={22} />, color: 'var(--nh-primary)' },
              { label: 'Active Residents', value: overview?.residents.active ?? 0, icon: <Heart size={22} />, color: 'var(--nh-secondary)' },
              { label: 'Safehouses', value: overview?.safehouses.total ?? 0, icon: <Building2 size={22} />, color: 'var(--nh-accent)' },
              { label: 'Total Supporters', value: overview?.supporters.total ?? 0, icon: <TrendingUp size={22} />, color: 'var(--nh-success)' },
            ].map((kpi) => (
              <div key={kpi.label} className="col-6 col-md-3">
                <div className="kpi-card text-center">
                  <div className="mb-2" style={{ color: kpi.color }}>{kpi.icon}</div>
                  <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value.toLocaleString()}</div>
                  <div className="kpi-label">{kpi.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 mb-5">
            <div className="col-12">
              <div className="nh-card p-4">
                <h5 className="fw-bold mb-3">Donations Over Time</h5>
                {donationChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={donationChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(val) => `$${Number(val).toLocaleString()}`} />
                      <Bar dataKey="amount" fill="#B85C38" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted text-center py-5">No donation data available</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-5">
            <p className="section-kicker">Capacity Snapshot</p>
            <h3 className="section-title fw-bold">Our Safehouses</h3>
            <div className="row g-3">
              {safehouses.slice(0, 6).map((sh) => {
                const pct = sh.capacity > 0 ? Math.round((sh.currentResidents / sh.capacity) * 100) : 0;
                return (
                  <div key={sh.id} className="col-md-4">
                    <div className="nh-card p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0">{sh.name}</h6>
                        <span className={`badge ${sh.isActive ? 'badge-active' : 'badge-completed'}`}>
                          {sh.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-muted small mb-2">{sh.location}</p>
                      <div className="d-flex justify-content-between small mb-1">
                        <span>Capacity</span>
                        <span className="fw-semibold">{sh.currentResidents}/{sh.capacity}</span>
                      </div>
                      <div className="progress" style={{ height: 6 }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: pct > 85 ? 'var(--nh-danger)' : pct > 60 ? 'var(--nh-accent)' : 'var(--nh-success)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {safehouseChartData.length > 0 && (
            <div className="nh-card p-4 mb-5">
              <h5 className="fw-bold mb-3">Residents by Safehouse</h5>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={safehouseChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="residents" fill="#1B6B6D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="text-center py-4" style={{ background: 'rgba(184,92,56,0.05)', borderRadius: 12 }}>
            <p className="section-kicker">Take Action</p>
            <h3 className="section-title">Want to Help?</h3>
            <p className="text-muted mb-3 type-body-sm">Your support directly funds shelter, education, and counseling for survivors.</p>
            <Link to="/login" className="btn btn-primary px-4">Get Involved</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
