import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  formatPropertyPrice,
  getPriceAriaLabel,
  getPriceSuffix,
  getPropertyLocation,
  getPropertySpecs,
  getPropertyTags,
  getSaleStatus,
} from '../../utils/propertyDisplay';
import './PropertyCard.css';

/**
 * Tarjeta de inmueble para listados: foto, precio, título, ubicación y datos.
 * Toda la tarjeta es un enlace real a la ficha (se puede abrir en otra pestaña).
 */
const PropertyCard = ({ property, headingLevel = 'h3' }) => {
  const titleId = useId();
  const [imageFailed, setImageFailed] = useState(false);
  const Heading = headingLevel;

  const specs = getPropertySpecs(property);
  const tags = getPropertyTags(property, { compact: true });
  const status = getSaleStatus(property);
  const location = getPropertyLocation(property);
  const showImage = property.mainImage && !imageFailed;

  return (
    <article
      className={`property-card${status ? ` property-card--${status.key}` : ''}`}
      aria-labelledby={titleId}
    >
      <div className="property-card__media">
        {showImage ? (
          <img
            src={property.mainImage}
            alt=""
            className="property-card__image"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="property-card__placeholder" aria-hidden="true">
            <FontAwesomeIcon icon="fa-solid fa-house" />
            <span>Sin foto</span>
          </div>
        )}

        {status && (
          <span className="property-card__status" data-status={status.key}>
            <FontAwesomeIcon icon={`fa-solid fa-${status.icon}`} aria-hidden="true" />
            {status.label}
          </span>
        )}
      </div>

      <div className="property-card__body">
        <p className="property-card__price" aria-label={getPriceAriaLabel(property)}>
          {formatPropertyPrice(property.price)}
          {getPriceSuffix(property) && (
            <span className="property-card__price-suffix">{getPriceSuffix(property)}</span>
          )}
        </p>

        <Heading className="property-card__title" id={titleId}>
          <Link to={`/viviendas/${property.id}`} className="property-card__link">
            {property.name}
          </Link>
        </Heading>

        {location && (
          <p className="property-card__location">
            <FontAwesomeIcon icon="fa-solid fa-location-dot" aria-hidden="true" />
            <span>{location}</span>
          </p>
        )}

        {specs.length > 0 && (
          <ul className="property-card__specs">
            {specs.map((spec) => (
              <li key={spec.key} aria-label={`${spec.value} ${spec.label}`}>
                <FontAwesomeIcon icon={`fa-solid fa-${spec.icon}`} aria-hidden="true" />
                <span aria-hidden="true">
                  <strong>{spec.value}</strong> {spec.unit}
                </span>
              </li>
            ))}
          </ul>
        )}

        {tags.length > 0 && (
          <div className="property-card__tags">
            {tags.map((tag) => (
              <span key={tag.key} className={`chip chip--${tag.color}`}>{tag.label}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    price: PropTypes.number,
    mainImage: PropTypes.string,
  }).isRequired,
  headingLevel: PropTypes.oneOf(['h2', 'h3', 'h4']),
};

export default PropertyCard;
