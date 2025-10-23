/**
 * Índice de hooks para manejo de viviendas
 * Punto único de importación para todos los hooks relacionados
 */

// Hooks principales
export { default as useViviendas, useVivienda, useSimilarViviendas } from './useViviendas.js';
export { default as useCreateVivienda, useDuplicateVivienda } from './useCreateVivienda.js';
export { default as useViviendaManager, OperationModes } from './useViviendaManager.js';

// Hooks especializados
export { default as useImageManager, ImageStates } from './useImageManager.js';
export { 
  default as useViviendaValidation, 
  useFormState, 
  useMultiStepForm 
} from './useFormValidation.js';

// Hooks de utilidades
export { default as useApi } from './useApi.js';
export { default as usePropertySearch } from './usePropertySearch.js';
export { default as useUserRoles } from './useUserRoles.js';

// Re-exportar tipos y constantes útiles
export { FormStates, ViviendaFormModel, ValidationUtils } from '../types/viviendaForm.types.js';
export { 
  TipoVivienda, 
  TipoInmueble, 
  Estado, 
  EstadoDeLaVenta,
  TipoAnuncio,
  Caracteristica,
  DataTransformers 
} from '../types/vivienda.types.js';

/**
 * Hook compuesto para casos de uso comunes
 */
export const useViviendaListingPage = (options = {}) => {
  const { 
    initialFilters = {},
    pageSize = 20,
    enableCache = true 
  } = options;

  const listing = useViviendas({
    initialFilters,
    pageSize,
    enableCache
  });

  return {
    ...listing,
    // Añadir métodos de conveniencia
    refreshList: listing.refetch,
    clearFilters: () => listing.setFilters({}),
    resetPagination: () => listing.setPage(1)
  };
};

/**
 * Hook compuesto para páginas de detalle
 */
export const useViviendaDetailPage = (viviendaId, options = {}) => {
  const { 
    loadSimilar = true,
    similarLimit = 6 
  } = options;

  const { vivienda, loading, error, refetch } = useVivienda(viviendaId);
  const { 
    viviendas: similar, 
    loading: loadingSimilar 
  } = useSimilarViviendas(vivienda, { 
    enabled: loadSimilar && Boolean(vivienda),
    limit: similarLimit 
  });

  return {
    vivienda,
    loading,
    error,
    similar,
    loadingSimilar,
    refresh: refetch,
    hasSimilar: similar && similar.length > 0
  };
};

/**
 * Hook compuesto para formularios de creación/edición
 */
export const useViviendaForm = (mode = 'create', viviendaId = null, options = {}) => {
  const {
    autoSave = false,
    maxImages = 20,
    onSuccess,
    onError
  } = options;

  return useViviendaManager({
    mode,
    viviendaId,
    autoSave,
    maxImages,
    onSuccess,
    onError
  });
};

/**
 * Hook para manejo de imágenes independiente
 */
export const usePropertyImages = (propertyId, options = {}) => {
  const {
    autoUpload = true,
    maxImages = 20
  } = options;

  return useImageManager(propertyId, {
    autoUpload,
    maxImages,
    ...options
  });
};

// Constantes útiles
export const HOOK_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_IMAGES: 20,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  DEBOUNCE_MS: 300,
  AUTO_SAVE_INTERVAL: 30000 // 30 segundos
};

/**
 * Utilidades para trabajar con múltiples hooks
 */
export const HookUtils = {
  /**
   * Crear configuración estándar para hooks de listado
   */
  createListingConfig: (overrides = {}) => ({
    pageSize: HOOK_CONSTANTS.DEFAULT_PAGE_SIZE,
    enableCache: true,
    debounceMs: HOOK_CONSTANTS.DEBOUNCE_MS,
    ...overrides
  }),

  /**
   * Crear configuración estándar para hooks de formulario
   */
  createFormConfig: (overrides = {}) => ({
    autoSave: false,
    maxImages: HOOK_CONSTANTS.MAX_IMAGES,
    autoSaveInterval: HOOK_CONSTANTS.AUTO_SAVE_INTERVAL,
    validateOnChange: true,
    validateOnBlur: true,
    ...overrides
  }),

  /**
   * Crear configuración estándar para manejo de imágenes
   */
  createImageConfig: (overrides = {}) => ({
    maxImages: HOOK_CONSTANTS.MAX_IMAGES,
    autoUpload: false,
    ...overrides
  })
};

/**
 * Tipos de configuración para diferentes casos de uso
 */
export const PresetConfigs = {
  // Configuración para páginas públicas (solo lectura)
  PUBLIC_LISTING: HookUtils.createListingConfig({
    enableCache: true,
    onlyPublished: true
  }),

  // Configuración para administración
  ADMIN_LISTING: HookUtils.createListingConfig({
    enableCache: false,
    includeUnpublished: true
  }),

  // Configuración para formularios de creación rápida
  QUICK_CREATE: HookUtils.createFormConfig({
    autoSave: true,
    validateOnChange: false,
    validateOnBlur: true
  }),

  // Configuración para formularios completos
  FULL_FORM: HookUtils.createFormConfig({
    autoSave: true,
    validateOnChange: true,
    maxImages: 30
  }),

  // Configuración para galería de imágenes
  IMAGE_GALLERY: HookUtils.createImageConfig({
    autoUpload: true,
    maxImages: 50
  })
};