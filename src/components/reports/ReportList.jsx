import React, { useState, useMemo } from 'react';
import ReportCard from './ReportCard';
import './ReportList.css';

const ReportList = ({ reports, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filtra e ordina i report
  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    // Filtro per search term (nome azienda o P.IVA)
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.piva.includes(searchTerm)
      );
    }

    // Filtro per status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Ordinamento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'company':
          return a.companyName.localeCompare(b.companyName);
        case 'risk-high':
          return (b.riskScore || 0) - (a.riskScore || 0);
        case 'risk-low':
          return (a.riskScore || 0) - (b.riskScore || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [reports, searchTerm, statusFilter, sortBy]);

  // Statistiche
  const stats = useMemo(() => {
    return {
      total: reports.length,
      completed: reports.filter(r => r.status === 'completed').length,
      processing: reports.filter(r => r.status === 'processing').length,
      failed: reports.filter(r => r.status === 'failed').length
    };
  }, [reports]);

  if (loading) {
    return (
      <div className="report-list-loading">
        <div className="spinner"></div>
        <p>Caricamento report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-list-error">
        <i className="ri-error-warning-line"></i>
        <h3>Errore nel caricamento dei report</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="report-list">
      {/* Statistiche */}
      <div className="report-stats">
        <div className="stat-card">
          <i className="ri-file-list-line"></i>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Totali</span>
          </div>
        </div>
        <div className="stat-card success">
          <i className="ri-checkbox-circle-line"></i>
          <div className="stat-content">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completati</span>
          </div>
        </div>
        <div className="stat-card warning">
          <i className="ri-loader-4-line"></i>
          <div className="stat-content">
            <span className="stat-value">{stats.processing}</span>
            <span className="stat-label">In Corso</span>
          </div>
        </div>
        {stats.failed > 0 && (
          <div className="stat-card danger">
            <i className="ri-error-warning-line"></i>
            <div className="stat-content">
              <span className="stat-value">{stats.failed}</span>
              <span className="stat-label">Falliti</span>
            </div>
          </div>
        )}
      </div>

      {/* Filtri */}
      <div className="report-filters">
        <div className="filter-group">
          <div className="search-box">
            <i className="ri-search-line"></i>
            <input
              type="text"
              placeholder="Cerca per nome azienda o P.IVA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm('')}
                title="Cancella ricerca"
              >
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="status-filter">
            <i className="ri-filter-line"></i>
            Status:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tutti</option>
            <option value="completed">Completati</option>
            <option value="processing">In elaborazione</option>
            <option value="failed">Falliti</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-by">
            <i className="ri-sort-desc"></i>
            Ordina:
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Più recenti</option>
            <option value="oldest">Più vecchi</option>
            <option value="company">Nome azienda</option>
            <option value="risk-high">Risk score (alto-basso)</option>
            <option value="risk-low">Risk score (basso-alto)</option>
          </select>
        </div>
      </div>

      {/* Lista report */}
      {filteredReports.length === 0 ? (
        <div className="report-empty">
          <i className="ri-file-search-line"></i>
          <h3>Nessun report trovato</h3>
          <p>
            {searchTerm || statusFilter !== 'all'
              ? 'Prova a modificare i filtri di ricerca'
              : 'Richiedi il tuo primo report usando il form sopra'}
          </p>
        </div>
      ) : (
        <div className="report-grid">
          {filteredReports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportList;
