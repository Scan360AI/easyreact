/**
 * Service per gestire le chiamate API relative ai report finanziari
 */

// URL webhook n8n (da configurare in .env per produzione)
const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL ||
  'https://n8n.example.com/webhook/create-report';

const reportService = {
  /**
   * Richiedi un nuovo report finanziario
   * @param {Object} data - Dati della richiesta (piva, companyName, email, etc.)
   * @returns {Promise} Response con reportId e status
   */
  async createReport(data) {
    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Errore nella creazione del report:', error);
      throw error;
    }
  },

  /**
   * Carica l'indice di tutti i report disponibili
   * @returns {Promise} Lista dei report
   */
  async getReportsIndex() {
    try {
      const response = await fetch('/data/reports-index.json');

      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Errore nel caricamento dell\'indice report:', error);
      throw error;
    }
  },

  /**
   * Carica i dati completi di un singolo report
   * @param {string} reportId - ID del report da caricare
   * @returns {Promise} Dati completi del report
   */
  async getReport(reportId) {
    try {
      const response = await fetch(`/data/reports/${reportId}.json`);

      if (!response.ok) {
        throw new Error(`Report non trovato: ${reportId}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Errore nel caricamento del report ${reportId}:`, error);
      throw error;
    }
  },

  /**
   * Verifica se un report è stato completato
   * @param {string} reportId - ID del report da verificare
   * @returns {Promise<boolean>} True se il report esiste ed è completo
   */
  async checkReportStatus(reportId) {
    try {
      const response = await fetch(`/data/reports/${reportId}.json`, {
        method: 'HEAD' // Solo headers, non scarichiamo il contenuto
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
};

export default reportService;
