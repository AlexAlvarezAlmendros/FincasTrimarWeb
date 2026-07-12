/**
 * Popup de resultado tras guardar una vivienda.
 * variant="success" (por defecto) o "warning" (éxito parcial: p.ej. la vivienda
 * se guardó pero fallaron las imágenes). En "warning" no se autocierra y puede
 * mostrar un botón de acción (p.ej. reintentar la subida).
 */
import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from '../common/Modal';
import Button from '../common/Button';
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

  return (
    <Modal
      isOpen={isVisible}
      onClose={onClose}
      className={`success-popup${isWarning ? ' success-popup--warning' : ''}`}
      ariaLabel={title}
    >
      <div className="success-icon">
        <FontAwesomeIcon icon={isWarning ? 'triangle-exclamation' : 'circle-check'} />
      </div>

      <div className="success-content">
        <h3 className="success-title">{title}</h3>
        <p className="success-message">{message}</p>
      </div>

      <div className="success-actions">
        {actionLabel && onAction && (
          <Button variant="draft" icon="rotate-right" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        <Button variant="primary" icon={isWarning ? undefined : 'plus'} onClick={onClose}>
          {isWarning ? 'Cerrar' : closeLabel}
        </Button>
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
    </Modal>
  );
};

export default SuccessPopup;
