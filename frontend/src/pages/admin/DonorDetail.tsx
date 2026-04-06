import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSupporter, getDonations } from '../../services/api';
import type { Supporter, Donation } from '../../types/api';
import StatusBadge from '../../components/common/StatusBadge';
import { ArrowLeft, AlertTriangle, Mail, Phone, Globe, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DonorDetail() {
  const { id } = useParams();
  const [supporter, setSupporter] = useState<Supporter | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const sid = Number(id);
    Promise.all([
      getSupporter(sid).catch(() => null),
      getDonations({ supporterId: sid }).catch(() => []),
    ]).then(([s, d]) => {
      setSupporter(s);
      setDonations(d);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border" style={{ color: 'var(--nh-primary)' }} /></div>;
  }

  if (!supporter) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">Supporter not found.</p>
        <Link to="/admin/donors" className="btn btn-primary">Back to Donors</Link>
      </div>
    );
  }

  const formatDate = (d: string) => {
    try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; }
  };

  const donationsByMonth: Record<string, number> = {};
  donations.forEach((d) => {
    const key = format(new Date(d.donationDate), 'MMM yyyy');
    donationsByMonth[key] = (donationsByMonth[key] || 0) + d.amount;
  });
  const chartData = Object.entries(donationsByMonth).map(([name, amount]) => ({ name, amount }));

  return (
    <div>
      <Link to="/admin/donors" className="text-decoration-none small d-inline-flex align-items-center gap-1 mb-3" style={{ color: 'var(--nh-text-muted)' }}>
        <ArrowLeft size={14} /> Back to Donors
      </Link>

      <div className="nh-card p-4 mb-4">
        <div className="d-flex gap-3 align-items-start flex-wrap">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 64, height: 64, background: 'var(--nh-secondary)', color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}
          >
            {supporter.firstName[0]}{supporter.lastName[0]}
          </div>
          <div className="flex-grow-1">
            <h3 className="mb-1">{supporter.firstName} {supporter.lastName}</h3>
            <div className="d-flex flex-wrap gap-3 text-muted small mb-2">
              <span className="d-flex align-items-center gap-1"><Mail size={14} /> {supporter.email}</span>
              {supporter.phone && <span className="d-flex align-items-center gap-1"><Phone size={14} /> {supporter.phone}</span>}
              {supporter.country && <span className="d-flex align-items-center gap-1"><Globe size={14} /> {supporter.country}</span>}
              <span className="d-flex align-items-center gap-1"><Calendar size={14} /> Joined: {formatDate(supporter.joinedDate)}</span>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <StatusBadge status={supporter.isActive ? 'Active' : 'Inactive'} />
              <span className="badge badge-teal">{supporter.supporterType}</span>
              {supporter.isAtRisk && (
                <span className="badge badge-at-risk d-flex align-items-center gap-1">
                  <AlertTriangle size={10} /> At Risk
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="row g-3 mt-3 pt-3 border-top">
          <div className="col-md-3">
            <div className="text-muted small">Total Donated</div>
            <div className="fw-bold fs-5" style={{ color: 'var(--nh-success)' }}>${supporter.totalDonated.toLocaleString()}</div>
          </div>
          <div className="col-md-3">
            <div className="text-muted small">Donations Made</div>
            <div className="fw-bold fs-5">{supporter.donationCount}</div>
          </div>
          <div className="col-md-3">
            <div className="text-muted small">Avg. Donation</div>
            <div className="fw-bold fs-5">${supporter.donationCount > 0 ? Math.round(supporter.totalDonated / supporter.donationCount).toLocaleString() : 0}</div>
          </div>
          <div className="col-md-3">
            <div className="text-muted small">Last Donation</div>
            <div className="fw-bold">{supporter.lastDonationDate ? formatDate(supporter.lastDonationDate) : '—'}</div>
          </div>
        </div>
      </div>

      {/* Donation trend chart */}
      {chartData.length > 0 && (
        <div className="nh-card p-4 mb-4">
          <h5 className="fw-bold mb-3">Donation History</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              <Bar dataKey="amount" fill="#B85C38" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Donation table */}
      <div className="nh-card p-4">
        <h5 className="fw-bold mb-3">All Donations ({donations.length})</h5>
        {donations.length === 0 ? (
          <p className="text-muted">No donations recorded.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{ fontSize: '0.8rem' }}>Date</th>
                  <th style={{ fontSize: '0.8rem' }}>Amount</th>
                  <th style={{ fontSize: '0.8rem' }}>Type</th>
                  <th style={{ fontSize: '0.8rem' }}>Campaign</th>
                  <th style={{ fontSize: '0.8rem' }}>Recurring</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d.id}>
                    <td className="small">{formatDate(d.donationDate)}</td>
                    <td className="small fw-semibold">${d.amount.toLocaleString()}</td>
                    <td className="small">{d.donationType}</td>
                    <td className="small">{d.campaignSource || '—'}</td>
                    <td>{d.isRecurring ? <span className="badge badge-teal">{d.recurringFrequency || 'Yes'}</span> : <span className="small text-muted">No</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
