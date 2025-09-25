/**
 * Servicio para gestión de propiedades desde el frontend
 * Sigue la nomenclatura camelCase para archivos de servicio
 */

class PropertyService {
  constructor(apiUrl = import.meta.env.VITE_API_BASE_URL) {
    this.apiUrl = apiUrl;
  }

  /**
   * Busca propiedades con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} Respuesta con propiedades encontradas
   */
  async searchProperties(filters) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/properties/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });
      
      if (!response.ok) {
        throw new Error('Error en la búsqueda de propiedades');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.searchProperties error:', error);
      throw error;
    }
  }

  /**
   * Obtiene detalles de una propiedad específica
   * @param {string} id - ID de la propiedad
   * @returns {Promise<Object>} Detalles de la propiedad
   */
  async getPropertyDetails(id) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/properties/${id}`);
      
      if (!response.ok) {
        throw new Error('Propiedad no encontrada');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.getPropertyDetails error:', error);
      throw error;
    }
  }

  /**
   * Obtiene lista de propiedades con paginación
   * @param {Object} options - Opciones de consulta
   * @returns {Promise<Object>} Lista paginada de propiedades
   */
  async getProperties(options = {}) {
    try {
      const searchParams = new URLSearchParams(options);
      const response = await fetch(`${this.apiUrl}/api/v1/properties?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener propiedades');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.getProperties error:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const propertyService = new PropertyService();
export default propertyService;