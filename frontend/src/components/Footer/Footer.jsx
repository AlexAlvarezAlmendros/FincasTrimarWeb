import { Link } from 'react-router-dom';
import { useState } from 'react';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
/**
 * Footer principal de la aplicación
 * Incluye información de la empresa, enlaces útiles y newsletter
 */
const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // TODO: Integrar con API de newsletter
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulación
      
      setSubmitMessage('¡Gracias! Te has suscrito correctamente.');
      setEmail('');
    } catch (error) {
      setSubmitMessage('Error al suscribirse. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Sección principal del footer */}
        <div className="footer-content">
          
          {/* Información de la empresa */}
          <div className="footer-section footer-about">
            <div className="footer-brand">
              <div className="footer-logo">
                <img 
                  src="./img/logo.svg" 
                  alt="Fincas Trimar Logo" 
                  className="footer-logo-image"
                />
              </div>
              <h3 className="footer-title">Finques Trimar</h3>
            </div>
            
            <p className="footer-description">
              Especialistas en gestión inmobiliaria con más de 20 años de experiencia. 
              Te ayudamos a encontrar la vivienda perfecta o a vender tu propiedad 
              de manera rápida y eficiente.
            </p>
            
          </div>

          {/* Enlaces útiles */}
          <div className="footer-section footer-links">
            <h4 className="footer-section-title">Nuestra Empresa</h4>
            <ul className="footer-nav">
              <li>
                <Link to="/viviendas" className="footer-link">
                  Buscar Viviendas
                </Link>
              </li>
              <li>
                <Link to="/vender" className="footer-link">
                  Vender Inmueble
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="footer-link">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/sobre-nosotros" className="footer-link">
                  Sobre Nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section footer-newsletter">
            <h4 className="footer-section-title">Suscríbete</h4>
            <p className="newsletter-description">
              Recibe las últimas novedades del mercado inmobiliario y nuestras mejores ofertas.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <div className="newsletter-input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu email"
                  className="newsletter-input"
                  required
                  disabled={isSubmitting}
                />
                <button 
                  type="submit" 
                  className={`newsletter-button ${isSubmitting ? 'newsletter-button--loading' : ''}`}
                  disabled={isSubmitting}
                  aria-label="Suscribirse al newsletter"
                >
                  {isSubmitting ? <FontAwesomeIcon icon="fa-solid fa-spinner" spin /> : <FontAwesomeIcon icon="fa-solid fa-envelope" />}
                </button>
              </div>
              
              {submitMessage && (
                <div className={`newsletter-message ${submitMessage.includes('Error') ? 'newsletter-message--error' : 'newsletter-message--success'}`}>
                  {submitMessage}
                </div>
              )}
            </form>
            
            <div className="footer-contact-info">
              <div className="contact-item">
                <span className="contact-icon"><FontAwesomeIcon icon="fa-solid fa-map-marker-alt" /></span>
                <span className="contact-text">Igualada, Barcelona</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon"><FontAwesomeIcon icon="fa-solid fa-phone" /></span>
                <a href="tel:+34615840273" className="contact-text">
                  615 84 02 73
                </a>
              </div>
              <div className="contact-item">
                <span className="contact-icon"><FontAwesomeIcon icon="fa-solid fa-envelope" /></span>
                <a href="mailto:info@fincastrimar.com" className="contact-text">
                  info@fincastrimar.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Línea separadora */}
        <div className="footer-divider"></div>

        {/* Pie de página */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>
              © {currentYear} Fincas Trimar. Todos los derechos reservados.
            </p>
          </div>
          
          <div className="footer-legal">
            <Link to="/privacidad" className="legal-link">
              Política de Privacidad
            </Link>
            <Link to="/cookies" className="legal-link">
              Cookies
            </Link>
            <Link to="/terminos" className="legal-link">
              Términos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;