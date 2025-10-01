import React, { useState } from 'react';
import './Contacto.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // TODO: Conectar con API real
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulación
      
      setSubmitMessage('¡Gracias! Hemos recibido tu mensaje. Te responderemos lo antes posible.');
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: ''
      });
    } catch (error) {
      setSubmitMessage('Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contacto">
      {/* Header */}
      <section className="contact-header">
        <div className="container">
          <div className="header-content">
            <h1 className="page-title">Contacta con nosotros</h1>
            <p className="page-subtitle">
              Estamos aquí para ayudarte con todas tus necesidades inmobiliarias. 
              No dudes en ponerte en contacto con nuestro equipo.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="contact-content">
        <div className="container">
          <div className="content-grid">
            
            {/* Contact Information */}
            <div className="contact-info">
              <div className="info-card">
                <div className="info-header">
                  <h3>¿Cómo podemos ayudarte?</h3>
                  <p className="info-subtitle">
                    Múltiples formas de contactar con nosotros
                  </p>
                </div>
                
                <div className="contact-methods">
                  <div className="contact-method featured-method">
                    <div className="method-icon phone-icon">
                      <span><FontAwesomeIcon icon="phone" /></span>
                    </div>
                    <div className="method-content">
                      <div className="method-header">
                        <h4>Llámanos directamente</h4>
                        <span className="method-badge">Inmediato</span>
                      </div>
                      <div className="method-details">
                        <a href="tel:+34615840273" className="primary-contact">
                          615 84 02 73
                        </a>
                        <div className="contact-hours">
                          <span className="hour-item"><FontAwesomeIcon icon="calendar-alt" /> Lun - Vie: 9:00 - 18:00</span>
                          <span className="hour-item"><FontAwesomeIcon icon="clock" /> Sáb: 10:00 - 14:00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon email-icon">
                      <span><FontAwesomeIcon icon="envelope" /></span>
                    </div>
                    <div className="method-content">
                      <div className="method-header">
                        <h4>Escríbenos un email</h4>
                        <span className="method-badge response-badge">24h respuesta</span>
                      </div>
                      <div className="method-details">
                        <a href="mailto:info@fincastrimar.com" className="primary-contact">
                          info@fincastrimar.com
                        </a>
                        <p className="method-description">
                          Para consultas detalladas, envío de documentos y solicitudes específicas
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon whatsapp-icon">
                      <span>💬</span>
                    </div>
                    <div className="method-content">
                      <div className="method-header">
                        <h4>WhatsApp Business</h4>
                        <span className="method-badge whatsapp-badge">Rápido</span>
                      </div>
                      <div className="method-details">
                        <a href="https://wa.me/34615840273" className="primary-contact" target="_blank" rel="noopener noreferrer">
                          Iniciar chat
                        </a>
                        <p className="method-description">
                          Consultas rápidas, fotos de propiedades y respuestas inmediatas
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="contact-footer">
                  <div className="emergency-contact">
                    <h4>🚨 Urgencias fuera de horario</h4>
                    <p>
                      Para emergencias relacionadas con propiedades en gestión, 
                      contacta por WhatsApp las 24h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-section">
              <div className="form-card">
                <h3>Envíanos un mensaje</h3>
                <p className="form-description">
                  Completa el formulario y nos pondremos en contacto contigo lo antes posible.
                </p>

                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre *</label>
                      <input
                        type="text"
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        placeholder="Tu nombre completo"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="tu@email.com"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="telefono">Teléfono</label>
                      <input
                        type="tel"
                        id="telefono"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        placeholder="Tu número de teléfono"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="asunto">Asunto *</label>
                      <select
                        id="asunto"
                        value={formData.asunto}
                        onChange={(e) => handleInputChange('asunto', e.target.value)}
                        required
                        disabled={isSubmitting}
                      >
                        <option value="">Selecciona un asunto</option>
                        <option value="comprar">Quiero comprar</option>
                        <option value="vender">Quiero vender</option>
                        <option value="alquilar">Quiero alquilar</option>
                        <option value="valoracion">Solicitar valoración</option>
                        <option value="informacion">Solicitar información</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="mensaje">Mensaje *</label>
                    <textarea
                      id="mensaje"
                      rows="5"
                      value={formData.mensaje}
                      onChange={(e) => handleInputChange('mensaje', e.target.value)}
                      placeholder="Cuéntanos en qué podemos ayudarte..."
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'ENVIAR MENSAJE'}
                  </button>

                  {submitMessage && (
                    <div className={`submit-message ${submitMessage.includes('Error') ? 'submit-message--error' : 'submit-message--success'}`}>
                      {submitMessage}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h3>Preguntas frecuentes</h3>
          
          <div className="faq-grid">
            <div className="faq-item">
              <h4>¿Cuánto cuesta vender mi inmueble?</h4>
              <p>
                Nuestros honorarios son transparentes y competitivos. 
                Te proporcionaremos un presupuesto detallado sin compromiso después de la valoración.
              </p>
            </div>

            <div className="faq-item">
              <h4>¿Cuánto tiempo tarda en venderse una vivienda?</h4>
              <p>
                El tiempo de venta depende de varios factores como ubicación, precio y estado. 
                En promedio, nuestras viviendas se venden un 40% más rápido que la media del mercado.
              </p>
            </div>

            <div className="faq-item">
              <h4>¿Ofrecen servicio de valoración gratuita?</h4>
              <p>
                Sí, ofrecemos valoraciones gratuitas y sin compromiso. 
                Nuestros expertos analizarán tu propiedad y te darán una valoración realista del mercado.
              </p>
            </div>

            <div className="faq-item">
              <h4>¿Trabajan con hipotecas?</h4>
              <p>
                Colaboramos con las mejores entidades financieras para ayudar a nuestros clientes 
                a conseguir las mejores condiciones hipotecarias del mercado.
              </p>
            </div>

            <div className="faq-item">
              <h4>¿Qué documentos necesito para vender?</h4>
              <p>
                Te ayudamos con toda la documentación necesaria: escrituras, certificados energéticos, 
                cédula de habitabilidad, y todos los trámites administrativos.
              </p>
            </div>

            <div className="faq-item">
              <h4>¿Atienden fines de semana?</h4>
              <p>
                Sí, atendemos los sábados por la mañana con cita previa. 
                Para emergencias, puedes contactarnos por WhatsApp o email en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}