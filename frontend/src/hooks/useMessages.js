/**
 * Hook para la gestión de mensajes del admin: listado, filtros, paginación,
 * estadísticas y acciones con actualización optimista.
 *
 * Un buzón de admin no necesita caché ni máquina de estados: usa fetch directo
 * con AbortController para descartar respuestas obsoletas y update optimista
 * local para evitar refetches y parpadeos tras cada acción.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from './useApi.js';

const createDefaultFilters = () => ({
  q: '',
  estado: '', // '', 'Nuevo', 'EnCurso', 'Cerrado'
  page: 1,
  pageSize: 20,
  sortBy: 'fecha_desc', // fecha_desc, fecha_asc, estado_asc
});

const createDefaultPagination = () => ({
  page: 1,
  pageSize: 20,
  totalPages: 1,
  totalItems: 0,
});

export const useMessages = (initialFilters = {}, options = {}) => {
  const api = useApi();
  const { debounceMs = 500, autoFetch = true, onError, onSuccess } = options;

  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState(createDefaultPagination());
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState(() => ({
    ...createDefaultFilters(),
    ...initialFilters,
  }));

  const apiRef = useRef(api);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchMessages = useCallback(
    async (searchFilters = filters) => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const qp = new URLSearchParams();
        if (searchFilters.estado) qp.append('estado', searchFilters.estado);
        if (searchFilters.q) qp.append('q', searchFilters.q);
        if (searchFilters.page) qp.append('page', searchFilters.page);
        if (searchFilters.pageSize) qp.append('pageSize', searchFilters.pageSize);
        if (searchFilters.sortBy) qp.append('sortBy', searchFilters.sortBy);
        const qs = qp.toString();

        const response = await apiRef.current(
          `/api/v1/messages${qs ? `?${qs}` : ''}`,
          { method: 'GET', signal: controller.signal }
        );

        setMessages(response.data || []);
        setPagination(response.pagination || createDefaultPagination());
        if (onSuccess) onSuccess(response);
        return response;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching messages:', err);
        setError(err.error?.message || err.message || 'Error al obtener mensajes');
        if (onError) onError(err);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, onError, onSuccess]
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiRef.current('/api/v1/messages/stats', { method: 'GET' });
      setStats(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching message stats:', err);
    }
  }, []);

  const debouncedFetch = useCallback(
    (searchFilters) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchMessages(searchFilters), debounceMs);
    },
    [fetchMessages, debounceMs]
  );

  const updateFilters = useCallback(
    (newFilters, opts = {}) => {
      const { merge = true, resetPagination = true, debounce = false } = opts;
      const updated = merge
        ? { ...filters, ...newFilters }
        : { ...createDefaultFilters(), ...newFilters };
      if (resetPagination) updated.page = 1;

      setFilters(updated);
      if (autoFetch) {
        if (debounce) debouncedFetch(updated);
        else fetchMessages(updated);
      }
    },
    [filters, autoFetch, debouncedFetch, fetchMessages]
  );

  // Actualización optimista: cambia el estado local sin refetchear la lista.
  const updateMessage = useCallback(async (messageId, updateData) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updateData } : msg))
    );
    try {
      return await apiRef.current(`/api/v1/messages/${messageId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
    } catch (err) {
      console.error('Error updating message:', err);
      throw err;
    }
  }, []);

  const markAsRead = useCallback((id) => updateMessage(id, { estado: 'EnCurso' }), [updateMessage]);
  const markAsUnread = useCallback((id) => updateMessage(id, { estado: 'Nuevo' }), [updateMessage]);
  const markAsClosed = useCallback((id) => updateMessage(id, { estado: 'Cerrado' }), [updateMessage]);
  const reopenMessage = useCallback((id) => updateMessage(id, { estado: 'EnCurso' }), [updateMessage]);

  const deleteMessage = useCallback(async (messageId) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    setPagination((prev) => ({
      ...prev,
      totalItems: Math.max(0, prev.totalItems - 1),
    }));
    try {
      await apiRef.current(`/api/v1/messages/${messageId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting message:', err);
      throw err;
    }
  }, []);

  const goToPage = useCallback(
    (page) => updateFilters({ page }, { resetPagination: false }),
    [updateFilters]
  );

  const resetFilters = useCallback(
    () => updateFilters(createDefaultFilters(), { merge: false }),
    [updateFilters]
  );

  const refreshMessages = useCallback(() => fetchMessages(filters), [fetchMessages, filters]);

  // Refresca lista + estadísticas (para el botón "Actualizar").
  const refresh = useCallback(async () => {
    await Promise.all([fetchMessages(filters), fetchStats()]);
  }, [fetchMessages, fetchStats, filters]);

  // Fetch inicial (solo en mount).
  useEffect(() => {
    if (autoFetch) fetchMessages(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEmpty = !isLoading && !error && messages.length === 0;
  const isError = Boolean(error);
  const hasNextPage = pagination.page < pagination.totalPages;
  const hasPrevPage = pagination.page > 1;

  return {
    // Datos
    messages,
    pagination,
    stats,
    error,

    // Estado
    isLoading,
    isError,
    isEmpty,
    hasNextPage,
    hasPrevPage,

    // Filtros
    filters,
    updateFilters,
    goToPage,
    resetFilters,

    // Carga
    fetchMessages,
    fetchStats,
    refreshMessages,
    refresh,

    // Acciones
    updateMessage,
    markAsRead,
    markAsUnread,
    markAsClosed,
    reopenMessage,
    deleteMessage,

    // Utilidades
    clearError: () => setError(null),
  };
};

export default useMessages;
