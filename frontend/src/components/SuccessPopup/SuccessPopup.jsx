/**
 * Popup de resultado tras guardar una vivienda.
 * variant="success" (por defecto) o "warning" (éxito parcial: p.ej. la vivienda
 * se guardó pero fallaron las imágenes). En "warning" no se autocierra y puede
 * mostrar un botón de acción (p.ej. reintentar la subida).
 */
import { useEffect } from 'react';
import './SuccessPopup.css';

const SuccessPopup = ({
  isVisible,
  onClose,
  title = '¡Vivienda creada exitosamente!',
  message = 'La vivienda ha sido guardada correctamente y está lista para ser publicada.',
  autoClose = true,
  autoCloseDelay = 3000,
  variant = 'success',
  actionLabel,
  onAction,
  closeLabel = 'Crear otra vivienda',
}) => {
  const isWarning = variant === 'warning';
  // Un éxito parcial nunca se autocierra: el usuario debe poder reaccionar.
  const effectiveAutoClose = autoClose && !isWarning;

  useEffect(() => {
    if (isVisible && effectiveAutoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, effectiveAutoClose, autoCloseDelay, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="success-popup-overlay" onClick={onClose}>
      <div
        className={`success-popup${isWarning ? ' success-popup--warning' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="success-icon">
          <i className={`fas ${isWarning ? 'fa-triangle-exclamation' : 'fa-check-circle'}`}></i>
        </div>

        <div className="success-content">
          <h3 className="success-title">{title}</h3>
          <p className="success-message">{message}</p>
        </div>

        <div className="success-actions">
          {actionLabel && onAction && (
            <button
              type="button"
              className="btn-success-action"
              onClick={onAction}
            >
              <i className="fas fa-rotate-right"></i>
              {actionLabel}
            </button>
          )}
          <button
            type="button"
            className="btn-success-close"
            onClick={onClose}
          >
            {!isWarning && <i className="fas fa-plus"></i>}
            {isWarning ? 'Cerrar' : closeLabel}
          </button>
        </div>

        {effectiveAutoClose && (
          <div className="success-progress">
            <div
              className="success-progress-bar"
              style={{
                animation: `progressFill ${autoCloseDelay}ms linear forwards`,
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessPopup;
