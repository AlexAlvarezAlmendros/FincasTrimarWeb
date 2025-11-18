/**
 * Componente de imagen individual con capacidad de drag and drop
 */
import React, { useState } from 'react';
import './DraggableImageItem.css';

const DraggableImageItem = ({
  image,
  index,
  onRemove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  isReadOnly = false
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.parentNode);
    e.dataTransfer.setDragImage(e.target, 0, 0);
    onDragStart(index);
  };

  const handleDragEnd = (e) => {
    e.preventDefault();
    onDragEnd();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(true);
    onDragOver(index);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    onDrop(index);
  };

  return (
    <div 
      className={`draggable-image-item ${isDragging ? 'dragging' : ''} ${dragOver ? 'drag-over' : ''}`}
      draggable={!isReadOnly}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="image-preview">
        <img 
          src={image.url} 
          alt={`Imagen ${index + 1}`}
          onError={(e) => {
            e.target.src = '/img/placeholder-image.jpg';
          }}
        />
        
        {/* Overlay con controles */}
        <div className="image-overlay">
          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={() => onRemove(image.id)}
                className="btn-remove"
                title="Eliminar imagen"
              >
                <i className="fas fa-trash"></i>
              </button>
              
              <div className="drag-handle" title="Arrastra para reordenar">
                <i className="fas fa-grip-vertical"></i>
              </div>
            </>
          )}
        </div>
        
        {/* Indicador de imagen principal (primera imagen) */}
        {index === 0 && (
          <div className="main-image-badge" title="Imagen principal">
            <i className="fas fa-star"></i>
          </div>
        )}
        
        {/* Indicador de orden */}
        <div className="image-order-badge">
          {index + 1}
        </div>
      </div>
      
      <div className="image-info">
        <span className="image-title">Imagen {index + 1}</span>
        {!isReadOnly && (
          <span className="drag-hint">Arrastra para reordenar</span>
        )}
      </div>
    </div>
  );
};

export default DraggableImageItem;