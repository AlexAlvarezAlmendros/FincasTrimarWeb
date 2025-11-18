import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import useContactForm from '../hooks/useContactForm';
import './Vender.css';

export default function Vender() {
  // Usar el hook de contacto con valores por defecto para campos no presentes en el formulario
  const {
    formData,
    errors,
    updateField,
    resetForm
  } = useContactForm({
    initialData: {
      // Valores por defecto hardcoded para campos no presentes en el formulario
      email: 'vender@fincastrimar.com', // Email por defecto para identificar origen
      asunto: 'Solicitud de información para vender inmueble',
      descripcion: 'El cliente solicita información para vender su inmueble. Contacto desde página Vender.',
      tipo: 'venta'
    }
  });

  // Estados locales para control completo del envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
    
    // Limpiar error de este campo cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    
    // Validar solo el campo que perdió el foco
    const fieldErrors = {};
    
    if (name === 'nombre') {
      if (!formData.nombre || formData.nombre.trim().length < 3) {
        fieldErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
      }
    }
    
    if (name === 'telefono') {
      if (!formData.telefono || formData.telefono.trim().length === 0) {
        fieldErrors.telefono = 'El teléfono es obligatorio';
      } else {
        const phoneRegex = /^[+]?[\d\s\-()]{9,}$/;
        const digitsOnly = formData.telefono.replace(/[^\d]/g, '');
        
        if (digitsOnly.length < 9 || !phoneRegex.test(formData.telefono.trim())) {
          fieldErrors.telefono = 'Introduce un número de teléfono válido (mínimo 9 dígitos)';
        }
      }
    }
    
    if (Object.keys(fieldErrors).length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        ...fieldErrors
      }));
    }
  };

  const validateVenderForm = () => {
    const newErrors = {};

    // Validar nombre (mínimo 3 caracteres)
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar teléfono (requerido y formato válido)
    if (!formData.telefono || formData.telefono.trim().length === 0) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else {
      // Formato: acepta números, espacios, guiones, paréntesis y + (mínimo 9 dígitos)
      const phoneRegex = /^[+]?[\d\s\-()]{9,}$/;
      const digitsOnly = formData.telefono.replace(/[^\d]/g, '');
      
      if (digitsOnly.length < 9 || !phoneRegex.test(formData.telefono.trim())) {
        newErrors.telefono = 'Introduce un número de teléfono válido (mínimo 9 dígitos)';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Limpiar mensajes anteriores
    setShowSuccess(false);
    setShowError(false);
    setErrorMessage('');
    
    // Validar formulario antes de enviar
    const newValidationErrors = validateVenderForm();
    
    if (Object.keys(newValidationErrors).length > 0) {
      setValidationErrors(newValidationErrors);
      setErrorMessage('Por favor, corrige los errores en el formulario');
      setShowError(true);
      return;
    }
    
    setValidationErrors({});
    setIsSubmitting(true);
    
    try {
      // Obtener la URL actual
      const currentUrl = window.location.href;
      
      // Crear descripción completa con información contextual
      const descripcionCompleta = `SOLICITUD DE INFORMACIÓN PARA VENDER INMUEBLE

DATOS DE CONTACTO:
━━━━━━━━━━━━━━━━━━━━━━━
• Nombre: ${formData.nombre}
• Teléfono: ${formData.telefono}
• Origen: Página Vender
• URL: ${currentUrl}

MENSAJE:
━━━━━━━━━━━━━━━━━━━━━━━
El cliente ${formData.nombre} solicita información para vender su inmueble. 
Ha proporcionado el teléfono ${formData.telefono} para ser contactado.

Este contacto proviene de la página de "Vender" de la web.`;

      // Enviar directamente al backend
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      
      const payload = {
        nombre: formData.nombre.trim(),
        email: 'contacto@fincastrimar.com', // Email por defecto para recibir las consultas
        telefono: formData.telefono ? formData.telefono.trim() : '',
        asunto: 'Solicitud de información para vender inmueble',
        descripcion: descripcionCompleta.trim(),
        tipo: 'venta',
        acepta_politicas: true,
        website: ''
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
      
      // Limpiar formulario después de un breve delay
      setTimeout(() => {
        resetForm();
        // Restaurar valores por defecto específicos para vender
        updateField('asunto', 'Solicitud de información para vender inmueble');
        updateField('descripcion', 'El cliente solicita información para vender su inmueble. Contacto desde página Vender.');
        updateField('tipo', 'venta');
      }, 100);
      
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      
      let friendlyErrorMessage = 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.';
      
      if (error.message.includes('400')) {
        friendlyErrorMessage = 'Datos del formulario incorrectos. Por favor, revisa la información.';
      } else if (error.message.includes('429')) {
        friendlyErrorMessage = 'Has enviado demasiadas solicitudes. Espera un momento antes de intentar de nuevo.';
      } else if (error.message.includes('500')) {
        friendlyErrorMessage = 'Error interno del servidor. Intenta contactarnos por teléfono al 615 84 02 73.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        friendlyErrorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      }

      setErrorMessage(friendlyErrorMessage);
      setShowError(true);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vender-page">
      {/* Hero Section */}
      <section className="vender-heroSection" aria-labelledby="hero-title">
        <div className="container">
          <div className="vender-heroContent">
            <div className="vender-heroText">
              <h1 id="hero-title" className="vender-heroTitle">
                Vende tu inmueble hoy mismo
              </h1>
              <p className="vender-heroSubtitle">
                <strong>Vende tu inmueble de forma rápida y sencilla</strong><br />
                <strong>con nosotros!</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Overlapping Contact Form Section */}
      <section className="vender-formSection" aria-labelledby="form-title">
        <div className="container">
          <div className="vender-formContainer">
            <div className="vender-formCard">
              <p className="vender-formIntro">
                <strong>Agenda una llamada y te informaremos de todo. Sin Compromiso</strong>
              </p>
              
              <form onSubmit={handleSubmit} className="vender-contactForm" noValidate>
                <div className="vender-formGroup">
                  <label htmlFor="nombre" className="vender-formLabel">
                    Tu nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    aria-required="true"
                    className={`vender-formInput ${validationErrors.nombre ? 'error' : ''}`}
                    placeholder="Introduce tu nombre completo"
                    disabled={isSubmitting}
                    aria-invalid={validationErrors.nombre ? 'true' : 'false'}
                  />
                  {validationErrors.nombre && (
                    <span className="vender-fieldError" role="alert">{validationErrors.nombre}</span>
                  )}
                </div>

                <div className="vender-formGroup">
                  <label htmlFor="telefono" className="vender-formLabel">
                    Tu teléfono *
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    aria-required="true"
                    className={`vender-formInput ${validationErrors.telefono ? 'error' : ''}`}
                    placeholder="Introduce tu número de teléfono"
                    disabled={isSubmitting}
                    aria-invalid={validationErrors.telefono ? 'true' : 'false'}
                  />
                  {validationErrors.telefono && (
                    <span className="vender-fieldError" role="alert">{validationErrors.telefono}</span>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="vender-submitButton"
                  disabled={isSubmitting}
                  aria-describedby="submit-status"
                >
                  {isSubmitting ? 'ENVIANDO...' : 'INFÓRMATE'}
                </button>

                {/* Mensaje de éxito al final del formulario */}
                {showSuccess && (
                  <div className="vender-formSuccessMessage" style={{
                    background: '#d4edda',
                    color: '#155724',
                    padding: '16px',
                    borderRadius: '12px',
                    marginTop: '16px',
                    border: '1px solid #c3e6cb',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <div style={{ marginBottom: '8px', fontSize: '16px' }}>✅ ¡Solicitud enviada!</div>
                    <div>Hemos recibido tu solicitud para vender tu inmueble. Te contactaremos pronto para informarte de todo sin compromiso.</div>
                  </div>
                )}

                {/* Mensaje de error al final del formulario */}
                {showError && (
                  <div className="vender-formErrorMessage" style={{
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

              <div className="vender-alternativeContact">
                <p className="vender-phoneText">
                  O si prefieres, llámanos directamente al{' '}
                  <a href="tel:+34615840273" className="vender-phoneLink">
                    615 84 02 73
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="vender-infoSection" aria-labelledby="info-title">
        <div className="container">
          <div className="vender-infoContent">
            <h2 id="info-title" className="vender-infoTitle">
              Nuestro compromiso contigo
            </h2>
            <div className="vender-infoCards">
              <div className="vender-infoCard">
                <div className="vender-infoIcon">
                  <FontAwesomeIcon icon="handshake" />
                </div>
                <h3 className="vender-infoCardTitle">Sin exclusividad</h3>
                <p className="vender-infoCardDescription">
                  No trabajamos con contratos de exclusividad. Mantienes tu libertad para trabajar con quien desees.
                </p>
              </div>
              <div className="vender-infoCard">
                <div className="vender-infoIcon">
                  <FontAwesomeIcon icon="users" />
                </div>
                <h3 className="vender-infoCardTitle">Trato personalizado</h3>
                <p className="vender-infoCardDescription">
                  Cada cliente es único. Ofrecemos un servicio cercano y personalizado adaptado a tus necesidades específicas.
                </p>
              </div>
              <div className="vender-infoCard">
                <div className="vender-infoIcon">
                  <FontAwesomeIcon icon="file-lines" />
                </div>
                <h3 className="vender-infoCardTitle">Nos ocupamos de todo</h3>
                <p className="vender-infoCardDescription">
                  Desde la valoración hasta la firma, gestionamos todos los aspectos de la venta para que no te preocupes por nada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer section to ensure proper spacing */}
      <section className="vender-spacerSection"></section>
    </div>
  );
}