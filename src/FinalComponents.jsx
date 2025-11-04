import React, { useState } from 'react';

/**
 * Accordion - Componente accordion per note tecniche
 */
export function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openIndex === index}
          onToggle={() => toggleAccordion(index)}
        />
      ))}
    </div>
  );
}

/**
 * StatoPatrimonialeTable - Tabella Stato Patrimoniale
 */
function StatoPatrimonialeTable({ data }) {
  const getTrendColor = (color) => {
    const colors = {
      green: 'var(--green)',
      red: 'var(--red)',
      gray: 'var(--text-light)'
    };
    return colors[color] || 'var(--text)';
  };

  return (
    <>
      <h4 className="bilancio-section-title">
        <i className="ri-scales-3-line"></i>
        Stato Patrimoniale - Confronto Biennale
      </h4>
      
      {/* ATTIVO */}
      <div className="bilancio-table-container attivo">
        <h5 className="bilancio-table-title">ATTIVO</h5>
        <table className="bilancio-table">
          <thead>
            <tr>
              <th>Voce</th>
              <th>2023</th>
              <th>2024</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            <tr className="section-header-row">
              <td colSpan="4">Immobilizzazioni</td>
            </tr>
            {data.attivo.immobilizzazioni.map((row, i) => (
              <tr key={i}>
                <td className="indent">{row.voce}</td>
                <td className="amount">{row['2023']}</td>
                <td className="amount">{row['2024']}</td>
                <td className="trend" style={{ color: getTrendColor(row.trendColor) }}>
                  {row.trend}
                </td>
              </tr>
            ))}
            <tr className="subtotal-row">
              <td className="indent">Totale Immobilizzazioni</td>
              <td className="amount">{data.attivo.totaleImmobilizzazioni['2023']}</td>
              <td className="amount highlight">{data.attivo.totaleImmobilizzazioni['2024']}</td>
              <td className="trend" style={{ color: getTrendColor(data.attivo.totaleImmobilizzazioni.trendColor) }}>
                {data.attivo.totaleImmobilizzazioni.trend}
              </td>
            </tr>
            
            <tr className="section-header-row">
              <td colSpan="4">Attivo Circolante</td>
            </tr>
            {data.attivo.circolante.map((row, i) => (
              <tr key={i}>
                <td className="indent">{row.voce}</td>
                <td className="amount">{row['2023']}</td>
                <td className="amount">{row['2024']}</td>
                <td className="trend" style={{ color: getTrendColor(row.trendColor) }}>
                  {row.trend}
                </td>
              </tr>
            ))}
            <tr className="subtotal-row">
              <td className="indent">Totale Attivo Circolante</td>
              <td className="amount">{data.attivo.totaleCircolante['2023']}</td>
              <td className="amount highlight">{data.attivo.totaleCircolante['2024']}</td>
              <td className="trend" style={{ color: getTrendColor(data.attivo.totaleCircolante.trendColor) }}>
                {data.attivo.totaleCircolante.trend}
              </td>
            </tr>
            
            <tr className="total-row">
              <td>TOTALE ATTIVO</td>
              <td className="amount">{data.attivo.totaleAttivo['2023']}</td>
              <td className="amount highlight">{data.attivo.totaleAttivo['2024']}</td>
              <td className="trend" style={{ color: getTrendColor(data.attivo.totaleAttivo.trendColor) }}>
                {data.attivo.totaleAttivo.trend}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* PASSIVO */}
      <div className="bilancio-table-container passivo">
        <h5 className="bilancio-table-title">PASSIVO</h5>
        <table className="bilancio-table">
          <thead>
            <tr>
              <th>Voce</th>
              <th>2023</th>
              <th>2024</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            <tr className="section-header-row">
              <td colSpan="4">Patrimonio Netto</td>
            </tr>
            {data.passivo.patrimonioNetto.map((row, i) => (
              <tr key={i}>
                <td className="indent">{row.voce}</td>
                <td className="amount">{row['2023']}</td>
                <td className="amount">{row['2024']}</td>
                <td className="trend" style={{ color: getTrendColor(row.trendColor) }}>
                  {row.trend}
                </td>
              </tr>
            ))}
            <tr className="subtotal-row">
              <td className="indent">Totale Patrimonio Netto</td>
              <td className="amount">{data.passivo.totalePatrimonioNetto['2023']}</td>
              <td className="amount highlight">{data.passivo.totalePatrimonioNetto['2024']}</td>
              <td className="trend" style={{ color: getTrendColor(data.passivo.totalePatrimonioNetto.trendColor) }}>
                {data.passivo.totalePatrimonioNetto.trend}
              </td>
            </tr>
            
            <tr className="section-header-row">
              <td colSpan="4">Debiti</td>
            </tr>
            {data.passivo.debiti.map((row, i) => (
              <tr key={i}>
                <td className="indent">{row.voce}</td>
                <td className="amount">{row['2023']}</td>
                <td className="amount">{row['2024']}</td>
                <td className="trend" style={{ color: getTrendColor(row.trendColor) }}>
                  {row.trend}
                </td>
              </tr>
            ))}
            <tr className="subtotal-row">
              <td className="indent">Totale Debiti</td>
              <td className="amount">{data.passivo.totaleDebiti['2023']}</td>
              <td className="amount highlight">{data.passivo.totaleDebiti['2024']}</td>
              <td className="trend" style={{ color: getTrendColor(data.passivo.totaleDebiti.trendColor) }}>
                {data.passivo.totaleDebiti.trend}
              </td>
            </tr>
            
            <tr className="total-row">
              <td>TOTALE PASSIVO</td>
              <td className="amount">{data.passivo.totalePassivo['2023']}</td>
              <td className="amount highlight">{data.passivo.totalePassivo['2024']}</td>
              <td className="trend" style={{ color: getTrendColor(data.passivo.totalePassivo.trendColor) }}>
                {data.passivo.totalePassivo.trend}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

/**
 * ContoEconomicoTable - Tabella Conto Economico
 */
function ContoEconomicoTable({ data }) {
  const getTrendColor = (color) => {
    const colors = {
      green: 'var(--green)',
      red: 'var(--red)',
      gray: 'var(--text-light)'
    };
    return colors[color] || 'var(--text)';
  };

  return (
    <>
      <h4 className="bilancio-section-title mt">
        <i className="ri-line-chart-line"></i>
        Conto Economico - Confronto Biennale
      </h4>
      
      <div className="bilancio-table-container conto-economico">
        <table className="bilancio-table">
          <thead>
            <tr>
              <th>Voce</th>
              <th>2023</th>
              <th>2024</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className={row.highlight ? 'highlight-row' : ''}>
                <td className={row.highlight ? 'highlight-label' : ''}>{row.voce}</td>
                <td className="amount">{row['2023']}</td>
                <td className="amount">{row['2024']}</td>
                <td className="trend" style={{ color: getTrendColor(row.trendColor) }}>
                  {row.trend}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/**
 * AccordionItem - Singolo item accordion
 */
function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="accordion-item">
      <div className="accordion-header" onClick={onToggle}>
        <div className="accordion-header-content">
          <div className="accordion-icon">
            <i className={item.icon}></i>
          </div>
          <div className="accordion-title">
            <h3>{item.title}</h3>
            <p>{item.subtitle}</p>
          </div>
        </div>
        <div className={`accordion-toggle ${isOpen ? 'open' : ''}`}>
          <i className="ri-arrow-down-s-line"></i>
        </div>
      </div>
      <div className="accordion-content" style={{ maxHeight: isOpen ? '5000px' : '0' }}>
        <div className="accordion-body">
          {/* DSCR Content */}
          {item.formula && (
            <div className="formula-box">
              <p className="formula-label">Formula</p>
              <p className="formula-text">{item.formula}</p>
            </div>
          )}
          
          {item.values && (
            <div className="values-section">
              <h4><i className="ri-file-list-3-line"></i> Calcolo Dettagliato</h4>
              <div className="values-grid">
                {item.values.map((val, i) => (
                  <div key={i} className="value-item">
                    <div className="value-label">{val.label}</div>
                    <div className={`value-amount ${val.color}`}>{val.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {item.assumptions && (
            <div className="assumptions-section">
              <h4><i className="ri-settings-3-line"></i> Assunzioni Metodologiche</h4>
              <ul>
                {item.assumptions.map((assumption, i) => (
                  <li key={i}>
                    <i className="ri-checkbox-circle-line"></i>
                    <span dangerouslySetInnerHTML={{ __html: assumption }} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {item.result && (
            <div className="result-box">
              <h4><i className="ri-calculator-line"></i> Risultato Finale</h4>
              <p className="result-calc">
                <strong>DSCR</strong> = {item.result.calculation} = 
                <span className="result-value"> {item.result.value}</span>
              </p>
              <p className="result-interpretation">
                <strong>Interpretazione:</strong> {item.result.interpretation}
              </p>
            </div>
          )}
          
          {/* Bilancio Content */}
          {item.statoPatrimoniale && (
            <StatoPatrimonialeTable data={item.statoPatrimoniale} />
          )}
          
          {item.contoEconomico && (
            <ContoEconomicoTable data={item.contoEconomico} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Sidebar con navigazione funzionante
 */
export function SidebarNavigation({ sections, currentSection, onNavigate }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img 
          src="https://scan360-agricola-campidanese.netlify.app/assets/img/logo_scan.png" 
          alt="SCAN360" 
          className="sidebar-logo"
        />
        <div className="company-name">KITZANOS SOC COOP</div>
      </div>
      
      <ul className="sidebar-menu">
        <li className="sidebar-section">SEZIONI</li>
        {sections.map((section) => (
          <li
            key={section.id}
            className={`sidebar-menu-item ${currentSection === section.id ? 'active' : ''}`}
            onClick={() => onNavigate(section.id)}
          >
            <i className={section.icon}></i>
            <span>{section.label}</span>
          </li>
        ))}
      </ul>
      
      <div className="sidebar-footer">
        <button className="sidebar-btn" onClick={() => window.print()}>
          <i className="ri-printer-line"></i>
          <span>Stampa Report</span>
        </button>
      </div>
    </div>
  );
}

/**
 * ExportPDF - Pulsante export PDF
 */
export function ExportPDF() {
  const handleExport = () => {
    window.print();
  };

  return (
    <button className="export-pdf-btn" onClick={handleExport}>
      <i className="ri-download-line"></i>
      Esporta PDF
    </button>
  );
}

/**
 * NoteTecnicheSection - Sezione note tecniche completa
 */
export function NoteTecnicheSection({ data }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  return (
    <section id="note-tecniche" className="section">
      <div className="section-header">
        <h2>Note Tecniche</h2>
      </div>
      
      <Accordion items={data} />
    </section>
  );
}

export default {
  Accordion,
  AccordionItem,
  SidebarNavigation,
  ExportPDF,
  NoteTecnicheSection
};
