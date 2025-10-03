import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejar los datos del dashboard
 * @returns {Object} Objeto con métricas, propiedades recientes, mensajes y estado de carga
 */
export const useDashboardData = () => {
  const [data, setData] = useState({
    metrics: {
      totalProperties: 0,
      publishedProperties: 0,
      pendingMessages: 0,
      totalViews: 0
    },
    recentProperties: [],
    recentMessages: [],
    loading: true
  });

  useEffect(() => {
    // Simular carga de datos
    const fetchData = async () => {
      try {
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - en producción vendría de la API
        setData({
          metrics: {
            totalProperties: 47,
            publishedProperties: 42,
            pendingMessages: 5,
            totalViews: 1247,
            // Nuevas métricas específicas
            propertiesSold: 8,
            propertiesReserved: 3,
            propertiesAvailable: 31,
            propertiesPendingCapture: 12,
            salesThisMonth: 165000, // Ventas en euros del mes actual
            salesLastMonth: 142000,
            averagePrice: 285000,
            totalRevenue: 1250000
          },
          recentProperties: [
            {
              id: '1',
              name: 'Piso reformado en centro de Igualada',
              price: 240000,
              status: 'sold',
              createdAt: '2024-10-01T10:00:00Z',
              views: 45,
              location: 'Igualada'
            },
            {
              id: '2', 
              name: 'Chalet adosado en Sant Cugat del Vallès',
              price: 520000,
              status: 'reserved',
              createdAt: '2024-09-30T15:30:00Z',
              views: 78,
              location: 'Sant Cugat del Vallès'
            },
            {
              id: '3',
              name: 'Ático con terraza en Barcelona Centro',
              price: 450000,
              status: 'published',
              createdAt: '2024-09-29T09:15:00Z',
              views: 89,
              location: 'Barcelona'
            },
            {
              id: '4',
              name: 'Casa unifamiliar en Vilanova i la Geltrú',
              price: 385000,
              status: 'pending_capture',
              createdAt: '2024-09-28T14:20:00Z',
              views: 23,
              location: 'Vilanova i la Geltrú'
            }
          ],
          recentMessages: [
            {
              id: '1',
              name: 'Juan Pérez',
              email: 'juan@email.com',
              subject: 'Consulta piso Igualada',
              status: 'pending',
              createdAt: '2024-10-01T14:30:00Z'
            },
            {
              id: '2',
              name: 'María García', 
              email: 'maria@email.com',
              subject: 'Valoración inmueble',
              status: 'pending',
              createdAt: '2024-10-01T11:20:00Z'
            },
            {
              id: '3',
              name: 'Carlos López',
              email: 'carlos@email.com', 
              subject: 'Información chalet',
              status: 'responded',
              createdAt: '2024-09-30T16:45:00Z'
            }
          ],
          loading: false
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  return data;
};

export default useDashboardData;