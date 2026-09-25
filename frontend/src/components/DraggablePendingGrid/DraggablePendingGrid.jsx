/**
 * Archivos pendientes (aún no subidos) reordenables en memoria: drag & drop
 * nativo con auto-scroll, indicador de inserción y botones «mover».
 * El orden de este grid es el orden en que se subirán y asociarán las imágenes.
 */
import { useState, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDragAutoScroll } from '../../hooks/useDragAutoScroll.js';
import {
  PENDING_FILE_DRAG_TYPE,
  moveItem,
  getDropIndex,
  findDropTarget
} from '../../utils/reorder.js';
import './DraggablePendingGrid.css';

const ITEM_SELECTOR = '[data-file-id]';
const ID_ATTRIBUTE = 'data-file-id';

const sameTarget = (a, b) => a?.id === b?.id && a?.side === b?.side;

const DraggablePendingItem = ({
  file,
  index,
  total,
  onRemove,
  onMove,
  onDragStart,
  onDragEnd,
  isDragging,
  dropSide,
  hasSavedImages
}) => {
  const position = index + 1;
  const name = file.file?.name || file.name || 'Archivo sin nombre';

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    // Tipo propio: el <img> con URL blob: no se cuela en un campo del formulario
    e.dataTransfer.setData(PENDING_FILE_DRAG_TYPE, String(file.id));
    onDragStart(file.id);
  };

  const classes = [
    'draggable-pending-item',
    isDragging && 'dragging',
    dropSide && `drop-${dropSide}`
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      role="listitem"
      data-file-id={file.id}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="pending-image-container">
        <img src={file.preview} alt={name} className="pending-image" draggable={false} />
        <div className="pending-overlay">
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="btn-remove-pending"
            title="Eliminar archivo"
            aria-label={`Eliminar ${name}`}
          >
            <FontAwesomeIcon icon="trash" />
          </button>
        </div>

        {/* Imagen principal: solo si no hay guardadas (las nuevas se añaden detrás de ellas) */}
        {index === 0 && !hasSavedImages && (
          <div className="main-image-badge" title="Imagen principal">
            <FontAwesomeIcon icon="star" />
          </div>
        )}

        <div className="pending-info">
          <span className="pending-name">{name}</span>
          <span className="pending-size">
            {file.file?.size ? (file.file.size / 1024 / 1024).toFixed(2) : '0.00'} MB
          </span>
        </div>
      </div>

      <div className="pending-move-controls" role="group" aria-label={`Mover ${name}`}>
        <button
          type="button"
          className="btn-move"
          data-move="prev"
          onClick={() => onMove(index, index - 1, 'prev')}
          disabled={index === 0}
          title="Mover antes"
          aria-label={`Mover ${name} a la posición ${position - 1}`}
        >
          <FontAwesomeIcon icon="angle-left" />
        </button>
        {index > 0 && (
          <button
            type="button"
            className="btn-move"
            data-move="first"
            onClick={() => onMove(index, 0, 'first')}
            title={hasSavedImages ? 'Mover al principio de las pendientes' : 'Hacer principal'}
            aria-label={hasSavedImages
              ? `Mover ${name} al principio de las pendientes`
              : `Hacer principal ${name}`}
          >
            <FontAwesomeIcon icon={hasSavedImages ? 'angles-left' : 'star'} />
          </button>
        )}
        <button
          type="button"
          className="btn-move"
          data-move="next"
          onClick={() => onMove(index, index + 1, 'next')}
          disabled={index === total - 1}
          title="Mover después"
          aria-label={`Mover ${name} a la posición ${position + 1}`}
        >
          <FontAwesomeIcon icon="angle-right" />
        </button>
      </div>
    </div>
  );
};

/**
 * @param {boolean} hasSavedImages - La vivienda ya tiene imágenes guardadas: las
 *   pendientes se añadirán detrás de ellas, así que ninguna puede ser la principal.
 */
const DraggablePendingGrid = ({
  pendingFiles,
  onRemove,
  onReorder,
  hasSavedImages = false,
  title = 'Archivos seleccionados'
}) => {
  const [draggedId, setDraggedId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null); // { id, side: 'before' | 'after' }
  const [announcement, setAnnouncement] = useState('');
  const gridRef = useRef(null);

  const files = pendingFiles || [];
  const indexOfId = useCallback(
    (id) => files.findIndex((f) => String(f.id) === String(id)),
    [files]
  );

  const isDragActive = draggedId !== null;
  const draggedIndex = isDragActive ? indexOfId(draggedId) : -1;

  const resetDrag = useCallback(() => {
    setDraggedId(null);
    setDropTarget(null);
  }, []);

  const updateDropTarget = useCallback((next) => {
    setDropTarget((prev) => (sameTarget(prev, next) ? prev : next));
  }, []);

  useDragAutoScroll(gridRef, isDragActive, {
    onEnd: resetDrag,
    // El contenido se mueve bajo el puntero quieto: recalcular el destino indicado
    onScroll: ({ x, y }) => {
      const grid = gridRef.current;
      const el = document.elementFromPoint(x, y);
      updateDropTarget(grid && grid.contains(el)
        ? findDropTarget(grid, { target: el, clientX: x, clientY: y }, ITEM_SELECTOR, ID_ATTRIBUTE)
        : null);
    }
  });

  const commitMove = useCallback((from, to) => {
    if (from < 0 || from === to || to < 0 || to >= files.length) return false;
    onReorder(moveItem(files, from, to));
    setAnnouncement(`Imagen movida a la posición ${to + 1} de ${files.length}`);
    return true;
  }, [files, onReorder]);

  // Botones mover: al reubicarse el nodo en el DOM se pierde el foco; lo devolvemos.
  const handleMove = useCallback((from, to, action) => {
    const id = files[from]?.id;
    if (id == null || !commitMove(from, to)) return;
    requestAnimationFrame(() => {
      const item = gridRef.current?.querySelector(`[${ID_ATTRIBUTE}="${CSS.escape(String(id))}"]`);
      const button = item?.querySelector(`[data-move="${action}"]:not(:disabled)`)
        || item?.querySelector('[data-move]:not(:disabled)');
      button?.focus();
    });
  }, [files, commitMove]);

  // dragenter + dragover: Blink no lanza dragover al entrar en otro elemento.
  // Todo el contenedor es destino, también los huecos entre tarjetas.
  const handleGridDragOver = (e) => {
    if (!isDragActive) return; // ficheros del escritorio o arrastre del otro grid
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    updateDropTarget(findDropTarget(e.currentTarget, e, ITEM_SELECTOR, ID_ATTRIBUTE));
  };

  const handleGridDragLeave = (e) => {
    if (!isDragActive || e.currentTarget.contains(e.relatedTarget)) return;
    setDropTarget(null);
  };

  const handleGridDrop = (e) => {
    if (!isDragActive) return;
    e.preventDefault();
    // Destino desde el propio evento (el indicado pudo quedar desfasado por el auto-scroll)
    const target = findDropTarget(e.currentTarget, e, ITEM_SELECTOR, ID_ATTRIBUTE) || dropTarget;
    const from = indexOfId(draggedId);
    const targetIndex = target ? indexOfId(target.id) : -1;
    if (from >= 0 && targetIndex >= 0) {
      commitMove(from, getDropIndex(from, targetIndex, target.side));
    }
    resetDrag();
  };

  if (files.length === 0) {
    return null;
  }

  // No pintar indicador si soltar ahí no cambia nada (junto a la propia imagen)
  const targetIndex = dropTarget ? indexOfId(dropTarget.id) : -1;
  const effectiveTarget = draggedIndex >= 0 && targetIndex >= 0
    && getDropIndex(draggedIndex, targetIndex, dropTarget.side) !== draggedIndex
    ? dropTarget
    : null;

  return (
    <div className="draggable-pending-grid">
      <div className="pending-header">
        <h4 className="pending-title">
          <FontAwesomeIcon icon="images" />
          {title}
        </h4>
        <span className="pending-count">
          {files.length} archivo{files.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="pending-hint">
        <FontAwesomeIcon icon="hand-back-fist" />
        {hasSavedImages ? (
          <span>
            Se añadirán al final de las imágenes guardadas, en este orden (arrástralas o usa
            las flechas para cambiarlo). Para cambiar la imagen principal, usa
            {' '}<FontAwesomeIcon icon="star" /> «Hacer principal» en «Imágenes guardadas»
            cuando ya estén subidas.
          </span>
        ) : (
          <span>Arrastra las imágenes (o usa las flechas) para ordenarlas antes de subirlas</span>
        )}
      </div>

      <div
        ref={gridRef}
        className="pending-grid"
        role="list"
        onDragEnter={handleGridDragOver}
        onDragOver={handleGridDragOver}
        onDragLeave={handleGridDragLeave}
        onDrop={handleGridDrop}
      >
        {files.map((file, index) => (
          <DraggablePendingItem
            key={file.id}
            file={file}
            index={index}
            total={files.length}
            onRemove={onRemove}
            onMove={handleMove}
            onDragStart={setDraggedId}
            onDragEnd={resetDrag}
            isDragging={draggedIndex === index}
            dropSide={effectiveTarget && String(effectiveTarget.id) === String(file.id) ? effectiveTarget.side : null}
            hasSavedImages={hasSavedImages}
          />
        ))}
      </div>

      <p className="sr-only" aria-live="polite">{announcement}</p>
    </div>
  );
};

export default DraggablePendingGrid;
