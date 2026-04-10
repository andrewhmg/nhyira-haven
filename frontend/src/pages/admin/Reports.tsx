import { useEffect, useState, useMemo } from 'react';
import { getDashboardMetrics, getDonationStats, getSafehouses, getResidents, getSupporters } from '../../services/api';
import type { DonationCategorySlice } from '../../services/api';
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
import { Calendar } from 'lucide-react';

const COLORS = ['#B85C38', '#1B6B6D', '#E8A838', '#2D8659', '#8B5CF6', '#C0392B', '#6c757d'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [
  { value: 'all', label: 'All Years' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
];

type Tab = 'donations' | 'residents' | 'safehouses' | 'overview' | 'ml-insights';

/** Helper to display the year label in chart titles */
function yearLabel(selectedYear: string): string {
  return selectedYear === 'all' ? 'All Years' : selectedYear;
}

/**
 * Build feature vector for the social-media conversion model.
 * Mirrors `social-media-conversion.ipynb`: one-hot categoricals with
 * `drop_first=True`, plus raw numeric + boolean fields. Dropped baseline
 * categories (which must NOT be sent as one-hot keys) are:
 *   platform=Facebook, post_type=Campaign, media_type=Carousel,
 *   day_of_week=Friday, sentiment_tone=Celebratory,
 *   content_topic=AwarenessRaising, call_to_action_type=DonateNow
 */
function buildSocialFeatures(opts: {
  platform: string;
  post_type: string;
  media_type?: string;
  day_of_week?: string;
  sentiment_tone?: string;
  content_topic?: string;
  call_to_action_type?: string;
  post_hour?: number;
  num_hashtags?: number;
  caption_length?: number;
  mentions_count?: number;
  follower_count_at_post?: number;
  has_call_to_action?: boolean;
  features_resident_story?: boolean;
  is_boosted?: boolean;
}): Record<string, number> {
  const f: Record<string, number> = {
    post_hour: opts.post_hour ?? 13,
    num_hashtags: opts.num_hashtags ?? 2,
    caption_length: opts.caption_length ?? 137,
    mentions_count: opts.mentions_count ?? 0,
    follower_count_at_post: opts.follower_count_at_post ?? 1543,
    has_call_to_action: opts.has_call_to_action ? 1 : 0,
    features_resident_story: opts.features_resident_story ? 1 : 0,
    is_boosted: opts.is_boosted ? 1 : 0,
  };
  const oneHot = (prefix: string, val: string | undefined, baseline: string) => {
    if (val && val !== baseline) f[`${prefix}_${val}`] = 1;
  };
  oneHot('platform', opts.platform, 'Facebook');
  oneHot('post_type', opts.post_type, 'Campaign');
  oneHot('media_type', opts.media_type ?? 'Photo', 'Carousel');
  oneHot('day_of_week', opts.day_of_week ?? 'Tuesday', 'Friday');
  oneHot('sentiment_tone', opts.sentiment_tone ?? 'Informative', 'Celebratory');
  oneHot('content_topic', opts.content_topic ?? 'SafehouseLife', 'AwarenessRaising');
  oneHot('call_to_action_type', opts.call_to_action_type ?? 'LearnMore', 'DonateNow');
  return f;
}

const SOCIAL_PLATFORMS = ['Facebook', 'Instagram', 'Twitter', 'WhatsApp', 'TikTok', 'LinkedIn', 'YouTube'];
const SOCIAL_POST_TYPES = ['Campaign', 'ImpactStory', 'EventPromotion', 'ThankYou', 'EducationalContent', 'FundraisingAppeal'];

export default function Reports() {
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedYear, setSelectedYear] = useState<string>(String(CURRENT_YEAR));
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [donationStats, setDonationStats] = useState<{
    totalAmount: number;
    totalByType: Array<{ type: string; count: number; total: number }>;
    valueByCategory?: DonationCategorySlice[];
    recurringDonations: number;
    averageDonation: number;
    totalDonations: number;
  } | null>(null);
  const [safehouses, setSafehouses] = useState<Safehouse[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  // ML state
  const [mlLoading, setMlLoading] = useState(true);
  const [churnSummary, setChurnSummary] = useState<{ high: number; medium: number; low: number }>({ high: 0, medium: 0, low: 0 });
  const [riskSummary, setRiskSummary] = useState<{ red: number; yellow: number; green: number }>({ red: 0, yellow: 0, green: 0 });
  const [roiResults, setRoiResults] = useState<AllocationROIResult[]>([]);
  const [postConversions, setPostConversions] = useState<Array<{ type: string; platform: string; probability: number; value: number }>>([]);
  const [leverEffects, setLeverEffects] = useState<Array<{ label: string; delta: number; direction: 'up' | 'down' }>>([]);
  const [leverBaseline, setLeverBaseline] = useState<number>(0);

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

        // Social media strategy grid — score every platform × post_type combo
        // using realistic in-distribution defaults (has CTA, Photo, Informative,
        // afternoon post, median follower count) so the model discriminates
        // meaningfully between combinations.
        const gridTasks = SOCIAL_PLATFORMS.flatMap((platform) =>
          SOCIAL_POST_TYPES.map(async (pType) => {
            try {
              const features = buildSocialFeatures({
                platform,
                post_type: pType,
                has_call_to_action: true,
              });
              const result = await predictPostConversion(features);
              return {
                type: pType.replace(/([A-Z])/g, ' $1').trim(),
                platform,
                probability: result.conversion_probability,
                value: result.estimated_donation_value_php ?? 0,
              };
            } catch {
              return null;
            }
          })
        );
        const gridResults = (await Promise.allSettled(gridTasks))
          .map((r) => (r.status === 'fulfilled' ? r.value : null))
          .filter((r): r is { type: string; platform: string; probability: number; value: number } => r !== null);
        setPostConversions(gridResults);

        // Lever impact analysis — take a reference post (Instagram /
        // FundraisingAppeal, CTA on, everything else at baseline) and measure
        // the marginal effect of each strategic lever. This tells admins which
        // single change would most improve their next post.
        const refOpts = {
          platform: 'Instagram',
          post_type: 'FundraisingAppeal',
          has_call_to_action: true,
        };
        const leverConfigs: Array<{ label: string; overrides: Parameters<typeof buildSocialFeatures>[0] }> = [
          { label: 'Boost the post (paid promotion)',          overrides: { ...refOpts, is_boosted: true } },
          { label: 'Use an Urgent tone',                       overrides: { ...refOpts, sentiment_tone: 'Urgent' } },
          { label: 'Feature a resident story',                 overrides: { ...refOpts, features_resident_story: true } },
          { label: 'Use Video instead of Photo',               overrides: { ...refOpts, media_type: 'Video' } },
          { label: 'Switch content topic to Donor Impact',     overrides: { ...refOpts, content_topic: 'DonorImpact' } },
          { label: 'Remove call-to-action',                    overrides: { ...refOpts, has_call_to_action: false } },
        ];
        try {
          const baselineResult = await predictPostConversion(buildSocialFeatures(refOpts));
          const baselineProba = baselineResult.conversion_probability;
          setLeverBaseline(baselineProba);

          const leverTasks = leverConfigs.map(async (cfg) => {
            try {
              const r = await predictPostConversion(buildSocialFeatures(cfg.overrides));
              const delta = r.conversion_probability - baselineProba;
              return { label: cfg.label, delta, direction: (delta >= 0 ? 'up' : 'down') as 'up' | 'down' };
            } catch {
              return null;
            }
          });
          const leverResults = (await Promise.allSettled(leverTasks))
            .map((r) => (r.status === 'fulfilled' ? r.value : null))
            .filter((r): r is { label: string; delta: number; direction: 'up' | 'down' } => r !== null)
            .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
          setLeverEffects(leverResults);
        } catch { /* skip lever analysis if baseline call fails */ }
        setMlLoading(false);
      };
      runMLAnalysis();
    });
  }, []);

  // ====== Year-filtered derived data ======

  const yearNum = selectedYear === 'all' ? null : Number(selectedYear);

  // Donations by month — filtered by selected year
  const donationByMonth = useMemo(() => {
    const raw = metrics?.donationsByMonth ?? [];
    const filtered = yearNum ? raw.filter((d) => d.year === yearNum) : raw;
    return filtered.map((d) => ({
      name: yearNum ? `${MONTH_LABELS[d.month - 1]}` : `${MONTH_LABELS[d.month - 1]} ${d.year}`,
      amount: d.total,
      count: d.count,
    }));
  }, [metrics, yearNum]);

  // Donation stats are aggregate — we can't year-filter them from the API,
  // so we show them as-is. The donation-by-type pie uses this.
  const donationByType = useMemo(() => {
    if (!donationStats) return [];
    return donationStats.valueByCategory && donationStats.valueByCategory.length > 0
      ? donationStats.valueByCategory.map((c) => ({ name: c.label, value: c.total, count: c.count }))
      : (donationStats.totalByType ?? []).map((t) => ({ name: t.type, value: t.total, count: t.count }));
  }, [donationStats]);

  // Residents — filtered by intake year
  const filteredResidents = useMemo(() => {
    if (!yearNum) return residents;
    return residents.filter((r) => {
      const intakeYear = new Date(r.intakeDate).getFullYear();
      return intakeYear === yearNum;
    });
  }, [residents, yearNum]);

  // Status distribution for filtered residents
  const statusChart = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    filteredResidents.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [filteredResidents]);

  // Category distribution for filtered residents
  const categoryChart = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    filteredResidents.forEach((r) => { categoryCounts[r.caseCategory] = (categoryCounts[r.caseCategory] || 0) + 1; });
    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, [filteredResidents]);

  // Reintegration success rate for filtered residents
  const reintegrationStats = useMemo(() => {
    const total = filteredResidents.length;
    const reintegrated = filteredResidents.filter((r) => {
      if (!r.reintegrationDate) return false;
      if (yearNum) {
        return new Date(r.reintegrationDate).getFullYear() === yearNum;
      }
      return true;
    }).length;
    const rate = total > 0 ? Math.round((reintegrated / total) * 100) : 0;
    return { total, reintegrated, rate };
  }, [filteredResidents, yearNum]);

  // Safehouse performance — resident counts per safehouse for the year
  const safehousePerformance = useMemo(() => {
    return safehouses.map((s) => {
      const shResidents = filteredResidents.filter((r) => r.safehouseId === s.id);
      const reintegrated = shResidents.filter((r) => !!r.reintegrationDate).length;
      return {
        name: s.name.length > 20 ? s.name.slice(0, 20) + '...' : s.name,
        fullName: s.name,
        Current: s.currentResidents,
        Capacity: s.capacity,
        Intake: shResidents.length,
        Reintegrated: reintegrated,
      };
    });
  }, [safehouses, filteredResidents]);

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--nh-primary)' }} /></div>;
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'donations', label: 'Donation Trends' },
    { key: 'residents', label: 'Resident Outcomes' },
    { key: 'safehouses', label: 'Safehouse Comparison' },
    { key: 'ml-insights', label: 'ML Insights' },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start align-items-md-center mb-4 flex-column flex-md-row gap-3">
        <div>
          <h2 className="mb-1">Reports & Analytics</h2>
          <p className="text-muted mb-0 small">Data-driven insights across all operations</p>
        </div>

        {/* Year Filter Dropdown */}
        <div className="d-flex align-items-center gap-2">
          <Calendar size={16} style={{ color: 'var(--nh-primary)', flexShrink: 0 }} />
          <select
            id="year-filter"
            className="form-select form-select-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              width: 'auto',
              minWidth: 130,
              borderColor: 'var(--nh-primary)',
              color: 'var(--nh-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            {YEAR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
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
              <div className="kpi-label">Residents ({yearLabel(selectedYear)})</div>
              <div className="kpi-value" style={{ color: 'var(--nh-accent)' }}>{filteredResidents.length}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="kpi-card text-center">
              <div className="kpi-label">Reintegration Rate</div>
              <div className="kpi-value" style={{ color: 'var(--nh-success)' }}>{reintegrationStats.rate}%</div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">Donations Over Time — {yearLabel(selectedYear)}</h5>
              {donationByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={donationByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                    <Line type="monotone" dataKey="amount" stroke="#B85C38" strokeWidth={2} dot={{ fill: '#B85C38' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-4">No donation data for {yearLabel(selectedYear)}</p>
              )}
            </div>
          </div>
          <div className="col-md-4">
            <div className="nh-card p-4 h-100">
              <h5 className="fw-bold mb-3">Resident Status — {yearLabel(selectedYear)}</h5>
              {statusChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {statusChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '0.7rem' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-4">No resident data for {yearLabel(selectedYear)}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'donations' && (
        <div className="row g-4">
          <div className="col-md-8">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">Monthly Donation Volume — {yearLabel(selectedYear)}</h5>
              {donationByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={donationByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#B85C38" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-4">No donation data for {yearLabel(selectedYear)}</p>
              )}
            </div>
          </div>
          <div className="col-md-4">
            <div className="nh-card p-4 h-100">
              <h5 className="fw-bold mb-3">By Contribution Type</h5>
              <p className="text-muted small mb-2">Cash gifts, in-kind goods (including itemized value), volunteer time, and other support.</p>
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
              <h5 className="fw-bold mb-3">Donation Count by Month — {yearLabel(selectedYear)}</h5>
              {donationByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={donationByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#1B6B6D" strokeWidth={2} dot={{ fill: '#1B6B6D' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-4">No donation data for {yearLabel(selectedYear)}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'residents' && (
        <div className="row g-4">
          {/* Reintegration Success KPI */}
          <div className="col-12">
            <div className="nh-card p-4 d-flex align-items-center gap-4 flex-wrap">
              <div>
                <div className="text-muted small">Reintegration Success Rate — {yearLabel(selectedYear)}</div>
                <div className="fw-bold" style={{ fontSize: '2rem', color: reintegrationStats.rate >= 50 ? 'var(--nh-success)' : 'var(--nh-danger)' }}>
                  {reintegrationStats.rate}%
                </div>
              </div>
              <div style={{ borderLeft: '1px solid #E8E0D8', paddingLeft: 16 }}>
                <div className="text-muted small">Total Residents</div>
                <div className="fw-bold" style={{ fontSize: '1.5rem' }}>{reintegrationStats.total}</div>
              </div>
              <div style={{ borderLeft: '1px solid #E8E0D8', paddingLeft: 16 }}>
                <div className="text-muted small">Successfully Reintegrated</div>
                <div className="fw-bold" style={{ fontSize: '1.5rem', color: 'var(--nh-success)' }}>{reintegrationStats.reintegrated}</div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">By Case Status — {yearLabel(selectedYear)}</h5>
              {statusChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {statusChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-4">No resident data for {yearLabel(selectedYear)}</p>
              )}
            </div>
          </div>
          <div className="col-md-6">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">By Case Category — {yearLabel(selectedYear)}</h5>
              {categoryChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryChart} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#1B6B6D" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-4">No resident data for {yearLabel(selectedYear)}</p>
              )}
            </div>
          </div>
          <div className="col-12">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">Status Breakdown — {yearLabel(selectedYear)}</h5>
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
                    {statusChart.length > 0 ? statusChart.map((s) => (
                      <tr key={s.name}>
                        <td className="small">{s.name}</td>
                        <td className="small fw-semibold">{s.value}</td>
                        <td className="small">{filteredResidents.length > 0 ? Math.round((s.value / filteredResidents.length) * 100) : 0}%</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} className="text-muted text-center py-3">No data for {yearLabel(selectedYear)}</td></tr>
                    )}
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
                <BarChart data={safehousePerformance}>
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

          {/* Intake & Reintegration per Safehouse — year-filtered */}
          <div className="col-12">
            <div className="nh-card p-4">
              <h5 className="fw-bold mb-3">Safehouse Intake & Reintegration — {yearLabel(selectedYear)}</h5>
              {safehousePerformance.some((s) => s.Intake > 0 || s.Reintegrated > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={safehousePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Intake" fill="#1B6B6D" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Reintegrated" fill="#2D8659" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted text-center py-4">No intake/reintegration data for {yearLabel(selectedYear)}</p>
              )}
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
                <p className="small text-muted mb-3">
                  Predicted next-month outcome with $10,000 allocated toward each program area.
                  Each metric uses its own scale — bars are not comparable across panels.
                </p>
                {(() => {
                  const metricConfig: Record<string, { label: string; unit: string; domain: [number, number]; color: string; betterIsHigher: boolean }> = {
                    education: { label: 'Education Progress', unit: '% (0–100)', domain: [0, 100], color: '#2D8659', betterIsHigher: true },
                    health:    { label: 'Health Score',       unit: 'score (1–5)', domain: [0, 5],   color: '#3B82F6', betterIsHigher: true },
                    incidents: { label: 'Incident Count',     unit: 'incidents / month', domain: [0, 10], color: '#E8A838', betterIsHigher: false },
                  };
                  return (
                    <div className="d-flex flex-column gap-3">
                      {roiResults.map((r) => {
                        const cfg = metricConfig[r.target_metric] ?? { label: r.target_metric, unit: '', domain: [0, 100] as [number, number], color: '#8B5CF6', betterIsHigher: true };
                        const value = Number(r.predicted_outcome.toFixed(2));
                        return (
                          <div key={r.target_metric}>
                            <div className="d-flex justify-content-between align-items-baseline mb-1">
                              <span className="small fw-semibold">{cfg.label}</span>
                              <span className="small text-muted">
                                {cfg.unit}{!cfg.betterIsHigher && ' · lower is better'}
                              </span>
                            </div>
                            <ResponsiveContainer width="100%" height={70}>
                              <BarChart data={[{ name: cfg.label, value }]} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" horizontal={false} />
                                <XAxis type="number" domain={cfg.domain} tick={{ fontSize: 10 }} />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip formatter={(v: number) => [`${v} ${cfg.unit}`, cfg.label]} />
                                <Bar dataKey="value" fill={cfg.color} radius={[0, 4, 4, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </MLInsightPanel>
            </div>
          )}

          {/* Social Media Strategy Optimizer */}
          {postConversions.length > 0 && (
            <div className="col-md-6">
              <MLInsightPanel title="Social Media Strategy Optimizer" loading={mlLoading}>
                <p className="small text-muted mb-3">
                  Model-predicted donation conversion across all platform × post-type combinations,
                  holding other features at realistic defaults (CTA included, photo media, informative tone, afternoon post).
                </p>

                <h6 className="small fw-semibold mb-2" style={{ color: 'var(--nh-primary)' }}>Top Content Strategies</h6>
                <div className="table-responsive mb-3">
                  <table className="table table-sm table-hover mb-0">
                    <thead>
                      <tr>
                        <th style={{ fontSize: '0.75rem' }}>Post Type</th>
                        <th style={{ fontSize: '0.75rem' }}>Platform</th>
                        <th style={{ fontSize: '0.75rem' }}>Conversion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...postConversions]
                        .sort((a, b) => b.probability - a.probability)
                        .slice(0, 8)
                        .map((pc, i) => (
                          <tr key={i}>
                            <td className="small">{pc.type}</td>
                            <td className="small">{pc.platform}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="progress flex-grow-1" style={{ height: 6 }}>
                                  <div className="progress-bar" style={{ width: `${pc.probability * 100}%`, backgroundColor: pc.probability > 0.5 ? '#2D8659' : '#E8A838' }} />
                                </div>
                                <span className="small" style={{ minWidth: 36, textAlign: 'right' }}>{(pc.probability * 100).toFixed(0)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {leverEffects.length > 0 && (
                  <>
                    <h6 className="small fw-semibold mb-1" style={{ color: 'var(--nh-primary)' }}>Lever Impact Analysis</h6>
                    <p className="small text-muted mb-2" style={{ fontSize: '0.7rem' }}>
                      Marginal effect on conversion of changing one feature on a reference post
                      (Instagram FundraisingAppeal, baseline {(leverBaseline * 100).toFixed(0)}%).
                      Bars show percentage-point change.
                    </p>
                    <div className="d-flex flex-column gap-1">
                      {leverEffects.map((lev, i) => {
                        const pp = lev.delta * 100;
                        const magnitude = Math.min(Math.abs(pp), 60);
                        const color = lev.direction === 'up' ? '#2D8659' : '#C0392B';
                        return (
                          <div key={i} className="d-flex align-items-center gap-2">
                            <span className="small" style={{ flex: '0 0 55%', fontSize: '0.72rem' }}>{lev.label}</span>
                            <div className="flex-grow-1 position-relative" style={{ height: 14, backgroundColor: '#F5EFE6', borderRadius: 3 }}>
                              <div style={{
                                position: 'absolute',
                                left: lev.direction === 'up' ? '50%' : `${50 - (magnitude / 60) * 50}%`,
                                width: `${(magnitude / 60) * 50}%`,
                                height: '100%',
                                backgroundColor: color,
                                borderRadius: 2,
                              }} />
                              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, backgroundColor: '#aaa' }} />
                            </div>
                            <span className="small fw-semibold" style={{ flex: '0 0 52px', textAlign: 'right', fontSize: '0.72rem', color }}>
                              {pp >= 0 ? '+' : ''}{pp.toFixed(0)}pp
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </MLInsightPanel>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
