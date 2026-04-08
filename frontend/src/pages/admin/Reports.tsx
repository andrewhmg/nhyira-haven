import { useEffect, useState } from 'react';
import { getDashboardMetrics, getDonationStats, getSafehouses, getResidents, getSupporters } from '../../services/api';
import type { DashboardMetrics, Safehouse, Resident, Supporter } from '../../types/api';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import MLInsightPanel, { MLMetric } from '../../components/ml/MLInsightPanel';
import {
  buildDonorFeatures, buildResidentFeatures,
  predictChurnRisk, predictAllocationROI, predictPostConversion, predictEarlyWarning,
  type AllocationROIResult,
} from '../../services/mlApi';
const COLORS = ['#B85C38', '#1B6B6D', '#E8A838', '#2D8659', '#8B5CF6', '#C0392B', '#6c757d'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Tab = 'donations' | 'residents' | 'safehouses' | 'overview' | 'ml-insights';

export default function Reports() {
  const [tab, setTab] = useState<Tab>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [donationStats, setDonationStats] = useState<{ totalAmount: number; totalByType: Array<{ type: string; count: number; total: number }>; recurringDonations: number; averageDonation: number; totalDonations: number } | null>(null);
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  // ML state
  const [mlLoading, setMlLoading] = useState(true);
  const [churnSummary, setChurnSummary] = useState<{ high: number; medium: number; low: number }>({ high: 0, medium: 0, low: 0 });
  const [riskSummary, setRiskSummary] = useState<{ red: number; yellow: number; green: number }>({ red: 0, yellow: 0, green: 0 });
  const [roiResults, setRoiResults] = useState<AllocationROIResult[]>([]);
  const [postConversions, setPostConversions] = useState<Array<{ type: string; platform: string; probability: number; value: number }>>([]);

  useEffect(() => {
    Promise.all([
      getDashboardMetrics().catch(() => null),
      getDonationStats().catch(() => null),
      getSafehouses().catch(() => []),
      getResidents().catch(() => []),
      getSupporters().catch(() => []),
    ]).then(([m, ds, sh, r, supporters]) => {
      setMetrics(m);
      setDonationStats(ds);
      setSafehouses(sh);
      setResidents(r);
      setLoading(false);

      // ML batch analysis (non-blocking)
      const runMLAnalysis = async () => {
        // Donor churn summary
        const churnCounts = { high: 0, medium: 0, low: 0 };
        const churnBatch = (supporters as Supporter[]).slice(0, 50).map(async (s) => {
          try {
            const features = buildDonorFeatures(s);
            const result = await predictChurnRisk(features);
            if (result.risk_tier === 'High') churnCounts.high++;
            else if (result.risk_tier === 'Medium') churnCounts.medium++;
            else churnCounts.low++;
          } catch { /* skip */ }
        });
        await Promise.allSettled(churnBatch);
        setChurnSummary({ ...churnCounts });

        // Resident risk summary
        const riskCounts = { red: 0, yellow: 0, green: 0 };
        const activeResidents = (r as Resident[]).filter((res) => res.status === 'Active').slice(0, 50);
        const riskBatch = activeResidents.map(async (res) => {
          try {
            const features = buildResidentFeatures(res);
            const result = await predictEarlyWarning(features);
            if (result.risk_level === 'Red') riskCounts.red++;
            else if (result.risk_level === 'Yellow') riskCounts.yellow++;
            else riskCounts.green++;
          } catch { /* skip */ }
        });
        await Promise.allSettled(riskBatch);
        setRiskSummary({ ...riskCounts });

        // Allocation ROI predictions
        const roiTargets: Array<'education' | 'health' | 'incidents'> = ['education', 'health', 'incidents'];
        const roiPredictions: AllocationROIResult[] = [];
        for (const target of roiTargets) {
          try {
            const result = await predictAllocationROI({
              total_funding: 10000,
              staff_count: 5,
              resident_count: 20,
              funding_per_resident: 500,
            }, target);
            roiPredictions.push(result);
          } catch { /* skip */ }
        }
        setRoiResults(roiPredictions);

        // Social media conversion analysis
        const postTypes = ['FundraisingAppeal', 'ImpactStory', 'VolunteerSpotlight', 'EventPromotion', 'EducationalContent'];
        const platforms = ['Instagram', 'Facebook', 'Twitter'];
        const conversions: Array<{ type: string; platform: string; probability: number; value: number }> = [];
        for (const pType of postTypes) {
          for (const platform of platforms) {
            try {
              const features: Record<string, number> = {
                [`platform_${platform}`]: 1,
                [`post_type_${pType}`]: 1,
                likes: 50,
                shares: 10,
                comments: 5,
                reach: 500,
              };
              const result = await predictPostConversion(features);
              conversions.push({
                type: pType.replace(/([A-Z])/g, ' $1').trim(),
                platform,
                probability: result.conversion_probability,
                value: result.estimated_donation_value_php ?? 0,
              });
            } catch { /* skip */ }
          }
        }
        setPostConversions(conversions);
        setMlLoading(false);
      };
      runMLAnalysis();
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
    { key: 'ml-insights', label: 'ML Insights' },
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

      {tab === 'ml-insights' && (
        <div className="row g-4">
          {/* Donor Churn Portfolio */}
          <div className="col-md-6">
            <MLInsightPanel title="Donor Churn Portfolio" loading={mlLoading}>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <MLMetric label="High Risk" value={churnSummary.high} color="#C0392B" sublabel="donors" />
                </div>
                <div className="col-4">
                  <MLMetric label="Medium Risk" value={churnSummary.medium} color="#E8A838" sublabel="donors" />
                </div>
                <div className="col-4">
                  <MLMetric label="Low Risk" value={churnSummary.low} color="#2D8659" sublabel="donors" />
                </div>
              </div>
              {(churnSummary.high + churnSummary.medium + churnSummary.low) > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'High Risk', value: churnSummary.high, fill: '#C0392B' },
                        { name: 'Medium Risk', value: churnSummary.medium, fill: '#E8A838' },
                        { name: 'Low Risk', value: churnSummary.low, fill: '#2D8659' },
                      ].filter((d) => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      innerRadius={35}
                    >
                      {[
                        { fill: '#C0392B' },
                        { fill: '#E8A838' },
                        { fill: '#2D8659' },
                      ].map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </MLInsightPanel>
          </div>

          {/* Resident Risk Distribution */}
          <div className="col-md-6">
            <MLInsightPanel title="Resident Risk Distribution" loading={mlLoading}>
              <div className="row g-3 mb-3">
                <div className="col-4">
                  <MLMetric label="Red (High)" value={riskSummary.red} color="#C0392B" sublabel="residents" />
                </div>
                <div className="col-4">
                  <MLMetric label="Yellow (Medium)" value={riskSummary.yellow} color="#E8A838" sublabel="residents" />
                </div>
                <div className="col-4">
                  <MLMetric label="Green (Low)" value={riskSummary.green} color="#2D8659" sublabel="residents" />
                </div>
              </div>
              {(riskSummary.red + riskSummary.yellow + riskSummary.green) > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={[
                    { name: 'Red', count: riskSummary.red, fill: '#C0392B' },
                    { name: 'Yellow', count: riskSummary.yellow, fill: '#E8A838' },
                    { name: 'Green', count: riskSummary.green, fill: '#2D8659' },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {[{ fill: '#C0392B' }, { fill: '#E8A838' }, { fill: '#2D8659' }].map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </MLInsightPanel>
          </div>

          {/* Allocation ROI Comparison */}
          {roiResults.length > 0 && (
            <div className="col-md-6">
              <MLInsightPanel title="Allocation ROI Predictions" loading={mlLoading}>
                <p className="small text-muted mb-3">Predicted outcome improvement from $10,000 allocation to each program area</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={roiResults.map((r) => ({
                    name: r.target_metric.charAt(0).toUpperCase() + r.target_metric.slice(1),
                    outcome: Number(r.predicted_outcome.toFixed(1)),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="outcome" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </MLInsightPanel>
            </div>
          )}

          {/* Social Media Conversion */}
          {postConversions.length > 0 && (
            <div className="col-md-6">
              <MLInsightPanel title="Social Media Conversion Predictions" loading={mlLoading}>
                <p className="small text-muted mb-3">Predicted donation conversion probability by post type and platform</p>
                <div className="table-responsive">
                  <table className="table table-sm table-hover mb-0">
                    <thead>
                      <tr>
                        <th style={{ fontSize: '0.75rem' }}>Post Type</th>
                        <th style={{ fontSize: '0.75rem' }}>Platform</th>
                        <th style={{ fontSize: '0.75rem' }}>Conversion %</th>
                        <th style={{ fontSize: '0.75rem' }}>Est. Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {postConversions
                        .sort((a, b) => b.probability - a.probability)
                        .slice(0, 10)
                        .map((pc, i) => (
                          <tr key={i}>
                            <td className="small">{pc.type}</td>
                            <td className="small">{pc.platform}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: 6 }}>
                                  <div className="progress-bar" style={{ width: `${pc.probability * 100}%`, backgroundColor: pc.probability > 0.5 ? '#2D8659' : '#E8A838' }} />
                                </div>
                                <span className="small">{(pc.probability * 100).toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="small fw-semibold">{pc.value > 0 ? `$${Math.round(pc.value).toLocaleString()}` : '—'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </MLInsightPanel>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
