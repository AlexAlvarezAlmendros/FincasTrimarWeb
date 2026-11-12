import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropertyCard from '../components/PropertyCard/PropertyCard';
import CustomSelect from '../components/CustomSelect/CustomSelect';
import LocationAutocomplete from '../components/LocationAutocomplete/LocationAutocomplete';
import SEO from '../components/SEO';
import { useViviendas } from '../hooks/useViviendas';
import { generateOrganizationSchema, generateSearchActionSchema, generateItemListSchema } from '../utils/structuredData';
import { EMPTY_FORM, TYPE_OPTIONS, searchParamsFromForm } from '../utils/propertyFilters';
import './Home.css';

const RECENT_COUNT = 6;

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState({ location: '', type: '', operation: 'Venta' });

  // Las viviendas más recientes
  const { viviendas, isLoading, isError, isSuccess, refreshViviendas } = useViviendas(
    { published: true, pageSize: RECENT_COUNT },
    { enableCache: true, autoFetch: true }
  );

  const setField = (field, value) => setSearch((prev) => ({ ...prev, [field]: value }));

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchParamsFromForm({ ...EMPTY_FORM, ...search }).toString();
    navigate(`/viviendas${query ? `?${query}` : ''}`);
  };

  // Datos estructurados para SEO
  const structuredData = [generateOrganizationSchema(), generateSearchActionSchema()];
  if (viviendas?.length > 0) structuredData.push(generateItemListSchema(viviendas));

  return (
    <div className="home">
      <SEO
        title="Inicio"
        description="Encuentra tu vivienda ideal en Igualada y alrededores. Fincas Trimar ofrece venta, compra y alquiler de pisos, casas y chalets. Propiedades actualizadas diariamente."
        keywords="inmobiliaria Igualada, venta pisos Igualada, alquiler casas Igualada, chalets venta Barcelona, comprar piso Anoia, Fincas Trimar"
        type="website"
        structuredData={structuredData}
      />

      {/* Hero con buscador */}
      <section className="home-hero">
        <div className="container home-hero__inner">
          <div className="home-hero__text">
            <h1 className="home-hero__title">La mejor forma de encontrar tu vivienda</h1>
            <p className="home-hero__subtitle">
              Ofrecemos el servicio completo de venta, <strong>compra o alquiler de tu vivienda</strong>
            </p>
          </div>

          <form className="home-search" onSubmit={handleSearch} aria-label="Buscador de viviendas">
            <div className="home-search__tabs">
              <div className="home-search__operations" role="group" aria-label="Tipo de operación">
                <button
                  type="button"
                  className={`home-search__tab${search.operation === 'Venta' ? ' home-search__tab--active' : ''}`}
                  aria-pressed={search.operation === 'Venta'}
                  onClick={() => setField('operation', 'Venta')}
                >
                  Compra
                </button>
                <button
                  type="button"
                  className={`home-search__tab${search.operation === 'Alquiler' ? ' home-search__tab--active' : ''}`}
                  aria-pressed={search.operation === 'Alquiler'}
                  onClick={() => setField('operation', 'Alquiler')}
                >
                  Alquiler
                </button>
              </div>
              <Link to="/vender" className="home-search__tab home-search__tab--link">
                Vender
                <FontAwesomeIcon icon="fa-solid fa-arrow-right" aria-hidden="true" />
              </Link>
            </div>

            <div className="home-search__fields">
              <div className="home-search__field">
                <FontAwesomeIcon icon="fa-solid fa-location-dot" className="home-search__icon" aria-hidden="true" />
                <LocationAutocomplete
                  value={search.location}
                  onChange={(value) => setField('location', value)}
                  placeholder="¿Dónde? Población o zona"
                />
              </div>

              <div className="home-search__field">
                <FontAwesomeIcon icon="fa-solid fa-house" className="home-search__icon" aria-hidden="true" />
                <CustomSelect
                  value={search.type}
                  onChange={(value) => setField('type', value)}
                  options={TYPE_OPTIONS}
                  placeholder="Todos los tipos"
                />
              </div>

              <button type="submit" className="home-search__submit">
                <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <span>Buscar</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Añadidas recientemente */}
      <section className="home-recent">
        <div className="container">
          <div className="home-section-header">
            <h2>Añadidas recientemente</h2>
            <Link to="/viviendas" className="home-view-all">
              Ver todo
              <FontAwesomeIcon icon="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>

          {(isLoading || (!isSuccess && !isError)) && (
            <div className="property-grid" aria-busy="true" aria-label="Cargando viviendas">
              {Array.from({ length: RECENT_COUNT }, (_, index) => (
                <div key={index} className="property-card-skeleton" aria-hidden="true" />
              ))}
            </div>
          )}

          {isError && (
            <div className="state-box state-box--error" role="alert">
              <p>No hemos podido cargar las viviendas. Comprueba tu conexión e inténtalo de nuevo.</p>
              <button type="button" onClick={() => refreshViviendas()} className="btn btn--primary">
                Reintentar
              </button>
            </div>
          )}

          {isSuccess && (
            viviendas.length > 0 ? (
              <div className="property-grid">
                {viviendas.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="state-box">
                <p>No hay viviendas disponibles en este momento.</p>
              </div>
            )
          )}

          {isSuccess && viviendas.length > 0 && (
            <div className="home-recent__more">
              <Link to="/viviendas" className="btn btn--secondary btn--lg">
                Ver todas las viviendas
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Banda «Vende tu inmueble» */}
      <section className="home-sell">
        <div className="container">
          <div className="home-sell__card">
            <div className="home-sell__text">
              <h2>Vende tu inmueble hoy mismo</h2>
              <p>Ofrecemos el mejor servicio para la venta de tu propiedad con garantías de éxito.</p>
              <Link to="/vender" className="btn btn--primary btn--lg">Contáctanos</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
