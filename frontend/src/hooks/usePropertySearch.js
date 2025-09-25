import { useState, useCallback } from 'react';
import { useApi } from './useApi.js';

/**
 * Hook personalizado para manejo de búsqueda de propiedades
 * Sigue la nomenclatura con prefijo 'use' en camelCase
 */
export const usePropertySearch = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();

  const searchProperties = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api('/api/v1/properties/search', {
        method: 'POST',
        body: JSON.stringify(filters)
      });
      
      setProperties(response.data || []);
    } catch (err) {
      setError(err.message || 'Error en la búsqueda');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const clearResults = useCallback(() => {
    setProperties([]);
    setError(null);
  }, []);

  return {
    properties,
    loading,
    error,
    searchProperties,
    clearResults
  };
};