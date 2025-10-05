/**
 * Hook para validación y manejo de formularios de viviendas
 * Puede usarse independientemente o junto con useCreateVivienda
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
  FormValidator, 
  ValidationRules, 
  ValidationUtils,
  FormStates,
  ViviendaFormModel 
} from '../types/viviendaForm.types.js';
import { DataTransformers } from '../types/vivienda.types.js';

/**
 * Hook para validación de formularios
 */
export const useViviendaValidation = (initialData = null, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300
  } = options;

  // Estados
  const [formData, setFormData] = useState(() => 
    initialData ? ViviendaFormModel.fromVivienda(initialData) : ViviendaFormModel.create()
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Referencias
  const debounceTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Validar un campo específico
   */
  const validateField = useCallback(async (fieldName, value) => {
    try {
      setIsValidating(true);

      // Validar el campo específico
      const fieldErrors = await FormValidator.validateField(fieldName, value, formData);
      
      if (isMountedRef.current) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: fieldErrors.length > 0 ? fieldErrors[0] : null
        }));
      }

      return fieldErrors.length === 0;
    } catch (error) {
      console.error(`Error validating field ${fieldName}:`, error);
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsValidating(false);
      }
    }
  }, [formData]);

  /**
   * Validar todo el formulario
   */
  const validateForm = useCallback(async (data = formData) => {
    try {
      setIsValidating(true);

      const validation = await FormValidator.validateViviendaForm(data);
      
      if (isMountedRef.current) {
        setErrors(validation.errors);
      }

      return validation;
    } catch (error) {
      console.error('Error validating form:', error);
      return {
        isValid: false,
        errors: { general: 'Error de validación' },
        warnings: []
      };
    } finally {
      if (isMountedRef.current) {
        setIsValidating(false);
      }
    }
  }, [formData]);

  /**
   * Validación con debounce
   */
  const debouncedValidateField = useCallback((fieldName, value) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      validateField(fieldName, value);
    }, debounceMs);
  }, [validateField, debounceMs]);

  /**
   * Actualizar un campo
   */
  const updateField = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Marcar como tocado
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    // Validar si está habilitado
    if (validateOnChange) {
      debouncedValidateField(fieldName, value);
    }
  }, [validateOnChange, debouncedValidateField]);

  /**
   * Manejar blur de un campo
   */
  const handleFieldBlur = useCallback((fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));

    if (validateOnBlur) {
      const fieldValue = formData[fieldName];
      validateField(fieldName, fieldValue);
    }
  }, [validateOnBlur, validateField, formData]);

  /**
   * Actualizar múltiples campos
   */
  const updateFields = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));

    // Marcar campos como tocados
    const fieldNames = Object.keys(updates);
    setTouched(prev => ({
      ...prev,
      ...fieldNames.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    }));

    // Validar campos si está habilitado
    if (validateOnChange) {
      fieldNames.forEach(fieldName => {
        debouncedValidateField(fieldName, updates[fieldName]);
      });
    }
  }, [validateOnChange, debouncedValidateField]);

  /**
   * Resetear formulario
   */
  const resetForm = useCallback((newData = null) => {
    const resetData = newData ? ViviendaFormModel.fromVivienda(newData) : ViviendaFormModel.create();
    setFormData(resetData);
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Limpiar errores
   */
  const clearErrors = useCallback((fieldNames = null) => {
    if (fieldNames) {
      const fieldsArray = Array.isArray(fieldNames) ? fieldNames : [fieldNames];
      setErrors(prev => {
        const updated = { ...prev };
        fieldsArray.forEach(field => delete updated[field]);
        return updated;
      });
    } else {
      setErrors({});
    }
  }, []);

  /**
   * Verificar si un campo es válido
   */
  const isFieldValid = useCallback((fieldName) => {
    return !errors[fieldName] && touched[fieldName];
  }, [errors, touched]);

  /**
   * Verificar si un campo tiene errores
   */
  const hasFieldError = useCallback((fieldName) => {
    return Boolean(errors[fieldName] && touched[fieldName]);
  }, [errors, touched]);

  /**
   * Obtener error de un campo
   */
  const getFieldError = useCallback((fieldName) => {
    return touched[fieldName] ? errors[fieldName] : null;
  }, [errors, touched]);

  // Estados derivados con memoización
  const isFormValid = useMemo(() => {
    const touchedFields = Object.keys(touched);
    const requiredFields = ValidationUtils.getRequiredFields();
    
    // Verificar que todos los campos requeridos estén tocados
    const hasAllRequiredFields = requiredFields.every(field => touchedFields.includes(field));
    
    // Verificar que no haya errores
    const hasNoErrors = Object.values(errors).every(error => !error);
    
    return hasAllRequiredFields && hasNoErrors;
  }, [errors, touched]);

  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => Boolean(error));
  }, [errors]);

  const dirtyFields = useMemo(() => {
    if (!initialData) return Object.keys(touched);
    
    return Object.keys(formData).filter(key => {
      const currentValue = formData[key];
      const initialValue = initialData[key];
      return JSON.stringify(currentValue) !== JSON.stringify(initialValue);
    });
  }, [formData, initialData, touched]);

  const isDirty = dirtyFields.length > 0;

  /**
   * Preparar datos para envío
   */
  const prepareForSubmit = useCallback(() => {
    return ViviendaFormModel.toVivienda(formData);
  }, [formData]);

  /**
   * Validaciones específicas para campos complejos
   */
  const validatePrice = useCallback((price) => {
    return ValidationRules.price?.validate(price) || null;
  }, []);

  const validateLocation = useCallback((location) => {
    // Validar campos de ubicación individualmente
    const errors = [];
    if (location.provincia) {
      const error = ValidationRules.provincia?.validate(location.provincia);
      if (error) errors.push(`Provincia: ${error}`);
    }
    if (location.poblacion) {
      const error = ValidationRules.poblacion?.validate(location.poblacion);
      if (error) errors.push(`Población: ${error}`);
    }
    if (location.calle) {
      const error = ValidationRules.calle?.validate(location.calle);
      if (error) errors.push(`Calle: ${error}`);
    }
    return errors.length > 0 ? errors : null;
  }, []);

  const validateImages = useCallback((images) => {
    if (!Array.isArray(images)) return 'Las imágenes deben ser un array';
    if (images.length === 0) return null; // Imágenes opcionales
    if (images.length > 20) return 'Máximo 20 imágenes permitidas';
    return null;
  }, []);

  return {
    // Datos del formulario
    formData,
    errors,
    touched,
    isValidating,

    // Estados derivados
    isFormValid,
    hasErrors,
    isDirty,
    dirtyFields,

    // Funciones principales
    updateField,
    updateFields,
    handleFieldBlur,
    validateField,
    validateForm,
    resetForm,
    clearErrors,

    // Utilidades de validación
    isFieldValid,
    hasFieldError,
    getFieldError,

    // Validaciones específicas
    validatePrice,
    validateLocation,
    validateImages,

    // Transformaciones
    prepareForSubmit,
    
    // Utilidades de datos
    setFormData: (data) => setFormData(ViviendaFormModel.fromVivienda(data)),
    getCleanData: () => DataTransformers.cleanViviendaData(formData)
  };
};

/**
 * Hook para manejo de estado de formularios complejos
 */
export const useFormState = (initialState = FormStates.IDLE) => {
  const [state, setState] = useState(initialState);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const updateState = useCallback((newState, progressValue = null, messageText = '') => {
    setState(newState);
    if (progressValue !== null) setProgress(progressValue);
    setMessage(messageText);
  }, []);

  const reset = useCallback(() => {
    setState(FormStates.IDLE);
    setProgress(0);
    setMessage('');
  }, []);

  const isIdle = state === FormStates.IDLE;
  const isLoading = state === FormStates.LOADING;
  const isSaving = state === FormStates.SAVING;
  const isSuccess = state === FormStates.SUCCESS;
  const isError = state === FormStates.ERROR;
  const isValidating = state === FormStates.VALIDATING;

  return {
    state,
    progress,
    message,
    updateState,
    reset,
    // Estados de conveniencia
    isIdle,
    isLoading,
    isSaving,
    isSuccess,
    isError,
    isValidating,
    isProcessing: isLoading || isSaving || isValidating
  };
};

/**
 * Hook para manejo de pasos de formularios multi-paso
 */
export const useMultiStepForm = (steps = [], options = {}) => {
  const {
    validateStepOnNext = true,
    allowSkipSteps = false
  } = options;

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [stepData, setStepData] = useState({});
  const [stepErrors, setStepErrors] = useState({});

  const canGoNext = currentStep < steps.length - 1;
  const canGoPrev = currentStep > 0;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const currentStepData = stepData[currentStep] || {};

  const goToStep = useCallback((stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      if (!allowSkipSteps && stepIndex > currentStep) {
        // Verificar que los pasos anteriores estén completados
        for (let i = currentStep; i < stepIndex; i++) {
          if (!completedSteps.has(i)) {
            console.warn(`Cannot skip to step ${stepIndex}, step ${i} is not completed`);
            return false;
          }
        }
      }
      setCurrentStep(stepIndex);
      return true;
    }
    return false;
  }, [currentStep, steps.length, allowSkipSteps, completedSteps]);

  const nextStep = useCallback(async (data = null) => {
    if (!canGoNext) return false;

    // Validar paso actual si está habilitado
    if (validateStepOnNext && steps[currentStep].validate) {
      const validation = await steps[currentStep].validate(currentStepData);
      if (!validation.isValid) {
        setStepErrors(prev => ({
          ...prev,
          [currentStep]: validation.errors
        }));
        return false;
      }
    }

    // Guardar datos del paso
    if (data) {
      setStepData(prev => ({
        ...prev,
        [currentStep]: { ...currentStepData, ...data }
      }));
    }

    // Marcar paso como completado
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    
    // Ir al siguiente paso
    setCurrentStep(currentStep + 1);
    return true;
  }, [canGoNext, currentStep, currentStepData, validateStepOnNext, steps]);

  const prevStep = useCallback(() => {
    if (canGoPrev) {
      setCurrentStep(currentStep - 1);
      return true;
    }
    return false;
  }, [canGoPrev, currentStep]);

  const updateStepData = useCallback((data) => {
    setStepData(prev => ({
      ...prev,
      [currentStep]: { ...currentStepData, ...data }
    }));
  }, [currentStep, currentStepData]);

  const getAllData = useCallback(() => {
    return stepData;
  }, [stepData]);

  const resetForm = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setStepData({});
    setStepErrors({});
  }, []);

  return {
    currentStep,
    steps,
    canGoNext,
    canGoPrev,
    isFirstStep,
    isLastStep,
    currentStepData,
    completedSteps: Array.from(completedSteps),
    stepErrors,

    goToStep,
    nextStep,
    prevStep,
    updateStepData,
    getAllData,
    resetForm,

    // Utilidades
    getStepData: (stepIndex) => stepData[stepIndex] || {},
    isStepCompleted: (stepIndex) => completedSteps.has(stepIndex),
    getCompletionPercentage: () => (completedSteps.size / steps.length) * 100
  };
};

export default useViviendaValidation;