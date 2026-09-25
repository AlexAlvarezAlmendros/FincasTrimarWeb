import { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
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

// Mensaje legible de un error (Error, envelope { error: { message } } o texto)
const describeError = (err, fallback) =>
  err?.message || err?.error?.message || (typeof err === 'string' ? err : '') || fallback;

export const useImageManager = (propertyId = null, options = {}) => {
  const { getAccessTokenSilently } = useAuth0();
  const {
    maxImages = Infinity, // Sin límite de imágenes
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
  // Última lista de pendientes: la subida no depende de un closure desfasado
  const pendingFilesRef = useRef(pendingFiles);
  // Subida en curso: una segunda llamada recibe la misma promesa (sin duplicar imágenes)
  const uploadPromiseRef = useRef(null);
  // Orden (ids) que el servidor tiene confirmado: destino del rollback si falla un reorder
  const confirmedOrderRef = useRef([]);
  // Cola de reordenaciones: una petición en vuelo y, como mucho, la última pendiente
  const reorderQueueRef = useRef({ inFlight: false, next: null, promise: null });
  // Último error de reordenación mostrado (se limpia si la siguiente sale bien)
  const reorderErrorRef = useRef(null);

  useLayoutEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadPropertyImages = useCallback(async (propId = propertyId) => {
    if (!propId) return;

    try {
      setUploadState(ImageStates.PROCESSING);
      // Con token: la carga usa el cupo del rate limit del usuario, no el de la IP
      const response = await propertyService.getPropertyImages(propId, getAccessTokenSilently);
      if (!isMountedRef.current) return;

      if (!response?.success) {
        throw new Error(response?.error?.message || 'Error al cargar las imágenes');
      }
      const loaded = response.data?.images || [];
      confirmedOrderRef.current = loaded.map((img) => img.id);
      // Una reordenación aún no enviada ya no aplica sobre los datos recargados
      reorderQueueRef.current.next = null;
      setImages(loaded);
      setUploadState(ImageStates.SUCCESS);
    } catch (error) {
      console.error('Error loading property images:', error);
      if (isMountedRef.current) {
        setError(describeError(error, 'Error al cargar las imágenes'));
        setUploadState(ImageStates.ERROR);
        if (onError) onError(error);
      }
    }
  }, [propertyId, getAccessTokenSilently, onError]);

  // Reordena según los ids confirmados; los desconocidos (p.ej. recién subidas) van al final
  const rollbackToConfirmedOrder = useCallback(() => {
    const position = new Map(confirmedOrderRef.current.map((id, i) => [String(id), i]));
    const rank = (img) => position.get(String(img.id)) ?? Number.MAX_SAFE_INTEGER;
    setImages((prev) => [...prev]
      .sort((a, b) => rank(a) - rank(b))
      .map((img, i) => ({ ...img, orden: i + 1 })));
  }, []);

  /**
   * Reordenación optimista y NO bloqueante. Las peticiones se serializan y se
   * agrupan (gana la última): con drops rápidos nunca hay dos PUT concurrentes.
   * Nunca rechaza: si falla, vuelve al último orden confirmado y lo muestra en `error`.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const reorderImages = useCallback((reorderedImages, propId = propertyId) => {
    if (!propId) {
      const message = 'ID de propiedad requerido para reordenar';
      setError(message);
      return Promise.resolve({ success: false, error: message });
    }

    const normalized = reorderedImages.map((img, index) => ({ ...img, orden: index + 1 }));
    setImages(normalized);

    const queue = reorderQueueRef.current;
    queue.next = { propId, ids: normalized.map((img) => img.id) };
    if (queue.inFlight) return queue.promise;

    queue.inFlight = true;
    setIsReordering(true);
    queue.promise = (async () => {
      let result = { success: true };
      try {
        while (queue.next) {
          const { propId: pid, ids } = queue.next;
          queue.next = null;
          const imageOrders = ids.map((id, index) => ({ id, orden: index + 1 }));
          const response = await propertyService.reorderPropertyImages(pid, imageOrders, getAccessTokenSilently);
          if (!response?.success) {
            throw new Error(response?.error?.message || 'Error al reordenar imágenes');
          }
          confirmedOrderRef.current = ids;
        }
        // Si el aviso visible era de una reordenación anterior, ya no aplica
        if (isMountedRef.current && reorderErrorRef.current) {
          const stale = reorderErrorRef.current;
          reorderErrorRef.current = null;
          setError((prev) => (prev === stale ? null : prev));
        }
      } catch (err) {
        queue.next = null;
        console.error('Error reordering images:', err);
        const message = `No se pudo guardar el nuevo orden: ${describeError(err, 'error de red')}`;
        result = { success: false, error: message };
        if (isMountedRef.current) {
          rollbackToConfirmedOrder();
          reorderErrorRef.current = message;
          setError(message);
        }
        onError?.(err);
      } finally {
        queue.inFlight = false;
        if (isMountedRef.current) setIsReordering(false);
      }
      return result;
    })();
    return queue.promise;
  }, [propertyId, getAccessTokenSilently, onError, rollbackToConfirmedOrder]);

  /**
   * Sube `entries` (en ese orden) y las asocia a la vivienda. Nunca lanza.
   * Si falla, las pendientes se conservan para poder reintentar.
   */
  const uploadEntries = useCallback((entries, propId) => {
    if (!entries || entries.length === 0) {
      return Promise.resolve({ success: true, data: [] });
    }

    if (!propId) {
      const message = 'ID de propiedad requerido para subir imágenes';
      console.error(message);
      setError(message);
      return Promise.resolve({ success: false, error: message });
    }

    // Una subida cada vez: esta espera a que termine la que está en curso
    if (uploadPromiseRef.current) {
      return uploadPromiseRef.current.then(() => uploadEntries(entries, propId));
    }

    const run = async () => {
      try {
        setUploadState(ImageStates.UPLOADING);
        setUploadProgress(0);
        onUploadStart?.();

        // El orden de subida/asociación es el del grid de pendientes
        const response = await propertyService.uploadPropertyImages(
          propId,
          entries.map((pf) => pf.file),
          getAccessTokenSilently,
          (progress) => {
            if (isMountedRef.current) {
              setUploadProgress(progress);
              onUploadProgress?.(progress);
            }
          }
        );

        if (!response?.success || !Array.isArray(response.data)) {
          throw new Error(response?.error?.message || 'Respuesta inesperada al subir las imágenes');
        }

        // El backend las añade siempre al final (Orden = MAX + i + 1): se anexan en su orden real
        const newImages = response.data
          .map((img) => ({ id: img.id, url: img.url, orden: img.orden ?? 0 }))
          .sort((a, b) => a.orden - b.orden);
        const uploadedIds = new Set(entries.map((pf) => pf.id));
        confirmedOrderRef.current = [...confirmedOrderRef.current, ...newImages.map((img) => img.id)];
        entries.forEach((pf) => {
          if (pf.preview) URL.revokeObjectURL(pf.preview);
        });

        if (isMountedRef.current) {
          setImages((prev) => [...prev, ...newImages]);
          // Solo se quitan las subidas (si se añadió otra mientras tanto, sigue pendiente)
          setPendingFiles((prev) => prev.filter((pf) => !uploadedIds.has(pf.id)));
          setUploadState(ImageStates.SUCCESS);
          clearError();
          onUploadComplete?.(newImages);
        }
        return { success: true, data: response.data };
      } catch (err) {
        console.error('Error uploading files:', err);
        const message = `Error subiendo imágenes: ${describeError(err, 'error desconocido')}`;
        if (isMountedRef.current) {
          setError(message);
          setUploadState(ImageStates.ERROR);
        }
        onError?.(err);
        return { success: false, error: message };
      } finally {
        if (isMountedRef.current) setUploadProgress(0);
      }
    };

    const promise = run(); // nunca rechaza
    uploadPromiseRef.current = promise;
    promise.then(() => {
      if (uploadPromiseRef.current === promise) uploadPromiseRef.current = null;
    });
    return promise;
  }, [getAccessTokenSilently, onUploadStart, onUploadProgress, onUploadComplete, onError, clearError]);

  /**
   * Sube las pendientes actuales en el orden del grid.
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>} nunca rechaza;
   *   success:false si falla la subida/asociación o la respuesta no es success
   */
  const uploadPendingFiles = useCallback((propId = propertyId) => {
    // Si ya se están subiendo (doble clic en reintentar), mismo resultado: sin duplicados
    if (uploadPromiseRef.current) return uploadPromiseRef.current;
    return uploadEntries(pendingFilesRef.current, propId);
  }, [propertyId, uploadEntries]);

  // Funciones auxiliares
  const addFiles = useCallback((files) => {
    const list = Array.from(files || []);
    const validFiles = list.filter((file) => !ImageUtils.validateImageFile(file));

    if (validFiles.length === 0) {
      // Identificar el primer error específico
      const firstError = list.length > 0 ? ImageUtils.validateImageFile(list[0]) : 'No hay archivos';
      setError(`No se pudieron añadir archivos: ${firstError || 'formato no válido'}`);
      return;
    }

    // Sin límite de imágenes - ordenar alfabética y numéricamente por nombre
    const filesToAdd = ImageUtils.sortFilesByName(validFiles);

    const newPendingFiles = filesToAdd.map(file => ({
      id: Math.random().toString(36).slice(2, 11),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));

    setPendingFiles(prev => [...prev, ...newPendingFiles]);
    clearError();

    if (autoUpload) {
      uploadEntries(newPendingFiles, propertyId);
    }
  }, [autoUpload, propertyId, uploadEntries, clearError]);

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

  /**
   * Borra una imagen guardada (sin confirmación: la pide el formulario) y sin
   * tocar uploadState, para no abrir el popup de carga.
   * @returns {Promise<boolean>} true si se borró
   */
  const removeImage = useCallback(async (imageId) => {
    if (!propertyId) {
      setError('No se puede eliminar la imagen: la vivienda aún no está guardada');
      return false;
    }

    try {
      await propertyService.deletePropertyImage(propertyId, imageId, getAccessTokenSilently);
      confirmedOrderRef.current = confirmedOrderRef.current.filter((id) => id !== imageId);
      if (isMountedRef.current) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        clearError();
      }
      return true;
    } catch (err) {
      console.error('Error removing image:', err);
      if (isMountedRef.current) {
        setError(`Error eliminando imagen: ${describeError(err, 'error desconocido')}`);
      }
      onError?.(err);
      return false;
    }
  }, [propertyId, getAccessTokenSilently, onError, clearError]);

  const clearPendingFiles = useCallback(() => {
    // Limpiar URLs de preview
    pendingFilesRef.current.forEach(pf => {
      if (pf.preview) {
        URL.revokeObjectURL(pf.preview);
      }
    });
    setPendingFiles([]);
  }, []);

  const clearAllImages = useCallback(() => {
    setImages([]);
    confirmedOrderRef.current = [];
    reorderQueueRef.current.next = null;
    clearPendingFiles();
    setUploadProgress(0);
    setUploadState(ImageStates.IDLE);
    clearError();
  }, [clearPendingFiles, clearError]);

  // El grid de pendientes entrega siempre el array completo ya reordenado
  const reorderPendingFiles = useCallback((reorderedFiles) => {
    if (Array.isArray(reorderedFiles)) {
      setPendingFiles(reorderedFiles);
    }
  }, []);

  // Valores calculados
  const totalImages = images.length + pendingFiles.length;
  const canAddMore = true; // Siempre se pueden añadir más imágenes
  const remainingSlots = Infinity; // Sin límite
  const isUploading = uploadState === ImageStates.UPLOADING;
  // Carga o subida. La reordenación y el borrado no bloquean: tienen su propio indicador.
  const isProcessing = isUploading || uploadState === ImageStates.PROCESSING;

  return {
    images,
    pendingFiles,
    uploadState,
    uploadProgress,
    error,
    isReordering,
    isUploading,
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
