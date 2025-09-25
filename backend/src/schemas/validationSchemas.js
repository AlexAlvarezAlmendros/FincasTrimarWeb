import { z } from 'zod';

/**
 * Esquemas de validación usando Zod
 * Sigue la nomenclatura camelCase para archivos
 */

// Esquema para crear/actualizar propiedades
export const propertySchema = z.object({
  name: z.string()
    .min(5, 'El nombre debe tener al menos 5 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  
  shortDescription: z.string()
    .max(300, 'La descripción corta no puede exceder 300 caracteres')
    .optional(),
  
  description: z.string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  
  price: z.number()
    .int('El precio debe ser un número entero')
    .min(0, 'El precio no puede ser negativo'),
  
  rooms: z.number()
    .int('Las habitaciones deben ser un número entero')
    .min(0, 'No puede tener habitaciones negativas')
    .default(0),
  
  bathRooms: z.number()
    .int('Los baños deben ser un número entero')
    .min(0, 'No puede tener baños negativos')
    .default(0),
  
  garage: z.number()
    .int('Los garajes deben ser un número entero')
    .min(0, 'No puede tener garajes negativos')
    .default(0),
  
  squaredMeters: z.number()
    .int('Los metros cuadrados deben ser un número entero')
    .min(0, 'No puede tener metros negativos')
    .optional(),
  
  provincia: z.string()
    .max(100, 'La provincia no puede exceder 100 caracteres')
    .optional(),
  
  poblacion: z.string()
    .max(100, 'La población no puede exceder 100 caracteres')
    .optional(),
  
  calle: z.string()
    .max(100, 'La calle no puede exceder 100 caracteres')
    .optional(),
  
  numero: z.string()
    .max(20, 'El número no puede exceder 20 caracteres')
    .optional(),
  
  tipoInmueble: z.enum([
    'Vivienda', 'Oficina', 'Local', 'Nave', 
    'Garaje', 'Terreno', 'Trastero', 'Edificio', 'ObraNueva'
  ]).optional(),
  
  tipoVivienda: z.enum([
    'Piso', 'Ático', 'Dúplex', 'Casa', 
    'Chalet', 'Villa', 'Masía', 'Finca', 'Loft'
  ]).optional(),
  
  estado: z.enum(['ObraNueva', 'BuenEstado', 'AReformar']).optional(),
  
  planta: z.enum(['UltimaPlanta', 'PlantaIntermedia', 'Bajo']).optional(),
  
  tipoAnuncio: z.enum(['Venta', 'Alquiler']).optional(),
  
  estadoVenta: z.enum(['Disponible', 'Reservada', 'Vendida', 'Cerrada'])
    .default('Disponible'),
  
  caracteristicas: z.array(z.enum([
    'AireAcondicionado', 'ArmariosEmpotrados', 'Ascensor', 'Balcón',
    'Terraza', 'Exterior', 'Garaje', 'Jardín', 'Piscina', 'Trastero',
    'ViviendaAccesible', 'VistasAlMar', 'ViviendaDeLujo', 'VistasAMontaña',
    'FuegoATierra', 'Calefacción', 'Guardilla', 'CocinaOffice'
  ])).default([]),
  
  published: z.boolean().default(false)
});

// Esquema para filtros de búsqueda
export const searchFiltersSchema = z.object({
  q: z.string().optional(), // Búsqueda de texto libre
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  rooms: z.number().int().min(0).optional(),
  bathRooms: z.number().int().min(0).optional(),
  tipoInmueble: z.string().optional(),
  tipoVivienda: z.string().optional(),
  provincia: z.string().optional(),
  poblacion: z.string().optional(),
  published: z.boolean().default(true),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20)
});

// Esquema para mensajes de contacto
export const messageSchema = z.object({
  viviendaId: z.string().uuid().optional(),
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  email: z.string()
    .email('El email no es válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  
  telefono: z.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional(),
  
  asunto: z.string()
    .max(200, 'El asunto no puede exceder 200 caracteres')
    .optional(),
  
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  
  estado: z.enum(['Nuevo', 'EnCurso', 'Cerrado']).default('Nuevo'),
  pinned: z.boolean().default(false)
});