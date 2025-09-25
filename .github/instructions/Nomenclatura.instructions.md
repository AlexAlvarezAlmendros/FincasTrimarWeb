---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Nomenclatura

## **Nomenclatura Frontend (React)**

### **2.1 Componentes**

JavaScript

```jsx
// ✅ CORRECTO - PascalCase para componentes
// Archivo: src/components/PropertyCard/PropertyCard.js
const PropertyCard = ({ property }) => {
  return <div>{property.title}</div>;
};

// ✅ CORRECTO - Sufijo descriptivo para componentes compuestos
// Archivo: src/components/PropertyCard/PropertyCardHeader.js
const PropertyCardHeader = ({ title, price }) => {
  return (
    <header>
      <h3>{title}</h3>
      <span>{price}€</span>
    </header>
  );
};

// ❌ INCORRECTO
// property-card.js, propertyCard.js, Property_Card.js
```

**Reglas para Componentes:**

- **Archivos**: `ComponentName.js`
- **Carpetas**: Mismo nombre que el componente principal
- **Exportación**: Default export para componentes principales
- **Estructura de carpeta de componente**:

Code

```
PropertyCard/
├── PropertyCard.js          # Componente principal
├── PropertyCard.module.css  # Estilos del componente
├── index.js                 # Re-export para importación limpia
└── __tests__/              # Tests del componente
    └── PropertyCard.test.js
```

### **2.2 Hooks Personalizados**

JavaScript

```jsx
// ✅ CORRECTO - Prefijo 'use' en camelCase
// Archivo: src/hooks/usePropertySearch.js
const usePropertySearch = (filters) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Lógica de búsqueda
  }, [filters]);

  return { properties, loading, error };
};

// ✅ CORRECTO - Hook específico y descriptivo
// Archivo: src/hooks/useDebounce.js
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// ❌ INCORRECTO
// UsePropertySearch, use-property-search, propertySearchHook
```

**Reglas para Hooks:**

- Siempre empiezan con `use`
- camelCase después del prefijo
- Un hook por archivo
- Nombre del archivo igual al hook
- Documentar parámetros y retorno con JSDoc

### **2.3 Servicios**

JavaScript

```jsx
// ✅ CORRECTO - Servicios como clases o módulos
// Archivo: src/services/propertyService.js
class PropertyService {
  constructor(apiUrl = process.env.REACT_APP_API_URL) {
    this.apiUrl = apiUrl;
  }

  async searchProperties(filters) {
    try {
      const response = await fetch(`${this.apiUrl}/properties/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) throw new Error('Search failed');
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.searchProperties error:', error);
      throw error;
    }
  }

  async getPropertyDetails(id) {
    // Implementación
  }
}

export default new PropertyService();

// ✅ ALTERNATIVA - Objeto con métodos
// Archivo: src/services/authService.js
const authService = {
  async login(credentials) {
    // Implementación
  },

  async logout() {
    // Implementación
  },

  isAuthenticated() {
    // Implementación
  }
};

export default authService;
```

**Reglas para Servicios:**

- camelCase para nombres de archivo
- Sufijo `Service` para claridad
- Un servicio por dominio de negocio
- Métodos async/await para operaciones asíncronas
- Manejo de errores consistente

### **2.4 Páginas/Vistas**

JavaScript

```jsx
// ✅ CORRECTO - Páginas como componentes funcionales
// Archivo: src/pages/SearchPage/SearchPage.js
const SearchPage = () => {
  const { properties, loading, error, searchProperties } = usePropertySearch();
  const [filters, setFilters] = useState(defaultFilters);

  const handleSearch = useCallback(() => {
    searchProperties(filters);
  }, [filters, searchProperties]);

  return (
    <div className="search-page">
      <SearchFilters onChange={setFilters} />
      <SearchResults 
        properties={properties} 
        loading={loading} 
        error={error} 
      />
    </div>
  );
};
```

### **2.5 Contextos**

JavaScript

```jsx
// ✅ CORRECTO - Context con Provider y Hook
// Archivo: src/contexts/AppContext.js
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const value = {
    ...state,
    updateState: setState
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

## **3. Nomenclatura Backend (Node.js)**

### **3.1 Controladores**

JavaScript

```jsx
// ✅ CORRECTO - Controladores con métodos específicos
// Archivo: src/controllers/propertyController.js
const propertyController = {
  // GET /api/properties
  async getProperties(req, res, next) {
    try {
      const properties = await propertyService.findAll(req.query);
      res.json({
        success: true,
        data: properties
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/properties/search
  async searchProperties(req, res, next) {
    try {
      const { filters } = req.body;
      const results = await propertyService.search(filters);
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = propertyController;
```

**Reglas para Controladores:**

- camelCase para archivos
- Sufijo `Controller`
- Métodos async/await
- Manejo de errores con next()
- Respuestas consistentes

### **3.2 Servicios Backend**

JavaScript

```jsx
// ✅ CORRECTO - Servicios con lógica de negocio
// Archivo: src/services/scrapingService.js
class ScrapingService {
  constructor() {
    this.scrapers = {
      idealista: new IdealistaScraper(),
      fotocasa: new FotocasaScraper(),
      habitaclia: new HabitacliaScraper()
    };
  }

  async scrapePortal(portal, filters) {
    const scraper = this.scrapers[portal];
    if (!scraper) {
      throw new Error(`Portal ${portal} no soportado`);
    }

    try {
      const results = await scraper.scrape(filters);
      return this.processResults(results, portal);
    } catch (error) {
      console.error(`Error scraping ${portal}:`, error);
      throw error;
    }
  }

  processResults(results, portal) {
    return results.map(result => ({
      ...result,
      portal,
      scrapedAt: new Date(),
      id: this.generateId(result.url)
    }));
  }

  generateId(url) {
    // Implementación
  }
}

module.exports = new ScrapingService();
```

### **3.3 Scrapers**

JavaScript

```jsx
// ✅ CORRECTO - Clase base para scrapers
// Archivo: src/scrapers/BaseScraper.js
class BaseScraper {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.headers = config.headers;
    this.delay = config.delay || 1000;
  }

  async scrape(filters) {
    throw new Error('scrape method must be implemented');
  }

  async fetchPage(url) {
    // Implementación común
  }

  parseHtml(html) {
    // Implementación común
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }
}

// ✅ CORRECTO - Scraper específico
// Archivo: src/scrapers/IdealistaScraper.js
class IdealistaScraper extends BaseScraper {
  constructor() {
    super({
      baseUrl: 'https://www.idealista.com',
      headers: {
        'User-Agent': 'Mozilla/5.0...'
      },
      delay: 2000
    });
  }

  async scrape(filters) {
    const url = this.buildSearchUrl(filters);
    const html = await this.fetchPage(url);
    const properties = this.extractProperties(html);
    
    return properties.filter(this.isParticular);
  }

  isParticular(property) {
    return property.html.includes('<div class="name">Particular</div>') ||
           property.html.includes('<span class="particular">');
  }
}
```

### **3.4 Rutas**

JavaScript

```jsx
// ✅ CORRECTO - Rutas organizadas por recurso
// Archivo: src/routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { validateSearch } = require('../middleware/validation');

// Rutas de propiedades
router.get('/', propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/search', validateSearch, propertyController.searchProperties);
router.post('/scrape', propertyController.startScraping);

module.exports = router;

// ✅ CORRECTO - Archivo principal de rutas
// Archivo: src/routes/index.js
const express = require('express');
const router = express.Router();

router.use('/api/properties', require('./propertyRoutes'));
router.use('/api/scrapers', require('./scraperRoutes'));
router.use('/api/exports', require('./exportRoutes'));

module.exports = router;
```

## **4. Principios de Calidad de Código**

### **4.1 Principio de Responsabilidad Única (SRP)**

JavaScript

```jsx
// ✅ CORRECTO - Cada módulo tiene una sola responsabilidad

// Hook solo para manejo de estado de búsqueda
const useSearchState = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [results, setResults] = useState([]);
  
  return { filters, setFilters, results, setResults };
};

// Hook solo para llamadas a API
const useSearchAPI = () => {
  const search = useCallback(async (filters) => {
    const response = await propertyService.search(filters);
    return response;
  }, []);
  
  return { search };
};

// Componente que orquesta
const SearchContainer = () => {
  const { filters, setFilters, results, setResults } = useSearchState();
  const { search } = useSearchAPI();
  const { showNotification } = useNotifications();
  
  const handleSearch = async () => {
    try {
      const data = await search(filters);
      setResults(data);
      showNotification('Búsqueda completada', 'success');
    } catch (error) {
      showNotification('Error en la búsqueda', 'error');
    }
  };
  
  return (
    <div>
      <SearchForm filters={filters} onChange={setFilters} />
      <SearchButton onClick={handleSearch} />
      <ResultsList results={results} />
    </div>
  );
};
```

### **4.2 Composición y Reutilización**

JavaScript

```jsx
// ✅ CORRECTO - Componentes pequeños y reutilizables

// Componente genérico de entrada
const FormInput = ({ label, type = 'text', value, onChange, error, ...props }) => {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={error ? 'error' : ''}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

// Componente específico que usa el genérico
const PriceRangeInput = ({ minPrice, maxPrice, onMinChange, onMaxChange }) => {
  return (
    <div className="price-range">
      <FormInput
        label="Precio mínimo"
        type="number"
        value={minPrice}
        onChange={onMinChange}
        placeholder="0"
      />
      <FormInput
        label="Precio máximo"
        type="number"
        value={maxPrice}
        onChange={onMaxChange}
        placeholder="999999"
      />
    </div>
  );
};
```

### **4.3 Manejo de Estado Limpio**

JavaScript

```jsx
// ✅ CORRECTO - Estado organizado y predecible

// Hook personalizado para manejo complejo de estado
const usePropertyFilters = () => {
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters);
  
  const updatePrice = useCallback((min, max) => {
    dispatch({ type: 'UPDATE_PRICE', payload: { min, max } });
  }, []);
  
  const updateLocation = useCallback((location) => {
    dispatch({ type: 'UPDATE_LOCATION', payload: location });
  }, []);
  
  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);
  
  return {
    filters,
    updatePrice,
    updateLocation,
    resetFilters
  };
};

// Reducer para manejo de estado complejo
const filtersReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_PRICE':
      return {
        ...state,
        price: {
          min: action.payload.min,
          max: action.payload.max
        }
      };
    case 'UPDATE_LOCATION':
      return {
        ...state,
        location: action.payload
      };
    case 'RESET':
      return initialFilters;
    default:
      return state;
  }
};
```

### **4.4 Gestión de Efectos Secundarios**

JavaScript

```jsx
// ✅ CORRECTO - Efectos bien organizados y limpios

const useAutoSave = (data, delay = 1000) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    if (!data) return;
    
    setSaving(true);
    setSaved(false);
    
    const timeoutId = setTimeout(async () => {
      try {
        await saveService.autoSave(data);
        setSaved(true);
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setSaving(false);
      }
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [data, delay]);
  
  return { saving, saved };
};
```

### **4.5 Manejo de Errores**

JavaScript

```jsx
// ✅ CORRECTO - Manejo consistente de errores

// Hook para manejo de errores
const useErrorHandler = () => {
  const [error, setError] = useState(null);
  
  const resetError = () => setError(null);
  
  const handleError = useCallback((error) => {
    console.error('Error caught:', error);
    setError({
      message: error.message || 'Ha ocurrido un error',
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    });
  }, []);
  
  return { error, resetError, handleError };
};

// Boundary de errores
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

## **5. Configuración de ESLint**

### **5.1 Frontend (.eslintrc.js)**

JavaScript

```jsx
module.exports = {
  extends: ['react-app'],
  rules: {
    // Nomenclatura
    'camelcase': ['error', { properties: 'never' }],
    'react/jsx-pascal-case': 'error',
    
    // Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // React
    'react/prop-types': 'off',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error'
  }
};
```

### **5.2 Backend (.eslintrc.js)**

JavaScript

```jsx
module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    // Nomenclatura
    'camelcase': ['error', { properties: 'never' }],
    
    // Async/Await
    'require-await': 'error',
    'no-return-await': 'error',
    
    // General
    'no-console': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    
    // Node.js
    'callback-return': 'error',
    'handle-callback-err': 'error'
  }
};
```

## **6. Convenciones Adicionales**

### **6.1 Comentarios y Documentación**

JavaScript

```jsx
/**
 * Busca propiedades según los filtros especificados
 * @param {Object} filters - Filtros de búsqueda
 * @param {string} filters.location - Ubicación de la propiedad
 * @param {number} filters.minPrice - Precio mínimo
 * @param {number} filters.maxPrice - Precio máximo
 * @returns {Promise<Array>} Lista de propiedades encontradas
 */
const searchProperties = async (filters) => {
  // Validar filtros antes de procesar
  validateFilters(filters);
  
  // TODO: Implementar cache de resultados
  
  // FIXME: Mejorar manejo de timeout en peticiones
  
  return await propertyService.search(filters);
};
```

### **6.2 Constantes**

JavaScript

```jsx
// ✅ CORRECTO - Constantes en UPPER_SNAKE_CASE
// Archivo: src/constants/portals.js
export const SUPPORTED_PORTALS = {
  IDEALISTA: 'idealista',
  FOTOCASA: 'fotocasa',
  HABITACLIA: 'habitaclia'
};

export const PORTAL_CONFIGS = {
  [SUPPORTED_PORTALS.IDEALISTA]: {
    baseUrl: 'https://www.idealista.com',
    rateLimit: 2000,
    selectors: {
      particular: ['.name:contains("Particular")', '.particular']
    }
  }
};
```

### **6.3 Utilidades**

JavaScript

```jsx
// ✅ CORRECTO - Funciones puras y reutilizables
// Archivo: src/utils/formatters.js
export const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};
```

### **6.4 Tests**

JavaScript

```jsx
// ✅ CORRECTO - Nomenclatura descriptiva para tests
// Archivo: __tests__/usePropertySearch.test.js
describe('usePropertySearch', () => {
  it('should return initial empty state', () => {
    // Test
  });
  
  it('should update properties when search is successful', async () => {
    // Test
  });
  
  it('should handle search errors gracefully', async () => {
    // Test
  });
});
```
