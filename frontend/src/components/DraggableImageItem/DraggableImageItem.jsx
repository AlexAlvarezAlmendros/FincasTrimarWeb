/**
 * Imagen guardada dentro del grid reordenable.
 * Drag & drop nativo + botones «mover» (teclado y táctil, donde el DnD HTML5 no
 * llega). El destino del drop lo resuelve el grid.
 */
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SAVED_IMAGE_DRAG_TYPE } from '../../utils/reorder.js';
import './DraggableImageItem.css';

const DraggableImageItem = ({
  image,
  index,
  total,
  onRemove,
  onMove,
  onDragStart,
  onDragEnd,
  isDragging = false,
  dropSide = null,
  isRemoving = false,
  isReadOnly = false
}) => {
  // URL que falló al cargar; si la imagen cambia de URL se vuelve a intentar
  const [failedUrl, setFailedUrl] = useState(null);
  const isBroken = failedUrl !== null && failedUrl === image.url;
  const position = index + 1;
  const canDrag = !isReadOnly && !isRemoving;

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    // Tipo propio: soltar sobre un campo del formulario no inserta nada
    e.dataTransfer.setData(SAVED_IMAGE_DRAG_TYPE, String(image.id));
    onDragStart(image.id);
  };

  const classes = [
    'draggable-image-item',
    isDragging && 'dragging',
    dropSide && `drop-${dropSide}`,
    isRemoving && 'removing'
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="listitem"
      data-image-id={image.id}
      draggable={canDrag}
      onDragStart={canDrag ? handleDragStart : undefined}
      onDragEnd={canDrag ? onDragEnd : undefined}
    >
      <div className="image-preview">
        {/* URL rota (caducada o de un servicio caído): aviso en lugar de otra
            imagen de reserva, que podría fallar a su vez y reintentarse sin fin */}
        {isBroken ? (
          <div className="image-broken" role="img" aria-label={`Imagen ${position} no disponible`}>
            <FontAwesomeIcon icon="images" />
            <span>Imagen no disponible</span>
          </div>
        ) : (
          // draggable=false: si no, el <img> aporta su URL/HTML al arrastre
          <img
            src={image.url}
            alt={`Imagen ${position}`}
            draggable={false}
            onError={() => setFailedUrl(image.url)}
          />
        )}

        {/* Overlay con controles: el asa en el centro y la papelera apartada en una esquina */}
        {!isReadOnly && (
          <div className="image-overlay">
            <div className="drag-handle" title="Arrastra para reordenar" aria-hidden="true">
              <FontAwesomeIcon icon="grip-vertical" />
            </div>
            <button
              type="button"
              onClick={() => onRemove(image.id)}
              className="btn-remove"
              disabled={isRemoving}
              title="Eliminar imagen"
              aria-label={`Eliminar imagen ${position}`}
            >
              <FontAwesomeIcon icon={isRemoving ? 'spinner' : 'trash'} spin={isRemoving} />
            </button>
          </div>
        )}

        {/* Indicador de imagen principal (primera imagen) */}
        {index === 0 && (
          <div className="main-image-badge" title="Imagen principal">
            <FontAwesomeIcon icon="star" />
          </div>
        )}

        {/* Indicador de orden */}
        <div className="image-order-badge">{position}</div>
      </div>

      <div className="image-info">
        <span className="image-title">Imagen {position}</span>
        {!isReadOnly && (
          <div className="image-move-controls" role="group" aria-label={`Mover imagen ${position}`}>
            <button
              type="button"
              className="btn-move"
              data-move="prev"
              onClick={() => onMove(index, index - 1, 'prev')}
              disabled={index === 0}
              title="Mover antes"
              aria-label={`Mover imagen ${position} a la posición ${position - 1}`}
            >
              <FontAwesomeIcon icon="angle-left" />
            </button>
            {index > 0 && (
              <button
                type="button"
                className="btn-move"
                data-move="first"
                onClick={() => onMove(index, 0, 'first')}
                title="Hacer principal"
                aria-label={`Hacer principal la imagen ${position}`}
              >
                <FontAwesomeIcon icon="star" />
              </button>
            )}
            <button
              type="button"
              className="btn-move"
              data-move="next"
              onClick={() => onMove(index, index + 1, 'next')}
              disabled={index === total - 1}
              title="Mover después"
              aria-label={`Mover imagen ${position} a la posición ${position + 1}`}
            >
              <FontAwesomeIcon icon="angle-right" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableImageItem;
