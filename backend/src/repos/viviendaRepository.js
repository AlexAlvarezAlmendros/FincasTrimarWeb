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
    provincia, poblacion, estadoVenta, captadoPor, published = true, page = 1, pageSize = 20, includeDrafts = false 
  } = {}) {
    try {
      logger.info(`🔍 findAll llamado con pageSize=${pageSize}, published=${published}, includeDrafts=${includeDrafts}`);
      
      const conditions = [];
      const params = [];
      
      // Filtro de borradores (por defecto excluir borradores en consultas públicas)
      if (!includeDrafts) {
        conditions.push('IsDraft = ?');
        params.push(0);
      }
      
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
      
      // Filtros de captación
      if (estadoVenta) {
        if (Array.isArray(estadoVenta)) {
          // Para array de estados (usado en captación)
          const placeholders = estadoVenta.map(() => '?').join(',');
          conditions.push(`EstadoVenta IN (${placeholders})`);
          params.push(...estadoVenta);
        } else {
          // Para estado único
          conditions.push('EstadoVenta = ?');
          params.push(estadoVenta);
        }
      }
      
      if (captadoPor) {
        conditions.push('CaptadoPor = ?');
        params.push(captadoPor);
      }
      
      // Construir WHERE clause
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Calcular offset para paginación
      const offset = (page - 1) * pageSize;
      
      params.push(pageSize, offset);
      
      logger.info(`🔍 Ejecutando consulta optimizada con LIMIT ${pageSize}`);
      
      // FIX: Turso tiene problemas con LIMIT >= 7 cuando incluye campos grandes (Description, Caracteristicas)
      // Solución: Obtener IDs primero, luego datos individuales
      
      // Paso 1: Obtener solo los IDs (rápido y confiable)
      const idSql = `
        SELECT Id
        FROM Vivienda 
        ${whereClause}
        ORDER BY FechaPublicacion DESC 
        LIMIT ? OFFSET ?
      `;
      
      const idResult = await executeQuery(idSql, params);
      
      if (idResult.rows.length === 0) {
        // Query para contar total
        const countSql = `SELECT COUNT(*) as total FROM Vivienda ${whereClause}`;
        const countParams = params.slice(0, -2);
        const countResult = await executeQuery(countSql, countParams);
        const total = countResult.rows[0].total;
        
        return {
          data: [],
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
          }
        };
      }
      
      // Paso 2: Obtener datos completos para cada ID individualmente
      logger.info(`📦 Obteniendo datos completos para ${idResult.rows.length} propiedades`);
      const properties = [];
      
      for (const row of idResult.rows) {
        const propertyResult = await executeQuery(`
          SELECT 
            Id, Name, ShortDescription, Description, Price, Rooms, BathRooms, Garage, 
            SquaredMeters, Provincia, Poblacion, Calle, Numero, TipoInmueble, 
            TipoVivienda, Estado, Planta, TipoAnuncio, EstadoVenta, 
            Caracteristicas, Published, FechaPublicacion, CreatedAt, UpdatedAt, IsDraft,
            ComisionGanada, CaptadoPor, PorcentajeCaptacion, FechaCaptacion
          FROM Vivienda 
          WHERE Id = ?
        `, [row.Id]);
        
        if (propertyResult.rows.length > 0) {
          properties.push(propertyResult.rows[0]);
        }
      }
      
      // Query para contar total de resultados
      const countSql = `SELECT COUNT(*) as total FROM Vivienda ${whereClause}`;
      const countParams = params.slice(0, -2); // Remover LIMIT y OFFSET
      const countResult = await executeQuery(countSql, countParams);
      const total = countResult.rows[0].total;
      
      return {
        data: properties.map(this.transformRow),
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
   * Obtiene solo las viviendas que son borradores
   */
  async findDrafts({ q, page = 1, pageSize = 20 } = {}) {
    try {
      logger.info(`🔍 findDrafts llamado con pageSize=${pageSize}`);
      
      const conditions = ['IsDraft = ?'];
      const params = [1]; // Solo borradores
      
      // Búsqueda de texto libre en borradores
      if (q) {
        conditions.push('(Name LIKE ? OR Description LIKE ? OR Poblacion LIKE ?)');
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const offset = (page - 1) * pageSize;
      
      // Query para borradores con los mismos campos que findAll
      const sql = `
        SELECT 
          Id, Name, ShortDescription, Description, Price, Rooms, BathRooms, Garage, 
          SquaredMeters, Provincia, Poblacion, Calle, Numero, TipoInmueble, 
          TipoVivienda, Estado, Planta, TipoAnuncio, EstadoVenta, 
          Caracteristicas, Published, FechaPublicacion, CreatedAt, UpdatedAt, IsDraft,
          ComisionGanada, CaptadoPor, PorcentajeCaptacion, FechaCaptacion
        FROM Vivienda 
        ${whereClause}
        ORDER BY UpdatedAt DESC 
        LIMIT ? OFFSET ?
      `;
      
      const result = await executeQuery(sql, [...params, String(pageSize), String(offset)]);
      
      // Obtener total para paginación
      const countSql = `SELECT COUNT(*) as total FROM Vivienda ${whereClause}`;
      const countResult = await executeQuery(countSql, params);
      const total = countResult.rows[0]?.total || 0;
      
      return {
        data: result.rows.map(this.transformRow),
        pagination: {
          page: Number(page),
          pageSize: Number(pageSize),
          total: Number(total),
          totalPages: Math.ceil(total / pageSize),
          hasMore: (page * pageSize) < total
        }
      };
    } catch (error) {
      logger.error('Error en ViviendaRepository.findDrafts:', error);
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
      
      // Lógica de publicación automática: 
      // - Si es borrador (isDraft=true), no publicar
      // - Si no es borrador y estado es "Disponible", publicar automáticamente
      // - Si no es borrador y hay checkbox published, respetar checkbox
      const isDraft = Boolean(viviendaData.isDraft);
      const autoPublish = !isDraft && viviendaData.estadoVenta === 'Disponible';
      const shouldPublish = isDraft ? false : (autoPublish || viviendaData.published);
      
      const fechaPublicacion = shouldPublish ? new Date().toISOString() : null;
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
        shouldPublish ? 1 : 0,                       // 21: Published
        fechaPublicacion,                            // 22: FechaPublicacion
        Number(viviendaData.comisionGanada) || 0.0,  // 23: ComisionGanada
        viviendaData.captadoPor || null,             // 24: CaptadoPor
        Number(viviendaData.porcentajeCaptacion) || 0.0, // 25: PorcentajeCaptacion
        viviendaData.fechaCaptacion || null,         // 26: FechaCaptacion
        isDraft ? 1 : 0                             // 27: IsDraft
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
          EstadoVenta, Caracteristicas, Published, FechaPublicacion,
          ComisionGanada, CaptadoPor, PorcentajeCaptacion, FechaCaptacion, IsDraft
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      
      // Lógica de publicación automática para actualizaciones:
      // - Si es borrador (isDraft=true), no publicar
      // - Si no es borrador y estado es "Disponible", publicar automáticamente
      // - Si no es borrador y hay checkbox published, respetar checkbox
      const isDraft = Boolean(viviendaData.isDraft);
      const autoPublish = !isDraft && viviendaData.estadoVenta === 'Disponible';
      const shouldPublish = isDraft ? false : (autoPublish || viviendaData.published);
      
      const fechaPublicacion = shouldPublish ? new Date().toISOString() : null;
      
      await executeQuery(`
        UPDATE Vivienda SET
          Name = ?, ShortDescription = ?, Description = ?, Price = ?, Rooms = ?,
          BathRooms = ?, Garage = ?, SquaredMeters = ?, Provincia = ?, Poblacion = ?,
          Calle = ?, Numero = ?, TipoInmueble = ?, TipoVivienda = ?, Estado = ?,
          Planta = ?, TipoAnuncio = ?, EstadoVenta = ?, Caracteristicas = ?,
          Published = ?, FechaPublicacion = ?, ComisionGanada = ?, CaptadoPor = ?,
          PorcentajeCaptacion = ?, FechaCaptacion = ?, IsDraft = ?, UpdatedAt = CURRENT_TIMESTAMP
        WHERE Id = ?
      `, [
        viviendaData.name, viviendaData.shortDescription, viviendaData.description,
        viviendaData.price, viviendaData.rooms || 0, viviendaData.bathRooms || 0,
        viviendaData.garage || 0, viviendaData.squaredMeters, viviendaData.provincia,
        viviendaData.poblacion, viviendaData.calle, viviendaData.numero,
        viviendaData.tipoInmueble, viviendaData.tipoVivienda, viviendaData.estado,
        viviendaData.planta, viviendaData.tipoAnuncio, viviendaData.estadoVenta,
        caracteristicasJson, shouldPublish ? 1 : 0, fechaPublicacion,
        Number(viviendaData.comisionGanada) || 0.0, viviendaData.captadoPor || null,
        Number(viviendaData.porcentajeCaptacion) || 0.0, viviendaData.fechaCaptacion || null,
        isDraft ? 1 : 0, id
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
    
    // Truncar descripción larga para evitar problemas de memoria en listados
    let description = row.Description;
    if (description && description.length > 1000) {
      description = description.substring(0, 1000) + '...';
    }
    
    // Procesar características de forma segura
    let caracteristicas = [];
    try {
      if (row.Caracteristicas) {
        // Si las características son muy grandes, usar array vacío por seguridad
        if (row.Caracteristicas.length > 5000) {
          caracteristicas = [];
        } else {
          caracteristicas = JSON.parse(row.Caracteristicas);
        }
      }
    } catch (error) {
      logger.warn(`Error parsing caracteristicas for property ${row.Id}:`, error.message);
      caracteristicas = [];
    }
    
    return {
      id: row.Id,
      name: row.Name,
      shortDescription: row.ShortDescription,
      description: description,
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
      caracteristicas: caracteristicas,
      published: Boolean(row.Published),
      fechaPublicacion: row.FechaPublicacion,
      isDraft: Boolean(row.IsDraft),
      comisionGanada: row.ComisionGanada || 0.0,
      captadoPor: row.CaptadoPor,
      porcentajeCaptacion: row.PorcentajeCaptacion || 0.0,
      fechaCaptacion: row.FechaCaptacion,
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