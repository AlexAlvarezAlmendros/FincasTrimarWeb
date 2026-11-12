import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './ImageLightbox.css';

// Desplazamiento horizontal mínimo (px) para contar como gesto de pasar foto
const SWIPE_THRESHOLD = 48;

/**
 * Visor de fotos a pantalla completa.
 * Teclado: ← → cambian de foto, Esc cierra. Táctil: deslizar a los lados.
 * Mientras está abierto, la página de fondo no se desplaza y el foco se queda
 * dentro; al cerrar vuelve al elemento que lo abrió.
 */
const ImageLightbox = ({ images, index, onIndexChange, onClose, altPrefix = 'Imagen' }) => {
  const [loaded, setLoaded] = useState(false);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const touchStartRef = useRef(null);
  const total = images.length;

  const go = useCallback((delta) => {
    if (total < 2) return;
    onIndexChange((index + delta + total) % total);
  }, [index, total, onIndexChange]);

  useEffect(() => {
    setLoaded(false);
  }, [index]);

  // Bloqueo del scroll de fondo y devolución del foco al cerrar
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab') {
        // El foco no sale del visor
        const focusable = dialogRef.current?.querySelectorAll('button');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [go, onClose]);

  // La foto siguiente se va descargando para que el cambio sea inmediato
  useEffect(() => {
    if (total < 2) return;
    const next = new Image();
    next.src = images[(index + 1) % total].url;
  }, [index, images, total]);

  const onTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (e) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  const current = images[index];
  if (!current) return null;

  return (
    <div
      className="image-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${altPrefix}: foto ${index + 1} de ${total}`}
      ref={dialogRef}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="image-lightbox__bar" onClick={(e) => e.stopPropagation()}>
        <span className="image-lightbox__counter" aria-live="polite">{index + 1} / {total}</span>
        <button
          type="button"
          className="image-lightbox__button"
          onClick={onClose}
          aria-label="Cerrar visor de fotos"
          ref={closeRef}
        >
          <FontAwesomeIcon icon="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </div>

      <div className="image-lightbox__stage">
        {!loaded && <div className="image-lightbox__spinner" aria-hidden="true" />}
        <img
          key={current.url}
          src={current.url}
          alt={`${altPrefix} - Imagen ${index + 1}`}
          className={`image-lightbox__image${loaded ? ' image-lightbox__image--loaded' : ''}`}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            className="image-lightbox__button image-lightbox__nav image-lightbox__nav--prev"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            aria-label="Foto anterior"
          >
            <FontAwesomeIcon icon="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="image-lightbox__button image-lightbox__nav image-lightbox__nav--next"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            aria-label="Foto siguiente"
          >
            <FontAwesomeIcon icon="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
};

ImageLightbox.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape({ url: PropTypes.string.isRequired })).isRequired,
  index: PropTypes.number.isRequired,
  onIndexChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  altPrefix: PropTypes.string,
};

export default ImageLightbox;
