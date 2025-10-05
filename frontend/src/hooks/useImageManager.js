/**
 * Hook específico para el manejo de imágenes de viviendas
 * Funciona independientemente del formulario principal
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import propertyService from '../services/propertyService.js';
import { ImageUtils } from '../types/viviendaForm.types.js';

/**
 * Estados para el manejo de imágenes
 */
export const ImageStates = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

/**
 * Hook para manejo de imágenes
 */
export const useImageManager = (propertyId = null, options = {}) => {
  const { getAccessTokenSilently } = useAuth0();
  const {
    maxImages = 20,
    autoUpload = false,
    onUploadStart,
    onUploadProgress,
    onUploadComplete,
    onError
  } = options;

  // Estados
  const [images, setImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadState, setUploadState] = useState(ImageStates.IDLE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  // Referencias
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Cargar imágenes existentes de una propiedad
   */
  const loadPropertyImages = useCallback(async (propId = propertyId) => {
    if (!propId) return;

    try {
      setUploadState(ImageStates.PROCESSING);
      const response = await propertyService.getPropertyImages(propId);
      
      if (isMountedRef.current && response.success) {
        setImages(response.data.images || []);
        setUploadState(ImageStates.SUCCESS);
      }
    } catch (error) {
      console.error('Error loading property images:', error);
      if (isMountedRef.current) {
        setError(error.message);
        setUploadState(ImageStates.ERROR);
        if (onError) onError(error);
      }
    }
  }, [propertyId, onError]);

  /**
   * Añadir archivos para subir
   */
  const addFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    
    // Validar archivos
    const validationErrors = ImageUtils.validateImageFiles(fileArray);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      if (onError) onError(new Error(validationErrors.join(', ')));
      return false;
    }

    // Verificar límite total
    const totalImages = images.length + pendingFiles.length + fileArray.length;
    if (totalImages > maxImages) {
      const error = `Máximo ${maxImages} imágenes permitidas. Actualmente tienes ${images.length + pendingFiles.length}`;
      setError(error);
      if (onError) onError(new Error(error));
      return false;
    }

    // Añadir archivos con preview
    const filesWithPreview = fileArray.map(file => ({
      file,
      id: `temp_${Date.now()}_${Math.random()}`,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      status: 'pending'
    }));

    setPendingFiles(prev => [...prev, ...filesWithPreview]);
    setError(null);

    // Auto upload si está habilitado
    if (autoUpload && propertyId) {
      setTimeout(() => uploadPendingFiles(), 100);
    }

    return true;
  }, [images.length, pendingFiles.length, maxImages, autoUpload, propertyId, onError]);

  /**
   * Eliminar archivo pendiente
   */
  const removePendingFile = useCallback((fileId) => {
    setPendingFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Limpiar URL de preview
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  }, []);

  /**
   * Subir archivos pendientes
   */
  const uploadPendingFiles = useCallback(async (propId = propertyId) => {
    if (pendingFiles.length === 0 || !propId) {
      return { success: true, results: [] };
    }

    // Cancelar upload anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setUploadState(ImageStates.UPLOADING);
      setUploadProgress(0);
      setError(null);

      if (onUploadStart) {
        onUploadStart(pendingFiles.length);
      }

      // Simular progreso inicial
      setUploadProgress(10);

      // 1. Subir archivos al servicio de imágenes
      const files = pendingFiles.map(pf => pf.file);
      const uploadResponse = await propertyService.uploadImages(files, getAccessTokenSilently);

      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error?.message || 'Error al subir imágenes');
      }

      setUploadProgress(70);

      // 2. Asociar imágenes a la propiedad
      if (uploadResponse.data && uploadResponse.data.images && uploadResponse.data.images.length > 0) {
        const imagesData = ImageUtils.prepareImagesForProperty(
          uploadResponse.data.images,
          images
        );
        
        // Verificar que imagesData no esté vacío antes de enviar
        if (!Array.isArray(imagesData) || imagesData.length === 0) {
          console.error('❌ imagesData está vacío o no es array:', imagesData);
          throw new Error('No se pudieron preparar los datos de imágenes para asociar');
        }
        
        const associateResponse = await propertyService.addPropertyImages(propId, imagesData, getAccessTokenSilently);
        
        if (!associateResponse.success) {
          throw new Error(associateResponse.error?.message || 'Error al asociar imágenes');
        }

        // Actualizar lista de imágenes
        if (isMountedRef.current) {
          setImages(prev => [...prev, ...associateResponse.data.images]);
          setUploadProgress(100);
        }
      }

      // Limpiar archivos pendientes
      pendingFiles.forEach(pf => {
        if (pf.preview) {
          URL.revokeObjectURL(pf.preview);
        }
      });
      setPendingFiles([]);

      if (isMountedRef.current) {
        setUploadState(ImageStates.SUCCESS);
        
        if (onUploadComplete) {
          onUploadComplete(uploadResponse.data.images);
        }
      }

      return {
        success: true,
        results: uploadResponse.data.images
      };

    } catch (error) {
      console.error('Error uploading images:', error);
      
      if (error.name !== 'AbortError' && isMountedRef.current) {
        setError(error.message);
        setUploadState(ImageStates.ERROR);
        
        if (onError) {
          onError(error);
        }
      }

      return {
        success: false,
        error: error.message
      };
    } finally {
      if (isMountedRef.current) {
        setUploadProgress(0);
      }
      abortControllerRef.current = null;
    }
  }, [pendingFiles, propertyId, images, onUploadStart, onUploadComplete, onError]);

  /**
   * Eliminar imagen existente
   */
  const removeImage = useCallback(async (imageId, propId = propertyId) => {
    if (!imageId || !propId) {
      throw new Error('ID de imagen y propiedad requeridos');
    }

    try {
      const response = await propertyService.deletePropertyImage(propId, imageId, getAccessTokenSilently);
      
      if (response.success && isMountedRef.current) {
        setImages(prev => prev.filter(img => img.id !== imageId));
      }

      return response;
    } catch (error) {
      console.error('Error removing image:', error);
      if (onError) onError(error);
      throw error;
    }
  }, [propertyId, onError]);

  /**
   * Reordenar imágenes - recibe el array completo ya reordenado
   */
  const reorderImages = useCallback(async (reorderedImages, propId = propertyId) => {
    if (!propId) {
      throw new Error('ID de propiedad requerido para reordenar');
    }

    try {
      setIsReordering(true);

      // Actualizar orden local inmediatamente (optimistic update)
      setImages(reorderedImages);

      // Preparar datos para el backend
      const imageOrders = reorderedImages.map((img, index) => ({
        id: img.id,
        orden: index + 1
      }));

      // Enviar al backend
      const response = await propertyService.reorderPropertyImages(propId, imageOrders);

      if (!response.success) {
        // Revertir cambio local si falla el backend
        setImages(images);
        throw new Error(response.error?.message || 'Error al reordenar imágenes');
      }

      console.log('✅ Imágenes reordenadas correctamente');
      return response;
    } catch (error) {
      console.error('Error reordering images:', error);
      if (onError) onError(error);
      
      // Revertir cambio local en caso de error
      setImages(images);
      throw error;
    } finally {
      setIsReordering(false);
    }
  }, [images, propertyId, onError]);

  /**
   * Reordenar archivos pendientes localmente (antes de subir)
   */
  const reorderPendingFiles = useCallback((reorderedFiles) => {
    try {
      // Validar que todos los archivos están en la lista actual
      const currentIds = new Set(pendingFiles.map(f => f.id));
      const reorderedIds = new Set(reorderedFiles.map(f => f.id));
      
      if (currentIds.size !== reorderedIds.size || 
          ![...currentIds].every(id => reorderedIds.has(id))) {
        throw new Error('Archivos no válidos para reordenar');
      }

      setPendingFiles(reorderedFiles);
    } catch (error) {
      console.error('Error reordering pending files:', error);
      if (onError) {
        onError(error);
      }
    }
  }, [pendingFiles, onError]);

  /**
   * Limpiar archivos pendientes
   */
  const clearPendingFiles = useCallback(() => {
    pendingFiles.forEach(pf => {
      if (pf.preview) {
        URL.revokeObjectURL(pf.preview);
      }
    });
    setPendingFiles([]);
    setError(null);
  }, [pendingFiles]);

  /**
   * Limpiar todo el estado de imágenes (guardadas y pendientes)
   */
  const clearAllImages = useCallback(() => {
    // Limpiar archivos pendientes
    pendingFiles.forEach(pf => {
      if (pf.preview) {
        URL.revokeObjectURL(pf.preview);
      }
    });
    setPendingFiles([]);
    
    // Limpiar imágenes guardadas
    setImages([]);
    
    // Resetear estados
    setUploadState(ImageStates.IDLE);
    setUploadProgress(0);
    setError(null);
    setIsReordering(false);
  }, [pendingFiles]);

  /**
   * Obtener estado del servicio de imágenes
   */
  const checkImageServiceStatus = useCallback(async () => {
    try {
      return await propertyService.getImageServiceStatus();
    } catch (error) {
      console.error('Error checking image service status:', error);
      throw error;
    }
  }, []);

  // Estados derivados
  const totalImages = images.length + pendingFiles.length;
  const canAddMore = totalImages < maxImages;
  const hasChanges = pendingFiles.length > 0;
  const isProcessing = uploadState === ImageStates.UPLOADING || uploadState === ImageStates.PROCESSING || isReordering;

  return {
    // Estados principales
    images,
    pendingFiles,
    uploadState,
    uploadProgress,
    error,
    isReordering,

    // Estados derivados
    totalImages,
    canAddMore,
    hasChanges,
    isProcessing,
    remainingSlots: maxImages - totalImages,

    // Funciones principales
    loadPropertyImages,
    addFiles,
    removePendingFile,
    uploadPendingFiles,
    removeImage,
    reorderImages,
    reorderPendingFiles,
    clearPendingFiles,
    clearAllImages,
    checkImageServiceStatus,

    // Utilidades
    clearError: () => setError(null),
    retryUpload: () => uploadPendingFiles(),
    
    // Validaciones
    validateFiles: ImageUtils.validateImageFiles,
    validateFile: ImageUtils.validateImageFile
  };
};

export default useImageManager;