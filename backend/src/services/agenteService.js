import agenteRepository from '../repos/agenteRepository.js';
import { logger } from '../utils/logger.js';

/**
 * Servicio para gestión de agentes captadores
 */
class AgenteService {

  /**
   * Obtiene todos los agentes
   * @param {boolean} soloActivos
   */
  async getAgentes(soloActivos = false) {
    try {
      logger.info(`Obteniendo agentes (soloActivos=${soloActivos})`);
      return await agenteRepository.findAll(soloActivos);
    } catch (error) {
      logger.error('Error en AgenteService.getAgentes:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo agente
   * @param {string} nombre
   */
  async createAgente(nombre) {
    try {
      if (!nombre || nombre.trim().length < 2) {
        const error = new Error('El nombre del agente debe tener al menos 2 caracteres');
        error.statusCode = 400;
        throw error;
      }

      // Verificar duplicado
      const existing = await agenteRepository.findByNombre(nombre.trim());
      if (existing) {
        const error = new Error(`Ya existe un agente con el nombre "${nombre.trim()}"`);
        error.statusCode = 409;
        throw error;
      }

      logger.info(`Creando agente: ${nombre}`);
      return await agenteRepository.create(nombre);
    } catch (error) {
      logger.error('Error en AgenteService.createAgente:', error);
      throw error;
    }
  }

  /**
   * Actualiza un agente
   * @param {string} id
   * @param {Object} data - { nombre?, activo? }
   */
  async updateAgente(id, data) {
    try {
      const existing = await agenteRepository.findById(id);
      if (!existing) {
        const error = new Error('Agente no encontrado');
        error.statusCode = 404;
        throw error;
      }

      if (data.nombre !== undefined) {
        if (data.nombre.trim().length < 2) {
          const error = new Error('El nombre debe tener al menos 2 caracteres');
          error.statusCode = 400;
          throw error;
        }
        // Comprobar duplicado de nombre (excluyendo el actual)
        const dup = await agenteRepository.findByNombre(data.nombre.trim());
        if (dup && dup.id !== id) {
          const error = new Error(`Ya existe un agente con el nombre "${data.nombre.trim()}"`);
          error.statusCode = 409;
          throw error;
        }
      }

      logger.info(`Actualizando agente ${id}:`, data);
      return await agenteRepository.update(id, data);
    } catch (error) {
      logger.error('Error en AgenteService.updateAgente:', error);
      throw error;
    }
  }

  /**
   * Elimina un agente
   * @param {string} id
   */
  async deleteAgente(id) {
    try {
      const existing = await agenteRepository.findById(id);
      if (!existing) {
        const error = new Error('Agente no encontrado');
        error.statusCode = 404;
        throw error;
      }

      logger.info(`Eliminando agente ${id}`);
      await agenteRepository.delete(id);
    } catch (error) {
      logger.error('Error en AgenteService.deleteAgente:', error);
      throw error;
    }
  }
}

export default new AgenteService();
