import { getAccessToken } from '../utils/authHelpers';

/**
 * Servicio para interactuar con el API del dashboard
 */
class DashboardService {
  constructor(apiUrl = import.meta.env.VITE_API_BASE_URL) {
    this.apiUrl = apiUrl;
    this.baseEndpoint = '/api/v1/dashboard';
  }
  
  /**
   * Obtiene las estadísticas generales del dashboard
   * @param {Function} getAccessTokenSilently - Función para obtener el token de acceso de Auth0
   */
  async getDashboardStats(getAccessTokenSilently) {
    try {
      if (!getAccessTokenSilently) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken(getAccessTokenSilently);

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener estadísticas del dashboard');
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Obtiene las ventas mensuales
   * @param {Function} getAccessTokenSilently - Función para obtener el token de acceso de Auth0
   */
  async getMonthlySales(getAccessTokenSilently) {
    try {
      if (!getAccessTokenSilently) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken(getAccessTokenSilently);

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/monthly-sales`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener ventas mensuales');
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching monthly sales:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas por tipo de propiedad
   * @param {Function} getAccessTokenSilently - Función para obtener el token de acceso de Auth0
   */
  async getPropertyTypeStats(getAccessTokenSilently) {
    try {
      if (!getAccessTokenSilently) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken(getAccessTokenSilently);

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/property-types`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener estadísticas por tipo');
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching property type stats:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas por ubicación
   * @param {Function} getAccessTokenSilently - Función para obtener el token de acceso de Auth0
   */
  async getLocationStats(getAccessTokenSilently) {
    try {
      if (!getAccessTokenSilently) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken(getAccessTokenSilently);

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/locations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener estadísticas por ubicación');
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching location stats:', error);
      throw error;
    }
  }

  /**
   * Obtiene las propiedades más recientes
   * @param {Function} getAccessTokenSilently - Función para obtener el token de acceso de Auth0
   * @param {number} limit - Número máximo de propiedades a obtener (por defecto 4)
   */
  async getRecentProperties(getAccessTokenSilently, limit = 4) {
    try {
      if (!getAccessTokenSilently) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken(getAccessTokenSilently);

      const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/recent-properties?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Error al obtener propiedades recientes');
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching recent properties:', error);
      throw error;
    }
  }
}

// Crear instancia única del servicio
export const dashboardService = new DashboardService();