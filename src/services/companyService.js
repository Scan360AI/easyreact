/**
 * Company Service
 * Gestisce le chiamate API relative alle aziende
 * Adattato per ScanEasy API
 */

import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const companyService = {
  /**
   * Cerca una company per PIVA
   * @param {string} piva - Partita IVA
   * @returns {Promise<Object|null>} Company se esiste, null altrimenti
   */
  async getByPiva(piva) {
    try {
      const response = await fetch(`${API_URL}/api/companies/by-piva/${piva}`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });

      if (response.status === 404) {
        return null; // Company non trovata
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Errore nel recupero della company');
      }

      return data;
    } catch (error) {
      console.error('Errore nel recupero della company:', error);
      throw error;
    }
  },

  /**
   * Crea una nuova company
   * @param {Object} companyData - Dati della company (piva, ragione_sociale)
   * @returns {Promise<Object>} Company creata
   */
  async create(companyData) {
    try {
      const response = await fetch(`${API_URL}/api/companies/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify({
          piva: companyData.piva,
          ragione_sociale: companyData.ragione_sociale || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Errore nella creazione della company');
      }

      return data;
    } catch (error) {
      console.error('Errore nella creazione della company:', error);
      throw error;
    }
  },

  /**
   * Ottieni una company per ID
   * @param {string} companyId - ID della company
   * @returns {Promise<Object>} Company
   */
  async getById(companyId) {
    try {
      const response = await fetch(`${API_URL}/api/companies/${companyId}`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Company non trovata');
      }

      return data;
    } catch (error) {
      console.error('Errore nel recupero della company:', error);
      throw error;
    }
  },

  /**
   * Ottieni tutte le companies (admin only)
   * @param {Object} params - Parametri di paginazione (skip, limit)
   * @returns {Promise<Array>} Lista delle companies
   */
  async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.skip !== undefined) queryParams.append('skip', params.skip);
      if (params.limit !== undefined) queryParams.append('limit', params.limit);

      const queryString = queryParams.toString();
      const url = `${API_URL}/api/companies/${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        headers: {
          ...authService.getAuthHeader()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Errore nel caricamento delle companies');
      }

      return data;
    } catch (error) {
      console.error('Errore nel caricamento delle companies:', error);
      throw error;
    }
  },

  /**
   * Aggiorna una company
   * @param {string} companyId - ID della company
   * @param {Object} updates - Dati da aggiornare
   * @returns {Promise<Object>} Company aggiornata
   */
  async update(companyId, updates) {
    try {
      const response = await fetch(`${API_URL}/api/companies/${companyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Errore nell\'aggiornamento della company');
      }

      return data;
    } catch (error) {
      console.error('Errore nell\'aggiornamento della company:', error);
      throw error;
    }
  },

  /**
   * Elimina una company (admin only)
   * @param {string} companyId - ID della company
   * @returns {Promise<Object>} Conferma eliminazione
   */
  async delete(companyId) {
    try {
      const response = await fetch(`${API_URL}/api/companies/${companyId}`, {
        method: 'DELETE',
        headers: {
          ...authService.getAuthHeader()
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Errore nell\'eliminazione della company');
      }

      return data;
    } catch (error) {
      console.error('Errore nell\'eliminazione della company:', error);
      throw error;
    }
  },

  /**
   * Trova o crea una company
   * Helper method per il flusso di creazione report:
   * 1. Cerca la company per PIVA
   * 2. Se non esiste, la crea
   * 3. Restituisce la company (esistente o nuova)
   *
   * @param {Object} companyData - Dati della company (piva, ragione_sociale)
   * @returns {Promise<Object>} Company trovata o creata
   */
  async findOrCreate(companyData) {
    try {
      // Prima prova a cercarla
      const existing = await this.getByPiva(companyData.piva);

      if (existing) {
        return existing;
      }

      // Se non esiste, creala
      return await this.create(companyData);
    } catch (error) {
      console.error('Errore in findOrCreate:', error);
      throw error;
    }
  }
};

export default companyService;
