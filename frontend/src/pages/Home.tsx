import { useEffect, useState } from 'react';
import { getDashboardOverview } from '../services/api';
import type { DashboardOverview } from '../types/api';

function Home() {
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboardOverview();
        setDashboard(data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data. Is the API running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Connection Error</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Make sure the backend API is running:</p>
          <code className="d-block mt-2">cd backend && dotnet run</code>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4">Welcome to Nhyira Haven</h1>
        <p className="lead text-muted">Where healing begins</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Active Residents</h6>
              <h2 className="card-title text-primary">
                {dashboard?.residents.active ?? 0}
              </h2>
              <small className="text-muted">
                of {dashboard?.residents.total ?? 0} total
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Safehouses</h6>
              <h2 className="card-title text-success">
                {dashboard?.safehouses.total ?? 0}
              </h2>
              <small className="text-muted">Active locations</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Total Donations</h6>
              <h2 className="card-title text-info">
                ${dashboard?.donations.totalAmount?.toLocaleString() ?? '0'}
              </h2>
              <small className="text-muted">Lifetime total</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">At-Risk Donors</h6>
              <h2 className="card-title text-warning">
                {dashboard?.supporters.atRisk ?? 0}
              </h2>
              <small className="text-muted">
                of {dashboard?.supporters.total ?? 0} supporters
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Recent Donations</h5>
            </div>
            <div className="card-body">
              {dashboard?.donations.recent.length === 0 ? (
                <p className="text-muted">No recent donations</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {dashboard?.donations.recent.map((donation) => (
                    <li key={donation.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{donation.supporterName}</strong>
                        <br />
                        <small className="text-muted">
                          {new Date(donation.donationDate).toLocaleDateString()}
                        </small>
                      </div>
                      <span className="badge bg-success rounded-pill">
                        ${donation.amount.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Recent Incidents</h5>
            </div>
            <div className="card-body">
              {dashboard?.recentIncidents.length === 0 ? (
                <p className="text-muted">No recent incidents</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {dashboard?.recentIncidents.map((incident) => (
                    <li key={incident.id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{incident.residentName}</strong>
                          <br />
                          <small className="text-muted">{incident.incidentType}</small>
                        </div>
                        <span className={`badge ${
                          incident.severity === 'Critical' ? 'bg-danger' :
                          incident.severity === 'High' ? 'bg-warning' :
                          'bg-secondary'
                        }`}>
                          {incident.severity}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="row g-4 mt-4">
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Our Mission</h5>
              <p className="card-text">
                Providing safehouses and rehabilitation services for survivors of trafficking and abuse across West Africa.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Get Involved</h5>
              <p className="card-text">
                Join us in making a difference. Your support helps us provide care, education, and hope.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Our Impact</h5>
              <p className="card-text">
                Track how your contributions are transforming lives through our transparent reporting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home