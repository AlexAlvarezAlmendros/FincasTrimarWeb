import React, { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateViviendaSimple } from '../../../hooks/useCreateViviendaSimple.js';
import { useImageManager } from '../../../hooks/useImageManager.js';
import { 
  TipoInmueble, 
  TipoVivienda, 
  Estado, 
  Planta, 
  TipoAnuncio, 
  EstadoVenta, 
  Caracteristica 
} from '../../../types/vivienda.types.js';
import Auth0Debug from '../../Auth0Debug.jsx';
import './PropertyCreatePage.css';

// Componente de gestión de imágenes mejorado
const ImageUploadSection = ({ imageManager, isReadOnly = false }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    images,
    pendingFiles,
    uploadProgress,
    error: imageError,
    canAddMore,
    totalImages,
    remainingSlots,
    addFiles,
    removePendingFile,
    removeImage,
    uploadPendingFiles,
    clearError,
    isProcessing
  } = imageManager;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
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
    <div className="image-upload-section">
      <div className="section-header">
        <h3>Imágenes de la vivienda</h3>
        <div className="image-counter">
          {totalImages} / 20 imágenes
        </div>
      </div>

      {imageError && (
        <div className="alert alert-error">
          <span>{imageError}</span>
          <button type="button" onClick={clearError} className="alert-close">×</button>
        </div>
      )}

      {/* Zona de subida */}
      {canAddMore && !isReadOnly && (
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
            Formatos: JPG, PNG, WebP • Máximo 10MB por imagen • Quedan {remainingSlots} slots
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Barra de progreso */}
      {isProcessing && (
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

      {/* Imágenes pendientes */}
      {pendingFiles.length > 0 && (
        <div className="pending-images">
          <h4>Imágenes pendientes de subir</h4>
          <div className="image-grid">
            {pendingFiles.map((file) => (
              <div key={file.id} className="image-item pending">
                <div className="image-preview">
                  <img src={file.preview} alt={file.name} />
                  <div className="image-overlay">
                    <button
                      type="button"
                      onClick={() => removePendingFile(file.id)}
                      className="btn-remove"
                      title="Eliminar"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="image-info">
                  <span className="image-name">{file.name}</span>
                  <span className="image-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imágenes guardadas */}
      {images.length > 0 && (
        <div className="saved-images">
          <h4>Imágenes guardadas</h4>
          <div className="image-grid">
            {images.map((image, index) => (
              <div key={image.id} className="image-item saved">
                <div className="image-preview">
                  <img src={image.url} alt={`Imagen ${index + 1}`} />
                  <div className="image-overlay">
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="btn-remove"
                      title="Eliminar"
                      disabled={isReadOnly}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="image-info">
                  <span className="image-order">Imagen {image.orden || index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PropertyCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Hook para crear vivienda
  const {
    formData,
    updateField,
    createVivienda,
    isCreating,
    error,
    success,
    resetForm
  } = useCreateViviendaSimple({
    onSuccess: async (data) => {
      console.log('Vivienda creada exitosamente:', data);
      
      // Si hay imágenes pendientes, subirlas después de crear la vivienda
      if (data?.id && imageManager.pendingFiles.length > 0) {
        try {
          await imageManager.uploadPendingFiles(data.id);
          console.log('Imágenes subidas exitosamente');
        } catch (imgError) {
          console.error('Error subiendo imágenes:', imgError);
        }
      }
      
      // Opcional: redirigir después de crear
      // navigate('/admin/viviendas');
    },
    onError: (err) => {
      console.error('Error creando vivienda:', err);
    }
  });

  // Hook para manejo de imágenes
  const imageManager = useImageManager(id, {
    maxImages: 20,
    autoUpload: false, // Subir manualmente después de crear la vivienda
    onError: (err) => {
      console.error('Error con imágenes:', err);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVivienda();
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear el formulario?')) {
      resetForm();
    }
  };

  return (
    <div className="property-create-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            {id ? (
              <>
                <i className="fas fa-edit"></i>
                Editar Vivienda
              </>
            ) : (
              <>
                <i className="fas fa-plus-circle"></i>
                Crear Nueva Vivienda
              </>
            )}
          </h1>
          <p className="page-subtitle">
            {id 
              ? 'Modifica los datos de la vivienda existente' 
              : 'Completa la información para añadir una nueva propiedad'
            }
          </p>
        </div>
        <div className="header-actions">
          <button 
            type="button" 
            onClick={() => navigate('/admin/viviendas')}
            className="btn--secondary"
          >
            <i className="fas fa-arrow-left"></i>
            Volver al listado
          </button>
        </div>
      </div>

      {/* Componente temporal de debug para Auth0 */}
      <Auth0Debug />

      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <strong>¡Éxito!</strong> La vivienda ha sido creada correctamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-section">
          <h2 className="section-title">📋 Información Básica</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre de la vivienda *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Ej: Piso céntrico con terraza en el centro"
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="price">Precio *</label>
              <input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="250000"
                required
                min="0"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="shortDescription">Descripción breve</label>
              <textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => updateField('shortDescription', e.target.value)}
                placeholder="Amplio y luminoso piso en zona céntrica"
                maxLength="300"
                rows="2"
                className="form-textarea"
              />
              <small className="form-help">
                Máximo 300 caracteres ({formData.shortDescription.length}/300)
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="description">Descripción completa</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe en detalle las características de la vivienda, su estado, orientación, servicios cercanos..."
                rows="4"
                maxLength="2000"
                className="form-textarea"
              />
              <small className="form-help">
                Máximo 2000 caracteres ({formData.description.length}/2000)
              </small>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">🏠 Características</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rooms">Habitaciones</label>
              <input
                id="rooms"
                type="number"
                value={formData.rooms}
                onChange={(e) => updateField('rooms', e.target.value)}
                min="0"
                max="50"
                placeholder="3"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bathRooms">Baños</label>
              <input
                id="bathRooms"
                type="number"
                value={formData.bathRooms}
                onChange={(e) => updateField('bathRooms', e.target.value)}
                min="0"
                max="20"
                placeholder="2"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="garage">Garajes</label>
              <input
                id="garage"
                type="number"
                value={formData.garage}
                onChange={(e) => updateField('garage', e.target.value)}
                min="0"
                max="10"
                placeholder="1"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="squaredMeters">Metros cuadrados</label>
              <input
                id="squaredMeters"
                type="number"
                value={formData.squaredMeters}
                onChange={(e) => updateField('squaredMeters', e.target.value)}
                min="0"
                max="10000"
                placeholder="120"
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">📍 Ubicación</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="provincia">Provincia</label>
              <input
                id="provincia"
                type="text"
                value={formData.provincia}
                onChange={(e) => updateField('provincia', e.target.value)}
                placeholder="Ej: Barcelona"
                maxLength="100"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="poblacion">Población</label>
              <input
                id="poblacion"
                type="text"
                value={formData.poblacion}
                onChange={(e) => updateField('poblacion', e.target.value)}
                placeholder="Ej: Sitges"
                maxLength="100"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="calle">Calle</label>
              <input
                id="calle"
                type="text"
                value={formData.calle}
                onChange={(e) => updateField('calle', e.target.value)}
                placeholder="Ej: Carrer del Mar"
                maxLength="100"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numero">Número</label>
              <input
                id="numero"
                type="text"
                value={formData.numero}
                onChange={(e) => updateField('numero', e.target.value)}
                placeholder="Ej: 123 A"
                maxLength="20"
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-title">🏷️ Clasificación</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipoInmueble">Tipo de Inmueble</label>
              <select
                id="tipoInmueble"
                value={formData.tipoInmueble}
                onChange={(e) => updateField('tipoInmueble', e.target.value)}
                className="form-select"
              >
                <option value="">🏢 Seleccionar tipo de inmueble...</option>
                {Object.entries(TipoInmueble).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tipoVivienda">Tipo de Vivienda</label>
              <select
                id="tipoVivienda"
                value={formData.tipoVivienda}
                onChange={(e) => updateField('tipoVivienda', e.target.value)}
                className="form-select"
              >
                <option value="">🏠 Seleccionar tipo de vivienda...</option>
                {Object.entries(TipoVivienda).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => updateField('estado', e.target.value)}
                className="form-select"
              >
                <option value="">🔧 Seleccionar estado...</option>
                {Object.entries(Estado).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="planta">Planta</label>
              <select
                id="planta"
                value={formData.planta}
                onChange={(e) => updateField('planta', e.target.value)}
                className="form-select"
              >
                <option value="">🏢 Seleccionar planta...</option>
                {Object.entries(Planta).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipoAnuncio">Tipo de Anuncio</label>
              <select
                id="tipoAnuncio"
                value={formData.tipoAnuncio}
                onChange={(e) => updateField('tipoAnuncio', e.target.value)}
                className="form-select"
              >
                <option value="">💰 Seleccionar tipo de anuncio...</option>
                {Object.entries(TipoAnuncio).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estadoVenta">Estado de Venta</label>
              <select
                id="estadoVenta"
                value={formData.estadoVenta}
                onChange={(e) => updateField('estadoVenta', e.target.value)}
                className="form-select"
              >
                <option value="">📊 Seleccionar estado de venta...</option>
                {Object.entries(EstadoVenta).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <ImageUploadSection 
            imageManager={imageManager}
            isReadOnly={false}
          />
        </div>

        <div className="form-section">
          <h2 className="section-title">📢 Estado de Publicación</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => updateField('published', e.target.checked)}
                />
                <span>Publicar inmediatamente</span>
              </label>
              <small className="form-help">
                Si está marcado, la vivienda será visible públicamente
              </small>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button"
            onClick={() => navigate('/admin/viviendas')}
            className="btn btn-secondary"
            disabled={isCreating}
          >
            <i className="fas fa-times"></i>
            Cancelar
          </button>
          
          <button 
            type="button"
            onClick={handleReset}
            className="btn btn-outline"
            disabled={isCreating}
          >
            <i className="fas fa-redo"></i>
            Resetear
          </button>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isCreating || !formData.name || !formData.price}
          >
            {isCreating ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Creando...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {id ? 'Actualizar Vivienda' : 'Crear Vivienda'}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Debug Info */}
      <details className="debug-info">
        <summary>Información de Debug</summary>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </details>
    </div>
  );
};

export default PropertyCreatePage;