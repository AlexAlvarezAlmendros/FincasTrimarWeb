import { useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

/**
 * Hook personalizado para realizar llamadas a la API del admin
 * Proporciona funcionalidades comunes como loading, error handling y retry
 */
export const useAdminApi = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Error en la conexión con el servidor');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    apiCall,
    loading,
    error,
    clearError
  };
};

/**
 * Hook específico para gestión de propiedades/viviendas
 */
export const usePropertiesApi = () => {
  const { apiCall, loading, error, clearError } = useAdminApi();

  // Obtener lista de propiedades con filtros
  const getProperties = useCallback(async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('q', filters.search);
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.type && filters.type !== 'all') queryParams.append('tipo', filters.type);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);

    const url = `/api/v1/viviendas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiCall(url);
  }, [apiCall]);

  // Obtener una propiedad específica
  const getProperty = useCallback(async (id) => {
    return await apiCall(`/api/v1/viviendas/${id}`);
  }, [apiCall]);

  // Crear nueva propiedad
  const createProperty = useCallback(async (propertyData) => {
    return await apiCall('/api/v1/viviendas', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }, [apiCall]);

  // Actualizar propiedad existente
  const updateProperty = useCallback(async (id, propertyData) => {
    return await apiCall(`/api/v1/viviendas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  }, [apiCall]);

  // Eliminar propiedad
  const deleteProperty = useCallback(async (id) => {
    return await apiCall(`/api/v1/viviendas/${id}`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  // Publicar/despublicar propiedad
  const togglePropertyStatus = useCallback(async (id) => {
    return await apiCall(`/api/v1/viviendas/${id}/publicar`, {
      method: 'POST',
    });
  }, [apiCall]);

  return {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    togglePropertyStatus,
    loading,
    error,
    clearError
  };
};

/**
 * Hook para gestión de imágenes
 */
export const useImagesApi = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subir imágenes
  const uploadImages = useCallback(async (files) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      // Para FormData no establecemos Content-Type, el browser lo hace automáticamente
      const token = await getAccessTokenSilently();

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error subiendo imágenes');
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  const { apiCall, loading: apiLoading, error: apiError, clearError } = useAdminApi();

  // Asociar imágenes a una vivienda
  const attachImagesToProperty = useCallback(async (propertyId, images) => {
    return await apiCall(`/api/v1/viviendas/${propertyId}/imagenes`, {
      method: 'POST',
      body: JSON.stringify(images),
    });
  }, [apiCall]);

  // Eliminar imagen de una vivienda
  const removeImageFromProperty = useCallback(async (propertyId, imageId) => {
    return await apiCall(`/api/v1/viviendas/${propertyId}/imagenes/${imageId}`, {
      method: 'DELETE',
    });
  }, [apiCall]);

  const clearAllErrors = useCallback(() => {
    setError(null);
    clearError();
  }, [clearError]);

  return {
    uploadImages,
    attachImagesToProperty,
    removeImageFromProperty,
    loading: loading || apiLoading,
    error: error || apiError,
    clearError: clearAllErrors
  };
};

/**
 * Hook para gestión de mensajes
 */
export const useMessagesApi = () => {
  const { apiCall, loading, error, clearError } = useAdminApi();

  // Obtener lista de mensajes con filtros
  const getMessages = useCallback(async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') queryParams.append('estado', filters.status);
    if (filters.pinned !== undefined) queryParams.append('pinned', filters.pinned);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);

    const url = `/api/v1/mensajes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiCall(url);
  }, [apiCall]);

  // Obtener mensaje específico
  const getMessage = useCallback(async (id) => {
    return await apiCall(`/api/v1/mensajes/${id}`);
  }, [apiCall]);

  // Actualizar estado del mensaje
  const updateMessageStatus = useCallback(async (id, status, pinned) => {
    const body = {};
    if (status !== undefined) body.estado = status;
    if (pinned !== undefined) body.pinned = pinned;

    return await apiCall(`/api/v1/mensajes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }, [apiCall]);

  // Marcar mensaje como leído/pendiente
  const toggleMessageStatus = useCallback(async (id) => {
    return await apiCall(`/api/v1/mensajes/${id}/toggle-status`, {
      method: 'POST',
    });
  }, [apiCall]);

  return {
    getMessages,
    getMessage,
    updateMessageStatus,
    toggleMessageStatus,
    loading,
    error,
    clearError
  };
};

/**
 * Hook para estadísticas y analytics
 */
export const useAnalyticsApi = () => {
  const { apiCall, loading, error, clearError } = useAdminApi();

  // Obtener métricas del dashboard
  const getDashboardMetrics = useCallback(async () => {
    return await apiCall('/api/v1/analytics/dashboard');
  }, [apiCall]);

  // Obtener estadísticas de propiedades
  const getPropertyStats = useCallback(async (propertyId, dateRange = '30d') => {
    return await apiCall(`/api/v1/analytics/properties/${propertyId}?range=${dateRange}`);
  }, [apiCall]);

  // Obtener estadísticas generales
  const getGeneralStats = useCallback(async (dateRange = '30d') => {
    return await apiCall(`/api/v1/analytics/general?range=${dateRange}`);
  }, [apiCall]);

  return {
    getDashboardMetrics,
    getPropertyStats,
    getGeneralStats,
    loading,
    error,
    clearError
  };
};

export default useAdminApi;