import styles from './PropertyCard.module.css';

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

  const handleDetailsClick = (e) => {
    e.preventDefault();
    if (onDetailsClick) {
      onDetailsClick(property.id);
    }
  };

  const handleCardClick = (e) => {
    // Evitar navegación si se hace clic en la imagen (para galería)
    if (e.target.closest('.property-card__image-container')) {
      return;
    }
    handleDetailsClick(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDetailsClick(e);
    }
  };

  return (
    <article 
      className={styles.propertyCard} 
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalles de ${property.name}`}
    >
      <div className={styles.imageContainer}>
        <img 
          src={property.mainImage || '/placeholder-house.jpg'} 
          alt={property.name}
          className={styles.image}
          onClick={handleImageClick}
          loading="lazy"
        />
        {property.images?.length > 1 && (
          <span className={styles.imageCount}>
            Ver todas las imágenes
          </span>
        )}
      </div>
      
      <div className={styles.content}>
        <header>
          <h3 className={styles.title}>{property.name}</h3>
          <p className={styles.description}>{property.shortDescription}</p>
        </header>
        
        <div className={styles.specsGrid}>
          {property.rooms > 0 && <span>{property.rooms} Habitaciones</span>}
          {property.garage > 0 && <span>{property.garage} Garajes</span>}
          <span>{property.squaredMeters} M²</span>
          {property.bathRooms > 0 && <span>{property.bathRooms} Baños</span>}
        </div>
        
        <div className={styles.tags}>
          <span className={`${styles.chip} ${styles.chipGreen}`}>{property.tipoInmueble}</span>
          <span className={`${styles.chip} ${styles.chipYellow}`}>{property.tipoVivienda}</span>
          <span className={`${styles.chip} ${styles.chipPurple}`}>{property.tipoAnuncio}</span>
        </div>
        
        <footer className={styles.footer}>
          <button 
            className={styles.priceBtn}
            onClick={handleDetailsClick}
            aria-label={`Ver detalles de ${property.name}`}
          >
            <span className={styles.price}>
              {formatPrice(property.price)}
            </span>
          </button>
        </footer>
      </div>
    </article>
  );
};

export default PropertyCard;