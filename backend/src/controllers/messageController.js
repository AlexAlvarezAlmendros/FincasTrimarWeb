import messageService from '../services/messageService.js';
import { logger } from '../utils/logger.js';

/**
 * Controlador para gestión de mensajes de contacto
 * Maneja las peticiones HTTP para las operaciones de mensajes
 */

const messageController = {
  /**
   * GET /api/v1/messages
   * Obtiene lista de mensajes con filtros opcionales (Admin)
   */
  async getMessages(req, res, next) {
    try {
      const filters = {
        viviendaId: req.query.viviendaId,
        estado: req.query.estado,
        pinned: req.query.pinned === 'true' ? true : req.query.pinned === 'false' ? false : undefined,
        page: req.query.page ? parseInt(req.query.page) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 20
      };
      
      const result = await messageService.getMessages(filters);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error('Error getting messages:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/messages/:id
   * Obtiene un mensaje por ID (Admin)
   */
  async getMessageById(req, res, next) {
    try {
      const { id } = req.params;
      const message = await messageService.getMessageById(id);

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      logger.error('Error getting message by ID:', error);
      next(error);
    }
  },

  /**
   * POST /api/v1/messages
   * Crea un nuevo mensaje de contacto (Público)
   */
  async createMessage(req, res, next) {
    try {
      const messageData = {
        viviendaId: req.body.viviendaId,
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.telefono,
        asunto: req.body.asunto,
        descripcion: req.body.descripcion
      };
      
      const newMessage = await messageService.createMessage(messageData);
      
      res.status(201).json({
        success: true,
        data: newMessage,
        message: 'Mensaje enviado correctamente. Te contactaremos pronto.'
      });
    } catch (error) {
      logger.error('Error creating message:', error);
      next(error);
    }
  },

  /**
   * PATCH /api/v1/messages/:id
   * Actualiza el estado de un mensaje (Admin)
   */
  async updateMessageStatus(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = {
        estado: req.body.estado,
        pinned: req.body.pinned
      };
      
      const updatedMessage = await messageService.updateMessageStatus(id, updateData);
      
      res.json({
        success: true,
        data: updatedMessage,
        message: 'Estado del mensaje actualizado correctamente'
      });
    } catch (error) {
      logger.error('Error updating message status:', error);
      next(error);
    }
  },

  /**
   * PATCH /api/v1/messages/:id/pin
   * Alterna el estado de pin de un mensaje (Admin)
   */
  async togglePin(req, res, next) {
    try {
      const { id } = req.params;
      const updatedMessage = await messageService.togglePinMessage(id);
      
      res.json({
        success: true,
        data: updatedMessage,
        message: `Mensaje ${updatedMessage.pinned ? 'fijado' : 'desfijado'} correctamente`
      });
    } catch (error) {
      logger.error('Error toggling message pin:', error);
      next(error);
    }
  },

  /**
   * DELETE /api/v1/messages/:id
   * Elimina un mensaje (Admin)
   */
  async deleteMessage(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await messageService.deleteMessage(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'MESSAGE_NOT_FOUND',
            message: 'Mensaje no encontrado'
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Mensaje eliminado correctamente'
      });
    } catch (error) {
      logger.error('Error deleting message:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/messages/stats
   * Obtiene estadísticas de mensajes (Admin)
   */
  async getStats(req, res, next) {
    try {
      const stats = await messageService.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting message stats:', error);
      next(error);
    }
  },

  /**
   * GET /api/v1/messages/recent
   * Obtiene mensajes recientes (Admin)
   */
  async getRecentMessages(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 5;
      const recentMessages = await messageService.getRecentMessages(limit);
      
      res.json({
        success: true,
        data: recentMessages
      });
    } catch (error) {
      logger.error('Error getting recent messages:', error);
      next(error);
    }
  }
};

export default messageController;