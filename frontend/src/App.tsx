import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfileSelect from './pages/ProfileSelect';
import RoadmapPage from './pages/RoadmapPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import SSOCallback from './pages/SSOCallback';
import ProgrammeOverview from './pages/ProgrammeOverview';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/"                    element={<LandingPage />} />
          <Route path="/login"               element={<LoginPage />} />
          <Route path="/register"            element={<RegisterPage />} />
          <Route path="/auth/callback"       element={<SSOCallback />} />

          {/* Programme Overview — accessible with and without login */}
          <Route path="/programme-overview"  element={<ProgrammeOverview />} />

          {/* Protected routes */}
          <Route path="/select-profile"      element={<ProtectedRoute><ProfileSelect /></ProtectedRoute>} />
          <Route path="/roadmap"             element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
          <Route path="/admin"               element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          <Route path="*"                    element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
