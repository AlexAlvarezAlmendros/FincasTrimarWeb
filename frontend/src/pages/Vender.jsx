import { useState } from 'react';
import './Vender.css';

export default function Vender() {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // TODO: Integrar con el servicio de mensajes del backend
      console.log('Formulario enviado:', formData);
      
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitMessage('¡Gracias! Nos pondremos en contacto contigo pronto.');
      setFormData({ nombre: '', telefono: '' });
    } catch (error) {
      setSubmitMessage('Ha ocurrido un error. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vender-page">
      {/* Hero Section */}
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 id="hero-title" className="hero-title">
                Vende tu inmueble hoy mismo
              </h1>
              <p className="hero-subtitle">
                <strong>Vende tu inmueble de forma rápida y sencilla</strong><br />
                <strong>con nosotros!</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Overlapping Contact Form Section */}
      <section className="contact-form-section" aria-labelledby="form-title">
        <div className="container">
          <div className="form-container">
            <div className="form-card">
              <p className="form-intro">
                <strong>Agenda una llamada y te informaremos de todo. Sin Compromiso</strong>
              </p>
              
              <form onSubmit={handleSubmit} className="contact-form" noValidate>
                <div className="form-group">
                  <label htmlFor="nombre" className="form-label">
                    Tu nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                    className="form-input"
                    placeholder="Introduce tu nombre completo"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefono" className="form-label">
                    Tu teléfono *
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                    className="form-input"
                    placeholder="Introduce tu número de teléfono"
                  />
                </div>

                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                  aria-describedby="submit-status"
                >
                  {isSubmitting ? 'ENVIANDO...' : 'INFÓRMATE'}
                </button>
              </form>

              {submitMessage && (
                <div 
                  id="submit-status"
                  className={`submit-message ${submitMessage.includes('error') ? 'error' : 'success'}`}
                  role="alert"
                  aria-live="polite"
                >
                  {submitMessage}
                </div>
              )}

              <div className="alternative-contact">
                <p className="phone-text">
                  O si prefieres, llámanos directamente al{' '}
                  <a href="tel:+34615840273" className="phone-link">
                    615 84 02 73
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="info-section" aria-labelledby="info-title">
        <div className="container">
          <div className="info-content">
            <h2 id="info-title" className="info-title">
              Nuestro compromiso contigo
            </h2>
            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1v6"/>
                  </svg>
                </div>
                <h3 className="info-card-title">Sin exclusividad</h3>
                <p className="info-card-description">
                  No trabajamos con contratos de exclusividad. Mantienes tu libertad para trabajar con quien desees.
                </p>
              </div>
              <div className="info-card">
                <div className="info-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 className="info-card-title">Trato personalizado</h3>
                <p className="info-card-description">
                  Cada cliente es único. Ofrecemos un servicio cercano y personalizado adaptado a tus necesidades específicas.
                </p>
              </div>
              <div className="info-card">
                <div className="info-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h2l3 3h1V8h-1l-3 3z"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M18.07 6.93a10 10 0 0 1 0 10.14"/>
                  </svg>
                </div>
                <h3 className="info-card-title">Nos ocupamos de todo</h3>
                <p className="info-card-description">
                  Desde la valoración hasta la firma, gestionamos todos los aspectos de la venta para que no te preocupes por nada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer section to ensure proper spacing */}
      <section className="spacer-section"></section>
    </div>
  );
}