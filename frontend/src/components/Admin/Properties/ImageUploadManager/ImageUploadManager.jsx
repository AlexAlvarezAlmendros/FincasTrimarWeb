import React, { useRef, useState } from 'react';
import DraggableImageGrid from '../../../DraggableImageGrid/DraggableImageGrid';
import DraggablePendingGrid from '../../../DraggablePendingGrid/DraggablePendingGrid';
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
  reorderImages,
  reorderPendingFiles,
  isReadOnly = false 
}) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

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

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
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
    <div className="image-upload-manager">
      <div className="section-header">
        <h3>Imágenes de la vivienda</h3>
        <div className="image-counter">
          {totalImages} {totalImages === 1 ? 'imagen' : 'imágenes'}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="alert-close">×</button>
        </div>
      )}

      {/* Zona de subida */}
      {!isReadOnly && (
        <div 
          className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
        >
          <div className="upload-icon">
            <i className="fas fa-cloud-upload-alt"></i>
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
          title="Imágenes guardadas"
        />
      )}

      {/* Mensaje cuando no hay imágenes */}
      {images.length === 0 && pendingFiles.length === 0 && !isReadOnly && (
        <div className="no-images-message">
          <i className="fas fa-images"></i>
          <p>Aún no has añadido ninguna imagen</p>
          <p className="help-text">Las imágenes ayudan a que tu vivienda destaque</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadManager;
