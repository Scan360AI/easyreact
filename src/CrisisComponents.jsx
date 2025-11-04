import React from 'react';

/**
 * StatusOverview - Overview dello stato complessivo degli indici
 */
export function StatusOverview({ status }) {
  return (
    <div className="crisis-status-overview">
      <div className="status-header">
        <div className="status-icon-wrapper">
          <i className="ri-alert-line"></i>
        </div>
        <div>
          <h3>Stato Complessivo</h3>
          <p>Valutazione generale D.Lgs. 14/2019</p>
        </div>
      </div>
      
      <div className="status-metrics">
        <div className="status-metric">
          <div className="metric-label">Status</div>
          <div className={`metric-value ${status.colorClass}`}>{status.overall}</div>
        </div>
        <div className="status-metric">
          <div className="metric-label">Indici OK</div>
          <div className="metric-value positive">{status.indiciOk}/{status.totale}</div>
        </div>
        <div className="status-metric">
          <div className="metric-label">In Allerta</div>
          <div className="metric-value negative">{status.indiciAllerta}/{status.totale}</div>
        </div>
        <div className="status-metric">
          <div className="metric-label">Mancante</div>
          <div className="metric-value neutral">{status.indiciMancanti}/{status.totale}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * IndicesTable - Tabella con i 7 indici del Codice della Crisi
 */
export function IndicesTable({ indices }) {
  return (
    <div className="crisis-indices-table">
      <h3>
        <i className="ri-bar-chart-box-line"></i>
        Analisi dei 7 Indicatori di Allerta
      </h3>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Indice</th>
              <th>Valore Kitzanos</th>
              <th>Soglia Settore</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {indices.map((index) => (
              <tr key={index.id}>
                <td>
                  <div className="index-name">{index.number}. {index.name}</div>
                  <div className="index-description">{index.description}</div>
                </td>
                <td className="text-center">
                  <div className={`index-value ${index.colorClass}`}>{index.value}</div>
                  <div className="index-detail">{index.detail}</div>
                </td>
                <td className="text-center">
                  <div className="index-soglia">{index.soglia}</div>
                  <div className="index-detail">{index.sogliaNote}</div>
                </td>
                <td className="text-center">
                  <div className={`status-badge ${index.colorClass}`}>
                    <i className={index.statusIcon}></i>
                    {index.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * NoteCard - Card per note importanti
 */
export function NoteCard({ note }) {
  return (
    <div className={`note-card ${note.colorClass}`}>
      <div className="note-icon-wrapper">
        <i className={note.icon}></i>
      </div>
      <div className="note-content">
        <h4>{note.title}</h4>
        <p>{note.text}</p>
      </div>
    </div>
  );
}

/**
 * ReferenceCard - Card per riferimenti normativi
 */
export function ReferenceCard({ reference }) {
  return (
    <div className={`reference-card ${reference.colorClass}`}>
      <div className="reference-title">{reference.title}</div>
      <div className="reference-description">{reference.description}</div>
    </div>
  );
}

/**
 * CodiceCrisiSection - Sezione completa Codice della Crisi
 */
export function CodiceCrisiSection({ data }) {
  if (!data) return null;

  return (
    <section id="codice-crisi" className="section">
      <div className="section-header">
        <h2>{data.title}</h2>
      </div>
      
      {/* Status Overview */}
      <StatusOverview status={data.status} />
      
      {/* Tabella Indici */}
      <IndicesTable indices={data.indices} />
      
      {/* Note Importanti */}
      <div className="notes-grid">
        {data.notes.map(note => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
      
      {/* Riferimenti Normativi */}
      <div className="references-section">
        <h3>
          <i className="ri-book-open-line"></i>
          Riferimenti Normativi
        </h3>
        <div className="references-grid">
          {data.references.map(ref => (
            <ReferenceCard key={ref.id} reference={ref} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default {
  StatusOverview,
  IndicesTable,
  NoteCard,
  ReferenceCard,
  CodiceCrisiSection
};
