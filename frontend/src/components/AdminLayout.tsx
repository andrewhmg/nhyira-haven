import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Heart,
  ClipboardList,
  Home,
  Building2,
  BarChart3,
  ShieldCheck,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

const sidebarLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/residents', icon: Users, label: 'Caseload', end: false },
  { to: '/admin/donors', icon: Heart, label: 'Donors & Support', end: false },
  { to: '/admin/recordings', icon: ClipboardList, label: 'Process Recordings', end: false },
  { to: '/admin/visits', icon: Home, label: 'Home Visits', end: false },
  { to: '/admin/safehouses', icon: Building2, label: 'Safehouses', end: false },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics', end: false },
  { to: '/admin/mfa-setup', icon: ShieldCheck, label: 'MFA Settings', end: false },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="d-flex">
      {sidebarOpen && (
        <div className="sidebar-overlay show" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`} aria-label="Staff navigation">
        <NavLink to="/" className="sidebar-brand d-flex align-items-center gap-2">
          <img src="/logo-nhyira-hands.png" alt="Nhyira Haven" className="brand-logo brand-logo--admin" />
          <span>Nhyira Haven</span>
        </NavLink>
        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <div className="text-white small fw-semibold">{user?.firstName} {user?.lastName}</div>
              <div className="small" style={{ opacity: 0.6 }}>{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-sm p-1"
              title="Logout"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-content flex-grow-1">
        <div className="d-lg-none p-3 bg-white border-bottom d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <NavLink to="/" className="d-flex align-items-center gap-2 text-decoration-none">
            <img src="/logo-nhyira-hands.png" alt="Nhyira Haven" className="brand-logo brand-logo--compact" />
            <span className="fw-bold" style={{ color: 'var(--nh-primary)' }}>Nhyira Haven</span>
          </NavLink>
        </div>
        <main className="p-4" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
