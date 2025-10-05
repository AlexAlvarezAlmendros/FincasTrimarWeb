/**
 * Tipos y enumeraciones para el modelo de Vivienda
 * Sincronizado con el backend para mantener consistencia de datos
 */

// Enumeraciones sincronizadas con el backend
export const TipoInmueble = {
  VIVIENDA: 'Vivienda',
  OFICINA: 'Oficina',
  LOCAL: 'Local',
  NAVE: 'Nave',
  GARAJE: 'Garaje',
  TERRENO: 'Terreno',
  TRASTERO: 'Trastero',
  EDIFICIO: 'Edificio',
  OBRA_NUEVA: 'ObraNueva'
};

export const TipoVivienda = {
  PISO: 'Piso',
  ATICO: 'Ático',
  DUPLEX: 'Dúplex',
  CASA: 'Casa',
  CHALET: 'Chalet',
  VILLA: 'Villa',
  MASIA: 'Masía',
  FINCA: 'Finca',
  LOFT: 'Loft'
};

export const TipoAnuncio = {
  VENTA: 'Venta',
  ALQUILER: 'Alquiler'
};

export const Estado = {
  OBRA_NUEVA: 'ObraNueva',
  BUEN_ESTADO: 'BuenEstado',
  A_REFORMAR: 'AReformar'
};

export const EstadoVenta = {
  DISPONIBLE: 'Disponible',
  RESERVADA: 'Reservada',
  VENDIDA: 'Vendida',
  CERRADA: 'Cerrada'
};

export const Planta = {
  ULTIMA_PLANTA: 'UltimaPlanta',
  PLANTA_INTERMEDIA: 'PlantaIntermedia',
  BAJO: 'Bajo'
};

export const Caracteristica = {
  AIRE_ACONDICIONADO: 'AireAcondicionado',
  ARMARIOS_EMPOTRADOS: 'ArmariosEmpotrados',
  ASCENSOR: 'Ascensor',
  BALCON: 'Balcón',
  TERRAZA: 'Terraza',
  EXTERIOR: 'Exterior',
  GARAJE: 'Garaje',
  JARDIN: 'Jardín',
  PISCINA: 'Piscina',
  TRASTERO: 'Trastero',
  VIVIENDA_ACCESIBLE: 'ViviendaAccesible',
  VISTAS_AL_MAR: 'VistasAlMar',
  VIVIENDA_DE_LUJO: 'ViviendaDeLujo',
  VISTAS_A_MONTANA: 'VistasAMontaña',
  FUEGO_A_TIERRA: 'FuegoATierra',
  CALEFACCION: 'Calefacción',
  GUARDILLA: 'Guardilla',
  COCINA_OFFICE: 'CocinaOffice'
};

/**
 * Interface para la entidad Vivienda
 * Mantiene la estructura exacta del backend con camelCase
 */
export const ViviendaModel = {
  /**
   * Propiedades principales de una vivienda
   */
  defaultProperties: {
    id: '',
    name: '',
    shortDescription: '',
    description: '',
    price: 0,
    rooms: 0,
    bathRooms: 0,
    garage: 0,
    squaredMeters: 0,
    provincia: '',
    poblacion: '',
    calle: '',
    numero: '',
    tipoInmueble: TipoInmueble.VIVIENDA,
    tipoVivienda: TipoVivienda.PISO,
    estado: Estado.BUEN_ESTADO,
    planta: Planta.PLANTA_INTERMEDIA,
    tipoAnuncio: TipoAnuncio.VENTA,
    estadoVenta: EstadoVenta.DISPONIBLE,
    caracteristicas: [],
    published: false,
    fechaPublicacion: null,
    createdAt: null,
    updatedAt: null,
    imagenes: []
  },

  /**
   * Valida si un objeto tiene la estructura correcta de vivienda
   */
  isValid(vivienda) {
    if (!vivienda || typeof vivienda !== 'object') return false;
    
    const required = ['id', 'name', 'price'];
    return required.every(field => vivienda.hasOwnProperty(field) && vivienda[field] !== null);
  },

  /**
   * Crea una instancia vacía de vivienda con valores por defecto
   */
  createEmpty() {
    return { ...this.defaultProperties };
  }
};

/**
 * Interface para los filtros de búsqueda de viviendas
 */
export const ViviendaFilters = {
  /**
   * Filtros por defecto
   */
  defaultFilters: {
    q: '', // Búsqueda de texto libre
    minPrice: null,
    maxPrice: null,
    rooms: null,
    bathRooms: null,
    tipoInmueble: '',
    tipoVivienda: '',
    provincia: '',
    poblacion: '',
    published: true, // Solo mostrar publicadas por defecto
    page: 1,
    pageSize: 20
  },

  /**
   * Crea filtros vacíos
   */
  createEmpty() {
    return { ...this.defaultFilters };
  },

  /**
   * Limpia filtros vacíos para enviar al backend
   */
  cleanFilters(filters) {
    const cleaned = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  }
};

/**
 * Interface para la paginación
 */
export const PaginationModel = {
  defaultPagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  },

  /**
   * Crea objeto de paginación por defecto
   */
  createDefault() {
    return { ...this.defaultPagination };
  }
};

/**
 * Interface para la respuesta del API
 */
export const ApiResponse = {
  /**
   * Estructura esperada de respuesta exitosa
   */
  successResponse: {
    success: true,
    data: null,
    pagination: null
  },

  /**
   * Estructura esperada de respuesta con error
   */
  errorResponse: {
    success: false,
    error: {
      code: '',
      message: ''
    }
  },

  /**
   * Valida si una respuesta tiene el formato correcto
   */
  isValidResponse(response) {
    return response && 
           typeof response === 'object' && 
           response.hasOwnProperty('success');
  }
};

/**
 * Estados del hook useViviendas
 */
export const HookStates = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

/**
 * Utilidades para transformación de datos
 */
export const DataTransformers = {
  /**
   * Transforma filtros del frontend al formato del backend
   */
  transformFiltersToAPI(filters) {
    const cleaned = ViviendaFilters.cleanFilters(filters);
    
    // Asegurar tipos correctos para números
    if (cleaned.minPrice) cleaned.minPrice = Number(cleaned.minPrice);
    if (cleaned.maxPrice) cleaned.maxPrice = Number(cleaned.maxPrice);
    if (cleaned.rooms) cleaned.rooms = Number(cleaned.rooms);
    if (cleaned.bathRooms) cleaned.bathRooms = Number(cleaned.bathRooms);
    if (cleaned.page) cleaned.page = Number(cleaned.page);
    if (cleaned.pageSize) cleaned.pageSize = Number(cleaned.pageSize);
    
    return cleaned;
  },

  /**
   * Transforma respuesta del API al formato del frontend
   */
  transformAPIResponse(apiResponse) {
    if (!ApiResponse.isValidResponse(apiResponse)) {
      throw new Error('Respuesta del API inválida');
    }

    if (!apiResponse.success) {
      throw new Error(apiResponse.error?.message || 'Error desconocido');
    }

    return {
      viviendas: Array.isArray(apiResponse.data) ? apiResponse.data : [],
      pagination: apiResponse.pagination || PaginationModel.createDefault()
    };
  },

  /**
   * Formatea precio para mostrar
   */
  formatPrice(price) {
    if (!price || isNaN(price)) return 'Precio no disponible';
    
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(price);
  },

  /**
   * Formatea fecha
   */
  formatDate(dateString) {
    if (!dateString) return '';
    
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  }
};