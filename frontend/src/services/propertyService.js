/**
 * Servicio para gestión de propiedades desde el frontend
 * Sincronizado con las rutas del backend (/api/v1/viviendas)
 */

import { DataTransformers } from '../types/vivienda.types.js';

class PropertyService {
  constructor(apiUrl = import.meta.env.VITE_API_BASE_URL) {
    this.apiUrl = apiUrl;
    this.baseEndpoint = '/api/v1/viviendas';
  }

  /**
   * Obtiene lista de propiedades con filtros y paginación
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} Respuesta con propiedades y paginación
   */
  async getProperties(filters = {}) {
    try {
      // Transformar filtros al formato esperado por el backend
      const cleanFilters = DataTransformers.transformFiltersToAPI(filters);
      
      // Construir query string
      const queryParams = new URLSearchParams();
      Object.entries(cleanFilters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });

      const url = `${this.apiUrl}${this.baseEndpoint}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener propiedades');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.getProperties error:', error);
      throw error;
    }
  }

  /**
   * Busca propiedades con filtros avanzados (POST)
   * @param {Object} filters - Filtros de búsqueda avanzada
   * @returns {Promise<Object>} Respuesta con propiedades encontradas
   */
  async searchProperties(filters) {
    try {
      const cleanFilters = DataTransformers.transformFiltersToAPI(filters);
      
      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanFilters)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error en la búsqueda de propiedades');
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
  async getPropertyById(id) {
    try {
      if (!id) {
        throw new Error('ID de propiedad requerido');
      }

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error('Propiedad no encontrada');
        }
        throw new Error(errorData.error?.message || 'Error al obtener la propiedad');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.getPropertyById error:', error);
      throw error;
    }
  }

  /**
   * Obtiene propiedades similares a una específica
   * @param {string} id - ID de la propiedad de referencia
   * @param {number} limit - Número máximo de propiedades similares
   * @returns {Promise<Object>} Lista de propiedades similares
   */
  async getSimilarProperties(id, limit = 4) {
    try {
      if (!id) {
        throw new Error('ID de propiedad requerido');
      }

      const queryParams = new URLSearchParams({ limit: limit.toString() });
      const response = await fetch(
        `${this.apiUrl}${this.baseEndpoint}/${id}/similar?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener propiedades similares');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.getSimilarProperties error:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de propiedades
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    try {
      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener estadísticas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.getStats error:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva propiedad (REQUIERE AUTENTICACIÓN)
   * @param {Object} propertyData - Datos de la propiedad
   * @param {Function} getAccessToken - Función para obtener el token de acceso de Auth0
   * @returns {Promise<Object>} Propiedad creada
   */
  async createProperty(propertyData, getAccessToken) {
    try {
      if (!propertyData) {
        throw new Error('Datos de propiedad requeridos');
      }

      if (!getAccessToken) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken();

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al crear la propiedad');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.createProperty error:', error);
      throw error;
    }
  }

  /**
   * Actualiza una propiedad existente
   * @param {string} id - ID de la propiedad
   * @param {Object} propertyData - Datos actualizados
   * @returns {Promise<Object>} Propiedad actualizada
   */
  async updateProperty(id, propertyData) {
    try {
      if (!id) {
        throw new Error('ID de propiedad requerido');
      }

      if (!propertyData) {
        throw new Error('Datos de propiedad requeridos');
      }

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error('Propiedad no encontrada');
        }
        throw new Error(errorData.error?.message || 'Error al actualizar la propiedad');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.updateProperty error:', error);
      throw error;
    }
  }

  /**
   * Elimina una propiedad
   * @param {string} id - ID de la propiedad
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteProperty(id) {
    try {
      if (!id) {
        throw new Error('ID de propiedad requerido');
      }

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error('Propiedad no encontrada');
        }
        throw new Error(errorData.error?.message || 'Error al eliminar la propiedad');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.deleteProperty error:', error);
      throw error;
    }
  }

  /**
   * Cambia el estado de publicación de una propiedad
   * @param {string} id - ID de la propiedad
   * @param {boolean} published - Estado de publicación
   * @returns {Promise<Object>} Propiedad actualizada
   */
  async togglePublish(id, published) {
    try {
      if (!id) {
        throw new Error('ID de propiedad requerido');
      }

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ published })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error('Propiedad no encontrada');
        }
        throw new Error(errorData.error?.message || 'Error al cambiar estado de publicación');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.togglePublish error:', error);
      throw error;
    }
  }

  /**
   * Sube múltiples imágenes al servidor (REQUIERE AUTENTICACIÓN)
   * @param {FileList|Array} files - Archivos de imagen
   * @param {Function} getAccessToken - Función para obtener el token de acceso de Auth0
   * @returns {Promise<Object>} Resultado de la subida
   */
  async uploadImages(files, getAccessToken) {
    try {
      if (!files || files.length === 0) {
        throw new Error('Archivos de imagen requeridos');
      }

      if (!getAccessToken) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken();

      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file); // Cambiado de 'files' a 'images' para coincidir con el backend
      });

      const response = await fetch(`${this.apiUrl}/api/v1/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // No establecer Content-Type para multipart/form-data - se establece automáticamente
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al subir imágenes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.uploadImages error:', error);
      throw error;
    }
  }

  /**
   * Asocia imágenes a una propiedad (REQUIERE AUTENTICACIÓN)
   * @param {string} propertyId - ID de la propiedad
   * @param {Array} images - Array de objetos {url, orden}
   * @param {Function} getAccessToken - Función para obtener el token de acceso de Auth0
   * @returns {Promise<Object>} Resultado de la asociación
   */
  async addPropertyImages(propertyId, images, getAccessToken) {
    try {
      if (!propertyId) {
        throw new Error('ID de propiedad requerido');
      }

      if (!Array.isArray(images) || images.length === 0) {
        throw new Error('Datos de imágenes inválidos');
      }

      if (!getAccessToken) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken();

      console.log('📤 Sending to addPropertyImages:', {
        propertyId,
        images,
        url: `${this.apiUrl}${this.baseEndpoint}/${propertyId}/imagenes`
      });

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${propertyId}/imagenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ images })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al asociar imágenes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.addPropertyImages error:', error);
      throw error;
    }
  }

  /**
   * Obtiene las imágenes de una propiedad
   * @param {string} propertyId - ID de la propiedad
   * @returns {Promise<Object>} Imágenes de la propiedad
   */
  async getPropertyImages(propertyId) {
    try {
      if (!propertyId) {
        throw new Error('ID de propiedad requerido');
      }

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${propertyId}/imagenes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener imágenes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.getPropertyImages error:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen de una propiedad
   * @param {string} propertyId - ID de la propiedad
   * @param {string} imageId - ID de la imagen
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deletePropertyImage(propertyId, imageId, getAccessToken) {
    try {
      if (!propertyId || !imageId) {
        throw new Error('ID de propiedad e imagen requeridos');
      }

      if (!getAccessToken) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken();

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${propertyId}/imagenes/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al eliminar imagen');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.deletePropertyImage error:', error);
      throw error;
    }
  }

  /**
   * Reordena las imágenes de una propiedad
   * @param {string} propertyId - ID de la propiedad
   * @param {Array} imageOrders - Array de {id, orden}
   * @returns {Promise<Object>} Resultado del reordenamiento
   */
  async reorderPropertyImages(propertyId, imageOrders) {
    try {
      if (!propertyId) {
        throw new Error('ID de propiedad requerido');
      }

      if (!Array.isArray(imageOrders)) {
        throw new Error('Array de órdenes de imágenes requerido');
      }

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${propertyId}/imagenes/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageOrders })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al reordenar imágenes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.reorderPropertyImages error:', error);
      throw error;
    }
  }

  /**
   * Obtiene el estado del servicio de imágenes
   * @returns {Promise<Object>} Estado del servicio
   */
  async getImageServiceStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/images/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al verificar servicio de imágenes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('PropertyService.getImageServiceStatus error:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const propertyService = new PropertyService();
export default propertyService;