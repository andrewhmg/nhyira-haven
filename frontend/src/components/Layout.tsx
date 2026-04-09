import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CookieConsent } from './CookieConsent'
import nhyiraLogo from '../assets/nhyira-haven-logo.svg'

function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Header */}
      <header className="bg-primary text-white py-3">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <Link to="/" className="text-white text-decoration-none fs-4 fw-bold d-flex align-items-center gap-2">
              <img src={nhyiraLogo} alt="Nhyira Haven" className="brand-logo brand-logo--compact" />
              <span>Nhyira Haven</span>
            </Link>
            <nav className="d-flex align-items-center gap-3">
              {isAuthenticated ? (
                <>
                  <span className="text-white-50">
                    Welcome, {user?.firstName}{' '}
                    <span className={`badge ${
                      user?.role === 'Admin' ? 'bg-danger' :
                      user?.role === 'Staff' ? 'bg-success' :
                      'bg-info'
                    }`}>
                      {user?.role}
                    </span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-light btn-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-outline-light btn-sm">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container text-center">
          <small>
            &copy; 2026 Nhyira Haven. All rights reserved.{' '}
            <Link to="/privacy" className="text-white-50">Privacy Policy</Link>
          </small>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  )
}

export default Layout