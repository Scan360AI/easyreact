/**
 * Service per gestire le chiamate API relative ai report finanziari
 * Ora integrato con backend API
 */

import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const reportService = {
  /**
   * Richiedi un nuovo report finanziario
   * @param {Object} data - Dati della richiesta (piva, companyName, email, phone)
   * @returns {Promise} Response con reportId e status
   */
  async createReport(data) {
    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Errore nella creazione del report');
      }

      return result;
    } catch (error) {
      console.error('Errore nella creazione del report:', error);
      throw error;
    }
  },

  /**
   * Carica la lista dei report dell'utente corrente
   * @param {Object} filters - Filtri opzionali (status, search, from, to, limit, offset)
   * @returns {Promise} Lista dei report con paginazione
   */
  async getMyReports(filters = {}) {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.from) queryParams.append('from', filters.from);
      if (filters.to) queryParams.append('to', filters.to);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);

      const queryString = queryParams.toString();
      const url = `${API_URL}/api/my/reports${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        headers: {
          ...authService.getAuthHeader()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore nel caricamento dei report');
      }

      return data;
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
        throw new Error(data.message || `Report non trovato: ${reportId}`);
      }

      // Return the full report object with payload
      return data.report;
    } catch (error) {
      console.error(`Errore nel caricamento del report ${reportId}:`, error);
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
        throw new Error(data.message || 'Errore nell\'eliminazione del report');
      }

      return data;
    } catch (error) {
      console.error(`Errore nell'eliminazione del report ${reportId}:`, error);
      throw error;
    }
  },

  /**
   * Get dashboard statistics
   * @returns {Promise} Dashboard stats
   */
  async getStats() {
    try {
      const response = await fetch(`${API_URL}/api/my/stats`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore nel caricamento delle statistiche');
      }

      return data;
    } catch (error) {
      console.error('Errore nel caricamento delle statistiche:', error);
      throw error;
    }
  }
};

export default reportService;
