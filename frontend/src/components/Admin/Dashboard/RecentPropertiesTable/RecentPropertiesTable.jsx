import React from 'react';
import { Link } from 'react-router-dom';
import './RecentPropertiesTable.css';

/**
 * Componente de tabla para mostrar propiedades recientes en el dashboard
 * @param {Array} properties - Array de propiedades a mostrar
 */
const RecentPropertiesTable = ({ properties }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { label: 'Disponible', class: 'status-published' },
      draft: { label: 'Borrador', class: 'status-draft' },
      pending: { label: 'Pendiente', class: 'status-pending' },
      sold: { label: 'Vendida', class: 'status-sold' },
      reserved: { label: 'Reservada', class: 'status-reserved' },
      pending_capture: { label: 'Pdte. Captar', class: 'status-capture' }
    };
    
    const config = statusConfig[status] || { label: status, class: 'status-default' };
    
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!properties || properties.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay propiedades recientes para mostrar</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Propiedad</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Visitas</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(property => (
            <tr key={property.id}>
              <td>
                <div className="property-info">
                  <h4 className="property-name">{property.name}</h4>
                  {property.location && (
                    <p className="property-location">{property.location}</p>
                  )}
                </div>
              </td>
              <td className="property-price">{formatPrice(property.price)}</td>
              <td>{getStatusBadge(property.status)}</td>
              <td className="property-views">{property.views}</td>
              <td className="property-date">{formatDate(property.createdAt)}</td>
              <td>
                <div className="table-actions">
                  <Link 
                    to={`/admin/viviendas/${property.id}`}
                    className="action-btn action-btn--sm"
                    title="Ver detalles"
                  >
                    👁️
                  </Link>
                  <Link 
                    to={`/admin/viviendas/${property.id}/edit`}
                    className="action-btn action-btn--sm"
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