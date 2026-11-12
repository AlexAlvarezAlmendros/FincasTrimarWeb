import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CONTACT } from '../../config/contact';
import './Header.css';

const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/viviendas', label: 'Viviendas' },
  { to: '/vender', label: 'Vender' },
  { to: '/contacto', label: 'Contacto' },
];

/**
 * Cabecera de la web pública: logo, navegación y contacto directo.
 * La acción principal es llamar a la agencia; el acceso de los agentes al
 * panel queda como un botón discreto.
 */
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, loginWithRedirect, logout, isLoading } = useAuth0();
  const location = useLocation();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // El menú se cierra al cambiar de página
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Con el menú abierto: Escape lo cierra y la página de fondo no se desplaza
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const handleLogin = () => loginWithRedirect();

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__brand" aria-label="Finques Trimar, ir al inicio">
          <img
            src="/img/logo.svg"
            alt=""
            className="site-header__logo"
            width="96"
            height="68"
          />
        </Link>

        {/* Navegación principal (escritorio) */}
        <nav className="site-nav" aria-label="Navegación principal">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <a
            href={CONTACT.phoneHref}
            className="btn btn--primary site-header__call"
            aria-label={`Llamar al ${CONTACT.phoneDisplay}`}
          >
            <FontAwesomeIcon icon="fa-solid fa-phone" aria-hidden="true" />
            <span className="site-header__call-number">{CONTACT.phoneDisplay}</span>
          </a>

          {/* Acceso al panel (escritorio) */}
          <div className="site-header__auth">
            {isLoading ? null : isAuthenticated ? (
              <>
                <Link to="/admin" className="btn btn--secondary">Panel</Link>
                <button type="button" onClick={handleLogout} className="btn btn--secondary">
                  Salir
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="site-header__agent"
                aria-label="Acceso para agentes"
                title="Acceso para agentes"
              >
                <FontAwesomeIcon icon="fa-solid fa-user" aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="button"
            className={`site-menu-toggle ${isMobileMenuOpen ? 'site-menu-toggle--open' : ''}`}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="menu-movil"
          >
            <span className="site-menu-toggle__line"></span>
            <span className="site-menu-toggle__line"></span>
            <span className="site-menu-toggle__line"></span>
          </button>
        </div>
      </div>

      {/* Navegación móvil */}
      <nav
        id="menu-movil"
        className={`site-mobile-nav ${isMobileMenuOpen ? 'site-mobile-nav--open' : ''}`}
        aria-label="Navegación principal"
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="site-mobile-nav__content">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `site-mobile-nav__link${isActive ? ' site-mobile-nav__link--active' : ''}`}
              onClick={closeMobileMenu}
              tabIndex={isMobileMenuOpen ? undefined : -1}
            >
              {label}
              <FontAwesomeIcon icon="fa-solid fa-chevron-right" aria-hidden="true" />
            </NavLink>
          ))}

          <div className="site-mobile-nav__contact">
            <a
              href={CONTACT.phoneHref}
              className="btn btn--primary"
              tabIndex={isMobileMenuOpen ? undefined : -1}
            >
              <FontAwesomeIcon icon="fa-solid fa-phone" aria-hidden="true" />
              Llamar
            </a>
            <a
              href={CONTACT.whatsappHref}
              className="btn btn--whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={isMobileMenuOpen ? undefined : -1}
            >
              <FontAwesomeIcon icon="fa-brands fa-whatsapp" aria-hidden="true" />
              WhatsApp
            </a>
          </div>

          <div className="site-mobile-nav__auth">
            {isAuthenticated ? (
              <>
                <Link
                  to="/admin"
                  className="site-mobile-nav__auth-link"
                  onClick={closeMobileMenu}
                  tabIndex={isMobileMenuOpen ? undefined : -1}
                >
                  Panel de administración
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="site-mobile-nav__auth-link"
                  tabIndex={isMobileMenuOpen ? undefined : -1}
                >
                  Salir
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="site-mobile-nav__auth-link"
                tabIndex={isMobileMenuOpen ? undefined : -1}
              >
                <FontAwesomeIcon icon="fa-solid fa-user" aria-hidden="true" />
                Acceso para agentes
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Fondo para cerrar el menú móvil */}
      {isMobileMenuOpen && (
        <div
          className="site-mobile-nav__overlay"
          onClick={closeMobileMenu}
          aria-hidden="true"
        ></div>
      )}
    </header>
  );
};

export default Header;
