import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import DonorLayout from './components/DonorLayout';
import ProtectedRoute from './components/ProtectedRoute';

const Landing = lazy(() => import('./pages/Landing'));
const ImpactDashboard = lazy(() => import('./pages/ImpactDashboard'));
const Login = lazy(() => import('./pages/Login'));
const DonorLogin = lazy(() => import('./pages/DonorLogin'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Residents = lazy(() => import('./pages/admin/Residents'));
const ResidentDetail = lazy(() => import('./pages/admin/ResidentDetail'));
const Donors = lazy(() => import('./pages/admin/Donors'));
const DonorDetail = lazy(() => import('./pages/admin/DonorDetail'));
const ProcessRecordings = lazy(() => import('./pages/admin/ProcessRecordings'));
const HomeVisitations = lazy(() => import('./pages/admin/HomeVisitations'));
const CaseConferences = lazy(() => import('./pages/admin/CaseConferences'));
const SafehouseManagement = lazy(() => import('./pages/admin/SafehouseManagement'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const MfaSetup = lazy(() => import('./pages/admin/MfaSetup'));

const DonorDashboard = lazy(() => import('./pages/donor/DonorDashboard'));

function PageFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div style={{ color: '#6B5D4F', fontSize: '0.95rem' }}>Loading…</div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Landing />} />
            <Route path="impact" element={<ImpactDashboard />} />
            <Route path="login" element={<Login />} />
            <Route path="donor-login" element={<DonorLogin />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="residents" element={<Residents />} />
            <Route path="residents/:id" element={<ResidentDetail />} />
            <Route path="donors" element={<Donors />} />
            <Route path="donors/:id" element={<DonorDetail />} />
            <Route path="recordings" element={<ProcessRecordings />} />
            <Route path="visits" element={<HomeVisitations />} />
            <Route path="home-visits" element={<HomeVisitations />} />
            <Route path="case-conferences" element={<CaseConferences />} />
            <Route path="safehouses" element={<SafehouseManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="mfa-setup" element={<MfaSetup />} />
          </Route>

          <Route
            path="/donor"
            element={
              <ProtectedRoute>
                <DonorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DonorDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
