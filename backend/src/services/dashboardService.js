import viviendaRepository from '../repos/viviendaRepository.js';
import { logger } from '../utils/logger.js';

/**
 * Servicio para el dashboard administrativo
 * Proporciona estadísticas y métricas de la aplicación
 */
class DashboardService {
  
  /**
   * Obtiene estadísticas generales del dashboard
   */
  async getDashboardStats() {
    try {
      logger.info('Obteniendo estadísticas del dashboard');
      
      // Obtener conteos por estado de venta
      const propertyCountsByStatus = await viviendaRepository.getPropertyCountsByStatus();
      
      // Obtener ventas por mes (últimos 12 meses)
      const monthlySales = await this.getMonthlySales();
      
      // Obtener estadísticas adicionales
      const totalProperties = await viviendaRepository.getTotalPropertiesCount();
      const publishedProperties = await viviendaRepository.getPublishedPropertiesCount();
      
      // Formatear los datos para el frontend
      const stats = {
        propertyStats: {
          total: totalProperties,
          published: publishedProperties,
          available: propertyCountsByStatus.find(s => s.status === 'Disponible')?.count || 0,
          reserved: propertyCountsByStatus.find(s => s.status === 'Reservada')?.count || 0,
          sold: propertyCountsByStatus.find(s => s.status === 'Vendida')?.count || 0,
          closed: propertyCountsByStatus.find(s => s.status === 'Cerrada')?.count || 0
        },
        monthlySales,
        summary: {
          totalRevenue: this.calculateTotalRevenue(monthlySales),
          averageMonthlyRevenue: this.calculateAverageMonthlyRevenue(monthlySales),
          bestMonth: this.getBestMonth(monthlySales),
          growthRate: this.calculateGrowthRate(monthlySales)
        }
      };
      
      logger.info('Estadísticas del dashboard obtenidas:', stats);
      return stats;
    } catch (error) {
      logger.error('Error obteniendo estadísticas del dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtiene las ventas mensuales de los últimos 12 meses
   */
  async getMonthlySales() {
    try {
      const monthlySales = await viviendaRepository.getMonthlySales();
      
      // Generar los últimos 12 meses con datos vacíos si no hay ventas
      const currentDate = new Date();
      const months = [];
      
      for (let i = 11; i >= 0; i--) {
        const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
        
        const existingSale = monthlySales.find(sale => sale.month === monthKey);
        
        months.push({
          month: monthKey,
          monthName: month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          sales: existingSale ? existingSale.sales : 0,
          revenue: existingSale ? existingSale.revenue : 0
        });
      }
      
      return months;
    } catch (error) {
      logger.error('Error obteniendo ventas mensuales:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de propiedades por tipo
   */
  async getPropertyTypeStats() {
    try {
      const typeStats = await viviendaRepository.getPropertyTypeStats();
      return typeStats;
    } catch (error) {
      logger.error('Error obteniendo estadísticas por tipo:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de propiedades por ubicación
   */
  async getLocationStats() {
    try {
      const locationStats = await viviendaRepository.getLocationStats();
      return locationStats;
    } catch (error) {
      logger.error('Error obteniendo estadísticas por ubicación:', error);
      throw error;
    }
  }

  /**
   * Calcula el ingreso total de las ventas
   */
  calculateTotalRevenue(monthlySales) {
    return monthlySales.reduce((total, month) => total + (month.revenue || 0), 0);
  }

  /**
   * Calcula el ingreso promedio mensual
   */
  calculateAverageMonthlyRevenue(monthlySales) {
    const totalRevenue = this.calculateTotalRevenue(monthlySales);
    const monthsWithSales = monthlySales.filter(month => month.revenue > 0).length;
    return monthsWithSales > 0 ? totalRevenue / monthsWithSales : 0;
  }

  /**
   * Obtiene el mes con mejores ventas
   */
  getBestMonth(monthlySales) {
    return monthlySales.reduce((best, month) => {
      return month.revenue > (best?.revenue || 0) ? month : best;
    }, null);
  }

  /**
   * Calcula la tasa de crecimiento mensual
   */
  calculateGrowthRate(monthlySales) {
    if (monthlySales.length < 2) return 0;
    
    const lastMonth = monthlySales[monthlySales.length - 1];
    const previousMonth = monthlySales[monthlySales.length - 2];
    
    if (previousMonth.revenue === 0) return 0;
    
    return ((lastMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
  }

  /**
   * Obtiene las propiedades más recientes
   * @param {number} limit - Número máximo de propiedades a retornar (por defecto 4)
   */
  async getRecentProperties(limit = 4) {
    try {
      logger.info(`Obteniendo las últimas ${limit} propiedades`);
      const properties = await viviendaRepository.getRecentProperties(limit);
      return properties;
    } catch (error) {
      logger.error('Error obteniendo propiedades recientes:', error);
      throw error;
    }
  }
}

export default new DashboardService();