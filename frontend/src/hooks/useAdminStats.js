import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import propertyService from '../services/propertyService';

/**
 * Hook personalizado para obtener estadísticas del panel de administración
 * Devuelve conteos de borradores, mensajes, etc.
 */
export const useAdminStats = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [stats, setStats] = useState({
    draftsCount: 0,
    messagesCount: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        // Obtener token de Auth0
        const token = await getAccessTokenSilently();

        // Obtener borradores
        const draftsResponse = await propertyService.getDrafts({ token });
        
        // Obtener mensajes (si hay un endpoint para esto)
        // Por ahora lo dejamos en 0, se puede implementar después
        const messagesCount = 0;

        if (isMounted) {
          setStats({
            draftsCount: draftsResponse?.data?.length || 0,
            messagesCount,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error obteniendo estadísticas del admin:', error);
        if (isMounted) {
          setStats(prev => ({
            ...prev,
            loading: false,
            error: error.message
          }));
        }
      }
    };

    fetchStats();

    // Actualizar estadísticas cada 5 minutos
    const interval = setInterval(fetchStats, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [getAccessTokenSilently]);

  return stats;
};
