import { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { dashboardService } from '../services/dashboardService';

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