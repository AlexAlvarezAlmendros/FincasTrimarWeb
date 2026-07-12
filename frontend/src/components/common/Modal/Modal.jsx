import React, { useEffect } from 'react';
import './Modal.css';

/**
 * Contenedor base de modal/overlay reutilizable (LoadingPopup, SuccessPopup…).
 * Overlay fijo + panel centrado con sombra y animación (respeta
 * prefers-reduced-motion). Cierra con Escape y clic en el overlay si onClose.
 */
const Modal = ({
  isOpen,
  onClose,
  closeOnOverlay = true,
  className = '',
  ariaLabel,
  children,
}) => {
  useEffect(() => {
    if (!isOpen || !onClose) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={closeOnOverlay && onClose ? onClose : undefined}
    >
      <div
        className={`modal-panel${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
