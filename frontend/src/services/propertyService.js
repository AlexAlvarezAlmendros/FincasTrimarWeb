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
   * @param {Function} getAccessToken - Función para obtener el token de Auth0
   * @returns {Promise<Object>} Propiedad actualizada
   */
  async updateProperty(id, propertyData, getAccessToken = null) {
    try {
      if (!id) {
        throw new Error('ID de propiedad requerido');
      }

      if (!propertyData) {
        throw new Error('Datos de propiedad requeridos');
      }

      const headers = {
        'Content-Type': 'application/json'
      };

      // Agregar token si está disponible
      if (getAccessToken) {
        try {
          const token = await getAccessToken();
          headers['Authorization'] = `Bearer ${token}`;
          console.log('🔑 Token agregado al header de updateProperty');
        } catch (error) {
          console.error('❌ Error obteniendo token:', error);
          throw new Error('Error de autenticación');
        }
      }

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${id}`, {
        method: 'PUT',
        headers,
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
  async deleteProperty(id, getAccessToken = null) {
    try {
      if (!id) {
        throw new Error('ID de propiedad requerido');
      }

      const headers = {
        'Content-Type': 'application/json'
      };

      // Agregar token si está disponible
      if (getAccessToken) {
        const token = await getAccessToken();
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🗑️ Eliminando propiedad:', id);

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${id}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          throw new Error('Propiedad no encontrada');
        }
        if (response.status === 401) {
          throw new Error('No autorizado. Inicia sesión primero.');
        }
        if (response.status === 403) {
          throw new Error('No tienes permisos para eliminar esta propiedad');
        }
        throw new Error(errorData.error?.message || 'Error al eliminar la propiedad');
      }
      
      const result = await response.json();
      console.log('✅ Propiedad eliminada correctamente');
      return result;
    } catch (error) {
      console.error('❌ PropertyService.deleteProperty error:', error);
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
  async reorderPropertyImages(propertyId, imageOrders, getTokenFn) {
    try {
      if (!propertyId) {
        throw new Error('ID de propiedad requerido');
      }

      if (!Array.isArray(imageOrders)) {
        throw new Error('Array de órdenes de imágenes requerido');
      }

      // Obtener token de Auth0
      const token = getTokenFn ? await getTokenFn() : null;
      
      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🔄 Reordenando imágenes:', { propertyId, imageOrders });

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${propertyId}/imagenes/reorder`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ imageOrders })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error al reordenar imágenes:', errorData);
        throw new Error(errorData.error?.message || 'Error al reordenar imágenes');
      }
      
      const result = await response.json();
      console.log('✅ Imágenes reordenadas correctamente:', result);
      return result;
    } catch (error) {
      console.error('PropertyService.reorderPropertyImages error:', error);
      throw error;
    }
  }

  /**
   * Sube archivos de imagen a ImgBB y los asocia a una vivienda
   * Este método combina la subida y la asociación en un solo flujo
   * @param {string} propertyId - ID de la propiedad
   * @param {Array<File>} files - Archivos de imagen a subir
   * @param {Function} getAccessToken - Función para obtener token de Auth0
   * @param {Function} onProgress - Callback opcional para progreso
   * @returns {Promise<Object>} Respuesta con las imágenes creadas
   */
  async uploadPropertyImages(propertyId, files, getAccessToken, onProgress = null) {
    try {
      if (!propertyId) {
        throw new Error('ID de propiedad requerido');
      }

      if (!files || files.length === 0) {
        throw new Error('Archivos de imagen requeridos');
      }

      if (!getAccessToken) {
        throw new Error('Función de autenticación requerida');
      }

      console.log(`📤 Subiendo ${files.length} imágenes para vivienda ${propertyId}`);

      // Obtener token de autenticación
      const token = await getAccessToken();

      // PASO 1: Subir imágenes a ImgBB UNA POR UNA para evitar error 413
      if (onProgress) onProgress(10);
      
      const uploadedImages = [];
      const filesArray = Array.from(files);
      const totalFiles = filesArray.length;
      
      console.log('🔄 Subiendo archivos a ImgBB uno por uno...');
      
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        console.log(`📁 Subiendo archivo ${i + 1}/${totalFiles}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        
        const formData = new FormData();
        formData.append('images', file);
        
        // Debug: verificar que el FormData tiene el archivo correcto
        console.log(`🔍 FormData creado para ${file.name}:`, {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        });
        
        try {
          const uploadResponse = await fetch(`${this.apiUrl}/api/v1/images`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({}));
            console.error(`❌ Error subiendo ${file.name}:`, errorData);
            throw new Error(errorData.error?.message || `Error al subir imagen ${file.name}`);
          }

          const uploadResult = await uploadResponse.json();
          
          if (uploadResult.success && uploadResult.data.images && uploadResult.data.images.length > 0) {
            uploadedImages.push(uploadResult.data.images[0]);
            console.log(`✅ Imagen ${i + 1}/${totalFiles} subida: ${file.name}`);
          }
          
          // Actualizar progreso (10% inicial + 50% para subidas)
          const uploadProgress = 10 + Math.floor((i + 1) / totalFiles * 50);
          if (onProgress) onProgress(uploadProgress);
          
          // Pequeña pausa entre uploads para no saturar
          if (i < filesArray.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
        } catch (error) {
          console.error(`❌ Error al subir archivo ${file.name}:`, error);
          throw new Error(`Error al subir ${file.name}: ${error.message}`);
        }
      }

      console.log(`✅ Todas las imágenes subidas a ImgBB: ${uploadedImages.length}/${totalFiles}`);

      if (uploadedImages.length === 0) {
        throw new Error('No se pudieron subir las imágenes a ImgBB');
      }

      if (onProgress) onProgress(60);

      // PASO 2: Asociar URLs de ImgBB a la vivienda
      console.log('🔗 Asociando imágenes a la vivienda...');
      
      const imagesToAssociate = uploadedImages.map((img, index) => ({
        url: img.url,
        orden: index + 1
      }));

      const associateResponse = await fetch(`${this.apiUrl}${this.baseEndpoint}/${propertyId}/imagenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ images: imagesToAssociate })
      });

      if (!associateResponse.ok) {
        const errorData = await associateResponse.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al asociar imágenes a la vivienda');
      }

      const associateResult = await associateResponse.json();
      console.log('✅ Imágenes asociadas correctamente:', associateResult);

      if (onProgress) onProgress(100);

      // Retornar las imágenes asociadas
      return {
        success: true,
        data: associateResult.data.images || []
      };

    } catch (error) {
      console.error('❌ PropertyService.uploadPropertyImages error:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las viviendas en estado borrador
   * @param {Object} options Opciones adicionales (token, etc.)
   * @returns {Promise<Object>} Respuesta con lista de borradores
   */
  async getDrafts(options = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(options.token && { 'Authorization': `Bearer ${options.token}` })
      };

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/drafts`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener borradores');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PropertyService.getDrafts error:', error);
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

  /**
   * Obtiene propiedades en proceso de captación
   * @param {Object} options - Opciones de la petición
   * @param {string} options.token - Token de autenticación
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Object>} Respuesta con propiedades de captación
   */
  async getCaptacionProperties({ token, ...filters } = {}) {
    try {
      // Limpiar filtros nulos/undefined
      const cleanFilters = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          cleanFilters[key] = value;
        }
      });
      
      // Construir query string
      const queryParams = new URLSearchParams();
      Object.entries(cleanFilters).forEach(([key, value]) => {
        queryParams.append(key, value.toString());
      });

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const url = `${this.apiUrl}${this.baseEndpoint}/captacion?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener propiedades de captación');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PropertyService.getCaptacionProperties error:', error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de captación de una propiedad
   * @param {string} propertyId - ID de la propiedad
   * @param {Object} captacionData - Datos de captación a actualizar
   * @param {Object} options - Opciones de la petición
   * @param {string} options.token - Token de autenticación
   * @returns {Promise<Object>} Respuesta con la propiedad actualizada
   */
  async updateCaptacionData(propertyId, captacionData, { token } = {}) {
    try {
      if (!propertyId) {
        throw new Error('ID de propiedad requerido');
      }

      const headers = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const url = `${this.apiUrl}${this.baseEndpoint}/${propertyId}/captacion`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(captacionData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al actualizar datos de captación');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('PropertyService.updateCaptacionData error:', error);
      throw error;
    }
  }

}

// Exportar instancia singleton
const propertyService = new PropertyService();
export default propertyService;