import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { dashboardService } from '../services/dashboardService';
import messageService from '../services/messageService';
import { useAuthErrorHandler } from './useAuthErrorHandler';

/**
 * Hook personalizado para gestionar estadísticas del dashboard
 */
export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessTokenSilently } = useAuth0();
  const { handleAuthError } = useAuthErrorHandler();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getDashboardStats(getAccessTokenSilently);
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      
      // Intentar manejar el error de autenticación
      const wasAuthError = await handleAuthError(err);
      
      if (!wasAuthError) {
        setError(err.message || 'Error al cargar las estadísticas');
      }
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]); // Removido handleAuthError de las dependencias

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch
  };
};

/**
 * Hook para obtener las propiedades más recientes
 */
export const useRecentProperties = (limit = 4) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  const fetchRecentProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getRecentProperties(getAccessTokenSilently, limit);
      setProperties(data);
    } catch (err) {
      console.error('Error fetching recent properties:', err);
      setError(err.message || 'Error al cargar propiedades recientes');
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, limit]);

  useEffect(() => {
    fetchRecentProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]); // Solo re-ejecutar si cambia el límite

  return {
    properties,
    loading,
    error,
    refetch: fetchRecentProperties
  };
};

/**
 * Hook para obtener los mensajes más recientes
 */
export const useRecentMessages = (limit = 4) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  const fetchRecentMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await messageService.getRecentMessages(getAccessTokenSilently, limit);
      setMessages(data);
    } catch (err) {
      console.error('Error fetching recent messages:', err);
      setError(err.message || 'Error al cargar mensajes recientes');
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, limit]);

  useEffect(() => {
    fetchRecentMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]); // Solo re-ejecutar si cambia el límite

  return {
    messages,
    loading,
    error,
    refetch: fetchRecentMessages
  };
};