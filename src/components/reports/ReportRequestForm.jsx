import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import reportService from '../../services/reportService';
import './ReportRequestForm.css';

const ReportRequestForm = ({ onReportCreated }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    piva: '',
    companyName: '',
    email: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Chiamata API backend per creare il report
      const result = await reportService.createReport(formData);
      const reportId = result.reportId;

      // Notifica il parent component (se fornito)
      if (onReportCreated) {
        onReportCreated(reportId);
      }

      // Mostra messaggio di successo
      alert(`Report richiesto con successo!\nID: ${reportId}\n\nIl report è in elaborazione. Sarai reindirizzato alla pagina di monitoraggio.`);

      // Reindirizza alla pagina del report
      navigate(`/report/${reportId}`);

      // Reset form
      setFormData({
        piva: '',
        companyName: '',
        email: '',
        phone: ''
      });
    } catch (error) {
      console.error('Errore nella richiesta del report:', error);
      alert(`Errore nella richiesta del report: ${error.message}\n\nVerifica di essere autenticato e riprova.`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      piva: '',
      companyName: '',
      email: '',
      phone: ''
    });
  };

  return (
    <form className="report-request-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="piva">
            <i className="ri-building-line"></i>
            Partita IVA *
          </label>
          <input
            type="text"
            id="piva"
            name="piva"
            value={formData.piva}
            onChange={handleChange}
            placeholder="03748590928"
            pattern="[0-9]{11}"
            title="Inserisci una P.IVA valida (11 cifre)"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="companyName">
            <i className="ri-bank-line"></i>
            Ragione Sociale *
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="ACME Corporation S.r.l."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">
            <i className="ri-mail-line"></i>
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="info@azienda.it"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">
            <i className="ri-phone-line"></i>
            Telefono
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+39 333 1234567"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleReset}
          disabled={loading}
        >
          <i className="ri-refresh-line"></i>
          Reset
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line spin"></i>
              Invio in corso...
            </>
          ) : (
            <>
              <i className="ri-file-search-line"></i>
              Richiedi Report
            </>
          )}
        </button>
      </div>

      <p className="form-note">
        <i className="ri-information-line"></i>
        Il report sarà elaborato entro 2-5 minuti. Riceverai una notifica via email quando sarà pronto.
      </p>
    </form>
  );
};

export default ReportRequestForm;
