import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const STORAGE_PREFIX = 'scroll:';
// Tiempo máximo esperando a que el contenido (que llega de la API) tenga altura
const RESTORE_TIMEOUT_MS = 2000;

const readPosition = (key) => {
  try {
    const value = Number(sessionStorage.getItem(STORAGE_PREFIX + key));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
};

const savePosition = (key, value) => {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, String(Math.round(value)));
  } catch {
    // Sin sessionStorage (modo privado estricto): no se recuerda la posición
  }
};

/**
 * Gestiona el scroll al navegar. Se incluye dentro de BrowserRouter.
 * - Al entrar en una página nueva: arriba del todo.
 * - Al volver con «atrás»/«adelante»: a donde se estaba (p. ej. al volver de
 *   una ficha al listado, se sigue en la misma tarjeta).
 */
const ScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const lastScrollRef = useRef(0);
  const previousPathRef = useRef(null);
  // La clave del historial se repite («default») en cada carga: se añade la URL
  const entryKey = `${location.key}|${location.pathname}${location.search}`;

  // El navegador no restaura bien en una SPA (el contenido aún no existe)
  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return undefined;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  // Se anota la posición mientras se navega por la página y se guarda al salir
  // (en la limpieza el DOM ya es el de la página siguiente: no se puede medir)
  useLayoutEffect(() => {
    lastScrollRef.current = window.scrollY;
    const onScroll = () => {
      lastScrollRef.current = window.scrollY;
    };
    const onPageHide = () => savePosition(entryKey, lastScrollRef.current);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', onPageHide);
      savePosition(entryKey, lastScrollRef.current);
    };
  }, [entryKey]);

  useLayoutEffect(() => {
    const pathChanged = previousPathRef.current !== location.pathname;
    previousPathRef.current = location.pathname;

    if (navigationType !== 'POP') {
      // Misma página con otros filtros: el scroll lo decide la propia página
      if (pathChanged) window.scrollTo(0, 0);
      return undefined;
    }

    const target = readPosition(entryKey);
    if (target <= 0) {
      if (pathChanged) window.scrollTo(0, 0);
      return undefined;
    }

    // Se reintenta hasta que la página tenga altura suficiente
    let frame;
    const startedAt = performance.now();
    const restore = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll >= target || performance.now() - startedAt > RESTORE_TIMEOUT_MS) {
        window.scrollTo(0, Math.min(target, Math.max(0, maxScroll)));
        return;
      }
      frame = requestAnimationFrame(restore);
    };
    restore();
    return () => cancelAnimationFrame(frame);
  }, [entryKey, location.pathname, navigationType]);

  return null;
};

export default ScrollToTop;
