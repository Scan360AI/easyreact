/**
 * Service per gestire le chiamate API relative ai report finanziari
 * Adattato per ScanEasy API
 */

import authService from './authService';
import companyService from './companyService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const reportService = {
  /**
   * Richiedi un nuovo report finanziario
   * Flow:
   * 1. Trova o crea la company con la PIVA fornita
   * 2. Crea il report con user_id e company_id
   * 3. Il backend triggera automaticamente n8n
   *
   * @param {Object} data - Dati della richiesta (piva, ragione_sociale)
   * @returns {Promise} Report creato con status 'PROCESSING'
   */
  async createReport(data) {
    try {
      // Ottieni user_id dal localStorage
      const user = authService.getUser();
      if (!user || !user.id) {
        throw new Error('Utente non autenticato');
      }

      // 1. Trova o crea la company
      const company = await companyService.findOrCreate({
        piva: data.piva,
        ragione_sociale: data.ragione_sociale || null
      });

      // 2. Crea il report con user_id e company_id
      const response = await fetch(`${API_URL}/api/reports/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify({
          user_id: user.id,
          company_id: company.id,
          status: 'PROCESSING'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || result.message || 'Errore nella creazione del report');
      }

      return result;
    } catch (error) {
      console.error('Errore nella creazione del report:', error);
      throw error;
    }
  },

  /**
   * Carica la lista dei report dell'utente corrente
   * @param {Object} filters - Filtri opzionali (skip, limit)
   * @returns {Promise} Lista dei report
   */
  async getMyReports(filters = {}) {
    try {
      const user = authService.getUser();
      if (!user || !user.id) {
        throw new Error('Utente non autenticato');
      }

      // Build query string
      const queryParams = new URLSearchParams();
      if (filters.skip !== undefined) queryParams.append('skip', filters.skip);
      if (filters.limit !== undefined) queryParams.append('limit', filters.limit || 100);

      const queryString = queryParams.toString();
      const url = `${API_URL}/api/reports/user/${user.id}${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        headers: {
          ...authService.getAuthHeader()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Errore nel caricamento dei report');
      }

      // L'API restituisce un array di report
      return {
        reports: data,
        total: data.length
      };
    } catch (error) {
      console.error('Errore nel caricamento dei report:', error);
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
      const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || `Report non trovato: ${reportId}`);
      }

      // L'API restituisce direttamente l'oggetto report
      return data;
    } catch (error) {
      console.error(`Errore nel caricamento del report ${reportId}:`, error);
      throw error;
    }
  },

  /**
   * Ottieni i report di una company specifica
   * @param {string} companyId - ID della company
   * @param {Object} filters - Filtri opzionali (skip, limit)
   * @returns {Promise} Lista dei report della company
   */
  async getCompanyReports(companyId, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.skip !== undefined) queryParams.append('skip', filters.skip);
      if (filters.limit !== undefined) queryParams.append('limit', filters.limit || 100);

      const queryString = queryParams.toString();
      const url = `${API_URL}/api/reports/company/${companyId}${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        headers: {
          ...authService.getAuthHeader()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Errore nel caricamento dei report della company');
      }

      return data;
    } catch (error) {
      console.error('Errore nel caricamento dei report della company:', error);
      throw error;
    }
  },

  /**
   * Elimina un report
   * @param {string} reportId - ID del report da eliminare
   * @returns {Promise} Conferma eliminazione
   */
  async deleteReport(reportId) {
    try {
      const response = await fetch(`${API_URL}/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          ...authService.getAuthHeader()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Errore nell\'eliminazione del report');
      }

      return data;
    } catch (error) {
      console.error(`Errore nell'eliminazione del report ${reportId}:`, error);
      throw error;
    }
  },

  /**
   * Aggiorna lo status di un report
   * Usato principalmente dal backend/n8n, ma disponibile anche per il frontend
   * @param {string} reportId - ID del report
   * @param {string} status - Nuovo status
   * @param {string} errorMessage - Messaggio di errore (opzionale)
   * @returns {Promise} Report aggiornato
   */
  async updateStatus(reportId, status, errorMessage = null) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('status', status);
      if (errorMessage) queryParams.append('error_message', errorMessage);

      const response = await fetch(`${API_URL}/api/reports/${reportId}/status?${queryParams.toString()}`, {
        method: 'PUT',
        headers: {
          ...authService.getAuthHeader()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Errore nell\'aggiornamento dello status');
      }

      return data;
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello status:', error);
      throw error;
    }
  },

  /**
   * Aggiorna il risk assessment di un report
   * @param {string} reportId - ID del report
   * @param {number} riskScore - Score di rischio
   * @param {string} riskCategory - Categoria di rischio
   * @returns {Promise} Report aggiornato
   */
  async updateRiskAssessment(reportId, riskScore, riskCategory) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('risk_score', riskScore);
      queryParams.append('risk_category', riskCategory);

      const response = await fetch(`${API_URL}/api/reports/${reportId}/risk-assessment?${queryParams.toString()}`, {
        method: 'PUT',
        headers: {
          ...authService.getAuthHeader()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Errore nell\'aggiornamento del risk assessment');
      }

      return data;
    } catch (error) {
      console.error('Errore nell\'aggiornamento del risk assessment:', error);
      throw error;
    }
  }
};

export default reportService;
