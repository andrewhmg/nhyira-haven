import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import AdminLayout from './components/AdminLayout';
import DonorLayout from './components/DonorLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import ImpactDashboard from './pages/ImpactDashboard';
import Login from './pages/Login';
import DonorLogin from './pages/DonorLogin';
import PrivacyPolicy from './pages/PrivacyPolicy';

import AdminDashboard from './pages/admin/AdminDashboard';
import Residents from './pages/admin/Residents';
import ResidentDetail from './pages/admin/ResidentDetail';
import Donors from './pages/admin/Donors';
import DonorDetail from './pages/admin/DonorDetail';
import ProcessRecordings from './pages/admin/ProcessRecordings';
import HomeVisitations from './pages/admin/HomeVisitations';
import SafehouseManagement from './pages/admin/SafehouseManagement';
import Reports from './pages/admin/Reports';
import MfaSetup from './pages/admin/MfaSetup';

import DonorDashboard from './pages/donor/DonorDashboard';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
