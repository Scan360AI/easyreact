import { useState, useEffect } from 'react';
import reportService from '../services/reportService';

/**
 * Hook per caricare e gestire l'indice dei report
 * @returns {Object} { reports, loading, error, refreshReports }
 */
export const useReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getReportsIndex();
      setReports(data.reports || []);
    } catch (err) {
      setError(err.message);
      console.error('Errore nel caricamento dei report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Funzione per ricaricare manualmente i report
  const refreshReports = () => {
    loadReports();
  };

  return {
    reports,
    loading,
    error,
    refreshReports
  };
};

export default useReports;
