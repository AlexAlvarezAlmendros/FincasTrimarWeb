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
   * @param {Function} getAccessToken - Función para obtener el token de acceso de Auth0
   */
  async getDashboardStats(getAccessToken) {
    try {
      if (!getAccessToken) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken();

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
   * @param {Function} getAccessToken - Función para obtener el token de acceso de Auth0
   */
  async getMonthlySales(getAccessToken) {
    try {
      if (!getAccessToken) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken();

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
   * @param {Function} getAccessToken - Función para obtener el token de acceso de Auth0
   */
  async getPropertyTypeStats(getAccessToken) {
    try {
      if (!getAccessToken) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken();

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
   * @param {Function} getAccessToken - Función para obtener el token de acceso de Auth0
   */
  async getLocationStats(getAccessToken) {
    try {
      if (!getAccessToken) {
        throw new Error('Función de autenticación requerida');
      }

      // Obtener token de autenticación
      const token = await getAccessToken();

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
}

// Crear instancia única del servicio
export const dashboardService = new DashboardService();