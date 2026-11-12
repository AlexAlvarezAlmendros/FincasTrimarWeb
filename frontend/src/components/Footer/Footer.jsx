import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CONTACT } from '../../config/contact';
import './Footer.css';

/**
 * Pie de la web pública: quiénes somos, enlaces y contacto directo.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Información de la empresa */}
          <div className="footer-section footer-about">
            <Link to="/" className="footer-brand" aria-label="Finques Trimar, ir al inicio">
              <span className="footer-logo">
                <img
                  src="/img/logo.svg"
                  alt=""
                  className="footer-logo-image"
                  width="96"
                  height="68"
                  loading="lazy"
                />
              </span>
              <span className="footer-title">Finques Trimar</span>
            </Link>

            <p className="footer-description">
              Especialistas en gestión inmobiliaria con más de 20 años de experiencia.
              Te ayudamos a encontrar la vivienda perfecta o a vender tu propiedad
              de manera rápida y eficiente.
            </p>
          </div>

          {/* Enlaces útiles */}
          <nav className="footer-section footer-links" aria-label="Enlaces del pie">
            <h2 className="footer-section-title">Nuestra empresa</h2>
            <ul className="footer-nav">
              <li><Link to="/viviendas" className="footer-link">Buscar viviendas</Link></li>
              <li><Link to="/vender" className="footer-link">Vender inmueble</Link></li>
              <li><Link to="/contacto" className="footer-link">Contacto</Link></li>
            </ul>
          </nav>

          {/* Contacto */}
          <div className="footer-section footer-contact">
            <h2 className="footer-section-title">Contacto</h2>
            <ul className="footer-contact-info">
              <li className="contact-item">
                <FontAwesomeIcon icon="fa-solid fa-location-dot" className="contact-icon" aria-hidden="true" />
                <span className="contact-text">{CONTACT.location}</span>
              </li>
              <li className="contact-item">
                <FontAwesomeIcon icon="fa-solid fa-phone" className="contact-icon" aria-hidden="true" />
                <a href={CONTACT.phoneHref} className="contact-text">{CONTACT.phoneDisplay}</a>
              </li>
              <li className="contact-item">
                <FontAwesomeIcon icon="fa-brands fa-whatsapp" className="contact-icon" aria-hidden="true" />
                <a href={CONTACT.whatsappHref} className="contact-text" target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
              <li className="contact-item">
                <FontAwesomeIcon icon="fa-solid fa-envelope" className="contact-icon" aria-hidden="true" />
                <a href={`mailto:${CONTACT.email}`} className="contact-text">{CONTACT.email}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Pie de página */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>© {currentYear} Fincas Trimar. Todos los derechos reservados.</p>
            <p className="footer-author">
              Diseñado y Desarrollado por{' '}
              <a
                href="https://www.alexalvarez.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                alexalvarez.dev
              </a>
            </p>
          </div>

          <div className="footer-legal">
            <Link to="/politica-privacidad" className="legal-link">Política de Privacidad</Link>
            <Link to="/cookies" className="legal-link">Cookies</Link>
            <Link to="/terminos-uso" className="legal-link">Términos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
