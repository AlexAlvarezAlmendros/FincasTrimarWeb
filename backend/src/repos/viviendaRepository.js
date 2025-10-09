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
      logger.info(`🔍 findAll llamado con pageSize=${pageSize}, published=${published}`);
      
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
      
      // Query principal con paginación - SELECT específico para evitar problemas de memoria
      const sql = `
        SELECT 
          Id, Name, ShortDescription, Price, Rooms, BathRooms, Garage, 
          SquaredMeters, Provincia, Poblacion, Calle, Numero, TipoInmueble, 
          TipoVivienda, Estado, Planta, TipoAnuncio, EstadoVenta, 
          Published, FechaPublicacion, CreatedAt, UpdatedAt,
          CASE 
            WHEN LENGTH(Description) > 1000 THEN SUBSTR(Description, 1, 1000) || '...' 
            ELSE Description 
          END as Description,
          CASE 
            WHEN LENGTH(Caracteristicas) > 5000 THEN '[]' 
            ELSE Caracteristicas 
          END as Caracteristicas
        FROM Vivienda 
        ${whereClause}
        ORDER BY FechaPublicacion DESC 
        LIMIT ? OFFSET ?
      `;
      
      params.push(pageSize, offset);
      
      logger.info(`🔍 Ejecutando consulta optimizada con LIMIT ${pageSize}`);
      const result = await executeQuery(sql, params);
      
      // Query para contar total de resultados
      const countSql = `SELECT COUNT(*) as total FROM Vivienda ${whereClause}`;
      const countParams = params.slice(0, -2); // Remover LIMIT y OFFSET
      const countResult = await executeQuery(countSql, countParams);
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
      
      // Preparar parámetros y validar cada uno
      const params = [
        id,                                           // 1: Id
        viviendaData.name,                           // 2: Name
        viviendaData.shortDescription || null,       // 3: ShortDescription
        viviendaData.description || null,            // 4: Description
        Number(viviendaData.price),                  // 5: Price
        Number(viviendaData.rooms) || 0,             // 6: Rooms
        Number(viviendaData.bathRooms) || 0,         // 7: BathRooms
        Number(viviendaData.garage) || 0,            // 8: Garage
        Number(viviendaData.squaredMeters) || null,  // 9: SquaredMeters
        viviendaData.provincia || null,              // 10: Provincia
        viviendaData.poblacion || null,              // 11: Poblacion
        viviendaData.calle || null,                  // 12: Calle
        viviendaData.numero || null,                 // 13: Numero
        viviendaData.tipoInmueble || null,           // 14: TipoInmueble
        viviendaData.tipoVivienda || null,           // 15: TipoVivienda
        viviendaData.estado || null,                 // 16: Estado
        viviendaData.planta || null,                 // 17: Planta
        viviendaData.tipoAnuncio || null,            // 18: TipoAnuncio
        viviendaData.estadoVenta || null,            // 19: EstadoVenta
        caracteristicasJson,                         // 20: Caracteristicas
        viviendaData.published ? 1 : 0,              // 21: Published
        fechaPublicacion                             // 22: FechaPublicacion
      ];

      // Log detallado de parámetros para debugging
      logger.info('🔍 Parámetros para INSERT:', params.map((param, index) => ({
        index: index + 1,
        value: param,
        type: typeof param,
        isNull: param === null,
        isUndefined: param === undefined
      })));

      await executeQuery(`
        INSERT INTO Vivienda (
          Id, Name, ShortDescription, Description, Price, Rooms, BathRooms,
          Garage, SquaredMeters, Provincia, Poblacion, Calle, Numero,
          TipoInmueble, TipoVivienda, Estado, Planta, TipoAnuncio,
          EstadoVenta, Caracteristicas, Published, FechaPublicacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, params);
      
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

  /**
   * Obtiene el conteo de propiedades por estado de venta
   */
  async getPropertyCountsByStatus() {
    try {
      const query = `
        SELECT EstadoVenta as status, COUNT(*) as count
        FROM Vivienda
        WHERE Published = 1
        GROUP BY EstadoVenta
      `;
      
      const result = await executeQuery(query, []);
      return result.rows;
    } catch (error) {
      logger.error('Error getting property counts by status:', error);
      throw error;
    }
  }

  /**
   * Obtiene el conteo total de propiedades
   */
  async getTotalPropertiesCount() {
    try {
      const query = 'SELECT COUNT(*) as count FROM Vivienda';
      const result = await executeQuery(query, []);
      return result.rows[0]?.count || 0;
    } catch (error) {
      logger.error('Error getting total properties count:', error);
      throw error;
    }
  }

  /**
   * Obtiene el conteo de propiedades publicadas
   */
  async getPublishedPropertiesCount() {
    try {
      const query = 'SELECT COUNT(*) as count FROM Vivienda WHERE Published = 1';
      const result = await executeQuery(query, []);
      return result.rows[0]?.count || 0;
    } catch (error) {
      logger.error('Error getting published properties count:', error);
      throw error;
    }
  }

  /**
   * Obtiene las ventas mensuales (propiedades vendidas/cerradas)
   */
  async getMonthlySales() {
    try {
      const query = `
        SELECT 
          strftime('%Y-%m', FechaPublicacion) as month,
          COUNT(*) as sales,
          SUM(Price) as revenue
        FROM Vivienda
        WHERE EstadoVenta IN ('Vendida', 'Cerrada')
          AND FechaPublicacion IS NOT NULL
          AND FechaPublicacion >= date('now', '-12 months')
        GROUP BY strftime('%Y-%m', FechaPublicacion)
        ORDER BY month ASC
      `;
      
      const result = await executeQuery(query, []);
      return result.rows;
    } catch (error) {
      logger.error('Error getting monthly sales:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas por tipo de propiedad
   */
  async getPropertyTypeStats() {
    try {
      const query = `
        SELECT 
          TipoVivienda as type,
          COUNT(*) as count,
          AVG(Price) as averagePrice,
          MIN(Price) as minPrice,
          MAX(Price) as maxPrice
        FROM Vivienda
        WHERE Published = 1
        GROUP BY TipoVivienda
        ORDER BY count DESC
      `;
      
      const result = await executeQuery(query, []);
      return result.rows;
    } catch (error) {
      logger.error('Error getting property type stats:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas por ubicación
   */
  async getLocationStats() {
    try {
      const query = `
        SELECT 
          Poblacion as location,
          COUNT(*) as count,
          AVG(Price) as averagePrice
        FROM Vivienda
        WHERE Published = 1
          AND Poblacion IS NOT NULL
        GROUP BY Poblacion
        ORDER BY count DESC
        LIMIT 10
      `;
      
      const result = await executeQuery(query, []);
      return result.rows;
    } catch (error) {
      logger.error('Error getting location stats:', error);
      throw error;
    }
  }
}

export default new ViviendaRepository();