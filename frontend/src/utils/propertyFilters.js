/**
 * Filtros de búsqueda de la web pública: opciones de los desplegables y
 * traducción entre la URL (?q=…&tipo=…), el formulario y los filtros de la API.
 *
 * La URL es la fuente de verdad: así una búsqueda se puede compartir, recargar
 * y recuperar con el botón «atrás» al volver de una ficha.
 */

export const PAGE_SIZE = 12;

/**
 * Un único desplegable «Tipo» para viviendas (Piso, Casa…) y para el resto de
 * inmuebles (Terreno, Local…). El prefijo indica a qué campo de la API va.
 */
export const TYPE_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'v:Piso', label: 'Piso' },
  { value: 'v:Casa', label: 'Casa' },
  { value: 'v:Chalet', label: 'Chalet' },
  { value: 'v:Ático', label: 'Ático' },
  { value: 'v:Dúplex', label: 'Dúplex' },
  { value: 'v:Loft', label: 'Loft' },
  { value: 'v:Villa', label: 'Villa' },
  { value: 'v:Masía', label: 'Masía' },
  { value: 'v:Finca', label: 'Finca' },
  { value: 'i:Terreno', label: 'Terreno' },
  { value: 'i:Local', label: 'Local comercial' },
  { value: 'i:Oficina', label: 'Oficina' },
  { value: 'i:Nave', label: 'Nave' },
  { value: 'i:Garaje', label: 'Garaje' },
  { value: 'i:Trastero', label: 'Trastero' },
  { value: 'i:Edificio', label: 'Edificio' },
];

export const OPERATION_OPTIONS = [
  { value: '', label: 'Comprar o alquilar' },
  { value: 'Venta', label: 'Comprar' },
  { value: 'Alquiler', label: 'Alquilar' },
];

export const ROOM_OPTIONS = [
  { value: '', label: 'Cualquiera' },
  { value: '1', label: '1 o más' },
  { value: '2', label: '2 o más' },
  { value: '3', label: '3 o más' },
  { value: '4', label: '4 o más' },
  { value: '5', label: '5 o más' },
];

export const BATHROOM_OPTIONS = [
  { value: '', label: 'Cualquiera' },
  { value: '1', label: '1 o más' },
  { value: '2', label: '2 o más' },
  { value: '3', label: '3 o más' },
];

export const GARAGE_OPTIONS = [
  { value: '', label: 'Indiferente' },
  { value: '1', label: 'Con garaje' },
  { value: '2', label: '2 plazas o más' },
];

export const ESTADO_OPTIONS = [
  { value: '', label: 'Cualquiera' },
  { value: 'ObraNueva', label: 'Obra nueva' },
  { value: 'BuenEstado', label: 'Buen estado' },
  { value: 'AReformar', label: 'A reformar' },
];

export const SORT_OPTIONS = [
  { value: '', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: de menor a mayor' },
  { value: 'price_desc', label: 'Precio: de mayor a menor' },
];

/** Formulario vacío. Todos los valores son texto, como en los campos. */
export const EMPTY_FORM = {
  location: '',
  type: '',
  operation: '',
  minPrice: '',
  maxPrice: '',
  rooms: '',
  bathrooms: '',
  garage: '',
  minMeters: '',
  estado: '',
  sort: '',
};

/** Campo del formulario → parámetro de la URL. */
const URL_PARAMS = {
  location: 'q',
  operation: 'tipoAnuncio',
  minPrice: 'minPrice',
  maxPrice: 'maxPrice',
  rooms: 'rooms',
  bathrooms: 'bathrooms',
  garage: 'garage',
  minMeters: 'minSquareMeters',
  estado: 'estado',
  sort: 'orden',
};

const digits = (value) => String(value ?? '').replace(/\D/g, '');
const NUMERIC_FIELDS = ['minPrice', 'maxPrice', 'rooms', 'bathrooms', 'garage', 'minMeters'];
const known = (options, value) => (options.some((option) => option.value === value) ? value : '');

/** URL → formulario. Lo desconocido o mal formado se ignora. */
export const formFromSearchParams = (searchParams) => {
  const form = { ...EMPTY_FORM };
  Object.entries(URL_PARAMS).forEach(([field, param]) => {
    const raw = (searchParams.get(param) || '').trim();
    form[field] = NUMERIC_FIELDS.includes(field) ? digits(raw) : raw;
  });

  // «tipo» es el tipo de vivienda; «inmueble», el resto (terreno, local…)
  const tipo = searchParams.get('tipo');
  const inmueble = searchParams.get('inmueble');
  if (tipo) form.type = known(TYPE_OPTIONS, `v:${tipo}`);
  else if (inmueble) form.type = known(TYPE_OPTIONS, `i:${inmueble}`);

  form.operation = known(OPERATION_OPTIONS, form.operation);
  form.estado = known(ESTADO_OPTIONS, form.estado);
  form.sort = known(SORT_OPTIONS, form.sort);
  return form;
};

/** Página de la URL (1 si falta o no es válida). */
export const pageFromSearchParams = (searchParams) => {
  const page = Number.parseInt(searchParams.get('page'), 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

/** Formulario (+ página) → URL. Solo se escriben los filtros con valor. */
export const searchParamsFromForm = (form, page = 1) => {
  const params = new URLSearchParams();
  Object.entries(URL_PARAMS).forEach(([field, param]) => {
    const value = String(form[field] ?? '').trim();
    if (value) params.set(param, value);
  });
  if (form.type?.startsWith('v:')) params.set('tipo', form.type.slice(2));
  if (form.type?.startsWith('i:')) params.set('inmueble', form.type.slice(2));
  if (page > 1) params.set('page', String(page));
  return params;
};

const toNumber = (value) => (value === '' || value === null || value === undefined ? null : Number(value));

/** Formulario (+ página) → filtros de la API de viviendas. */
export const apiFiltersFromForm = (form, page = 1) => ({
  q: form.location.trim(),
  tipoVivienda: form.type.startsWith('v:') ? form.type.slice(2) : '',
  tipoInmueble: form.type.startsWith('i:') ? form.type.slice(2) : '',
  tipoAnuncio: form.operation,
  minPrice: toNumber(form.minPrice),
  maxPrice: toNumber(form.maxPrice),
  rooms: toNumber(form.rooms),
  bathRooms: toNumber(form.bathrooms),
  garage: toNumber(form.garage),
  squaredMeters: toNumber(form.minMeters),
  estado: form.estado,
  sortBy: form.sort,
  published: true,
  page,
  pageSize: PAGE_SIZE,
});

const labelOf = (options, value) => options.find((option) => option.value === value)?.label || value;
const euros = (value) => `${new Intl.NumberFormat('es-ES', { useGrouping: 'always' }).format(Number(value))} €`;

/**
 * Filtros activos como etiquetas que se pueden quitar una a una.
 * El orden no cuenta como filtro.
 */
export const getActiveFilters = (form) => {
  const active = [];
  if (form.location.trim()) active.push({ field: 'location', label: `«${form.location.trim()}»` });
  if (form.type) active.push({ field: 'type', label: labelOf(TYPE_OPTIONS, form.type) });
  if (form.operation) active.push({ field: 'operation', label: labelOf(OPERATION_OPTIONS, form.operation) });
  if (form.minPrice) active.push({ field: 'minPrice', label: `Desde ${euros(form.minPrice)}` });
  if (form.maxPrice) active.push({ field: 'maxPrice', label: `Hasta ${euros(form.maxPrice)}` });
  if (form.rooms) active.push({ field: 'rooms', label: `${form.rooms}+ habitaciones` });
  if (form.bathrooms) active.push({ field: 'bathrooms', label: `${form.bathrooms}+ baños` });
  if (form.garage) active.push({ field: 'garage', label: labelOf(GARAGE_OPTIONS, form.garage) });
  if (form.minMeters) active.push({ field: 'minMeters', label: `Desde ${form.minMeters} m²` });
  if (form.estado) active.push({ field: 'estado', label: labelOf(ESTADO_OPTIONS, form.estado) });
  return active;
};
