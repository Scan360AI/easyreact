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

        // Tenta di caricare il report dal backend
        const report = await reportService.getReport(reportId);

        // Check report status
        if (report.status === 'completed' && report.payload) {
          // Report completato con successo
          setReportData(report.payload); // payload contiene i dati del report
          setStatus('completed');
          setError(null);

          // Ferma il polling
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        } else if (report.status === 'failed') {
          // Report fallito
          setStatus('error');
          setError(report.error_message || 'Report generation failed');
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        } else {
          // Report ancora in processing
          setStatus('processing');
        }
      } catch (err) {
        // Errore nel caricamento (401, 404, network error, etc.)
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
