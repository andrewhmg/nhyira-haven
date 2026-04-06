import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: 'calc(100vh - 200px)', padding: '2rem 0' }}
    >
      <div style={{ maxWidth: 420, width: '100%', padding: '0 1rem' }}>
        <div className="nh-card p-4 p-md-5 shadow-sm">
          <div className="text-center mb-4">
            <Heart size={36} fill="var(--nh-primary)" stroke="var(--nh-primary)" className="mb-2" />
            <h1 className="h3 fw-bold" style={{ color: 'var(--nh-primary)' }}>Nhyira Haven</h1>
            <p className="text-muted small">Staff Portal Login</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label small fw-semibold">Email address</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <label htmlFor="password" className="form-label small fw-semibold">Password</label>
                <a href="#" className="small text-muted text-decoration-none">Forgot password?</a>
              </div>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe" className="form-check-label small">Remember me</label>
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

          <div className="mt-3 text-center">
            <button
              className="btn btn-link btn-sm text-muted text-decoration-none"
              onClick={() => setShowTestAccounts(!showTestAccounts)}
            >
              Test Accounts {showTestAccounts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showTestAccounts && (
            <div className="mt-2">
              <div className="table-responsive">
                <table className="table table-sm table-bordered mb-0" style={{ fontSize: '0.75rem' }}>
                  <thead>
                    <tr><th>Email</th><th>Password</th><th>Role</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>admin@nhyirahaven.org</code></td>
                      <td><code>NhyiraHaven2026!</code></td>
                      <td><span className="badge bg-danger">Admin</span></td>
                    </tr>
                    <tr>
                      <td><code>staff@nhyirahaven.org</code></td>
                      <td><code>NhyiraHaven2026!</code></td>
                      <td><span className="badge bg-success">Staff</span></td>
                    </tr>
                    <tr>
                      <td><code>donor@example.com</code></td>
                      <td><code>NhyiraHaven2026!</code></td>
                      <td><span className="badge bg-info">Donor</span></td>
                    </tr>
                    <tr>
                      <td><code>secure@nhyirahaven.org</code></td>
                      <td><code>NhyiraHaven2026!</code></td>
                      <td><span className="badge badge-on-hold">MFA</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
