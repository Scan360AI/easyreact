import { useState, useEffect } from 'react';
import reportService from '../services/reportService';

/**
 * Hook per caricare e gestire la lista dei report dell'utente
 * @param {Object} filters - Filtri opzionali (status, search, etc.)
 * @returns {Object} { reports, loading, error, refreshReports, pagination }
 */
export const useReports = (filters = {}) => {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReports = async (customFilters) => {
    try {
      setLoading(true);
      setError(null);
      const finalFilters = customFilters || filters;
      const data = await reportService.getMyReports(finalFilters);
      setReports(data.reports || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.message);
      console.error('Errore nel caricamento dei report:', err);
      // If auth error, reports will be empty
      if (err.message.includes('401') || err.message.includes('Authentication')) {
        setReports([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]); // Re-load when filters change

  // Funzione per ricaricare manualmente i report
  const refreshReports = (customFilters) => {
    loadReports(customFilters);
  };

  return {
    reports,
    pagination,
    loading,
    error,
    refreshReports
  };
};

export default useReports;
