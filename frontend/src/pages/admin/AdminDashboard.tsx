import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardOverview, getDashboardMetrics, getSupporters, getResidents } from '../../services/api';
import type { DashboardOverview, DashboardMetrics, Supporter, Resident } from '../../types/api';
import KPICard from '../../components/common/KPICard';
import StatusBadge from '../../components/common/StatusBadge';
import MLInsightPanel, { MLMetric } from '../../components/ml/MLInsightPanel';
import { buildDonorFeatures, buildResidentFeatures, predictChurnRisk, predictEarlyWarning, predictReintegrationReadiness } from '../../services/mlApi';
import { Users, AlertTriangle, DollarSign, Activity, Plus, ClipboardList, Eye, Brain, Shield, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#B85C38', '#1B6B6D', '#E8A838', '#2D8659', '#8B5CF6', '#C0392B'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  // ML state
  const [mlChurnHighCount, setMlChurnHighCount] = useState<number | null>(null);
  const [mlRedRiskCount, setMlRedRiskCount] = useState<number | null>(null);
  const [mlNearReintegration, setMlNearReintegration] = useState<number | null>(null);
  const [mlLoading, setMlLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboardOverview().catch(() => null),
      getDashboardMetrics().catch(() => null),
    ]).then(([o, m]) => {
      setOverview(o);
      setMetrics(m);
      setLoading(false);
    });

    // Run ML predictions in background
    const runML = async () => {
      try {
        const [supporters, residents] = await Promise.all([
          getSupporters().catch(() => []),
          getResidents().catch(() => []),
        ]);

        // Churn analysis
        let highChurn = 0;
        const churnBatch = (supporters as Supporter[]).slice(0, 40).map(async (s) => {
          try {
            const result = await predictChurnRisk(buildDonorFeatures(s));
            if (result.risk_tier === 'High') highChurn++;
          } catch { /* skip */ }
        });
        await Promise.allSettled(churnBatch);
        setMlChurnHighCount(highChurn);

        // Risk analysis
        let redRisk = 0;
        let nearReintegration = 0;
        const active = (residents as Resident[]).filter((r) => r.status === 'Active').slice(0, 40);
        const riskBatch = active.map(async (r) => {
          try {
            const features = buildResidentFeatures(r);
            const [warning, readiness] = await Promise.allSettled([
              predictEarlyWarning(features),
              predictReintegrationReadiness(features),
            ]);
            if (warning.status === 'fulfilled' && warning.value.risk_level === 'Red') redRisk++;
            if (readiness.status === 'fulfilled' && readiness.value.ready_within_6mo_probability > 0.7) nearReintegration++;
          } catch { /* skip */ }
        });
        await Promise.allSettled(riskBatch);
        setMlRedRiskCount(redRisk);
        setMlNearReintegration(nearReintegration);
      } catch { /* ML unavailable */ }
      setMlLoading(false);
    };
    runML();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: 'var(--nh-primary)' }} />
      </div>
    );
  }

  const donationChart = metrics?.donationsByMonth.map((d) => ({
    name: `${MONTH_LABELS[d.month - 1]}`,
    amount: d.total,
    count: d.count,
  })) ?? [];

  const safehouseChart = metrics?.residentsBySafehouse.map((r, i) => ({
    name: `Safehouse ${r.safehouseId}`,
    value: r.count,
    fill: COLORS[i % COLORS.length],
  })) ?? [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Dashboard</h2>
          <p className="text-muted mb-0 small">Overview of operations and key metrics</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/residents" className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
            <Plus size={14} /> Add Resident
          </Link>
          <Link to="/admin/recordings" className="btn btn-sm btn-primary d-flex align-items-center gap-1">
            <ClipboardList size={14} /> Log Session
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <KPICard
            label="Active Residents"
            value={overview?.residents.active ?? 0}
            icon={<Users size={20} />}
            color="var(--nh-primary)"
          />
        </div>
        <div className="col-6 col-lg-3">
          <KPICard
            label="At-Risk Donors"
            value={overview?.supporters.atRisk ?? 0}
            icon={<AlertTriangle size={20} />}
            color={(overview?.supporters.atRisk ?? 0) > 0 ? 'var(--nh-danger)' : 'var(--nh-success)'}
          />
        </div>
        <div className="col-6 col-lg-3">
          <KPICard
            label="Total Donated"
            value={`$${(overview?.donations.totalAmount ?? 0).toLocaleString()}`}
            icon={<DollarSign size={20} />}
            color="var(--nh-success)"
          />
        </div>
        <div className="col-6 col-lg-3">
          <KPICard
            label="Total Supporters"
            value={overview?.supporters.total ?? 0}
            icon={<Activity size={20} />}
            color="var(--nh-secondary)"
          />
        </div>
      </div>

      {/* ML Intelligence Row */}
      {!mlLoading && (mlChurnHighCount !== null || mlRedRiskCount !== null || mlNearReintegration !== null) && (
        <div className="row g-3 mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center gap-2 mb-2">
              <Brain size={14} style={{ color: '#8B5CF6' }} />
              <span className="small fw-semibold" style={{ color: '#8B5CF6' }}>ML-Powered Insights</span>
            </div>
          </div>
          {mlChurnHighCount !== null && (
            <div className="col-6 col-lg-4">
              <KPICard
                label="ML: High Churn Risk Donors"
                value={mlChurnHighCount}
                icon={<AlertTriangle size={20} />}
                color={mlChurnHighCount > 0 ? 'var(--nh-danger)' : 'var(--nh-success)'}
              />
            </div>
          )}
          {mlRedRiskCount !== null && (
            <div className="col-6 col-lg-4">
              <KPICard
                label="ML: Red Risk Residents"
                value={mlRedRiskCount}
                icon={<Shield size={20} />}
                color={mlRedRiskCount > 0 ? 'var(--nh-danger)' : 'var(--nh-success)'}
              />
            </div>
          )}
          {mlNearReintegration !== null && (
            <div className="col-6 col-lg-4">
              <KPICard
                label="ML: Near Reintegration"
                value={mlNearReintegration}
                icon={<TrendingUp size={20} />}
                color="var(--nh-secondary)"
              />
            </div>
          )}
        </div>
      )}

      <div className="row g-4">
        {/* Left column */}
        <div className="col-lg-8">
          {/* Needs Attention */}
          {overview && (overview.recentIncidents.length > 0 || (overview.supporters.atRisk > 0)) && (
            <div className="nh-card p-3 mb-4" style={{ borderLeft: '4px solid var(--nh-danger)' }}>
              <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                <AlertTriangle size={16} className="text-danger" /> Needs Attention
              </h6>
              {overview.supporters.atRisk > 0 && (
                <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span className="small">{overview.supporters.atRisk} donors at risk of lapsing</span>
                  <Link to="/admin/donors" className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
                    <Eye size={12} /> View
                  </Link>
                </div>
              )}
              {overview.recentIncidents.slice(0, 3).map((inc) => (
                <div key={inc.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <div>
                    <span className="small fw-semibold">{inc.residentName}</span>
                    <span className="text-muted small ms-2">{inc.incidentType}</span>
                  </div>
                  <StatusBadge status={inc.severity} size="sm" />
                </div>
              ))}
            </div>
          )}

          {/* Donations Chart */}
          <div className="nh-card p-4 mb-4">
            <h6 className="fw-bold mb-3">Donations by Month</h6>
            {donationChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={donationChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#B85C38" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center py-4">No donation data</p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="col-lg-4">
          {/* Recent Donations */}
          <div className="nh-card p-3 mb-4">
            <h6 className="fw-bold mb-3">Recent Donations</h6>
            {overview?.donations.recent.length === 0 ? (
              <p className="text-muted small">No recent donations</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {overview?.donations.recent.slice(0, 5).map((d) => (
                  <div key={d.id} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                    <div>
                      <div className="small fw-semibold">{d.supporterName}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(d.donationDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="badge badge-active">${d.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            <Link to="/admin/donors" className="btn btn-sm btn-outline-primary w-100 mt-3">
              View All Donors
            </Link>
          </div>

          {/* Residents by Safehouse */}
          <div className="nh-card p-3 mb-4">
            <h6 className="fw-bold mb-3">Residents by Safehouse</h6>
            {safehouseChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={safehouseChart}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                  >
                    {safehouseChart.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted small text-center">No data</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="nh-card p-3">
            <h6 className="fw-bold mb-3">Quick Actions</h6>
            <div className="d-flex flex-column gap-2">
              <Link to="/admin/residents" className="btn btn-sm btn-outline-primary text-start">
                View Caseload Inventory
              </Link>
              <Link to="/admin/recordings" className="btn btn-sm btn-outline-secondary text-start">
                Log a Session
              </Link>
              <Link to="/admin/donors" className="btn btn-sm btn-outline-secondary text-start">
                View At-Risk Donors
              </Link>
              <Link to="/admin/reports" className="btn btn-sm btn-outline-secondary text-start">
                Reports & Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
