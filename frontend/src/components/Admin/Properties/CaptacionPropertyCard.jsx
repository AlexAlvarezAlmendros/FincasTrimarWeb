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
      <div className="captacion-header">
        <div className="captacion-image">
          {property.mainImage ? (
            <img 
              src={property.mainImage} 
              alt={property.name}
              onError={(e) => {
                e.target.src = '/img/placeholder-house.jpg';
              }}
            />
          ) : (
            <div className="no-image">🏠</div>
          )}
        </div>
        
        <div className="captacion-info">
          <h3 className="captacion-title">{property.name}</h3>
          {property.shortDescription && (
            <p className="captacion-description">{property.shortDescription}</p>
          )}
          
          <div className="captacion-meta">
            <span className="captacion-type">{property.tipoVivienda}</span>
            <span className="captacion-location">{property.poblacion}, {property.provincia}</span>
            <span className="captacion-price">{formatPrice(property.price)}</span>
          </div>

          <div className="captacion-specs">
            {property.rooms > 0 && <span className="spec">🛏️ {property.rooms}</span>}
            {property.bathRooms > 0 && <span className="spec">🚿 {property.bathRooms}</span>}
            {property.garage > 0 && <span className="spec">🚗 {property.garage}</span>}
            {property.squaredMeters > 0 && <span className="spec">📐 {property.squaredMeters}m²</span>}
          </div>
        </div>
      </div>

      <div className="captacion-status">
        <div className="status-row">
          <span className="status-label">Estado:</span>
          <span className={`status-badge status-${getStateColor(property.estadoVenta)}`}>
            {property.estadoVenta || CAPTACION_STATES.PENDIENTE}
          </span>
        </div>
        
        <div className="captacion-details">
          <div className="detail-item">
            <span className="detail-label">Fecha captación:</span>
            <span className="detail-value">{formatDate(property.fechaCaptacion)}</span>
          </div>
          
          {property.captadoPor && (
            <div className="detail-item">
              <span className="detail-label">Captado por:</span>
              <span className="detail-value">{property.captadoPor}</span>
            </div>
          )}
          
          <div className="detail-item">
            <span className="detail-label">Comisión:</span>
            <span className="detail-value">
              {getCommissionDisplay(property.comisionGanada, property.porcentajeCaptacion)}
            </span>
          </div>
        </div>
      </div>

      <div className="captacion-actions">
        {property.urlReferencia ? (
          <a 
            href={property.urlReferencia}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn action-btn--view"
            title="Ver propiedad en portal externo"
          >
            👁️ Ver
          </a>
        ) : (
          <button
            disabled
            className="action-btn action-btn--view action-btn--disabled"
            title="No hay URL disponible"
          >
            👁️ Ver
          </button>
        )}
        
        <button
          onClick={() => onEdit(property)}
          className="action-btn action-btn--edit"
          title="Editar datos de captación"
        >
          ✏️ Editar
        </button>

        <Link
          to={`/admin/viviendas/${property.id}/edit`}
          className="action-btn action-btn--publish"
          title="Modificar vivienda (añadir más imágenes y completar datos)"
        >
          ✏️ Modificar
        </Link>

        <button
          onClick={handleDeleteClick}
          className="action-btn action-btn--delete"
          title="Eliminar propiedad"
          disabled={isDeleting}
        >
          {isDeleting ? '⏳' : '🗑️'} Eliminar
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
