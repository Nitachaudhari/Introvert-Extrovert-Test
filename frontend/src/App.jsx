import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClinicalLayout from './layouts/ClinicalLayout';
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

function App() {
  return (
    <BrowserRouter>
      <ClinicalLayout>
        <Routes>
          {/* Module 1: Dashboard */}
          <Route path="/" element={<DashboardView />} />

          {/* Module 2: Patients */}
          <Route path="/patients" element={<PatientsPage />} />

          {/* Module 3 & 4: Assessments & K.I.E.I. Instrument */}
          <Route path="/assessments/new" element={<NewAssessmentPage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/kiei-test" element={<KIEITestPage />} />

          {/* Module 6: Reports */}
          <Route path="/reports" element={<ReportsPage />} />

          {/* Module 7: Analytics */}
          <Route path="/analytics" element={<AnalyticsPage />} />

          {/* Module 8: Security, Users & Settings */}
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* System Diagnostics & Telemetry (Phase 1 Baseline) */}
          <Route path="/status" element={<StatusPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ClinicalLayout>
    </BrowserRouter>
  );
}

export default App;
