import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { dashboardService } from '../services/dashboardService';
import messageService from '../services/messageService';

/**
 * Hook personalizado para gestionar estadísticas del dashboard
 */
export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getDashboardStats(getAccessTokenSilently);
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message || 'Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
 * Hook para obtener ventas mensuales específicamente
 */
export const useMonthlySales = () => {
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  const fetchMonthlySales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getMonthlySales(getAccessTokenSilently);
      setMonthlySales(data);
    } catch (err) {
      console.error('Error fetching monthly sales:', err);
      setError(err.message || 'Error al cargar las ventas mensuales');
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchMonthlySales();
  }, [fetchMonthlySales]);

  return {
    monthlySales,
    loading,
    error,
    refetch: fetchMonthlySales
  };
};

/**
 * Hook para obtener estadísticas por tipo de propiedad
 */
export const usePropertyTypeStats = () => {
  const [typeStats, setTypeStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  const fetchTypeStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getPropertyTypeStats(getAccessTokenSilently);
      setTypeStats(data);
    } catch (err) {
      console.error('Error fetching property type stats:', err);
      setError(err.message || 'Error al cargar estadísticas por tipo');
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchTypeStats();
  }, [fetchTypeStats]);

  return {
    typeStats,
    loading,
    error,
    refetch: fetchTypeStats
  };
};

/**
 * Hook para obtener estadísticas por ubicación
 */
export const useLocationStats = () => {
  const [locationStats, setLocationStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  const fetchLocationStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dashboardService.getLocationStats(getAccessTokenSilently);
      setLocationStats(data);
    } catch (err) {
      console.error('Error fetching location stats:', err);
      setError(err.message || 'Error al cargar estadísticas por ubicación');
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchLocationStats();
  }, [fetchLocationStats]);

  return {
    locationStats,
    loading,
    error,
    refetch: fetchLocationStats
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
  }, [fetchRecentProperties]);

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
  }, [fetchRecentMessages]);

  return {
    messages,
    loading,
    error,
    refetch: fetchRecentMessages
  };
};