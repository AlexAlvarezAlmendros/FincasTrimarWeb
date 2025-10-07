/**
 * Hook personalizado para gestión de mensajes
 * Incluye filtrado, paginación y acciones CRUD
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import messageService from '../services/messageService.js';

/**
 * Estados posibles del hook
 */
const HookStates = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

/**
 * Filtros por defecto para mensajes
 */
const createDefaultFilters = () => ({
  q: '',
  estado: '', // '', 'Nuevo', 'EnCurso', 'Cerrado'
  pinned: null, // null, true, false
  page: 1,
  pageSize: 20,
  sortBy: 'fecha_desc' // fecha_desc, fecha_asc, estado_asc
});

/**
 * Modelo de paginación por defecto
 */
const createDefaultPagination = () => ({
  page: 1,
  pageSize: 20,
  totalPages: 1,
  totalItems: 0
});

/**
 * Cache simple para mensajes con TTL
 */
class MessageCache {
  constructor(ttl = 300000) { // 5 minutos
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
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  generateKey(filters) {
    return `messages_${JSON.stringify(filters)}`;
  }
}

// Instancia global del cache
const messageCache = new MessageCache();

/**
 * Hook principal para gestionar mensajes
 */
export const useMessages = (initialFilters = {}, options = {}) => {
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
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState(createDefaultPagination());
  const [error, setError] = useState(null);
  
  // Estado de filtros con valores por defecto
  const [filters, setFilters] = useState(() => ({
    ...createDefaultFilters(),
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
   * Funciones para actualizar el estado de forma segura
   */
  const safeSetState = useCallback((newState) => {
    if (isMountedRef.current) {
      setState(newState);
    }
  }, []);

  const safeSetMessages = useCallback((newMessages) => {
    if (isMountedRef.current) {
      setMessages(newMessages);
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
   * Función principal para obtener mensajes
   */
  const fetchMessages = useCallback(async (searchFilters = filters) => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      safeSetState(HookStates.LOADING);
      safeSetError(null);

      // Verificar cache si está habilitado
      const cacheKey = messageCache.generateKey(searchFilters);
      
      if (enableCache) {
        const cachedData = messageCache.get(cacheKey);
        if (cachedData) {
          safeSetMessages(cachedData.data);
          safeSetPagination(cachedData.pagination);
          safeSetState(HookStates.SUCCESS);
          
          if (onSuccess) {
            onSuccess(cachedData);
          }
          
          return cachedData;
        }
      }

      // Realizar petición al API
      const response = await messageService.getMessages(searchFilters);

      // Verificar si el componente sigue montado
      if (!isMountedRef.current) return;

      // Guardar en cache
      if (enableCache) {
        messageCache.set(cacheKey, response);
      }
      
      safeSetMessages(response.data || []);
      safeSetPagination(response.pagination || createDefaultPagination());
      safeSetState(HookStates.SUCCESS);

      if (onSuccess) {
        onSuccess(response);
      }

      return response;

    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Petición cancelada, no hacer nada
      }

      console.error('Error fetching messages:', error);
      
      safeSetError(error.message || 'Error al obtener mensajes');
      safeSetState(HookStates.ERROR);

      if (onError) {
        onError(error);
      }

      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [filters, enableCache, onSuccess, onError, safeSetState, safeSetMessages, safeSetPagination, safeSetError]);

  /**
   * Función con debounce para búsquedas en tiempo real
   */
  const debouncedFetch = useCallback((searchFilters) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchMessages(searchFilters);
    }, debounceMs);
  }, [fetchMessages, debounceMs]);

  /**
   * Actualizar filtros y refetch automático si está habilitado
   */
  const updateFilters = useCallback((newFilters, options = {}) => {
    const { 
      merge = true, 
      resetPagination = true, 
      debounce = false
    } = options;

    const updatedFilters = merge 
      ? { ...filters, ...newFilters }
      : { ...createDefaultFilters(), ...newFilters };

    // Reset página si se especifica
    if (resetPagination) {
      updatedFilters.page = 1;
    }

    setFilters(updatedFilters);

    // Auto fetch si está habilitado
    if (autoFetch) {
      if (debounce) {
        debouncedFetch(updatedFilters);
      } else {
        fetchMessages(updatedFilters);
      }
    }
  }, [filters, autoFetch, debouncedFetch, fetchMessages]);

  /**
   * Funciones específicas de manipulación de mensajes
   */
  const updateMessage = useCallback(async (messageId, updateData) => {
    try {
      const response = await messageService.updateMessage(messageId, updateData);
      
      // Actualizar el mensaje en el estado local
      safeSetMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, ...updateData }
            : msg
        )
      );

      return response;
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }, [safeSetMessages]);

  const markAsRead = useCallback(async (messageId) => {
    return updateMessage(messageId, { estado: 'EnCurso' });
  }, [updateMessage]);

  const markAsClosed = useCallback(async (messageId) => {
    return updateMessage(messageId, { estado: 'Cerrado' });
  }, [updateMessage]);

  const togglePin = useCallback(async (messageId, pinned) => {
    return updateMessage(messageId, { pinned });
  }, [updateMessage]);

  const deleteMessage = useCallback(async (messageId) => {
    try {
      await messageService.deleteMessage(messageId);
      
      // Remover el mensaje del estado local
      safeSetMessages(prevMessages => 
        prevMessages.filter(msg => msg.id !== messageId)
      );

      // Actualizar paginación
      safeSetPagination(prevPagination => ({
        ...prevPagination,
        totalItems: Math.max(0, prevPagination.totalItems - 1)
      }));

    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }, [safeSetMessages, safeSetPagination]);

  /**
   * Funciones de navegación
   */
  const goToPage = useCallback((page) => {
    updateFilters({ page }, { resetPagination: false });
  }, [updateFilters]);

  const resetFilters = useCallback(() => {
    const defaultFilters = createDefaultFilters();
    updateFilters(defaultFilters, { merge: false });
  }, [updateFilters]);

  const refreshMessages = useCallback(() => {
    // Limpiar cache y refetch
    if (enableCache) {
      messageCache.clear();
    }
    return fetchMessages(filters);
  }, [enableCache, fetchMessages, filters]);

  /**
   * Fetch inicial automático si está habilitado
   */
  useEffect(() => {
    if (autoFetch && state === HookStates.IDLE) {
      fetchMessages(filters);
    }
  }, []); // Solo en mount inicial

  /**
   * Estados derivados computados
   */
  const isLoading = useMemo(() => state === HookStates.LOADING, [state]);
  const isError = useMemo(() => state === HookStates.ERROR, [state]);
  const isSuccess = useMemo(() => state === HookStates.SUCCESS, [state]);
  const isEmpty = useMemo(() => isSuccess && messages.length === 0, [isSuccess, messages.length]);
  const hasNextPage = useMemo(() => pagination.page < pagination.totalPages, [pagination]);
  const hasPrevPage = useMemo(() => pagination.page > 1, [pagination]);

  return {
    // Estados principales
    messages,
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
    fetchMessages,
    updateFilters,
    updateMessage,
    markAsRead,
    markAsClosed,
    togglePin,
    deleteMessage,
    goToPage,
    resetFilters,
    refreshMessages,
    
    // Utilidades
    clearError: () => safeSetError(null),
    clearCache: () => messageCache.clear()
  };
};

/**
 * Hook específico para obtener un solo mensaje por ID
 */
export const useMessage = (id, options = {}) => {
  const { enableCache = true, autoFetch = true, onError, onSuccess } = options;
  
  const [state, setState] = useState(HookStates.IDLE);
  const [message, setMessage] = useState(null);
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

  const fetchMessage = useCallback(async (messageId = id) => {
    if (!messageId) {
      setError('ID de mensaje requerido');
      setState(HookStates.ERROR);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      setState(HookStates.LOADING);
      setError(null);

      // Verificar cache
      const cacheKey = `message_${messageId}`;
      if (enableCache) {
        const cachedData = messageCache.get(cacheKey);
        if (cachedData) {
          if (isMountedRef.current) {
            setMessage(cachedData.data);
            setState(HookStates.SUCCESS);
            
            if (onSuccess) {
              onSuccess(cachedData.data);
            }
          }
          return cachedData.data;
        }
      }

      const response = await messageService.getMessageById(messageId);
      
      if (!isMountedRef.current) return;

      // Guardar en cache
      if (enableCache) {
        messageCache.set(cacheKey, response);
      }

      setMessage(response.data);
      setState(HookStates.SUCCESS);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;

    } catch (error) {
      if (error.name === 'AbortError') return;

      console.error('Error fetching message:', error);
      
      if (isMountedRef.current) {
        setError(error.message || 'Error al obtener el mensaje');
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
      fetchMessage(id);
    }
  }, [id, autoFetch, fetchMessage, state]);

  const isLoading = useMemo(() => state === HookStates.LOADING, [state]);
  const isError = useMemo(() => state === HookStates.ERROR, [state]);
  const isSuccess = useMemo(() => state === HookStates.SUCCESS, [state]);

  return {
    message,
    error,
    isLoading,
    isError,
    isSuccess,
    fetchMessage,
    refetch: () => fetchMessage(id),
    clearError: () => setError(null)
  };
};

export default useMessages;