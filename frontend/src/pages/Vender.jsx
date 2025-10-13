import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useContactForm from '../hooks/useContactForm';
import './Vender.css';

export default function Vender() {
  // Usar el hook de contacto con valores por defecto para campos no presentes en el formulario
  const {
    formData,
    isSubmitting,
    submitMessage,
    errors,
    updateField,
    submitForm,
    showSuccess,
    showError
  } = useContactForm({
    initialData: {
      // Valores por defecto hardcoded para campos no presentes en el formulario
      email: 'vender@fincastrimar.com', // Email por defecto para identificar origen
      asunto: 'Solicitud de información para vender inmueble',
      descripcion: 'El cliente solicita información para vender su inmueble. Contacto desde página Vender.',
      tipo: 'venta'
    },
    onSuccess: () => {
      console.log('✅ Solicitud de venta enviada exitosamente');
    },
    onError: (error) => {
      console.error('❌ Error enviando solicitud de venta:', error);
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Proporcionar valores por defecto para campos no presentes en el formulario
    // Estos valores se añaden temporalmente para la validación y envío
    if (!formData.email || formData.email === 'vender@fincastrimar.com') {
      updateField('email', 'contacto@fincastrimar.com');
    }
    
    if (!formData.asunto || formData.asunto === 'Solicitud de información para vender inmueble') {
      updateField('asunto', 'Solicitud de información para vender inmueble');
    }
    
    if (!formData.descripcion || formData.descripcion === 'El cliente solicita información para vender su inmueble. Contacto desde página Vender.') {
      updateField('descripcion', `El cliente ${formData.nombre || 'Usuario'} solicita información para vender su inmueble. Teléfono: ${formData.telefono || 'No proporcionado'}. Contacto desde página Vender.`);
    }
    
    // Pequeña pausa para que se actualicen los valores antes de enviar
    setTimeout(() => {
      submitForm();
    }, 100);
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
      <section className="vender-form-section" aria-labelledby="form-title">
        <div className="container">
          <div className="form-container">
            <div className="form-card">
              <p className="form-intro">
                <strong>Agenda una llamada y te informaremos de todo. Sin Compromiso</strong>
              </p>
              
              <form onSubmit={handleSubmit} className="vender-contact-form" noValidate>
                <div className="vender-form-group">
                  <label htmlFor="nombre" className="vender-form-label">
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
                    className={`vender-form-input ${errors.nombre ? 'error' : ''}`}
                    placeholder="Introduce tu nombre completo"
                    disabled={isSubmitting}
                  />
                  {errors.nombre && (
                    <span className="field-error">{errors.nombre}</span>
                  )}
                </div>

                <div className="vender-form-group">
                  <label htmlFor="telefono" className="vender-form-label">
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
                    className={`vender-form-input ${errors.telefono ? 'error' : ''}`}
                    placeholder="Introduce tu número de teléfono"
                    disabled={isSubmitting}
                  />
                  {errors.telefono && (
                    <span className="field-error">{errors.telefono}</span>
                  )}
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
                  className={`submit-message ${showError ? 'error' : 'success'}`}
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
                  <FontAwesomeIcon icon="handshake" />
                </div>
                <h3 className="info-card-title">Sin exclusividad</h3>
                <p className="info-card-description">
                  No trabajamos con contratos de exclusividad. Mantienes tu libertad para trabajar con quien desees.
                </p>
              </div>
              <div className="info-card">
                <div className="info-icon">
                  <FontAwesomeIcon icon="users" />
                </div>
                <h3 className="info-card-title">Trato personalizado</h3>
                <p className="info-card-description">
                  Cada cliente es único. Ofrecemos un servicio cercano y personalizado adaptado a tus necesidades específicas.
                </p>
              </div>
              <div className="info-card">
                <div className="info-icon">
                  <FontAwesomeIcon icon="file-lines" />
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