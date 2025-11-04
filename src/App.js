import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import ReportViewPage from './pages/ReportViewPage';
import './KitzanosReport.css';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report/:reportId" element={<ReportViewPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
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
