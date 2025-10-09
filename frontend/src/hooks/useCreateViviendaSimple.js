/**
 * Hook simplificado para crear viviendas - versión de debugging
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ViviendaFormModel } from '../types/viviendaForm.types.js';
import { useApi } from './useApi.js';

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
  const [isCreating, setIsCreating] = useState(false);
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
   * Cargar datos de una propiedad para edición
   */
  const loadProperty = useCallback(async (propertyId) => {
    try {
      setIsCreating(true);
      setError(null);

      console.log('Cargando propiedad con ID:', propertyId);
      
      const response = await apiRef.current(`/api/v1/viviendas/${propertyId}`);
      console.log('Respuesta del backend:', response);

      if (!response.success) {
        throw new Error(response.error?.message || 'Error cargando la propiedad');
      }

      const property = response.data;
      
      // Mapear datos de la propiedad al formato del formulario
      const formattedData = {
        name: property.name || '',
        shortDescription: property.shortDescription || '',
        description: property.description || '',
        price: property.price?.toString() || '',
        rooms: property.rooms?.toString() || '',
        bathRooms: property.bathRooms?.toString() || '',
        garage: property.garage?.toString() || '',
        squaredMeters: property.squaredMeters?.toString() || '',
        provincia: property.provincia || '',
        poblacion: property.poblacion || '',
        calle: property.calle || '',
        numero: property.numero || '',
        tipoInmueble: property.tipoInmueble || 'Vivienda',
        tipoVivienda: property.tipoVivienda || 'Piso',
        estado: property.estado || 'BuenEstado',
        planta: property.planta || 'PlantaIntermedia',
        tipoAnuncio: property.tipoAnuncio || 'Venta',
        estadoVenta: property.estadoVenta || 'Disponible',
        caracteristicas: Array.isArray(property.caracteristicas) ? property.caracteristicas : [],
        published: Boolean(property.published)
      };

      console.log('Datos mapeados para el formulario:', formattedData);
      setFormData(formattedData);

      return property;
    } catch (err) {
      console.error('Error cargando propiedad:', err);
      setError(err.message || 'Error cargando la propiedad');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, []); // Remover api de las dependencias para evitar recreaciones

  /**
   * Crear o actualizar vivienda
   */
  const createVivienda = useCallback(async (data = formData, propertyId = null) => {
    try {
      setIsCreating(true);
      setError(null);

      console.log('Datos a enviar:', data);
      console.log('ID de propiedad (para edición):', propertyId);

      // Validación básica
      if (!data.name || data.name.trim().length < 5) {
        throw new Error('El nombre debe tener al menos 5 caracteres');
      }
      
      if (!data.price || parseFloat(data.price) <= 0) {
        throw new Error('El precio debe ser mayor que 0');
      }

      // Preparar datos para el backend
      const backendData = ViviendaFormModel.toVivienda(data);
      console.log('Datos preparados para backend:', backendData);

      // Determinar si es creación o actualización
      const isUpdate = Boolean(propertyId);
      const url = isUpdate ? `/api/v1/viviendas/${propertyId}` : '/api/v1/viviendas';
      const method = isUpdate ? 'PUT' : 'POST';

      // Enviar al backend usando useApi (con autenticación)
      const response = await apiRef.current(url, {
        method,
        body: JSON.stringify(backendData)
      });
      console.log('Respuesta del backend:', response);

      if (!response.success) {
        throw new Error(response.error?.message || `Error ${isUpdate ? 'actualizando' : 'creando'} vivienda`);
      }

      setSuccess(true);
      if (onSuccess) onSuccess(response.data);

      return response;
    } catch (err) {
      console.error('Error en createVivienda:', err);
      
      // Manejo específico de errores de autenticación
      let errorMessage = err.message || 'Error inesperado';
      
      if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
        errorMessage = 'No tienes permisos para crear viviendas. Inicia sesión primero.';
      } else if (err.message?.includes('Forbidden') || err.message?.includes('403')) {
        errorMessage = 'No tienes los permisos necesarios para crear viviendas.';
      } else if (err.message?.includes('Token')) {
        errorMessage = 'Sesión expirada. Inicia sesión nuevamente.';
      }
      
      setError(errorMessage);
      if (onError) onError(err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [formData, onSuccess, onError]);

  /**
   * Crear o actualizar vivienda como borrador
   */
  const createDraft = useCallback(async (data = formData, propertyId = null) => {
    try {
      setIsCreating(true);
      setError(null);

      console.log('Guardando como borrador:', data);
      console.log('ID de propiedad (para edición):', propertyId);

      // Validación básica mínima para borradores
      if (!data.name || data.name.trim().length < 3) {
        throw new Error('El nombre debe tener al menos 3 caracteres para guardar como borrador');
      }

      // Preparar datos para el backend con flag de borrador
      const backendData = ViviendaFormModel.toVivienda(data);
      backendData.IsDraft = 1; // Forzar como borrador
      console.log('Datos preparados para backend (borrador):', backendData);

      // Determinar si es creación o actualización
      const isUpdate = Boolean(propertyId);
      const url = isUpdate ? `/api/v1/viviendas/${propertyId}` : '/api/v1/viviendas';
      const method = isUpdate ? 'PUT' : 'POST';

      // Enviar al backend usando useApi (con autenticación)
      const response = await apiRef.current(url, {
        method,
        body: JSON.stringify(backendData)
      });
      console.log('Respuesta del backend (borrador):', response);

      if (!response.success) {
        throw new Error(response.error?.message || `Error ${isUpdate ? 'actualizando' : 'creando'} borrador`);
      }

      setSuccess(true);
      if (onSuccess) onSuccess(response.data);

      return response;
    } catch (err) {
      console.error('Error en createDraft:', err);
      
      // Manejo específico de errores de autenticación
      let errorMessage = err.message || 'Error inesperado';
      
      if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
        errorMessage = 'No tienes permisos para guardar borradores. Inicia sesión primero.';
      } else if (err.message?.includes('Forbidden') || err.message?.includes('403')) {
        errorMessage = 'No tienes los permisos necesarios para guardar borradores.';
      } else if (err.message?.includes('Token')) {
        errorMessage = 'Sesión expirada. Inicia sesión nuevamente.';
      }
      
      setError(errorMessage);
      if (onError) onError(err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [formData, onSuccess, onError]);

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
    error,
    success,

    // Acciones
    updateField,
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