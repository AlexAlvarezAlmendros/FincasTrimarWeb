import agenteService from '../services/agenteService.js';
import { logger } from '../utils/logger.js';

/**
 * Controlador para gestión de agentes captadores
 */
const agenteController = {

  /**
   * GET /api/v1/agentes
   * Obtiene la lista de agentes (activos por defecto)
   */
  async getAgentes(req, res, next) {
    try {
      const soloActivos = req.query.soloActivos !== 'false'; // por defecto true
      const agentes = await agenteService.getAgentes(soloActivos);

      res.json({
        success: true,
        data: agentes
      });
    } catch (error) {
      logger.error('Error getting agentes:', error);
      next(error);
    }
  },

  /**
   * POST /api/v1/agentes
   * Crea un nuevo agente (Admin)
   */
  async createAgente(req, res, next) {
    try {
      const { nombre } = req.body;
      const agente = await agenteService.createAgente(nombre);

      res.status(201).json({
        success: true,
        data: agente,
        message: 'Agente creado correctamente'
      });
    } catch (error) {
      logger.error('Error creating agente:', error);
      next(error);
    }
  },

  /**
   * PUT /api/v1/agentes/:id
   * Actualiza un agente (Admin)
   */
  async updateAgente(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, activo } = req.body;
      const agente = await agenteService.updateAgente(id, { nombre, activo });

      res.json({
        success: true,
        data: agente,
        message: 'Agente actualizado correctamente'
      });
    } catch (error) {
      logger.error('Error updating agente:', error);
      next(error);
    }
  },

  /**
   * DELETE /api/v1/agentes/:id
   * Elimina un agente (Admin)
   */
  async deleteAgente(req, res, next) {
    try {
      const { id } = req.params;
      await agenteService.deleteAgente(id);

      res.json({
        success: true,
        message: 'Agente eliminado correctamente'
      });
    } catch (error) {
      logger.error('Error deleting agente:', error);
      next(error);
    }
  }
};

export default agenteController;
