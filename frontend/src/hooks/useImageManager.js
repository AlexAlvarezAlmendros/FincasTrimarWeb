import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import propertyService from '../services/propertyService.js';
import { ImageUtils } from '../types/viviendaForm.types.js';

export const ImageStates = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error'
};

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

  const [images, setImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadState, setUploadState] = useState(ImageStates.IDLE);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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

  const reorderImages = useCallback(async (reorderedImages, propId = propertyId) => {
    if (!propId) {
      throw new Error('ID de propiedad requerido para reordenar');
    }

    const originalImages = [...images];

    try {
      setIsReordering(true);
      console.log('Iniciando reordenamiento de imagenes:', reorderedImages);

      setImages(reorderedImages);

      const imageOrders = reorderedImages.map((img, index) => ({
        id: img.id,
        orden: index + 1
      }));

      console.log('Enviando orden al backend:', imageOrders);

      const response = await propertyService.reorderPropertyImages(propId, imageOrders, getAccessTokenSilently);
      
      console.log('Respuesta del backend:', response);

      if (!response.success) {
        setImages(originalImages);
        throw new Error(response.error?.message || 'Error al reordenar imagenes');
      }

      console.log('Imagenes reordenadas correctamente');
      return response;
    } catch (error) {
      console.error('Error reordering images:', error);
      if (onError) onError(error);
      
      setImages(originalImages);
      throw error;
    } finally {
      setIsReordering(false);
    }
  }, [images, propertyId, onError, getAccessTokenSilently]);

  // Funciones auxiliares
  const addFiles = useCallback((files) => {
    const validFiles = files.filter(file => {
      const validationError = ImageUtils.validateImageFile(file);
      if (validationError) {
        console.log('Archivo rechazado:', file.name, 'Error:', validationError);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      // Identificar el primer error específico
      const firstError = files.length > 0 ? ImageUtils.validateImageFile(files[0]) : 'No hay archivos';
      setError(`No se pudieron añadir archivos: ${firstError || 'formato no válido'}`);
      return;
    }

    const remainingSlots = maxImages - (images.length + pendingFiles.length);
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length < validFiles.length) {
      setError(`Solo se pudieron añadir ${filesToAdd.length} de ${validFiles.length} archivos (límite de ${maxImages} imágenes)`);
    }

    const newPendingFiles = filesToAdd.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));

    setPendingFiles(prev => [...prev, ...newPendingFiles]);
    clearError();

    if (autoUpload) {
      uploadPendingFiles();
    }
  }, [images.length, pendingFiles.length, maxImages, autoUpload]);

  const removePendingFile = useCallback((fileId) => {
    setPendingFiles(prev => {
      const updated = prev.filter(pf => pf.id !== fileId);
      // Limpiar URL del preview
      const fileToRemove = prev.find(pf => pf.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  }, []);

  const removeImage = useCallback(async (imageId) => {
    if (!propertyId) return;
    
    try {
      setUploadState(ImageStates.PROCESSING);
      await propertyService.deletePropertyImage(propertyId, imageId, getAccessTokenSilently);
      
      if (isMountedRef.current) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        setUploadState(ImageStates.SUCCESS);
        clearError();
      }
    } catch (err) {
      console.error('Error removing image:', err);
      if (isMountedRef.current) {
        setError(`Error eliminando imagen: ${err.message}`);
        setUploadState(ImageStates.ERROR);
        onError?.(err);
      }
    }
  }, [propertyId, getAccessTokenSilently, onError]);

  const uploadPendingFiles = useCallback(async () => {
    if (pendingFiles.length === 0 || !propertyId) return { success: true };

    try {
      setUploadState(ImageStates.UPLOADING);
      setUploadProgress(0);
      onUploadStart?.();

      const files = pendingFiles.map(pf => pf.file);
      const response = await propertyService.uploadPropertyImages(
        propertyId, 
        files, 
        getAccessTokenSilently,
        (progress) => {
          if (isMountedRef.current) {
            setUploadProgress(progress);
            onUploadProgress?.(progress);
          }
        }
      );

      if (isMountedRef.current) {
        if (response.success && response.data) {
          const newImages = response.data.map(img => ({
            id: img.id,
            url: img.url,
            orden: img.orden || 0
          }));

          setImages(prev => [...prev, ...newImages].sort((a, b) => a.orden - b.orden));
          clearPendingFiles();
          setUploadState(ImageStates.SUCCESS);
          onUploadComplete?.(newImages);
        }
        
        clearError();
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      if (isMountedRef.current) {
        setError(`Error subiendo imágenes: ${err.message}`);
        setUploadState(ImageStates.ERROR);
        onError?.(err);
      }
      return { success: false, error: err.message };
    }
  }, [pendingFiles, propertyId, getAccessTokenSilently, onUploadStart, onUploadProgress, onUploadComplete, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearPendingFiles = useCallback(() => {
    // Limpiar URLs de preview
    pendingFiles.forEach(pf => {
      if (pf.preview) {
        URL.revokeObjectURL(pf.preview);
      }
    });
    setPendingFiles([]);
  }, [pendingFiles]);

  const clearAllImages = useCallback(() => {
    setImages([]);
    clearPendingFiles();
    setUploadProgress(0);
    setUploadState(ImageStates.IDLE);
    clearError();
  }, [clearPendingFiles]);

  const reorderPendingFiles = useCallback((startIndex, endIndex) => {
    setPendingFiles(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  // Valores calculados
  const totalImages = images.length + pendingFiles.length;
  const canAddMore = totalImages < maxImages;
  const remainingSlots = maxImages - totalImages;
  const isProcessing = uploadState === ImageStates.UPLOADING || uploadState === ImageStates.PROCESSING || isReordering;

  return {
    images,
    pendingFiles,
    uploadState,
    uploadProgress,
    error,
    isReordering,
    totalImages,
    canAddMore,
    remainingSlots,
    isProcessing,
    addFiles,
    removePendingFile,
    removeImage,
    uploadPendingFiles,
    clearError,
    clearPendingFiles,
    clearAllImages,
    loadPropertyImages,
    reorderImages,
    reorderPendingFiles
  };
};

export default useImageManager;