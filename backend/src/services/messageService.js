import mensajeRepository from '../repos/mensajeRepository.js';
import viviendaRepository from '../repos/viviendaRepository.js';
import { logger } from '../utils/logger.js';

/**
 * Servicio para gestión de mensajes de contacto
 * Implementa la lógica de negocio para mensajes
 */
class MessageService {
  
  /**
   * Obtiene mensajes con filtros y paginación
   */
  async getMessages(filters = {}) {
    try {
      logger.info('Obteniendo mensajes con filtros:', filters);
      
      const result = await mensajeRepository.findAll({
        viviendaId: filters.viviendaId,
        estado: filters.estado,
        pinned: filters.pinned,
        page: filters.page || 1,
        pageSize: filters.pageSize || 20
      });
      
      return result;
    } catch (error) {
      logger.error('Error en MessageService.getMessages:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un mensaje por ID
   */
  async getMessageById(id) {
    try {
      logger.info(`Obteniendo mensaje con ID: ${id}`);
      
      const message = await mensajeRepository.findById(id);
      
      if (!message) {
        const error = new Error('Mensaje no encontrado');
        error.statusCode = 404;
        error.code = 'MESSAGE_NOT_FOUND';
        throw error;
      }
      
      return message;
    } catch (error) {
      logger.error('Error en MessageService.getMessageById:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo mensaje de contacto
   */
  async createMessage(messageData) {
    try {
      logger.info('Creando nuevo mensaje de contacto');
      
      // Validaciones de negocio
      if (!messageData.nombre || messageData.nombre.trim().length < 2) {
        const error = new Error('El nombre debe tener al menos 2 caracteres');
        error.statusCode = 400;
        error.code = 'INVALID_NAME';
        throw error;
      }
      
      if (!messageData.email || !this.isValidEmail(messageData.email)) {
        const error = new Error('El email no es válido');
        error.statusCode = 400;
        error.code = 'INVALID_EMAIL';
        throw error;
      }
      
      if (!messageData.descripcion || messageData.descripcion.trim().length < 10) {
        const error = new Error('La descripción debe tener al menos 10 caracteres');
        error.statusCode = 400;
        error.code = 'INVALID_DESCRIPTION';
        throw error;
      }
      
      // Validar que la vivienda existe si se especifica
      if (messageData.viviendaId) {
        const property = await viviendaRepository.findById(messageData.viviendaId);
        if (!property) {
          const error = new Error('La vivienda especificada no existe');
          error.statusCode = 400;
          error.code = 'PROPERTY_NOT_FOUND';
          throw error;
        }
      }
      
      // Limpiar y normalizar datos
      const cleanData = {
        ...messageData,
        nombre: messageData.nombre.trim(),
        email: messageData.email.toLowerCase().trim(),
        telefono: messageData.telefono?.trim() || null,
        asunto: messageData.asunto?.trim() || 'Consulta sobre propiedad',
        descripcion: messageData.descripcion.trim(),
        estado: 'Nuevo',
        pinned: false
      };
      
      const newMessage = await mensajeRepository.create(cleanData);
      
      // TODO: Aquí se enviaría el email de notificación
      logger.info(`Mensaje creado exitosamente con ID: ${newMessage.id}`);
      
      return newMessage;
    } catch (error) {
      logger.error('Error en MessageService.createMessage:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza el estado de un mensaje
   */
  async updateMessageStatus(id, updateData) {
    try {
      logger.info(`Actualizando estado del mensaje ID: ${id}`);
      
      // Verificar que el mensaje existe
      const existingMessage = await mensajeRepository.findById(id);
      if (!existingMessage) {
        const error = new Error('Mensaje no encontrado');
        error.statusCode = 404;
        error.code = 'MESSAGE_NOT_FOUND';
        throw error;
      }
      
      // Validar estado si se proporciona
      if (updateData.estado) {
        const validStates = ['Nuevo', 'EnCurso', 'Cerrado'];
        if (!validStates.includes(updateData.estado)) {
          const error = new Error(`Estado inválido. Debe ser uno de: ${validStates.join(', ')}`);
          error.statusCode = 400;
          error.code = 'INVALID_STATE';
          throw error;
        }
      }
      
      const updatedMessage = await mensajeRepository.update(id, updateData);
      
      logger.info(`Estado del mensaje actualizado exitosamente: ${id}`);
      return updatedMessage;
    } catch (error) {
      logger.error('Error en MessageService.updateMessageStatus:', error);
      throw error;
    }
  }
  
  /**
   * Alterna el estado de pin de un mensaje
   */
  async togglePinMessage(id) {
    try {
      const message = await mensajeRepository.findById(id);
      if (!message) {
        const error = new Error('Mensaje no encontrado');
        error.statusCode = 404;
        error.code = 'MESSAGE_NOT_FOUND';
        throw error;
      }
      
      const updatedMessage = await mensajeRepository.update(id, {
        pinned: !message.pinned
      });
      
      logger.info(`Pin del mensaje ${id} cambiado a: ${!message.pinned}`);
      return updatedMessage;
    } catch (error) {
      logger.error('Error en MessageService.togglePinMessage:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un mensaje
   */
  async deleteMessage(id) {
    try {
      logger.info(`Eliminando mensaje ID: ${id}`);
      
      // Verificar que el mensaje existe
      const existingMessage = await mensajeRepository.findById(id);
      if (!existingMessage) {
        const error = new Error('Mensaje no encontrado');
        error.statusCode = 404;
        error.code = 'MESSAGE_NOT_FOUND';
        throw error;
      }
      
      const deleted = await mensajeRepository.delete(id);
      
      if (deleted) {
        logger.info(`Mensaje eliminado exitosamente: ${id}`);
      }
      
      return deleted;
    } catch (error) {
      logger.error('Error en MessageService.deleteMessage:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de mensajes
   */
  async getStats() {
    try {
      const stats = await mensajeRepository.getStats();
      return stats;
    } catch (error) {
      logger.error('Error en MessageService.getStats:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene mensajes recientes
   */
  async getRecentMessages(limit = 5) {
    try {
      const result = await mensajeRepository.findAll({
        pageSize: limit,
        page: 1
      });
      
      return result.data;
    } catch (error) {
      logger.error('Error en MessageService.getRecentMessages:', error);
      throw error;
    }
  }
  
  /**
   * Valida formato de email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Exportar instancia singleton
export default new MessageService();