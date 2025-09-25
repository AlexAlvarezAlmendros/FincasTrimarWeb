/**
 * Componente PropertyCard
 * Sigue la nomenclatura PascalCase para componentes
 */
const PropertyCard = ({ property, onImageClick, onDetailsClick }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(property.images || []);
    }
  };

  const handleDetailsClick = () => {
    if (onDetailsClick) {
      onDetailsClick(property.id);
    }
  };

  return (
    <article className="property-card">
      <div className="property-card__image-container">
        <img 
          src={property.mainImage || '/placeholder-house.jpg'} 
          alt={property.name}
          className="property-card__image"
          onClick={handleImageClick}
          loading="lazy"
        />
        {property.images?.length > 1 && (
          <span className="property-card__image-count">
            Ver todas las imágenes
          </span>
        )}
      </div>
      
      <div className="property-card__content">
        <header className="property-card__header">
          <h3 className="property-card__title">{property.name}</h3>
          <p className="property-card__description">{property.shortDescription}</p>
        </header>
        
        <div className="property-card__specs">
          <div className="property-card__specs-grid">
            <span>{property.rooms} Habitaciones</span>
            <span>{property.garage} Garajes</span>
            <span>{property.squaredMeters} M²</span>
            <span>{property.bathrooms} Baños</span>
          </div>
        </div>
        
        <div className="property-card__tags">
          <span className="chip chip--green">{property.tipoInmueble}</span>
          <span className="chip chip--yellow">{property.tipoVivienda}</span>
          <span className="chip chip--purple">{property.tipoAnuncio}</span>
        </div>
        
        <footer className="property-card__footer">
          <button 
            className="property-card__price-btn"
            onClick={handleDetailsClick}
            aria-label={`Ver detalles de ${property.name}`}
          >
            <span className="property-card__price">
              {formatPrice(property.price)}
            </span>
          </button>
        </footer>
      </div>
    </article>
  );
};

export default PropertyCard;