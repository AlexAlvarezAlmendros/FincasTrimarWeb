/**
 * Componente para reordenar archivos pendientes (no subidos aún) mediante drag & drop
 */
import { useState } from 'react';
import './DraggablePendingGrid.css';

const DraggablePendingItem = ({ file, index, onRemove, onDragStart, onDragEnd, onDragOver, onDrop, isDragging }) => {
  return (
    <div
      className={`draggable-pending-item ${isDragging ? 'dragging' : ''}`}
      draggable="true"
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className="pending-image-container">
        <img 
          src={file.preview} 
          alt={file.file?.name || file.name || 'Vista previa'}
          className="pending-image" 
        />
        <div className="pending-overlay">
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="btn-remove-pending"
            title="Eliminar archivo"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
        
        {/* Indicador de imagen principal (primera imagen) */}
        {index === 0 && (
          <div className="main-image-badge" title="Imagen principal">
            <i className="fas fa-star"></i>
          </div>
        )}
        
        <div className="pending-info">
          <span className="pending-name">{file.file?.name || file.name || 'Archivo sin nombre'}</span>
          <span className="pending-size">
            {file.file?.size ? (file.file.size / 1024 / 1024).toFixed(2) : '0.00'} MB
          </span>
        </div>
      </div>
    </div>
  );
};

const DraggablePendingGrid = ({ 
  pendingFiles, 
  onRemove, 
  onReorder, 
  title = "Archivos seleccionados" 
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newFiles = [...pendingFiles];
    const draggedFile = newFiles[draggedIndex];
    
    // Remover el elemento arrastrado
    newFiles.splice(draggedIndex, 1);
    
    // Insertarlo en la nueva posición
    newFiles.splice(dropIndex, 0, draggedFile);
    
    // Llamar a onReorder con el array completo reordenado
    onReorder(newFiles);
    setDraggedIndex(null);
  };

  if (!pendingFiles || pendingFiles.length === 0) {
    return null;
  }

  return (
    <div className="draggable-pending-grid">
      <div className="pending-header">
        <h4 className="pending-title">
          <i className="fas fa-images"></i>
          {title}
        </h4>
        <span className="pending-count">
          {pendingFiles.length} archivo{pendingFiles.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="pending-hint">
        <i className="fas fa-hand-rock"></i>
        Arrastra las imágenes para reordenarlas antes de subirlas
      </div>
      
      <div className="pending-grid">
        {pendingFiles.map((file, index) => (
          <DraggablePendingItem
            key={file.id}
            file={file}
            index={index}
            onRemove={onRemove}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragging={draggedIndex === index}
          />
        ))}
      </div>
    </div>
  );
};

export default DraggablePendingGrid;