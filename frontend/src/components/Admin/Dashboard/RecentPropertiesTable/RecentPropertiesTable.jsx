import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../../../utils/formatters';
import './RecentPropertiesTable.css';

/**
 * Componente de tabla para mostrar propiedades recientes
 */
const RecentPropertiesTable = ({ properties = [] }) => {
  if (!properties || properties.length === 0) {
    return (
      <div className="empty-properties">
        <p>No hay propiedades recientes para mostrar</p>
      </div>
    );
  }

  return (
    <div className="recent-properties-table">
      <table className="properties-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.Id}>
              <td className="property-image-cell">
                {property.IMGURL && property.IMGURL.length > 0 ? (
                  <img 
                    src={property.IMGURL[0]} 
                    alt={property.Name}
                    className="property-thumbnail"
                  />
                ) : (
                  <div className="property-thumbnail-placeholder">
                    🏠
                  </div>
                )}
              </td>
              <td className="property-name-cell">
                <Link to={`/admin/viviendas/${property.Id}`} className="property-name-link">
                  {property.Name}
                </Link>
              </td>
              <td className="property-location-cell">
                {property.Poblacion || 'N/A'}
              </td>
              <td className="property-price-cell">
                <strong>{formatPrice(property.Price)}</strong>
              </td>
              <td className="property-status-cell">
                <span className={`status-badge status-${property.EstadoVenta?.toLowerCase()}`}>
                  {property.EstadoVenta || 'N/A'}
                </span>
              </td>
              <td className="property-actions-cell">
                <div className="action-buttons">
                  <Link 
                    to={`/viviendas/${property.Id}`} 
                    className="btn-icon"
                    title="Ver en página pública"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    👁️
                  </Link>
                  <Link 
                    to={`/admin/viviendas/${property.Id}/editar`} 
                    className="btn-icon"
                    title="Editar"
                  >
                    ✏️
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentPropertiesTable;