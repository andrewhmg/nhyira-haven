import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { Supporter, Donation } from '../../types/api';
import { Mail, Phone, Globe, Calendar, DollarSign, Heart, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export default function DonorDashboard() {
  const { token } = useAuth();
  const [supporter, setSupporter] = useState<Supporter | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`${API_BASE_URL}/donor-portal/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError('Could not load your donor profile. Please contact support.');
          setLoading(false);
          return;
        }
        const data: Supporter = await res.json();
        setSupporter(data);
        setDonations(data.donations ?? []);
      } catch {
        setError('Unable to connect to server.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [token]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: 'var(--nh-primary)' }} />
        <p className="mt-3 text-muted">Loading your profile...</p>
      </div>
    );
  }

  if (error || !supporter) {
    return (
      <div className="text-center py-5">
        <p className="text-danger">{error || 'Profile not found.'}</p>
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

  const avgDonation = supporter.donationCount > 0
    ? Math.round(supporter.totalDonated / supporter.donationCount)
    : 0;

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">My Donations</h2>
        <p className="text-muted">Welcome back, {supporter.firstName}. Here is your donation history with Nhyira Haven.</p>
      </div>

      {/* Profile card */}
      <div className="nh-card p-4 mb-4">
        <div className="d-flex gap-3 align-items-start flex-wrap">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 64, height: 64, background: 'var(--nh-secondary)', color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}
          >
            {supporter.firstName[0]}{supporter.lastName[0]}
          </div>
          <div className="flex-grow-1">
            <h4 className="mb-1">{supporter.firstName} {supporter.lastName}</h4>
            <div className="d-flex flex-wrap gap-3 text-muted small">
              <span className="d-flex align-items-center gap-1"><Mail size={14} /> {supporter.email}</span>
              {supporter.phone && <span className="d-flex align-items-center gap-1"><Phone size={14} /> {supporter.phone}</span>}
              {supporter.country && <span className="d-flex align-items-center gap-1"><Globe size={14} /> {supporter.country}</span>}
              <span className="d-flex align-items-center gap-1"><Calendar size={14} /> Member since {formatDate(supporter.joinedDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="nh-card p-3 text-center">
            <DollarSign size={20} className="mb-1" style={{ color: 'var(--nh-success)' }} />
            <div className="text-muted small">Total Donated</div>
            <div className="fw-bold fs-5" style={{ color: 'var(--nh-success)' }}>${supporter.totalDonated.toLocaleString()}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="nh-card p-3 text-center">
            <Heart size={20} className="mb-1" style={{ color: 'var(--nh-primary)' }} />
            <div className="text-muted small">Donations Made</div>
            <div className="fw-bold fs-5">{supporter.donationCount}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="nh-card p-3 text-center">
            <TrendingUp size={20} className="mb-1" style={{ color: '#8B5CF6' }} />
            <div className="text-muted small">Avg. Donation</div>
            <div className="fw-bold fs-5">${avgDonation.toLocaleString()}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="nh-card p-3 text-center">
            <Calendar size={20} className="mb-1" style={{ color: '#B85C38' }} />
            <div className="text-muted small">Last Donation</div>
            <div className="fw-bold">{supporter.lastDonationDate ? formatDate(supporter.lastDonationDate) : 'N/A'}</div>
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
          <p className="text-muted">No donations recorded yet.</p>
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
                    <td className="small">{d.campaignSource || '\u2014'}</td>
                    <td>
                      {d.isRecurring
                        ? <span className="badge badge-teal">{d.recurringFrequency || 'Yes'}</span>
                        : <span className="small text-muted">No</span>
                      }
                    </td>
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
