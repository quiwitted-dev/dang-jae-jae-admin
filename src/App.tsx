import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import { NavigationService } from './services/NavigationService';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import SubmissionsPage from './pages/admin/SubmissionsPage';
import PricePage from './pages/admin/PricePage';
import AdminManagePage from './pages/admin/AdminManagePage';
import UserManagePage from './pages/admin/UserManagePage';
import MainTitlePage from './pages/admin/MainTitlePage';
import ApiDataSyncPage from './pages/api-data/ApiDataSyncPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NavigationService>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />

              {/* 관제 대시보드 */}
              <Route path="admin/dashboard" element={<DashboardPage />} />

              {/* 신청 관리 */}
              <Route path="admin/submissions" element={<SubmissionsPage />} />

              {/* 가격 관리 */}
              <Route path="admin/price" element={<PricePage />} />

              {/* 관리자 관리 */}
              <Route path="admin/manage" element={<AdminManagePage />} />

              {/* 유저 관리 */}
              <Route path="admin/users" element={<UserManagePage />} />

              {/* 홈페이지 관리 */}
              <Route path="admin/main-title" element={<MainTitlePage />} />

              {/* 공공데이터 */}
              <Route path="api-data/sync" element={<ApiDataSyncPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </NavigationService>
      </AuthProvider>
    </Router>
  );
}

export default App;
