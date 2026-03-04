import { executeQuery } from '../db/client.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

/**
 * Repositorio para operaciones de la tabla Agentes
 */
class AgenteRepository {

  /**
   * Obtiene todos los agentes
   * @param {boolean} soloActivos - Si true, solo devuelve agentes activos
   */
  async findAll(soloActivos = false) {
    try {
      const sql = soloActivos
        ? 'SELECT * FROM Agentes WHERE Activo = 1 ORDER BY Nombre ASC'
        : 'SELECT * FROM Agentes ORDER BY Nombre ASC';

      const result = await executeQuery(sql, []);
      return result.rows.map(row => this.transformRow(row));
    } catch (error) {
      logger.error('Error en AgenteRepository.findAll:', error);
      throw error;
    }
  }

  /**
   * Obtiene un agente por ID
   */
  async findById(id) {
    try {
      const result = await executeQuery('SELECT * FROM Agentes WHERE Id = ?', [id]);
      if (result.rows.length === 0) return null;
      return this.transformRow(result.rows[0]);
    } catch (error) {
      logger.error('Error en AgenteRepository.findById:', error);
      throw error;
    }
  }

  /**
   * Obtiene un agente por nombre
   */
  async findByNombre(nombre) {
    try {
      const result = await executeQuery('SELECT * FROM Agentes WHERE Nombre = ?', [nombre]);
      if (result.rows.length === 0) return null;
      return this.transformRow(result.rows[0]);
    } catch (error) {
      logger.error('Error en AgenteRepository.findByNombre:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo agente
   */
  async create(nombre) {
    try {
      const id = uuidv4();
      await executeQuery(
        'INSERT INTO Agentes (Id, Nombre, Activo) VALUES (?, ?, 1)',
        [id, nombre.trim()]
      );
      return await this.findById(id);
    } catch (error) {
      logger.error('Error en AgenteRepository.create:', error);
      throw error;
    }
  }

  /**
   * Actualiza un agente existente
   */
  async update(id, { nombre, activo }) {
    try {
      const fields = [];
      const values = [];

      if (nombre !== undefined) {
        fields.push('Nombre = ?');
        values.push(nombre.trim());
      }
      if (activo !== undefined) {
        fields.push('Activo = ?');
        values.push(activo ? 1 : 0);
      }

      fields.push('UpdatedAt = CURRENT_TIMESTAMP');
      values.push(id);

      await executeQuery(
        `UPDATE Agentes SET ${fields.join(', ')} WHERE Id = ?`,
        values
      );

      return await this.findById(id);
    } catch (error) {
      logger.error('Error en AgenteRepository.update:', error);
      throw error;
    }
  }

  /**
   * Elimina un agente por ID
   */
  async delete(id) {
    try {
      await executeQuery('DELETE FROM Agentes WHERE Id = ?', [id]);
    } catch (error) {
      logger.error('Error en AgenteRepository.delete:', error);
      throw error;
    }
  }

  transformRow(row) {
    return {
      id: row.Id,
      nombre: row.Nombre,
      activo: Boolean(row.Activo),
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    };
  }
}

export default new AgenteRepository();
