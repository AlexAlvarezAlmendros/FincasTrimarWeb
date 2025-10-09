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

  return {
    images,
    pendingFiles,
    uploadState,
    uploadProgress,
    error,
    isReordering,
    loadPropertyImages,
    reorderImages
  };
};

export default useImageManager;