import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CaptacionPage.css';

// Estados de captación válidos según el modelo de datos
const CAPTACION_STATES = {
  PENDIENTE: 'Pendiente',
  CONTACTADA: 'Contactada', 
  CAPTADA: 'Captada',
  RECHAZADA: 'Rechazada'
};

/**
 * Componente de tarjeta de propiedad en captación
 * Muestra información detallada de una propiedad en proceso de captación
 * con opciones para ver, editar, modificar y eliminar
 */
const CaptacionPropertyCard = ({ 
  property, 
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(property.id);
    } catch (error) {
      console.error('Error al eliminar propiedad:', error);
      alert('Error al eliminar la propiedad. Por favor, intenta de nuevo.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStateColor = (estado) => {
    switch (estado) {
      case CAPTACION_STATES.PENDIENTE:
        return 'pending';
      case CAPTACION_STATES.CONTACTADA:
        return 'contacted';
      case CAPTACION_STATES.CAPTADA:
        return 'captured';
      case CAPTACION_STATES.RECHAZADA:
        return 'rejected';
      default:
        return 'pending';
    }
  };

  const getCommissionDisplay = (comision, porcentaje) => {
    if (comision && porcentaje) {
      return `${comision}% (${porcentaje}%)`;
    }
    if (comision) {
      return `${comision}%`;
    }
    return 'No definida';
  };

  return (
    <div className="captacion-card">
      {/* Header con estado y precio */}
      <div className="captacion-header-compact">
        <div className={`status-badge-compact status-${getStateColor(property.estadoVenta)}`}>
          {property.estadoVenta || CAPTACION_STATES.PENDIENTE}
        </div>
        <div className="price-badge-compact">
          {formatPrice(property.price)}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="captacion-content-compact">
        {/* Título y ubicación */}
        <div className="captacion-main-info-compact">
          <h3 className="captacion-title-compact" title={property.name}>
            {property.name}
          </h3>
          <div className="captacion-location-compact">
            <span className="location-icon">📍</span>
            <span>{property.poblacion}, {property.provincia}</span>
          </div>
        </div>

        {/* Tipo y Características en una fila */}
        <div className="captacion-info-row">
          <div className="captacion-type-badge-compact">
            {property.tipoVivienda}
          </div>
          
          <div className="captacion-features-compact">
            {property.rooms > 0 && (
              <span className="feature-compact" title="Habitaciones">
                🛏️ {property.rooms}
              </span>
            )}
            {property.bathRooms > 0 && (
              <span className="feature-compact" title="Baños">
                🚿 {property.bathRooms}
              </span>
            )}
            {property.squaredMeters > 0 && (
              <span className="feature-compact" title="Metros cuadrados">
                📐 {property.squaredMeters}m²
              </span>
            )}
            {property.garage > 0 && (
              <span className="feature-compact" title="Garaje">
                🚗 {property.garage}
              </span>
            )}
          </div>
        </div>

        {/* Información de captación en grid */}
        <div className="captacion-metadata-compact">
          <div className="metadata-compact">
            <span className="metadata-icon-compact">📅</span>
            <span className="metadata-value-compact">{formatDate(property.fechaCaptacion)}</span>
          </div>
          
          {property.captadoPor && (
            <div className="metadata-compact">
              <span className="metadata-icon-compact">👤</span>
              <span className="metadata-value-compact">{property.captadoPor}</span>
            </div>
          )}
          
          <div className="metadata-compact">
            <span className="metadata-icon-compact">💰</span>
            <span className="metadata-value-compact">
              {getCommissionDisplay(property.comisionGanada, property.porcentajeCaptacion)}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones compactas */}
      <div className="captacion-actions-compact">
        {property.urlReferencia ? (
          <a 
            href={property.urlReferencia}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn-compact action-btn-compact--view"
            title="Ver propiedad en portal externo"
          >
            👁️
          </a>
        ) : (
          <button
            disabled
            className="action-btn-compact action-btn-compact--view action-btn-compact--disabled"
            title="No hay URL disponible"
          >
            👁️
          </button>
        )}
        
        <button
          onClick={() => onEdit(property)}
          className="action-btn-compact action-btn-compact--edit"
          title="Editar datos de captación"
        >
          ✏️
        </button>

        <Link
          to={`/admin/viviendas/${property.id}/edit`}
          className="action-btn-compact action-btn-compact--publish"
          title="Modificar vivienda"
        >
          🏗️
        </Link>

        <button
          onClick={handleDeleteClick}
          className="action-btn-compact action-btn-compact--delete"
          title="Eliminar propiedad"
          disabled={isDeleting}
        >
          {isDeleting ? '⏳' : '🗑️'}
        </button>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="delete-confirm-overlay" onClick={handleCancelDelete}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-confirm-header">
              <span className="delete-confirm-icon">⚠️</span>
              <h3>¿Eliminar propiedad?</h3>
            </div>
            <div className="delete-confirm-content">
              <p>¿Estás seguro de que deseas eliminar esta propiedad?</p>
              <p className="delete-confirm-property-name">{property.name}</p>
              <p className="delete-confirm-warning">Esta acción no se puede deshacer.</p>
            </div>
            <div className="delete-confirm-actions">
              <button 
                onClick={handleCancelDelete}
                className="delete-confirm-btn delete-confirm-btn--cancel"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="delete-confirm-btn delete-confirm-btn--delete"
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptacionPropertyCard;
