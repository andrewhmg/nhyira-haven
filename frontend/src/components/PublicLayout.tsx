import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CookieConsent } from './CookieConsent';
import { Heart } from 'lucide-react';

export default function PublicLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/impact', label: 'Our Impact' },
  ];

  return (
    <div className="d-flex flex-column min-vh-100 public-page">
      <a href="#main-content" className="visually-hidden-focusable position-absolute p-2 bg-primary text-white" style={{ zIndex: 9999 }}>
        Skip to main content
      </a>
      <nav className="public-nav sticky-top" aria-label="Main navigation">
        <div className="container d-flex justify-content-between align-items-center">
          <Link to="/" className="nav-brand d-flex align-items-center gap-2">
            <Heart size={24} fill="var(--nh-primary)" stroke="var(--nh-primary)" />
            Nhyira Haven
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
            <Link to="/privacy" className="nav-link px-2">Privacy</Link>
            {isAuthenticated ? (
              <Link to="/admin" className="btn btn-primary btn-sm">
                Staff Portal
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
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
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <h5 className="text-white mb-3" style={{ fontFamily: 'var(--nh-font-heading)' }}>
                Nhyira Haven
              </h5>
              <p className="small">
                Providing safehouses and rehabilitation services for survivors of trafficking
                and abuse across West Africa. Where healing begins.
              </p>
            </div>
            <div className="col-md-4">
              <h6 className="text-white mb-3">Quick Links</h6>
              <div className="d-flex flex-column gap-1">
                <Link to="/">Home</Link>
                <Link to="/impact">Our Impact</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/login">Staff Login</Link>
              </div>
            </div>
            <div className="col-md-4">
              <h6 className="text-white mb-3">Contact</h6>
              <p className="small mb-1">Lagos, Nigeria</p>
              <p className="small mb-1">admin@nhyirahaven.org</p>
            </div>
          </div>
          <hr style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
          <p className="text-center small mb-0">
            &copy; 2026 Nhyira Haven. All rights reserved.
          </p>
        </div>
      </footer>

      <CookieConsent />
    </div>
  );
}
