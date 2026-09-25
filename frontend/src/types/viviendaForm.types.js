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
import { htmlToPlainText, isRichTextEmpty } from '../utils/htmlText.js';

/**
 * Límites de texto del formulario. La descripción se mide en TEXTO PLANO
 * (no en HTML): es la única fuente para validación, contador y editor.
 */
export const DESCRIPTION_MAX = 5000;
export const SHORT_DESCRIPTION_MAX = 300;

/**
 * Nombres legibles de los campos validados, en el orden en que aparecen en el
 * formulario (se usa para el resumen de errores junto a los botones).
 */
export const ViviendaFieldLabels = {
  name: 'Nombre',
  price: 'Precio',
  shortDescription: 'Descripción breve',
  description: 'Descripción completa',
  rooms: 'Habitaciones',
  bathRooms: 'Baños',
  garage: 'Garajes',
  squaredMeters: 'Metros cuadrados',
  provincia: 'Provincia',
  poblacion: 'Población',
  calle: 'Calle',
  numero: 'Número'
};

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
      tipoAnuncio: TipoAnuncio.VENTA,
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
   * Crea formulario desde una vivienda existente.
   * No inventa valores: lo que viene vacío de BD se carga como '' (el
   * formulario muestra «Sin especificar» o el placeholder).
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
      numero: vivienda.numero?.toString() || '',
      tipoInmueble: vivienda.tipoInmueble || '',
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
   * Convierte datos del formulario al formato del backend.
   *
   * Opciones:
   * - isEdit: en edición NO se envía `published` salvo acción explícita
   *   (editar no cambia el estado de publicación).
   * - isDraft: fija el borrador según la acción; si no llega, se envía el
   *   valor cargado en el formulario.
   * - published: publicación explícita (p. ej. «Publicar vivienda»).
   *
   * Los opcionales vacíos se envían como '' (no se omiten): el backend los
   * guarda como NULL, así vaciar un campo en edición sí se guarda.
   */
  toVivienda(formData, { isEdit = false, isDraft, published } = {}) {
    const text = (value) => String(value ?? '').trim();

    // Convertir precio de manera segura
    let price = 0;
    const rawPrice = text(formData.price);
    if (rawPrice !== '') {
      const parsedPrice = parseFloat(rawPrice);
      if (!isNaN(parsedPrice) && parsedPrice > 0) {
        price = Math.round(parsedPrice); // Redondear a entero
      }
    }

    const squaredMeters = parseInt(text(formData.squaredMeters), 10);
    // Quill deja '<p><br></p>' al vaciar el editor: se normaliza a ''
    const description = text(formData.description);

    const data = {
      name: text(formData.name),
      price: price,
      shortDescription: text(formData.shortDescription),
      description: isRichTextEmpty(description) ? '' : description,
      rooms: parseInt(formData.rooms, 10) || 0,
      bathRooms: parseInt(formData.bathRooms, 10) || 0,
      garage: parseInt(formData.garage, 10) || 0,
      squaredMeters: Number.isNaN(squaredMeters) ? '' : squaredMeters,
      provincia: text(formData.provincia),
      poblacion: text(formData.poblacion),
      calle: text(formData.calle),
      numero: text(formData.numero),
      tipoInmueble: formData.tipoInmueble || undefined,
      tipoVivienda: formData.tipoVivienda || '',
      estado: formData.estado || '',
      planta: formData.planta || '',
      tipoAnuncio: formData.tipoAnuncio || '',
      estadoVenta: formData.estadoVenta || EstadoVenta.DISPONIBLE,
      caracteristicas: Array.isArray(formData.caracteristicas) ? formData.caracteristicas : [],
      isDraft: isDraft ?? Boolean(formData.isDraft)
    };

    if (published !== undefined) {
      data.published = Boolean(published);
    } else if (!isEdit) {
      data.published = Boolean(formData.published);
    }

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
  toBackendFormat(formData, options) {
    return this.toVivienda(formData, options);
  }
};

/**
 * Regla para enteros opcionales (habitaciones, m²…) con un tope generoso que
 * no bloquee datos reales (terrenos, naves, edificios importados).
 */
const optionalIntegerRule = ({ max, invalid, negative, tooHigh }) => ({
  required: false,
  min: 0,
  max,
  validate: (value) => {
    if (value === undefined || value === null || String(value).trim() === '') return null;
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return invalid;
    if (numValue < 0) return negative;
    if (numValue > max) return tooHigh;
    return null;
  }
});

// Longitud máxima de un texto opcional
const maxLengthRule = (maxLength, message) => ({
  required: false,
  maxLength,
  validate: (value) => {
    if (value && String(value).length > maxLength) return message;
    return null;
  }
});

/**
 * Reglas de validación del formulario (sincronizadas con backend)
 */
export const ValidationRules = {
  name: {
    required: true,
    minLength: 5,
    maxLength: 200,
    validate: (value) => {
      const name = String(value ?? '').trim();
      if (name.length === 0) return 'El nombre es obligatorio';
      if (name.length < 5) return 'El nombre debe tener al menos 5 caracteres';
      if (name.length > 200) return 'El nombre no puede exceder 200 caracteres';
      return null;
    }
  },

  price: {
    required: true,
    min: 0,
    validate: (value) => {
      if (value === undefined || value === null || String(value).trim() === '') return 'El precio es obligatorio';
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return 'El precio debe ser un número válido';
      // El backend rechaza precio 0 (también en borradores)
      if (numValue <= 0) return 'El precio debe ser mayor que 0';
      if (numValue > 99999999) return 'El precio es demasiado alto';
      return null;
    }
  },

  shortDescription: maxLengthRule(
    SHORT_DESCRIPTION_MAX,
    `La descripción breve no puede exceder ${SHORT_DESCRIPTION_MAX} caracteres`
  ),

  // Se mide el texto visible, no el HTML de Quill (el marcado no cuenta)
  description: {
    required: false,
    maxLength: DESCRIPTION_MAX,
    validate: (value) => {
      if (htmlToPlainText(value).length > DESCRIPTION_MAX) {
        return `La descripción no puede exceder ${DESCRIPTION_MAX} caracteres`;
      }
      return null;
    }
  },

  rooms: optionalIntegerRule({
    max: 999,
    invalid: 'Las habitaciones deben ser un número válido',
    negative: 'Las habitaciones no pueden ser negativas',
    tooHigh: 'Número de habitaciones demasiado alto (máximo 999)'
  }),

  bathRooms: optionalIntegerRule({
    max: 999,
    invalid: 'Los baños deben ser un número válido',
    negative: 'Los baños no pueden ser negativos',
    tooHigh: 'Número de baños demasiado alto (máximo 999)'
  }),

  garage: optionalIntegerRule({
    max: 999,
    invalid: 'Los garajes deben ser un número válido',
    negative: 'Los garajes no pueden ser negativos',
    tooHigh: 'Número de garajes demasiado alto (máximo 999)'
  }),

  squaredMeters: optionalIntegerRule({
    max: 10000000,
    invalid: 'Los metros cuadrados deben ser un número válido',
    negative: 'Los metros cuadrados no pueden ser negativos',
    tooHigh: 'Metros cuadrados demasiado altos (máximo 10.000.000)'
  }),

  provincia: maxLengthRule(100, 'La provincia no puede exceder 100 caracteres'),

  poblacion: maxLengthRule(100, 'La población no puede exceder 100 caracteres'),

  calle: maxLengthRule(100, 'La calle no puede exceder 100 caracteres'),

  numero: maxLengthRule(20, 'El número no puede exceder 20 caracteres')
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
   * Ordena archivos alfabética y numéricamente por nombre de archivo.
   * Usa comparación natural para que "img2" vaya antes que "img10".
   * @param {File[]} files - Array de objetos File
   * @returns {File[]} Nuevo array ordenado (no muta el original)
   */
  sortFilesByName(files) {
    if (!Array.isArray(files) || files.length <= 1) return files;
    return [...files].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', undefined, { numeric: true, sensitivity: 'base' })
    );
  },

  /**
   * Valida archivos de imagen
   */
  validateImageFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!file) return 'Archivo requerido';
    
    if (!allowedTypes.includes(file.type)) {
      console.log('Tipo de archivo detectado:', file.type); // Debug
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