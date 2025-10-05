/**
 * Hook integrado para manejo completo de viviendas
 * Combina CRUD, validación, imágenes y estado de formularios
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useCreateVivienda } from './useCreateVivienda.js';
import { useImageManager } from './useImageManager.js';
import { useViviendaValidation, useFormState } from './useFormValidation.js';
import { useVivienda } from './useViviendas.js';
import { FormStates, ViviendaFormModel } from '../types/viviendaForm.types.js';

/**
 * Modos de operación del hook integrado
 */
export const OperationModes = {
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view',
  DUPLICATE: 'duplicate'
};

/**
 * Hook principal integrado para manejo completo de viviendas
 */
export const useViviendaManager = (options = {}) => {
  const {
    mode = OperationModes.CREATE,
    viviendaId = null,
    autoSave = false,
    autoSaveInterval = 30000, // 30 segundos
    maxImages = 20,
    onSuccess,
    onError,
    onAutoSave
  } = options;

  // Estados principales
  const [operationMode, setOperationMode] = useState(mode);
  const [currentViviendaId, setCurrentViviendaId] = useState(viviendaId);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(autoSave);

  // Referencias
  const autoSaveTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastSavedDataRef = useRef(null);

  // Hooks especializados
  const formState = useFormState();
  const validation = useViviendaValidation();
  const crud = useCreateVivienda({
    onSuccess: (data) => {
      if (!currentViviendaId && data?.id) {
        setCurrentViviendaId(data.id);
      }
      if (onSuccess) onSuccess(data);
    },
    onError
  });
  
  const imageManager = useImageManager(currentViviendaId, {
    maxImages,
    autoUpload: operationMode !== OperationModes.VIEW,
    onError
  });

  // Hook para obtener datos existentes
  const { vivienda: existingVivienda, loading: loadingVivienda } = useVivienda(
    currentViviendaId,
    { enabled: Boolean(currentViviendaId) }
  );

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Cargar datos existentes cuando cambia la vivienda
  useEffect(() => {
    if (existingVivienda && operationMode !== OperationModes.CREATE) {
      const formData = ViviendaFormModel.fromVivienda(existingVivienda);
      validation.setFormData(formData);
      lastSavedDataRef.current = formData;
      
      // Cargar imágenes
      imageManager.loadPropertyImages(existingVivienda.id);
    }
  }, [existingVivienda, operationMode]);

  // Auto-guardar
  useEffect(() => {
    if (!autoSaveEnabled || operationMode === OperationModes.VIEW || !validation.isDirty) {
      return;
    }

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (isMountedRef.current && validation.isFormValid) {
        try {
          await performAutoSave();
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [validation.formData, validation.isDirty, validation.isFormValid, autoSaveEnabled, autoSaveInterval]);

  /**
   * Realizar auto-guardado
   */
  const performAutoSave = useCallback(async () => {
    if (!validation.isFormValid || !validation.isDirty) {
      return;
    }

    try {
      const dataToSave = validation.prepareForSubmit();
      
      let result;
      if (currentViviendaId) {
        result = await crud.updateVivienda(currentViviendaId, dataToSave);
      } else {
        result = await crud.createVivienda(dataToSave);
        if (result.success && result.data?.id) {
          setCurrentViviendaId(result.data.id);
        }
      }

      if (result.success) {
        lastSavedDataRef.current = validation.formData;
        if (onAutoSave) {
          onAutoSave(result.data);
        }
      }

      return result;
    } catch (error) {
      console.error('Auto-save error:', error);
      throw error;
    }
  }, [validation, crud, currentViviendaId, onAutoSave]);

  /**
   * Cambiar modo de operación
   */
  const setMode = useCallback((newMode, newViviendaId = null) => {
    setOperationMode(newMode);
    if (newViviendaId !== null) {
      setCurrentViviendaId(newViviendaId);
    }

    // Limpiar formulario si es modo crear
    if (newMode === OperationModes.CREATE) {
      validation.resetForm();
      setCurrentViviendaId(null);
    }
  }, [validation]);

  /**
   * Guardar vivienda
   */
  const saveVivienda = useCallback(async (additionalData = {}) => {
    try {
      formState.updateState(FormStates.SAVING, 10, 'Validando datos...');

      // Validar formulario
      const validationResult = await validation.validateForm();
      if (!validationResult.isValid) {
        formState.updateState(FormStates.ERROR, 0, 'Hay errores en el formulario');
        return { success: false, errors: validationResult.errors };
      }

      formState.updateState(FormStates.SAVING, 30, 'Preparando datos...');

      // Preparar datos
      const formData = validation.prepareForSubmit();
      const dataToSave = { ...formData, ...additionalData };

      formState.updateState(FormStates.SAVING, 50, 'Guardando vivienda...');

      // Guardar según el modo
      let result;
      if (operationMode === OperationModes.EDIT && currentViviendaId) {
        result = await crud.updateVivienda(currentViviendaId, dataToSave);
      } else {
        result = await crud.createVivienda(dataToSave);
        if (result.success && result.data?.id) {
          setCurrentViviendaId(result.data.id);
          setOperationMode(OperationModes.EDIT);
        }
      }

      if (!result.success) {
        formState.updateState(FormStates.ERROR, 0, result.error?.message || 'Error al guardar');
        return result;
      }

      formState.updateState(FormStates.SAVING, 70, 'Subiendo imágenes...');

      // Subir imágenes pendientes si hay
      if (imageManager.hasChanges && currentViviendaId) {
        const imageResult = await imageManager.uploadPendingFiles(currentViviendaId);
        if (!imageResult.success) {
          console.warn('Warning: Property saved but image upload failed:', imageResult.error);
        }
      }

      formState.updateState(FormStates.SUCCESS, 100, 'Vivienda guardada correctamente');
      lastSavedDataRef.current = validation.formData;

      return result;

    } catch (error) {
      console.error('Error saving vivienda:', error);
      formState.updateState(FormStates.ERROR, 0, error.message || 'Error inesperado');
      return { success: false, error: error.message };
    }
  }, [validation, crud, operationMode, currentViviendaId, imageManager, formState]);

  /**
   * Duplicar vivienda
   */
  const duplicateVivienda = useCallback((sourceViviendaId = currentViviendaId) => {
    if (!sourceViviendaId) {
      throw new Error('ID de vivienda origen requerido para duplicar');
    }

    return crud.duplicateVivienda(sourceViviendaId);
  }, [crud, currentViviendaId]);

  /**
   * Eliminar vivienda
   */
  const deleteVivienda = useCallback(async (viviendaIdToDelete = currentViviendaId) => {
    if (!viviendaIdToDelete) {
      throw new Error('ID de vivienda requerido para eliminar');
    }

    try {
      formState.updateState(FormStates.SAVING, 50, 'Eliminando vivienda...');
      
      const result = await crud.deleteVivienda(viviendaIdToDelete);
      
      if (result.success) {
        formState.updateState(FormStates.SUCCESS, 100, 'Vivienda eliminada correctamente');
        
        // Limpiar estado si eliminamos la vivienda actual
        if (viviendaIdToDelete === currentViviendaId) {
          setCurrentViviendaId(null);
          setOperationMode(OperationModes.CREATE);
          validation.resetForm();
        }
      } else {
        formState.updateState(FormStates.ERROR, 0, result.error?.message || 'Error al eliminar');
      }

      return result;
    } catch (error) {
      console.error('Error deleting vivienda:', error);
      formState.updateState(FormStates.ERROR, 0, error.message || 'Error inesperado');
      throw error;
    }
  }, [crud, currentViviendaId, formState, validation]);

  /**
   * Publicar/despublicar vivienda
   */
  const togglePublish = useCallback(async (publish = null) => {
    if (!currentViviendaId) {
      throw new Error('ID de vivienda requerido para publicar');
    }

    try {
      const shouldPublish = publish ?? !existingVivienda?.published;
      const result = await crud.publishVivienda(currentViviendaId, shouldPublish);
      
      if (result.success) {
        formState.updateState(
          FormStates.SUCCESS, 
          100, 
          shouldPublish ? 'Vivienda publicada' : 'Vivienda despublicada'
        );
      }

      return result;
    } catch (error) {
      console.error('Error toggling publish status:', error);
      formState.updateState(FormStates.ERROR, 0, error.message || 'Error al cambiar estado');
      throw error;
    }
  }, [currentViviendaId, existingVivienda?.published, crud, formState]);

  /**
   * Resetear todo el estado
   */
  const resetAll = useCallback(() => {
    validation.resetForm();
    imageManager.clearPendingFiles();
    formState.reset();
    crud.resetState();
    setCurrentViviendaId(null);
    setOperationMode(OperationModes.CREATE);
    lastSavedDataRef.current = null;
  }, [validation, imageManager, formState, crud]);

  /**
   * Verificar si hay cambios sin guardar
   */
  const hasUnsavedChanges = useMemo(() => {
    if (!lastSavedDataRef.current) {
      return validation.isDirty || imageManager.hasChanges;
    }

    const currentData = validation.formData;
    const lastSaved = lastSavedDataRef.current;
    
    return JSON.stringify(currentData) !== JSON.stringify(lastSaved) || imageManager.hasChanges;
  }, [validation.formData, validation.isDirty, imageManager.hasChanges]);

  // Estados derivados
  const isReadOnly = operationMode === OperationModes.VIEW;
  const canSave = !isReadOnly && (validation.isFormValid || hasUnsavedChanges);
  const canDelete = operationMode === OperationModes.EDIT && currentViviendaId;
  const canPublish = operationMode === OperationModes.EDIT && currentViviendaId && validation.isFormValid;
  const isProcessing = formState.isProcessing || crud.isCreating || crud.isUpdating || imageManager.isProcessing || loadingVivienda;

  return {
    // Estados principales
    mode: operationMode,
    viviendaId: currentViviendaId,
    formState,
    hasUnsavedChanges,
    autoSaveEnabled,

    // Estados derivados
    isReadOnly,
    canSave,
    canDelete,
    canPublish,
    isProcessing,
    isLoading: loadingVivienda,

    // Datos
    formData: validation.formData,
    errors: validation.errors,
    images: imageManager.images,
    pendingImages: imageManager.pendingFiles,
    existingVivienda,

    // Funciones principales
    setMode,
    saveVivienda,
    duplicateVivienda,
    deleteVivienda,
    togglePublish,
    resetAll,

    // Auto-save
    setAutoSaveEnabled,
    performAutoSave,

    // Re-exportar funciones de sub-hooks
    validation: {
      ...validation,
      isValid: validation.isFormValid
    },
    
    imageManager: {
      ...imageManager,
      canAddMore: imageManager.canAddMore
    },

    crud: {
      ...crud,
      isProcessing: crud.isCreating || crud.isUpdating
    },

    // Utilidades
    getCompleteData: () => ({
      vivienda: validation.prepareForSubmit(),
      images: imageManager.images,
      pendingImages: imageManager.pendingFiles
    }),
    
    refreshData: () => {
      if (currentViviendaId) {
        imageManager.loadPropertyImages(currentViviendaId);
      }
    }
  };
};

export default useViviendaManager;