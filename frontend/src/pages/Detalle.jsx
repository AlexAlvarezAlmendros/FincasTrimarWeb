import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useVivienda, useSimilarViviendas } from '../hooks/useViviendas.js';
import useContactForm from '../hooks/useContactForm.js';
import SEO from '../components/SEO';
import GoogleMapEmbed from '../components/GoogleMapEmbed/GoogleMapEmbed.jsx';
import SafeHtmlRenderer from '../components/SafeHtmlRenderer/SafeHtmlRenderer.jsx';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import ImageLightbox from '../components/ImageLightbox';
import { generatePropertySchema, generateBreadcrumbSchema } from '../utils/structuredData';
import { CONTACT, whatsappLink } from '../config/contact';
import {
  formatPropertyPrice,
  getEstadoLabel,
  getPlantaLabel,
  getPriceAriaLabel,
  getPricePerMeter,
  getPriceSuffix,
  getPropertyFeatures,
  getPropertyLocation,
  getPropertySpecs,
  getPropertyTags,
  getSaleStatus,
} from '../utils/propertyDisplay';
import './Detalle.css';

// Fotos del carrusel de cabecera (el resto se ven en la rejilla y en el visor)
const HERO_IMAGES = 8;
const GALLERY_STEP = 12;
// En pantallas estrechas la rejilla empieza con menos fotos (ya hay carrusel arriba)
const initialGalleryCount = () =>
  (typeof window !== 'undefined' && window.matchMedia?.('(max-width: 640px)').matches ? 6 : GALLERY_STEP);
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
// Altura (px) a partir de la cual la descripción se pliega con «Leer más»
const DESCRIPTION_COLLAPSED_HEIGHT = 340;

export default function Detalle() {
  const { id } = useParams();
  
  // Hooks para datos reales
  const { 
    vivienda: property, 
    isLoading: loadingProperty, 
    isError: errorProperty, 
    error: propertyError 
  } = useVivienda(id);
  
  const { 
    similarViviendas: similarProperties, 
    isLoading: loadingSimilar 
  } = useSimilarViviendas(id, 3);

  // Hook para formulario de contacto
  const {
    formData,
    errors,
    isSubmitting: hookIsSubmitting,
    submitSuccess,
    submitError,
    updateField,
    submitForm,
    resetForm
  } = useContactForm({
    email: 'detalle@fincastrimar.com',
    asunto: `Solicitud de visita para ${property?.name || 'vivienda'}`,
    descripcion: `Estoy interesado en agendar una visita para esta vivienda. ${property?.name ? 'Propiedad: ' + property.name : ''} ${property?.poblacion ? 'Ubicación: ' + property.poblacion : ''}`,
    tipo: 'detalle'
  });

  // Imágenes cargadas de forma independiente (no-bloqueante)
  const [imagenes, setImagenes] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoadingImages(true);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    fetch(`${baseUrl}/api/v1/viviendas/${id}/imagenes`)
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => {
        if (data?.data?.images) setImagenes(data.data.images);
      })
      .catch(err => console.warn('No se pudieron cargar las imágenes:', err))
      .finally(() => setLoadingImages(false));
  }, [id]);

  // Estados locales para el envío personalizado
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados locales para UI
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [visibleGalleryCount, setVisibleGalleryCount] = useState(initialGalleryCount);
  const [heroIndex, setHeroIndex] = useState(0);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [descriptionIsLong, setDescriptionIsLong] = useState(false);
  const [shareFeedback, setShareFeedback] = useState('');
  const descriptionRef = useRef(null);
  const heroTrackRef = useRef(null);

  // Al cambiar de inmueble (p. ej. desde «similares») la ficha empieza de cero
  useEffect(() => {
    setLightboxIndex(null);
    setVisibleGalleryCount(initialGalleryCount());
    setHeroIndex(0);
    setDescriptionExpanded(false);
    setShowSuccess(false);
    setShowError(false);
    setImagenes([]);
    if (heroTrackRef.current) heroTrackRef.current.scrollLeft = 0;
  }, [id]);

  // La descripción solo se pliega si de verdad es larga
  useEffect(() => {
    const element = descriptionRef.current;
    if (!element) return;
    setDescriptionIsLong(element.scrollHeight > DESCRIPTION_COLLAPSED_HEIGHT + 120);
  }, [property?.description]);

  // Actualizar información cuando cambia la propiedad
  React.useEffect(() => {
    if (property?.name) {
      updateField('asunto', `Solicitud de visita para ${property.name}`);
    }
  }, [property?.name, updateField]);

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Limpiar mensajes anteriores
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage('');
    setIsSubmitting(true);
    
    try {
      // Obtener la URL actual de la vivienda
      const currentUrl = window.location.href;
      
      // Generar información completa de la vivienda
      const infoVivienda = property ? `
INFORMACIÓN DE LA VIVIENDA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Nombre: ${property.name}
• Precio: ${property.price ? property.price.toLocaleString('es-ES') + ' €' : 'No especificado'}
• Habitaciones: ${property.rooms || 'No especificado'}
• Baños: ${property.bathRooms || 'No especificado'}
• Metros²: ${property.squaredMeters || 'No especificado'}
• Ubicación: ${[property.calle, property.numero, property.poblacion, property.provincia].filter(Boolean).join(', ') || 'No especificada'}
• Tipo: ${property.tipoVivienda || 'No especificado'} - ${property.tipoAnuncio || 'No especificado'}
• ID: ${property.id || id}
• URL: ${currentUrl}` : `
• ID de vivienda: ${id}
• URL: ${currentUrl}`;

      // Crear el mensaje completo que se enviará
      const descripcionCompleta = `${formData.descripcion || 'Estoy interesado en agendar una visita para esta vivienda.'} 

DATOS DE CONTACTO:
━━━━━━━━━━━━━━━━━━━━━━━
• Nombre: ${formData.nombre}
• Email: ${formData.email}
• Teléfono: ${formData.telefono || 'No proporcionado'}
${infoVivienda}`;

      // Enviar directamente con los datos correctos
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      
      const payload = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono ? formData.telefono.trim() : '',
        asunto: formData.asunto.trim(),
        descripcion: descripcionCompleta.trim(),
        tipo: formData.tipo || 'detalle',
        acepta_politicas: true,
        website: formData.website || ''
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/messages/send-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Error ${response.status}: ${response.statusText}`);
      }

      // Éxito: mostrar mensaje y limpiar formulario
      setShowSuccess(true);
      
      // Limpiar formulario después de un breve delay para que el usuario vea el mensaje
      setTimeout(() => {
        resetForm();
        // Volver a establecer los valores por defecto específicos para detalle
        updateField('asunto', `Solicitud de visita para ${property?.name || 'vivienda'}`);
        updateField('descripcion', 'Estoy interesado en agendar una visita para esta vivienda.');
        updateField('tipo', 'detalle');
      }, 100);
      
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      let friendlyErrorMessage = 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.';
      
      if (error.message.includes('400')) {
        friendlyErrorMessage = 'Datos del formulario incorrectos. Por favor, revisa la información.';
      } else if (error.message.includes('429')) {
        friendlyErrorMessage = 'Has enviado demasiados mensajes. Espera un momento antes de intentar de nuevo.';
      } else if (error.message.includes('500')) {
        friendlyErrorMessage = 'Error interno del servidor. Intenta contactarnos por teléfono.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        friendlyErrorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      }

      setErrorMessage(friendlyErrorMessage);
      setShowError(true);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const openLightbox = (index) => setLightboxIndex(index);

  // Carrusel de cabecera (móvil): qué foto se está viendo
  const handleHeroScroll = (e) => {
    const track = e.currentTarget;
    if (!track.clientWidth) return;
    setHeroIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  const handleShare = async () => {
    const shareData = { title: property?.name, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareData.url);
      setShareFeedback('Enlace copiado');
    } catch (error) {
      // Compartir cancelado por el usuario: no es un error
      if (error?.name !== 'AbortError') setShareFeedback('No se pudo copiar el enlace');
    }
    setTimeout(() => setShareFeedback(''), 2500);
  };

  // Estados de carga y error
  if (loadingProperty) {
    return (
      <div className="detalle">
        <div className="container detalle-skeleton" aria-busy="true" aria-label="Cargando vivienda">
          <div className="detalle-skeleton__block detalle-skeleton__gallery" />
          <div className="detalle-skeleton__block detalle-skeleton__title" />
          <div className="detalle-skeleton__block detalle-skeleton__text" />
        </div>
      </div>
    );
  }

  if (errorProperty || !property) {
    return (
      <div className="detalle">
        <div className="container detalle-not-found">
          <div className="state-box">
            <h1>Vivienda no encontrada</h1>
            <p>La vivienda que buscas no existe o ya no está disponible.</p>
            <Link to="/viviendas" className="btn btn--primary">Ver todas las viviendas</Link>
          </div>
        </div>
      </div>
    );
  }

  const specs = getPropertySpecs(property);
  const tags = getPropertyTags(property);
  const status = getSaleStatus(property);
  const features = getPropertyFeatures(property);
  const location = getPropertyLocation(property, { withStreet: true });
  const pricePerMeter = getPricePerMeter(property);
  const priceSuffix = getPriceSuffix(property);
  const heroImages = imagenes.slice(0, HERO_IMAGES);
  const whatsappUrl = whatsappLink(`Hola, me interesa este inmueble: ${property.name} ${window.location.href}`);

  // Datos de ficha sin icono propio: planta y estado de conservación
  const extraFacts = [
    property.planta && { key: 'planta', icon: 'stairs', value: getPlantaLabel(property.planta), label: 'Planta' },
    property.estado && { key: 'estado', icon: 'tag', value: getEstadoLabel(property.estado), label: 'Estado' },
  ].filter(Boolean);

  return (
    <div className="detalle">
      <SEO
        title={property.name}
        description={property.shortDescription || property.description?.substring(0, 160)}
        keywords={`${property.tipoVivienda || property.tipoInmueble || ''} ${property.tipoAnuncio || ''} ${property.poblacion || ''}, ${property.rooms} habitaciones, ${property.squaredMeters}m2, inmobiliaria Igualada`}
        image={imagenes?.[0]?.url}
        type="product"
        structuredData={[
          generatePropertySchema(property),
          generateBreadcrumbSchema([
            { name: 'Inicio', url: window.location.origin },
            { name: 'Viviendas', url: `${window.location.origin}/viviendas` },
            { name: property.name, url: window.location.href }
          ])
        ]}
      />

      <div className="container">
        {/* Migas de pan */}
        <nav className="detalle-breadcrumb" aria-label="Migas de pan">
          <Link to="/">Inicio</Link>
          <span aria-hidden="true">›</span>
          <Link to="/viviendas">Viviendas</Link>
          <span aria-hidden="true">›</span>
          <span className="detalle-breadcrumb__current" aria-current="page">{property.name}</span>
        </nav>

        {/* Fotos de cabecera: mosaico en escritorio, carrusel deslizable en móvil */}
        <section className="detalle-hero" aria-label="Fotos del inmueble">
          {heroImages.length > 0 ? (
            <>
              <div
                className={`detalle-hero__track detalle-hero__track--${Math.min(heroImages.length, 3)}`}
                ref={heroTrackRef}
                onScroll={handleHeroScroll}
              >
                {heroImages.map((imagen, index) => (
                  <button
                    type="button"
                    key={imagen.id || imagen.url}
                    className="detalle-hero__item"
                    onClick={() => openLightbox(index)}
                    aria-label={`Ver foto ${index + 1} de ${imagenes.length} a pantalla completa`}
                  >
                    <img
                      src={imagen.url}
                      alt={index === 0 ? property.name : ''}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchpriority={index === 0 ? 'high' : undefined}
                      decoding="async"
                    />
                  </button>
                ))}
              </div>

              {status && (
                <span className="detalle-hero__status" data-status={status.key}>
                  <FontAwesomeIcon icon={`fa-solid fa-${status.icon}`} aria-hidden="true" />
                  {status.label}
                </span>
              )}

              {heroImages.length > 1 && (
                <span className="detalle-hero__counter" aria-hidden="true">
                  {Math.min(heroIndex + 1, heroImages.length)} / {imagenes.length}
                </span>
              )}

              <button type="button" className="detalle-hero__all" onClick={() => openLightbox(0)}>
                <FontAwesomeIcon icon="fa-solid fa-images" aria-hidden="true" />
                {imagenes.length > 1 ? `Ver las ${imagenes.length} fotos` : 'Ver foto'}
              </button>
            </>
          ) : (
            <div className={`detalle-hero__empty${loadingImages ? ' detalle-hero__empty--loading' : ''}`}>
              {!loadingImages && (
                <>
                  <FontAwesomeIcon icon="fa-solid fa-house" aria-hidden="true" />
                  <span>Este inmueble aún no tiene fotos</span>
                </>
              )}
            </div>
          )}
        </section>

        <div className="detalle-layout">
          <div className="detalle-main">
            {/* Cabecera: qué es, dónde está y cuánto cuesta */}
            <header className="detalle-card detalle-header">
              <div className="detalle-header__tags">
                {tags.map((tag) => (
                  <span key={tag.key} className={`chip chip--${tag.color}`}>{tag.label}</span>
                ))}
                {status && (
                  <span className="chip detalle-header__status" data-status={status.key}>
                    <FontAwesomeIcon icon={`fa-solid fa-${status.icon}`} aria-hidden="true" />
                    {status.label}
                  </span>
                )}
              </div>

              <h1 className="detalle-header__title">{property.name}</h1>

              {location && (
                <p className="detalle-header__location">
                  <FontAwesomeIcon icon="fa-solid fa-location-dot" aria-hidden="true" />
                  <a href="#ubicacion">{location}</a>
                </p>
              )}

              <div className="detalle-header__price-row">
                <p className="detalle-header__price" aria-label={getPriceAriaLabel(property)}>
                  {formatPropertyPrice(property.price)}
                  {priceSuffix && <span className="detalle-header__price-suffix">{priceSuffix}</span>}
                </p>
                {pricePerMeter && <span className="detalle-header__price-meter">{pricePerMeter}</span>}

                <div className="detalle-header__share">
                  <span className="detalle-header__share-feedback" role="status">{shareFeedback}</span>
                  <button type="button" className="detalle-header__share-button" onClick={handleShare}>
                    <FontAwesomeIcon icon="fa-solid fa-share-nodes" aria-hidden="true" />
                    Compartir
                  </button>
                </div>
              </div>

              {(specs.length > 0 || extraFacts.length > 0) && (
                <ul className="detalle-specs">
                  {specs.map((spec) => (
                    <li key={spec.key} className="detalle-specs__item">
                      <FontAwesomeIcon icon={`fa-solid fa-${spec.icon}`} aria-hidden="true" />
                      <span className="detalle-specs__text">
                        <strong>{spec.value}{spec.key === 'meters' ? ' m²' : ''}</strong>
                        <span>{spec.key === 'meters' ? 'Superficie' : capitalize(spec.label)}</span>
                      </span>
                    </li>
                  ))}
                  {extraFacts.map((fact) => (
                    <li key={fact.key} className="detalle-specs__item">
                      <FontAwesomeIcon icon={`fa-solid fa-${fact.icon}`} aria-hidden="true" />
                      <span className="detalle-specs__text">
                        <strong>{fact.value}</strong>
                        <span>{fact.label}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </header>

            {/* Descripción */}
            {property.description && (
              <section className="detalle-card" aria-labelledby="detalle-descripcion">
                <h2 id="detalle-descripcion">Descripción</h2>
                <div
                  ref={descriptionRef}
                  className={`detalle-description${descriptionIsLong && !descriptionExpanded ? ' detalle-description--collapsed' : ''}`}
                  style={descriptionIsLong && !descriptionExpanded ? { maxHeight: DESCRIPTION_COLLAPSED_HEIGHT } : undefined}
                >
                  <SafeHtmlRenderer
                    content={property.description}
                    className="detalle-html-content"
                  />
                </div>
                {descriptionIsLong && (
                  <button
                    type="button"
                    className="detalle-description__toggle"
                    onClick={() => setDescriptionExpanded((expanded) => !expanded)}
                    aria-expanded={descriptionExpanded}
                  >
                    {descriptionExpanded ? 'Leer menos' : 'Leer la descripción completa'}
                    <FontAwesomeIcon
                      icon="fa-solid fa-chevron-down"
                      className={descriptionExpanded ? 'detalle-description__chevron--up' : ''}
                      aria-hidden="true"
                    />
                  </button>
                )}
              </section>
            )}

            {/* Características */}
            {features.length > 0 && (
              <section className="detalle-card" aria-labelledby="detalle-caracteristicas">
                <h2 id="detalle-caracteristicas">Características</h2>
                <ul className="detalle-features">
                  {features.map((feature) => (
                    <li key={feature.key}>
                      <FontAwesomeIcon icon={`fa-solid fa-${feature.icon}`} aria-hidden="true" />
                      {feature.label}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Distribución - Solo si existe */}
            {property.distribucion && (
              <section className="detalle-card" aria-labelledby="detalle-distribucion">
                <h2 id="detalle-distribucion">Distribución</h2>
                <SafeHtmlRenderer content={property.distribucion} className="detalle-html-content" />
              </section>
            )}

            {/* Destacado - Solo si existe */}
            {property.destacado && (
              <section className="detalle-card detalle-card--highlight" aria-labelledby="detalle-destacado">
                <h2 id="detalle-destacado">Extra destacado</h2>
                <SafeHtmlRenderer content={property.destacado} className="detalle-html-content" />
              </section>
            )}

            {/* Ubicación */}
            {location && (
              <section className="detalle-card" id="ubicacion" aria-labelledby="detalle-ubicacion">
                <h2 id="detalle-ubicacion">Ubicación</h2>
                <GoogleMapEmbed
                  calle={property.calle}
                  numero={property.numero}
                  poblacion={property.poblacion}
                  provincia={property.provincia}
                  height="clamp(240px, 45vw, 400px)"
                  className="detalle-map"
                />
              </section>
            )}

            {/* Todas las fotos */}
            {imagenes.length > 1 && (
              <section className="detalle-card" aria-labelledby="detalle-fotos">
                <h2 id="detalle-fotos">Fotos ({imagenes.length})</h2>
                <div className="detalle-gallery">
                  {imagenes.slice(0, visibleGalleryCount).map((imagen, index) => (
                    <button
                      type="button"
                      key={imagen.id || imagen.url}
                      className="detalle-gallery__item"
                      onClick={() => openLightbox(index)}
                      aria-label={`Ver foto ${index + 1} a pantalla completa`}
                    >
                      <img
                        src={imagen.url}
                        alt={`${property.name} - Imagen ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
                {imagenes.length > visibleGalleryCount && (
                  <button
                    type="button"
                    className="btn btn--secondary detalle-gallery__more"
                    onClick={() => setVisibleGalleryCount((prev) => prev + GALLERY_STEP)}
                  >
                    Ver más fotos ({imagenes.length - visibleGalleryCount})
                  </button>
                )}
              </section>
            )}

            {/* Plano - Solo si existe */}
            {property.planoUrl && (
              <section className="detalle-card" aria-labelledby="detalle-plano">
                <h2 id="detalle-plano">Plano de la vivienda</h2>
                <img
                  className="detalle-floorplan"
                  src={property.planoUrl}
                  alt="Plano con distribución y medidas aproximadas"
                  loading="lazy"
                />
              </section>
            )}
          </div>

          {/* Contacto: columna fija en escritorio, bloque al final en móvil */}
          <aside className="detalle-aside" id="contacto" aria-labelledby="detalle-contacto">
            <div className="detalle-card detalle-contact">
              <h2 id="detalle-contacto">
                {status?.key === 'sold' ? '¿Buscas algo parecido?' : '¿Te interesa este inmueble?'}
              </h2>
              <p className="detalle-contact__intro">
                Llámanos o escríbenos y te lo enseñamos sin compromiso.
              </p>

              <div className="detalle-contact__direct">
                <a href={CONTACT.phoneHref} className="btn btn--primary btn--lg">
                  <FontAwesomeIcon icon="fa-solid fa-phone" aria-hidden="true" />
                  {CONTACT.phoneDisplay}
                </a>
                <a href={whatsappUrl} className="btn btn--whatsapp btn--lg" target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon="fa-brands fa-whatsapp" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>

              <p className="detalle-contact__divider"><span>o pide una visita</span></p>

              {showSuccess ? (
                <div className="detalle-contact__success" role="status">
                  <FontAwesomeIcon icon="fa-solid fa-circle-check" aria-hidden="true" />
                  <p>
                    <strong>¡Gracias! Hemos recibido tu solicitud.</strong>
                    Te responderemos lo antes posible.
                  </p>
                  <button type="button" className="detalle-contact__again" onClick={() => setShowSuccess(false)}>
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactFormSubmit} className="detalle-form" aria-label="Agenda una visita">
                  <div className="detalle-form__field">
                    <label htmlFor="visita-nombre">Nombre <span aria-hidden="true">*</span></label>
                    <input
                      id="visita-nombre"
                      type="text"
                      autoComplete="name"
                      value={formData.nombre}
                      onChange={(e) => updateField('nombre', e.target.value)}
                      required
                      aria-required="true"
                      aria-invalid={Boolean(errors.nombre)}
                      disabled={isSubmitting}
                    />
                    {errors.nombre && <p className="detalle-form__error">{errors.nombre}</p>}
                  </div>

                  <div className="detalle-form__field">
                    <label htmlFor="visita-email">Email <span aria-hidden="true">*</span></label>
                    <input
                      id="visita-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      required
                      aria-required="true"
                      aria-invalid={Boolean(errors.email)}
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="detalle-form__error">{errors.email}</p>}
                  </div>

                  <div className="detalle-form__field">
                    <label htmlFor="visita-telefono">Teléfono</label>
                    <input
                      id="visita-telefono"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      value={formData.telefono}
                      onChange={(e) => updateField('telefono', e.target.value)}
                      aria-invalid={Boolean(errors.telefono)}
                      disabled={isSubmitting}
                    />
                    {errors.telefono && <p className="detalle-form__error">{errors.telefono}</p>}
                  </div>

                  <div className="detalle-form__field">
                    <label htmlFor="visita-mensaje">Mensaje <span className="detalle-form__optional">(opcional)</span></label>
                    <textarea
                      id="visita-mensaje"
                      rows="3"
                      placeholder="Me gustaría visitar este inmueble…"
                      value={formData.descripcion}
                      onChange={(e) => updateField('descripcion', e.target.value)}
                      aria-invalid={Boolean(errors.descripcion)}
                      disabled={isSubmitting}
                    />
                    {errors.descripcion && <p className="detalle-form__error">{errors.descripcion}</p>}
                  </div>

                  {showError && (
                    <p className="detalle-form__alert" role="alert">{errorMessage}</p>
                  )}

                  <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando…' : 'Agendar visita'}
                  </button>

                  <p className="detalle-form__legal">
                    Al enviar aceptas nuestra <Link to="/politica-privacidad">política de privacidad</Link>.
                  </p>
                </form>
              )}
            </div>
          </aside>
        </div>

        {/* Inmuebles similares */}
        {!loadingSimilar && similarProperties && similarProperties.length > 0 && (
          <section className="detalle-similar" aria-labelledby="detalle-similares">
            <div className="detalle-similar__header">
              <h2 id="detalle-similares">Inmuebles similares</h2>
              <Link to="/viviendas" className="detalle-similar__more">
                Ver más
                <FontAwesomeIcon icon="fa-solid fa-arrow-right" aria-hidden="true" />
              </Link>
            </div>

            <div className="property-grid">
              {similarProperties.map((similar) => (
                <PropertyCard key={similar.id} property={similar} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Barra de acción fija (móvil y tablet): el contacto siempre a mano */}
      <div className="detalle-actionbar">
        <div className="detalle-actionbar__price">
          <strong>{formatPropertyPrice(property.price)}{priceSuffix}</strong>
          {specs.length > 0 && (
            <span>{specs.map((spec) => `${spec.value} ${spec.unit}`).join(' · ')}</span>
          )}
        </div>
        <a href={CONTACT.phoneHref} className="detalle-actionbar__button detalle-actionbar__button--call" aria-label={`Llamar al ${CONTACT.phoneDisplay}`}>
          <FontAwesomeIcon icon="fa-solid fa-phone" aria-hidden="true" />
          <span>Llamar</span>
        </a>
        <a href={whatsappUrl} className="detalle-actionbar__button detalle-actionbar__button--whatsapp" target="_blank" rel="noopener noreferrer" aria-label="Escribir por WhatsApp">
          <FontAwesomeIcon icon="fa-brands fa-whatsapp" aria-hidden="true" />
          <span>WhatsApp</span>
        </a>
        <a href="#contacto" className="detalle-actionbar__button detalle-actionbar__button--visit">
          <FontAwesomeIcon icon="fa-solid fa-calendar-alt" aria-hidden="true" />
          <span>Visita</span>
        </a>
      </div>

      {/* Visor de fotos */}
      {lightboxIndex !== null && imagenes.length > 0 && (
        <ImageLightbox
          images={imagenes}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
          altPrefix={property.name}
        />
      )}
    </div>
  );
}
