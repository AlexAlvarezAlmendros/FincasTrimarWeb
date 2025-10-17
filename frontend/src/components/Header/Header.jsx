import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './Header.css';

/**
 * Header principal de la aplicación
 * Incluye navegación, logo y botones de autenticación
 */
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const auth0 = useAuth0();
  const { isAuthenticated, loginWithRedirect, logout, user, isLoading } = auth0;
  const location = useLocation();

  // Debug log para verificar que las funciones están disponibles
  console.log('🔍 Auth0 functions available:', {
    loginWithRedirect: typeof loginWithRedirect,
    logout: typeof logout,
    isAuthenticated,
    isLoading
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogin = () => {
    console.log('🔍 handleLogin called, loginWithRedirect type:', typeof loginWithRedirect);
    if (typeof loginWithRedirect === 'function') {
      loginWithRedirect();
    } else {
      console.error('❌ loginWithRedirect is not a function:', loginWithRedirect);
    }
  };

  const handleLogout = () => {
    logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
  };

  // Determinar si un enlace está activo
  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="header">
      <div className="header-container">
        
        {/* Logo y nombre */}
        <div className="header-brand">
          <Link to="/" className="brand-link" onClick={closeMobileMenu}>
            <div className="brand-icon">
              <img 
                  src="/img/logo.svg" 
                  alt="Fincas Trimar Logo" 
                  className="header-logo-image"
                />
            </div>
          </Link>
        </div>

        {/* Navegación principal - Desktop */}
        <nav className="header-nav desktop-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActiveLink('/') ? 'nav-link--active' : ''}`}
          >
            INICIO
          </Link>
          <Link 
            to="/viviendas" 
            className={`nav-link ${isActiveLink('/viviendas') ? 'nav-link--active' : ''}`}
          >
            VIVIENDAS
          </Link>
          <Link 
            to="/vender" 
            className={`nav-link ${isActiveLink('/vender') ? 'nav-link--active' : ''}`}
          >
            VENDER
          </Link>
          <Link 
            to="/contacto" 
            className={`nav-link ${isActiveLink('/contacto') ? 'nav-link--active' : ''}`}
          >
            CONTACTO
          </Link>
        </nav>

        {/* Botones de autenticación - Desktop */}
        <div className="header-auth desktop-auth">
          {isLoading ? (
            <div className="auth-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : isAuthenticated ? (
            <div className="auth-authenticated">
              {/* Botón crear vivienda para usuarios autenticados */}
              <Link to="/admin" className="btn btn--primary">
                Dashboard
              </Link>
              
              {/* Menú de usuario */}
              <div className="user-menu">
                <button 
                  onClick={handleLogout}
                  className="btn btn--secondary btn--logout"
                >
                  SALIR
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="btn btn--primary"
            >
              LOGIN
            </button>
          )}
        </div>

        {/* Botón menú móvil */}
        <button 
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'mobile-menu-toggle--open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Abrir menú de navegación"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Navegación móvil */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'mobile-nav--open' : ''}`}>
        <div className="mobile-nav-content">
          <Link 
            to="/" 
            className={`mobile-nav-link ${isActiveLink('/') ? 'mobile-nav-link--active' : ''}`}
            onClick={closeMobileMenu}
          >
            🏠 INICIO
          </Link>
          <Link 
            to="/viviendas" 
            className={`mobile-nav-link ${isActiveLink('/viviendas') ? 'mobile-nav-link--active' : ''}`}
            onClick={closeMobileMenu}
          >
            🏘️ VIVIENDAS
          </Link>
          <Link 
            to="/vender" 
            className={`mobile-nav-link ${isActiveLink('/vender') ? 'mobile-nav-link--active' : ''}`}
            onClick={closeMobileMenu}
          >
            💰 VENDER
          </Link>
          <Link 
            to="/contacto" 
            className={`mobile-nav-link ${isActiveLink('/contacto') ? 'mobile-nav-link--active' : ''}`}
            onClick={closeMobileMenu}
          >
            📞 CONTACTO
          </Link>

          {/* Botones de autenticación móvil */}
          <div className="mobile-auth">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/admin" 
                  className="btn btn--primary btn--full-width"
                  onClick={closeMobileMenu}
                >
                  ➕ CREAR VIVIENDA
                </Link>
                <div className="mobile-user-info">
                  <img 
                    src={user?.picture || '/default-avatar.png'} 
                    alt={user?.name || 'Usuario'} 
                    className="mobile-user-avatar"
                  />
                  <span className="mobile-user-name">{user?.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="btn btn--secondary btn--full-width"
                >
                  🚪 SALIR
                </button>
              </>
            ) : (
              <button 
                onClick={handleLogin}
                className="btn btn--primary btn--full-width"
              >
                🔑 LOGIN
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay para cerrar menú móvil */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-nav-overlay" 
          onClick={closeMobileMenu}
          aria-hidden="true"
        ></div>
      )}
    </header>
  );
};

export default Header;