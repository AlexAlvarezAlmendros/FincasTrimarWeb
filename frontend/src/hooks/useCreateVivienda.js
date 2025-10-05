/**
 * Hook para crear y editar viviendas
 * Incluye manejo de formularios, validación, imágenes y optimizaciones
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import propertyService from '../services/propertyService.js';
import {
  ViviendaFormModel,
  FormValidator,
  FormStates,
  FormModes,
  FormStateUtils,
  ImageUtils
} from '../types/viviendaForm.types.js';

/**
 * Cache para formularios (para modo duplicar y referencias)
 */
class FormCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, data) {
    this.cache.set(key, {
      data: { ...data },
      timestamp: Date.now()
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Cache de formularios válido por 30 minutos
    if (Date.now() - entry.timestamp > 1800000) {
      this.cache.delete(key);
      return null;
    }
    
    return { ...entry.data };
  }

  clear() {
    this.cache.clear();
  }
}

const formCache = new FormCache();

/**
 * Hook principal para crear/editar viviendas
 */
export const useCreateVivienda = (initialData = null, options = {}) => {
  const {
    mode = FormModes.CREATE,
    autoValidate = true,
    enableCache = true,
    onSuccess,
    onError,
    onValidationChange,
    onFormChange
  } = options;

  // Estados principales
  const [formState, setFormState] = useState(FormStates.IDLE);
  const [formData, setFormData] = useState(() => {
    if (initialData && mode === FormModes.EDIT) {
      return ViviendaFormModel.fromVivienda(initialData);
    }
    if (initialData && mode === FormModes.DUPLICATE) {
      const duplicated = ViviendaFormModel.fromVivienda(initialData);
      // Limpiar campos específicos para duplicado
      duplicated.name = `Copia de ${duplicated.name}`;
      duplicated.published = false;
      duplicated.images = [];
      duplicated.newImages = [];
      return duplicated;
    }
    return ViviendaFormModel.createEmpty();
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState(null);
  const [createdProperty, setCreatedProperty] = useState(null);

  // Referencias para prevenir memory leaks
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);
  const validationTimeoutRef = useRef(null);

  // Cleanup al desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Actualización segura del estado
   */
  const safeSetFormState = useCallback((newState) => {
    if (isMountedRef.current) {
      setFormState(newState);
    }
  }, []);

  const safeSetValidationErrors = useCallback((errors) => {
    if (isMountedRef.current) {
      setValidationErrors(errors);
      if (onValidationChange) {
        onValidationChange(errors);
      }
    }
  }, [onValidationChange]);

  const safeSetSubmitError = useCallback((error) => {
    if (isMountedRef.current) {
      setSubmitError(error);
    }
  }, []);

  /**
   * Validación con debounce
   */
  const validateFormDebounced = useCallback((data) => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationTimeoutRef.current = setTimeout(() => {
      if (autoValidate && isMountedRef.current) {
        const validation = FormValidator.validateForm(data);
        safeSetValidationErrors(validation.errors);
      }
    }, 300);
  }, [autoValidate, safeSetValidationErrors]);

  /**
   * Actualizar campo del formulario
   */
  const updateField = useCallback((fieldName, value) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [fieldName]: value
      };

      // Validación inmediata para campos específicos
      if (autoValidate) {
        const fieldError = FormValidator.validateField(fieldName, value);
        setValidationErrors(prevErrors => ({
          ...prevErrors,
          [fieldName]: fieldError
        }));
      }

      // Validación completa con debounce
      validateFormDebounced(updated);

      // Callback de cambio
      if (onFormChange) {
        onFormChange(updated, fieldName, value);
      }

      return updated;
    });
  }, [autoValidate, validateFormDebounced, onFormChange]);

  /**
   * Actualizar múltiples campos
   */
  const updateFields = useCallback((fields) => {
    setFormData(prev => {
      const updated = { ...prev, ...fields };
      validateFormDebounced(updated);
      
      if (onFormChange) {
        onFormChange(updated, null, fields);
      }
      
      return updated;
    });
  }, [validateFormDebounced, onFormChange]);

  /**
   * Resetear formulario
   */
  const resetForm = useCallback(() => {
    const emptyForm = ViviendaFormModel.createEmpty();
    setFormData(emptyForm);
    setValidationErrors({});
    setSubmitError(null);
    setImageUploadProgress(0);
    safeSetFormState(FormStates.IDLE);

    if (onFormChange) {
      onFormChange(emptyForm, null, null);
    }
  }, [onFormChange, safeSetFormState]);

  /**
   * Cargar datos en el formulario
   */
  const loadFormData = useCallback((data) => {
    const formData = ViviendaFormModel.fromVivienda(data);
    setFormData(formData);
    validateFormDebounced(formData);

    if (onFormChange) {
      onFormChange(formData, null, null);
    }
  }, [validateFormDebounced, onFormChange]);

  /**
   * Manejo de imágenes
   */
  const addImages = useCallback((files) => {
    const validationErrors = ImageUtils.validateImageFiles(files);
    if (validationErrors.length > 0) {
      safeSetSubmitError(validationErrors.join(', '));
      return false;
    }

    setFormData(prev => ({
      ...prev,
      newImages: [...prev.newImages, ...Array.from(files)]
    }));

    safeSetSubmitError(null);
    return true;
  }, [safeSetSubmitError]);

  const removeImage = useCallback((index, isExisting = false) => {
    setFormData(prev => {
      if (isExisting) {
        // Marcar imagen existente para eliminar
        const imageToDelete = prev.images[index];
        return {
          ...prev,
          imagesToDelete: [...prev.imagesToDelete, imageToDelete.id]
        };
      } else {
        // Eliminar imagen nueva
        return {
          ...prev,
          newImages: prev.newImages.filter((_, i) => i !== index)
        };
      }
    });
  }, []);

  const reorderImages = useCallback((fromIndex, toIndex, isExisting = false) => {
    setFormData(prev => {
      const images = isExisting ? [...prev.images] : [...prev.newImages];
      const [removed] = images.splice(fromIndex, 1);
      images.splice(toIndex, 0, removed);

      return {
        ...prev,
        [isExisting ? 'images' : 'newImages']: images
      };
    });
  }, []);

  /**
   * Subir imágenes
   */
  const uploadImages = useCallback(async (files) => {
    if (!files || files.length === 0) return { success: true, images: [] };

    try {
      safeSetFormState(FormStates.UPLOADING_IMAGES);
      setImageUploadProgress(0);

      // Simular progreso (en una implementación real, esto vendría del servidor)
      const progressInterval = setInterval(() => {
        setImageUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await propertyService.uploadImages(files);

      clearInterval(progressInterval);
      setImageUploadProgress(100);

      if (!response.success) {
        throw new Error(response.error?.message || 'Error al subir imágenes');
      }

      return {
        success: true,
        images: response.data.images
      };

    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setImageUploadProgress(0);
    }
  }, [safeSetFormState]);

  /**
   * Validar formulario para envío
   */
  const validateForSubmission = useCallback(() => {
    const validation = FormValidator.validateForSubmission(formData);
    safeSetValidationErrors(validation.errors);
    return validation.isValid;
  }, [formData, safeSetValidationErrors]);

  /**
   * Crear propiedad
   */
  const createProperty = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      safeSetFormState(FormStates.CREATING);
      safeSetSubmitError(null);

      // 1. Subir imágenes si las hay
      let uploadedImages = [];
      if (formData.newImages.length > 0) {
        const uploadResult = await uploadImages(formData.newImages);
        uploadedImages = uploadResult.images;
      }

      // 2. Preparar datos para el backend
      const propertyData = ViviendaFormModel.toBackendFormat(formData);

      // 3. Crear la propiedad
      const createResponse = await propertyService.createProperty(propertyData);

      if (!createResponse.success) {
        throw new Error(createResponse.error?.message || 'Error al crear la propiedad');
      }

      const newProperty = createResponse.data;

      // 4. Asociar imágenes si las hay
      if (uploadedImages.length > 0) {
        const imagesData = ImageUtils.prepareImagesForProperty(uploadedImages);
        await propertyService.addPropertyImages(newProperty.id, imagesData);
      }

      // 5. Actualizar estado de éxito
      if (isMountedRef.current) {
        setCreatedProperty(newProperty);
        safeSetFormState(FormStates.SUCCESS);

        if (onSuccess) {
          onSuccess(newProperty, FormModes.CREATE);
        }

        // Guardar en cache para posibles duplicados
        if (enableCache) {
          formCache.set(`property_${newProperty.id}`, newProperty);
        }
      }

      return newProperty;

    } catch (error) {
      console.error('Error creating property:', error);
      
      if (error.name !== 'AbortError' && isMountedRef.current) {
        safeSetSubmitError(error.message || 'Error al crear la propiedad');
        safeSetFormState(FormStates.ERROR);

        if (onError) {
          onError(error, FormModes.CREATE);
        }
      }

      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [formData, uploadImages, safeSetFormState, safeSetSubmitError, onSuccess, onError, enableCache]);

  /**
   * Actualizar propiedad
   */
  const updateProperty = useCallback(async (propertyId) => {
    if (!propertyId) {
      throw new Error('ID de propiedad requerido para actualizar');
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      safeSetFormState(FormStates.UPDATING);
      safeSetSubmitError(null);

      // 1. Subir nuevas imágenes si las hay
      let uploadedImages = [];
      if (formData.newImages.length > 0) {
        const uploadResult = await uploadImages(formData.newImages);
        uploadedImages = uploadResult.images;
      }

      // 2. Preparar datos para el backend
      const propertyData = ViviendaFormModel.toBackendFormat(formData);

      // 3. Actualizar la propiedad
      const updateResponse = await propertyService.updateProperty(propertyId, propertyData);

      if (!updateResponse.success) {
        throw new Error(updateResponse.error?.message || 'Error al actualizar la propiedad');
      }

      const updatedProperty = updateResponse.data;

      // 4. Gestionar imágenes
      // 4.1. Eliminar imágenes marcadas para borrar
      if (formData.imagesToDelete.length > 0) {
        await Promise.all(
          formData.imagesToDelete.map(imageId =>
            propertyService.deletePropertyImage(propertyId, imageId)
          )
        );
      }

      // 4.2. Añadir nuevas imágenes
      if (uploadedImages.length > 0) {
        const imagesData = ImageUtils.prepareImagesForProperty(
          uploadedImages,
          formData.images.filter(img => !formData.imagesToDelete.includes(img.id))
        );
        await propertyService.addPropertyImages(propertyId, imagesData);
      }

      // 5. Actualizar estado de éxito
      if (isMountedRef.current) {
        setCreatedProperty(updatedProperty);
        safeSetFormState(FormStates.SUCCESS);

        if (onSuccess) {
          onSuccess(updatedProperty, FormModes.EDIT);
        }
      }

      return updatedProperty;

    } catch (error) {
      console.error('Error updating property:', error);
      
      if (error.name !== 'AbortError' && isMountedRef.current) {
        safeSetSubmitError(error.message || 'Error al actualizar la propiedad');
        safeSetFormState(FormStates.ERROR);

        if (onError) {
          onError(error, FormModes.EDIT);
        }
      }

      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [formData, uploadImages, safeSetFormState, safeSetSubmitError, onSuccess, onError]);

  /**
   * Enviar formulario (crear o actualizar según el modo)
   */
  const submitForm = useCallback(async (propertyId = null) => {
    // Validar antes de enviar
    if (!validateForSubmission()) {
      safeSetFormState(FormStates.ERROR);
      safeSetSubmitError('Por favor, corrija los errores en el formulario');
      return null;
    }

    safeSetFormState(FormStates.VALIDATING);

    try {
      if (mode === FormModes.EDIT && propertyId) {
        return await updateProperty(propertyId);
      } else {
        return await createProperty();
      }
    } catch (error) {
      console.error('Submit form error:', error);
      return null;
    }
  }, [mode, validateForSubmission, updateProperty, createProperty, safeSetFormState, safeSetSubmitError]);

  /**
   * Guardar como borrador
   */
  const saveDraft = useCallback(async (propertyId = null) => {
    const draftData = {
      ...ViviendaFormModel.toBackendFormat(formData),
      published: false
    };

    try {
      if (mode === FormModes.EDIT && propertyId) {
        return await propertyService.updateProperty(propertyId, draftData);
      } else {
        return await propertyService.createProperty(draftData);
      }
    } catch (error) {
      console.error('Save draft error:', error);
      throw error;
    }
  }, [formData, mode]);

  /**
   * Estados derivados computados
   */
  const isSubmitting = useMemo(() => FormStateUtils.isSubmitting(formState), [formState]);
  const isLoading = useMemo(() => FormStateUtils.isLoading(formState), [formState]);
  const canSubmit = useMemo(() => FormStateUtils.canSubmit(formState, Object.keys(validationErrors).length === 0), [formState, validationErrors]);
  const canReset = useMemo(() => FormStateUtils.canReset(formState), [formState]);
  const loadingMessage = useMemo(() => FormStateUtils.getLoadingMessage(formState), [formState]);

  const isValid = useMemo(() => {
    // Validación síncrona básica
    const errors = {};
    let hasErrors = false;

    // Validar campos requeridos básicos
    if (!formData.name || formData.name.trim().length < 5) {
      errors.name = true;
      hasErrors = true;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = true;
      hasErrors = true;
    }

    return !hasErrors;
  }, [formData]);

  const hasChanges = useMemo(() => {
    if (!initialData) return Object.values(formData).some(value => value !== '' && value !== 0 && (Array.isArray(value) ? value.length > 0 : true));
    
    const originalForm = ViviendaFormModel.fromVivienda(initialData);
    return JSON.stringify(formData) !== JSON.stringify(originalForm);
  }, [formData, initialData]);

  return {
    // Estado del formulario
    formState,
    formData,
    validationErrors,
    submitError,
    createdProperty,
    imageUploadProgress,

    // Estados derivados
    isSubmitting,
    isLoading,
    canSubmit,
    canReset,
    loadingMessage,
    isValid,
    hasChanges,

    // Funciones de manipulación
    updateField,
    updateFields,
    resetForm,
    loadFormData,

    // Funciones de imágenes
    addImages,
    removeImage,
    reorderImages,

    // Funciones de envío
    submitForm,
    saveDraft,
    validateForSubmission,

    // Utilidades
    clearErrors: () => {
      setValidationErrors({});
      safeSetSubmitError(null);
    },
    
    clearCache: () => formCache.clear(),

    // Para debugging
    _formCache: enableCache ? formCache : null
  };
};

/**
 * Hook específico para duplicar una propiedad
 */
export const useDuplicateVivienda = (originalProperty, options = {}) => {
  return useCreateVivienda(originalProperty, {
    ...options,
    mode: FormModes.DUPLICATE
  });
};

/**
 * Hook para validación de formularios sin manejo de estado
 */
export const useViviendaValidation = (data) => {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const validation = FormValidator.validateForm(data);
    setErrors(validation.errors);
  }, [data]);

  const validateField = useCallback((fieldName, value) => {
    return FormValidator.validateField(fieldName, value);
  }, []);

  const validateForSubmission = useCallback((formData) => {
    return FormValidator.validateForSubmission(formData);
  }, []);

  return {
    errors,
    validateField,
    validateForSubmission,
    isValid: Object.keys(errors).length === 0
  };
};

export default useCreateVivienda;