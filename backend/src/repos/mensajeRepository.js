import { executeQuery } from '../db/client.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

/**
 * Repositorio para operaciones de la tabla Mensaje
 */
class MensajeRepository {
  
  /**
   * Obtiene mensajes con filtros y paginación
   */
  async findAll({ 
    viviendaId, estado, pinned, page = 1, pageSize = 20 
  } = {}) {
    try {
      const conditions = [];
      const params = [];
      
      // Filtros opcionales
      if (viviendaId) {
        conditions.push('ViviendaId = ?');
        params.push(viviendaId);
      }
      
      if (estado) {
        conditions.push('Estado = ?');
        params.push(estado);
      }
      
      if (pinned !== undefined) {
        conditions.push('Pinned = ?');
        params.push(pinned ? 1 : 0);
      }
      
      // Construir WHERE clause
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Calcular offset para paginación
      const offset = (page - 1) * pageSize;
      
      // Query principal con información de la vivienda
      const sql = `
        SELECT 
          m.*,
          v.Name as ViviendaNombre,
          v.Price as ViviendaPrecio,
          v.Poblacion as ViviendaPoblacion
        FROM Mensaje m
        LEFT JOIN Vivienda v ON m.ViviendaId = v.Id
        ${whereClause}
        ORDER BY m.Pinned DESC, m.Fecha DESC
        LIMIT ? OFFSET ?
      `;
      
      params.push(pageSize, offset);
      
      const result = await executeQuery(sql, params);
      
      // Query para contar total
      const countSql = `SELECT COUNT(*) as total FROM Mensaje m ${whereClause}`;
      const countResult = await executeQuery(countSql, params.slice(0, -2));
      const total = countResult.rows[0].total;
      
      return {
        data: result.rows.map(this.transformRow),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      };
    } catch (error) {
      logger.error('Error en MensajeRepository.findAll:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un mensaje por ID
   */
  async findById(id) {
    try {
      const result = await executeQuery(`
        SELECT 
          m.*,
          v.Name as ViviendaNombre,
          v.Price as ViviendaPrecio,
          v.Poblacion as ViviendaPoblacion
        FROM Mensaje m
        LEFT JOIN Vivienda v ON m.ViviendaId = v.Id
        WHERE m.Id = ?
      `, [id]);
      
      return result.rows.length > 0 ? this.transformRow(result.rows[0]) : null;
    } catch (error) {
      logger.error('Error en MensajeRepository.findById:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo mensaje
   */
  async create(mensajeData) {
    try {
      const id = uuidv4();
      const fecha = new Date().toISOString();
      
      await executeQuery(`
        INSERT INTO Mensaje (
          Id, ViviendaId, Nombre, Email, Telefono, Asunto, 
          Descripcion, Estado, Pinned, Fecha
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, mensajeData.viviendaId, mensajeData.nombre, mensajeData.email,
        mensajeData.telefono, mensajeData.asunto, mensajeData.descripcion,
        mensajeData.estado || 'Nuevo', mensajeData.pinned ? 1 : 0, fecha
      ]);
      
      return await this.findById(id);
    } catch (error) {
      logger.error('Error en MensajeRepository.create:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un mensaje (principalmente estado y pinned)
   */
  async update(id, updateData) {
    try {
      const { estado, pinned } = updateData;
      
      await executeQuery(`
        UPDATE Mensaje SET
          Estado = COALESCE(?, Estado),
          Pinned = COALESCE(?, Pinned),
          UpdatedAt = CURRENT_TIMESTAMP
        WHERE Id = ?
      `, [estado, pinned !== undefined ? (pinned ? 1 : 0) : null, id]);
      
      return await this.findById(id);
    } catch (error) {
      logger.error('Error en MensajeRepository.update:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un mensaje
   */
  async delete(id) {
    try {
      const result = await executeQuery('DELETE FROM Mensaje WHERE Id = ?', [id]);
      return result.rowsAffected > 0;
    } catch (error) {
      logger.error('Error en MensajeRepository.delete:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene estadísticas de mensajes
   */
  async getStats() {
    try {
      const result = await executeQuery(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN Estado = 'Nuevo' THEN 1 ELSE 0 END) as nuevos,
          SUM(CASE WHEN Estado = 'EnCurso' THEN 1 ELSE 0 END) as enCurso,
          SUM(CASE WHEN Estado = 'Cerrado' THEN 1 ELSE 0 END) as cerrados,
          SUM(CASE WHEN Pinned = 1 THEN 1 ELSE 0 END) as pinned
        FROM Mensaje
      `);
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error en MensajeRepository.getStats:', error);
      throw error;
    }
  }
  
  /**
   * Transforma una fila de la DB al formato del modelo
   */
  transformRow(row) {
    if (!row) return null;
    
    return {
      id: row.Id,
      viviendaId: row.ViviendaId,
      nombre: row.Nombre,
      email: row.Email,
      telefono: row.Telefono,
      asunto: row.Asunto,
      descripcion: row.Descripcion,
      estado: row.Estado,
      pinned: Boolean(row.Pinned),
      fecha: row.Fecha,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt,
      // Información de la vivienda asociada
      vivienda: row.ViviendaNombre ? {
        nombre: row.ViviendaNombre,
        precio: row.ViviendaPrecio,
        poblacion: row.ViviendaPoblacion
      } : null
    };
  }
}

export default new MensajeRepository();