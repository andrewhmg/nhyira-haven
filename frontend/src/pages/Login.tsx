import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
      navigate('/');
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="h3 text-primary fw-bold">Nhyira Haven</h1>
                  <p className="text-muted">Where healing begins</p>
                </div>

                <h2 className="h5 text-center mb-4">Sign in to your account</h2>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
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
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
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
                    <label htmlFor="rememberMe" className="form-check-label">
                      Remember me
                    </label>
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

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted mb-2">Test Accounts (IS 414)</p>
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>Email</th>
                          <th>Password</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><code className="small">admin@nhyirahaven.org</code></td>
                          <td><code className="small">NhyiraHaven2026!</code></td>
                          <td><span className="badge bg-danger">Admin</span></td>
                        </tr>
                        <tr>
                          <td><code className="small">staff@nhyirahaven.org</code></td>
                          <td><code className="small">NhyiraHaven2026!</code></td>
                          <td><span className="badge bg-success">Staff</span></td>
                        </tr>
                        <tr>
                          <td><code className="small">donor@example.com</code></td>
                          <td><code className="small">NhyiraHaven2026!</code></td>
                          <td><span className="badge bg-info">Donor</span></td>
                        </tr>
                        <tr>
                          <td><code className="small">secure@nhyirahaven.org</code></td>
                          <td><code className="small">NhyiraHaven2026!</code></td>
                          <td><span className="badge bg-warning">Admin + MFA</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="text-center">
                  <Link to="/" className="text-decoration-none">
                    ← Back to Home
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mt-3">
              <p className="text-muted small">
                Don't have an account?{' '}
                <a href="#" className="text-decoration-none">
                  Contact your administrator
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;