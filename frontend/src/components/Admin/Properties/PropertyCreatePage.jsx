import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateViviendaSimple } from '../../../hooks/useCreateViviendaSimple.js';
import { 
  TipoInmueble, 
  TipoVivienda, 
  Estado, 
  Planta, 
  TipoAnuncio, 
  EstadoVenta, 
  Caracteristica 
} from '../../../types/vivienda.types.js';
import './PropertyCreatePage.css';

// Componente de subida de imágenes mejorado
const ImageUpload = ({ imageManager, isReadOnly = false }) => {
  const {
    images,
    pendingFiles,
    uploadState,
    uploadProgress,
    error,
    addFiles,
    removePendingFile,
    removeImage,
    uploadPendingFiles,
    clearError,
    canAddMore,
    remainingSlots,
    isProcessing
  } = imageManager;

  const handleFileSelect = (files) => {
    if (isReadOnly) return;
    
    clearError();
    const fileArray = Array.from(files);
    addFiles(fileArray);
  };

  const handleUploadPending = async () => {
    if (pendingFiles.length === 0) return;
    
    try {
      await uploadPendingFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const allImages = [...images, ...pendingFiles];
  const showUploadArea = canAddMore && !isReadOnly;

  return (
    <div className="image-upload-section">
      <div className="upload-header">
        <h3>Imágenes de la propiedad</h3>
        {remainingSlots > 0 && (
          <span className="remaining-slots">
            {remainingSlots} espacios disponibles
          </span>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <span>❌ {error}</span>
          <button onClick={clearError} className="error-close">✕</button>
        </div>
      )}

      {showUploadArea && (
        <div className="image-upload-area">
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={isProcessing}
            className="file-input"
            id="property-images"
          />
          <label htmlFor="property-images" className="upload-label">
            {isProcessing ? (
              <>
                <div className="upload-spinner">⏳</div>
                <span>Procesando imágenes...</span>
                {uploadProgress > 0 && (
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="upload-icon">📸</span>
                <span>Hacer clic para seleccionar imágenes</span>
                <small>JPG, PNG, WEBP (máx. 5MB cada una)</small>
              </>
            )}
          </label>
        </div>
      )}

      {pendingFiles.length > 0 && (
        <div className="pending-files-section">
          <div className="pending-header">
            <h4>Archivos pendientes de subir ({pendingFiles.length})</h4>
            <button
              onClick={handleUploadPending}
              disabled={isProcessing}
              className="btn btn--primary btn--small"
            >
              Subir archivos
            </button>
          </div>
          <div className="images-grid">
            {pendingFiles.map((file) => (
              <div key={file.id} className="image-preview-item pending">
                <img src={file.preview} alt={`Vista previa pendiente`} />
                <div className="image-overlay">
                  <span className="image-status">Pendiente</span>
                  <button
                    onClick={() => removePendingFile(file.id)}
                    className="remove-image-btn"
                    type="button"
                    disabled={isProcessing}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className="images-preview">
          <h4>Imágenes guardadas ({images.length})</h4>
          <div className="images-grid">
            {images.map((image, index) => (
              <div key={image.id} className="image-preview-item uploaded">
                <img src={image.url} alt={`Imagen ${index + 1}`} />
                <div className="image-overlay">
                  <span className="image-order">#{index + 1}</span>
                  {!isReadOnly && (
                    <button
                      onClick={() => removeImage(image.id)}
                      className="remove-image-btn"
                      type="button"
                      disabled={isProcessing}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {allImages.length === 0 && (
        <div className="no-images">
          <span className="no-images-icon">🖼️</span>
          <span>No hay imágenes seleccionadas</span>
        </div>
      )}
    </div>
  );
};

// Componente principal simplificado
const PropertyCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Hook simplificado para crear vivienda
  const {
    formData,
    updateField,
    createVivienda,
    isCreating,
    error,
    success,
    resetForm
  } = useCreateViviendaSimple({
    onSuccess: (data) => {
      const message = mode === OperationModes.CREATE 
        ? 'Vivienda creada correctamente' 
        : 'Vivienda actualizada correctamente';
      
      // En producción, usar un sistema de notificaciones
      alert(message);
      
      // Navegar según el resultado
      if (data?.published) {
        navigate('/admin/viviendas');
      } else {
        navigate('/admin/viviendas/borradores');
      }
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    }
  });

  const {
    formData,
    errors,
    validation,
    imageManager,
    formState,
    isProcessing,
    canSave,
    isReadOnly
  } = manager;

  // Funciones auxiliares
  const updateField = (field, value) => {
    validation.updateField(field, value);
  };

  const toggleCaracteristica = (caracteristica) => {
    const currentCaracteristicas = formData.caracteristicas || [];
    const newCaracteristicas = currentCaracteristicas.includes(caracteristica)
      ? currentCaracteristicas.filter(c => c !== caracteristica)
      : [...currentCaracteristicas, caracteristica];
    
    updateField('caracteristicas', newCaracteristicas);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await manager.saveVivienda({
        published: true
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      await manager.saveVivienda({
        published: false
      });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // Obtener características disponibles del enum
  const caracteristicasDisponibles = useMemo(() => {
    return Object.values(Caracteristica);
  }, []);

  // Título dinámico según el modo
  const pageTitle = mode === OperationModes.CREATE ? 'Crear Nueva Vivienda' : 'Editar Vivienda';
  const pageSubtitle = mode === OperationModes.CREATE 
    ? 'Añade una nueva propiedad al catálogo'
    : 'Modifica los datos de la propiedad';

  // Estado del formulario para mostrar mensajes
  const showProgress = formState.isProcessing;
  const progressMessage = formState.message;
  const progressValue = formState.progress;

  return (
    <div className="property-create-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">{pageTitle}</h1>
          <p className="page-subtitle">{pageSubtitle}</p>
          
          {showProgress && (
            <div className="progress-indicator">
              <div className="progress-message">{progressMessage}</div>
              {progressValue > 0 && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="header-actions">
          <button
            onClick={() => navigate('/admin/viviendas')}
            className="btn btn--secondary"
            type="button"
          >
            ← Volver al listado
          </button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="property-form">
        {/* Información Básica */}
        <section className="form-section">
          <h2 className="section-title">Información Básica</h2>
          <div className="form-grid">
            <div className="form-group form-group--full">
              <label htmlFor="name" className="form-label">
                Nombre de la propiedad *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={`form-input ${validation.hasFieldError('name') ? 'error' : ''}`}
                disabled={isReadOnly}
                placeholder="Ej: Piso reformado en centro de Igualada 102 m²"
                maxLength={200}
              />
              {validation.getFieldError('name') && (
                <span className="error-message">{validation.getFieldError('name')}</span>
              )}
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="shortDescription" className="form-label">
                Descripción breve
              </label>
              <input
                type="text"
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => updateField('shortDescription', e.target.value)}
                onBlur={() => validation.handleFieldBlur('shortDescription')}
                className="form-input"
                disabled={isReadOnly}
                placeholder="Descripción que aparecerá en las tarjetas de listado"
                maxLength={300}
              />
            </div>

            <div className="form-group form-group--full">
              <label htmlFor="description" className="form-label">
                Descripción completa
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                onBlur={() => validation.handleFieldBlur('description')}
                className="form-textarea"
                placeholder="Descripción detallada de la propiedad..."
                rows={6}
                disabled={isReadOnly}
              />
            </div>

            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Precio (€) *
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) => updateField('price', parseInt(e.target.value) || '')}
                onBlur={() => validation.handleFieldBlur('price')}
                className={`form-input ${validation.hasFieldError('price') ? 'error' : ''}`}
                disabled={isReadOnly}
                placeholder="240000"
                min="0"
              />
              {validation.getFieldError('price') && (
                <span className="error-message">{validation.getFieldError('price')}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="tipoAnuncio" className="form-label">
                Tipo de operación
              </label>
              <select
                id="tipoAnuncio"
                value={formData.tipoAnuncio || 'Venta'}
                onChange={(e) => updateField('tipoAnuncio', e.target.value)}
                onBlur={() => validation.handleFieldBlur('tipoAnuncio')}
                className="form-select"
                disabled={isReadOnly}
              >
                <option value="Venta">Venta</option>
                <option value="Alquiler">Alquiler</option>
              </select>
            </div>
          </div>
        </section>

        {/* Características Físicas */}
        <section className="form-section">
          <h2 className="section-title">Características Físicas</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="rooms" className="form-label">
                Habitaciones
              </label>
              <input
                type="number"
                id="rooms"
                value={formData.rooms}
                onChange={(e) => updateField('rooms', parseInt(e.target.value) || '')}
                onBlur={() => validation.handleFieldBlur('rooms')}
                className={`form-input ${validation.hasFieldError('rooms') ? 'error' : ''}`}
                placeholder="3"
                min="0"
                disabled={isReadOnly}
              />
              {validation.getFieldError('rooms') && (
                <span className="error-message">{validation.getFieldError('rooms')}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="bathrooms" className="form-label">
                Baños
              </label>
              <input
                type="number"
                id="bathrooms"
                value={formData.bathrooms}
                onChange={(e) => updateField('bathRooms', parseInt(e.target.value) || '')}
                onBlur={() => validation.handleFieldBlur('bathRooms')}
                className={`form-input ${validation.hasFieldError('bathRooms') ? 'error' : ''}`}
                placeholder="2"
                min="0"
                disabled={isReadOnly}
              />
              {validation.getFieldError('bathRooms') && (
                <span className="error-message">{validation.getFieldError('bathRooms')}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="garage" className="form-label">
                Plazas de garaje
              </label>
              <input
                type="number"
                id="garage"
                value={formData.garage}
                onChange={(e) => updateField('garage', parseInt(e.target.value) || '')}
                className={`form-input ${errors.garage ? 'error' : ''}`}
                placeholder="1"
                min="0"
              />
              {errors.garage && <span className="error-message">{errors.garage}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="squaredMeters" className="form-label">
                Metros cuadrados
              </label>
              <input
                type="number"
                id="squaredMeters"
                value={formData.squaredMeters}
                onChange={(e) => updateField('squaredMeters', parseInt(e.target.value) || '')}
                className={`form-input ${errors.squaredMeters ? 'error' : ''}`}
                placeholder="102"
                min="1"
              />
              {errors.squaredMeters && <span className="error-message">{errors.squaredMeters}</span>}
            </div>
          </div>
        </section>

        {/* Ubicación */}
        <section className="form-section">
          <h2 className="section-title">Ubicación</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="provincia" className="form-label">
                Provincia *
              </label>
              <input
                type="text"
                id="provincia"
                value={formData.provincia}
                onChange={(e) => updateField('provincia', e.target.value)}
                onBlur={() => validation.handleFieldBlur('provincia')}
                className={`form-input ${validation.hasFieldError('provincia') ? 'error' : ''}`}
                placeholder="Barcelona"
                disabled={isReadOnly}
              />
              {validation.getFieldError('provincia') && (
                <span className="error-message">{validation.getFieldError('provincia')}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="poblacion" className="form-label">
                Población *
              </label>
              <input
                type="text"
                id="poblacion"
                value={formData.poblacion}
                onChange={(e) => updateField('poblacion', e.target.value)}
                onBlur={() => validation.handleFieldBlur('poblacion')}
                className={`form-input ${validation.hasFieldError('poblacion') ? 'error' : ''}`}
                placeholder="Igualada"
                disabled={isReadOnly}
              />
              {validation.getFieldError('poblacion') && (
                <span className="error-message">{validation.getFieldError('poblacion')}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="calle" className="form-label">
                Calle
              </label>
              <input
                type="text"
                id="calle"
                value={formData.calle}
                onChange={(e) => updateField('calle', e.target.value)}
                className="form-input"
                placeholder="Carrer Major"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numero" className="form-label">
                Número
              </label>
              <input
                type="text"
                id="numero"
                value={formData.numero}
                onChange={(e) => updateField('numero', e.target.value)}
                className="form-input"
                placeholder="15"
              />
            </div>
          </div>
        </section>

        {/* Clasificación */}
        <section className="form-section">
          <h2 className="section-title">Clasificación</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="tipoInmueble" className="form-label">
                Tipo de inmueble
              </label>
              <select
                id="tipoInmueble"
                value={formData.tipoInmueble}
                onChange={(e) => updateField('tipoInmueble', e.target.value)}
                className="form-select"
              >
                <option value="Vivienda">Vivienda</option>
                <option value="Oficina">Oficina</option>
                <option value="Local">Local</option>
                <option value="Nave">Nave</option>
                <option value="Garaje">Garaje</option>
                <option value="Terreno">Terreno</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tipoVivienda" className="form-label">
                Tipo de vivienda
              </label>
              <select
                id="tipoVivienda"
                value={formData.tipoVivienda}
                onChange={(e) => updateField('tipoVivienda', e.target.value)}
                className="form-select"
              >
                <option value="Piso">Piso</option>
                <option value="Ático">Ático</option>
                <option value="Dúplex">Dúplex</option>
                <option value="Casa">Casa</option>
                <option value="Chalet">Chalet</option>
                <option value="Villa">Villa</option>
                <option value="Masía">Masía</option>
                <option value="Finca">Finca</option>
                <option value="Loft">Loft</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estado" className="form-label">
                Estado de conservación
              </label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => updateField('estado', e.target.value)}
                className="form-select"
              >
                <option value="ObraNueva">Obra nueva</option>
                <option value="BuenEstado">Buen estado</option>
                <option value="AReformar">A reformar</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="planta" className="form-label">
                Planta
              </label>
              <select
                id="planta"
                value={formData.planta}
                onChange={(e) => updateField('planta', e.target.value)}
                className="form-select"
              >
                <option value="Bajo">Bajo</option>
                <option value="PlantaIntermedia">Planta intermedia</option>
                <option value="UltimaPlanta">Última planta</option>
              </select>
            </div>
          </div>
        </section>

        {/* Características adicionales */}
        <section className="form-section">
          <h2 className="section-title">Características Adicionales</h2>
          <div className="characteristics-grid">
            {caracteristicasDisponibles.map(caracteristica => (
              <label key={caracteristica} className="characteristic-item">
                <input
                  type="checkbox"
                  checked={(formData.caracteristicas || []).includes(caracteristica)}
                  onChange={() => toggleCaracteristica(caracteristica)}
                  disabled={isReadOnly}
                />
                <span className="characteristic-label">{caracteristica}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Subida de imágenes */}
        <section className="form-section">
          <ImageUpload imageManager={imageManager} isReadOnly={isReadOnly} />
        </section>

        {/* Botones de acción */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/viviendas')}
            className="btn btn--secondary"
            disabled={isProcessing}
          >
            Cancelar
          </button>
          
          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={handleSaveAsDraft}
                className="btn btn--draft"
                disabled={isProcessing || !canSave}
              >
                {isProcessing ? 'Guardando...' : '📝 Guardar como borrador'}
              </button>
              
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isProcessing || !validation.isFormValid}
              >
                {isProcessing ? 'Procesando...' : '🚀 Publicar vivienda'}
              </button>
            </>
          )}
          
          {mode === OperationModes.EDIT && (
            <button
              type="button"
              onClick={() => manager.duplicateVivienda()}
              className="btn btn--secondary"
              disabled={isProcessing}
            >
              📋 Duplicar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PropertyCreatePage;