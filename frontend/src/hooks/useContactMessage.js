/**
 * Hook para gestión de mensajes de contacto
 * Maneja el estado del formulario y el envío de mensajes
 */

import { useState, useCallback } from 'react';
import messageService from '../services/messageService.js';

export const useContactMessage = (initialMessage = '', propertyName = '') => {
  // Estado del formulario
  const [contactForm, setContactForm] = useState({
    mensaje: initialMessage || `¿Estás interesado en agendar una visita para "${propertyName}"?`,
    nombre: '',
    email: '',
    telefono: ''
  });

  // Estados de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /**
   * Actualiza un campo del formulario
   */
  const updateField = useCallback((field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores al editar
    if (submitError) {
      setSubmitError(null);
    }
    if (submitSuccess) {
      setSubmitSuccess(false);
    }
  }, [submitError, submitSuccess]);

  /**
   * Actualiza el mensaje cuando cambia la propiedad
   */
  const updatePropertyMessage = useCallback((newPropertyName) => {
    if (newPropertyName) {
      setContactForm(prev => ({
        ...prev,
        mensaje: `¿Estás interesado en agendar una visita para "${newPropertyName}"?`
      }));
    }
  }, []);

  /**
   * Envía el mensaje de contacto
   */
  const sendMessage = useCallback(async (propertyId = null, propertyName = '') => {
    if (isSubmitting) return { success: false };
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // Validación básica del cliente
      if (!contactForm.nombre.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (!contactForm.email.trim()) {
        throw new Error('El email es requerido');
      }
      if (!contactForm.mensaje.trim()) {
        throw new Error('El mensaje es requerido');
      }

      // Preparar datos del mensaje
      const messageData = {
        nombre: contactForm.nombre.trim(),
        email: contactForm.email.trim(),
        telefono: contactForm.telefono.trim(),
        asunto: `Consulta sobre: ${propertyName || 'Vivienda'}`,
        descripcion: contactForm.mensaje.trim(),
        viviendaId: propertyId
      };

      // Enviar mensaje a través del servicio
      const result = await messageService.sendMessage(messageData);
      
      if (result.success) {
        setSubmitSuccess(true);
        
        // Limpiar formulario pero mantener el mensaje inicial
        setContactForm({
          mensaje: initialMessage || `¿Estás interesado en agendar una visita para "${propertyName}"?`,
          nombre: '',
          email: '',
          telefono: ''
        });

        return { success: true, message: result.message };
      } else {
        throw new Error(result.message || 'Error al enviar el mensaje');
      }
      
    } catch (error) {
      console.error('Error sending contact message:', error);
      const errorMessage = error.message || 'Error al enviar el mensaje. Inténtalo de nuevo.';
      setSubmitError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, [contactForm, isSubmitting, initialMessage]);

  /**
   * Resetea el formulario
   */
  const resetForm = useCallback(() => {
    setContactForm({
      mensaje: initialMessage || '',
      nombre: '',
      email: '',
      telefono: ''
    });
    setSubmitError(null);
    setSubmitSuccess(false);
  }, [initialMessage]);

  /**
   * Limpia mensajes de estado
   */
  const clearMessages = useCallback(() => {
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  return {
    // Estado del formulario
    contactForm,
    
    // Estados de envío
    isSubmitting,
    submitError,
    submitSuccess,
    
    // Funciones de manipulación
    updateField,
    updatePropertyMessage,
    sendMessage,
    resetForm,
    clearMessages,
    
    // Validaciones
    isValid: contactForm.nombre.trim() && 
             contactForm.email.trim() && 
             contactForm.mensaje.trim()
  };
};

export default useContactMessage;