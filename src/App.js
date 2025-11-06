import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ReportViewPage from './pages/ReportViewPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PasswordResetRequestPage from './pages/PasswordResetRequestPage';
import PasswordResetPage from './pages/PasswordResetPage';
import './KitzanosReport.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes (no auth required) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/password-reset-request" element={<PasswordResetRequestPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />

        {/* Protected routes (auth required) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <HomePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:reportId"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ReportViewPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

// 404 Page component
const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '3rem' }}>
    <h1>404 - Pagina Non Trovata</h1>
    <p>La pagina che stai cercando non esiste.</p>
    <a href="/" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>
      Torna alla Home
    </a>
  </div>
);

export default App;
