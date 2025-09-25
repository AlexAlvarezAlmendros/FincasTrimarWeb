import { executeQuery } from '../db/client.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

/**
 * Repositorio para operaciones de la tabla Vivienda
 */
class ViviendaRepository {
  
  /**
   * Obtiene viviendas con filtros y paginación
   */
  async findAll({ 
    q, minPrice, maxPrice, rooms, bathRooms, tipoInmueble, tipoVivienda,
    provincia, poblacion, published = true, page = 1, pageSize = 20 
  } = {}) {
    try {
      const conditions = [];
      const params = [];
      
      // Filtro de publicación
      if (published !== undefined) {
        conditions.push('Published = ?');
        params.push(published ? 1 : 0);
      }
      
      // Búsqueda de texto libre
      if (q) {
        conditions.push('(Name LIKE ? OR Description LIKE ? OR Poblacion LIKE ?)');
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      // Filtros de precio
      if (minPrice !== undefined) {
        conditions.push('Price >= ?');
        params.push(minPrice);
      }
      
      if (maxPrice !== undefined) {
        conditions.push('Price <= ?');
        params.push(maxPrice);
      }
      
      // Filtros de características
      if (rooms !== undefined) {
        conditions.push('Rooms >= ?');
        params.push(rooms);
      }
      
      if (bathRooms !== undefined) {
        conditions.push('BathRooms >= ?');
        params.push(bathRooms);
      }
      
      if (tipoInmueble) {
        conditions.push('TipoInmueble = ?');
        params.push(tipoInmueble);
      }
      
      if (tipoVivienda) {
        conditions.push('TipoVivienda = ?');
        params.push(tipoVivienda);
      }
      
      if (provincia) {
        conditions.push('Provincia = ?');
        params.push(provincia);
      }
      
      if (poblacion) {
        conditions.push('Poblacion = ?');
        params.push(poblacion);
      }
      
      // Construir WHERE clause
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Calcular offset para paginación
      const offset = (page - 1) * pageSize;
      
      // Query principal con paginación
      const sql = `
        SELECT * FROM Vivienda 
        ${whereClause}
        ORDER BY FechaPublicacion DESC 
        LIMIT ? OFFSET ?
      `;
      
      params.push(pageSize, offset);
      
      const result = await executeQuery(sql, params);
      
      // Query para contar total de resultados
      const countSql = `SELECT COUNT(*) as total FROM Vivienda ${whereClause}`;
      const countResult = await executeQuery(countSql, params.slice(0, -2)); // Remover LIMIT y OFFSET
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
      logger.error('Error en ViviendaRepository.findAll:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene una vivienda por ID con sus imágenes
   */
  async findById(id) {
    try {
      // Obtener vivienda
      const viviendaResult = await executeQuery(
        'SELECT * FROM Vivienda WHERE Id = ?',
        [id]
      );
      
      if (viviendaResult.rows.length === 0) {
        return null;
      }
      
      // Obtener imágenes
      const imagenesResult = await executeQuery(
        'SELECT * FROM ImagenesVivienda WHERE ViviendaId = ? ORDER BY Orden ASC',
        [id]
      );
      
      const vivienda = this.transformRow(viviendaResult.rows[0]);
      vivienda.imagenes = imagenesResult.rows;
      
      return vivienda;
    } catch (error) {
      logger.error('Error en ViviendaRepository.findById:', error);
      throw error;
    }
  }
  
  /**
   * Crea una nueva vivienda
   */
  async create(viviendaData) {
    try {
      const id = uuidv4();
      const fechaPublicacion = viviendaData.published ? new Date().toISOString() : null;
      const caracteristicasJson = JSON.stringify(viviendaData.caracteristicas || []);
      
      await executeQuery(`
        INSERT INTO Vivienda (
          Id, Name, ShortDescription, Description, Price, Rooms, BathRooms,
          Garage, SquaredMeters, Provincia, Poblacion, Calle, Numero,
          TipoInmueble, TipoVivienda, Estado, Planta, TipoAnuncio,
          EstadoVenta, Caracteristicas, Published, FechaPublicacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, viviendaData.name, viviendaData.shortDescription, viviendaData.description,
        viviendaData.price, viviendaData.rooms || 0, viviendaData.bathRooms || 0,
        viviendaData.garage || 0, viviendaData.squaredMeters, viviendaData.provincia,
        viviendaData.poblacion, viviendaData.calle, viviendaData.numero,
        viviendaData.tipoInmueble, viviendaData.tipoVivienda, viviendaData.estado,
        viviendaData.planta, viviendaData.tipoAnuncio, viviendaData.estadoVenta,
        caracteristicasJson, viviendaData.published ? 1 : 0, fechaPublicacion
      ]);
      
      return await this.findById(id);
    } catch (error) {
      logger.error('Error en ViviendaRepository.create:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza una vivienda existente
   */
  async update(id, viviendaData) {
    try {
      const caracteristicasJson = JSON.stringify(viviendaData.caracteristicas || []);
      const fechaPublicacion = viviendaData.published ? new Date().toISOString() : null;
      
      await executeQuery(`
        UPDATE Vivienda SET
          Name = ?, ShortDescription = ?, Description = ?, Price = ?, Rooms = ?,
          BathRooms = ?, Garage = ?, SquaredMeters = ?, Provincia = ?, Poblacion = ?,
          Calle = ?, Numero = ?, TipoInmueble = ?, TipoVivienda = ?, Estado = ?,
          Planta = ?, TipoAnuncio = ?, EstadoVenta = ?, Caracteristicas = ?,
          Published = ?, FechaPublicacion = ?, UpdatedAt = CURRENT_TIMESTAMP
        WHERE Id = ?
      `, [
        viviendaData.name, viviendaData.shortDescription, viviendaData.description,
        viviendaData.price, viviendaData.rooms || 0, viviendaData.bathRooms || 0,
        viviendaData.garage || 0, viviendaData.squaredMeters, viviendaData.provincia,
        viviendaData.poblacion, viviendaData.calle, viviendaData.numero,
        viviendaData.tipoInmueble, viviendaData.tipoVivienda, viviendaData.estado,
        viviendaData.planta, viviendaData.tipoAnuncio, viviendaData.estadoVenta,
        caracteristicasJson, viviendaData.published ? 1 : 0, fechaPublicacion, id
      ]);
      
      return await this.findById(id);
    } catch (error) {
      logger.error('Error en ViviendaRepository.update:', error);
      throw error;
    }
  }
  
  /**
   * Elimina una vivienda
   */
  async delete(id) {
    try {
      const result = await executeQuery('DELETE FROM Vivienda WHERE Id = ?', [id]);
      return result.rowsAffected > 0;
    } catch (error) {
      logger.error('Error en ViviendaRepository.delete:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza solo el estado de publicación
   */
  async updatePublishStatus(id, published) {
    try {
      const fechaPublicacion = published ? new Date().toISOString() : null;
      
      await executeQuery(`
        UPDATE Vivienda SET 
          Published = ?, 
          FechaPublicacion = ?,
          UpdatedAt = CURRENT_TIMESTAMP
        WHERE Id = ?
      `, [published ? 1 : 0, fechaPublicacion, id]);
      
      return await this.findById(id);
    } catch (error) {
      logger.error('Error en ViviendaRepository.updatePublishStatus:', error);
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
      name: row.Name,
      shortDescription: row.ShortDescription,
      description: row.Description,
      price: row.Price,
      rooms: row.Rooms,
      bathRooms: row.BathRooms,
      garage: row.Garage,
      squaredMeters: row.SquaredMeters,
      provincia: row.Provincia,
      poblacion: row.Poblacion,
      calle: row.Calle,
      numero: row.Numero,
      tipoInmueble: row.TipoInmueble,
      tipoVivienda: row.TipoVivienda,
      estado: row.Estado,
      planta: row.Planta,
      tipoAnuncio: row.TipoAnuncio,
      estadoVenta: row.EstadoVenta,
      caracteristicas: row.Caracteristicas ? JSON.parse(row.Caracteristicas) : [],
      published: Boolean(row.Published),
      fechaPublicacion: row.FechaPublicacion,
      createdAt: row.CreatedAt,
      updatedAt: row.UpdatedAt
    };
  }
}

export default new ViviendaRepository();