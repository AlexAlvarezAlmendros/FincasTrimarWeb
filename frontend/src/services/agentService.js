/**
 * Servicio para gestión de agentes captadores
 */
class AgentService {
  constructor(apiUrl = import.meta.env.VITE_API_BASE_URL) {
    this.apiUrl = apiUrl;
    this.baseEndpoint = '/api/v1/agentes';
  }

  /**
   * Obtiene la lista de agentes
   * @param {string} token - Token de autenticación
   * @param {boolean} soloActivos - Si true, solo activos (por defecto true)
   */
  async getAgentes(token, soloActivos = true) {
    const url = `${this.apiUrl}${this.baseEndpoint}?soloActivos=${soloActivos}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) throw new Error('Error al obtener los agentes');
    return response.json();
  }

  /**
   * Crea un nuevo agente
   * @param {string} nombre
   * @param {string} token
   */
  async createAgente(nombre, token) {
    const response = await fetch(`${this.apiUrl}${this.baseEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ nombre })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Error al crear el agente');
    return data;
  }

  /**
   * Actualiza un agente
   * @param {string} id
   * @param {{ nombre?: string, activo?: boolean }} updateData
   * @param {string} token
   */
  async updateAgente(id, updateData, token) {
    const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Error al actualizar el agente');
    return data;
  }

  /**
   * Elimina un agente
   * @param {string} id
   * @param {string} token
   */
  async deleteAgente(id, token) {
    const response = await fetch(`${this.apiUrl}${this.baseEndpoint}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Error al eliminar el agente');
    return data;
  }
}

export default new AgentService();
