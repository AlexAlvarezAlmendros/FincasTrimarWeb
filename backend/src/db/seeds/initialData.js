import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../client.js';
import { logger } from '../../utils/logger.js';

/**
 * Seeds iniciales para llenar la base de datos con datos de ejemplo
 */

const sampleProperties = [
  {
    name: 'Piso reformado en el centro de Igualada 102 m2',
    shortDescription: 'Precioso piso en una de las mejores zonas de Igualada',
    description: 'Magnifico piso reformado completamente en 2022, situado en pleno centro de Igualada. La vivienda cuenta con acabados de primera calidad, cocina equipada con electrodomésticos nuevos, y una distribución muy funcional. Todas las ventanas han sido cambiadas por unas de doble acristalamiento que proporcionan un excelente aislamiento tanto térmico como acústico.',
    price: 240000,
    rooms: 3,
    bathRooms: 2,
    garage: 0,
    squaredMeters: 102,
    provincia: 'Barcelona',
    poblacion: 'Igualada',
    calle: 'Carrer Major',
    numero: '12',
    tipoInmueble: 'Vivienda',
    tipoVivienda: 'Piso',
    estado: 'BuenEstado',
    planta: 'PlantaIntermedia',
    tipoAnuncio: 'Venta',
    estadoVenta: 'Disponible',
    caracteristicas: ['Ascensor', 'Exterior', 'Balcón', 'ArmariosEmpotrados'],
    published: true
  },
  {
    name: 'Casa adosada con jardín en Vilanova del Camí',
    shortDescription: 'Amplia casa familiar con jardín privado y piscina',
    description: 'Espectacular casa adosada de 180 m2 construidos en parcela de 300 m2. La vivienda se distribuye en dos plantas más sótano. En planta baja encontramos un amplio salón-comedor con chimenea, cocina office totalmente equipada con acceso directo al jardín, y un aseo de cortesía. En la primera planta se ubican 4 dormitorios y 2 baños completos.',
    price: 395000,
    rooms: 4,
    bathRooms: 3,
    garage: 2,
    squaredMeters: 180,
    provincia: 'Barcelona',
    poblacion: 'Vilanova del Camí',
    calle: 'Carrer de la Pau',
    numero: '45',
    tipoInmueble: 'Vivienda',
    tipoVivienda: 'Casa',
    estado: 'BuenEstado',
    planta: 'Bajo',
    tipoAnuncio: 'Venta',
    estadoVenta: 'Disponible',
    caracteristicas: ['Jardín', 'Piscina', 'Garaje', 'Terraza', 'Calefacción'],
    published: true
  },
  {
    name: 'Ático con terraza panorámica en Sant Martí de Tous',
    shortDescription: 'Moderno ático con vistas espectaculares',
    description: 'Increíble ático de obra nueva con una terraza de 50 m2 con vistas panorámicas a la montaña. La vivienda cuenta con 90 m2 útiles distribuidos en 2 dormitorios (uno de ellos suite), 2 baños completos, salón-comedor diáfano con cocina americana de diseño. Incluye plaza de garaje y trastero.',
    price: 285000,
    rooms: 2,
    bathRooms: 2,
    garage: 1,
    squaredMeters: 90,
    provincia: 'Barcelona',
    poblacion: 'Sant Martí de Tous',
    calle: 'Avinguda Catalunya',
    numero: '78',
    tipoInmueble: 'Vivienda',
    tipoVivienda: 'Ático',
    estado: 'ObraNueva',
    planta: 'UltimaPlanta',
    tipoAnuncio: 'Venta',
    estadoVenta: 'Disponible',
    caracteristicas: ['Terraza', 'Ascensor', 'Garaje', 'Trastero', 'VistasAMontaña', 'ViviendaDeLujo'],
    published: true
  },
  {
    name: 'Piso en alquiler zona universitaria Igualada',
    shortDescription: 'Perfecto para estudiantes, cerca de transporte',
    description: 'Piso ideal para estudiantes o jóvenes profesionales. Situado a 5 minutos andando de la universidad y muy bien comunicado con Barcelona. La vivienda cuenta con 3 habitaciones, salón, cocina independiente y baño completo. Edificio con ascensor.',
    price: 750,
    rooms: 3,
    bathRooms: 1,
    garage: 0,
    squaredMeters: 75,
    provincia: 'Barcelona',
    poblacion: 'Igualada',
    calle: 'Carrer Bruc',
    numero: '33',
    tipoInmueble: 'Vivienda',
    tipoVivienda: 'Piso',
    estado: 'BuenEstado',
    planta: 'PlantaIntermedia',
    tipoAnuncio: 'Alquiler',
    estadoVenta: 'Disponible',
    caracteristicas: ['Ascensor', 'Exterior'],
    published: true
  },
  {
    name: 'Masía restaurada con finca en Calaf',
    shortDescription: 'Auténtica masía catalana del s.XVIII totalmente restaurada',
    description: 'Impresionante masía del siglo XVIII completamente restaurada respetando la arquitectura original pero con todas las comodidades modernas. La finca cuenta con 2 hectáreas de terreno con olivos centenarios, pozo propio y varias construcciones auxiliares. La masía principal tiene 400 m2 distribuidos en dos plantas.',
    price: 750000,
    rooms: 6,
    bathRooms: 4,
    garage: 3,
    squaredMeters: 400,
    provincia: 'Barcelona',
    poblacion: 'Calaf',
    calle: 'Camí Rural',
    numero: 's/n',
    tipoInmueble: 'Vivienda',
    tipoVivienda: 'Masía',
    estado: 'BuenEstado',
    planta: 'Bajo',
    tipoAnuncio: 'Venta',
    estadoVenta: 'Disponible',
    caracteristicas: ['Jardín', 'Finca', 'Pozo', 'Calefacción', 'VistasAMontaña', 'ViviendaDeLujo'],
    published: true
  }
];

/**
 * Insertar viviendas de ejemplo
 */
async function seedProperties() {
  logger.info('Insertando viviendas de ejemplo...');
  
  for (const property of sampleProperties) {
    const id = uuidv4();
    const caracteristicasJson = JSON.stringify(property.caracteristicas);
    const fechaPublicacion = new Date().toISOString();
    
    await executeQuery(`
      INSERT OR IGNORE INTO Vivienda (
        Id, Name, ShortDescription, Description, Price, Rooms, BathRooms,
        Garage, SquaredMeters, Provincia, Poblacion, Calle, Numero,
        TipoInmueble, TipoVivienda, Estado, Planta, TipoAnuncio,
        EstadoVenta, Caracteristicas, Published, FechaPublicacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, property.name, property.shortDescription, property.description,
      property.price, property.rooms, property.bathRooms, property.garage,
      property.squaredMeters, property.provincia, property.poblacion,
      property.calle, property.numero, property.tipoInmueble, property.tipoVivienda,
      property.estado, property.planta, property.tipoAnuncio, property.estadoVenta,
      caracteristicasJson, property.published ? 1 : 0, fechaPublicacion
    ]);
    
    // Agregar algunas imágenes de ejemplo
    const imagenes = [
      'https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Fachada',
      'https://via.placeholder.com/800x600/7ED321/FFFFFF?text=Salon',
      'https://via.placeholder.com/800x600/F5A623/FFFFFF?text=Cocina'
    ];
    
    for (let i = 0; i < imagenes.length; i++) {
      const imageId = uuidv4();
      await executeQuery(`
        INSERT OR IGNORE INTO ImagenesVivienda (Id, ViviendaId, URL, Orden)
        VALUES (?, ?, ?, ?)
      `, [imageId, id, imagenes[i], i + 1]);
    }
  }
  
  logger.info(`Insertadas ${sampleProperties.length} viviendas de ejemplo`);
}

/**
 * Ejecutar todos los seeds
 */
export async function runSeeds() {
  try {
    logger.info('Iniciando seeds de datos de ejemplo...');
    
    // Verificar si ya existen datos
    const result = await executeQuery('SELECT COUNT(*) as count FROM Vivienda');
    const count = result.rows[0].count;
    
    if (count > 0) {
      logger.info('Ya existen datos en la base de datos, omitiendo seeds');
      return;
    }
    
    await seedProperties();
    
    logger.info('Seeds completados exitosamente');
  } catch (error) {
    logger.error('Error ejecutando seeds:', error);
    throw error;
  }
}