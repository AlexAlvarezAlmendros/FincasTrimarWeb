/**
 * Servicio para gestión de mensajes de contacto
 * Maneja las peticiones relacionadas con mensajes, filtrado y respuestas
 */

class MessageService {
  constructor(apiUrl = import.meta.env.VITE_API_BASE_URL) {
    this.apiUrl = apiUrl;
    this.baseEndpoint = '/api/v1/messages';
  }

  /**
   * Obtener token de Auth0
   */
  async getAuthToken() {
    try {
      // Intentar obtener token desde localStorage o Auth0
      const token = localStorage.getItem('auth_token');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Crear headers con autenticación
   */
  async createAuthHeaders() {
    const token = await this.getAuthToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Enviar un mensaje de contacto desde el formulario público
   * @param {Object} messageData - Datos del mensaje
   * @param {string} messageData.nombre - Nombre del contacto
   * @param {string} messageData.email - Email del contacto
   * @param {string} messageData.telefono - Teléfono del contacto (opcional)
   * @param {string} messageData.asunto - Asunto del mensaje
   * @param {string} messageData.descripcion - Contenido del mensaje
   * @param {string} messageData.viviendaId - ID de la vivienda (opcional)
   * @returns {Promise<Object>} Confirmación del envío
   */
  async sendMessage(messageData) {
    try {
      // Validar datos requeridos
      if (!messageData.nombre || !messageData.email || !messageData.descripcion) {
        throw new Error('Nombre, email y mensaje son campos requeridos');
      }

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: messageData.nombre.trim(),
          email: messageData.email.trim(),
          telefono: messageData.telefono?.trim() || null,
          asunto: messageData.asunto?.trim() || 'Consulta desde web',
          descripcion: messageData.descripcion.trim(),
          viviendaId: messageData.viviendaId || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al enviar el mensaje');
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data,
        message: 'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.'
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error(
        error.message || 'Error al enviar el mensaje'
      );
    }
  }

  /**
   * Obtener todos los mensajes con filtros opcionales
   * @param {Object} params - Parámetros de filtrado
   * @param {string} params.estado - Estado del mensaje (Nuevo, EnCurso, Cerrado)
   * @param {string} params.q - Búsqueda por nombre, email o contenido
   * @param {number} params.page - Página actual
   * @param {number} params.pageSize - Tamaño de página
   * @param {string} params.sortBy - Campo de ordenación
   * @returns {Promise<Object>} Lista paginada de mensajes
   */
  async getMessages(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Parámetros de filtrado - Solo agregar si tienen valor válido
      if (params.estado) queryParams.append('estado', params.estado);
      if (params.q) queryParams.append('q', params.q);
      
      // Parámetros de paginación
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);

      const url = queryParams.toString() 
        ? `${this.apiUrl}${this.baseEndpoint}?${queryParams.toString()}`
        : `${this.apiUrl}${this.baseEndpoint}`;

      const headers = await this.createAuthHeaders();

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener los mensajes');
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data,
        pagination: data.pagination || {
          page: 1,
          pageSize: 20,
          totalPages: 1,
          totalItems: data.data?.length || 0
        }
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error(
        error.message || 'Error al obtener los mensajes'
      );
    }
  }

  /**
   * Obtener un mensaje específico por ID
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<Object>} Datos del mensaje
   */
  async getMessageById(messageId) {
    try {
      const headers = await this.createAuthHeaders();

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${messageId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener el mensaje');
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error fetching message:', error);
      throw new Error(
        error.message || 'Error al obtener el mensaje'
      );
    }
  }

  /**
   * Actualizar el estado de un mensaje
   * @param {string} messageId - ID del mensaje
   * @param {Object} updateData - Datos a actualizar
   * @param {string} updateData.estado - Nuevo estado (Nuevo, EnCurso, Cerrado)
   * @returns {Promise<Object>} Mensaje actualizado
   */
  async updateMessage(messageId, updateData) {
    try {
      const headers = await this.createAuthHeaders();

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${messageId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al actualizar el mensaje');
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error updating message:', error);
      throw new Error(
        error.message || 'Error al actualizar el mensaje'
      );
    }
  }

  /**
   * Marcar mensaje como leído (cambiar estado a EnCurso)
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<Object>} Mensaje actualizado
   */
  async markAsRead(messageId) {
    return this.updateMessage(messageId, { estado: 'EnCurso' });
  }

  /**
   * Marcar mensaje como cerrado
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<Object>} Mensaje actualizado
   */
  async markAsClosed(messageId) {
    return this.updateMessage(messageId, { estado: 'Cerrado' });
  }

  /**
   * Eliminar un mensaje
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async deleteMessage(messageId) {
    try {
      const headers = await this.createAuthHeaders();

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${messageId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al eliminar el mensaje');
      }

      return {
        success: true,
        message: 'Mensaje eliminado correctamente'
      };
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error(
        error.message || 'Error al eliminar el mensaje'
      );
    }
  }

  /**
   * Obtener estadísticas de mensajes
   * @returns {Promise<Object>} Estadísticas de mensajes
   */
  async getMessageStats() {
    try {
      const headers = await this.createAuthHeaders();

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/stats`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener estadísticas de mensajes');
      }

      const data = await response.json();
      
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error fetching message stats:', error);
      throw new Error(
        error.message || 'Error al obtener estadísticas de mensajes'
      );
    }
  }

  /**
   * Exportar mensajes a CSV
   * @param {Object} filters - Filtros para la exportación
   * @returns {Promise<Blob>} Archivo CSV
   */
  async exportMessages(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const url = `${this.apiUrl}${this.baseEndpoint}/export?${queryParams.toString()}`;
      
      const headers = await this.createAuthHeaders();

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al exportar los mensajes');
      }
      
      return response.blob();
    } catch (error) {
      console.error('Error exporting messages:', error);
      throw new Error(
        error.message || 'Error al exportar los mensajes'
      );
    }
  }
}

// Instancia única del servicio
const messageService = new MessageService();

export default messageService;