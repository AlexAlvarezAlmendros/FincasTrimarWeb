import React from 'react';
import './ErrorMessage.css';

/**
 * Componente de mensaje de error
 */
const ErrorMessage = ({ 
  message = 'Ha ocurrido un error', 
  onRetry, 
  retryText = 'Reintentar',
  type = 'error'
}) => {
  return (
    <div className={`error-message error-message--${type}`}>
      <div className="error-message__icon">
        {type === 'error' ? '⚠️' : 'ℹ️'}
      </div>
      
      <div className="error-message__content">
        <p className="error-message__text">{message}</p>
        
        {onRetry && (
          <button 
            className="error-message__retry"
            onClick={onRetry}
          >
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;