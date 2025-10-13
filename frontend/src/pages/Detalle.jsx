import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVivienda, useSimilarViviendas } from '../hooks/useViviendas.js';
import useContactForm from '../hooks/useContactForm.js';
import GoogleMapEmbed from '../components/GoogleMapEmbed/GoogleMapEmbed.jsx';
import SafeHtmlRenderer from '../components/SafeHtmlRenderer/SafeHtmlRenderer.jsx';
import './Detalle.css';

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
  } = useSimilarViviendas(id, 2);

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

  // Estados locales para el envío personalizado
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Estados locales para UI
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

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

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  const nextImage = () => {
    const totalImages = property?.imagenes?.length || 1;
    setCurrentImageIndex((prev) => 
      prev === totalImages - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    const totalImages = property?.imagenes?.length || 1;
    setCurrentImageIndex((prev) => 
      prev === 0 ? totalImages - 1 : prev - 1
    );
  };

  // Estados de carga y error
  if (loadingProperty) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando vivienda...</p>
      </div>
    );
  }

  if (errorProperty || !property) {
    return (
      <div className="error-container">
        <h1>Vivienda no encontrada</h1>
        <p>
          {propertyError || 'La vivienda que buscas no existe o ha sido eliminada.'}
        </p>
        <Link to="/viviendas" className="back-link">Volver al listado</Link>
      </div>
    );
  }

  return (
    <div className="detalle">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Inicio</Link>
          <span>›</span>
          <Link to="/viviendas">Viviendas</Link>
          <span>›</span>
          <span>{property.name}</span>
        </nav>

        {/* Hero Gallery */}
        <section className="hero-gallery">
          <div className="main-image" onClick={() => openLightbox(0)}>
            <img 
              src={property.imagenes && property.imagenes.length > 0 
                ? property.imagenes[0].URL 
                : '/api/placeholder/800/600'} 
              alt={property.name} 
            />
            <div className="view-all-images">
              {property.imagenes && property.imagenes.length > 1 
                ? `Ver todas las imágenes (${property.imagenes.length})` 
                : 'Ver imagen'}
            </div>
          </div>
        </section>

        {/* Property Header */}
        <section className="property-header">
          <div className="property-main-info">
            <h1 className="property-title">{property.name}</h1>
            <p className="property-lead">{property.shortDescription}</p>
            
            <div className="property-tags">
              <span className="chip chip-green">{property.tipoInmueble}</span>
              <span className="chip chip-yellow">{property.tipoVivienda}</span>
              <span className="chip chip-purple">{property.tipoAnuncio}</span>
            </div>
            
            <div className="property-price-specs">
              <div className="price-section">
                <span className="price-detalle" aria-label={`Precio: ${property.price.toLocaleString('es-ES')} euros`}>
                  {property.price.toLocaleString('es-ES')}
                </span>
              </div>
              
              <div className="specs-grid-detalle">
                {property.rooms > 0 && (
                  <div className="spec">
                    <span className="spec-value">{property.rooms}</span>
                    <span className="spec-label">Habitaciones</span>
                  </div>
                )}
                {property.bathRooms > 0 && (
                  <div className="spec">
                    <span className="spec-value">{property.bathRooms}</span>
                    <span className="spec-label">Baños</span>
                  </div>
                )}
                <div className="spec">
                  <span className="spec-value">{property.squaredMeters}</span>
                  <span className="spec-label">M²</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <main className="main-content-detalle">
            {/* Description */}
            <section className="description-section">
              <h2>Descripción</h2>
              <SafeHtmlRenderer 
                content={property.description}
                className="description-content html-content"
              />
            </section>

            {/* Características */}
            {property.caracteristicas && property.caracteristicas.length > 0 && (
              <section className="features-section">
                <h3>Características principales</h3>
                <ul className="features-list">
                  {property.caracteristicas.map((feature, index) => (
                    <li key={index}>
                      {typeof feature === 'object' ? feature.name || feature.caracteristica : feature}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Distribución - Solo mostrar si existe */}
            {property.distribucion && (
              <section className="distribution-section">
                <h3>Distribución</h3>
                <SafeHtmlRenderer 
                  content={property.distribucion}
                  className="html-content"
                  tag="div"
                />
              </section>
            )}

            {/* Destacado - Solo mostrar si existe */}
            {property.destacado && (
              <section className="highlight-section">
                <h3>Extra destacado</h3>
                <SafeHtmlRenderer 
                  content={property.destacado}
                  className="highlight-text html-content"
                  tag="div"
                />
              </section>
            )}

            {/* Ubicación */}
            <section className="location-section">
              <h3>Ubicación</h3>
              <div className="location-map">
                <GoogleMapEmbed
                  calle={property.calle}
                  numero={property.numero}
                  poblacion={property.poblacion}
                  provincia={property.provincia}
                  height="400px"
                  className="property-map"
                />
              </div>
            </section>

            {/* Gallery - Solo mostrar si hay imágenes */}
            {property.imagenes && property.imagenes.length > 0 && (
              <section className="gallery-section">
                <h3>Imágenes</h3>
                <div className="image-grid">
                  {property.imagenes.map((imagen, index) => (
                    <div key={imagen.Id || index} className="gallery-item" onClick={() => openLightbox(index)}>
                      <img 
                        src={imagen.URL} 
                        alt={`${property.name} - Imagen ${index + 1}`} 
                        loading="lazy" 
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Plano - Solo mostrar si existe */}
            {property.planoUrl && (
              <section className="floorplan-section">
                <h3>Plano de la vivienda</h3>
                <div className="floorplan">
                  <img 
                    src={property.planoUrl} 
                    alt="Plano con distribución y medidas aproximadas" 
                  />
                </div>
              </section>
            )}
          </main>

          <aside className="sidebar">
            {/* Contact Form */}
            <div className="contact-form-container">
              <h3>Agenda una visita</h3>
              
              {/* Mensajes de estado */}
              {showSuccess && (
                <div className="success-message" style={{
                  background: '#d4edda',
                  color: '#155724',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: '1px solid #c3e6cb'
                }}>
                  ¡Gracias! Hemos recibido tu solicitud de visita. Te responderemos lo antes posible.
                </div>
              )}
              
              {showError && (
                <div className="error-message" style={{
                  background: '#f8d7da',
                  color: '#721c24',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: '1px solid #f5c6cb'
                }}>
                  {errorMessage}
                </div>
              )}
              
              <form onSubmit={handleContactFormSubmit} className="contact-form">
                <div className="form-group">
                  <textarea
                    placeholder="¿Estás interesado en agendar una visita para este inmueble?"
                    value={formData.descripcion}
                    onChange={(e) => updateField('descripcion', e.target.value)}
                    rows="3"
                    required
                    disabled={isSubmitting}
                    className={errors.descripcion ? 'error' : ''}
                  />
                  {errors.descripcion && <div className="field-error">{errors.descripcion}</div>}
                </div>
                
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Tu nombre *"
                    value={formData.nombre}
                    onChange={(e) => updateField('nombre', e.target.value)}
                    required
                    disabled={isSubmitting}
                    className={errors.nombre ? 'error' : ''}
                  />
                  {errors.nombre && <div className="field-error">{errors.nombre}</div>}
                </div>
                
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Tu Email *"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    disabled={isSubmitting}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <div className="field-error">{errors.email}</div>}
                </div>
                
                <div className="form-group">
                  <input
                    type="tel"
                    placeholder="Tu Teléfono"
                    value={formData.telefono}
                    onChange={(e) => updateField('telefono', e.target.value)}
                    disabled={isSubmitting}
                    className={errors.telefono ? 'error' : ''}
                  />
                  {errors.telefono && <div className="field-error">{errors.telefono}</div>}
                </div>
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                  style={isSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                >
                  {isSubmitting ? 'Enviando...' : 'AGENDAR VISITA'}
                </button>

                {/* Mensaje de error al final del formulario */}
                {showError && (
                  <div className="form-error-message" style={{
                    background: '#f8d7da',
                    color: '#721c24',
                    padding: '16px',
                    borderRadius: '12px',
                    marginTop: '16px',
                    border: '1px solid #f5c6cb',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <div style={{ marginBottom: '8px', fontSize: '16px' }}>❌ Error al enviar</div>
                    <div>{errorMessage}</div>
                  </div>
                )}
              </form>
              
              {/* Botón y número de teléfono */}
              <div className="phone-section">
                <button 
                  className="phone-toggle-button"
                  onClick={() => setShowPhoneNumber(!showPhoneNumber)}
                  type="button"
                >
                  {showPhoneNumber ? 'Ocultar número de teléfono' : 'Mostrar número de teléfono'}
                </button>
                
                {showPhoneNumber && (
                  <div className="phone-display">
                    <p className="phone-text">O si prefieres, llámanos directamente al:</p>
                    <a href="tel:+34615840273" className="phone-number">
                      615 84 02 73
                    </a>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Similar Properties */}
        {!loadingSimilar && similarProperties && similarProperties.length > 0 && (
          <section className="similar-properties">
            <div className="section-header">
              <h3>Inmuebles similares</h3>
              <Link to="/viviendas" className="view-more-link">VER MÁS</Link>
            </div>
            
            <div className="similar-grid">
              {similarProperties.map((similar) => (
                <article key={similar.id} className="similar-card">
                  <Link to={`/viviendas/${similar.id}`}>
                    <div className="similar-image">
                      <img 
                        src={similar.imagenes && similar.imagenes.length > 0 
                          ? similar.imagenes[0].URL 
                          : '/api/placeholder/300/200'} 
                        alt={similar.name} 
                        loading="lazy" 
                      />
                    </div>
                    
                    <div className="similar-info">
                      <h4 className="similar-title">{similar.name}</h4>
                      <div className="similar-specs">
                        {similar.rooms > 0 && <span>{similar.rooms} hab</span>}
                        <span>{similar.squaredMeters} m²</span>
                        {similar.bathRooms > 0 && <span>{similar.bathRooms} baños</span>}
                        {similar.garage > 0 && <span>{similar.garage} garajes</span>}
                      </div>
                      <div className="similar-price">
                        {similar.price.toLocaleString('es-ES')} €
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
        
        {loadingSimilar && (
          <section className="similar-properties">
            <div className="section-header">
              <h3>Inmuebles similares</h3>
            </div>
            <div className="loading-similar">
              <p>Cargando propiedades similares...</p>
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && property?.imagenes && property.imagenes.length > 0 && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>×</button>
            {property.imagenes.length > 1 && (
              <>
                <button className="lightbox-prev" onClick={prevImage}>‹</button>
                <button className="lightbox-next" onClick={nextImage}>›</button>
              </>
            )}
            <img 
              src={property.imagenes[currentImageIndex]?.URL || '/api/placeholder/800/600'} 
              alt={`${property.name} - Imagen ${currentImageIndex + 1}`} 
            />
            <div className="lightbox-counter">
              {currentImageIndex + 1} / {property.imagenes.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}