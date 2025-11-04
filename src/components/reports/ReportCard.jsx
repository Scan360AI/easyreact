import React from 'react';
import { Link } from 'react-router-dom';
import './ReportCard.css';

const ReportCard = ({ report }) => {
  const {
    id,
    companyName,
    piva,
    status,
    createdAt,
    completedAt,
    riskScore,
    riskCategory,
    error
  } = report;

  // Formatta la data in formato italiano
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determina lo stato visivo
  const getStatusConfig = () => {
    switch (status) {
      case 'completed':
        return {
          icon: 'ri-checkbox-circle-line',
          text: 'Completato',
          color: 'success'
        };
      case 'processing':
        return {
          icon: 'ri-loader-4-line',
          text: 'In elaborazione',
          color: 'warning',
          animated: true
        };
      case 'failed':
        return {
          icon: 'ri-error-warning-line',
          text: 'Errore',
          color: 'danger'
        };
      default:
        return {
          icon: 'ri-question-line',
          text: 'Sconosciuto',
          color: 'neutral'
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Determina il colore del risk score
  const getRiskColor = () => {
    if (!riskScore) return null;
    if (riskScore < 40) return 'risk-low';
    if (riskScore < 70) return 'risk-medium';
    return 'risk-high';
  };

  return (
    <div className={`report-card ${status}`}>
      <div className="report-card-header">
        <div className="company-info">
          <h3 className="company-name">{companyName}</h3>
          <p className="company-piva">
            <i className="ri-building-line"></i>
            P.IVA: {piva}
          </p>
        </div>
        <div className={`status-badge ${statusConfig.color}`}>
          <i className={`${statusConfig.icon} ${statusConfig.animated ? 'spin' : ''}`}></i>
          {statusConfig.text}
        </div>
      </div>

      <div className="report-card-body">
        <div className="report-info">
          <div className="info-item">
            <i className="ri-calendar-line"></i>
            <span className="info-label">Richiesto:</span>
            <span className="info-value">{formatDate(createdAt)}</span>
          </div>

          {completedAt && (
            <div className="info-item">
              <i className="ri-calendar-check-line"></i>
              <span className="info-label">Completato:</span>
              <span className="info-value">{formatDate(completedAt)}</span>
            </div>
          )}

          {riskScore !== null && riskScore !== undefined && (
            <div className="info-item">
              <i className="ri-shield-line"></i>
              <span className="info-label">Risk Score:</span>
              <span className={`info-value risk-score ${getRiskColor()}`}>
                {riskScore.toFixed(2)} ({riskCategory})
              </span>
            </div>
          )}

          {error && (
            <div className="info-item error-message">
              <i className="ri-alert-line"></i>
              <span className="info-value">{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="report-card-footer">
        {status === 'completed' ? (
          <>
            <Link to={`/report/${id}`} className="btn btn-primary">
              <i className="ri-file-text-line"></i>
              Visualizza Report
            </Link>
            <button className="btn btn-secondary" title="Esporta PDF (Coming soon)">
              <i className="ri-download-line"></i>
            </button>
          </>
        ) : status === 'processing' ? (
          <Link to={`/report/${id}`} className="btn btn-secondary">
            <i className="ri-eye-line"></i>
            Monitora Stato
          </Link>
        ) : (
          <button className="btn btn-secondary" disabled>
            <i className="ri-close-line"></i>
            Non Disponibile
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
