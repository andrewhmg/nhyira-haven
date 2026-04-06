import { Outlet, Link } from 'react-router-dom'

function Layout() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Header */}
      <header className="bg-primary text-white py-3">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <Link to="/" className="text-white text-decoration-none fs-4 fw-bold">
              Nhyira Haven
            </Link>
            <nav>
              <Link to="/login" className="btn btn-outline-light btn-sm">
                Login
              </Link>
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
          <small>&copy; 2026 Nhyira Haven. All rights reserved.</small>
        </div>
      </footer>
    </div>
  )
}

export default Layout