/**
 * Generadores de datos estructurados JSON-LD para Schema.org
 * Mejora el SEO y la presentación en resultados de búsqueda
 */

/**
 * Genera datos estructurados para la organización
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Fincas Trimar',
    description: 'Agencia inmobiliaria especializada en venta, compra y alquiler de viviendas en Igualada y comarca',
    url: window.location.origin,
    logo: `${window.location.origin}/img/logo.png`,
    image: `${window.location.origin}/img/og-default.jpg`,
    telephone: '+34615840273',
    email: 'info@fincastrimar.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Passeig de Verdaguer, 50',
      addressLocality: 'Igualada',
      addressRegion: 'Barcelona',
      postalCode: '08700',
      addressCountry: 'ES'
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 41.5789,
        longitude: 1.6175
      },
      geoRadius: '50000' // 50km
    },
    priceRange: '€€',
    sameAs: [
      // 'https://www.facebook.com/fincastrimar',
      // 'https://www.instagram.com/fincastrimar',
      // 'https://twitter.com/fincastrimar'
    ]
  };
};

/**
 * Genera datos estructurados para una propiedad individual
 */
export const generatePropertySchema = (property) => {
  if (!property) return null;

  const baseUrl = window.location.origin;
  const propertyUrl = `${baseUrl}/viviendas/${property.id}`;
  
  // Determinar tipo de propiedad según Schema.org
  const getPropertyType = (tipoVivienda) => {
    const typeMap = {
      'Piso': 'Apartment',
      'Casa': 'House',
      'Chalet': 'House',
      'Ático': 'Apartment',
      'Dúplex': 'Apartment',
      'Villa': 'House',
      'Masía': 'House',
      'Finca': 'House',
      'Loft': 'Apartment'
    };
    return typeMap[tipoVivienda] || 'Residence';
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': getPropertyType(property.tipoVivienda),
    name: property.name,
    description: property.shortDescription || property.description,
    url: propertyUrl,
    image: property.imagenes?.length > 0 
      ? property.imagenes.map(img => img.url)
      : [`${baseUrl}/img/placeholder-property.jpg`],
    
    // Información de ubicación
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.calle && property.numero 
        ? `${property.calle}, ${property.numero}`
        : property.calle || '',
      addressLocality: property.poblacion || '',
      addressRegion: property.provincia || '',
      addressCountry: 'ES'
    },

    // Características
    floorSize: property.squaredMeters ? {
      '@type': 'QuantitativeValue',
      value: property.squaredMeters,
      unitCode: 'MTK'
    } : undefined,

    numberOfRooms: property.rooms || undefined,
    numberOfBathroomsTotal: property.bathRooms || undefined,

    // Oferta de venta/alquiler
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'EUR',
      availability: property.estadoVenta === 'Disponible' 
        ? 'https://schema.org/InStock'
        : property.estadoVenta === 'Vendida'
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/PreOrder',
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: propertyUrl,
      seller: {
        '@type': 'RealEstateAgent',
        name: 'Fincas Trimar'
      }
    },

    // Características adicionales
    amenityFeature: generateAmenities(property.caracteristicas)
  };

  // Limpiar valores undefined
  return JSON.parse(JSON.stringify(schema));
};

/**
 * Genera características de la propiedad
 */
const generateAmenities = (caracteristicas) => {
  if (!caracteristicas || caracteristicas.length === 0) return undefined;

  const amenityMap = {
    'Ascensor': 'Elevator',
    'Garaje': 'Parking',
    'Piscina': 'Pool',
    'Jardín': 'Garden',
    'Terraza': 'Terrace',
    'Balcón': 'Balcony',
    'AireAcondicionado': 'AirConditioning',
    'Calefacción': 'Heating',
    'ArmariosEmpotrados': 'BuiltInWardrobe'
  };

  return caracteristicas.map(car => ({
    '@type': 'LocationFeatureSpecification',
    name: car,
    value: amenityMap[car] || car
  }));
};

/**
 * Genera breadcrumb para navegación
 */
export const generateBreadcrumbSchema = (items) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

/**
 * Genera esquema de búsqueda para el sitio
 */
export const generateSearchActionSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: window.location.origin,
    name: 'Fincas Trimar',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${window.location.origin}/viviendas?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
};

/**
 * Genera esquema de listado de propiedades
 */
export const generateItemListSchema = (properties) => {
  if (!properties || properties.length === 0) return null;

  const baseUrl = window.location.origin;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: properties.map((property, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${baseUrl}/viviendas/${property.id}`,
      name: property.name,
      image: property.imagenes?.[0]?.url || `${baseUrl}/img/placeholder-property.jpg`
    }))
  };
};

/**
 * Genera esquema para página de contacto
 */
export const generateContactPageSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contacto - Fincas Trimar',
    description: 'Contacta con Fincas Trimar para consultas sobre compra, venta o alquiler de viviendas',
    mainEntity: {
      '@type': 'RealEstateAgent',
      name: 'Fincas Trimar',
      telephone: '+34615840273',
      email: 'info@fincastrimar.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Passeig de Verdaguer, 50',
        addressLocality: 'Igualada',
        addressRegion: 'Barcelona',
        postalCode: '08700',
        addressCountry: 'ES'
      }
    }
  };
};

/**
 * Genera FAQ schema
 */
export const generateFAQSchema = (faqs) => {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};
