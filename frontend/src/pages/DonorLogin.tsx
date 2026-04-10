import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DonorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate('/donor');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="d-flex align-items-center justify-content-center public-page w-100" style={{ minHeight: '70vh' }}>
      <div style={{ maxWidth: 420, width: '100%', padding: '0 1rem' }}>
        <div className="nh-card p-4 p-md-5">
          <div className="text-center mb-4">
            <img src="/logo-nhyira-hands.png" alt="Nhyira Haven" className="brand-logo brand-logo--admin mx-auto mb-2" />
            <p className="section-kicker">Donor Portal</p>
            <h1 className="h3 fw-bold section-title">Welcome Back</h1>
            <p className="text-muted small type-body-sm">Sign in to view your donations</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="donor-email" className="form-label small fw-semibold">Email address</label>
              <input
                type="email"
                className="form-control"
                id="donor-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div className="mb-3">
              <label htmlFor="donor-password" className="form-label small fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                id="donor-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>


          <hr className="my-3" />
          <div className="text-center">
            <Link to="/" className="small text-decoration-none text-muted">
              &larr; Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
