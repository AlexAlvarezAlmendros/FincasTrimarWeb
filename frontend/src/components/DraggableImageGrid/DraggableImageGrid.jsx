/**
 * Grid de imágenes con funcionalidad de drag and drop para reordenar
 */
import React, { useState, useCallback } from 'react';
import DraggableImageItem from '../DraggableImageItem';
import './DraggableImageGrid.css';

const DraggableImageGrid = ({
  images = [],
  onRemove,
  onReorder,
  isReadOnly = false,
  title = "Imágenes guardadas"
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = useCallback((index) => {
    setDraggedIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((index) => {
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((dropIndex) => {
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      // Crear nueva lista reordenada
      const newImages = [...images];
      const draggedItem = newImages[draggedIndex];
      
      // Remover el elemento arrastrado
      newImages.splice(draggedIndex, 1);
      
      // Insertar en la nueva posición
      newImages.splice(dropIndex, 0, draggedItem);
      
      // Actualizar el orden en el backend
      const reorderedImages = newImages.map((img, index) => ({
        ...img,
        orden: index + 1
      }));
      
      onReorder(reorderedImages);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, images, onReorder]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="draggable-image-grid">
      <div className="grid-header">
        <h4 className="grid-title">{title}</h4>
        <div className="grid-info">
          {images.length} imagen{images.length !== 1 ? 'es' : ''}
          {!isReadOnly && (
            <span className="drag-instructions">
              • Arrastra para reordenar
            </span>
          )}
        </div>
      </div>
      
      <div className="images-grid">
        {images.map((image, index) => (
          <DraggableImageItem
            key={image.id || index}
            image={image}
            index={index}
            onRemove={onRemove}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragging={draggedIndex === index}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>
      
      {/* Indicador visual de reordenamiento */}
      {draggedIndex !== null && (
        <div className="drag-feedback">
          <i className="fas fa-arrows-alt"></i>
          <span>Reordenando imagen {draggedIndex + 1}</span>
        </div>
      )}
    </div>
  );
};

export default DraggableImageGrid;