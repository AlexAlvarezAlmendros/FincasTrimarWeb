import React, { useState } from 'react';
import './Contacto.css';

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
                <h3>Información de contacto</h3>
                
                <div className="contact-methods">
                  <div className="contact-method">
                    <div className="method-icon">📍</div>
                    <div className="method-content">
                      <h4>Oficina principal</h4>
                      <p>
                        Carrer Major, 123<br />
                        08700 Igualada, Barcelona<br />
                        España
                      </p>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">📞</div>
                    <div className="method-content">
                      <h4>Teléfono</h4>
                      <p>
                        <a href="tel:+34615840273">615 84 02 73</a><br />
                        <span className="method-note">Lunes a Viernes: 9:00 - 18:00</span>
                      </p>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">✉️</div>
                    <div className="method-content">
                      <h4>Email</h4>
                      <p>
                        <a href="mailto:info@fincastrimar.com">info@fincastrimar.com</a><br />
                        <span className="method-note">Respuesta en 24h</span>
                      </p>
                    </div>
                  </div>

                  <div className="contact-method">
                    <div className="method-icon">🕒</div>
                    <div className="method-content">
                      <h4>Horario de atención</h4>
                      <p>
                        Lunes a Viernes: 9:00 - 18:00<br />
                        Sábados: 10:00 - 14:00<br />
                        <span className="method-note">Citas concertadas</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="social-media">
                  <h4>Síguenos en redes sociales</h4>
                  <div className="social-links">
                    <a 
                      href="https://facebook.com/fincastrimar" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                      aria-label="Facebook"
                    >
                      📘 Facebook
                    </a>
                    <a 
                      href="https://instagram.com/fincastrimar" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                      aria-label="Instagram"
                    >
                      📷 Instagram
                    </a>
                    <a 
                      href="https://linkedin.com/company/fincastrimar" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="social-link"
                      aria-label="LinkedIn"
                    >
                      💼 LinkedIn
                    </a>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="map-container">
                <h3>Nuestra ubicación</h3>
                <div className="map">
                  <img 
                    src="/api/placeholder/400/300" 
                    alt="Mapa de ubicación de Fincas Trimar en Igualada"
                    className="map-image"
                  />
                  <div className="map-overlay">
                    <p>📍 Carrer Major, 123 - Igualada</p>
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