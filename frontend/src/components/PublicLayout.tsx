import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CookieConsent } from './CookieConsent';

export default function PublicLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/impact', label: 'Our Impact' },
  ];

  return (
    <div className="d-flex flex-column min-vh-100 public-page">
      <a
        href="#main-content"
        className="visually-hidden-focusable position-absolute p-2 text-white"
        style={{ zIndex: 9999, background: 'var(--nh-heading)' }}
      >
        Skip to main content
      </a>
      <nav className="public-nav sticky-top" aria-label="Main navigation">
        <div className="container container-inspo d-flex justify-content-between align-items-center">
          <Link to="/" className="nav-brand d-flex align-items-center gap-2">
            <img src="/logo-nhyira-hands.png" alt="Nhyira Haven" className="brand-logo brand-logo--public" />
            <span className="nav-brand-text">Nhyira Haven</span>
          </Link>
          <div className="d-flex align-items-center gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link px-2${location.pathname === link.to ? ' fw-bold' : ''}`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/donor-login" className="btn btn-outline-primary btn-sm nav-cta">
              Donor Login
            </Link>
            {isAuthenticated ? (
              <Link to="/admin" className="btn btn-primary btn-sm nav-cta">
                Staff Portal
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm nav-cta">
                Staff Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main id="main-content" className="flex-grow-1" role="main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="container container-inspo">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="mb-3">Nhyira Haven</h5>
              <p className="small text-muted">
                Providing safehouses and rehabilitation services for survivors of trafficking
                and abuse across West Africa. Where healing begins.
              </p>
            </div>
            <div className="col-md-4">
              <h6 className="mb-3">Quick Links</h6>
              <div className="d-flex flex-column gap-1">
                <Link to="/">Home</Link>
                <Link to="/impact">Our Impact</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/donor-login">Donor Login</Link>
                <Link to="/login">Staff Login</Link>
              </div>
            </div>
            <div className="col-md-4">
              <h6 className="mb-3">Contact</h6>
              <p className="small mb-1 text-muted">Lagos, Nigeria</p>
              <p className="small mb-1 text-muted">admin@nhyirahaven.org</p>
            </div>
          </div>
          <hr style={{ borderColor: 'var(--nh-border)' }} />
          <p className="text-center small mb-0 text-muted">
            &copy; 2026 Nhyira Haven. All rights reserved.
          </p>
        </div>
      </footer>

      <CookieConsent />
    </div>
  );
}
