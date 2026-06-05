import { Navigate, Route, Routes } from 'react-router-dom';
import AlbaLayout from './components/AlbaLayout';
import AppLayout from './components/AppLayout';
import { useAuth } from './context/AuthContext';
import AdminUsersPage from './pages/AdminUsersPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import NewQuotePage from './pages/NewQuotePage';
import NotFoundPage from './pages/NotFoundPage';
import QuotesPage from './pages/QuotesPage';
import SaasHubPage from './pages/SaasHubPage';
import TariffsPage from './pages/TariffsPage';
import AlbaApplicationsPage from './pages/alba/AlbaApplicationsPage';
import AlbaDashboardPage from './pages/alba/AlbaDashboardPage';
import AlbaJobsPage from './pages/alba/AlbaJobsPage';
import AlbaNewJobPage from './pages/alba/AlbaNewJobPage';
import AlbaSettlementPage from './pages/alba/AlbaSettlementPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/inquiry/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* SaaS Hub landing */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SaasHubPage />
          </ProtectedRoute>
        }
      />

      {/* Inland Inquiry SaaS */}
      <Route
        path="/inquiry"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/inquiry/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="quotes" element={<QuotesPage />} />
        <Route path="quotes/new" element={<NewQuotePage />} />
        <Route path="tariffs" element={<TariffsPage />} />
        <Route
          path="admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* Alba 수발주 SaaS */}
      <Route
        path="/alba"
        element={
          <ProtectedRoute>
            <AlbaLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/alba/dashboard" replace />} />
        <Route path="dashboard" element={<AlbaDashboardPage />} />
        <Route path="jobs" element={<AlbaJobsPage />} />
        <Route path="jobs/new" element={<AlbaNewJobPage />} />
        <Route path="applications" element={<AlbaApplicationsPage />} />
        <Route path="settlement" element={<AlbaSettlementPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
