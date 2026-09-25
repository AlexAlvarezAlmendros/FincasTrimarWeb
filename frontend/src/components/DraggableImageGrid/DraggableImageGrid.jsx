/**
 * Grid de imágenes guardadas reordenable: drag & drop nativo con auto-scroll,
 * indicador de posición de inserción y botones «mover» (teclado/táctil).
 *
 * El arrastre se identifica por id (no por índice): la lista puede cambiar
 * durante el arrastre (rollback de una reordenación fallida, borrado) y el
 * destino se recalcula en el propio drop.
 */
import { useState, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DraggableImageItem from '../DraggableImageItem';
import { useDragAutoScroll } from '../../hooks/useDragAutoScroll.js';
import { moveItem, getDropIndex, findDropTarget } from '../../utils/reorder.js';
import './DraggableImageGrid.css';

const ITEM_SELECTOR = '[data-image-id]';
const ID_ATTRIBUTE = 'data-image-id';

const sameTarget = (a, b) => a?.id === b?.id && a?.side === b?.side;

const DraggableImageGrid = ({
  images = [],
  onRemove,
  onReorder,
  isReadOnly = false,
  isSaving = false,
  title = 'Imágenes guardadas'
}) => {
  const [draggedId, setDraggedId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null); // { id, side: 'before' | 'after' }
  const [removingIds, setRemovingIds] = useState(() => new Set());
  const [announcement, setAnnouncement] = useState('');
  const gridRef = useRef(null);

  const indexOfId = useCallback(
    (id) => images.findIndex((img) => String(img.id) === String(id)),
    [images]
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
    if (from < 0 || from === to || to < 0 || to >= images.length) return false;
    const reordered = moveItem(images, from, to).map((img, i) => ({ ...img, orden: i + 1 }));
    // La reordenación es optimista y no bloquea; si falla, el gestor muestra el error
    Promise.resolve(onReorder?.(reordered)).catch(() => {});
    setAnnouncement(`Imagen movida a la posición ${to + 1} de ${images.length}`);
    return true;
  }, [images, onReorder]);

  // Botones mover: al reubicarse el nodo en el DOM se pierde el foco; lo devolvemos.
  const handleMove = useCallback((from, to, action) => {
    const id = images[from]?.id;
    if (id == null || !commitMove(from, to)) return;
    requestAnimationFrame(() => {
      const item = gridRef.current?.querySelector(`[${ID_ATTRIBUTE}="${CSS.escape(String(id))}"]`);
      const button = item?.querySelector(`[data-move="${action}"]:not(:disabled)`)
        || item?.querySelector('[data-move]:not(:disabled)');
      button?.focus();
    });
  }, [images, commitMove]);

  // El borrado deshabilita solo esa tarjeta (sin popup bloqueante)
  const handleRemove = useCallback(async (id) => {
    const key = String(id);
    setRemovingIds((prev) => new Set(prev).add(key));
    try {
      await onRemove?.(id);
    } catch {
      // El gestor de imágenes ya muestra el error
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, [onRemove]);

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

  if (!images || images.length === 0) {
    return null;
  }

  // No pintar indicador si soltar ahí no cambia nada (junto a la propia imagen)
  const targetIndex = dropTarget ? indexOfId(dropTarget.id) : -1;
  const effectiveTarget = draggedIndex >= 0 && targetIndex >= 0
    && getDropIndex(draggedIndex, targetIndex, dropTarget.side) !== draggedIndex
    ? dropTarget
    : null;

  return (
    <div className="draggable-image-grid">
      <div className="grid-header">
        <h4 className="grid-title">{title}</h4>
        <div className="grid-info">
          {images.length} imagen{images.length !== 1 ? 'es' : ''}
          {!isReadOnly && (
            <span className="drag-instructions">
              • Arrastra o usa las flechas para reordenar
            </span>
          )}
          {isSaving && (
            <span className="grid-saving" role="status">
              <FontAwesomeIcon icon="spinner" spin />
              Guardando orden…
            </span>
          )}
        </div>
      </div>

      <div
        ref={gridRef}
        className="images-grid"
        role="list"
        onDragEnter={isReadOnly ? undefined : handleGridDragOver}
        onDragOver={isReadOnly ? undefined : handleGridDragOver}
        onDragLeave={isReadOnly ? undefined : handleGridDragLeave}
        onDrop={isReadOnly ? undefined : handleGridDrop}
      >
        {images.map((image, index) => (
          <DraggableImageItem
            key={image.id ?? index}
            image={image}
            index={index}
            total={images.length}
            onRemove={handleRemove}
            onMove={handleMove}
            onDragStart={setDraggedId}
            onDragEnd={resetDrag}
            isDragging={draggedIndex === index}
            dropSide={effectiveTarget && String(effectiveTarget.id) === String(image.id) ? effectiveTarget.side : null}
            isRemoving={removingIds.has(String(image.id))}
            isReadOnly={isReadOnly}
          />
        ))}
      </div>

      <p className="sr-only" aria-live="polite">{announcement}</p>

      {/* Indicador visual de reordenamiento */}
      {draggedIndex >= 0 && (
        <div className="drag-feedback" aria-hidden="true">
          <FontAwesomeIcon icon="up-down-left-right" />
          <span>Reordenando imagen {draggedIndex + 1}</span>
        </div>
      )}
    </div>
  );
};

export default DraggableImageGrid;
