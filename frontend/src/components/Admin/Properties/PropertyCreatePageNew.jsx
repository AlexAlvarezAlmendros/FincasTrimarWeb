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
import HtmlExtractor from '../../HtmlExtractor/HtmlExtractor.jsx';
import CharacteristicsSelector from '../../CharacteristicsSelector';
import DraggableImageGrid from '../../DraggableImageGrid';
import DraggablePendingGrid from '../../DraggablePendingGrid';
import SuccessPopup from '../../SuccessPopup';
import LoadingPopup from '../../LoadingPopup';
import './PropertyCreatePage.css';

// Componente de gestión de imágenes mejorado
const ImageUploadSection = ({ 
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
  isProcessing,
  reorderImages,
  reorderPendingFiles,
  isReadOnly = false 
}) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

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

      {/* Imágenes pendientes con drag & drop */}
      <DraggablePendingGrid
        pendingFiles={pendingFiles}
        onRemove={removePendingFile}
        onReorder={reorderPendingFiles}
        title="Archivos pendientes de subir"
      />

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
    </div>
  );
};

const PropertyCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Estado para el popup de éxito
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  // Estado para resetear el HtmlExtractor
  const [htmlExtractorReset, setHtmlExtractorReset] = useState(0);
  
  // Estado para el popup de carga
  const [loadingMessage, setLoadingMessage] = useState('Subiendo vivienda...');
  
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
      if (data?.id && pendingFiles.length > 0) {
        try {
          setLoadingMessage('Subiendo imágenes...');
          await uploadPendingFiles(data.id);
          console.log('Imágenes subidas exitosamente');
        } catch (imgError) {
          console.error('Error subiendo imágenes:', imgError);
        }
      }
      
      // Guardar datos de éxito y mostrar popup
      setSuccessData(data);
      setShowSuccessPopup(true);
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

  // Extraer funciones necesarias del imageManager
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
    isProcessing,
    reorderImages,
    reorderPendingFiles,
    clearPendingFiles,
    clearAllImages
  } = imageManager;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoadingMessage('Subiendo vivienda...');
      await createVivienda();
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres resetear el formulario?')) {
      resetForm();
      clearAllImages();
      setHtmlExtractorReset(prev => prev + 1);
    }
  };

  // Función para manejar el cierre del popup de éxito y resetear para crear otra vivienda
  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    setSuccessData(null);
    
    // Resetear el formulario para crear otra vivienda
    resetForm();
    
    // Limpiar todas las imágenes (pendientes y guardadas)
    clearAllImages();
    
    // Resetear el componente HtmlExtractor
    setHtmlExtractorReset(prev => prev + 1);
    
    // Scroll hacia arriba para mejor UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función para manejar los datos extraídos del HTML de Idealista
  const handleDataExtracted = (extractedData) => {
    console.log('Datos extraídos de Idealista:', extractedData);
    
    // Mapear los datos extraídos a los campos del formulario
    if (extractedData.name) {
      updateField('name', extractedData.name);
    }
    
    if (extractedData.shortDescription) {
      updateField('shortDescription', extractedData.shortDescription);
    }
    
    if (extractedData.description) {
      updateField('description', extractedData.description);
    }
    
    if (extractedData.price && extractedData.price > 0) {
      updateField('price', extractedData.price.toString());
    }
    
    if (extractedData.rooms && extractedData.rooms > 0) {
      updateField('rooms', extractedData.rooms.toString());
    }
    
    if (extractedData.bathRooms && extractedData.bathRooms > 0) {
      updateField('bathRooms', extractedData.bathRooms.toString());
    }
    
    if (extractedData.squaredMeters && extractedData.squaredMeters > 0) {
      updateField('squaredMeters', extractedData.squaredMeters.toString());
    }
    
    // Mapear ubicación si está disponible
    if (extractedData.location && extractedData.location.poblacion) {
      updateField('poblacion', extractedData.location.poblacion);
    }
    
    if (extractedData.location && extractedData.location.provincia) {
      updateField('provincia', extractedData.location.provincia);
    }
    
    // Mapear tipos de inmueble y vivienda
    if (extractedData.tipoInmueble && TipoInmueble[extractedData.tipoInmueble]) {
      updateField('tipoInmueble', extractedData.tipoInmueble);
    }
    
    if (extractedData.tipoVivienda && TipoVivienda[extractedData.tipoVivienda]) {
      updateField('tipoVivienda', extractedData.tipoVivienda);
    }
    
    // Mapear estado y tipo de anuncio
    if (extractedData.estado && Estado[extractedData.estado]) {
      updateField('estado', extractedData.estado);
    }
    
    if (extractedData.tipoAnuncio && TipoAnuncio[extractedData.tipoAnuncio]) {
      updateField('tipoAnuncio', extractedData.tipoAnuncio);
    }
    
    // Mapear características
    if (extractedData.caracteristicas && typeof extractedData.caracteristicas === 'object') {
      const currentCaracteristicas = formData.caracteristicas || [];
      const newCaracteristicas = [];
      
      Object.keys(extractedData.caracteristicas).forEach(key => {
        if (extractedData.caracteristicas[key] === true && Caracteristica[key]) {
          newCaracteristicas.push(key);
        }
      });
      
      if (newCaracteristicas.length > 0) {
        updateField('caracteristicas', newCaracteristicas);
      }
    }
    
    // Mostrar mensaje de éxito
    console.log('Formulario auto-rellenado con datos de Idealista');
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

      {/* Extractor de HTML de Idealista */}
      {!id && (
        <HtmlExtractor 
          onDataExtracted={handleDataExtracted} 
          resetTrigger={htmlExtractorReset}
        />
      )}

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
          <CharacteristicsSelector
            selectedCharacteristics={formData.caracteristicas || []}
            onChange={(characteristics) => updateField('caracteristicas', characteristics)}
            disabled={isCreating}
            title="✨ Características Adicionales"
            subtitle="Selecciona todas las características que apliquen a esta vivienda. Estas aparecerán destacadas en el anuncio para ayudar a los usuarios a encontrar la propiedad perfecta."
          />
        </div>

        <div className="form-section">
          <ImageUploadSection 
            images={images}
            pendingFiles={pendingFiles}
            uploadProgress={uploadProgress}
            error={imageError}
            canAddMore={canAddMore}
            totalImages={totalImages}
            remainingSlots={remainingSlots}
            addFiles={addFiles}
            removePendingFile={removePendingFile}
            removeImage={removeImage}
            uploadPendingFiles={uploadPendingFiles}
            clearError={clearError}
            isProcessing={isProcessing}
            reorderImages={reorderImages}
            reorderPendingFiles={reorderPendingFiles}
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

      {/* Popup de carga */}
      <LoadingPopup
        isVisible={isCreating || isProcessing}
        title={loadingMessage}
        message={
          isCreating ? 
            "Guardando los datos de la vivienda en la base de datos..." : 
            isProcessing ? 
              "Procesando y subiendo las imágenes seleccionadas..." : 
              "Finalizando el proceso..."
        }
        progress={isProcessing && uploadProgress > 0 ? uploadProgress : null}
      />

      {/* Popup de éxito */}
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        title="¡Vivienda creada exitosamente!"
        message={`La vivienda "${successData?.name || 'Nueva vivienda'}" ha sido guardada correctamente${pendingFiles?.length > 0 ? ' y las imágenes se han subido' : ''}.`}
        autoClose={true}
        autoCloseDelay={4000}
      />
    </div>
  );
};

export default PropertyCreatePage;