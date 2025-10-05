/**
 * Hook personalizado para gestión de viviendas
 * Incluye cache, debounce, paginación y prevención de memory leaks
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import propertyService from '../services/propertyService.js';
import {
  ViviendaFilters,
  PaginationModel,
  HookStates,
  DataTransformers
} from '../types/vivienda.types.js';

/**
 * Cache simple para viviendas con TTL (Time To Live)
 */
class PropertyCache {
  constructor(ttl = 300000) { // 5 minutos por defecto
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Verificar si el cache ha expirado
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  generateKey(filters, method = 'getProperties') {
    return `${method}_${JSON.stringify(filters)}`;
  }
}

// Instancia global del cache
const propertyCache = new PropertyCache();

/**
 * Hook principal para gestionar viviendas
 */
export const useViviendas = (initialFilters = {}, options = {}) => {
  // Opciones del hook
  const {
    enableCache = true,
    debounceMs = 500,
    autoFetch = true,
    onError,
    onSuccess
  } = options;

  // Estados principales
  const [state, setState] = useState(HookStates.IDLE);
  const [viviendas, setViviendas] = useState([]);
  const [pagination, setPagination] = useState(PaginationModel.createDefault());
  const [error, setError] = useState(null);
  
  // Estado de filtros con valores por defecto
  const [filters, setFilters] = useState(() => ({
    ...ViviendaFilters.createEmpty(),
    ...initialFilters
  }));

  // Referencias para prevenir memory leaks
  const abortControllerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Limpiar referencias al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Función para actualizar el estado de forma segura
   */
  const safeSetState = useCallback((newState) => {
    if (isMountedRef.current) {
      setState(newState);
    }
  }, []);

  const safeSetViviendas = useCallback((newViviendas) => {
    if (isMountedRef.current) {
      setViviendas(newViviendas);
    }
  }, []);

  const safeSetPagination = useCallback((newPagination) => {
    if (isMountedRef.current) {
      setPagination(newPagination);
    }
  }, []);

  const safeSetError = useCallback((newError) => {
    if (isMountedRef.current) {
      setError(newError);
    }
  }, []);

  /**
   * Función principal para obtener viviendas
   */
  const fetchViviendas = useCallback(async (searchFilters = filters, useSearch = false) => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo controlador de abort
    abortControllerRef.current = new AbortController();

    try {
      safeSetState(HookStates.LOADING);
      safeSetError(null);

      // Verificar cache si está habilitado
      const method = useSearch ? 'searchProperties' : 'getProperties';
      const cacheKey = propertyCache.generateKey(searchFilters, method);
      
      if (enableCache) {
        const cachedData = propertyCache.get(cacheKey);
        if (cachedData) {
          const transformed = DataTransformers.transformAPIResponse(cachedData);
          safeSetViviendas(transformed.viviendas);
          safeSetPagination(transformed.pagination);
          safeSetState(HookStates.SUCCESS);
          
          if (onSuccess) {
            onSuccess(transformed);
          }
          
          return transformed;
        }
      }

      // Realizar petición al API
      let response;
      if (useSearch) {
        response = await propertyService.searchProperties(searchFilters);
      } else {
        response = await propertyService.getProperties(searchFilters);
      }

      // Verificar si el componente sigue montado
      if (!isMountedRef.current) return;

      // Guardar en cache
      if (enableCache) {
        propertyCache.set(cacheKey, response);
      }

      // Transformar datos
      const transformed = DataTransformers.transformAPIResponse(response);
      
      safeSetViviendas(transformed.viviendas);
      safeSetPagination(transformed.pagination);
      safeSetState(HookStates.SUCCESS);

      if (onSuccess) {
        onSuccess(transformed);
      }

      return transformed;

    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Petición cancelada, no hacer nada
      }

      console.error('Error fetching viviendas:', error);
      
      safeSetError(error.message || 'Error al obtener viviendas');
      safeSetState(HookStates.ERROR);

      if (onError) {
        onError(error);
      }

      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [filters, enableCache, onSuccess, onError, safeSetState, safeSetViviendas, safeSetPagination, safeSetError]);

  /**
   * Función con debounce para búsquedas en tiempo real
   */
  const debouncedFetch = useCallback((searchFilters, useSearch = false) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchViviendas(searchFilters, useSearch);
    }, debounceMs);
  }, [fetchViviendas, debounceMs]);

  /**
   * Actualizar filtros y refetch automático si está habilitado
   */
  const updateFilters = useCallback((newFilters, options = {}) => {
    const { 
      merge = true, 
      resetPagination = true, 
      debounce = false,
      useSearch = false 
    } = options;

    const updatedFilters = merge 
      ? { ...filters, ...newFilters }
      : { ...ViviendaFilters.createEmpty(), ...newFilters };

    // Reset página si se especifica
    if (resetPagination) {
      updatedFilters.page = 1;
    }

    setFilters(updatedFilters);

    // Auto fetch si está habilitado
    if (autoFetch) {
      if (debounce) {
        debouncedFetch(updatedFilters, useSearch);
      } else {
        fetchViviendas(updatedFilters, useSearch);
      }
    }
  }, [filters, autoFetch, debouncedFetch, fetchViviendas]);

  /**
   * Funciones de utilidad específicas
   */
  const searchViviendas = useCallback((searchFilters, useDebounce = false) => {
    const finalFilters = { ...filters, ...searchFilters };
    
    if (useDebounce) {
      debouncedFetch(finalFilters, true);
    } else {
      return fetchViviendas(finalFilters, true);
    }
  }, [filters, debouncedFetch, fetchViviendas]);

  const goToPage = useCallback((page) => {
    updateFilters({ page }, { resetPagination: false });
  }, [updateFilters]);

  const resetFilters = useCallback(() => {
    const defaultFilters = ViviendaFilters.createEmpty();
    updateFilters(defaultFilters, { merge: false });
  }, [updateFilters]);

  const refreshViviendas = useCallback(() => {
    // Limpiar cache y refetch
    if (enableCache) {
      propertyCache.clear();
    }
    return fetchViviendas(filters);
  }, [enableCache, fetchViviendas, filters]);

  /**
   * Fetch inicial automático si está habilitado
   */
  useEffect(() => {
    if (autoFetch && state === HookStates.IDLE) {
      fetchViviendas(filters);
    }
  }, []); // Solo en mount inicial

  /**
   * Estados derivados computados
   */
  const isLoading = useMemo(() => state === HookStates.LOADING, [state]);
  const isError = useMemo(() => state === HookStates.ERROR, [state]);
  const isSuccess = useMemo(() => state === HookStates.SUCCESS, [state]);
  const isEmpty = useMemo(() => isSuccess && viviendas.length === 0, [isSuccess, viviendas.length]);
  const hasNextPage = useMemo(() => pagination.page < pagination.totalPages, [pagination]);
  const hasPrevPage = useMemo(() => pagination.page > 1, [pagination]);

  return {
    // Estados principales
    viviendas,
    pagination,
    error,
    
    // Estados derivados
    isLoading,
    isError,
    isSuccess,
    isEmpty,
    hasNextPage,
    hasPrevPage,
    
    // Filtros actuales
    filters,
    
    // Funciones de manipulación
    fetchViviendas,
    searchViviendas,
    updateFilters,
    goToPage,
    resetFilters,
    refreshViviendas,
    
    // Utilidades
    clearError: () => safeSetError(null),
    clearCache: () => propertyCache.clear()
  };
};

/**
 * Hook específico para obtener una sola vivienda por ID
 */
export const useVivienda = (id, options = {}) => {
  const { enableCache = true, autoFetch = true, onError, onSuccess } = options;
  
  const [state, setState] = useState(HookStates.IDLE);
  const [vivienda, setVivienda] = useState(null);
  const [error, setError] = useState(null);
  
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchVivienda = useCallback(async (viviendaId = id) => {
    if (!viviendaId) {
      setError('ID de vivienda requerido');
      setState(HookStates.ERROR);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setState(HookStates.LOADING);
      setError(null);

      // Verificar cache
      const cacheKey = `vivienda_${viviendaId}`;
      if (enableCache) {
        const cachedData = propertyCache.get(cacheKey);
        if (cachedData) {
          if (isMountedRef.current) {
            setVivienda(cachedData.data);
            setState(HookStates.SUCCESS);
            
            if (onSuccess) {
              onSuccess(cachedData.data);
            }
          }
          return cachedData.data;
        }
      }

      const response = await propertyService.getPropertyById(viviendaId);
      
      if (!isMountedRef.current) return;

      // Guardar en cache
      if (enableCache) {
        propertyCache.set(cacheKey, response);
      }

      setVivienda(response.data);
      setState(HookStates.SUCCESS);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;

    } catch (error) {
      if (error.name === 'AbortError') return;

      console.error('Error fetching vivienda:', error);
      
      if (isMountedRef.current) {
        setError(error.message || 'Error al obtener la vivienda');
        setState(HookStates.ERROR);
        
        if (onError) {
          onError(error);
        }
      }

      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [id, enableCache, onSuccess, onError]);

  // Fetch inicial
  useEffect(() => {
    if (autoFetch && id && state === HookStates.IDLE) {
      fetchVivienda(id);
    }
  }, [id, autoFetch, fetchVivienda, state]);

  const isLoading = useMemo(() => state === HookStates.LOADING, [state]);
  const isError = useMemo(() => state === HookStates.ERROR, [state]);
  const isSuccess = useMemo(() => state === HookStates.SUCCESS, [state]);

  return {
    vivienda,
    error,
    isLoading,
    isError,
    isSuccess,
    fetchVivienda,
    refetch: () => fetchVivienda(id),
    clearError: () => setError(null)
  };
};

/**
 * Hook para propiedades similares
 */
export const useSimilarViviendas = (viviendaId, limit = 4, options = {}) => {
  const { enableCache = true, autoFetch = true, onError, onSuccess } = options;
  
  const [state, setState] = useState(HookStates.IDLE);
  const [similarViviendas, setSimilarViviendas] = useState([]);
  const [error, setError] = useState(null);
  
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchSimilarViviendas = useCallback(async () => {
    if (!viviendaId) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setState(HookStates.LOADING);
      setError(null);

      // Verificar cache
      const cacheKey = `similar_${viviendaId}_${limit}`;
      if (enableCache) {
        const cachedData = propertyCache.get(cacheKey);
        if (cachedData) {
          if (isMountedRef.current) {
            setSimilarViviendas(cachedData.data);
            setState(HookStates.SUCCESS);
            
            if (onSuccess) {
              onSuccess(cachedData.data);
            }
          }
          return cachedData.data;
        }
      }

      const response = await propertyService.getSimilarProperties(viviendaId, limit);
      
      if (!isMountedRef.current) return;

      // Guardar en cache
      if (enableCache) {
        propertyCache.set(cacheKey, response);
      }

      setSimilarViviendas(response.data);
      setState(HookStates.SUCCESS);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;

    } catch (error) {
      if (error.name === 'AbortError') return;

      console.error('Error fetching similar viviendas:', error);
      
      if (isMountedRef.current) {
        setError(error.message || 'Error al obtener viviendas similares');
        setState(HookStates.ERROR);
        
        if (onError) {
          onError(error);
        }
      }

      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [viviendaId, limit, enableCache, onSuccess, onError]);

  // Fetch inicial
  useEffect(() => {
    if (autoFetch && viviendaId && state === HookStates.IDLE) {
      fetchSimilarViviendas();
    }
  }, [viviendaId, autoFetch, fetchSimilarViviendas, state]);

  const isLoading = useMemo(() => state === HookStates.LOADING, [state]);
  const isError = useMemo(() => state === HookStates.ERROR, [state]);
  const isSuccess = useMemo(() => state === HookStates.SUCCESS, [state]);
  const isEmpty = useMemo(() => isSuccess && similarViviendas.length === 0, [isSuccess, similarViviendas.length]);

  return {
    similarViviendas,
    error,
    isLoading,
    isError,
    isSuccess,
    isEmpty,
    fetchSimilarViviendas,
    refetch: fetchSimilarViviendas,
    clearError: () => setError(null)
  };
};

export default useViviendas;