/**
 * Utilidades para reordenar listas (drag & drop nativo y botones «mover»).
 * Las funciones de listas son puras; las de destino de drop solo leen el DOM.
 */

// Tipos MIME propios de los arrastres internos. Firefox exige un setData() para
// iniciar el drag y, al no ser text/plain ni text/html, soltar sobre un input o
// sobre el editor de la descripción no inserta nada.
export const SAVED_IMAGE_DRAG_TYPE = 'application/x-fincas-saved-image';
export const PENDING_FILE_DRAG_TYPE = 'application/x-fincas-pending-file';
const INTERNAL_DRAG_PREFIX = 'application/x-fincas-';

const dragTypes = (event) => Array.from(event?.dataTransfer?.types || []);

/** Arrastre de ficheros del sistema (y no una reordenación interna). */
export const isFileDrag = (event) => {
  const types = dragTypes(event);
  return types.includes('Files') && !types.some((type) => type.startsWith(INTERNAL_DRAG_PREFIX));
};

/** Devuelve una copia de `list` con el elemento `from` movido a la posición `to`. */
export const moveItem = (list, from, to) => {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/** Índice final al soltar el elemento `from` antes/después del elemento `target`. */
export const getDropIndex = (from, target, side) => {
  let to = side === 'after' ? target + 1 : target;
  if (from < to) to -= 1;
  return to;
};

/** Lado de inserción según la mitad horizontal del elemento (el grid se llena por filas). */
export const getDropSide = (element, clientX) => {
  const rect = element.getBoundingClientRect();
  return clientX < rect.left + rect.width / 2 ? 'before' : 'after';
};

/**
 * Tarjeta destino para un punto del grid: la que está bajo el puntero o, si el
 * puntero está en un hueco, la más cercana de su misma fila. Así, en la celda
 * vacía a la derecha de la última tarjeta (última fila incompleta) se suelta
 * después de esa tarjeta y no en la fila de arriba.
 * @returns {{ id: string, side: 'before' | 'after' } | null}
 */
export const findDropTarget = (container, { target, clientX, clientY }, itemSelector, idAttribute) => {
  if (!container) return null;
  let item = target instanceof Element ? target.closest(itemSelector) : null;
  if (item && !container.contains(item)) item = null;

  if (!item) {
    const rects = Array.from(container.querySelectorAll(itemSelector), (el) => ({
      el,
      r: el.getBoundingClientRect()
    }));
    const dxOf = (r) => Math.max(r.left - clientX, 0, clientX - r.right);
    const dyOf = (r) => Math.max(r.top - clientY, 0, clientY - r.bottom);

    // Prioridad a la fila cuya franja vertical contiene el puntero; solo en el
    // hueco entre filas se usa la distancia euclídea.
    const sameRow = rects.filter(({ r }) => r.top <= clientY && clientY <= r.bottom);
    const candidates = sameRow.length > 0 ? sameRow : rects;
    const distanceOf = sameRow.length > 0
      ? ({ r }) => dxOf(r)
      : ({ r }) => dxOf(r) ** 2 + dyOf(r) ** 2;

    let bestDistance = Infinity;
    candidates.forEach((candidate) => {
      const distance = distanceOf(candidate);
      if (distance < bestDistance) {
        bestDistance = distance;
        item = candidate.el;
      }
    });
  }

  const id = item?.getAttribute(idAttribute);
  return id ? { id, side: getDropSide(item, clientX) } : null;
};
