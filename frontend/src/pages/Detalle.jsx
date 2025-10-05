import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Detalle.css';

export default function Detalle() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [contactForm, setContactForm] = useState({
    mensaje: '',
    nombre: '',
    email: '',
    telefono: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data para la vivienda
  const mockProperty = {
    id: '1',
    name: 'Piso reformado en edificio histórico en el centro de Igualada 102 m²',
    shortDescription: 'Precioso piso en una de las mejores zonas de Igualada',
    description: `Este espectacular piso completamente reformado se encuentra ubicado en el corazón del centro histórico de Igualada, una de las zonas más cotizadas y con mayor proyección de la ciudad.

La vivienda ha sido renovada integralmente manteniendo el encanto original de la arquitectura histórica pero incorporando todas las comodidades modernas. Los acabados son de primera calidad y se ha cuidado cada detalle para crear un ambiente acogedor y funcional.

La ubicación es inmejorable, a escasos metros de la plaza mayor y rodeado de todos los servicios: comercios, restaurantes, transporte público, centros educativos y sanitarios. Perfecto tanto como vivienda habitual como para inversión.

Una oportunidad única para vivir en el centro de Igualada con todas las comodidades de una vivienda moderna en un entorno histórico privilegiado.`,
    price: 240000,
    rooms: 3,
    bathRooms: 2,
    garage: 0,
    squaredMeters: 102,
    provincia: 'Barcelona',
    poblacion: 'Igualada',
    calle: 'C/ Major',
    numero: '12',
    tipoInmueble: 'Vivienda',
    tipoVivienda: 'Piso',
    estado: 'BuenEstado',
    planta: 'PlantaIntermedia',
    tipoAnuncio: 'Venta',
    estadoVenta: 'Disponible',
    fechaPublicacion: '2024-01-15',
    caracteristicas: [
      'Aire acondicionado',
      'Armarios empotrados',
      'Ascensor',
      'Balcón',
      'Calefacción',
      'Cocina equipada',
      'Exterior'
    ],
    distribucion: 'La vivienda se distribuye en un amplio salón-comedor con acceso a balcón, cocina office completamente equipada, 3 dormitorios (uno de ellos suite con baño privado), un baño completo adicional y recibidor de entrada.',
    destacado: 'Ubicación privilegiada en el centro histórico con vistas despejadas y mucha luz natural durante todo el día.',
    images: [
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600',
      '/api/placeholder/800/600'
    ],
    planoUrl: '/api/placeholder/800/600'
  };

  const similarProperties = [
    {
      id: '2',
      name: 'Chalet adosado con jardín',
      price: 350000,
      rooms: 4,
      bathRooms: 3,
      garage: 2,
      squaredMeters: 180,
      poblacion: 'Barcelona',
      tipoVivienda: 'Chalet',
      tipoAnuncio: 'Venta',
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '3',
      name: 'Ático con terraza panorámica',
      price: 450000,
      rooms: 3,
      bathRooms: 2,
      garage: 1,
      squaredMeters: 120,
      poblacion: 'Sitges',
      tipoVivienda: 'Ático',
      tipoAnuncio: 'Venta',
      imageUrl: '/api/placeholder/300/200'
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setLoading(true);
    setTimeout(() => {
      setProperty(mockProperty);
      setLoading(false);
    }, 500);
  }, [id]);

  const handleContactFormChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío
    setTimeout(() => {
      alert('Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.');
      setContactForm({
        mensaje: '',
        nombre: '',
        email: '',
        telefono: ''
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando vivienda...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="error-container">
        <h1>Vivienda no encontrada</h1>
        <p>La vivienda que buscas no existe o ha sido eliminada.</p>
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
            <img src={property.images[0]} alt={property.name} />
            <div className="view-all-images">Ver todas las imágenes</div>
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
                <span className="price" aria-label={`Precio: ${property.price.toLocaleString('es-ES')} euros`}>
                  {property.price.toLocaleString('es-ES')} €
                </span>
              </div>
              
              <div className="specs-grid">
                {property.rooms > 0 && (
                  <div className="spec">
                    <span className="spec-value">{property.rooms}</span>
                    <span className="spec-label">Habitaciones</span>
                  </div>
                )}
                {property.garage > 0 && (
                  <div className="spec">
                    <span className="spec-value">{property.garage}</span>
                    <span className="spec-label">Garajes</span>
                  </div>
                )}
                <div className="spec">
                  <span className="spec-value">{property.squaredMeters}</span>
                  <span className="spec-label">M²</span>
                </div>
                {property.bathRooms > 0 && (
                  <div className="spec">
                    <span className="spec-value">{property.bathRooms}</span>
                    <span className="spec-label">Baños</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <main className="main-content">
            {/* Description */}
            <section className="description-section">
              <h2>Descripción</h2>
              <div className="description-content">
                {property.description.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Características */}
            <section className="features-section">
              <h3>Características principales</h3>
              <ul className="features-list">
                {property.caracteristicas.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </section>

            {/* Distribución */}
            <section className="distribution-section">
              <h3>Distribución</h3>
              <p>{property.distribucion}</p>
            </section>

            {/* Destacado */}
            <section className="highlight-section">
              <h3>Extra destacado</h3>
              <p className="highlight-text">{property.destacado}</p>
            </section>

            {/* Ubicación */}
            <section className="location-section">
              <h3>Ubicación</h3>
              <div className="location-map">
                <img src="/api/placeholder/600/300" alt="Mapa de ubicación" />
                <p className="location-text">
                  {property.calle} {property.numero}, {property.poblacion}, {property.provincia}
                </p>
              </div>
            </section>

            {/* Gallery */}
            <section className="gallery-section">
              <h3>Imágenes</h3>
              <div className="image-grid">
                {property.images.map((image, index) => (
                  <div key={index} className="gallery-item" onClick={() => openLightbox(index)}>
                    <img src={image} alt={`${property.name} - Imagen ${index + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            </section>

            {/* Plano */}
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
              <form onSubmit={handleContactFormSubmit} className="contact-form">
                <div className="form-group">
                  <textarea
                    placeholder="¿Estás interesado en agendar una visita para este inmueble?"
                    value={contactForm.mensaje}
                    onChange={(e) => handleContactFormChange('mensaje', e.target.value)}
                    rows="3"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={contactForm.nombre}
                    onChange={(e) => handleContactFormChange('nombre', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Tu Email"
                    value={contactForm.email}
                    onChange={(e) => handleContactFormChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <input
                    type="tel"
                    placeholder="Tu Teléfono"
                    value={contactForm.telefono}
                    onChange={(e) => handleContactFormChange('telefono', e.target.value)}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'AGENDAR VISITA'}
                </button>
              </form>
            </div>
          </aside>
        </div>

        {/* Similar Properties */}
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
                    <img src={similar.imageUrl} alt={similar.name} loading="lazy" />
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
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>×</button>
            <button className="lightbox-prev" onClick={prevImage}>‹</button>
            <img src={property.images[currentImageIndex]} alt={`${property.name} - Imagen ${currentImageIndex + 1}`} />
            <button className="lightbox-next" onClick={nextImage}>›</button>
            <div className="lightbox-counter">
              {currentImageIndex + 1} / {property.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}