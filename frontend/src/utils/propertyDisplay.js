/**
 * Textos e iconos para mostrar un inmueble en la web pública (tarjetas y ficha).
 * Traduce los valores internos del modelo (enums en PascalCase) a lo que lee
 * el visitante y decide qué datos tienen sentido para cada inmueble.
 */

const CARACTERISTICAS = {
  AireAcondicionado: { label: 'Aire acondicionado', icon: 'snowflake' },
  ArmariosEmpotrados: { label: 'Armarios empotrados', icon: 'door-open' },
  Ascensor: { label: 'Ascensor', icon: 'elevator' },
  Balcón: { label: 'Balcón', icon: 'sun' },
  Terraza: { label: 'Terraza', icon: 'sun' },
  Exterior: { label: 'Exterior', icon: 'sun' },
  Garaje: { label: 'Garaje', icon: 'car' },
  Jardín: { label: 'Jardín', icon: 'tree' },
  Piscina: { label: 'Piscina', icon: 'water-ladder' },
  Trastero: { label: 'Trastero', icon: 'box-archive' },
  ViviendaAccesible: { label: 'Vivienda accesible', icon: 'wheelchair' },
  VistasAlMar: { label: 'Vistas al mar', icon: 'mountain-sun' },
  ViviendaDeLujo: { label: 'Vivienda de lujo', icon: 'gem' },
  VistasAMontaña: { label: 'Vistas a la montaña', icon: 'mountain-sun' },
  FuegoATierra: { label: 'Chimenea', icon: 'fire' },
  Calefacción: { label: 'Calefacción', icon: 'fire' },
  Guardilla: { label: 'Buhardilla', icon: 'house' },
  CocinaOffice: { label: 'Cocina office', icon: 'utensils' },
};

const ESTADOS = {
  ObraNueva: 'Obra nueva',
  BuenEstado: 'Buen estado',
  AReformar: 'A reformar',
};

const PLANTAS = {
  UltimaPlanta: 'Última',
  PlantaIntermedia: 'Intermedia',
  Bajo: 'Baja',
};

const TIPOS_INMUEBLE = {
  ObraNueva: 'Obra nueva',
};

/** «AireAcondicionado» → «Aire acondicionado» para valores sin traducción propia. */
const humanize = (value) => {
  const words = String(value).replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const plural = (count, singular, pluralForm) => (count === 1 ? singular : pluralForm);

const hasPrice = (price) => Number.isFinite(Number(price)) && Number(price) > 0;

/** Precio sin decimales: «245.000 €». Sin precio: «Precio a consultar». */
export const formatPropertyPrice = (price) => {
  if (!hasPrice(price)) return 'Precio a consultar';
  return `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0, useGrouping: 'always' }).format(Number(price))} €`;
};

/** «/mes» en alquileres, para que el precio no se lea como precio de venta. */
export const getPriceSuffix = (property) =>
  property?.tipoAnuncio === 'Alquiler' && hasPrice(property?.price) ? '/mes' : '';

/** Texto del precio para lectores de pantalla. */
export const getPriceAriaLabel = (property) => {
  if (!hasPrice(property?.price)) return 'Precio a consultar';
  const amount = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(Number(property.price));
  return `Precio: ${amount} euros${getPriceSuffix(property) ? ' al mes' : ''}`;
};

/** Precio por metro cuadrado (solo en venta y con superficie). */
export const getPricePerMeter = (property) => {
  if (property?.tipoAnuncio === 'Alquiler') return null;
  if (!hasPrice(property?.price) || !(Number(property?.squaredMeters) > 0)) return null;
  const value = Math.round(Number(property.price) / Number(property.squaredMeters));
  return `${new Intl.NumberFormat('es-ES', { useGrouping: 'always' }).format(value)} €/m²`;
};

/** Ubicación legible, sin repetir la provincia si ya va en la población. */
export const getPropertyLocation = (property, { withStreet = false } = {}) => {
  if (!property) return '';
  const parts = [];
  if (withStreet && property.calle) {
    parts.push([property.calle, property.numero].filter(Boolean).join(', '));
  }
  if (property.poblacion) parts.push(property.poblacion);
  if (property.provincia && !parts.join(', ').toLowerCase().includes(property.provincia.toLowerCase())) {
    parts.push(property.provincia);
  }
  return parts.join(', ');
};

export const getTipoInmuebleLabel = (value) => (value ? TIPOS_INMUEBLE[value] || value : '');
export const getEstadoLabel = (value) => (value ? ESTADOS[value] || humanize(value) : '');
export const getPlantaLabel = (value) => (value ? PLANTAS[value] || humanize(value) : '');

/**
 * Datos principales con icono: habitaciones, baños, superficie y garaje.
 * Solo los que el inmueble tiene (un terreno no enseña «0 habitaciones»).
 */
export const getPropertySpecs = (property) => {
  if (!property) return [];
  const specs = [];
  const rooms = Number(property.rooms) || 0;
  const baths = Number(property.bathRooms) || 0;
  const meters = Number(property.squaredMeters) || 0;
  const garage = Number(property.garage) || 0;

  if (rooms > 0) {
    specs.push({ key: 'rooms', icon: 'bed', value: rooms, unit: 'hab.', label: plural(rooms, 'habitación', 'habitaciones') });
  }
  if (baths > 0) {
    specs.push({ key: 'baths', icon: 'bath', value: baths, unit: plural(baths, 'baño', 'baños'), label: plural(baths, 'baño', 'baños') });
  }
  if (meters > 0) {
    specs.push({ key: 'meters', icon: 'ruler-combined', value: new Intl.NumberFormat('es-ES').format(meters), unit: 'm²', label: 'metros cuadrados' });
  }
  if (garage > 0) {
    specs.push({ key: 'garage', icon: 'car', value: garage, unit: plural(garage, 'garaje', 'garajes'), label: plural(garage, 'plaza de garaje', 'plazas de garaje') });
  }
  return specs;
};

/**
 * Etiquetas de clasificación, sin huecos: tipo de inmueble (verde), tipo de
 * vivienda (amarillo) y operación (lila). En modo compacto se omite «Vivienda»
 * cuando ya se dice «Piso», «Casa»…
 */
export const getPropertyTags = (property, { compact = false } = {}) => {
  if (!property) return [];
  const tags = [];
  const tipoInmueble = getTipoInmuebleLabel(property.tipoInmueble);
  if (tipoInmueble && !(compact && property.tipoVivienda)) {
    tags.push({ key: 'inmueble', label: tipoInmueble, color: 'green' });
  }
  if (property.tipoVivienda) tags.push({ key: 'vivienda', label: property.tipoVivienda, color: 'yellow' });
  if (property.tipoAnuncio) tags.push({ key: 'anuncio', label: property.tipoAnuncio, color: 'purple' });
  return tags;
};

/** Estado comercial que el visitante debe ver sobre la foto (o nada). */
export const getSaleStatus = (property) => {
  if (property?.estadoVenta === 'Reservada') return { key: 'reserved', label: 'Reservada', icon: 'lock' };
  if (property?.estadoVenta === 'Vendida') return { key: 'sold', label: 'Vendida', icon: 'circle-check' };
  return null;
};

/** Características con nombre legible e icono. */
export const getPropertyFeatures = (property) => {
  const list = Array.isArray(property?.caracteristicas) ? property.caracteristicas : [];
  return list
    .map((item) => (typeof item === 'object' && item !== null ? item.name || item.caracteristica : item))
    .filter(Boolean)
    .map((value) => ({
      key: value,
      label: CARACTERISTICAS[value]?.label || humanize(value),
      icon: CARACTERISTICAS[value]?.icon || 'check',
    }));
};
