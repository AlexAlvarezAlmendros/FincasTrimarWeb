import { useState, useEffect } from 'react';
import { useApi } from './useApi.js';

/**
 * Estadísticas para el panel de administración.
 * `messagesCount` = mensajes pendientes (Nuevo + En curso), para el badge del
 * sidebar y el acceso rápido del dashboard. Usa useApi (Auth0), no el
 * messageService (que depende de un token de localStorage inexistente).
 */
export const useAdminStats = () => {
  const api = useApi();
  const [stats, setStats] = useState({
    messagesCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;

    api('/api/v1/messages/stats', { method: 'GET' })
      .then((res) => {
        if (!active) return;
        const s = res.data || {};
        const pending = (s.nuevo || 0) + (s.enCurso || 0);
        setStats({ messagesCount: pending, loading: false, error: null });
      })
      .catch((err) => {
        if (!active) return;
        console.error('Error obteniendo estadísticas del admin:', err);
        setStats({ messagesCount: 0, loading: false, error: err.message || 'error' });
      });

    return () => {
      active = false;
    };
  }, [api]);

  return stats;
};

export default useAdminStats;
