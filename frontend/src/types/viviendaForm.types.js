/**
 * Tipos específicos para la creación y edición de viviendas
 * Sincronizado con los esquemas de validación del backend
 */

import {
  TipoInmueble,
  TipoVivienda,
  Estado,
  Planta,
  TipoAnuncio,
  EstadoVenta,
  Caracteristica
} from './vivienda.types.js';

/**
 * Estados del proceso de creación/edición
 */
export const FormStates = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  UPLOADING_IMAGES: 'uploading_images',
  CREATING: 'creating',
  UPDATING: 'updating',
  SUCCESS: 'success',
  ERROR: 'error'
};

/**
 * Tipos de operación del formulario
 */
export const FormModes = {
  CREATE: 'create',
  EDIT: 'edit',
  DUPLICATE: 'duplicate'
};

/**
 * Datos del formulario de vivienda (estructura completa)
 */
export const ViviendaFormModel = {
  /**
   * Crea una instancia vacía del formulario
   */
  create() {
    return {
      name: '',
      price: '',
      shortDescription: '',
      description: '',
      rooms: '',
      bathRooms: '',
      garage: '',
      squaredMeters: '',
      provincia: '',
      poblacion: '',
      calle: '',
      numero: '',
      tipoInmueble: TipoInmueble.VIVIENDA,
      tipoVivienda: '',
      estado: '',
      planta: '',
      tipoAnuncio: '',
      estadoVenta: EstadoVenta.DISPONIBLE,
      caracteristicas: [],
      published: false,
      isDraft: false,
      images: [],
      imagesToDelete: [],
      newImages: []
    };
  },

  /**
   * Crea una instancia vacía del formulario (alias)
   */
  createEmpty() {
    return this.create();
  },

  /**
   * Crea formulario desde una vivienda existente
   */
  fromVivienda(vivienda) {
    if (!vivienda) {
      return this.create();
    }

    return {
      name: vivienda.name || '',
      price: vivienda.price?.toString() || '',
      shortDescription: vivienda.shortDescription || '',
      description: vivienda.description || '',
      rooms: vivienda.rooms?.toString() || '',
      bathRooms: vivienda.bathRooms?.toString() || '',
      garage: vivienda.garage?.toString() || '',
      squaredMeters: vivienda.squaredMeters?.toString() || '',
      provincia: vivienda.provincia || '',
      poblacion: vivienda.poblacion || '',
      calle: vivienda.calle || '',
      numero: vivienda.numero || '',
      tipoInmueble: vivienda.tipoInmueble || TipoInmueble.VIVIENDA,
      tipoVivienda: vivienda.tipoVivienda || '',
      estado: vivienda.estado || '',
      planta: vivienda.planta || '',
      tipoAnuncio: vivienda.tipoAnuncio || '',
      estadoVenta: vivienda.estadoVenta || EstadoVenta.DISPONIBLE,
      caracteristicas: Array.isArray(vivienda.caracteristicas) ? [...vivienda.caracteristicas] : [],
      published: Boolean(vivienda.published),
      isDraft: Boolean(vivienda.isDraft),
      images: Array.isArray(vivienda.imagenes) ? [...vivienda.imagenes] : [],
      imagesToDelete: [],
      newImages: []
    };
  },

  /**
   * Convierte datos del formulario al formato del backend
   */
  toVivienda(formData) {
    // Convertir precio de manera segura
    let price = 0;
    if (formData.price && formData.price.trim() !== '') {
      const parsedPrice = parseFloat(formData.price);
      if (!isNaN(parsedPrice) && parsedPrice > 0) {
        price = Math.round(parsedPrice); // Redondear a entero
      }
    }

    const data = {
      name: formData.name.trim(),
      price: price,
      shortDescription: formData.shortDescription?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      rooms: parseInt(formData.rooms) || 0,
      bathRooms: parseInt(formData.bathRooms) || 0,
      garage: parseInt(formData.garage) || 0,
      squaredMeters: parseInt(formData.squaredMeters) || undefined,
      provincia: formData.provincia?.trim() || undefined,
      poblacion: formData.poblacion?.trim() || undefined,
      calle: formData.calle?.trim() || undefined,
      numero: formData.numero?.trim() || undefined,
      tipoInmueble: formData.tipoInmueble || undefined,
      tipoVivienda: formData.tipoVivienda || undefined,
      estado: formData.estado || undefined,
      planta: formData.planta || undefined,
      tipoAnuncio: formData.tipoAnuncio || undefined,
      estadoVenta: formData.estadoVenta || EstadoVenta.DISPONIBLE,
      caracteristicas: Array.isArray(formData.caracteristicas) ? formData.caracteristicas : [],
      published: Boolean(formData.published),
      isDraft: Boolean(formData.isDraft)
    };

    // Limpiar campos undefined para enviar solo lo necesario
    Object.keys(data).forEach(key => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    return data;
  },

  /**
   * Convierte datos del formulario al formato del backend (alias)
   */
  toBackendFormat(formData) {
    return this.toVivienda(formData);
  }
};

/**
 * Reglas de validación del formulario (sincronizadas con backend)
 */
export const ValidationRules = {
  name: {
    required: true,
    minLength: 5,
    maxLength: 200,
    validate: (value) => {
      if (!value || value.trim().length === 0) return 'El nombre es obligatorio';
      if (value.trim().length < 5) return 'El nombre debe tener al menos 5 caracteres';
      if (value.trim().length > 200) return 'El nombre no puede exceder 200 caracteres';
      return null;
    }
  },

  price: {
    required: true,
    min: 0,
    validate: (value) => {
      if (!value || value.toString().trim() === '') return 'El precio es obligatorio';
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return 'El precio debe ser un número válido';
      if (numValue < 0) return 'El precio no puede ser negativo';
      if (numValue > 99999999) return 'El precio es demasiado alto';
      return null;
    }
  },

  shortDescription: {
    required: false,
    maxLength: 300,
    validate: (value) => {
      if (value && value.length > 300) return 'La descripción corta no puede exceder 300 caracteres';
      return null;
    }
  },

  description: {
    required: false,
    maxLength: 2000,
    validate: (value) => {
      if (value && value.length > 2000) return 'La descripción no puede exceder 2000 caracteres';
      return null;
    }
  },

  rooms: {
    required: false,
    min: 0,
    max: 50,
    validate: (value) => {
      if (!value || value === '') return null;
      const numValue = parseInt(value);
      if (isNaN(numValue)) return 'Las habitaciones deben ser un número válido';
      if (numValue < 0) return 'Las habitaciones no pueden ser negativas';
      if (numValue > 50) return 'Número de habitaciones demasiado alto';
      return null;
    }
  },

  bathRooms: {
    required: false,
    min: 0,
    max: 20,
    validate: (value) => {
      if (!value || value === '') return null;
      const numValue = parseInt(value);
      if (isNaN(numValue)) return 'Los baños deben ser un número válido';
      if (numValue < 0) return 'Los baños no pueden ser negativos';
      if (numValue > 20) return 'Número de baños demasiado alto';
      return null;
    }
  },

  garage: {
    required: false,
    min: 0,
    max: 10,
    validate: (value) => {
      if (!value || value === '') return null;
      const numValue = parseInt(value);
      if (isNaN(numValue)) return 'Los garajes deben ser un número válido';
      if (numValue < 0) return 'Los garajes no pueden ser negativos';
      if (numValue > 10) return 'Número de garajes demasiado alto';
      return null;
    }
  },

  squaredMeters: {
    required: false,
    min: 0,
    max: 10000,
    validate: (value) => {
      if (!value || value === '') return null;
      const numValue = parseInt(value);
      if (isNaN(numValue)) return 'Los metros cuadrados deben ser un número válido';
      if (numValue < 0) return 'Los metros cuadrados no pueden ser negativos';
      if (numValue > 10000) return 'Metros cuadrados demasiado altos';
      return null;
    }
  },

  provincia: {
    required: false,
    maxLength: 100,
    validate: (value) => {
      if (value && value.length > 100) return 'La provincia no puede exceder 100 caracteres';
      return null;
    }
  },

  poblacion: {
    required: false,
    maxLength: 100,
    validate: (value) => {
      if (value && value.length > 100) return 'La población no puede exceder 100 caracteres';
      return null;
    }
  },

  calle: {
    required: false,
    maxLength: 100,
    validate: (value) => {
      if (value && value.length > 100) return 'La calle no puede exceder 100 caracteres';
      return null;
    }
  },

  numero: {
    required: false,
    maxLength: 20,
    validate: (value) => {
      if (value && value.length > 20) return 'El número no puede exceder 20 caracteres';
      return null;
    }
  }
};

/**
 * Utilidades para ValidationRules
 */
export const ValidationUtils = {
  /**
   * Obtiene la lista de campos requeridos
   */
  getRequiredFields() {
    return Object.keys(ValidationRules).filter(fieldName => 
      ValidationRules[fieldName].required === true
    );
  },

  /**
   * Verifica si un campo es requerido
   */
  isRequired(fieldName) {
    return ValidationRules[fieldName]?.required === true;
  },

  /**
   * Obtiene las reglas de validación para un campo específico
   */
  getRules(fieldName) {
    return ValidationRules[fieldName] || null;
  }
};

/**
 * Validador completo del formulario
 */
export const FormValidator = {
  /**
   * Valida un campo específico
   */
  validateField(fieldName, value, formData = {}) {
    const rule = ValidationRules[fieldName];
    if (!rule) return [];
    
    const error = rule.validate(value);
    return error ? [error] : [];
  },

  /**
   * Valida todo el formulario
   */
  async validateViviendaForm(formData) {
    const errors = {};
    let hasErrors = false;
    const warnings = [];

    // Validar cada campo
    Object.keys(ValidationRules).forEach(fieldName => {
      const fieldErrors = FormValidator.validateField(fieldName, formData[fieldName], formData);
      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors[0]; // Solo el primer error
        hasErrors = true;
      }
    });

    // Validaciones especiales
    // Verificar que al menos un campo de ubicación esté presente
    if (!formData.provincia && !formData.poblacion && !formData.calle) {
      warnings.push('Recomendamos especificar al menos un campo de ubicación');
    }

    return {
      isValid: !hasErrors,
      errors,
      warnings
    };
  },

  /**
   * Alias del método principal para compatibilidad
   */
  validateForm(formData) {
    return this.validateViviendaForm(formData);
  },

  /**
   * Valida que los datos estén listos para enviar al backend
   */
  async validateForSubmission(formData) {
    const validation = await this.validateViviendaForm(formData);
    
    if (!validation.isValid) {
      return validation;
    }

    // Validaciones adicionales para envío
    const additionalErrors = {};

    // Verificar precio
    if (!formData.price || parseFloat(formData.price) <= 0) {
      additionalErrors.price = 'El precio debe ser mayor que 0 para publicar';
    }

    // Verificar que tenga al menos una característica básica
    if (!formData.tipoVivienda) {
      additionalErrors.tipoVivienda = 'Debe especificar el tipo de vivienda';
    }

    if (!formData.tipoAnuncio) {
      additionalErrors.tipoAnuncio = 'Debe especificar si es venta o alquiler';
    }

    const hasAdditionalErrors = Object.keys(additionalErrors).length > 0;

    return {
      isValid: !hasAdditionalErrors,
      errors: { ...validation.errors, ...additionalErrors },
      warnings: validation.warnings || []
    };
  }
};

/**
 * Utilidades para manejo de imágenes
 */
export const ImageUtils = {
  /**
   * Valida archivos de imagen
   */
  validateImageFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) return 'Archivo requerido';
    
    if (!allowedTypes.includes(file.type)) {
      return 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, WebP';
    }

    if (file.size > maxSize) {
      return 'El archivo es demasiado grande. Máximo 10MB';
    }

    return null;
  },

  /**
   * Valida múltiples archivos de imagen
   */
  validateImageFiles(files) {
    const maxFiles = 20;
    const errors = [];

    if (!Array.isArray(files)) {
      return ['Debe proporcionar un array de archivos'];
    }

    if (files.length === 0) {
      return ['Debe seleccionar al menos una imagen'];
    }

    if (files.length > maxFiles) {
      return [`Máximo ${maxFiles} imágenes permitidas`];
    }

    files.forEach((file, index) => {
      const error = this.validateImageFile(file);
      if (error) {
        errors.push(`Imagen ${index + 1}: ${error}`);
      }
    });

    return errors;
  },

  /**
   * Prepara archivos para subida
   */
  prepareFilesForUpload(files) {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    return formData;
  },

  /**
   * Prepara datos de imágenes para asociar a vivienda
   */
  prepareImagesForProperty(uploadedImages, existingImages = []) {
    if (!Array.isArray(uploadedImages) || uploadedImages.length === 0) {
      return [];
    }
    
    const images = [];
    let orden = existingImages.length;

    uploadedImages.forEach((image, index) => {
      if (image && image.url) {
        images.push({
          url: image.url,
          orden: orden++
        });
      }
    });
    return images;
  }
};

/**
 * Estados derivados para el formulario
 */
export const FormStateUtils = {
  isSubmitting: (state) => [
    FormStates.VALIDATING,
    FormStates.UPLOADING_IMAGES,
    FormStates.CREATING,
    FormStates.UPDATING
  ].includes(state),

  isLoading: (state) => [
    FormStates.UPLOADING_IMAGES,
    FormStates.CREATING,
    FormStates.UPDATING
  ].includes(state),

  canSubmit: (state, isValid) => state === FormStates.IDLE && isValid,
  
  canReset: (state) => [FormStates.IDLE, FormStates.ERROR, FormStates.SUCCESS].includes(state),

  getLoadingMessage: (state) => {
    switch (state) {
      case FormStates.VALIDATING:
        return 'Validando datos...';
      case FormStates.UPLOADING_IMAGES:
        return 'Subiendo imágenes...';
      case FormStates.CREATING:
        return 'Creando vivienda...';
      case FormStates.UPDATING:
        return 'Actualizando vivienda...';
      default:
        return '';
    }
  }
};