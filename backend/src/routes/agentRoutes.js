import { Router } from 'express';
import agenteController from '../controllers/agenteController.js';
import { validateUUID } from '../middlewares/validationMiddleware.js';

/**
 * Rutas para gestión de agentes captadores
 * GET /api/v1/agentes       → listar (protegido: requiere JWT)
 * POST /api/v1/agentes      → crear (Admin)
 * PUT /api/v1/agentes/:id   → editar (Admin)
 * DELETE /api/v1/agentes/:id → eliminar (Admin)
 */
const agentRoutes = Router();

agentRoutes.get('/agentes', agenteController.getAgentes);
agentRoutes.post('/agentes', agenteController.createAgente);
agentRoutes.put('/agentes/:id', validateUUID('id'), agenteController.updateAgente);
agentRoutes.delete('/agentes/:id', validateUUID('id'), agenteController.deleteAgente);

export default agentRoutes;
