import React from 'react';
import ReportRequestForm from '../components/reports/ReportRequestForm';
import ReportList from '../components/reports/ReportList';
import useReports from '../hooks/useReports';
import './HomePage.css';

const HomePage = () => {
  const { reports, loading, error, refreshReports } = useReports();

  const handleReportCreated = (reportId) => {
    // Ricarica la lista dei report quando ne viene creato uno nuovo
    setTimeout(() => {
      refreshReports();
    }, 1000);
  };

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Dashboard Report Finanziari</h1>
        <p>Richiedi nuovi report e visualizza quelli già elaborati</p>
      </div>

      <div className="page-content">
        {/* Form richiesta report */}
        <section className="section">
          <div className="section-header">
            <h2>
              <i className="ri-file-add-line"></i>
              Richiedi Nuovo Report
            </h2>
          </div>
          <ReportRequestForm onReportCreated={handleReportCreated} />
        </section>

        {/* Lista report */}
        <section className="section">
          <div className="section-header">
            <h2>
              <i className="ri-folder-open-line"></i>
              Report Disponibili
            </h2>
            {!loading && !error && (
              <button
                className="refresh-btn"
                onClick={refreshReports}
                title="Ricarica lista"
              >
                <i className="ri-refresh-line"></i>
                Ricarica
              </button>
            )}
          </div>
          <ReportList reports={reports} loading={loading} error={error} />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
