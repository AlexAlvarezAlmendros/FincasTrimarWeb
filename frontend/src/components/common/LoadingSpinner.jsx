import React from 'react';
import './LoadingSpinner.css';

/**
 * Componente de spinner de carga
 */
const LoadingSpinner = ({ size = 'medium', message }) => {
  return (
    <div className={`loading-spinner loading-spinner--${size}`}>
      <div className="loading-spinner__spinner"></div>
      {message && (
        <p className="loading-spinner__message">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;