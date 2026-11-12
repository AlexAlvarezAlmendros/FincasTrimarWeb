import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import LocationAutocomplete from '../components/LocationAutocomplete/LocationAutocomplete';
import CustomSelect from '../components/CustomSelect/CustomSelect';
import Pagination from '../components/common/Pagination/Pagination';
import SEO from '../components/SEO';
import { useViviendas } from '../hooks/useViviendas';
import { generateItemListSchema, generateBreadcrumbSchema } from '../utils/structuredData';
import {
  BATHROOM_OPTIONS,
  EMPTY_FORM,
  ESTADO_OPTIONS,
  GARAGE_OPTIONS,
  OPERATION_OPTIONS,
  PAGE_SIZE,
  ROOM_OPTIONS,
  SORT_OPTIONS,
  TYPE_OPTIONS,
  apiFiltersFromForm,
  formFromSearchParams,
  getActiveFilters,
  pageFromSearchParams,
  searchParamsFromForm,
} from '../utils/propertyFilters';
import './Listado.css';

// Los campos de texto se aplican solos al dejar de escribir
const TYPING_DEBOUNCE_MS = 500;
// Filtros que no están en la barra principal (cuentan para el aviso de «Más filtros»)
const ADVANCED_FIELDS = ['operation', 'minPrice', 'maxPrice', 'rooms', 'bathrooms', 'garage', 'minMeters', 'estado'];

const onlyDigits = (value) => value.replace(/\D/g, '');

export default function Listado() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();

  // La URL manda: de ella salen los filtros aplicados y la página
  const applied = useMemo(() => formFromSearchParams(searchParams), [queryString]); // eslint-disable-line react-hooks/exhaustive-deps
  const page = pageFromSearchParams(searchParams);

  // Lo que se ve en los campos (puede ir un momento por delante de la URL al escribir)
  const [form, setForm] = useState(applied);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const typingTimeoutRef = useRef(null);
  const ownQueryRef = useRef(queryString);
  const resultsRef = useRef(null);

  const {
    viviendas,
    pagination,
    isLoading,
    isError,
    isSuccess,
    updateFilters,
    refreshViviendas,
  } = useViviendas(apiFiltersFromForm(applied, page), { enableCache: true, autoFetch: true });

  // Cambió la URL (filtro, página o «atrás» del navegador): se piden los datos
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    updateFilters(apiFiltersFromForm(applied, page), { merge: false, resetPagination: false });
    // Si el cambio no lo hizo este formulario (atrás/adelante), los campos se ponen al día
    if (ownQueryRef.current !== queryString) {
      ownQueryRef.current = queryString;
      setForm(applied);
    }
  }, [queryString]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(typingTimeoutRef.current), []);

  /** Lleva el formulario (y la página) a la URL. */
  const commit = (nextForm, nextPage = 1, { push = false } = {}) => {
    clearTimeout(typingTimeoutRef.current);
    const params = searchParamsFromForm(nextForm, nextPage);
    ownQueryRef.current = params.toString();
    // Cambiar un filtro no añade una entrada al historial; cambiar de página sí
    setSearchParams(params, { replace: !push });
  };

  /** Desplegables: se aplican al momento. */
  const setFieldNow = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    commit(next);
  };

  /** Campos de texto: se aplican al dejar de escribir. */
  const setFieldTyping = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => commit(next), TYPING_DEBOUNCE_MS);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    commit(form);
    setShowAdvanced(false);
  };

  const clearFilters = () => {
    const next = { ...EMPTY_FORM, sort: form.sort };
    setForm(next);
    commit(next);
  };

  const handlePageChange = (nextPage) => {
    commit(form, nextPage, { push: true });
    resultsRef.current?.scrollIntoView({ block: 'start' });
  };

  const activeFilters = getActiveFilters(applied);
  const advancedCount = ADVANCED_FIELDS.filter((field) => applied[field]).length;
  const loading = isLoading || (!isSuccess && !isError);
  const total = pagination.total || 0;

  const resultsSummary = total === 1 ? '1 inmueble' : `${total} inmuebles`;

  // SEO según los filtros aplicados
  const seoParts = [
    applied.type ? TYPE_OPTIONS.find((option) => option.value === applied.type)?.label : '',
    applied.operation ? `en ${applied.operation.toLowerCase()}` : '',
    applied.location ? `en ${applied.location}` : '',
  ].filter(Boolean);
  const seoTitle = seoParts.length > 0 ? seoParts.join(' ') : 'Todas las viviendas';
  const seoDescription = seoParts.length > 0
    ? `${seoParts.join(' ')}: ${total || 'varias'} propiedades disponibles en Fincas Trimar.`
    : `Explora nuestro catálogo completo de viviendas. ${total || 'Múltiples'} propiedades en venta y alquiler.`;
  const itemListSchema = viviendas?.length > 0 ? generateItemListSchema(viviendas) : null;

  return (
    <div className="listado">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={`${seoParts.join(', ')}, inmobiliaria, viviendas, pisos, casas, ${applied.location || 'Igualada'}`}
        type="website"
        structuredData={itemListSchema ? [
          itemListSchema,
          generateBreadcrumbSchema([
            { name: 'Inicio', url: window.location.origin },
            { name: 'Viviendas', url: window.location.href }
          ])
        ] : null}
      />

      {/* Filtros */}
      <section className="listado-filters" aria-label="Filtros de búsqueda">
        <div className="container">
          <form className="listado-filters__form" onSubmit={handleSubmit} aria-label="Buscador de viviendas">
            <div className="listado-filters__bar">
              <div className="listado-field listado-field--grow">
                <FontAwesomeIcon icon="fa-solid fa-location-dot" className="listado-field__icon" aria-hidden="true" />
                <LocationAutocomplete
                  value={form.location}
                  onChange={(value) => setFieldTyping('location', value)}
                  placeholder="Población o zona"
                />
              </div>

              <div className="listado-field">
                <CustomSelect
                  value={form.type}
                  onChange={(value) => setFieldNow('type', value)}
                  options={TYPE_OPTIONS}
                  placeholder="Todos los tipos"
                />
              </div>

              <button
                type="button"
                className={`listado-filters__toggle${showAdvanced ? ' listado-filters__toggle--open' : ''}`}
                onClick={() => setShowAdvanced((open) => !open)}
                aria-expanded={showAdvanced}
                aria-controls="filtros-avanzados"
              >
                <FontAwesomeIcon icon="fa-solid fa-sliders" aria-hidden="true" />
                <span>Más filtros</span>
                {advancedCount > 0 && (
                  <span className="listado-filters__count" aria-label={`${advancedCount} activos`}>
                    {advancedCount}
                  </span>
                )}
              </button>

              <button type="submit" className="listado-filters__submit">
                <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <span>Buscar</span>
              </button>
            </div>

            {showAdvanced && (
              <div className="listado-advanced" id="filtros-avanzados">
                <div className="listado-advanced__grid">
                  <div className="listado-advanced__item">
                    <span className="listado-advanced__label" id="filtro-operacion">Operación</span>
                    <div className="listado-field" aria-labelledby="filtro-operacion">
                      <CustomSelect
                        value={form.operation}
                        onChange={(value) => setFieldNow('operation', value)}
                        options={OPERATION_OPTIONS}
                      />
                    </div>
                  </div>

                  <div className="listado-advanced__item">
                    <label className="listado-advanced__label" htmlFor="filtro-precio-min">Precio mínimo</label>
                    <div className="listado-field">
                      <input
                        id="filtro-precio-min"
                        type="text"
                        inputMode="numeric"
                        placeholder="Sin mínimo"
                        value={form.minPrice}
                        onChange={(e) => setFieldTyping('minPrice', onlyDigits(e.target.value))}
                      />
                      <span className="listado-field__unit" aria-hidden="true">€</span>
                    </div>
                  </div>

                  <div className="listado-advanced__item">
                    <label className="listado-advanced__label" htmlFor="filtro-precio-max">Precio máximo</label>
                    <div className="listado-field">
                      <input
                        id="filtro-precio-max"
                        type="text"
                        inputMode="numeric"
                        placeholder="Sin máximo"
                        value={form.maxPrice}
                        onChange={(e) => setFieldTyping('maxPrice', onlyDigits(e.target.value))}
                      />
                      <span className="listado-field__unit" aria-hidden="true">€</span>
                    </div>
                  </div>

                  <div className="listado-advanced__item">
                    <span className="listado-advanced__label" id="filtro-habitaciones">Habitaciones</span>
                    <div className="listado-field" aria-labelledby="filtro-habitaciones">
                      <CustomSelect
                        value={form.rooms}
                        onChange={(value) => setFieldNow('rooms', value)}
                        options={ROOM_OPTIONS}
                      />
                    </div>
                  </div>

                  <div className="listado-advanced__item">
                    <span className="listado-advanced__label" id="filtro-banos">Baños</span>
                    <div className="listado-field" aria-labelledby="filtro-banos">
                      <CustomSelect
                        value={form.bathrooms}
                        onChange={(value) => setFieldNow('bathrooms', value)}
                        options={BATHROOM_OPTIONS}
                      />
                    </div>
                  </div>

                  <div className="listado-advanced__item">
                    <span className="listado-advanced__label" id="filtro-garaje">Garaje</span>
                    <div className="listado-field" aria-labelledby="filtro-garaje">
                      <CustomSelect
                        value={form.garage}
                        onChange={(value) => setFieldNow('garage', value)}
                        options={GARAGE_OPTIONS}
                      />
                    </div>
                  </div>

                  <div className="listado-advanced__item">
                    <label className="listado-advanced__label" htmlFor="filtro-metros">Superficie mínima</label>
                    <div className="listado-field">
                      <input
                        id="filtro-metros"
                        type="text"
                        inputMode="numeric"
                        placeholder="Sin mínimo"
                        value={form.minMeters}
                        onChange={(e) => setFieldTyping('minMeters', onlyDigits(e.target.value))}
                      />
                      <span className="listado-field__unit" aria-hidden="true">m²</span>
                    </div>
                  </div>

                  <div className="listado-advanced__item">
                    <span className="listado-advanced__label" id="filtro-estado">Estado</span>
                    <div className="listado-field" aria-labelledby="filtro-estado">
                      <CustomSelect
                        value={form.estado}
                        onChange={(value) => setFieldNow('estado', value)}
                        options={ESTADO_OPTIONS}
                      />
                    </div>
                  </div>
                </div>

                <div className="listado-advanced__actions">
                  <button type="button" className="btn btn--secondary" onClick={clearFilters}>
                    Limpiar filtros
                  </button>
                  <button type="submit" className="btn btn--primary">
                    {loading ? 'Ver resultados' : `Ver ${resultsSummary}`}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Resultados */}
      <section className="listado-results" ref={resultsRef}>
        <div className="container">
          <div className="listado-results__header">
            <div>
              <h1 className="listado-results__title">Viviendas disponibles</h1>
              <p className="listado-results__count" aria-live="polite">
                {loading ? 'Buscando…' : isError ? '' : (
                  total > 0
                    ? `${resultsSummary}${pagination.totalPages > 1 ? ` · Página ${pagination.page} de ${pagination.totalPages}` : ''}`
                    : 'Sin resultados'
                )}
              </p>
            </div>

            <label className="listado-sort">
              <span className="listado-sort__label">Ordenar por</span>
              <select
                className="listado-sort__select"
                value={form.sort}
                onChange={(e) => setFieldNow('sort', e.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          {activeFilters.length > 0 && (
            <ul className="listado-active" aria-label="Filtros aplicados">
              {activeFilters.map((filter) => (
                <li key={filter.field}>
                  <button
                    type="button"
                    className="listado-active__chip"
                    onClick={() => setFieldNow(filter.field, '')}
                    aria-label={`Quitar filtro ${filter.label}`}
                  >
                    {filter.label}
                    <FontAwesomeIcon icon="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </li>
              ))}
              {activeFilters.length > 1 && (
                <li>
                  <button type="button" className="listado-active__clear" onClick={clearFilters}>
                    Quitar todos
                  </button>
                </li>
              )}
            </ul>
          )}

          {isError ? (
            <div className="state-box state-box--error" role="alert">
              <h2>No hemos podido cargar las viviendas</h2>
              <p>Comprueba tu conexión e inténtalo de nuevo.</p>
              <button type="button" onClick={() => refreshViviendas()} className="btn btn--primary">
                Reintentar
              </button>
            </div>
          ) : loading ? (
            <div className="property-grid" aria-busy="true" aria-label="Cargando viviendas">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="property-card-skeleton" aria-hidden="true" />
              ))}
            </div>
          ) : viviendas.length === 0 ? (
            <div className="state-box">
              <h2>No hay inmuebles con estos filtros</h2>
              <p>
                {activeFilters.length > 0
                  ? 'Prueba a quitar algún filtro o a ampliar la zona de búsqueda.'
                  : 'Ahora mismo no hay inmuebles publicados. Vuelve pronto.'}
              </p>
              {activeFilters.length > 0 && (
                <button type="button" onClick={clearFilters} className="btn btn--primary">
                  Ver todos los inmuebles
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="property-grid">
                {viviendas.map((property) => (
                  <PropertyCard key={property.id} property={property} headingLevel="h2" />
                ))}
              </div>

              <Pagination
                className="listado-pagination"
                page={pagination.page}
                pageSize={pagination.pageSize || PAGE_SIZE}
                total={total}
                onPageChange={handlePageChange}
                itemLabel="inmuebles"
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
