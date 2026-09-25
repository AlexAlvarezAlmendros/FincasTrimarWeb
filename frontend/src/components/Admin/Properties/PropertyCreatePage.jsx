import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCreateViviendaSimple } from '../../../hooks/useCreateViviendaSimple.js';
import { useImageManager } from '../../../hooks/useImageManager.js';
import { invalidatePropertyCache } from '../../../hooks/useViviendas.js';
import {
  ValidationRules,
  FormValidator,
  ViviendaFormModel,
  ViviendaFieldLabels,
} from '../../../types/viviendaForm.types.js';
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

// Campos que NO se autoguardan (las imágenes las gestiona useImageManager)
const NON_PERSISTED_FIELDS = new Set(['images', 'imagesToDelete', 'newImages']);

// Al recuperar tampoco se tocan los flags de publicación: son estado del servidor
const NON_RECOVERED_FIELDS = new Set([...NON_PERSISTED_FIELDS, 'published', 'isDraft']);

const persistedFields = (data) =>
  Object.fromEntries(Object.entries(data).filter(([key]) => !NON_PERSISTED_FIELDS.has(key)));

// Serialización estable (claves ordenadas) para comparar con la línea base
const snapshotOf = (data) =>
  JSON.stringify(Object.entries(persistedFields(data)).sort(([a], [b]) => a.localeCompare(b)));

// Campos validados, en el orden en que aparecen en el formulario
const VALIDATED_FIELDS = Object.keys(ViviendaFieldLabels);

// Abre los <details> plegados que contienen el campo (su error inline queda a la vista)
const revealField = (field) => {
  const el = document.getElementById(field);
  for (let details = el?.closest('details'); details; details = details.parentElement?.closest('details')) {
    details.open = true;
  }
  return el;
};

// Muestra el campo, hace scroll hasta él y le da el foco
const focusField = (field) => {
  const el = revealField(field);
  if (!el) return;
  el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  // En el editor enriquecido el foco va al área editable
  const target = el.matches('input, textarea, select')
    ? el
    : el.querySelector('[contenteditable="true"]') || el;
  target.focus?.({ preventScroll: true });
};

const PropertyCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // El listado pasa su query (?page=3&q=…) al abrir la edición: se vuelve a la misma página
  const listSearch = location.state?.listSearch;
  const listUrl = `/admin/viviendas${typeof listSearch === 'string' && listSearch.startsWith('?') ? listSearch : ''}`;
  // Si se llegó desde el listado, se vuelve atrás en el historial (a esa misma
  // entrada) para no apilar la edición: el «Atrás» siguiente no reabre el formulario
  const goToList = () => (typeof listSearch === 'string' ? navigate(-1) : navigate(listUrl));
  const { id } = useParams();

  // Determinar si estamos en modo edición
  const isEditing = Boolean(id);

  // Estado para el popup de éxito
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState(null);
  // Acción del último guardado: 'save' (crear/actualizar), 'draft' o 'publish'
  const [savingAction, setSavingAction] = useState(null);

  // Éxito parcial: la vivienda se guardó pero fallaron las imágenes.
  // Guardamos el id para poder reintentar la subida sin recrear la vivienda.
  const [imageUploadFailed, setImageUploadFailed] = useState(false);
  const [imagesUploaded, setImagesUploaded] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState(null);

  // Validación inline por campo (errores + campos tocados) y resumen junto a los botones
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  // Autoguardado en localStorage (recuperación de trabajo sin guardar)
  const [recoverableDraft, setRecoverableDraft] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  // Carga en edición: 'idle' → 'loading' → 'loaded' | 'error' (sin reintentos automáticos)
  const [loadStatus, setLoadStatus] = useState('idle');
  const [serverUpdatedAt, setServerUpdatedAt] = useState(null);

  // Línea base: el formulario tal como está guardado. Solo se autoguarda si difiere.
  // En edición no existe hasta que termina la carga.
  const baselineRef = useRef(isEditing ? null : ViviendaFormModel.create());
  // Cambios programáticos llegados antes de fijar la línea base (ver absorbProgrammaticChange)
  const pendingNormalizationsRef = useRef({});
  const autosavedRef = useRef(false); // esta sesión ha escrito el autoguardado
  const autosaveTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  // Evita un doble envío (doble clic) antes de que isCreating llegue a la UI
  const submittingRef = useRef(false);

  // Hook para crear/editar vivienda
  const {
    formData,
    updateField,
    saveVivienda,
    isCreating,
    isLoading,
    error,
    success,
    resetForm,
    loadProperty
  } = useCreateViviendaSimple({
    onSuccess: async (data) => {
      const propertyId = data?.id || id;
      setSavedPropertyId(propertyId);

      // Lo guardado pasa a ser la línea base y se descarta el autoguardado
      // (con la clave de la ruta: 'nuevo' al crear, no el id recién creado)
      baselineRef.current = formData;
      clearDraft();
      setRecoverableDraft(null);
      setShowErrorSummary(false);

      // Si hay imágenes pendientes, subirlas tras crear/actualizar la vivienda.
      // uploadPendingFiles no lanza: el fallo llega como { success: false }.
      const hadImages = pendingFiles.length > 0;
      let imgFailed = false;
      if (hadImages) {
        try {
          const result = propertyId ? await uploadPendingFiles(propertyId) : { success: false };
          imgFailed = !result?.success;
        } catch (imgError) {
          console.error('Error subiendo imágenes:', imgError);
          imgFailed = true;
        }
      }

      // La web pública cachea fichas y listados: que muestre ya los cambios
      invalidatePropertyCache();

      // Feedback honesto: si fallaron las imágenes, el popup lo refleja (no éxito pleno).
      setImagesUploaded(hadImages && !imgFailed);
      setImageUploadFailed(imgFailed);
      setSuccessData(data);
      setShowSuccessPopup(true);
    },
    onError: (err) => {
      console.error('Error guardando vivienda:', err);
    }
  });

  // Hook para manejo de imágenes - SIN límite de imágenes
  const imageManager = useImageManager(id, {
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
    totalImages,
    isProcessing,
    isReordering,
    isUploading,
    addFiles,
    removePendingFile,
    removeImage,
    uploadPendingFiles,
    clearError,
    reorderImages,
    reorderPendingFiles,
    clearPendingFiles,
    clearAllImages,
    loadPropertyImages
  } = imageManager;

  // Último formData renderizado. Quill avisa de sus normalizaciones mientras se
  // renderiza el editor, con el onChange del render anterior (closure con formData viejo).
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const isLoadingProperty = isLoading || loadStatus === 'loading';
  const isBusy = isLoadingProperty || isCreating || isUploading;
  // En edición no se puede guardar hasta tener los datos del servidor
  const isFormReady = !isEditing || loadStatus === 'loaded';
  // Un borrador se edita como borrador: guardar lo mantiene, publicar es explícito
  const isEditingDraft = isEditing && Boolean(formData.isDraft);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(autosaveTimerRef.current);
    };
  }, []);

  // Fija la línea base aplicando los cambios programáticos que llegaron antes
  const setBaseline = (data) => {
    const pending = pendingNormalizationsRef.current;
    pendingNormalizationsRef.current = {};
    const baseline = { ...data };
    Object.entries(pending).forEach(([field, { from, to }]) => {
      if (baseline[field] === from) baseline[field] = to;
    });
    baselineRef.current = baseline;
    clearTimeout(autosaveTimerRef.current);
  };

  // Cargar datos si estamos en modo edición. Un fallo deja el aviso con
  // «Reintentar» (antes relanzaba la carga en bucle).
  useEffect(() => {
    if (!isEditing || loadStatus !== 'idle') return;
    setLoadStatus('loading');

    const loadData = async () => {
      try {
        const { baseline, property } = await loadProperty(id);
        if (!isMountedRef.current) return;
        setBaseline(baseline);
        setServerUpdatedAt(property?.updatedAt ?? null);

        // Cargar imágenes de la propiedad (gestiona sus propios errores)
        await loadPropertyImages(id);
        if (isMountedRef.current) setLoadStatus('loaded');
      } catch (err) {
        console.error('Error cargando datos para edición:', err);
        if (isMountedRef.current) setLoadStatus('error');
      }
    };

    loadData();
  }, [isEditing, id, loadStatus, loadProperty, loadPropertyImages]);

  // Detectar un borrador local previo (al montar)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(id));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.data) setRecoverableDraft(parsed);
      }
    } catch { /* localStorage no disponible */ }
  }, [id]);

  // Autoguardar formData (con debounce) solo si difiere de lo guardado
  useEffect(() => {
    const baseline = baselineRef.current;
    if (!baseline) return undefined;

    if (snapshotOf(formData) === snapshotOf(baseline)) {
      // Sin cambios: el autoguardado que escribió esta sesión ya no aporta nada
      if (autosavedRef.current) {
        try { localStorage.removeItem(draftKey(id)); } catch { /* noop */ }
        autosavedRef.current = false;
      }
      setLastSavedAt(null);
      return undefined;
    }

    autosaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(
          draftKey(id),
          JSON.stringify({ savedAt: Date.now(), serverUpdatedAt, data: persistedFields(formData) })
        );
        autosavedRef.current = true;
        setLastSavedAt(Date.now());
      } catch { /* cuota/privado: ignorar */ }
    }, 800);
    return () => clearTimeout(autosaveTimerRef.current);
  }, [formData, id, serverUpdatedAt]);

  const clearDraft = () => {
    clearTimeout(autosaveTimerRef.current);
    try { localStorage.removeItem(draftKey(id)); } catch { /* noop */ }
    autosavedRef.current = false;
    setLastSavedAt(null);
  };

  const recoverDraft = () => {
    if (recoverableDraft?.data) {
      Object.entries(recoverableDraft.data).forEach(([k, v]) => {
        if (k in formData && !NON_RECOVERED_FIELDS.has(k)) updateField(k, v);
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

  // Un cambio que no hizo el usuario (Quill normalizando el HTML que se le pasa)
  // no es una edición: se traslada a la línea base si ese campo no tenía cambios.
  // Si aún no hay línea base (edición cargando), se aplica al fijarla.
  const absorbProgrammaticChange = (field, previousValue, nextValue) => {
    const baseline = baselineRef.current;
    if (!baseline) {
      pendingNormalizationsRef.current[field] = { from: previousValue, to: nextValue };
    } else if (baseline[field] === previousValue) {
      baselineRef.current = { ...baseline, [field]: nextValue };
    }
  };

  // Actualiza un campo y, si ya fue tocado, revalida en vivo
  const handleFieldChange = (field, value, { programmatic = false } = {}) => {
    if (programmatic) absorbProgrammaticChange(field, formDataRef.current[field], value);
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

  // Validación completa antes de guardar (un único camino, reglas compartidas).
  // Si falla: errores inline, resumen junto a los botones y foco en el primer campo.
  const validateBeforeSave = async () => {
    const { isValid, errors: allErrors } = await FormValidator.validateViviendaForm(formData);
    setErrors(allErrors);
    if (isValid) {
      setShowErrorSummary(false);
      return true;
    }

    setTouched((prev) => ({
      ...prev,
      ...Object.fromEntries(Object.keys(allErrors).map((field) => [field, true]))
    }));
    setShowErrorSummary(true);
    const invalid = VALIDATED_FIELDS.filter((field) => allErrors[field]);
    invalid.forEach(revealField);
    if (invalid.length > 0) focusField(invalid[0]);
    return false;
  };

  const submitWith = async (action) => {
    if (submittingRef.current || isBusy || !isFormReady) return;
    submittingRef.current = true;
    try {
      if (!(await validateBeforeSave())) return;
      setSavingAction(action);
      await saveVivienda(formData, isEditing ? id : null, action);
    } catch {
      // Error ya manejado por el hook (se muestra junto a los botones)
    } finally {
      submittingRef.current = false;
    }
  };

  // Enter o el botón principal: en un borrador guarda el borrador (no publica)
  const handleSubmit = (e) => {
    e.preventDefault();
    submitWith(isEditingDraft ? 'draft' : 'save');
  };

  const handleReset = () => {
    if (isEditing) {
      // En modo edición, recargar los datos originales. Las imágenes se guardan
      // al momento, así que un borrado o una reordenación no se deshacen.
      if (!window.confirm(
        '¿Descartar los cambios del formulario y recargar los datos guardados?\n\n' +
        'Las imágenes pendientes de subir se descartarán. Las imágenes ya borradas o ' +
        'reordenadas no se restauran: esos cambios se guardan al momento.'
      )) return;
      clearPendingFiles();
      baselineRef.current = null;
      pendingNormalizationsRef.current = {};
      setLoadStatus('idle');
    } else {
      // En modo creación, limpiar todo
      if (!window.confirm('¿Estás seguro de que quieres resetear el formulario?')) return;
      baselineRef.current = ViviendaFormModel.create();
      resetForm();
      clearAllImages();
    }

    clearDraft();
    setRecoverableDraft(null);
    setErrors({});
    setTouched({});
    setShowErrorSummary(false);
  };

  // Reintentar la carga tras un fallo (sin bucle automático)
  const handleRetryLoad = () => {
    setLoadStatus('idle');
  };

  // Reintentar la subida de imágenes usando el id ya creado (sin recrear la vivienda)
  const handleRetryImages = async () => {
    if (!savedPropertyId || isUploading) return;
    try {
      const result = await uploadPendingFiles(savedPropertyId);
      if (result?.success) {
        setImageUploadFailed(false);
        setImagesUploaded(true);
        invalidatePropertyCache();
      }
      // Si falla, permanece en estado de éxito parcial para poder reintentar de nuevo.
    } catch (imgError) {
      console.error('Reintento de subida de imágenes fallido:', imgError);
    }
  };

  // Borrar una imagen guardada es inmediato e irreversible: pedir confirmación
  const handleRemoveImage = async (imageId) => {
    if (!window.confirm('¿Eliminar esta imagen? Se borra al momento y no se puede deshacer.')) {
      return false;
    }
    const removed = await removeImage(imageId);
    if (removed) invalidatePropertyCache();
    return removed;
  };

  // El nuevo orden también cambia la ficha pública (y su portada)
  const handleReorderImages = async (reorderedImages) => {
    const result = await reorderImages(reorderedImages);
    invalidatePropertyCache();
    return result;
  };

  // Función para manejar el cierre del popup de éxito
  const handleSuccessPopupClose = () => {
    // Durante un reintento de subida el popup sigue montado bajo el LoadingPopup:
    // ni Escape, ni el clic fuera, ni su botón (por teclado) deben cerrarlo, porque
    // se resetearía el formulario o se navegaría con la subida aún en marcha.
    if (isUploading) return;

    setShowSuccessPopup(false);
    setSuccessData(null);
    setSavingAction(null);
    setImageUploadFailed(false);
    setImagesUploaded(false);

    if (isEditing) {
      // En modo edición, volver al listado
      goToList();
    } else {
      // En modo creación, resetear para crear otra vivienda
      baselineRef.current = ViviendaFormModel.create();
      resetForm();
      setErrors({});
      setTouched({});

      // Limpiar todas las imágenes (pendientes y guardadas)
      clearAllImages();

      // Scroll hacia arriba para mejor UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Campos con error (en orden del formulario) para el resumen junto a los botones
  const invalidFields = VALIDATED_FIELDS.filter((field) => errors[field]);

  // Solo se ofrece recuperar una vez cargados los datos (si no, la carga lo pisaría)
  const showDraftBanner = Boolean(recoverableDraft) && isFormReady;
  const draftIsStale =
    isEditing &&
    Boolean(recoverableDraft?.serverUpdatedAt && serverUpdatedAt) &&
    recoverableDraft.serverUpdatedAt !== serverUpdatedAt;

  const savingTitle =
    savingAction === 'draft'
      ? 'Guardando borrador...'
      : savingAction === 'publish'
        ? 'Publicando vivienda...'
        : isEditing ? 'Actualizando vivienda...' : 'Creando vivienda...';

  const loadingPopup = isUploading
    ? { title: 'Subiendo imágenes...', message: 'Procesando y subiendo las imágenes seleccionadas...' }
    : isCreating
      ? { title: savingTitle, message: 'Guardando los datos de la vivienda en la base de datos...' }
      : { title: 'Cargando vivienda...', message: 'Obteniendo los datos y las imágenes de la vivienda...' };

  const isSavingWith = (action) => isCreating && savingAction === action;

  const successName = successData?.name || (isEditing ? 'existente' : 'Nueva vivienda');
  const imagesSuffix = imagesUploaded ? ' y las imágenes se han subido' : '';
  const successVerb =
    savingAction === 'publish' ? 'publicada' : isEditing ? 'actualizada' : 'creada';
  // Al crear, el backend decide si se publica (según el estado de venta)
  const successDetail =
    !isEditing && savingAction === 'save' && successData?.published ? ' y publicada' : '';

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
            onClick={goToList}
          >
            Volver al listado
          </Button>
        </div>
      </div>

      {loadStatus === 'error' ? (
        <div className="property-load-error" role="alert">
          <FontAwesomeIcon icon="triangle-exclamation" className="property-load-error__icon" />
          <div className="property-load-error__body">
            <p className="property-load-error__title">No se pudo cargar la vivienda</p>
            <p className="property-load-error__message">
              {error || 'Inténtalo de nuevo en unos segundos.'}
            </p>
          </div>
          <Button variant="primary" icon="rotate-right" onClick={handleRetryLoad}>
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          {showDraftBanner && (
            <div className="draft-recovery-banner">
              <span className="draft-recovery-banner__text">
                Tienes cambios sin guardar de una sesión anterior.
                {draftIsStale && (
                  <strong className="draft-recovery-banner__warning">
                    {' '}La vivienda se ha modificado después: si los recuperas y guardas,
                    sustituirás esos cambios.
                  </strong>
                )}
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

          {/* noValidate: FormValidator es el único camino de validación (la nativa
              bloqueaba el envío en silencio) */}
          <form onSubmit={handleSubmit} className="property-form" noValidate>
            <BasicInfoSection
              formData={formData}
              handleFieldChange={handleFieldChange}
              handleFieldBlur={handleFieldBlur}
              errors={errors}
              touched={touched}
              disabled={isBusy}
            />

            <FeaturesSection
              formData={formData}
              handleFieldChange={handleFieldChange}
              handleFieldBlur={handleFieldBlur}
              errors={errors}
              touched={touched}
            />

            <LocationSection
              formData={formData}
              handleFieldChange={handleFieldChange}
              handleFieldBlur={handleFieldBlur}
              errors={errors}
              touched={touched}
            />

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
                    disabled={isBusy}
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
                removeImage={handleRemoveImage}
                uploadPendingFiles={uploadPendingFiles}
                clearError={clearError}
                isProcessing={isProcessing}
                isReordering={isReordering}
                reorderImages={handleReorderImages}
                reorderPendingFiles={reorderPendingFiles}
                isReadOnly={false}
              />
            </div>

            {/* Publicación: crear autopublica según el estado de venta; editar la
                conserva salvo «Publicar vivienda» en un borrador */}

            {/* Mensajes de error y éxito */}
            {showErrorSummary && invalidFields.length > 0 && (
              <div className="form-error-summary" role="alert">
                <FontAwesomeIcon icon="triangle-exclamation" className="form-error-summary__icon" />
                <div>
                  <p className="form-error-summary__title">Revisa los campos marcados:</p>
                  <ul className="form-error-summary__list">
                    {invalidFields.map((field) => (
                      <li key={field}>
                        <button
                          type="button"
                          className="form-error-summary__link"
                          onClick={() => focusField(field)}
                        >
                          {ViviendaFieldLabels[field]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-error" role="alert">
                <strong>Error:</strong> {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <strong>¡Éxito!</strong> La vivienda ha sido {isEditing ? 'actualizada' : 'creada'} correctamente.
              </div>
            )}

            {lastSavedAt && (
              <p className="autosave-indicator">Autoguardado localmente ✓</p>
            )}

            <div className="form-actions">
              <Button
                variant="secondary"
                icon="xmark"
                onClick={goToList}
                disabled={isBusy}
              >
                Cancelar
              </Button>

              <Button
                variant="outline"
                icon="rotate-right"
                onClick={handleReset}
                disabled={isBusy || !isFormReady}
              >
                Resetear
              </Button>

              {isEditingDraft ? (
                <>
                  <Button
                    type="submit"
                    variant="draft"
                    icon="floppy-disk"
                    loading={isSavingWith('draft')}
                    disabled={isBusy || !isFormReady}
                  >
                    {isSavingWith('draft') ? 'Guardando…' : 'Guardar borrador'}
                  </Button>

                  <Button
                    variant="primary"
                    icon="eye"
                    onClick={() => submitWith('publish')}
                    loading={isSavingWith('publish')}
                    disabled={isBusy || !isFormReady}
                  >
                    {isSavingWith('publish') ? 'Publicando…' : 'Publicar vivienda'}
                  </Button>
                </>
              ) : (
                <>
                  {!isEditing && (
                    <Button
                      variant="draft"
                      icon="floppy-disk"
                      onClick={() => submitWith('draft')}
                      loading={isSavingWith('draft')}
                      disabled={isBusy}
                    >
                      {isSavingWith('draft') ? 'Guardando…' : 'Guardar borrador'}
                    </Button>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    icon="floppy-disk"
                    loading={isSavingWith('save')}
                    disabled={isBusy || !isFormReady}
                  >
                    {isSavingWith('save')
                      ? (isEditing ? 'Actualizando…' : 'Creando…')
                      : (isEditing ? 'Actualizar vivienda' : 'Crear vivienda')}
                  </Button>
                </>
              )}
            </div>
          </form>
        </>
      )}

      {/* Popup de resultado */}
      <SuccessPopup
        isVisible={showSuccessPopup}
        onClose={handleSuccessPopupClose}
        variant={imageUploadFailed ? 'warning' : 'success'}
        title={
          imageUploadFailed
            ? 'Vivienda guardada, pero faltan imágenes'
            : savingAction === 'draft'
              ? '¡Borrador guardado exitosamente!'
              : `¡Vivienda ${successVerb} exitosamente!`
        }
        message={
          imageUploadFailed
            ? `La vivienda "${successName}" se guardó correctamente, pero algunas imágenes no se subieron. Puedes reintentar la subida sin recrear la vivienda.`
            : savingAction === 'draft'
              ? `El borrador "${successName}" ha sido guardado correctamente${imagesSuffix}. Puedes encontrarlo filtrando por "Borradores" en el listado de viviendas.`
              : `La vivienda "${successName}" ha sido ${successVerb}${successDetail} correctamente${imagesSuffix}.`
        }
        actionLabel={imageUploadFailed ? 'Reintentar subida' : undefined}
        onAction={imageUploadFailed ? handleRetryImages : undefined}
        autoClose={!imageUploadFailed}
        autoCloseDelay={4000}
        closeLabel={isEditing ? 'Volver al listado' : 'Crear otra vivienda'}
        closeIcon={isEditing ? 'arrow-left' : 'plus'}
      />

      {/* Popup de carga: solo carga de la vivienda, guardado y subida de imágenes
          (reordenar o borrar una imagen no bloquea la pantalla). Va después del
          popup de resultado para quedar encima al reintentar la subida. */}
      <LoadingPopup
        isVisible={isBusy}
        title={loadingPopup.title}
        message={loadingPopup.message}
        progress={isUploading && uploadProgress > 0 ? uploadProgress : null}
      />
    </div>
  );
};

export default PropertyCreatePage;
