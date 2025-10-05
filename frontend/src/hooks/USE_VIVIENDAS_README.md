# useViviendas Hook - Documentación

Hook personalizado para la gestión de viviendas en la aplicación inmobiliaria. Proporciona funcionalidades completas para listar, buscar, filtrar y paginar viviendas con optimizaciones avanzadas.

## Características Principales

- ✅ **Cache inteligente** con TTL (Time To Live)
- ✅ **Debounce** para búsquedas en tiempo real
- ✅ **Prevención de memory leaks**
- ✅ **Paginación automática**
- ✅ **Cancelación de peticiones**
- ✅ **Estados derivados computados**
- ✅ **TypeScript support**
- ✅ **Sincronizado con backend**

## Importación

```javascript
import { useViviendas, useVivienda, useSimilarViviendas } from '../hooks/useViviendas';
```

## Hook Principal: `useViviendas`

### Uso Básico

```javascript
function ViviendasList() {
  const { 
    viviendas, 
    isLoading, 
    error,
    pagination 
  } = useViviendas();

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {viviendas.map(vivienda => (
        <PropertyCard key={vivienda.id} property={vivienda} />
      ))}
    </div>
  );
}
```

### Con Filtros Iniciales

```javascript
function FilteredViviendas() {
  const initialFilters = {
    provincia: 'Barcelona',
    minPrice: 100000,
    maxPrice: 500000,
    rooms: 2
  };

  const { 
    viviendas, 
    isLoading, 
    updateFilters,
    resetFilters 
  } = useViviendas(initialFilters);

  const handlePriceChange = (minPrice, maxPrice) => {
    updateFilters({ minPrice, maxPrice }, { debounce: true });
  };

  return (
    <div>
      <PriceFilter onChange={handlePriceChange} />
      <button onClick={resetFilters}>Limpiar Filtros</button>
      {viviendas.map(vivienda => (
        <PropertyCard key={vivienda.id} property={vivienda} />
      ))}
    </div>
  );
}
```

### Con Opciones Avanzadas

```javascript
function AdvancedViviendas() {
  const options = {
    enableCache: true,     // Habilitar cache (default: true)
    debounceMs: 800,       // Tiempo de debounce (default: 500ms)
    autoFetch: true,       // Fetch automático al montar (default: true)
    onSuccess: (data) => {
      console.log('Viviendas cargadas:', data);
    },
    onError: (error) => {
      console.error('Error personalizado:', error);
    }
  };

  const { 
    viviendas,
    pagination,
    goToPage,
    searchViviendas,
    refreshViviendas
  } = useViviendas({}, options);

  return (
    <div>
      <SearchBar onSearch={(query) => 
        searchViviendas({ q: query }, true) // true para debounce
      } />
      
      <PropertyGrid viviendas={viviendas} />
      
      <Pagination 
        current={pagination.page}
        total={pagination.totalPages}
        onPageChange={goToPage}
      />
      
      <button onClick={refreshViviendas}>
        Actualizar
      </button>
    </div>
  );
}
```

## Hook para Vivienda Individual: `useVivienda`

```javascript
function ViviendaDetail({ viviendaId }) {
  const { 
    vivienda, 
    isLoading, 
    error, 
    refetch 
  } = useVivienda(viviendaId);

  if (isLoading) return <div>Cargando vivienda...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!vivienda) return <div>Vivienda no encontrada</div>;

  return (
    <div>
      <h1>{vivienda.name}</h1>
      <p>{vivienda.description}</p>
      <button onClick={refetch}>Actualizar</button>
    </div>
  );
}
```

## Hook para Viviendas Similares: `useSimilarViviendas`

```javascript
function SimilarProperties({ viviendaId }) {
  const { 
    similarViviendas, 
    isLoading, 
    isEmpty 
  } = useSimilarViviendas(viviendaId, 6); // Máximo 6 similares

  if (isLoading) return <div>Cargando similares...</div>;
  if (isEmpty) return <div>No hay propiedades similares</div>;

  return (
    <div>
      <h3>Propiedades Similares</h3>
      {similarViviendas.map(vivienda => (
        <PropertyCard key={vivienda.id} property={vivienda} />
      ))}
    </div>
  );
}
```

## API del Hook useViviendas

### Estados Principales

```javascript
const {
  // Datos
  viviendas,        // Array de viviendas
  pagination,       // Objeto con info de paginación
  error,            // Mensaje de error (null si no hay error)
  
  // Estados derivados
  isLoading,        // Boolean - true si está cargando
  isError,          // Boolean - true si hay error
  isSuccess,        // Boolean - true si carga exitosa
  isEmpty,          // Boolean - true si no hay resultados
  hasNextPage,      // Boolean - true si hay página siguiente
  hasPrevPage,      // Boolean - true si hay página anterior
  
  // Filtros
  filters,          // Objeto con filtros actuales
  
  // Funciones principales
  fetchViviendas,   // Función para fetch manual
  searchViviendas,  // Función para búsqueda avanzada
  updateFilters,    // Función para actualizar filtros
  goToPage,         // Función para cambiar de página
  resetFilters,     // Función para limpiar filtros
  refreshViviendas, // Función para refrescar datos
  
  // Utilidades
  clearError,       // Función para limpiar errores
  clearCache        // Función para limpiar cache
} = useViviendas(initialFilters, options);
```

### Filtros Disponibles

```javascript
const filters = {
  // Búsqueda de texto
  q: '',                    // Búsqueda libre en nombre, descripción y población
  
  // Precio
  minPrice: null,           // Precio mínimo
  maxPrice: null,           // Precio máximo
  
  // Características
  rooms: null,              // Número mínimo de habitaciones
  bathRooms: null,          // Número mínimo de baños
  
  // Tipo
  tipoInmueble: '',         // Vivienda, Oficina, Local, etc.
  tipoVivienda: '',         // Piso, Chalet, Casa, etc.
  
  // Ubicación
  provincia: '',            // Provincia
  poblacion: '',            // Población
  
  // Estado
  published: true,          // Solo publicadas (default: true)
  
  // Paginación
  page: 1,                  // Página actual
  pageSize: 20              // Elementos por página
};
```

### Opciones del Hook

```javascript
const options = {
  enableCache: true,        // Habilitar cache (default: true)
  debounceMs: 500,         // Tiempo de debounce en ms (default: 500)
  autoFetch: true,         // Fetch automático al montar (default: true)
  onSuccess: (data) => {}, // Callback en éxito
  onError: (error) => {}   // Callback en error
};
```

## Ejemplos Avanzados

### Búsqueda con Múltiples Filtros

```javascript
function PropertySearchPage() {
  const [localFilters, setLocalFilters] = useState({});
  
  const { 
    viviendas, 
    isLoading, 
    updateFilters,
    pagination,
    goToPage
  } = useViviendas();

  const handleFilterChange = (newFilters) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }));
    
    // Actualizar con debounce para búsquedas en tiempo real
    updateFilters(newFilters, { 
      debounce: true, 
      resetPagination: true 
    });
  };

  return (
    <div>
      <FilterPanel 
        filters={localFilters}
        onChange={handleFilterChange}
      />
      
      <PropertyGrid 
        viviendas={viviendas}
        loading={isLoading}
      />
      
      {pagination.totalPages > 1 && (
        <Pagination 
          current={pagination.page}
          total={pagination.totalPages}
          onChange={goToPage}
        />
      )}
    </div>
  );
}
```

### Integración con Context

```javascript
// Context para compartir estado de viviendas
const ViviendasContext = createContext();

export function ViviendasProvider({ children }) {
  const viviendasState = useViviendas({}, {
    enableCache: true,
    debounceMs: 300
  });

  return (
    <ViviendasContext.Provider value={viviendasState}>
      {children}
    </ViviendasContext.Provider>
  );
}

export function useViviendasContext() {
  const context = useContext(ViviendasContext);
  if (!context) {
    throw new Error('useViviendasContext must be used within ViviendasProvider');
  }
  return context;
}
```

## Optimizaciones y Buenas Prácticas

### 1. Debounce para Búsquedas en Tiempo Real

```javascript
// Usar debounce para inputs de búsqueda
const handleSearchChange = (query) => {
  updateFilters({ q: query }, { debounce: true });
};
```

### 2. Cache Inteligente

```javascript
// El cache se limpia automáticamente después del TTL
// Para limpiar manualmente:
const { clearCache } = useViviendas();
clearCache(); // Limpia todo el cache
```

### 3. Prevención de Memory Leaks

```javascript
// El hook automáticamente:
// - Cancela peticiones al desmontar
// - Limpia timeouts
// - Verifica si el componente está montado antes de actualizar estado
```

### 4. Estados Derivados

```javascript
// Usar estados derivados para lógica condicional
const { isEmpty, hasNextPage, isLoading } = useViviendas();

return (
  <div>
    {isLoading && <Spinner />}
    {isEmpty && !isLoading && <EmptyState />}
    {hasNextPage && <LoadMoreButton />}
  </div>
);
```

## Troubleshooting

### Error: "Respuesta del API inválida"
Verificar que el backend esté devolviendo el formato correcto:
```json
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
```

### Memory Leaks
El hook incluye protecciones automáticas, pero asegurate de no mantener referencias a los datos fuera del ciclo de vida del componente.

### Cache no Funciona
Verificar que `enableCache: true` esté en las opciones y que el backend esté devolviendo respuestas consistentes.

### Filtros no se Aplican
Verificar que los nombres de los filtros coincidan con los esperados por el backend y que los tipos de datos sean correctos.

## Tipos de Datos

Todos los tipos están definidos en `src/types/vivienda.types.js` y están sincronizados con el backend para evitar inconsistencias.