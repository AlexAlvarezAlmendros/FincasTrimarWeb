import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateViviendaSimple } from '../../../hooks/useCreateViviendaSimple.js';
import { useImageManager } from '../../../hooks/useImageManager.js';
import { 
  TipoInmueble, 
  TipoVivienda, 
  Estado, 
  Planta, 
  TipoAnuncio, 
  EstadoVenta
} from '../../../types/vivienda.types.js';
import JsonBulkImport from './JsonBulkImport/JsonBulkImport.jsx';
import CharacteristicsSelector from '../../CharacteristicsSelector/index.js';
import DraggableImageGrid from '../../DraggableImageGrid/index.js';
import DraggablePendingGrid from '../../DraggablePendingGrid/index.js';
import SuccessPopup from '../../SuccessPopup/index.js';
import LoadingPopup from '../../LoadingPopup/index.js';
import RichTextEditor from '../../RichTextEditor/index.js';
import ImageUploadManager from './ImageUploadManager/ImageUploadManager.jsx';
import './PropertyCreatePage.css';

const PropertyCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Estado para el popup de éxito
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [wasSavedAsDraft, setWasSavedAsDraft] = useState(false);
  
  // Estado para resetear el JsonBulkImport
  const [jsonImportReset, setJsonImportReset] = useState(0);
  
  // Estado para el popup de carga
  const [loadingMessage, setLoadingMessage] = useState('Subiendo vivienda...');
  
  // Estado para evitar múltiples cargas
  const [hasLoadedData, setHasLoadedData] = useState(false);
  
  // Función helper para obtener texto plano del HTML
  const getPlainTextFromHtml = (html) => {
    if (!html) return '';
    // Crear un elemento temporal para extraer solo el texto
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };
  
  // Determinar si estamos en modo edición
  const isEditing = Boolean(id);
  
  // Hook para crear/editar vivienda
  const {
    formData,
    updateField,
    createVivienda,
    createDraft,
    isCreating,
    error,
    success,
    resetForm,
    loadProperty
  } = useCreateViviendaSimple({
    onSuccess: async (data) => {
      console.log(`Vivienda ${isEditing ? 'actualizada' : 'creada'} exitosamente:`, data);
      
      // Si hay imágenes pendientes, subirlas después de crear/actualizar la vivienda
      const propertyId = data?.id || id;
      if (propertyId && pendingFiles.length > 0) {
        try {
          setLoadingMessage('Subiendo imágenes...');
          await uploadPendingFiles(propertyId);
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

  // Hook para manejo de imágenes - SIN límite de imágenes
  const imageManager = useImageManager(id, {
    autoUpload: false, // Subir manualmente después de crear la vivienda
    onError: (err) => {
      console.error('Error con imágenes:', err);
    }
  });

  // Resetear estado cuando cambie el ID
  useEffect(() => {
    setHasLoadedData(false);
  }, [id]);

  // Extraer funciones necesarias del imageManager
  const {
    images,
    pendingFiles,
    uploadProgress,
    error: imageError,
    totalImages,
    addFiles,
    removePendingFile,
    removeImage,
    uploadPendingFiles,
    clearError,
    isProcessing,
    reorderImages,
    reorderPendingFiles,
    clearPendingFiles,
    clearAllImages,
    loadPropertyImages
  } = imageManager;

  // Cargar datos si estamos en modo edición
  useEffect(() => {
    if (isEditing && id && !hasLoadedData) {
      console.log('Cargando datos para edición, ID:', id);
      setHasLoadedData(true);
      
      const loadData = async () => {
        try {
          // Cargar datos de la propiedad
          await loadProperty(id);
          
          // Cargar imágenes de la propiedad
          await loadPropertyImages(id);
          
          console.log('✅ Datos y imágenes cargados correctamente');
        } catch (err) {
          console.error('Error cargando datos para edición:', err);
          setHasLoadedData(false); // Resetear en caso de error para permitir reintento
        }
      };
      
      loadData();
    }
  }, [isEditing, id, hasLoadedData, loadProperty, loadPropertyImages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoadingMessage(isEditing ? 'Actualizando vivienda...' : 'Creando vivienda...');
      await createVivienda(formData, isEditing ? id : null);
    } catch (error) {
      // Error ya manejado por el hook
    }
  };

  const handleReset = async () => {
    if (isEditing) {
      // En modo edición, recargar los datos originales
      if (window.confirm('¿Estás seguro de que quieres descartar los cambios y recargar los datos originales?')) {
        try {
          await loadProperty(id);
          // También recargar imágenes
          await loadPropertyImages(id);
          // Limpiar archivos pendientes
          clearPendingFiles();
          console.log('✅ Datos e imágenes recargados correctamente');
        } catch (error) {
          console.error('Error recargando datos:', error);
        }
      }
    } else {
      // En modo creación, limpiar todo
      if (window.confirm('¿Estás seguro de que quieres resetear el formulario?')) {
        resetForm();
        clearAllImages();
        setJsonImportReset(prev => prev + 1);
      }
    }
  };

  // Función para manejar el cierre del popup de éxito
  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    setSuccessData(null);
    setWasSavedAsDraft(false);
    
    if (isEditing) {
      // En modo edición, volver al listado
      navigate('/admin/viviendas');
    } else {
      // En modo creación, resetear para crear otra vivienda
      resetForm();
      
      // Limpiar todas las imágenes (pendientes y guardadas)
      clearAllImages();
      
      // Resetear el componente JsonBulkImport
      setJsonImportReset(prev => prev + 1);
      
      // Scroll hacia arriba para mejor UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Función para guardar como borrador
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    
    try {
      setWasSavedAsDraft(true);
      await createDraft(formData, id);
    } catch (error) {
      console.error('Error guardando borrador:', error);
      setWasSavedAsDraft(false);
      // El error ya se maneja en el hook
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
      {/* <Auth0Debug /> */}

      {/* Importación masiva de inmuebles desde JSON */}
      {!id && (
        <JsonBulkImport 
          onImportComplete={(results) => {
            console.log('Importación JSON completada:', results);
          }}
          resetTrigger={jsonImportReset}
        />
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
              <RichTextEditor
                value={formData.description}
                onChange={(content) => {
                  const plainText = getPlainTextFromHtml(content);
                  if (plainText.length <= 2000) {
                    updateField('description', content);
                  }
                }}
                placeholder="Describe en detalle las características de la vivienda, su estado, orientación, servicios cercanos..."
                disabled={isCreating}
                height="250px"
                error={getPlainTextFromHtml(formData.description).length > 2000 ? 
                  'La descripción no puede exceder 2000 caracteres' : null
                }
              />
              <small className="form-help">
                Editor de texto enriquecido - Máximo 2000 caracteres ({getPlainTextFromHtml(formData.description).length}/2000)
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

            {/* Solo mostrar selector de Planta para Piso, Ático o Dúplex */}
            {(formData.tipoVivienda === 'Piso' || 
              formData.tipoVivienda === 'Ático' || 
              formData.tipoVivienda === 'Dúplex') && (
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
            )}
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
          <ImageUploadManager 
            images={images}
            pendingFiles={pendingFiles}
            uploadProgress={uploadProgress}
            error={imageError}
            totalImages={totalImages}
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

        {/* Sección de publicación eliminada - ahora se auto-publica según estado */}

        {/* Mensajes de error y éxito */}
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

          {!id && (
            <button 
              type="button"
              onClick={handleSaveDraft}
              className="btn btn-secondary"
              disabled={isCreating || !formData.name}
            >
              <i className="fas fa-save"></i>
              Guardar Borrador
            </button>
          )}
          
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
      {/* <details className="debug-info">
        <summary>Información de Debug</summary>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </details> */}

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
        title={
          wasSavedAsDraft 
            ? '¡Borrador guardado exitosamente!'
            : `¡Vivienda ${isEditing ? 'actualizada' : 'creada'} exitosamente!`
        }
        message={
          wasSavedAsDraft
            ? `El borrador "${successData?.name || 'Nueva vivienda'}" ha sido guardado correctamente. Puedes encontrarlo en la sección de borradores para continuar editándolo más tarde.`
            : `La vivienda "${successData?.name || (isEditing ? 'existente' : 'Nueva vivienda')}" ha sido ${isEditing ? 'actualizada' : 'publicada'} correctamente${pendingFiles?.length > 0 ? ' y las imágenes se han subido' : ''}.`
        }
        autoClose={true}
        autoCloseDelay={4000}
      />
    </div>
  );
};

export default PropertyCreatePage;