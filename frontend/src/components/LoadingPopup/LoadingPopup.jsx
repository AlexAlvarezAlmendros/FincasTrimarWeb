/**
 * Componente de popup de carga con indicador circular indeterminado
 */
import './LoadingPopup.css';

const LoadingPopup = ({ 
  isVisible, 
  title = "Subiendo vivienda...", 
  message = "Por favor, espera mientras procesamos tu solicitud",
  progress = null
}) => {
  
  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="loading-popup-overlay"
      onClick={(e) => e.preventDefault()}
      onKeyDown={(e) => e.preventDefault()}
    >
      <div className="loading-popup">
        <div className="loading-icon">
          <div className="loading-spinner">
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
          </div>
        </div>
        
        <div className="loading-content">
          <h3 className="loading-title">{title}</h3>
          <p className="loading-message">{message}</p>
          {progress !== null && (
            <div className="loading-progress-text">
              {progress}%
            </div>
          )}
        </div>
        
        <div className="loading-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPopup;