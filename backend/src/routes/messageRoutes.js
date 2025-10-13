import { Router } from 'express';
import messageController from '../controllers/messageController.js';
import { validateMessage, validateContactForm, validateUUID } from '../middlewares/validationMiddleware.js';

// Rutas públicas para mensajes
const publicRoutes = Router();

/**
 * @route POST /api/v1/messages
 * @desc Crear nuevo mensaje de contacto
 * @access Public
 */
publicRoutes.post('/messages', validateMessage, messageController.createMessage);

/**
 * @route POST /api/v1/messages/send-contact
 * @desc Enviar mensaje de contacto con validación estricta y email automático
 * @access Public
 */
publicRoutes.post('/messages/send-contact', validateContactForm, messageController.sendContact);

// Rutas privadas para mensajes (requieren autenticación de Admin)
const privateRoutes = Router();

/**
 * @route GET /api/v1/messages
 * @desc Obtener lista de mensajes con filtros
 * @access Private (Admin)
 */
privateRoutes.get('/messages', messageController.getMessages);

/**
 * @route GET /api/v1/messages/stats
 * @desc Obtener estadísticas de mensajes
 * @access Private (Admin)
 */
privateRoutes.get('/messages/stats', messageController.getStats);

/**
 * @route GET /api/v1/messages/recent
 * @desc Obtener mensajes recientes
 * @access Private (Admin)
 */
privateRoutes.get('/messages/recent', messageController.getRecentMessages);

/**
 * @route GET /api/v1/messages/:id
 * @desc Obtener un mensaje específico por ID
 * @access Private (Admin)
 */
privateRoutes.get('/messages/:id', validateUUID('id'), messageController.getMessageById);

/**
 * @route PATCH /api/v1/messages/:id
 * @desc Actualizar estado de un mensaje
 * @access Private (Admin)
 */
privateRoutes.patch('/messages/:id', validateUUID('id'), messageController.updateMessageStatus);

/**
 * @route PATCH /api/v1/messages/:id/pin
 * @desc Alternar estado de pin de un mensaje
 * @access Private (Admin)
 */
privateRoutes.patch('/messages/:id/pin', validateUUID('id'), messageController.togglePin);

/**
 * @route DELETE /api/v1/messages/:id
 * @desc Eliminar un mensaje
 * @access Private (Admin)
 */
privateRoutes.delete('/messages/:id', validateUUID('id'), messageController.deleteMessage);

export { publicRoutes, privateRoutes };