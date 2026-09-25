import React, { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DraggableImageGrid from '../../../DraggableImageGrid/DraggableImageGrid';
import DraggablePendingGrid from '../../../DraggablePendingGrid/DraggablePendingGrid';
import { isFileDrag } from '../../../../utils/reorder.js';
import './ImageUploadManager.css';

/**
 * Componente de gestión de imágenes para viviendas
 * Sin límite de imágenes
 */
const ImageUploadManager = ({ 
  images = [],
  pendingFiles = [],
  uploadProgress = 0,
  error = null,
  totalImages = 0,
  addFiles,
  removePendingFile,
  removeImage,
  uploadPendingFiles,
  clearError,
  isProcessing = false,
  isReordering = false,
  reorderImages,
  reorderPendingFiles,
  isReadOnly = false 
}) => {
  const fileInputRef = useRef(null);
  const rootRef = useRef(null);
  const alertRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [alertInView, setAlertInView] = useState(true);

  // Con muchas imágenes el aviso de arriba puede quedar fuera de pantalla (p.ej.
  // al fallar una reordenación cerca del final): entonces se muestra una copia flotante.
  useEffect(() => {
    const el = alertRef.current;
    if (!error || !el || typeof IntersectionObserver === 'undefined') {
      setAlertInView(true);
      return undefined;
    }
    const headerHeight = getComputedStyle(document.documentElement)
      .getPropertyValue('--header-height').trim() || '0px';
    const observer = new IntersectionObserver(
      ([entry]) => setAlertInView(entry.isIntersecting),
      { rootMargin: `-${headerHeight} 0px 0px 0px` }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [error]);

  // Mientras la sección está montada, un fichero soltado fuera de ella no debe
  // abrirse en el navegador (se abandonaría el formulario y las imágenes
  // pendientes). Solo se neutraliza: la sección es la única que acepta ficheros.
  useEffect(() => {
    if (isReadOnly) return undefined;
    const neutralize = (e) => {
      if (e.defaultPrevented || !isFileDrag(e)) return;
      if (rootRef.current?.contains(e.target)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
    };
    window.addEventListener('dragover', neutralize);
    window.addEventListener('drop', neutralize);
    return () => {
      window.removeEventListener('dragover', neutralize);
      window.removeEventListener('drop', neutralize);
    };
  }, [isReadOnly]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    console.log('Archivos seleccionados:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
    if (files.length > 0) {
      addFiles(files);
    }
    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toda la sección acepta ficheros del escritorio (no solo la upload-zone), pero
  // solo 'Files': la reordenación interna de imágenes pasa sin tocarse.
  const handleDragOver = (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Ignorar el paso sobre hijos: evita el parpadeo del resaltado
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOver(false);
  };

  const handleDrop = (e) => {
    if (!isFileDrag(e)) return;
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      ref={rootRef}
      className="image-upload-manager"
      onDragEnter={isReadOnly ? undefined : handleDragOver}
      onDragOver={isReadOnly ? undefined : handleDragOver}
      onDragLeave={isReadOnly ? undefined : handleDragLeave}
      onDrop={isReadOnly ? undefined : handleDrop}
    >
      <div className="section-header">
        <h3>Imágenes de la vivienda</h3>
        <div className="image-counter">
          {totalImages} {totalImages === 1 ? 'imagen' : 'imágenes'}
        </div>
      </div>

      {error && (
        <div ref={alertRef} className="alert alert-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="alert-close" aria-label="Cerrar aviso">×</button>
        </div>
      )}
      {error && !alertInView && (
        <div className="alert alert-error alert-floating">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="alert-close" aria-label="Cerrar aviso">×</button>
        </div>
      )}

      {/* Zona de subida */}
      {!isReadOnly && (
        <div 
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onClick={triggerFileSelect}
        >
          <div className="upload-icon">
            <FontAwesomeIcon icon="cloud-arrow-up" />
          </div>
          <p>Arrastra imágenes aquí o <span className="link">haz clic para seleccionar</span></p>
          <p className="upload-help">
            Formatos: JPG, PNG, WebP • Máximo 10MB por imagen • Sin límite de imágenes
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Barra de progreso */}
      {isProcessing && uploadProgress > 0 && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span>{uploadProgress}% completado</span>
        </div>
      )}

      {/* Imágenes pendientes con drag & drop */}
      {pendingFiles.length > 0 && (
        <DraggablePendingGrid
          pendingFiles={pendingFiles}
          onRemove={removePendingFile}
          onReorder={reorderPendingFiles}
          hasSavedImages={images.length > 0}
          title="Archivos pendientes de subir"
        />
      )}

      {/* Imágenes guardadas con drag and drop */}
      {images.length > 0 && (
        <DraggableImageGrid
          images={images}
          onRemove={removeImage}
          onReorder={reorderImages}
          isReadOnly={isReadOnly}
          isSaving={isReordering}
          title="Imágenes guardadas"
        />
      )}

      {/* Mensaje cuando no hay imágenes */}
      {images.length === 0 && pendingFiles.length === 0 && !isReadOnly && (
        <div className="no-images-message">
          <FontAwesomeIcon icon="images" />
          <p>Aún no has añadido ninguna imagen</p>
          <p className="help-text">Las imágenes ayudan a que tu vivienda destaque</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadManager;
