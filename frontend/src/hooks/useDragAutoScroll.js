/**
 * useDragAutoScroll — auto-scroll vertical mientras dura un drag & drop HTML5 nativo.
 *
 * El navegador solo desplaza la página si el puntero toca los últimos ~20px de
 * la ventana, y arriba esa franja la tapa la cabecera sticky del admin: con
 * muchas imágenes era imposible llevar una al principio o al final del grid.
 *
 * - Posición del puntero: 'dragover' y 'dragenter' en document (fase de
 *   captura). Blink no lanza dragover en el movimiento que entra en otro
 *   elemento, solo dragenter; 'drag' se usa como refuerzo descartando el (0,0)
 *   de Firefox y las coordenadas fuera de la ventana.
 * - Zona activa = 15% de la franja visible (mín. 80px, máx. 180px), descontando
 *   la cabecera sticky/fixed (medida una vez al empezar); sobre la propia
 *   cabecera se usa la velocidad máxima.
 * - Velocidad cuadrática según la cercanía al borde, en px/s × dt (independiente
 *   de la tasa de refresco) y acumulando las fracciones de píxel.
 * - El bucle rAF solo corre dentro de la zona; con el puntero quieto sigue con
 *   la última posición y cualquier evento de drag lo reanuda.
 * - Se detiene en drop/dragend, al salir de la ventana y al desmontar. Si el nodo
 *   origen se desmonta, dragend no llega: un mousemove sin botones pulsados
 *   significa que el arrastre terminó y se avisa con onEnd.
 * - No llama a preventDefault (no convierte la página en zona de drop) ni
 *   escucha 'wheel'.
 */
import { useEffect, useRef } from 'react';

const DEFAULTS = {
  edgeRatio: 0.15, // zona activa: 15% de la altura visible…
  minEdge: 80, // …con un mínimo de 80px…
  maxEdge: 180, // …y un máximo de 180px
  minSpeed: 150, // px/s al entrar en la zona
  maxSpeed: 1500, // px/s pegado al borde (o sobre la cabecera)
  maxInsetRatio: 0.4, // una cabecera sticky nunca cuenta más del 40% de la franja
};

const SCROLLABLE = /(auto|scroll|overlay)/;
const POINTER_EVENTS = ['dragover', 'dragenter', 'drag'];

const isRootScroller = (el) =>
  el === document.scrollingElement || el === document.documentElement || el === document.body;

/** Ancestro con scroll vertical más cercano; si no hay, el scroller del documento. */
export function getScrollParent(node) {
  let el = node?.parentElement ?? null;
  while (el && el !== document.body && el !== document.documentElement) {
    const { overflowY } = window.getComputedStyle(el);
    if (SCROLLABLE.test(overflowY) && el.scrollHeight > el.clientHeight + 1) return el;
    el = el.parentElement;
  }
  return document.scrollingElement || document.documentElement;
}

/**
 * Franja vertical visible del scroller (coordenadas de viewport) sin las
 * cabeceras sticky/fixed que tapan su borde superior.
 */
function measureVisibleBand(scroller, anchorNode, opts) {
  let top = 0;
  let bottom = window.innerHeight;
  if (!isRootScroller(scroller)) {
    const rect = scroller.getBoundingClientRect();
    top = Math.max(top, rect.top);
    bottom = Math.min(bottom, rect.bottom);
  }
  if (bottom <= top) return { top, bottom };

  // Muestreo en la vertical del grid (así no cuenta una barra lateral fija)
  const anchor = anchorNode?.getBoundingClientRect();
  const x = anchor
    ? Math.min(Math.max(anchor.left + anchor.width / 2, 0), window.innerWidth - 1)
    : window.innerWidth / 2;
  const limit = top + (bottom - top) * opts.maxInsetRatio;
  let inset = top;
  document.elementsFromPoint(x, top + 1).forEach((el) => {
    const { position } = window.getComputedStyle(el);
    if (position !== 'sticky' && position !== 'fixed') return;
    const r = el.getBoundingClientRect();
    if (r.top <= top + 1 && r.bottom > inset && r.bottom <= limit) inset = r.bottom;
  });
  return { top: inset, bottom };
}

/** Velocidad con signo (px/s): negativa = hacia arriba, 0 = fuera de zona. */
export function computeVelocity(clientY, band, opts = DEFAULTS) {
  const height = band.bottom - band.top;
  if (height <= 0) return 0;
  const edge = Math.min(opts.maxEdge, Math.max(opts.minEdge, height * opts.edgeRatio), height / 3);
  let intensity = 0;
  if (clientY < band.top + edge) {
    intensity = -Math.min(1, (band.top + edge - clientY) / edge);
  } else if (clientY > band.bottom - edge) {
    intensity = Math.min(1, (clientY - (band.bottom - edge)) / edge);
  }
  if (intensity === 0) return 0;
  const magnitude = opts.minSpeed + (opts.maxSpeed - opts.minSpeed) * intensity * intensity;
  return Math.sign(intensity) * magnitude;
}

function canScroll(scroller, direction) {
  const max = scroller.scrollHeight - scroller.clientHeight;
  return direction < 0 ? scroller.scrollTop > 0 : scroller.scrollTop < max - 1;
}

/** Paso inmediato (sin animación aunque haya scroll-behavior: smooth). */
function scrollStep(scroller, step) {
  const target = isRootScroller(scroller) ? window : scroller;
  try {
    target.scrollBy({ top: step, behavior: 'instant' });
  } catch {
    // Motores sin 'instant' en ScrollBehavior lanzan TypeError
    target.scrollBy(0, step);
  }
}

/**
 * Núcleo sin React (testeable): start(nodoDelGrid) / destroy().
 * Callbacks opcionales: onEnd() cuando la red de seguridad detecta que el
 * arrastre terminó sin dragend; onScroll({x, y}) tras cada paso de scroll.
 */
export function createDragAutoScroller(options = {}) {
  const opts = { ...DEFAULTS, ...options };
  let scroller = null;
  let anchorNode = null;
  let band = null;
  let pointer = null;
  let rafId = 0;
  let lastTs = 0;
  let carry = 0;

  const velocityNow = () =>
    pointer === null || !scroller || !band ? 0 : computeVelocity(pointer.y, band, opts);

  const halt = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    lastTs = 0;
    carry = 0;
  };

  const frame = (ts) => {
    rafId = 0;
    const v = velocityNow();
    if (v === 0 || !canScroll(scroller, v)) {
      halt();
      return;
    }
    const dt = lastTs ? Math.min(ts - lastTs, 50) : 16;
    lastTs = ts;
    carry += (v * dt) / 1000;
    const step = Math.trunc(carry); // acumulamos fracciones para velocidades bajas
    if (step !== 0) {
      carry -= step;
      scrollStep(scroller, step);
      // Con el puntero quieto no llegan eventos: el grid puede recalcular el destino
      opts.onScroll?.(pointer);
    }
    rafId = requestAnimationFrame(frame);
  };

  const onPointer = (e) => {
    // Firefox da (0,0) en 'drag'; fuera de la ventana no hay nada que desplazar
    if (e.type === 'drag' && e.clientX === 0 && e.clientY === 0) return;
    if (e.clientY < 0 || e.clientY > window.innerHeight || e.clientX < 0 || e.clientX > window.innerWidth) return;
    pointer = { x: e.clientX, y: e.clientY };
    if (!rafId && velocityNow() !== 0) rafId = requestAnimationFrame(frame);
  };

  const stop = () => {
    pointer = null;
    halt();
  };

  // relatedTarget null ⇒ el puntero salió de la ventana. Si ocurriera entre
  // elementos (Safari antiguo), el siguiente evento de drag lo reanuda.
  const onDragLeave = (e) => {
    if (!e.relatedTarget) stop();
  };

  // Red de seguridad: durante un drag nativo no hay mousemove; uno sin botones
  // pulsados significa que el arrastre terminó sin que llegara dragend.
  const onMouseMove = (e) => {
    if (e.buttons !== 0) return;
    stop();
    opts.onEnd?.();
  };

  const onResize = () => {
    if (scroller) band = measureVisibleBand(scroller, anchorNode, opts);
  };

  return {
    start(fromNode) {
      anchorNode = fromNode ?? null;
      scroller = getScrollParent(fromNode);
      band = measureVisibleBand(scroller, anchorNode, opts);
      POINTER_EVENTS.forEach((type) => document.addEventListener(type, onPointer, true));
      document.addEventListener('dragleave', onDragLeave, true);
      document.addEventListener('drop', stop, true);
      document.addEventListener('dragend', stop, true);
      document.addEventListener('mousemove', onMouseMove, true);
      window.addEventListener('blur', stop);
      window.addEventListener('resize', onResize);
    },
    destroy() {
      POINTER_EVENTS.forEach((type) => document.removeEventListener(type, onPointer, true));
      document.removeEventListener('dragleave', onDragLeave, true);
      document.removeEventListener('drop', stop, true);
      document.removeEventListener('dragend', stop, true);
      document.removeEventListener('mousemove', onMouseMove, true);
      window.removeEventListener('blur', stop);
      window.removeEventListener('resize', onResize);
      stop();
      scroller = null;
      anchorNode = null;
      band = null;
    },
  };
}

/**
 * Hook: activa el auto-scroll mientras `active` sea true (p.ej. hay un arrastre
 * interno del grid en curso).
 * @param {React.RefObject<HTMLElement>} containerRef nodo del grid (para hallar el scroller)
 * @param {boolean} active
 * @param {object} [options] ver DEFAULTS, más onEnd() y onScroll({x, y})
 */
export function useDragAutoScroll(containerRef, active, options) {
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    if (!active) return undefined;
    const autoScroller = createDragAutoScroller({
      ...optionsRef.current,
      // Siempre la última versión de los callbacks del componente
      onEnd: () => optionsRef.current?.onEnd?.(),
      onScroll: (pointer) => optionsRef.current?.onScroll?.(pointer),
    });
    autoScroller.start(containerRef.current);
    return () => autoScroller.destroy();
  }, [active, containerRef]);
}

export default useDragAutoScroll;
