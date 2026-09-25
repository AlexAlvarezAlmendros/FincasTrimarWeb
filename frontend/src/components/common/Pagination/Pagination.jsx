import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Pagination.css';

// En móvil solo se muestra la página actual entre las elipsis: con sus vecinas
// la lista no cabe en una línea (entre 481 y ~560px con primera/última, que el
// CSS oculta a partir de 480px)
const NARROW_QUERY = '(max-width: 768px)';

const matchesNarrow = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(NARROW_QUERY).matches;

function useNarrowScreen() {
  const [narrow, setNarrow] = useState(matchesNarrow);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const query = window.matchMedia(NARROW_QUERY);
    const onChange = () => setNarrow(query.matches);
    onChange();
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

/**
 * Números de página a mostrar: siempre la primera y la última, la actual con
 * `siblings` vecinas a cada lado y elipsis ('…') donde se salta un tramo.
 * Ej. (página 6 de 12): [1, '…', 5, 6, 7, '…', 12]
 */
export const getPageItems = (page, totalPages, siblings = 1) => {
  if (totalPages <= 0) return [];
  const first = Math.max(2, page - siblings);
  const last = Math.min(totalPages - 1, page + siblings);
  const items = [1];

  // Un único número oculto se muestra tal cual: una elipsis no ahorra espacio
  if (first === 3) items.push(2);
  else if (first > 3) items.push('…');

  for (let p = first; p <= last; p++) items.push(p);

  if (last === totalPages - 2) items.push(totalPages - 1);
  else if (last < totalPages - 2) items.push('…');

  if (totalPages > 1) items.push(totalPages);
  return items;
};

/**
 * Paginación accesible y reutilizable: primera/anterior/siguiente/última,
 * números con elipsis, resumen «Mostrando X–Y de Z» y selector opcional de
 * tamaño de página. No pinta nada si no hay resultados.
 *
 * Los controles no disponibles (mientras carga, o anterior/siguiente en los
 * extremos) usan aria-disabled y no el atributo disabled: así el botón pulsado
 * con el teclado conserva el foco en lugar de mandarlo al <body>.
 */
export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemLabel = 'resultados',
  disabled = false,
  className = '',
}) {
  const narrow = useNarrowScreen();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= 0) return null;

  const current = Math.min(Math.max(1, page), totalPages);
  const from = (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, total);
  const isFirst = current <= 1;
  const isLast = current >= totalPages;
  // aria-disabled="true" o nada (un "false" explícito no aporta)
  const ariaDisabled = (unavailable) => (unavailable ? 'true' : undefined);

  const go = (target) => {
    if (disabled || target === current || target < 1 || target > totalPages) return;
    onPageChange(target);
  };

  const changePageSize = (e) => {
    // Mientras carga se ignora: el select controlado vuelve a su valor
    if (disabled) return;
    onPageSizeChange(Number(e.target.value));
  };

  return (
    <nav
      className={`pagination-ui${className ? ` ${className}` : ''}`}
      aria-label="Paginación"
    >
      <p className="pagination-ui__summary" aria-live="polite">
        Mostrando <strong>{from}–{to}</strong> de <strong>{total}</strong> {itemLabel}
      </p>

      {totalPages > 1 && (
        <ul className="pagination-ui__pages">
          <li>
            <button
              type="button"
              className="pagination-ui__btn"
              onClick={() => go(1)}
              aria-disabled={ariaDisabled(disabled || isFirst)}
              aria-label="Primera página"
            >
              <FontAwesomeIcon icon="angles-left" />
            </button>
          </li>
          <li>
            <button
              type="button"
              className="pagination-ui__btn"
              onClick={() => go(current - 1)}
              aria-disabled={ariaDisabled(disabled || isFirst)}
              aria-label="Página anterior"
            >
              <FontAwesomeIcon icon="angle-left" />
            </button>
          </li>

          {getPageItems(current, totalPages, narrow ? 0 : 1).map((item, index) =>
            item === '…' ? (
              <li key={`gap-${index}`} className="pagination-ui__gap" aria-hidden="true">…</li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  className={`pagination-ui__btn pagination-ui__btn--number${item === current ? ' pagination-ui__btn--active' : ''}`}
                  onClick={() => go(item)}
                  aria-disabled={ariaDisabled(disabled && item !== current)}
                  aria-label={`Página ${item}`}
                  aria-current={item === current ? 'page' : undefined}
                >
                  {item}
                </button>
              </li>
            )
          )}

          <li>
            <button
              type="button"
              className="pagination-ui__btn"
              onClick={() => go(current + 1)}
              aria-disabled={ariaDisabled(disabled || isLast)}
              aria-label="Página siguiente"
            >
              <FontAwesomeIcon icon="angle-right" />
            </button>
          </li>
          <li>
            <button
              type="button"
              className="pagination-ui__btn"
              onClick={() => go(totalPages)}
              aria-disabled={ariaDisabled(disabled || isLast)}
              aria-label="Última página"
            >
              <FontAwesomeIcon icon="angles-right" />
            </button>
          </li>
        </ul>
      )}

      {onPageSizeChange && (
        <label className="pagination-ui__size">
          <span>Por página</span>
          <select
            value={pageSize}
            onChange={changePageSize}
            aria-disabled={ariaDisabled(disabled)}
            className="pagination-ui__select"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </label>
      )}
    </nav>
  );
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  itemLabel: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
