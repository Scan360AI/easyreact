import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useReportPolling } from '../hooks/useReportPolling';
import KitzanosReport from '../KitzanosReport';
import './ReportViewPage.css';

const ReportViewPage = () => {
  const { reportId } = useParams();
  const { status, reportData, error, attemptCount, progress } = useReportPolling(reportId);

  // Stato: Processing (report in elaborazione)
  if (status === 'processing') {
    return (
      <div className="report-view-page">
        <div className="report-loading">
          <div className="loading-content">
            <div className="spinner"></div>
            <h2>Report in Elaborazione</h2>
            <p className="report-id">Report ID: <strong>{reportId}</strong></p>
            <p className="info-text">
              Stiamo analizzando i dati finanziari dell'azienda.
              <br />
              Il processo richiede solitamente 2-5 minuti.
            </p>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>

            <p className="attempt-info">
              <i className="ri-time-line"></i>
              Tentativo {attemptCount} - Prossimo controllo tra 5 secondi...
            </p>

            <Link to="/" className="back-link">
              <i className="ri-arrow-left-line"></i>
              Torna alla Home (il polling continuerà in background)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Stato: Timeout (superato tempo massimo)
  if (status === 'timeout') {
    return (
      <div className="report-view-page">
        <div className="report-error">
          <div className="error-content">
            <i className="ri-time-line error-icon"></i>
            <h2>Timeout Raggiunto</h2>
            <p className="report-id">Report ID: <strong>{reportId}</strong></p>
            <p className="error-message">
              Il report non è stato elaborato entro il tempo limite (10 minuti).
              <br />
              Questo può accadere per report particolarmente complessi o problemi temporanei.
            </p>
            <div className="error-actions">
              <Link to="/" className="btn btn-primary">
                <i className="ri-home-line"></i>
                Torna alla Home
              </Link>
              <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                <i className="ri-refresh-line"></i>
                Riprova
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stato: Error (errore generico)
  if (status === 'error' || error) {
    return (
      <div className="report-view-page">
        <div className="report-error">
          <div className="error-content">
            <i className="ri-error-warning-line error-icon"></i>
            <h2>Errore nel Caricamento</h2>
            <p className="report-id">Report ID: <strong>{reportId}</strong></p>
            <p className="error-message">{error || 'Si è verificato un errore imprevisto.'}</p>
            <div className="error-actions">
              <Link to="/" className="btn btn-primary">
                <i className="ri-home-line"></i>
                Torna alla Home
              </Link>
              <button className="btn btn-secondary" onClick={() => window.location.reload()}>
                <i className="ri-refresh-line"></i>
                Riprova
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stato: Completed (report pronto)
  if (status === 'completed' && reportData) {
    return (
      <div className="report-view-page">
        <KitzanosReport data={reportData} />
      </div>
    );
  }

  // Stato: Loading iniziale
  return (
    <div className="report-view-page">
      <div className="report-loading">
        <div className="loading-content">
          <div className="spinner"></div>
          <h2>Caricamento Report</h2>
          <p className="report-id">Report ID: <strong>{reportId}</strong></p>
        </div>
      </div>
    </div>
  );
};

export default ReportViewPage;
