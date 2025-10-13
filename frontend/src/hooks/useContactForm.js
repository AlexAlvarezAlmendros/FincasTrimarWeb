import { useState, useCallback } from 'react';

/**
 * Custom hook para manejar formularios de contacto
 * @param {Object} options - Configuración del hook
 * @param {Object} options.initialData - Datos iniciales del formulario
 * @param {string} options.viviendaId - ID de la vivienda (opcional)
 * @param {Function} options.onSuccess - Callback cuando el envío es exitoso
 * @param {Function} options.onError - Callback cuando hay error en el envío
 */
const useContactForm = ({ 
  initialData = {}, 
  viviendaId = null, 
  onSuccess = null, 
  onError = null 
} = {}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    descripcion: '', // Usado como 'mensaje' en la UI pero enviado como 'descripcion' al backend
    tipo: 'general',
    acepta_politicas: false,
    website: '', // Campo honeypot para prevenir spam
    ...initialData
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitType, setSubmitType] = useState(''); // 'success' | 'error'
  const [errors, setErrors] = useState({});

  /**
   * Validar campos del formulario
   */
  const validateForm = useCallback((data) => {
    const newErrors = {};

    // Validar nombre (requerido)
    if (!data.nombre || data.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email (requerido y formato)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      newErrors.email = 'Por favor, introduce un email válido';
    }

    // Validar teléfono (opcional pero si se proporciona, debe ser válido)
    if (data.telefono && data.telefono.trim().length > 0) {
      const phoneRegex = /^[+]?[\d\s\-()]{9,}$/;
      if (!phoneRegex.test(data.telefono.trim())) {
        newErrors.telefono = 'Formato de teléfono no válido';
      }
    }

    // Validar asunto (requerido)
    if (!data.asunto || data.asunto.trim().length === 0) {
      newErrors.asunto = 'Por favor, selecciona o escribe un asunto';
    }

    // Validar mensaje/descripción (requerido, mínimo 10 caracteres)
    if (!data.descripcion || data.descripcion.trim().length < 10) {
      newErrors.descripcion = 'El mensaje debe tener al menos 10 caracteres';
    }

    // Validar aceptación de políticas (requerido)
    if (!data.acepta_politicas) {
      newErrors.acepta_politicas = 'Debes aceptar la política de privacidad';
    }

    return newErrors;
  }, []);

  /**
   * Actualizar campo del formulario
   */
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error de este campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  /**
   * Actualizar múltiples campos a la vez
   */
  const updateFields = useCallback((newData) => {
    setFormData(prev => ({
      ...prev,
      ...newData
    }));
  }, []);

  /**
   * Limpiar mensajes de estado
   */
  const clearMessages = useCallback(() => {
    setSubmitMessage('');
    setSubmitType('');
    setErrors({});
  }, []);

  /**
   * Resetear formulario completo
   */
  const resetForm = useCallback(() => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      descripcion: '',
      tipo: 'general',
      acepta_politicas: false,
      website: '',
      ...initialData
    });
    clearMessages();
  }, [initialData, clearMessages]);

  /**
   * Enviar formulario al backend
   */
  const submitForm = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Limpiar mensajes anteriores
    clearMessages();
    setIsSubmitting(true);

    try {
      // Validar formulario
      const validationErrors = validateForm(formData);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setSubmitMessage('Por favor, corrige los errores en el formulario');
        setSubmitType('error');
        return false;
      }

      // Preparar datos para el backend
      const payload = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono ? formData.telefono.trim() : '',
        asunto: formData.asunto.trim(),
        descripcion: formData.descripcion.trim(),
        tipo: formData.tipo || 'general',
        acepta_politicas: formData.acepta_politicas,
        website: formData.website || ''
      };

      // Añadir ID de vivienda si está disponible
      if (viviendaId) {
        payload.viviendaId = viviendaId;
      }

      // Realizar petición al backend
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/messages/send-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error?.message || `Error ${response.status}: ${response.statusText}`);
      }

      // Éxito
      setSubmitMessage('¡Gracias! Hemos recibido tu mensaje. Te responderemos lo antes posible.');
      setSubmitType('success');

      // Callback de éxito si está definido
      if (onSuccess) {
        onSuccess(responseData, formData);
      }

      // Resetear formulario después del éxito
      resetForm();
      
      return true;

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      let errorMessage = 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.';
      
      // Personalizar mensaje según el tipo de error
      if (error.message.includes('400')) {
        errorMessage = 'Datos del formulario incorrectos. Por favor, revisa la información.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Has enviado demasiados mensajes. Espera un momento antes de intentar de nuevo.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error interno del servidor. Intenta contactarnos por teléfono.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      }

      setSubmitMessage(errorMessage);
      setSubmitType('error');

      // Callback de error si está definido
      if (onError) {
        onError(error, formData);
      }
      
      return false;

    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, clearMessages, viviendaId, onSuccess, onError, resetForm]);

  /**
   * Verificar si el formulario tiene cambios
   */
  const hasChanges = useCallback(() => {
    const initialValues = {
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      descripcion: '',
      tipo: 'general',
      acepta_politicas: false,
      website: '',
      ...initialData
    };

    return Object.keys(formData).some(key => 
      formData[key] !== initialValues[key]
    );
  }, [formData, initialData]);

  /**
   * Verificar si el formulario es válido (sin errores y campos requeridos llenos)
   */
  const isValid = useCallback(() => {
    const validationErrors = validateForm(formData);
    return Object.keys(validationErrors).length === 0;
  }, [formData, validateForm]);

  return {
    // Estados del formulario
    formData,
    isSubmitting,
    submitMessage,
    submitType,
    errors,
    
    // Acciones del formulario
    updateField,
    updateFields,
    submitForm,
    resetForm,
    clearMessages,
    
    // Utilidades
    hasChanges: hasChanges(),
    isValid: isValid(),
    
    // Computed properties para la UI
    showSuccess: submitType === 'success' && submitMessage,
    showError: submitType === 'error' && submitMessage,
    canSubmit: !isSubmitting && isValid()
  };
};

export default useContactForm;
