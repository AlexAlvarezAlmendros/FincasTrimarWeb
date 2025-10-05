/**
 * Hook simplificado para crear viviendas - versión de debugging
 */

import { useState, useCallback } from 'react';
import { ViviendaFormModel } from '../types/viviendaForm.types.js';
import { useApi } from './useApi.js';

export const useCreateViviendaSimple = (options = {}) => {
  const api = useApi();
  const { onSuccess, onError } = options;

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
   * Crear vivienda
   */
  const createVivienda = useCallback(async (data = formData) => {
    try {
      setIsCreating(true);
      setError(null);

      console.log('Datos a enviar:', data);

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

      // Enviar al backend usando useApi (con autenticación)
      const response = await api('/api/v1/viviendas', {
        method: 'POST',
        body: JSON.stringify(backendData)
      });
      console.log('Respuesta del backend:', response);

      if (!response.success) {
        throw new Error(response.error?.message || 'Error creando vivienda');
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
    resetForm,

    // Utilidades
    setFormData,
    clearError: () => setError(null),
    clearSuccess: () => setSuccess(false)
  };
};

export default useCreateViviendaSimple;