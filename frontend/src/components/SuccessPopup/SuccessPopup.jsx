/**
 * Componente de popup de éxito para la creación de viviendas
 */
import { useEffect } from 'react';
import './SuccessPopup.css';

const SuccessPopup = ({ 
  isVisible, 
  onClose, 
  title = "¡Vivienda creada exitosamente!", 
  message = "La vivienda ha sido guardada correctamente y está lista para ser publicada.",
  autoClose = true,
  autoCloseDelay = 3000 
}) => {
  
  useEffect(() => {
    if (isVisible && autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="success-popup-overlay" onClick={onClose}>
      <div className="success-popup" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        
        <div className="success-content">
          <h3 className="success-title">{title}</h3>
          <p className="success-message">{message}</p>
        </div>
        
        <div className="success-actions">
          <button 
            type="button" 
            className="btn-success-close"
            onClick={onClose}
          >
            <i className="fas fa-plus"></i>
            Crear otra vivienda
          </button>
        </div>
        
        {autoClose && (
          <div className="success-progress">
            <div 
              className="success-progress-bar" 
              style={{ 
                animation: `progressFill ${autoCloseDelay}ms linear forwards` 
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessPopup;