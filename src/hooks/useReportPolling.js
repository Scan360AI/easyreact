import { useState, useEffect, useRef } from 'react';
import reportService from '../services/reportService';

/**
 * Hook per fare polling di un report finché non è completato
 * @param {string} reportId - ID del report da monitorare
 * @param {number} interval - Intervallo di polling in millisecondi (default: 5000)
 * @returns {Object} { status, reportData, error }
 */
export const useReportPolling = (reportId, interval = 5000) => {
  const [status, setStatus] = useState('loading');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const attemptCountRef = useRef(0);
  const maxAttempts = 120; // 120 tentativi * 5 secondi = 10 minuti max

  useEffect(() => {
    if (!reportId) {
      setStatus('error');
      setError('Report ID non specificato');
      return;
    }

    const pollReport = async () => {
      try {
        attemptCountRef.current += 1;

        // Tenta di caricare il report
        const data = await reportService.getReport(reportId);

        // Report trovato e completato
        setReportData(data);
        setStatus('completed');
        setError(null);

        // Ferma il polling
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      } catch (err) {
        // Report non ancora pronto
        if (attemptCountRef.current >= maxAttempts) {
          // Timeout raggiunto
          setStatus('timeout');
          setError('Timeout: Il report non è stato elaborato entro il tempo limite');
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        } else {
          // Continua il polling
          setStatus('processing');
        }
      }
    };

    // Prima chiamata immediata
    setStatus('processing');
    pollReport();

    // Setup polling interval
    timerRef.current = setInterval(pollReport, interval);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [reportId, interval]);

  return {
    status, // 'loading' | 'processing' | 'completed' | 'timeout' | 'error'
    reportData,
    error,
    attemptCount: attemptCountRef.current,
    progress: Math.min((attemptCountRef.current / maxAttempts) * 100, 100)
  };
};

export default useReportPolling;
