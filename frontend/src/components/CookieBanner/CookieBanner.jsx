import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CookieBanner.css';

/**
 * Banner de consentimiento de cookies
 * Cumple con RGPD y normativas europeas
 */
const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Preferencias de cookies por categoría
  const [preferences, setPreferences] = useState({
    necessary: true, // Siempre activadas
    functional: false,
    analytics: false,
    marketing: false
  });

  // Verificar si el usuario ya dio su consentimiento
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Mostrar el banner después de un pequeño delay para mejor UX
      setTimeout(() => {
        setIsVisible(true);
      }, 1000);
    } else {
      // Cargar preferencias guardadas
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  // Guardar consentimiento
  const saveConsent = (prefs) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
    
    // Aplicar las preferencias (aquí puedes integrar con Google Analytics, etc.)
    applyPreferences(prefs);
  };

  // Aceptar todas las cookies
  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  // Rechazar cookies opcionales (solo necesarias)
  const rejectOptional = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    setPreferences(onlyNecessary);
    saveConsent(onlyNecessary);
  };

  // Guardar preferencias personalizadas
  const savePreferences = () => {
    saveConsent(preferences);
  };

  // Aplicar preferencias de cookies
  const applyPreferences = (prefs) => {
    // Aquí puedes integrar con servicios de terceros
    
    // Google Analytics
    if (prefs.analytics) {
      // Habilitar Google Analytics
      console.log('Analytics cookies enabled');
    } else {
      // Deshabilitar Google Analytics
      console.log('Analytics cookies disabled');
    }

    // Cookies de marketing
    if (prefs.marketing) {
      console.log('Marketing cookies enabled');
    } else {
      console.log('Marketing cookies disabled');
    }

    // Cookies funcionales
    if (prefs.functional) {
      console.log('Functional cookies enabled');
    } else {
      console.log('Functional cookies disabled');
    }
  };

  // Toggle de preferencias individuales
  const togglePreference = (category) => {
    if (category === 'necessary') return; // No se pueden desactivar
    
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay para modal de preferencias */}
      {showPreferences && (
        <div 
          className="cookie-overlay"
          onClick={() => setShowPreferences(false)}
          aria-hidden="true"
        />
      )}

      {/* Banner principal */}
      <div 
        className={`cookie-banner ${showPreferences ? 'with-preferences' : ''}`}
        role="dialog"
        aria-labelledby="cookie-banner-title"
        aria-describedby="cookie-banner-description"
      >
        {!showPreferences ? (
          // Vista simple del banner
          <div className="cookie-banner-simple">
            <div className="cookie-content">
              <div className="cookie-icon" aria-hidden="true">
                🍪
              </div>
              <div className="cookie-text">
                <h2 id="cookie-banner-title" className="cookie-title">
                  Usamos cookies
                </h2>
                <p id="cookie-banner-description" className="cookie-description">
                  Utilizamos cookies propias y de terceros para mejorar su experiencia de navegación, 
                  personalizar contenido y anuncios, y analizar nuestro tráfico. Al hacer clic en "Aceptar todas", 
                  acepta el uso de todas las cookies. Puede gestionar sus preferencias en cualquier momento.
                </p>
                <Link to="/cookies" className="cookie-policy-link">
                  Más información sobre cookies
                </Link>
              </div>
            </div>
            
            <div className="cookie-actions">
              <button
                onClick={rejectOptional}
                className="cookie-btn cookie-btn-secondary"
                type="button"
              >
                Solo necesarias
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="cookie-btn cookie-btn-outline"
                type="button"
              >
                Personalizar
              </button>
              <button
                onClick={acceptAll}
                className="cookie-btn cookie-btn-primary"
                type="button"
              >
                Aceptar todas
              </button>
            </div>
          </div>
        ) : (
          // Vista detallada de preferencias
          <div className="cookie-banner-detailed">
            <div className="cookie-preferences-header">
              <h2 className="cookie-title">Preferencias de cookies</h2>
              <button
                onClick={() => setShowPreferences(false)}
                className="cookie-close-btn"
                aria-label="Cerrar preferencias"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="cookie-preferences-content">
              <p className="cookie-preferences-intro">
                Utilizamos diferentes tipos de cookies para optimizar su experiencia en nuestro sitio web. 
                Haga clic en las categorías a continuación para obtener más información y cambiar nuestras 
                configuraciones predeterminadas. Sin embargo, el bloqueo de algunos tipos de cookies puede 
                afectar su experiencia en el sitio.
              </p>

              <div className="cookie-categories">
                {/* Cookies necesarias */}
                <div className="cookie-category">
                  <div className="cookie-category-header">
                    <div className="cookie-category-title-wrapper">
                      <h3 className="cookie-category-title">Cookies Estrictamente Necesarias</h3>
                      <span className="cookie-category-badge always-active">Siempre activas</span>
                    </div>
                    <label className="cookie-toggle">
                      <input
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled
                        aria-label="Cookies necesarias (siempre activas)"
                      />
                      <span className="cookie-toggle-slider disabled"></span>
                    </label>
                  </div>
                  <p className="cookie-category-description">
                    Estas cookies son esenciales para que el sitio web funcione correctamente. 
                    Sin estas cookies, el sitio web no funcionará adecuadamente.
                  </p>
                </div>

                {/* Cookies funcionales */}
                <div className="cookie-category">
                  <div className="cookie-category-header">
                    <h3 className="cookie-category-title">Cookies Funcionales</h3>
                    <label className="cookie-toggle">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={() => togglePreference('functional')}
                        aria-label="Cookies funcionales"
                      />
                      <span className="cookie-toggle-slider"></span>
                    </label>
                  </div>
                  <p className="cookie-category-description">
                    Estas cookies permiten que el sitio web recuerde las elecciones que realiza 
                    (como su nombre de usuario, idioma o región) y proporcionen características mejoradas.
                  </p>
                </div>

                {/* Cookies de análisis */}
                <div className="cookie-category">
                  <div className="cookie-category-header">
                    <h3 className="cookie-category-title">Cookies de Análisis</h3>
                    <label className="cookie-toggle">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={() => togglePreference('analytics')}
                        aria-label="Cookies de análisis"
                      />
                      <span className="cookie-toggle-slider"></span>
                    </label>
                  </div>
                  <p className="cookie-category-description">
                    Estas cookies nos ayudan a entender cómo los visitantes interactúan con el sitio web, 
                    recopilando y reportando información de forma anónima.
                  </p>
                </div>

                {/* Cookies de marketing */}
                <div className="cookie-category">
                  <div className="cookie-category-header">
                    <h3 className="cookie-category-title">Cookies de Marketing</h3>
                    <label className="cookie-toggle">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={() => togglePreference('marketing')}
                        aria-label="Cookies de marketing"
                      />
                      <span className="cookie-toggle-slider"></span>
                    </label>
                  </div>
                  <p className="cookie-category-description">
                    Estas cookies se utilizan para mostrarle anuncios relevantes y personalizar 
                    el contenido según sus intereses.
                  </p>
                </div>
              </div>
            </div>

            <div className="cookie-preferences-actions">
              <button
                onClick={rejectOptional}
                className="cookie-btn cookie-btn-secondary"
                type="button"
              >
                Solo necesarias
              </button>
              <button
                onClick={savePreferences}
                className="cookie-btn cookie-btn-primary"
                type="button"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CookieBanner;
