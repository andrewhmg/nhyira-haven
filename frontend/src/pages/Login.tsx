import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const mfaInputRef = useRef<HTMLInputElement>(null);

  const { login, verifyMfa } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (mfaRequired && mfaInputRef.current) {
      mfaInputRef.current.focus();
    }
  }, [mfaRequired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      navigate(result.role === 'Donor' ? '/donor' : '/admin');
    } else if (result.mfa) {
      setMfaRequired(true);
      setMfaToken(result.mfa.mfaToken);
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await verifyMfa(mfaToken, mfaCode);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error || 'Invalid code. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="d-flex align-items-center justify-content-center public-page staff-login-page w-100">
      <div style={{ maxWidth: 420, width: '100%', padding: '0 1rem' }}>
        <div className="nh-card p-4 p-md-5">
          <div className="text-center mb-4">
            <img src="/logo-nhyira-hands.png" alt="Nhyira Haven" className="brand-logo brand-logo--admin mx-auto mb-2" />
            <p className="section-kicker">Staff Portal</p>
            <h1 className="h3 fw-bold section-title">Nhyira Haven</h1>
            <p className="text-muted small type-body-sm">Staff portal login</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">{error}</div>
          )}

          {mfaRequired ? (
            <form onSubmit={handleMfaSubmit}>
              <div className="text-center mb-3">
                <ShieldCheck size={40} className="text-primary mb-2" />
                <p className="small text-muted">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
              <div className="mb-3">
                <label htmlFor="mfaCode" className="form-label small fw-semibold">Verification Code</label>
                <input
                  ref={mfaInputRef}
                  type="text"
                  className="form-control text-center fs-4 letter-spacing-2"
                  id="mfaCode"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 py-2"
                disabled={loading || mfaCode.length !== 6}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </button>
              <button
                type="button"
                className="btn btn-link btn-sm w-100 mt-2 text-muted"
                onClick={() => { setMfaRequired(false); setMfaCode(''); setMfaToken(''); setError(''); }}
              >
                &larr; Back to login
              </button>
            </form>
          ) : (
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
