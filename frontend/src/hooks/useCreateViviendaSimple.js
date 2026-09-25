/**
 * Hook simplificado para crear y editar viviendas
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ViviendaFormModel } from '../types/viviendaForm.types.js';
import { useApi } from './useApi.js';

/**
 * Mensaje legible de un error de la API. useApi lanza un Error con
 * `status` y `error` (el envelope {code, message, details} del backend).
 */
const describeApiError = (err, action) => {
  if (err?.status === 401) return 'Tu sesión ha caducado o no es válida. Inicia sesión de nuevo.';
  if (err?.status === 403) return `No tienes los permisos necesarios para ${action}.`;

  let message = err?.message || 'Error inesperado';
  // Errores de validación de Zod: indicar qué campo falla
  const details = err?.error?.details;
  if (Array.isArray(details) && details.length > 0) {
    message += ': ' + details
      .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
      .join('; ');
  }
  return message;
};

export const useCreateViviendaSimple = (options = {}) => {
  const api = useApi();
  const apiRef = useRef(api);
  const { onSuccess, onError } = options;

  // Actualizar la referencia cuando cambie api
  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  // Estados básicos
  const [formData, setFormData] = useState(() => ViviendaFormModel.create());
  const [isCreating, setIsCreating] = useState(false); // guardando (crear/actualizar)
  const [isLoading, setIsLoading] = useState(false);   // cargando la vivienda a editar
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Actualizar un campo del formulario
   */
  const updateField = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Limpiar mensajes al hacer cambios
    if (error) setError(null);
    if (success) setSuccess(false);
  }, [error, success]);

  /**
   * Cargar datos de una propiedad para edición.
   * Devuelve { baseline, property }: baseline es el formulario tal como vino
   * del servidor (línea base para detectar cambios sin guardar).
   */
  const loadProperty = useCallback(async (propertyId) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const response = await apiRef.current(`/api/v1/viviendas/${propertyId}`);

      if (!response.success) {
        throw new Error(response.error?.message || 'Error cargando la propiedad');
      }

      const property = response.data;

      // Sin valores inventados: lo vacío en BD se carga como '' (ver fromVivienda).
      // Las imágenes las gestiona useImageManager, no el formulario.
      const formattedData = ViviendaFormModel.fromVivienda(property);
      ['images', 'imagesToDelete', 'newImages'].forEach((field) => delete formattedData[field]);

      setFormData(formattedData);

      return { baseline: formattedData, property };
    } catch (err) {
      console.error('Error cargando propiedad:', err);
      setError(describeApiError(err, 'ver esta vivienda'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []); // Remover api de las dependencias para evitar recreaciones

  /**
   * Guardar la vivienda (crear o actualizar).
   * action:
   * - 'save': crear (el backend autopublica si estadoVenta es 'Disponible') o
   *   actualizar conservando el estado de publicación.
   * - 'draft': guardar como borrador (no publicado).
   * - 'publish': publicar un borrador existente.
   */
  const saveVivienda = useCallback(async (data, propertyId = null, action = 'save') => {
    const isUpdate = Boolean(propertyId);
    const actionLabel = action === 'draft'
      ? 'guardar borradores'
      : isUpdate ? 'editar viviendas' : 'crear viviendas';

    try {
      setIsCreating(true);
      setError(null);

      // Validación básica (la completa la hace FormValidator en la página)
      if (!data.name || data.name.trim().length < 5) {
        throw new Error('El nombre debe tener al menos 5 caracteres');
      }

      if (!data.price || parseFloat(data.price) <= 0) {
        throw new Error('El precio debe ser mayor que 0');
      }

      // Estado de publicación según la acción (en edición no se envía
      // `published` salvo al publicar explícitamente)
      const toBackendOptions = { isEdit: isUpdate };
      if (action === 'draft') {
        toBackendOptions.isDraft = true;
        if (!isUpdate) toBackendOptions.published = false;
      } else if (action === 'publish') {
        toBackendOptions.isDraft = false;
        toBackendOptions.published = true;
      } else if (!isUpdate) {
        toBackendOptions.isDraft = false;
      }

      // Preparar datos para el backend
      const backendData = ViviendaFormModel.toVivienda(data, toBackendOptions);

      const url = isUpdate ? `/api/v1/viviendas/${propertyId}` : '/api/v1/viviendas';
      const method = isUpdate ? 'PUT' : 'POST';

      // Enviar al backend usando useApi (con autenticación)
      const response = await apiRef.current(url, {
        method,
        body: JSON.stringify(backendData)
      });

      if (!response.success) {
        throw new Error(response.error?.message || `Error ${isUpdate ? 'actualizando' : 'creando'} vivienda`);
      }

      setSuccess(true);
      if (onSuccess) onSuccess(response.data);

      return response;
    } catch (err) {
      console.error('Error guardando vivienda:', err);
      setError(describeApiError(err, actionLabel));
      if (onError) onError(err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [onSuccess, onError]);

  /**
   * Crear o actualizar vivienda (conserva el estado de publicación al editar)
   */
  const createVivienda = useCallback(
    (data = formData, propertyId = null) => saveVivienda(data, propertyId, 'save'),
    [formData, saveVivienda]
  );

  /**
   * Crear o actualizar vivienda como borrador
   */
  const createDraft = useCallback(
    (data = formData, propertyId = null) => saveVivienda(data, propertyId, 'draft'),
    [formData, saveVivienda]
  );

  /**
   * Resetear formulario
   */
  const resetForm = useCallback(() => {
    setFormData(ViviendaFormModel.create());
    setError(null);
    setSuccess(false);
  }, []);

  return {
    // Datos
    formData,

    // Estados
    isCreating,
    isLoading,
    error,
    success,

    // Acciones
    updateField,
    saveVivienda,
    createVivienda,
    createDraft,
    loadProperty,
    resetForm,

    // Utilidades
    setFormData,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(false)
  };
};

export default useCreateViviendaSimple;
