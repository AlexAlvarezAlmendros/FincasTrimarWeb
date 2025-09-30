import { Link } from 'react-router-dom';
import './NotFound.css';

/**
 * Página 404 - No encontrada
 */
const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="not-found-icon">
            🏠❓
          </div>
          
          <h1 className="not-found-title">
            404
          </h1>
          
          <h2 className="not-found-subtitle">
            Página no encontrada
          </h2>
          
          <p className="not-found-description">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          
          <div className="not-found-actions">
            <Link to="/" className="btn btn--primary">
              🏠 Ir al Inicio
            </Link>
            <Link to="/viviendas" className="btn btn--secondary">
              🏘️ Ver Viviendas
            </Link>
          </div>
          
          <div className="not-found-help">
            <p>¿Necesitas ayuda?</p>
            <Link to="/contacto" className="help-link">
              📞 Contáctanos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;