import React, { useState, useEffect } from 'react';
import './KitzanosReport.css';
import {
  EconomicTrendChart,
  DebtSustainabilityChart,
  WorkingCapitalChart,
  StressTestChart,
  BenchmarkRadarChart,
  RatingEvolutionChart
} from './ChartComponents';
import { ChartCard, ProfilesTable, GridContainer } from './AnalysisComponents';
import {
  ProfiloAziendaleSection,
  ManagementSection,
  PartecipazioniSection,
  DatiFinanziariSection,
  OutlookSection
} from './ProfileComponents';
import { CodiceCrisiSection } from './CrisisComponents';
import { NoteTecnicheSection, ExportPDF } from './FinalComponents';

// Componente Risk Assessment
const RiskAssessment = ({ data }) => {
  return (
    <div className="risk-assessment-container">
      <div className="risk-assessment-header">
        <h3>Valutazione Complessiva del Rischio</h3>
      </div>
      
      <div className="risk-assessment-content">
        <div className="risk-scale-container">
          <div className="risk-scale-label">Posizionamento sulla Scala di Rischio</div>
          <div className="risk-scale">
            <div className="risk-marker" style={{ left: `${data.score}%` }}></div>
          </div>
          <div className="risk-scale-values">
            <span>0 (Alto)</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100 (Basso)</span>
          </div>
        </div>
        
        <div className={`risk-score-circle ${data.colorClass}`}>
          <div className="risk-score-number">{data.score}</div>
          <div className="risk-score-max">/ {data.maxScore}</div>
        </div>
        
        <div className={`risk-category ${data.colorClass}`}>
          <i className="ri-shield-check-line"></i>
          {data.categoryLabel}
        </div>
        
        <div className="risk-description">
          {data.description}
        </div>
      </div>
    </div>
  );
};

// Componente Metric Card
const MetricCard = ({ metric }) => {
  const renderTrend = (trend) => {
    if (!trend) return null;
    
    const icons = {
      up: 'ri-arrow-up-line',
      down: 'ri-arrow-down-line',
      neutral: 'ri-subtract-line'
    };
    
    const displayValue = trend.unit ? `${Math.abs(trend.value)}${trend.unit}` : `${Math.abs(trend.value)}%`;
    const trendText = trend.text || displayValue;
    
    return (
      <div className={`metric-trend ${trend.direction}`}>
        <i className={icons[trend.direction]}></i>
        {trendText} <span className="metric-period">{trend.label}</span>
      </div>
    );
  };
  
  return (
    <div className={`metric-card ${metric.colorClass}`}>
      <div className="metric-header">
        {metric.title}
        <div className="icon-bg">
          <i className={metric.icon}></i>
        </div>
      </div>
      <div className="metric-value-container">
        <div className="metric-value">{metric.value}</div>
        {metric.trend && renderTrend(metric.trend)}
        {metric.category && (
          <div className={`metric-category ${metric.category.class}`}>
            {metric.category.label}
          </div>
        )}
        {metric.badge && (
          <div className={`metric-badge ${metric.badge.class}`}>
            {metric.badge.label}
          </div>
        )}
      </div>
      {metric.benchmark && (
        <div className="metric-benchmark">{metric.benchmark}</div>
      )}
    </div>
  );
};

// Componente Executive Summary
const ExecutiveSummary = ({ data }) => {
  return (
    <div className="card">
      <div className="summary-content">
        <div className="summary-block strengths">
          <h4>
            <i className="ri-shield-star-line"></i> Punti di Forza
          </h4>
          <ul>
            {data.strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        <div className="summary-block weaknesses">
          <h4>
            <i className="ri-error-warning-line"></i> CriticitÃ 
          </h4>
          <ul>
            {data.weaknesses.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Componente Principale
const KitzanosReport = ({ data = null }) => {
  const [reportData, setReportData] = useState(data);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    // Se i dati sono già forniti via props, non fare fetch
    if (data) {
      setReportData(data);
      setLoading(false);
      return;
    }

    // Altrimenti, carica i dati dal JSON (retrocompatibilità)
    fetch('/kitzanos-data.json')
      .then(response => response.json())
      .then(jsonData => {
        setReportData(jsonData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Errore nel caricamento dei dati:', error);
        setLoading(false);
      });
  }, [data]);
  
  if (loading) {
    return (
      <div className="loading-container">
        <i className="ri-loader-4-line spinning"></i>
        <p>Caricamento report in corso...</p>
      </div>
    );
  }
  
  if (!reportData) {
    return (
      <div className="error-container">
        <i className="ri-error-warning-line"></i>
        <p>Errore nel caricamento dei dati del report</p>
      </div>
    );
  }
  
  const { 
    company, 
    reportInfo, 
    riskAssessment, 
    keyMetrics, 
    executiveSummary, 
    charts, 
    profiles,
    profiloAziendale,
    management,
    partecipazioni,
    datiFinanziari,
    outlook,
    codiceCrisi,
    noteTecniche
  } = reportData;
  
  // Funzioni per download e expand grafici
  const handleChartDownload = (chartId, chartTitle) => {
    console.log('Download chart:', chartId, chartTitle);
    // TODO: Implementare download dell'immagine del grafico
  };
  
  const handleChartExpand = (chartId, chartTitle) => {
    console.log('Expand chart:', chartId, chartTitle);
    // TODO: Implementare modal per grafico espanso
  };
  
  return (
    <div className="wrapper">
      {/* Sidebar - manteniamo la struttura originale per ora */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img 
            src="https://scan360-agricola-campidanese.netlify.app/assets/img/logo_scan.png" 
            alt="SCAN360 Logo" 
            className="sidebar-logo"
          />
          <div className="company-name">{company.name}</div>
        </div>
        <ul className="sidebar-menu">
          <div className="sidebar-section">REPORT</div>
          <li className="sidebar-menu-item active">
            <i className="ri-dashboard-line"></i>
            <span>Sintesi</span>
          </li>
          <li className="sidebar-menu-item">
            <i className="ri-building-line"></i>
            <span>Profilo Aziendale</span>
          </li>
          <li className="sidebar-menu-item">
            <i className="ri-team-line"></i>
            <span>Management</span>
          </li>
          <li className="sidebar-menu-item">
            <i className="ri-organization-chart"></i>
            <span>Partecipazioni</span>
          </li>
          
          <div className="sidebar-section">ANALISI</div>
          <li className="sidebar-menu-item">
            <i className="ri-line-chart-line"></i>
            <span>Dati Finanziari</span>
          </li>
          <li className="sidebar-menu-item">
            <i className="ri-radar-line"></i>
            <span>Benchmark</span>
          </li>
          
          <div className="sidebar-section">VALUTAZIONE</div>
          <li className="sidebar-menu-item">
            <i className="ri-eye-line"></i>
            <span>Outlook</span>
          </li>
          <li className="sidebar-menu-item">
            <i className="ri-shield-check-line"></i>
            <span>Codice della Crisi</span>
          </li>
          <li className="sidebar-menu-item">
            <i className="ri-file-info-line"></i>
            <span>Note Tecniche</span>
          </li>
        </ul>
      </aside>
      
      {/* Main Content */}
      <main className="main-content">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>{company.name}</h1>
            <p>P.IVA: {company.piva} | Data report: {reportInfo.date}</p>
          </div>
          <div className="dashboard-actions">
            <button>
              <i className="ri-file-list-3-line"></i> Report completo
            </button>
            <button className="print-btn">
              <i className="ri-download-line"></i> Esporta PDF
            </button>
          </div>
        </div>
        
        {/* Risk Assessment */}
        <RiskAssessment data={riskAssessment} />
        
        {/* Key Metrics */}
        <div className="section-header">
          <h2>Indicatori Chiave di Performance</h2>
        </div>
        
        <div className="key-metrics-grid">
          {keyMetrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
        
        {/* Executive Summary */}
        <div className="section-header">
          <h2>Executive Summary</h2>
        </div>
        
        <ExecutiveSummary data={executiveSummary} />
        
        {/* Profilo Aziendale - ITERAZIONE 3 FIX */}
        <ProfiloAziendaleSection 
          datiAnagrafici={profiloAziendale.datiAnagrafici} 
          struttura={profiloAziendale.struttura} 
        />
        
        {/* Management - ITERAZIONE 3 */}
        <ManagementSection data={management} />
        
        {/* Partecipazioni - ITERAZIONE 3 FIX */}
        <PartecipazioniSection data={partecipazioni} />
        
        {/* Dati Finanziari - ITERAZIONE 3 FIX */}
        <DatiFinanziariSection data={datiFinanziari} />
        
        {/* Outlook - ITERAZIONE 3 FIX */}
        <OutlookSection 
          raccomandazioni={outlook.raccomandazioni} 
          outlook={outlook.outlook} 
        />
        
        {/* Codice della Crisi - ITERAZIONE 4 */}
        <CodiceCrisiSection data={codiceCrisi} />
        
        {/* Charts Section - GRAFICI CHIAVE */}
        <section id="grafici-chiave">
          <div className="section-header">
            <h2>Grafici Chiave</h2>
          </div>
          
          <GridContainer>
            <ChartCard
            title="Trend Economico (2022-2024)"
            icon="ri-line-chart-line"
            onDownload={() => handleChartDownload('economic-trend', 'Trend Economico')}
            onExpand={() => handleChartExpand('economic-trend', 'Trend Economico')}
          >
            <EconomicTrendChart chartData={charts.economicTrend} />
          </ChartCard>
          
          <ChartCard
            title="SostenibilitÃ  del Debito"
            icon="ri-bar-chart-grouped-line"
            onDownload={() => handleChartDownload('debt-sustainability', 'SostenibilitÃ  del Debito')}
            onExpand={() => handleChartExpand('debt-sustainability', 'SostenibilitÃ  del Debito')}
          >
            <DebtSustainabilityChart chartData={charts.debtSustainability} />
          </ChartCard>
          
          <ChartCard
            title="Capitale Circolante (giorni)"
            icon="ri-funds-line"
            onDownload={() => handleChartDownload('working-capital', 'Capitale Circolante')}
            onExpand={() => handleChartExpand('working-capital', 'Capitale Circolante')}
          >
            <WorkingCapitalChart chartData={charts.workingCapital} />
          </ChartCard>
          
          <ChartCard
            title="Test di Stress - Impatto su DSCR"
            icon="ri-test-tube-line"
            onDownload={() => handleChartDownload('stress-test', 'Test di Stress')}
            onExpand={() => handleChartExpand('stress-test', 'Test di Stress')}
          >
            <StressTestChart chartData={charts.stressTest} />
          </ChartCard>
        </GridContainer>
        </section>
        
        {/* Profiles Analysis */}
        <section id="analisi-profili">
          <div className="section-header">
            <h2>Analisi Profili</h2>
          </div>
          
          {/* Tabella Profili - Full Width */}
          <div className="profiles-grid">
            <ProfilesTable profiles={profiles} />
          </div>
          
          {/* Grafici - Grid 2 colonne */}
          <div className="profiles-charts-grid">
            <ChartCard
              title="Benchmark Settoriale"
              icon="ri-radar-line"
              onDownload={() => handleChartDownload('benchmark-radar', 'Benchmark Settoriale')}
              onExpand={() => handleChartExpand('benchmark-radar', 'Benchmark Settoriale')}
            >
              <BenchmarkRadarChart chartData={charts.benchmarkRadar} />
            </ChartCard>
            
            <ChartCard
              title="Evoluzione Rating"
              icon="ri-history-line"
              onDownload={() => handleChartDownload('rating-evolution', 'Evoluzione Rating')}
              onExpand={() => handleChartExpand('rating-evolution', 'Evoluzione Rating')}
            >
              <RatingEvolutionChart chartData={charts.ratingEvolution} />
            </ChartCard>
          </div>
        </section>
        
        {/* Note Tecniche - ITERAZIONE 5 */}
        <NoteTecnicheSection data={noteTecniche} />
        
        {/* Footer */}
        <div className="footer">
          <img 
            src="https://scan360-agricola-campidanese.netlify.app/assets/img/logo_scan.png" 
            alt="SCAN360 Logo" 
            className="footer-logo"
          />
          <div className="footer-info">
            <p>Â© 2025 SCAN360 - Report generato il {reportInfo.generatedDate}</p>
            <p>Dati aggiornati al: {reportInfo.generatedDate}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KitzanosReport;
