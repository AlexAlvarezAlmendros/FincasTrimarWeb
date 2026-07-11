/**
 * Popup de carga (overlay bloqueante) construido sobre el Modal común.
 */
import Modal from '../common/Modal';
import './LoadingPopup.css';

const LoadingPopup = ({
  isVisible,
  title = 'Subiendo vivienda...',
  message = 'Por favor, espera mientras procesamos tu solicitud',
  progress = null,
}) => (
  <Modal isOpen={isVisible} closeOnOverlay={false} className="loading-popup" ariaLabel={title}>
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
      {progress !== null && <div className="loading-progress-text">{progress}%</div>}
    </div>

    <div className="loading-dots">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  </Modal>
);

export default LoadingPopup;