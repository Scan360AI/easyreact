import React from 'react';

/**
 * PROFILO AZIENDALE - Due card affiancate
 */
export function ProfiloAziendaleSection({ datiAnagrafici, struttura }) {
  if (!datiAnagrafici || !struttura) {
    return null;
  }

  return (
    <section id="profilo-aziendale" className="section">
      <div className="section-header">
        <h2>Profilo Aziendale</h2>
      </div>
      
      <div className="profilo-grid">
        {/* DATI ANAGRAFICI */}
        <div className="info-card">
          <div className="info-card-header">
            <div className="info-card-icon blue">
              <i className="ri-building-line"></i>
            </div>
            <h3>Dati Anagrafici</h3>
          </div>
          
          <div className="info-items">
            {datiAnagrafici.map((item, i) => (
              <div key={i} className="info-item">
                <span className="info-label">{item.label}</span>
                <span className="info-value" dangerouslySetInnerHTML={{ __html: item.value }} />
              </div>
            ))}
          </div>
        </div>
        
        {/* STRUTTURA */}
        <div className="info-card">
          <div className="info-card-header">
            <div className="info-card-icon teal">
              <i className="ri-organization-chart"></i>
            </div>
            <h3>Struttura</h3>
          </div>
          
          <div className="info-items">
            {struttura.map((item, i) => (
              <div key={i} className="info-item">
                <span className="info-label">{item.label}</span>
                <span className="info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * MANAGEMENT E GOVERNANCE - 3 card affiancate
 */
export function ManagementSection({ data }) {
  if (!data || !Array.isArray(data)) {
    return null;
  }

  const getAvatarColor = (colorClass) => {
    const colors = {
      'blue': '#2f3e9e',
      'teal': '#4ecdc4',
      'yellow': '#f9b115'
    };
    return colors[colorClass] || colors.blue;
  };

  return (
    <section id="management" className="section">
      <div className="section-header">
        <h2>Management e Governance</h2>
      </div>
      
      <div className="management-grid">
        {data.map((person, i) => (
          <div key={i} className="person-card">
            <div 
              className="person-avatar"
              style={{ background: getAvatarColor(person.colorClass) }}
            >
              {person.initials}
            </div>
            
            <h3 className="person-name">{person.name}</h3>
            <p className="person-role">{person.role}</p>
            
            {person.badge && (
              <span className="person-badge">{person.badge}</span>
            )}
            
            <p className="person-date">Dal {person.appointmentDate}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * PARTECIPAZIONI - 3 card affiancate
 */
export function PartecipazioniSection({ data }) {
  if (!data || !Array.isArray(data)) {
    return null;
  }

  const getIconColor = (index) => {
    const colors = ['yellow', 'teal', 'blue'];
    return colors[index % colors.length];
  };

  return (
    <section id="partecipazioni" className="section">
      <div className="section-header">
        <h2>Partecipazioni</h2>
      </div>
      
      <div className="partecipazioni-grid">
        {data.map((partecipazione, i) => (
          <div key={i} className="partecipazione-card">
            <div className="partecipazione-header">
              <div className={`partecipazione-icon ${getIconColor(i)}`}>
                <i className="ri-building-2-line"></i>
              </div>
              <h3>{partecipazione.companyName}</h3>
            </div>
            
            <div className="partecipazione-info">
              <div className="partecipazione-item">
                <span className="label">Quota</span>
                <span className="value">{partecipazione.quota}</span>
              </div>
              <div className="partecipazione-item">
                <span className="label">Tipo</span>
                <span className="value">{partecipazione.tipo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * DATI ECONOMICO-FINANZIARI - Grid 5 colonne
 */
export function DatiFinanziariSection({ data }) {
  if (!data || !Array.isArray(data)) {
    return null;
  }

  const getStatusClass = (status) => {
    if (!status) return '';
    if (status.includes('eccellente') || status.includes('Ottima')) return 'excellent';
    if (status.includes('buona') || status.includes('Accettabile')) return 'good';
    if (status.includes('attenzione') || status.includes('monitorare')) return 'warning';
    return 'info';
  };

  const getBorderColor = (label) => {
    const colorMap = {
      'FATTURATO 2024': 'red',
      'EBITDA': 'green',
      'UTILE NETTO': 'green',
      'PATRIMONIO NETTO': 'blue',
      'CAPITALE SOCIALE': 'orange',
      'ROE': 'teal',
      'ROI': 'yellow',
      'ROS': 'teal',
      'LEVERAGE': 'yellow',
      'CAPITALIZZAZIONE': 'yellow',
      'DSCR': 'teal',
      'LIQUIDITÀ': 'teal'
    };
    return colorMap[label] || 'primary';
  };

  return (
    <section id="dati-finanziari" className="section">
      <div className="section-header">
        <h2>Dati Economico-Finanziari</h2>
      </div>
      
      <div className="financial-grid">
        {data.map((item, i) => (
          <div key={i} className={`financial-card border-${getBorderColor(item.label)}`}>
            <div className="financial-label">{item.label}</div>
            <div className="financial-value">{item.value}</div>
            {item.trend && (
              <div className={`financial-trend ${item.trend.includes('-') ? 'negative' : 'positive'}`}>
                <i className={item.trend.includes('-') ? 'ri-arrow-down-line' : 'ri-arrow-up-line'}></i>
                {item.trend}
              </div>
            )}
            {item.status && (
              <div className={`financial-status ${getStatusClass(item.status)}`}>
                <i className={
                  getStatusClass(item.status) === 'excellent' ? 'ri-thumb-up-fill' :
                  getStatusClass(item.status) === 'good' ? 'ri-thumb-up-line' :
                  getStatusClass(item.status) === 'warning' ? 'ri-alert-line' :
                  'ri-information-line'
                }></i>
                {item.status}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * OUTLOOK E RACCOMANDAZIONI
 */
export function OutlookSection({ raccomandazioni, outlook }) {
  if (!raccomandazioni || !outlook) {
    return null;
  }

  return (
    <section id="outlook" className="section">
      <div className="section-header">
        <h2>Outlook e Raccomandazioni</h2>
      </div>
      
      {/* Raccomandazioni Operative */}
      <div className="outlook-card">
        <div className="outlook-header">
          <div className="outlook-icon blue">
            <i className="ri-lightbulb-line"></i>
          </div>
          <h3>Raccomandazioni Operative</h3>
        </div>
        
        <div className="raccomandazioni-list">
          {raccomandazioni.map((item, i) => (
            <div key={i} className="raccomandazione-item">
              <div className="raccomandazione-icon">
                <i className="ri-checkbox-circle-fill"></i>
              </div>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Outlook */}
      <div className="outlook-card mt">
        <div className="outlook-header">
          <div className="outlook-icon teal">
            <i className="ri-eye-line"></i>
          </div>
          <h3>Outlook</h3>
        </div>
        
        <div className="outlook-content">
          <p>{outlook}</p>
        </div>
      </div>
    </section>
  );
}

export default {
  ProfiloAziendaleSection,
  ManagementSection,
  PartecipazioniSection,
  DatiFinanziariSection,
  OutlookSection
};
