import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function DonorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="d-flex flex-column min-vh-100 public-page">
      <nav className="public-nav sticky-top" aria-label="Donor navigation">
        <div className="container container-inspo d-flex justify-content-between align-items-center">
          <Link to="/" className="nav-brand d-flex align-items-center gap-2">
            <img src="/logo-nhyira-hands.png" alt="Nhyira Haven" className="brand-logo brand-logo--public" />
            <span className="nav-brand-text">Nhyira Haven</span>
          </Link>
          <div className="d-flex align-items-center gap-3">
            <span className="small text-muted d-none d-sm-inline">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow-1 py-4" role="main">
        <div className="container" style={{ maxWidth: 960 }}>
          <Outlet />
        </div>
      </main>

      <footer className="public-footer">
        <div className="container container-inspo">
          <p className="text-center small mb-0 text-muted">
            &copy; 2026 Nhyira Haven. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
