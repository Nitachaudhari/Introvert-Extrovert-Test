import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ClinicalLayout from './layouts/ClinicalLayout';
import LoginPage from './pages/LoginPage';
import DashboardView from './pages/DashboardView';
import PatientsPage from './pages/PatientsPage';
import NewAssessmentPage from './pages/NewAssessmentPage';
import AssessmentsPage from './pages/AssessmentsPage';
import KIEITestPage from './pages/KIEITestPage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import StatusPage from './pages/StatusPage';

const ProtectedApp = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Checking staff session…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;

  return (
    <ClinicalLayout>
      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/assessments/new" element={<NewAssessmentPage />} />
        <Route path="/assessments" element={<AssessmentsPage />} />
        <Route path="/kiei-test" element={<KIEITestPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ClinicalLayout>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
