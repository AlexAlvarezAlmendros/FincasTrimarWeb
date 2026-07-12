import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCreateViviendaSimple } from '../../../hooks/useCreateViviendaSimple.js';
import { useImageManager } from '../../../hooks/useImageManager.js';
import { ValidationRules, FormValidator } from '../../../types/viviendaForm.types.js';
import CharacteristicsSelector from '../../CharacteristicsSelector/index.js';
import SuccessPopup from '../../SuccessPopup/index.js';
import LoadingPopup from '../../LoadingPopup/index.js';
import ImageUploadManager from './ImageUploadManager/ImageUploadManager.jsx';
import Button from '../../common/Button';
import BasicInfoSection from './sections/BasicInfoSection.jsx';
import FeaturesSection from './sections/FeaturesSection.jsx';
import LocationSection from './sections/LocationSection.jsx';
import ClassificationSection from './sections/ClassificationSection.jsx';
import './PropertyCreatePage.css';

// Clave de autoguardado, namespaced por id de vivienda (o 'nuevo')
const draftKey = (id) => `vivienda-autosave-${id || 'nuevo'}`;

// Campos que NO se autoguardan/recuperan (los ficheros de imagen no son serializables)
const NON_PERSISTED_FIELDS = new Set(['images', 'imagesToDelete']);

const PropertyCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Estado para el popup de éxito
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [wasSavedAsDraft, setWasSavedAsDraft] = useState(false);

  // Éxito parcial: la vivienda se guardó pero fallaron las imágenes.
  // Guardamos el id para poder reintentar la subida sin recrear la vivienda.
  const [imageUploadFailed, setImageUploadFailed] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState(null);

  // Validación inline por campo (errores + campos tocados)
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Autoguardado en localStorage (recuperación de trabajo sin guardar)
  const [recoverableDraft, setRecoverableDraft] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Estado para el popup de carga
  const [loadingMessage, setLoadingMessage] = useState('Subiendo vivienda...');
  
  // Estado para evitar múltiples cargas
  const [hasLoadedData, setHasLoadedData] = useState(false);
  
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
      // Si hay imágenes pendientes, subirlas tras crear/actualizar la vivienda.
      const propertyId = data?.id || id;
      setSavedPropertyId(propertyId);

      let imgFailed = false;
      if (propertyId && pendingFiles.length > 0) {
        try {
          setLoadingMessage('Subiendo imágenes...');
          await uploadPendingFiles(propertyId);
        } catch (imgError) {
          console.error('Error subiendo imágenes:', imgError);
          imgFailed = true;
        }
      }

      // Feedback honesto: si fallaron las imágenes, el popup lo refleja (no éxito pleno).
      setImageUploadFailed(imgFailed);
      setSuccessData(data);
      setShowSuccessPopup(true);

      // El trabajo ya está guardado en servidor: descartar el autoguardado local.
      try { localStorage.removeItem(draftKey(data?.id || id)); } catch { /* noop */ }
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
      setHasLoadedData(true);
      
      const loadData = async () => {
        try {
          // Cargar datos de la propiedad
          await loadProperty(id);
          
          // Cargar imágenes de la propiedad
          await loadPropertyImages(id);
          
        } catch (err) {
          console.error('Error cargando datos para edición:', err);
          setHasLoadedData(false); // Resetear en caso de error para permitir reintento
        }
      };
      
      loadData();
    }
  }, [isEditing, id, hasLoadedData, loadProperty, loadPropertyImages]);

  // Detectar un borrador local previo (al montar / cambiar de id)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(id));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.data) setRecoverableDraft(parsed);
      }
    } catch { /* localStorage no disponible */ }
  }, [id]);

  // Autoguardar formData (con debounce) mientras el formulario tenga contenido
  useEffect(() => {
    if (!formData?.name) return undefined;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          draftKey(id),
          JSON.stringify({ savedAt: Date.now(), data: formData })
        );
        setLastSavedAt(Date.now());
      } catch { /* cuota/privado: ignorar */ }
    }, 800);
    return () => clearTimeout(t);
  }, [formData, id]);

  const clearDraft = () => {
    try { localStorage.removeItem(draftKey(id)); } catch { /* noop */ }
    setLastSavedAt(null);
  };

  const recoverDraft = () => {
    if (recoverableDraft?.data) {
      Object.entries(recoverableDraft.data).forEach(([k, v]) => {
        if (!NON_PERSISTED_FIELDS.has(k)) updateField(k, v);
      });
    }
    setRecoverableDraft(null);
  };

  const discardDraft = () => {
    clearDraft();
    setRecoverableDraft(null);
  };

  // Valida un campo con las ValidationRules compartidas; devuelve el mensaje o null
  const runFieldValidation = (field, value) =>
    ValidationRules[field] ? ValidationRules[field].validate(value) : null;

  // Actualiza un campo y, si ya fue tocado, revalida en vivo
  const handleFieldChange = (field, value) => {
    updateField(field, value);
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: runFieldValidation(field, value) }));
    }
  };

  // Marca el campo como tocado y lo valida al perder el foco
  const handleFieldBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: runFieldValidation(field, formData[field]) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación completa antes de enviar (un único camino, reglas compartidas)
    const { isValid, errors: allErrors } = await FormValidator.validateViviendaForm(formData);
    if (!isValid) {
      setErrors(allErrors);
      setTouched(Object.keys(allErrors).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
      const firstError = Object.keys(allErrors)[0];
      const el = firstError && document.getElementById(firstError);
      if (el) el.focus();
      return;
    }

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
        } catch (error) {
          console.error('Error recargando datos:', error);
        }
      }
    } else {
      // En modo creación, limpiar todo
      if (window.confirm('¿Estás seguro de que quieres resetear el formulario?')) {
        resetForm();
        clearAllImages();
        clearDraft();
      }
    }
  };

  // Reintentar la subida de imágenes usando el id ya creado (sin recrear la vivienda)
  const handleRetryImages = async () => {
    if (!savedPropertyId) return;
    try {
      setLoadingMessage('Reintentando subida de imágenes...');
      await uploadPendingFiles(savedPropertyId);
      setImageUploadFailed(false);
    } catch (imgError) {
      console.error('Reintento de subida de imágenes fallido:', imgError);
      // Permanece en estado de éxito parcial para poder reintentar de nuevo.
    }
  };

  // Función para manejar el cierre del popup de éxito
  const handleSuccessPopupClose = () => {
    setShowSuccessPopup(false);
    setSuccessData(null);
    setWasSavedAsDraft(false);
    setImageUploadFailed(false);

    if (isEditing) {
      // En modo edición, volver al listado
      navigate('/admin/viviendas');
    } else {
      // En modo creación, resetear para crear otra vivienda
      resetForm();
      
      // Limpiar todas las imágenes (pendientes y guardadas)
      clearAllImages();

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
                <FontAwesomeIcon icon="edit" />
                Editar Vivienda
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="circle-plus" />
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
          <Button
            variant="secondary"
            icon="arrow-left"
            onClick={() => navigate('/admin/viviendas')}
          >
            Volver al listado
          </Button>
        </div>
      </div>

      {recoverableDraft && (
        <div className="draft-recovery-banner">
          <span className="draft-recovery-banner__text">
            Tienes cambios sin guardar de una sesión anterior.
          </span>
          <span className="draft-recovery-banner__actions">
            <Button variant="primary" size="sm" onClick={recoverDraft}>
              Recuperar
            </Button>
            <Button variant="outline" size="sm" onClick={discardDraft}>
              Descartar
            </Button>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="property-form">
        <BasicInfoSection
          formData={formData}
          updateField={updateField}
          handleFieldChange={handleFieldChange}
          handleFieldBlur={handleFieldBlur}
          errors={errors}
          touched={touched}
          isCreating={isCreating}
        />

        <FeaturesSection formData={formData} updateField={updateField} />

        <LocationSection formData={formData} updateField={updateField} />

        <ClassificationSection formData={formData} updateField={updateField} />

        <div className="form-section">
          <details className="form-accordion">
            <summary className="form-accordion__summary">
              ✨ Características adicionales
              <span className="form-accordion__count">
                {formData.caracteristicas?.length || 0} seleccionadas
              </span>
            </summary>
            <div className="form-accordion__body">
              <CharacteristicsSelector
                selectedCharacteristics={formData.caracteristicas || []}
                onChange={(characteristics) => updateField('caracteristicas', characteristics)}
                disabled={isCreating}
                title=""
                subtitle="Selecciona todas las características que apliquen a esta vivienda."
              />
            </div>
          </details>
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

        {lastSavedAt && (
          <p className="autosave-indicator">Autoguardado localmente ✓</p>
        )}

        <div className="form-actions">
          <Button
            variant="secondary"
            icon="xmark"
            onClick={() => navigate('/admin/viviendas')}
            disabled={isCreating}
          >
            Cancelar
          </Button>

          <Button variant="outline" icon="rotate-right" onClick={handleReset} disabled={isCreating}>
            Resetear
          </Button>

          {!id && (
            <Button
              variant="draft"
              icon="floppy-disk"
              onClick={handleSaveDraft}
              disabled={isCreating || !formData.name}
            >
              Guardar Borrador
            </Button>
          )}

          <Button type="submit" variant="primary" icon="floppy-disk" loading={isCreating}>
            {isCreating ? 'Creando…' : id ? 'Actualizar Vivienda' : 'Crear Vivienda'}
          </Button>
        </div>
      </form>

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

      {/* Popup de resultado */}
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        variant={imageUploadFailed ? 'warning' : 'success'}
        title={
          imageUploadFailed
            ? 'Vivienda guardada, pero faltan imágenes'
            : wasSavedAsDraft
              ? '¡Borrador guardado exitosamente!'
              : `¡Vivienda ${isEditing ? 'actualizada' : 'creada'} exitosamente!`
        }
        message={
          imageUploadFailed
            ? `La vivienda "${successData?.name || 'Nueva vivienda'}" se guardó correctamente, pero algunas imágenes no se subieron. Puedes reintentar la subida sin recrear la vivienda.`
            : wasSavedAsDraft
              ? `El borrador "${successData?.name || 'Nueva vivienda'}" ha sido guardado correctamente. Puedes encontrarlo filtrando por "Borradores" en el listado de viviendas.`
              : `La vivienda "${successData?.name || (isEditing ? 'existente' : 'Nueva vivienda')}" ha sido ${isEditing ? 'actualizada' : 'publicada'} correctamente${pendingFiles?.length > 0 ? ' y las imágenes se han subido' : ''}.`
        }
        actionLabel={imageUploadFailed ? 'Reintentar subida' : undefined}
        onAction={imageUploadFailed ? handleRetryImages : undefined}
        autoClose={!imageUploadFailed}
        autoCloseDelay={4000}
      />
    </div>
  );
};

export default PropertyCreatePage;