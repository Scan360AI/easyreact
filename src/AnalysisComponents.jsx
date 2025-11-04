import React, { useState } from 'react';

// Card wrapper per i grafici
export const ChartCard = ({ title, icon, children, onDownload, onExpand }) => {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div className="chart-title-wrapper">
          <div className="chart-icon">
            <i className={icon}></i>
          </div>
          <h3 className="chart-title">{title}</h3>
        </div>
        <div className="chart-actions">
          {onDownload && (
            <button className="chart-action-btn" onClick={onDownload} title="Scarica grafico">
              <i className="ri-download-line"></i>
            </button>
          )}
          {onExpand && (
            <button className="chart-action-btn" onClick={onExpand} title="Espandi grafico">
              <i className="ri-fullscreen-line"></i>
            </button>
          )}
        </div>
      </div>
      <div className="chart-content">
        {children}
      </div>
    </div>
  );
};

// Grid Container per grafici
export const GridContainer = ({ children }) => {
  return <div className="charts-grid">{children}</div>;
};

// Componente Score Dots
const ScoreDots = ({ score, maxScore = 5, color = 'blue' }) => {
  return (
    <div className={`score-dots ${color}`}>
      {[...Array(maxScore)].map((_, index) => (
        <div
          key={index}
          className={`score-dot ${index < score ? 'active' : ''}`}
        />
      ))}
    </div>
  );
};

// Componente Trend Badge
const TrendBadge = ({ trend }) => {
  const icons = {
    'stable': 'ri-subtract-line',
    'positive': 'ri-arrow-up-line',
    'negative': 'ri-arrow-down-line',
    'strong-positive': 'ri-arrow-up-line'
  };

  return (
    <div className={`trend-badge ${trend.type}`}>
      <i className={icons[trend.type]}></i> {trend.label}
    </div>
  );
};

// Tabella Profili di Valutazione
export const ProfilesTable = ({ profiles }) => {
  return (
    <div className="profiles-card">
      <div className="profiles-card-header">
        <div className="profiles-card-icon">
          <i className="ri-focus-3-line"></i>
        </div>
        <h3 className="profiles-card-title">Profili di Valutazione</h3>
      </div>
      <table className="profiles-table">
        <thead>
          <tr>
            <th>Profilo</th>
            <th>Score</th>
            <th>Valutazione</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr key={profile.id}>
              <td>
                <div className="profile-name">
                  <div className={`profile-indicator ${profile.color}`}></div>
                  {profile.name}
                </div>
              </td>
              <td>
                <ScoreDots 
                  score={profile.score} 
                  maxScore={profile.maxScore}
                  color={profile.color}
                />
              </td>
              <td>
                <span className="evaluation-text">{profile.evaluation}</span>
              </td>
              <td>
                <TrendBadge trend={profile.trend} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChartCard;
